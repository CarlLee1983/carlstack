---
title: "Agent 工作流不要再用 Chatbot 猜路由：從 TypeSafe AI Jev 看 System 1 決策模型的工程轉向"
description: "把生成式 LLM 拿來做布林判斷、模型路由與工具風險分流，會讓 Agent 工作流承擔不必要的延遲與解析失敗。從 Jev 的三種決策原語到 LangChain middleware，拆解 System 1 決策模型如何進入 Agent harness。"
publishDate: 2026-09-18T14:20:00+08:00
updatedDate: 2026-09-21
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
  - 技術選型
cover: ../../assets/covers/jev-system-one-decision-model.png
coverAlt: "深色黑曜石電路背景中，發光的青色與琥珀色數據流匯聚至中央幾何運算核心，並向右平行分流為布林判定、多路選擇與數值評分三大強型別校準決策路徑。"
series: AI Agent 工程化與工作流實戰
seriesOrder: 19
---

在構建自主 Agent 或多步驟工作流時，工程師最常遭遇的吞吐量瓶頸，往往不是後端業務邏輯，而是架構中的「決策節點」。

我們習慣把一個巨大的對話型 LLM 當成萬能轉轍器：給它一段龐大的 prompt，附帶嚴苛的 JSON Schema 指令，要求它「判斷使用者意圖是否需要退款，若是要退款請輸出 `{"action": "refund"}`，否則輸出 `{"action": "escalate"}`」。

這種做法本質上是用重型大砲打蚊子。用每秒生成幾十個 token 的自迴歸（Autoregressive）生成器，去承擔軟體工程裡只需要 1 個 bit 的布林判斷或枚舉選擇，不僅浪費了數千個 input tokens，更帶來了高達數秒的端到端延遲與非確定性的解析崩潰風險。

2026 年 9 月 15 日，前 OpenAI 研究員、InstructGPT 論文共同作者 Diogo Almeida 創辦的 TypeSafe AI [公開 Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)。兩天後，LangChain 發布 [Jev harness 整合案例](https://www.langchain.com/blog/building-a-harness-with-jev)；Sydney Runkle 再於 9 月 18 日[整理成完整實作文章](https://x.com/sydneyrunkle/status/2100754364545761643)：Jev 不是取代負責推理與生成的模型，而是在模型選擇與工具執行前，提供可由程式消費的決策。

這個案例把原本的架構主張推得更具體：**AI Agent 的分水嶺，在於把自迴歸文字生成（System 2）與低延遲、強型別的決策（System 1）拆成不同責任。** Jev 不負責完成任務；它負責回答「接下來該走哪條已知路徑，以及這個判斷有多不確定」。

## 傳統自迴歸路由的工程代價

在傳統架構中，哪怕我們透過 Structured Outputs、JSON Mode 或 Function Calling 來約束模型，底層的推論機制仍然是一顆 token 接一顆 token 預測。這在軟體整合面上產生了三個根本矛盾：

1. **推論延遲與計算吞吐量脫節**：為了得到一個 `true` 或 `false`，模型需要載入完整的注意力快取（KV Cache），並在生成階段耗費數百毫秒甚至數秒。當 Agent 的單次任務需要經歷 10 到 15 個條件判斷分支時，延遲會呈線性堆疊。
2. **機率校準缺位**：生成式 LLM 給出的文字是離散採樣的結果。即便輸出了某個選項，你依然難以得知模型對這個決策的精確信心水準（Confidence Calibration）。工程師只能透過提示詞硬要模型輸出 `confidence: 0.8`，但這種自評分數往往嚴重過度自信且缺乏統計學上的校準基礎。
3. **無效上下文的成本膨脹**：在複雜工作流中，維護對話歷史與系統提示詞會讓輸入端急遽膨脹。以社群基準測試為例，使用通用程式碼模型做客服意圖分流，單次請求可能吃掉上萬個 input tokens；而實際需要處理的業務狀態，可能只有幾百個位元組。

| 評估維度         | 傳統生成式 LLM 路由                               | 專用決策模型（如 Jev）               |
| :--------------- | :------------------------------------------------ | :----------------------------------- |
| **運作機制**     | 自迴歸逐字解碼（Token-by-token）                  | 單次平行評估（Parallel evaluation）  |
| **公開延遲數據** | TypeSafe 測得 3 秒至 329 秒；依模型與推理設定變動 | TypeSafe 公布 70 ms 至 500 ms        |
| **輸出格式**     | 自然語言或被強制序列化的 JSON 文字                | 強型別標量與經校準的機率分佈         |
| **失敗模式**     | JSON 語法截斷、欄位漂移、語意誤判                 | 不會離開 schema，但仍可能語意誤判    |
| **系統定位**     | System 2（慢想、多步驟推理、內容創作）            | System 1（快思、狀態判定、即時路由） |

表中的速度區間來自 TypeSafe 在 2026-09-15 發布的[官方比較](https://typesafe.ai/blog/introducing-system-one-models-and-jev)，不是跨供應商、跨區域的中立 benchmark。它適合用來形成測試假設，不適合直接寫進容量規劃。

## Jev 的三項決策原語（Decision Primitives）

Jev 的核心設計哲學在於「完全不輸出自由文字」。它接收非結構化的輸入狀態，並直接對開發者定義的一組強型別問題，進行單次前向傳遞的平行計算。

在 TypeSafe AI 的抽象中，所有的控制流決策被凝練為三種基礎原語：

- **Noul**：帶有機率值的二元布林判斷。例如「這筆請求是否包含未授權的操作意圖？」模型不會生成字串，而是直接回傳 `P(True)`（如 `0.94`）；Noul 沒有另一個獨立的 confidence 欄位。
- **Choice**：從預先定義的枚舉集合中挑選最佳解，並輸出完整的機率分佈。例如意圖分類路由，輸出 `{"technical_support": 0.73, "billing": 0.25, "general": 0.02}`，另外附上描述整體分布集中程度的 confidence。選中項目的機率與 confidence 不是同一個訊號，門檻應分開設定。
- **Score**：具備順序級別的評分指標。例如「使用者當前情緒滿意度（1 到 5 分）」，回傳連續 score、對應級別與 confidence。

這種設計使得底層模型可以利用 **RLCD（Reinforcement Learning for Calibrated Decisions，校準決策強化學習）** 進行特化訓練。模型優化的目標不是產生人類偏好的文字，而是讓 System 1 任務的輸出機率更能反映實際正確率。TypeSafe 目前只公開方法名稱與產品評測摘要；團隊仍需用自己的標記資料量測 Brier Score、Expected Calibration Error 與門檻下的錯誤成本。

<div style="overflow-x: auto; margin: 1.5rem 0;">
  <svg viewBox="0 0 800 240" width="100%" height="auto" style="min-width: 640px; background: #0d1117; border-radius: 8px; border: 1px solid #30363d; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
    <title>Jev 與 Agentic System 1/2 混合架構資料流</title>
    <desc>架構展示外部請求進入後，先由 Jev 決策模型執行平行毫秒級分類，低信心交由人工或回退，高信心則分流至確定性工具或大型 LLM 慢想生成。</desc>
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#58a6ff"/>
      </marker>
      <marker id="arr-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#d29922"/>
      </marker>
    </defs>
    <!-- 輸入區塊 -->
    <rect x="20" y="85" width="130" height="70" rx="6" fill="#161b22" stroke="#30363d" stroke-width="1.5"/>
    <text x="85" y="115" fill="#f0f6fc" font-size="12" font-weight="700" text-anchor="middle">非結構化輸入</text>
    <text x="85" y="135" fill="#8b949e" font-size="10" text-anchor="middle">事件、日誌、狀態</text>
    <!-- 箭頭 -->
    <path d="M 150 120 L 190 120" fill="none" stroke="#58a6ff" stroke-width="1.5" marker-end="url(#arr)"/>
    <!-- Jev 核心區塊 (System 1) -->
    <rect x="195" y="45" width="220" height="150" rx="6" fill="#161b22" stroke="#58a6ff" stroke-width="2"/>
    <text x="305" y="75" fill="#58a6ff" font-size="13" font-weight="700" text-anchor="middle">Jev 決策引擎 (System 1)</text>
    <text x="305" y="95" fill="#8b949e" font-size="10" text-anchor="middle">單次平行前向計算 (70-500ms)</text>
    <!-- 原語小框 -->
    <rect x="210" y="110" width="55" height="28" rx="4" fill="#0d1117" stroke="#30363d"/>
    <text x="237" y="128" fill="#79c0ff" font-size="10" text-anchor="middle">Noul</text>
    <rect x="277" y="110" width="55" height="28" rx="4" fill="#0d1117" stroke="#30363d"/>
    <text x="304" y="128" fill="#79c0ff" font-size="10" text-anchor="middle">Choice</text>
    <rect x="345" y="110" width="55" height="28" rx="4" fill="#0d1117" stroke="#30363d"/>
    <text x="372" y="128" fill="#79c0ff" font-size="10" text-anchor="middle">Score</text>
    <text x="305" y="165" fill="#3fb950" font-size="10" text-anchor="middle">全量機率校準 (RLCD)</text>
    <!-- 輸出分支 1: 確定性流程 -->
    <path d="M 415 90 L 490 60" fill="none" stroke="#58a6ff" stroke-width="1.5" marker-end="url(#arr)"/>
    <rect x="495" y="35" width="260" height="50" rx="6" fill="#161b22" stroke="#30363d" stroke-width="1.5"/>
    <text x="625" y="58" fill="#f0f6fc" font-size="11" font-weight="700" text-anchor="middle">確定性路徑 (高信心直通)</text>
    <text x="625" y="74" fill="#8b949e" font-size="9" text-anchor="middle">呼叫本機函式 / 拒絕非法請求 / 靜態過濾</text>
    <!-- 輸出分支 2: System 2 深入推理 -->
    <path d="M 415 120 L 490 120" fill="none" stroke="#d29922" stroke-width="1.5" marker-end="url(#arr-amber)"/>
    <rect x="495" y="95" width="260" height="50" rx="6" fill="#161b22" stroke="#d29922" stroke-width="1.5"/>
    <text x="625" y="118" fill="#e3b341" font-size="11" font-weight="700" text-anchor="middle">大型生成模型 (System 2 慢想)</text>
    <text x="625" y="134" fill="#8b949e" font-size="9" text-anchor="middle">Claude / GPT-4 / Gemini (合成複雜內容)</text>
    <!-- 輸出分支 3: 人工介入 -->
    <path d="M 415 150 L 490 180" fill="none" stroke="#58a6ff" stroke-width="1.5" marker-end="url(#arr)"/>
    <rect x="495" y="155" width="260" height="50" rx="6" fill="#161b22" stroke="#30363d" stroke-width="1.5"/>
    <text x="625" y="178" fill="#f0f6fc" font-size="11" font-weight="700" text-anchor="middle">Human-in-the-loop (低信心安全閥)</text>
    <text x="625" y="194" fill="#8b949e" font-size="9" text-anchor="middle">觸發告警 / 轉交人工審核 (P &lt; 閾值)</text>
  </svg>
</div>

## 架構重構：落地雙軌制（Fast/Slow Engine）

把 Jev 類型的模型納入生產環境，並不是要完全揚棄強大的通用大模型，而是建立清晰的責任邊界。

我的立場是：**Agent 工作流中需要語意判斷、但答案空間已知的控制節點，應優先交給 System 1；權限與副作用仍由確定性程式碼執行，只有開放式推理與內容產出才交給 System 2。**

官方 Python SDK 的介面很直接：一份 `state` 搭配多個 `questions`，同一次請求回傳 Choice、Score 與 Noul 的答案。以下示例使用 [TypeSafe Quick Start](https://docs.typesafe.ai/introduction/quickstart) 的實際 client 與回應結構，示範怎麼把機率留在程式控制流裡：

```python
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

client = TypeSafeClient()  # 從 TYPESAFE_API_KEY 讀取憑證


def decide_next_step(payload: dict[str, object]) -> dict[str, object]:
    response = client.system_one(
        state=payload,
        questions={
            "intent": Choice(
                instructions="Which queue should handle this ticket?",
                criteria={
                    "refund": "Refund or duplicate charge",
                    "technical": "Bug or integration problem",
                    "sales": "Pricing or account question",
                    "spam": "Unsolicited or malicious content",
                },
            ),
            "is_urgent": Noul(
                instructions="This ticket needs immediate attention",
            ),
            "risk": Score(
                instructions="Operational risk if handled automatically",
                criteria=["low", "medium", "high"],
            ),
        },
    )

    intent = response.answers["intent"]
    risk = response.answers["risk"]
    selected_probability = intent.probabilities[intent.choice]

    # 1. 模型給判斷，程式決定後續 action；此處不直接執行副作用
    if intent.choice == "spam" or risk.score >= 1.5:
        return {"action": "quarantine", "route": intent.choice}

    # 2. 選中項目的機率與分布集中度都通過門檻，才進入自動退款規則
    if (
        intent.choice == "refund"
        and selected_probability >= 0.90
        and intent.confidence >= 0.75
    ):
        return {"action": "run_refund_rules", "route": intent.choice}

    # 3. 分布不集中時交給人工；其餘路由才交給 System 2
    if intent.confidence < 0.75:
        return {"action": "human_review", "route": intent.choice}

    return {"action": "reasoning_model", "route": intent.choice}
```

這段程式刻意不宣稱「90% 的事件都能自動處理」。能安全直通多少比例，取決於你的資料分布、錯誤成本與門檻校準。真正的架構改變是：昂貴的 System 2 模型只接收需要多步驟推理或語言合成的工作；明確規則與副作用仍由程式碼掌握。

## LangChain 把 Jev 放進 Agent loop 的兩個位置

[Sydney Runkle 在 2026-09-18 的文章](https://x.com/sydneyrunkle/status/2100754364545761643)沒有把 Jev 包裝成另一個聊天模型，而是把它接到 Agent harness 的 middleware。LangChain 的整合先用 `TypeSafeClassifier` 暴露 `state + questions → answers`，再提供兩個實驗性 middleware：模型路由與工具風險閘門。

### 模型路由：先選能力級距，再開始整個 run

簡單查詢、資料擷取與局部修改，不需要和架構決策、高風險變更使用同一個推理模型。[LangChain 的 Jev harness 範例](https://www.langchain.com/blog/building-a-harness-with-jev)讓 `ModelRouterMiddleware` 先檢查最新的使用者訊息，從預先定義的模型集合中選一個，並在整個 run 期間沿用該選擇：

```python
from langchain.agents import create_agent
from langchain_typesafe.experimental.middleware import (
    ModelChoice,
    ModelRouterMiddleware,
)

router = ModelRouterMiddleware(
    choices={
        "fast": ModelChoice(
            model="openai:luna",
            criteria="Direct lookups, extraction, and localized changes.",
        ),
        "powerful": ModelChoice(
            model="openai:sol",
            criteria="Architecture and high-stakes decisions.",
        ),
    },
    instructions="Choose the least costly model that can complete the task.",
)

agent = create_agent("openai:gpt-5.6-luna", middleware=[router])
```

這個切入點的重要性在於「先選一次」：若每一步都重新路由，省下的模型成本可能被重複分類延遲吃掉，run 內也容易因能力與行為風格切換而漂移。路由結果的機率仍保留在 Agent state，團隊可以追蹤低信心案例，而不是只留下最後選了哪個模型。

### 工具風險閘門：在副作用發生前多一道判斷

第二個位置是 tool call 與真正執行之間。`AutoModeMiddleware` 可以針對指定工具檢查即將發生的呼叫，風險不符合策略時先擋住，而不是等 shell、瀏覽器或交易工具已經產生副作用才補救：

```python
from langchain.agents import create_agent
from langchain_typesafe.experimental.middleware import AutoModeMiddleware

guardrail = AutoModeMiddleware(tools=["bash"])
agent = create_agent(
    "openai:gpt-5.6-luna",
    middleware=[guardrail],
)
```

這個 pattern 適合把「明顯低風險可自動執行、模糊或高風險要停下」寫成 harness 政策。不過分類器不是授權系統。真正不可逆的動作仍需要 sandbox、最小權限、allowlist、交易邊界與人工核准；否則一次高信心誤判就可能直接變成事故。

## 型別安全只解決介面，不解決真實性

Jev 可以保證答案落在預先定義的型別與選項內，但不能保證語意判斷一定正確。[TypeSafe 官方 skill](https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md)也明確區分兩件事：typed output 保證介面，不保證真相；Choice 與 Score 的 confidence 描述分布集中程度，不等於整個工作流可以安全自動化。

所以生產環境至少要另外保留四個控制面：

1. **離線評估集**：用真實流量中的正常、邊界與攻擊案例，分別量測每個問題的誤判率與校準曲線。
2. **按後果設門檻**：客服佇列分錯可以重派，刪除資料或付款分錯不能用同一個 confidence threshold。
3. **服務失敗回退**：timeout、rate limit 或供應商中斷時，明確選擇 fail closed、固定規則、System 2 或人工，不讓例外默默繞過政策。
4. **完整觀測**：記錄 state 版本、question 版本、模型版本、原始機率、最終分支與後續結果，才能知道門檻是否仍適用。

> [!IMPORTANT]
> **停止規則：只要決策會直接觸發不可逆副作用，就不能把模型 confidence 當成唯一授權。** 模型負責提供判斷訊號；程式與人類仍負責權限、政策與最終責任。

## 傑文斯悖論（Jevons Paradox）的軟體預言

TypeSafe AI 將這款模型命名為「Jev」，致敬的是 19 世紀經濟學家威廉·斯坦利·傑文斯提出的**傑文斯悖論**——提高資源使用效率通常會增加、而不是減少該資源的總體消耗。

在傳統認知中，軟體工程師不敢在每一行程式碼、每一個單元測試、每一個日誌行注入 AI，因為「LLM 太貴、太慢、不可控」。

但當決策模型把單次推論壓到 TypeSafe 公布的 70 至 500 毫秒區間、把輸出限制為強型別判斷與機率分布後，工程師呼叫 AI 決策的頻率不會維持在原來的低水準，而是可能增加數個數量級。這是廠商目前的產品與評測主張，仍需要用自己的區域、輸入長度與併發量驗證：

- 過去你只在使用者按下「送出」時呼叫一次 AI；未來你可以在使用者打字的每一次停頓、背景佇列的每一個重試輪迴，全量運行決策模型。
- 過去 CI 只能跑靜態 Lint；未來每次 Git commit 都可以掛載一個 Jev 節點即時計算語義相容性與風險指數。

## 哪些場景該換成 System 1？10 種決策形狀的落地邊界

當推論延遲從秒級縮短到數百毫秒、成本降至自迴歸生成式模型的小數點後幾位時，最關鍵的架構問題變成：**哪些工作該交給 System 1，哪些必須留在 System 2？**

TypeSafe AI 在官方的 [Use Case Map](https://docs.typesafe.ai/concepts/use-case-map) 中，將軟體工程常見的語意判定依輸出結構歸納為十種「決策形狀（Decision Shapes）」。這十種形狀在系統設計上大致對應兩大應用範式：

### 1. 通用驗證與防禦閘門（Universal Verification & Guardrails）

在傳統 Agent harness 中，對 LLM 的輸入提示、輸出回應與 tool call 進行驗證，往往也是呼叫另一個 LLM。這意味著防禦層的成本與延遲甚至超過了被保護的業務本身。

在 System 1 視角下，防禦層不需要生成任何解釋文字，只需要強型別的判定：

- **Detection（存在檢測）**：以布林機率判定單一屬性是否存在，例如偵測 Prompt Injection、敏感資料洩漏、合約關鍵條款缺漏或客服退款意圖。
- **Scoring（階梯評分）**：在固定量表上輸出順序等級，例如評估生成回答的引用支撐度（Citation Support）、工具呼叫風險指數，或客服對話的負面情緒嚴重度。
- **Verification（工件核驗）**：驗證先前步驟的執行工件是否違反特定策略，若失敗則直接在程式層阻斷並重試，不將無效狀態傳遞至下游。

### 2. 語意巨量處理與特徵萃取（Semantic Map-Reduce & Feature Extraction）

過去企業難以對數百萬筆客服對話、日誌追蹤或即時網路串流做全量深度語意分析，核心阻力在於自迴歸模型的 Token 計價與慢速吞吐。

System 1 決策模型能夠作為巨量非結構化資料到關聯式/向量資料庫之間的「特徵降維器」：

- **Classification & Routing（分類與路由）**：在預先定義的類別集合中給出機率分佈，決定下一段程式碼路徑（如工單派發、模型階梯路由、工單嚴重度升級）。
- **ML Feature Extraction（機器學習特徵萃取）**：從自由文字（如業務拜訪紀錄、事故復盤）中即時萃取購買意願、流失風險或詐欺訊號，輸出標準化的機率標量，直接作為下游傳統預測模型（如 XGBoost、風控評分卡）的特徵輸入。

| 決策形狀 (Decision Shape) | 輸出合約 (Output Contract)      | 傳統 System 2 的痛點                          | System 1 的架構優勢                  |
| :------------------------ | :------------------------------ | :-------------------------------------------- | :----------------------------------- |
| **Detection**             | 單一屬性之 `P(True)`            | 容易因 prompt 幻覺輸出非預期 JSON             | 單次前向傳遞，輸出真值校準機率       |
| **Scoring**               | 順序評級與連續 Score            | LLM 自評分數過度集中且缺乏統計校準            | 經 RLCD 特化訓練，評分具備排序單調性 |
| **Routing**               | 枚舉機率分佈與 Confidence       | 輸出格式漂移、逐字生成延遲拖垮整體 Agent loop | 強型別枚舉，毫秒級決定下游代碼分支   |
| **Verification**          | 規則核驗矩陣（通過 / 違規標籤） | 成本甚至高於主任務，無法全量運行              | 輕量化常駐於 harness 與 CI 管道中    |

> [!IMPORTANT]
> **邊界劃分法則：需要創造新資訊、長篇推理或合成內容的任務留給 System 2；只涉及在已知路徑與強型別邊界中做選擇、評分與篩選的任務，一律推進 System 1。**

## 團隊在架構設計上的下一步

如果你正在為團隊的 Agent 系統規劃下一代架構，不要等到系統被延遲拖垮才回頭重構。現在就可以採取以下三個行動：

1. **盤點 Agent 工作流中的決策節點**：審視系統內的所有 prompt，挑出那些「輸出只需從清單二選一、多選一，或只需要評估門檻」的節點。
2. **制定強型別原語合約**：停止在 prompt 裡編寫冗長防禦規則要求模型輸出特定 JSON，改用枚舉、布林等資料結構定義控制邊界。
3. **建立 System 1 / System 2 的降級與回退閥門**：分開設定選中項目機率與 confidence 的門檻，並用離線資料校準。任一訊號不符合該動作的安全要求時，才啟動慢速模型或引導人工介入。

先不要急著替換整條 Agent loop。挑一個目前由 LLM 回傳固定枚舉的節點，保留既有路徑做對照，記錄一週的正確率、P95 延遲、單次成本與人工接管率。只有在品質門檻不退步、錯誤案例可追蹤，而且回退路徑真的可用時，再把相同模式擴到模型路由或工具風險閘門。

## 延伸閱讀

- [Sydney Runkle：Building a Harness with Jev](https://x.com/sydneyrunkle/status/2100754364545761643)
- [LangChain：Building a Harness with Jev](https://www.langchain.com/blog/building-a-harness-with-jev)
- [TypeSafe AI：Introducing System One Models and Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [TypeSafe AI：Example Use Cases (Use Case Map)](https://docs.typesafe.ai/concepts/use-case-map)
- [TypeSafe AI：Quick Start](https://docs.typesafe.ai/introduction/quickstart)
- [TypeSafe AI：State 與多問題請求](https://docs.typesafe.ai/concepts/state)
