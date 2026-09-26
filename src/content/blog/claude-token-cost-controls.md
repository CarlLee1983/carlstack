---
title: "Claude Agent 的 effort 怎麼選：速度、驗證深度與 Token 成本"
description: "根據 Claude Code 官方文件與 Thariq 的 effort 實驗，整理 effort 如何影響驗證與自主程度，以及如何用固定任務確認省下的成本沒有變成品質損失。"
publishDate: 2026-09-04T12:10:00+08:00
updatedDate: 2026-09-26
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
  - 技術選型
cover: ../../assets/covers/claude-token-cost-controls.png
coverAlt: "金色 effort 旋鈕、上下文卡片、Token 計數盤與通過檢查表組成成本驗證流程"
series: AI Agent 工程化與工作流實戰
seriesOrder: 27
---

Agent 的成本不只來自模型單價，也來自它每輪用了多少 thinking token、讀了多少無關內容、呼叫多少工具，以及花多久完成。[@dr_cintas 的原文](https://x.com/dr_cintas/status/2095216285114327412)把 Token 優化整理成四個設定與四個開源工具；其中最直接可量測的是 Claude 的 effort。本文也納入 Thariq 在 [X 的提問](https://x.com/trq212/status/2103576349499855160)與[完整實驗記錄](https://claude.dev/blog/spending-your-effort/)：effort 不只改變 token 數，也會改變 Claude 願意自行做多少選擇、檢查與反例測試。

這些實驗是 Anthropic 工程師的內部結果，不是公開可重跑的 leaderboard。本文用它們理解可能的取捨，實際選擇仍要回到自己的任務與驗收資料。Claude Code 官方文件說明，effort 控制 adaptive reasoning 的深度；較低層級通常更快、更省 token，較高層級則可能改善複雜任務表現，但各模型可用層級與預設值不同。[Claude Code effort 文件](https://code.claude.com/docs/en/model-config#adjust-effort-level)

## Effort 是驗證預算，不是正確率保證

選層級時，先問任務最可能怎麼失敗。若規格不清楚，模型多做半小時仍可能只是在擴寫自己的假設；若規格明確、但邊界案例很多，多一些檢查與反例測試才可能改變結果。這是本文從 Thariq 的案例歸納出的工程判斷。

### low

適合短小、範圍明確且延遲敏感的工作，例如草稿、探索性原型與簡單修改；人會很快接手下一輪。

### medium

適合一般功能實作或成本敏感的例行任務；先確認目前模型把它校準成什麼預設值。

### high

適合需要多做驗證的除錯、既有程式碼修改與有隱藏邊界的工作；交付前仍要跑測試並看 diff。

### xhigh／max

保留給困難且需要較多自主工作的任務。先設時間或 token 上限、驗收條件與停止規則；Claude Code 的 max 通常只套用在目前 session，而且官方提醒它可能出現遞減收益或過度思考。

層級名稱不能跨模型直接比較。官方文件說明 effort 會依模型校準，同一個 high 不代表相同的內部配置；模型改版後，應用自己的任務重新量測，不要沿用舊模型的高低設定。[Claude Code 命令文件](https://code.claude.com/docs/en/commands#all-commands)

## 隱藏邊界多時，較高 effort 才可能值得

Thariq 的 [Terminal-Bench 3.0 實驗](https://claude.dev/blog/spending-your-effort/)提供了可理解行為差異的例子：Fable 5.1 在 html-js-filter 任務從 low 的 1/5 次通過，到 xhigh 的 5/5；Opus 5.5 在 mvcc-lsm-compaction 從 low 的 0/5 到 xhigh 的 4/5。作者追蹤的高 effort 執行會先重現故障、檢查 parser 原始碼、建立隨機測試，再拿既有 XSS 測試集與 fuzz 測試補強；低 effort 執行則較常只寫一版並用少數例子試跑。

這些數字要連同限制一起看。Thariq 說每個任務跑五次；Fable 5.1 的生產安全介入在該組內部測試中關閉，安全任務沒有網路，錯誤類別也部分由模型判讀。因此它們是作者回報的個案，不是可推成「提高 effort 就有某個固定成功率」的外部複驗結果。本次更新時，Terminal-Bench 官方已發布 4.0；若用 benchmark 做選型，必須固定資料集版本、模型、工具與 verifier，再對照同一套任務。[Terminal-Bench 3.0 release](https://github.com/harbor-framework/terminal-bench/releases/tag/v3.0.0) · [目前 releases](https://github.com/harbor-framework/terminal-bench/releases)

作者也觀察到，提高 effort 比較能減少漏掉邊界案例的失敗，未必能修正錯誤的解題方向。若模型把領域規則讀錯，或使用者其實需要另一種結果，更長的驗證流程仍可能證明錯誤的解法很完整。先讓規格可驗收，再用 effort 決定驗證深度。

## 把規劃、實作與驗證分開調

Thariq 分享的日常工作流，適合把人類參與程度放進 effort 選擇：

1. 先給需求，要求 Claude 列出缺少的決策與驗收條件，等人回答後再開始寫。
2. 規格定下來後，用 low 或 medium 實作，讓人較快看到第一版並修正方向。
3. 人先看功能是否符合原意；若偏離，補足規格或修改實作，不先把 effort 拉到 max。
4. 用 high 再做一次獨立驗證，要求它執行測試、尋找反例、列出未覆蓋的邊界與失敗項目。

高風險變更還是需要人或獨立 reviewer 檢查。Effort 能調整模型這一輪願意投入多少工作，無法代替明確的完成條件、可拒絕錯誤輸出的測試，或責任人的核可。

## 切換 effort 與 prompt cache 要看模型及介面

在 Claude Code 執行 /effort low 或 /effort high 可調整目前模型的層級，/effort auto 則回到模型預設；實際可選值取決於模型、版本與組織限制。[Claude Code 命令文件](https://code.claude.com/docs/en/commands#all-commands)

Thariq 的文章提到新模型可以調整 effort 而不破壞 Claude Code 的 prompt cache，但這不應被擴大成所有模型與 API 用法的保證。Anthropic API 對部分模型提供 per-message effort 切換並保留快取；若模型不支援而改動下一個 request 的頂層 effort，快取前綴可能改變。Claude Code 在切換時也可能顯示 cache warning。要節省成本，請確認目前模型與呼叫方式支援的行為，再觀察實際 cached token 數。[Anthropic effort API 文件](https://platform.claude.com/docs/en/build-with-claude/effort#change-effort-mid-conversation) · [Claude Code prompt cache 文件](https://code.claude.com/docs/en/model-config#prompt-caching-configuration)

## 第二個旋鈕：清掉每輪都會支付的上下文

Prompt、Skill 與工具輸出會逐輪累積。重複背景、已寫進測試或 schema 的規則、過長 shell 輸出，都可能在後續請求繼續產生 token 成本。

1. 將可由檔案、測試或 schema 表達的說明移出長 Prompt。
2. 讓工具回傳結構化摘要、錯誤與必要下一步，而不是整份無關輸出。
3. 用代表性任務重跑，確認清理後沒有漏掉必要限制。

目標不是讓 Prompt 越短越好，而是只保留會改變決策的 context；細節放到需要時才讀取的 Skill、參考檔或工具結果。

## 第三個旋鈕：分開量測快取、批次與模型選擇

原文把 cost-optimize、prompt-audit 與舊 API 設定遷移列為可執行命令，但這些命令是否可用，取決於 Claude Code 版本、已安裝的 Skill 與 API surface。不要只因為看到命令名稱就貼進 production；先查看本機 help、Skill 來源，以及它會修改哪些檔案。

- 快取：穩定的 prompt 前綴是否真的命中 provider cache？
- 輸出衛生：工具是否回傳了模型不需要的日誌、重複內容或整個檔案？
- 批次：互不相依的請求能否合併，避免重複支付啟動成本？
- 模型與 effort：通過率與返工時間相同時，再考慮較便宜的模型或較低 effort。

每一步先產生建議與預估，再由人確認是否修改設定。成本最佳化不應變成另一個沒有 review 的自動寫入器。

## 開源工具不會自動證明成本下降

原文提到 Caveman、RTK、Ponytail 與 CodeGraph，分別從回覆壓縮、shell 輸出、程式碼產生量與符號關係下手。這些方向可能有用，但導入前至少要核對：

- repository 是否仍維護、授權是否符合組織要求；
- 是否會把原始資料送到額外服務；
- 壓縮是否會讓錯誤訊息、行號或安全訊號消失；
- 圖譜索引的建置與更新成本是否小於省下的 context。

若沒有基準資料，先不要增加工具。記錄目前任務的 token、工具輸出大小與通過率，手動縮短一段輸出再比較；證明瓶頸後，才引入額外元件。

## 用固定任務確認省下的不是品質

挑 5–10 個有代表性的真實任務，固定輸入、工具版本與驗收方式，再比較兩個 effort 層級。每個任務至少記下：

- 驗收：通過率、錯誤類型、未授權動作與人工返工。
- 消耗：input、output、thinking token、工具次數與 wall-clock time。
- 責任邊界：誰 review、哪些失敗必須停止、超出多少時間或成本要交回人工。

可把基準寫成一份最小記錄：

```yaml
task: support-triage-v3
model: Claude Opus 5.5
effort: medium
pass_criteria:
  - category matches the reference
  - no unauthorized action
  - result includes source evidence
measure:
  - passed trials
  - input, output, and thinking tokens
  - tool calls and wall-clock time
  - human review minutes
```

每次只改一個變數，並用多次執行看差異是否穩定。若 token 下降但通過率或返工時間變差，就回復原設定；單次成功回答不能替整條工作流背書。

下一個例行任務先從 medium 開始，固定一組小型回歸任務後再試 low。遇到明確的隱藏邊界或高代價漏測，再把驗證步驟升到 high；只有在自治確實減少人工交接成本時，才讓長任務使用 xhigh 或 max。

## 延伸閱讀

- [Thariq Shihipar：Using Claude Code: Spending your effort](https://claude.dev/blog/spending-your-effort/)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Terminal-Bench 3.0](https://github.com/harbor-framework/terminal-bench/releases/tag/v3.0.0)
