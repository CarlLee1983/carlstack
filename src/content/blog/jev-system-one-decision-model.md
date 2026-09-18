---
title: "Agent 工作流不要再用 Chatbot 猜路由：從 TypeSafe AI Jev 看 System 1 決策模型的工程轉向"
description: "把龐大的生成式 LLM 拿來做布林判斷與意圖分流，是當前 Agent 工作流延遲居高不下與型別崩潰的根源。剖析 TypeSafe AI 的 Jev 模型如何以 RLCD 與三大決策原語重構快思慢想架構。"
publishDate: 2026-09-18T14:20:00+08:00
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

2026 年 9 月 15 日，由前 OpenAI 研究員、RLHF 共同發明人 Diogo Almeida 創辦的 TypeSafe AI 正式推出了名為 **Jev** 的決策專用模型。社群的廣泛反響證明了一件事：**AI Agent 的架構分水嶺，在於將自迴歸文字生成（System 2）與極低延遲的強型別決策（System 1）徹底解耦。**

## 傳統自迴歸路由的工程代價

在傳統架構中，哪怕我們透過 Structured Outputs、JSON Mode 或 Function Calling 來約束模型，底層的推論機制仍然是一顆 token 接一顆 token 預測。這在軟體整合面上產生了三個根本矛盾：

1. **推論延遲與計算吞吐量脫節**：為了得到一個 `true` 或 `false`，模型需要載入完整的注意力快取（KV Cache），並在生成階段耗費數百毫秒甚至數秒。當 Agent 的單次任務需要經歷 10 到 15 個條件判斷分支時，延遲會呈線性堆疊。
2. **機率校準缺位**：生成式 LLM 給出的文字是離散採樣的結果。即便輸出了某個選項，你依然難以得知模型對這個決策的精確信心水準（Confidence Calibration）。工程師只能透過提示詞硬要模型輸出 `confidence: 0.8`，但這種自評分數往往嚴重過度自信且缺乏統計學上的校準基礎。
3. **無效上下文的成本膨脹**：在複雜工作流中，維護對話歷史與系統提示詞會讓輸入端急遽膨脹。以社群基準測試為例，使用通用程式碼模型做客服意圖分流，單次請求可能吃掉上萬個 input tokens；而實際需要處理的業務狀態，可能只有幾百個位元組。

| 評估維度     | 傳統生成式 LLM 路由                    | 專用決策模型（如 Jev）               |
| :----------- | :------------------------------------- | :----------------------------------- |
| **運作機制** | 自迴歸逐字解碼（Token-by-token）       | 單次平行評估（Parallel evaluation）  |
| **平均延遲** | 800 ms ~ 3500 ms                       | 70 ms ~ 500 ms                       |
| **輸出格式** | 自然語言或被強制序列化的 JSON 文字     | 強型別標量與經校準的機率分佈         |
| **失敗模式** | JSON 語法截斷、欄位漂移、幻覺幻思      | 結構性保證，僅存在分類信心不足       |
| **系統定位** | System 2（慢想、多步驟推理、內容創作） | System 1（快思、狀態判定、即時路由） |

## Jev 的三項決策原語（Decision Primitives）

Jev 的核心設計哲學在於「完全不輸出自由文字」。它接收非結構化的輸入狀態，並直接對開發者定義的一組強型別問題，進行單次前向傳遞的平行計算。

在 TypeSafe AI 的抽象中，所有的控制流決策被凝練為三種基礎原語：

- **Noul**：帶有機率值的二元布林判斷。例如「這筆請求是否包含未授權的操作意圖？」模型不會生成字串，而是直接回傳帶有置信度（如 `P(True) = 0.94`）的布林結果。
- **Choice**：從預先定義的枚舉集合中挑選最佳解，並輸出完整的機率分佈。例如意圖分類路由，輸出 `{"technical_support": 0.73, "billing": 0.25, "general": 0.02}`。開發者可以直接依據 Top-1 機率是否超過門檻值來決定分流或人工介入。
- **Score**：具備順序級別的評分指標。例如「使用者當前情緒滿意度（1 到 5 分）」，以校準後的機率分佈回傳期望值。

這種設計使得底層模型可以利用 **RLCD（Reinforcement Learning for Calibrated Decisions，校準決策強化學習）** 進行特化訓練。模型優化的目標不是在自然語言上取悅人類審查員，而是在機率預測的準確性（Brier Score、Expected Calibration Error）與計算邊界上達到數學極限。

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

我的立場是：**Agent 工作流的控制平面應該全部交給 System 1 模型，只有數據平面的內容產出才允許交給 System 2 模型。**

在 PydanticAI 與 LangChain 的近期適配探討中，一個典範模式是將其作為前置過濾與路由中樞。以下虛擬程式碼展示了這種模式在實際工程中的應用樣貌：

```python
from pydantic import BaseModel
from typesafe_ai import JevClient, Choice, Noul

client = JevClient(api_key="typesafe_sk_...")

class RouteDecision(BaseModel):
    is_urgent: Noul
    intent: Choice["refund", "tech_support", "sales", "spam"]
    risk_score: float

# 單次非自迴歸呼叫，平行評估多個決策維度
decision = client.evaluate(
    context=incoming_ticket.payload,
    schema=RouteDecision
)

# 1. 毫秒級防禦：垃圾與攻擊攔截
if decision.intent.value == "spam" or decision.risk_score > 0.85:
    return drop_or_quarantine(incoming_ticket)

# 2. 確定性業務分支：無須啟動任何生成模型
if decision.intent.value == "refund" and decision.intent.confidence >= 0.90:
    return refund_rule_engine.dispatch(incoming_ticket)

# 3. 真正需要深度推理時，才構造 Context 喚醒慢速 System 2
if decision.intent.value == "tech_support":
    return call_claude_opus_for_troubleshooting(incoming_ticket)
```

在這個架構下，系統的整體吞吐量和成本結構發生了質的變化：90% 的例行事件在第一層就被毫秒級消化完畢，昂貴且緩慢的 System 2 模型只會接收到真正需要「多步驟推理與語言合成」的複雜難題。

## 傑文斯悖論（Jevons Paradox）的軟體預言

TypeSafe AI 將這款模型命名為「Jev」，致敬的是 19 世紀經濟學家威廉·斯坦利·傑文斯提出的**傑文斯悖論**——提高資源使用效率通常會增加、而不是減少該資源的總體消耗。

在傳統認知中，軟體工程師不敢在每一行程式碼、每一個單元測試、每一個日誌行注入 AI，因為「LLM 太貴、太慢、不可控」。

但當決策模型的推論延遲降至 100 毫秒以內、單次成本幾乎趨近於零，且輸出原生具備強型別約束與機率分佈時，工程師呼叫 AI 決策的頻率不會維持在原來的低水準，而是會暴增數個數量級：

- 過去你只在使用者按下「送出」時呼叫一次 AI；未來你可以在使用者打字的每一次停頓、背景佇列的每一個重試輪迴，全量運行決策模型。
- 過去 CI 只能跑靜態 Lint；未來每次 Git commit 都可以掛載一個 Jev 節點即時計算語義相容性與風險指數。

## 團隊在架構設計上的下一步

如果你正在為團隊的 Agent 系統規劃下一代架構，不要等到系統被延遲拖垮才回頭重構。現在就可以採取以下三個行動：

1. **盤點 Agent 工作流中的決策節點**：審視系統內的所有 prompt，挑出那些「輸出只需從清單二選一、多選一，或只需要評估門檻」的節點。
2. **制定強型別原語合約**：停止在 prompt 裡編寫冗長防禦規則要求模型輸出特定 JSON，改用枚舉、布林等資料結構定義控制邊界。
3. **建立 System 1 / System 2 的降級與回退閥門**：將機率指標（Confidence / Calibrated Probability）納入核心路由條件。當 System 1 的最高信心度低於指定閾值（如 0.70）時，才啟動慢速模型或引導人工介入。
