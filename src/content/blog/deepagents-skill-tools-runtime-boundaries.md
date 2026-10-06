---
title: "Deepagents 0.7.22：工具跟著 skill 出現，也要驗收它何時消失"
description: "從 Deepagents 0.7.22 的 SkillsMiddleware 實作，拆解按需揭露、MCP 工具群、Runtime 身分與 compaction 撤銷。用六個失敗案例驗收導入，區分工具可見性、實際授權與尚未量測的成本效益。"
publishDate: 2026-10-06T10:10:47+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - API 整合
  - 開源專案
series: AI Agent 工程化與工作流實戰
seriesOrder: 66
cover: ../../assets/covers/deepagents-skill-tools-runtime-boundaries.webp
coverAlt: "奶油色紙雕手冊展開一條深綠紙帶，連到檔案櫃唯一打開的工具抽屜，其餘抽屜保持關閉，表達讀取技能後才揭露對應工具。"
repositoryUrl: https://github.com/langchain-ai/deepagents
---

Agent 接了 issue tracker、文件庫與客服系統後，一個「找出待處理工單」的任務，可能還沒開始就帶著一整批不相干的工具 schema。把工具依 skill 分組，可以讓模型讀到工作說明時才取得那一組工具。但接下來要問：對話被壓縮、使用者換了身分，這組工具還能呼叫嗎？

[Deepagents 0.7.22](https://github.com/langchain-ai/deepagents/releases/tag/deepagents==0.7.22) 在 2026-10-05 發布，納入 [PR #6552](https://github.com/langchain-ai/deepagents/pull/6552) 的按需工具揭露功能。它提供了一個值得採用的小邊界：skill 的讀取紀錄，參與決定 middleware 管理的工具何時出現在模型面前、何時能執行。

我會從一組唯讀 issue 工具導入，先驗收讀取、撤銷與身分隔離，再量成本。站內〈[Uber MCP Gateway 的工具發布契約](/blog/uber-mcp-gateway-controlled-tool-rollout/)〉處理 owner 與版本核准；這篇縮到單一 Agent 對話裡的工具生命週期，與〈[pstack 第一個可重跑工作流](/blog/pstack-first-verifiable-workflow/)〉的安裝導入也不同。

> [!NOTE]
> 本文查核 0.7.22 tag 的原始碼與官方測試，沒有安裝或執行 Deepagents、連接 MCP server，也沒有實測 token、延遲或 cache 命中率。以下整合片段與驗收案例是導入設計，不能當成本文已通過的執行結果。

## `include_tools` 決定揭露範圍，註冊位置決定呼叫限制

假設 skill 放在 backend 的 `/skills/issue-triage/SKILL.md`。它可以用以下 frontmatter 指定工具；這裡的值是以空白分隔的字串：

```yaml
---
name: issue-triage
description: 查詢目前專案待處理 issue，整理需要人工確認的項目。
metadata:
  include_tools: list_issues get_issue
---
```

工具實作交給 `SkillsMiddleware(..., tools=[list_issues, get_issue])`，而非再把同一批工具放進 `create_deep_agent(tools=...)`。0.7.22 刻意不將前者直接註冊成一般 tool-node 工具；它等到模型請求中出現符合條件的 skill 讀取，才揭露 schema 並寫入當次可用紀錄。[SkillsMiddleware 實作](https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/deepagents/middleware/skills.py)

這個區分會影響驗收。若工具原本就在 agent 的 `tools` 裡，還設定了 `extras={"defer_loading": True}`，skill 可以提早揭露它，但它不會因此變成受同一 skill gate 管理的工具。同名已註冊工具也優先於 resolver 回傳的工具。把工具兩邊都放，可能讓你以為已經加上讀取限制，實際仍走原本的註冊路徑。[工具分類邏輯](https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/deepagents/middleware/_skill_tools.py)

導入時可先做一份很短的清單：工具名稱、註冊位置、是否 deferred、是否允許其他搜尋入口。只想隨 skill 開放的工具，應留在 middleware 那一側。

## 成功讀取是技術事件，不能拿來證明讀懂全文

0.7.22 的 `_find_skill_reads` 將 `read_file` 呼叫與對應的非錯誤 `ToolMessage` 配對，再確認路徑對上已載入的 skill metadata。它不分析回傳正文是否包含完整指引；任何 `offset`、`limit` 都算，結果後來被裁短也仍可算成功讀取。[讀取判定原始碼](https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/deepagents/middleware/_skill_tools.py)

因此「讀 skill 才載入 tools」適合管理模型的工具選擇面，無法證明模型已讀完操作規範，更不能代替寫入核准。若刪除 issue 需要使用者確認，確認點仍應放在執行流程，不能用「剛剛 read_file 成功」當作證據。

另外，模型在同一次回應裡同時提出讀 skill 與呼叫隱藏工具，也不會直接取得通行資格。官方測試要求這種呼叫收到 invalid-tool error；正常路徑需要讀取結果進入後續模型請求，再形成揭露紀錄。[同回合與讀取前測試](https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/tests/unit_tests/middleware/test_skill_tools.py)

**需要人工核准的副作用，仍在工具執行端驗證核准。** Skill 文件可以說明何時要問，真正擋住動作的機制不能只是一段說明。

## MCP 工具群要連到可信 Runtime 身分

當 MCP adapter 產生的工具名稱不固定，逐一寫進 skill 很難維護。官方設計允許 `include_tools` 填一個群組名稱，再由 resolver 回傳多個 `BaseTool`。PR 以 `linear` 對應一個 MCP server 的工具群，也示範根據 `runtime.context` 決定是否提供管理操作。[Resolver 使用方式](https://github.com/langchain-ai/deepagents/pull/6552)

以下是本文的整合骨架，省略 MCP client 建立、驗證身分與政策儲存的實作，不能直接當作可執行程式：

```python
from deepagents.middleware.skills import SkillsMiddleware

# tools_for_identity 與 policy 是應用程式的介面，並非 SDK API。
def resolve_skill_tools(name, runtime):
    if name != "issue_reader":
        return []
    actor = runtime.context
    if actor is None:
        return []
    if not policy.can_read_issues(actor.tenant_id, actor.user_id):
        return []
    return tools_for_identity(actor.tenant_id, actor.user_id)

skills = SkillsMiddleware(
    backend=backend,
    sources=["/skills/"],
    tools=resolve_skill_tools,
)
```

對應 skill 使用 `metadata.include_tools: issue_reader`。應用程式先完成登入與 tenant 驗證，再把可信 context 傳給 Agent；不能接受模型把 `user_id` 或 `is_admin` 寫在 prompt 裡，就把它當成 Runtime 的授權事實。`tools_for_identity` 也必須回傳綁定正確使用者憑證或執行政策的工具，不能所有人共用一個管理員 MCP 連線。

Resolver 會在相關 skill 已讀後的每次模型呼叫執行，也會在 skill tool 執行前再執行一次。這讓它有機會拒絕已撤銷的工具，但也讓它成為延遲與快取設計的一部分。官方要求 resolver 保持便宜，且快取須依它所依賴的 Runtime context 隔離。[Resolver 契約與執行前重算](https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/deepagents/middleware/skills.py)

我的做法會把穩定的工具 schema 快取，與可變的權限決策分開。快取 key 至少覆蓋實際影響工具集合的 tenant、身分與政策版本；執行端仍重新檢查資源存取。否則上一次管理員取到的工具物件，可能沿著全域快取流到下一個使用者。

這個 resolver 也不保證 MCP 連線本身延遲建立。若你在建 Agent 前已呼叫 `get_tools`，省下的是未使用工具提前進入模型請求的部分，不能宣稱連線與工具探索成本也被省掉。

## Compaction 撤銷的是這次對話的工具資格

對 middleware 管理的工具，揭露紀錄會隨每次模型呼叫更新，包含清空的情況。當 compaction 移除支撐它的 skill 讀取紀錄，且沒有其他仍保留的讀取揭露同一工具，後續呼叫應得到 invalid-tool error。若另一個保留的 skill 也提供同一工具，資格可以繼續存在。[Compaction 與多來源測試](https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/tests/unit_tests/middleware/test_skill_tool_resolver.py)

工具執行前，resolver 若已不再回傳該工具，同樣會走無效工具路徑。這是新呼叫的攔截；它不會追回已寄出的信、還原已刪除的資料，或自動取消遠端已開始的工作。已經被 agent 直接註冊的 deferred tools，也不能套用這段撤銷預期。

實作位置同樣重要。手動組 middleware 時，`SkillsMiddleware` 應放在 summarization 與模型 fallback／routing 之後、prompt caching 之前，讓它看見壓縮後訊息及實際使用的模型。`create_deep_agent` 會安排位置；自訂 wrapper 則應確認能處理 `ExtendedModelResponse`。[Middleware 位置說明](https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/deepagents/middleware/skills.py)

## 第一輪驗收用失敗案例擋住誤接

我會用 fake model 與只記錄呼叫次數的唯讀工具，先跑下面的案例；通過後才接真實 MCP。斷言除了模型看見哪些 schema，還要檢查工具函式有沒有執行，避免只驗證畫面上的清單。

1. **未讀與同回合搶跑。** 未讀 skill 直接呼叫，以及同一回應並列 read 和 hidden-tool call，都應拒絕，工具執行次數為零。
2. **讀取失敗與部分讀取。** `read_file` 回錯誤不揭露；成功的部分讀取會揭露。測試要反映目前契約，不能誤設成「只讀一行就一定拒絕」。
3. **壓縮後重呼叫。** 保留與移除讀取紀錄各測一次；移除全部相關讀取後，在下一次模型呼叫更新紀錄，再嘗試舊工具名稱。
4. **揭露後撤權。** 模型已取得 schema，但執行前政策改為拒絕，resolver 回空清單；工具不得執行。另測執行中的遠端工作，明確記錄它需要自己的取消機制。
5. **跨身分快取。** 同一 Agent 實例依序接受 tenant A 管理員與 tenant B 唯讀使用者，確認工具物件、連線身分與資料範圍都沒有沿用 A。
6. **錯誤不偷偷放行。** Resolver 丟出例外、回傳錯誤型別，以及 async resolver 被 sync 入口呼叫，都應留下可辨識失敗；不要在 fallback 裡改回全量工具。

前四項可對照官方的 [skill tools 測試](https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/tests/unit_tests/middleware/test_skill_tools.py)與 [resolver 測試](https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/tests/unit_tests/middleware/test_skill_tool_resolver.py)。跨 tenant 快取、遠端取消與實際政策更新是本文要求部署者補上的驗收，官方單元測試通過不能替代它們。

## 量成本時，把讀 skill 的那一趟也算進去

0.7.22 對支援途中加入工具定義的模型採用 inline disclosure；其他模型則把工具加到 `tools`。在該版本，OpenAI 分支還檢查 `ChatOpenAI` 的確切型別、Responses API 開關與模型名稱前綴，不能只因為服務相容 OpenAI API，就假設走同一路徑。[Provider 分流](https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/deepagents/middleware/_skill_tools.py)

PR 說明提到 OpenAI 路徑需要 `langchain-openai>=1.6.5`；0.7.22 tag 的測試依賴下限已是 `1.6.7`。建立重現環境時應記錄完整 lockfile、adapter、模型與 endpoint，不只記 `deepagents==0.7.22`。[版本依賴](https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/pyproject.toml)

Inline 設計旨在保留可快取的前綴，但實際效益還取決於工具 schema 是否穩定、對話如何壓縮與任務會讀多少 skills。比較全量工具與按需工具時，應計入讀 skill 的額外模型回合、resolver 耗時、失敗重試、整個任務的輸入 token 與完成率，不能只比第一個 request 的大小。

下一步可以很小：把一個唯讀工具群移到 `SkillsMiddleware`，保留既有執行端授權，補齊上述失敗測試，再用同一批任務比較總成本。只要出現跨身分工具沿用，或未揭露工具仍能執行，就停止擴大接入；把註冊位置與快取隔離查清楚後再繼續。
