---
title: "第一支 Claude Agent 團隊，先驗收交接與停止條件"
description: "從 Claude Opus 5.5 多代理教學出發，拆開研究、寫作與審查的資料依賴，釐清 tools 與 allowed_tools、預算與時間限制，建立可比較單代理基線的最小驗收流程。"
publishDate: 2026-10-01T14:15:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
series: AI Agent 工程化與工作流實戰
seriesOrder: 48
cover: ../../assets/covers/claude-agent-team-acceptance-boundaries.png
coverAlt: "三條冰藍色紙雕路徑匯入珊瑚色檢查框，再形成一張完成的文件，呈現平行研究與單一驗收出口。"
---

讓三個 Agent 同時研究，通常比讓同一個 Agent 依序查三件事更有機會縮短等待時間。但如果寫作者沒有收到完整證據，或 reviewer 只看見一份漂亮摘要，省下來的時間會變成人工補查。

Khairallah AL-Awady 在 2026 年 9 月 29 日發布的 [Claude Opus 5.5 多代理教學](https://x.com/eng_khairallah1/status/2104868464770863565)，提出 orchestrator、specialist 與 critic 的組合，從單代理基線開始，再加交接、預算與時鐘。這個起點值得採用；真正需要補上的，是模型說「完成」之後，宿主如何確認工作已經通過驗收。

本文以「研究三個指定框架，產出一頁內部比較簡報」為例，建立第一支團隊的工作契約。這是架構與驗收設計，並非已執行的 SDK 專案或效能實驗。

## 模型降價不代表多代理一定比較便宜

Anthropic 的 [2026 年 9 月 22 日發布公告](https://www.anthropic.com/claude-opus-5-5)列出 Opus 5.5 每百萬輸入／輸出 token 為 4／20 美元，快取讀取為 0.20 美元；公告中的典型工作負載成本下降約 40%，包含單價、快取與每任務用量的效果，不能直接推成「同一任務加三個 Agent 也省 40%」。

對第一支團隊，我會先固定三個框架名稱、來源範圍與交付格式，讓單代理完成一次。記錄從開始到可接受成品的時間、估計成本、無來源主張數與人工補查時間。不要使用「這個月最熱門的三個框架」作為第一個測試題：沒有先定義熱門的指標，連輸入是否相同都無法確認。

只有基線顯示研究分支互相獨立，或某個分支大量消耗主對話脈絡時，再增加研究者。團隊版仍使用相同題目與驗收規則；更快但多出錯誤主張，不能算改善。

## 平行的是研究分支，寫作仍要等資料齊全

[SDK 子代理文件](https://code.claude.com/docs/en/agent-sdk/subagents)說明，非 fork 子代理不繼承父代理的對話與工具結果；委派訊息需要提供它所需的路徑、錯誤與決策。因此「請把剛才的資料寫成文章」不是合格交接。

我的設計是讓每個 researcher 只調查一個指定框架，回傳可追溯的證據記錄；orchestrator 確認三份都齊全，才交給 writer。critic 收到的則是同一版證據與草稿，避免拿舊研究審新文章。

下面是交接資料的概念格式，不是 SDK 內建 schema，也不會自行執行工具限制：

```yaml
run_id: briefing-001
brief_revision: 1
question: 框架 A 適合什麼工作，有哪些已知限制？
source_policy: 優先官方文件與官方 repository
findings:
  - claim_id: A-01
    claim: 待填入已查核的具體主張
    source_url: 待填入能支持該主張的頁面
    checked_at: 待填入實際查核時間
    status: verified
unresolved:
  - 未取得證據的問題，保留為缺口
output_contract:
  format: 一頁比較簡報
  add_unsourced_claims: false
```

這份契約的用處是保留來源與缺口，讓整合者能判斷是否有條件往下走。`verified` 仍是研究者的回報，不是證明；審查需要打開來源，確認它真的支持主張。若某個研究者失敗，就回傳缺件狀態，或依預先約定產出明確標示缺口的簡報，不讓 writer 自行補齊。

涉及程式碼與多人寫入時，還需要檔案所有權及隔離；可接著讀[多 Agent 工作台的注意力、隔離與權限](/blog/multi-agent-workstation-control-plane/)。本例只讓一個 writer 產出草稿，降低交接之外的變數。

## tools 限制能力，allowed_tools 處理自動核准

原教學建議 researcher 只有搜尋與抓取，writer 有讀寫，critic 唯讀。方向正確，但父代理與子代理的設定不能混為一談。

官方 [工具權限說明](https://code.claude.com/docs/en/agent-sdk/agent-loop#tool-permissions)明確區分：父代理的 `allowed_tools`／`allowedTools` 會自動核准列出的工具；沒有列出的工具仍可能可用，並依 permission mode 與 `canUseTool` 決定能否執行。這不是完整的工具能力白名單。

子代理 `AgentDefinition.tools` 則會縮小工具集合；省略時繼承可供子代理使用的工具，列出時只提供那些工具。設定原理與欄位以[官方工具限制文件](https://code.claude.com/docs/en/agent-sdk/subagents#tool-restrictions)為準。

最小團隊可以這樣分工：

- researcher 使用 `WebSearch`、`WebFetch`，只回傳證據。
- writer 使用 `Read`、`Write`，只產出指定草稿。
- critic 使用 `Read` 與需要的搜尋／抓取工具，核對草稿和來源，不修改草稿。
- orchestrator 負責派工、收件與整合；宿主負責授權及交付出口。

critic 是否需要上網，取決於交接是否包含完整、可核對的來源內容。只給 URL 又只准 `Read`，它便無法自行重新查核遠端頁面。

此外，writer 有 `Write` 不等於只能寫 `drafts/briefing.md`。限定寫入路徑仍須由宿主權限規則、工具回呼或受限檔案系統落實；一句「只改草稿」是指令。不要將發布、發信或部署工具放進這個首次實驗的執行環境。

## 四種限制要各自有驗證方法

截至 2026 年 10 月 1 日，官方 [子代理上限文件](https://code.claude.com/docs/en/agent-sdk/subagents#cap-subagent-depth-concurrency-and-spend)將深度、同時執行數與成本列為不同控制，並要求留意 SDK／內含 Claude Code 的版本。文件所述完整組合適用於 Python SDK v0.2.127、TypeScript SDK v0.3.219 及後續版本，內含 Claude Code v2.1.219 或更新版本；舊版本不能只因欄位看起來存在就假定同樣行為。

以下是第一次試跑的建議值，屬於本文的實驗設定，不是通用最佳值：

```yaml
# 概念設定，需映射到 SDK 與宿主實作
limits:
  subagent_depth: 1
  concurrent_subagents: 3
  estimated_budget_usd: 5
  review_rounds: 3
  wall_clock_seconds: 1200
```

### 深度與同時執行數限制工作樹

`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` 限制子代理再往下派工；`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS=3` 限制同時執行數。這些值控制資源成長，不會替你建立「三份研究都回來才寫作」的資料依賴。

### 成本上限限制估計花費

Python 的 `max_budget_usd` 對應 TypeScript 的 `maxBudgetUsd`。官方文件說明子代理花費納入總額，達上限會停止相關背景工作並回傳 `error_max_budget_usd`；文件示例也顯示回報成本可能達到或超過設定值。因此它是執行期間的估計成本停止機制，不是精確到美分的帳單承諾。

### 三輪審查需要宿主計數

「最多退回三次」若只寫在提示詞裡，仍依賴模型遵守。宿主應保存 draft revision、review revision 與 round counter，達三輪後把剩餘異議交回使用者，不再自動重試。

### 時間提示與截止處理是兩層

Anthropic 的 [Opus 5.5 prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#time-signals-for-multiagent-harnesses)建議向團隊提供 elapsed time 或時間預算；官方小型研究任務評估顯示它能改善完成速度，但也明確說明這是 advisory signal，並可能讓模型少搜尋或少驗證。

宿主的 timeout 必須另外處理：停止接受新任務、取消執行、確認背景工作與子程序結束、保存部分產物，最後記錄 `timed_out`。單用 `asyncio.wait_for` 能對被等待的 coroutine 發出取消，但不能只憑這一行就宣稱所有子程序或遠端副作用已停止；第一次試跑要特別驗證 SDK 清理行為。

## critic 的 PASS 與 SDK success 都不等於交付

原教學把 critic 放在最後，這能增加一次反例檢查，但同一模型家族的兩個角色仍可能共享盲點。我會把 critic 的 PASS 當作進入驗收的訊號，而不是直接觸發發布。

宿主至少確認這四件事：

1. 三個指定框架都有研究結果，缺口沒有被刪除或改寫成已知事實。
2. 每個外部事實能對應 claim ID 與支持它的來源；來源只是提到同一主題仍不算通過。
3. review 指向最終草稿的同一 revision；審查之後有修改，就要重新核對修改部分。
4. 產物符合格式、存在於允許的輸出位置，且執行沒有以 timeout 或預算錯誤結束。

官方 [agent loop 結果處理](https://code.claude.com/docs/en/agent-sdk/agent-loop#handle-messages)提供 `ResultMessage` 與停止 subtype。`success` 表示 runtime 正常完成這次執行，不證明簡報中的主張正確。程序出現錯誤也可能沒有 result message，宿主不能把「沒收到錯誤結果」當作成功。

**沒有同一版草稿、證據與審查結果，就停止在待驗收狀態。** 這是本文建議的交付規則。若後續需要跨 session 保存任務與審查入口，可接著看[如何把多 Agent 工作從 Session 搬到可交接任務](/blog/coding-agent-session-to-task-handoff/)。

## 第一個實驗要證明的是收益與可停止性

先選一份你曾人工完成的簡報，固定輸入、模型設定與來源範圍，各跑單代理與團隊版，重複幾次觀察變異；本文沒有替這個比較預填效能結果。

記錄可接受成品的總時間、估計成本、人工補查時間、無來源主張數與失敗 subtype。再刻意測試研究缺件、critic 退回三次，以及 timeout 時背景工作是否結束。能寫出一份文章，只證明成功路徑；這些失敗情境才會告訴你能不能放心再跑一次。

下一步先建立單代理基線與一份交接契約。只新增一個能改善已觀察瓶頸的 specialist；如果總時間、品質或人工補查量沒有改善，就保留較簡單的流程。
