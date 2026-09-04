---
title: "Claude Agent 怎麼少花 Token：先調 effort，再量測真正的浪費"
description: "從一則 Fable 5.1 Token 優化清單出發，整理 Claude effort 的成本取捨、Prompt 與工具輸出的清理方式，以及如何用固定任務驗證省下的不是品質。"
publishDate: 2026-09-04T12:10:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
  - 技術選型
cover: ../../assets/covers/claude-token-cost-controls.png
coverAlt: "金色 effort 旋鈕、上下文卡片、Token 計數盤與通過檢查表組成成本驗證流程"
---

Agent 的成本不只來自模型單價，也來自它在每一輪多想了多久、讀了多少無關內容、呼叫了多少工具。[@dr_cintas 的原文](https://x.com/dr_cintas/status/2095216285114327412) 把這件事整理成四個設定與四個開源工具；其中最可直接驗證的是 effort，其他項目則應先確認是否真的存在於你的 Claude Code 或 API 環境。

本文以 [Claude effort 官方文件](https://platform.claude.com/docs/en/build-with-claude/effort) 為準。官方明確說明，effort 會影響回應、工具呼叫與 thinking 的 token；低 effort 可能降低能力，但也可能減少不必要的延伸工作。因此「少花 Token」的驗收條件不能只是帳單變小，而是固定任務仍通過同一組檢查。

## 第一個旋鈕：把 effort 當成風險預算

目前支援的層級依模型而異，常見選項是 `low`、`medium`、`high`、`xhigh` 與 `max`。官方建議從 `high` 開始，對長時間 coding 或 agentic 工作才升到 `xhigh`／`max`；已證明品質足夠的例行工作，則可降到 `medium` 或 `low`。

| 任務                     | 起始 effort        | 必要驗證                           |
| ------------------------ | ------------------ | ---------------------------------- |
| 摘要、格式轉換、短查詢   | `low` 或 `medium`  | 欄位、長度與事實抽查               |
| 一般修補、文件更新       | `medium` 或 `high` | 測試與 diff review                 |
| 多檔案除錯、長時間 Agent | `high` 或 `xhigh`  | 完整 checks、失敗重試與人工 review |
| 高風險或前沿問題         | `xhigh`／`max`     | 明確的成本上限與停止條件           |

不要把 `low` 理解成「一定答錯」，也不要把 `max` 理解成「一定值得」。做一個最小 A/B：挑選答案已知的 5–10 個真實任務，固定輸入、工具與驗收，只有 effort 不同；比較通過率、總 token、工具次數與完成時間。

## 第二個旋鈕：清掉每輪都會支付的上下文

Prompt、Skill 與工具輸出常會逐次累積。每一段重複的背景、已被程式碼表達的規則、過長的 shell 輸出，都會在下一輪再次計費。

先做三個低風險清理：

1. 將可由檔案、測試或 schema 表達的說明移出長 Prompt。
2. 讓工具回傳結構化摘要、錯誤與下一步，而不是整份無關輸出。
3. 用一組代表性任務重跑，確認刪除後沒有漏掉必要限制。

這不是「Prompt 越短越好」。真正的目標是保留會改變決策的 context，並把細節放到需要時才讀取的 Skill、參考檔或工具結果。

## 第三個旋鈕：先檢查快取、批次與模型選擇

原文把 `cost-optimize`、`prompt-audit` 與舊 API 設定遷移列為可執行命令，但這些命令是否可用，取決於你的 Claude Code 版本、安裝的 Skill 與 API surface。不要看到命令名稱就直接貼進 production；先查看本機 help、Skill 來源與會修改哪些檔案。

可移植的檢查順序只有四步：

1. **快取**：相同、穩定的前綴是否能使用 provider 的 prompt caching？
2. **輸出衛生**：工具是否回傳了模型不需要的日誌、重複內容或整個檔案？
3. **批次**：互不相依的請求能否合併，避免為每一筆支付完整啟動成本？
4. **模型與 effort**：通過率不變時，再考慮較便宜的模型或較低 effort。

每一步都先產生建議與預估範圍，經人確認後才修改設定。成本最佳化不應變成另一個沒有 review 的自動化寫入器。

## 開源工具不是免費的證明

原文提到 Caveman、RTK、Ponytail 與 CodeGraph，分別從回覆壓縮、shell 輸出、程式碼產生量與符號關係下手。這些方向可能有用，但導入前至少要核對：

- repository 是否仍維護、授權是否符合組織要求；
- 是否會把原始資料送到額外服務；
- 壓縮是否讓錯誤訊息、行號或安全訊號消失；
- 圖譜索引的建置與更新成本是否真的小於省下的 context。

若沒有基準資料，最簡單的做法是先不用新增工具：記錄目前任務的 token、工具輸出大小與通過率，手動縮短一個輸出，再比較結果。能證明瓶頸後，才值得引入額外元件。

## 最小可行的成本回歸表

把成本最佳化當成一般工程變更，留下可重跑的表格：

| 欄位         | 例子                                 |
| ------------ | ------------------------------------ |
| 任務版本     | `support-triage-v3`                  |
| 模型／effort | Claude Opus 5／`medium`              |
| 通過條件     | 類別正確、無未授權動作、延遲 < 10 秒 |
| Token        | input、output、thinking 分開記錄     |
| 工具         | 次數、輸出 bytes、失敗數             |
| 結果         | 通過率、成本、人工返工時間           |

先用已知答案的資料集跑 baseline，再套用一個變更。若成本下降但通過率或返工時間變差，就回滾；不要用單次成功回答替整個工作流背書。

最值得先做的通常只有一件事：下一個例行任務把 effort 從 `high` 降到 `medium`，用固定測試比較輸出。確認品質仍然成立後，再清理 Prompt 與工具輸出。這條路徑比一次安裝四個工具更容易回溯，也更容易知道省下的 Token 究竟來自哪裡。
