---
title: "Claude 工作環境別一次裝滿：先把可重用的 context 與核准邊界排好"
description: "從 Claude 的 memory、projects、skills、connectors 到排程與瀏覽器操作，建立一條由低副作用到可驗收自動化的採用順序，避免把「少重複貼 context」誤當成「可以自動代表你行動」。"
publishDate: 2026-09-08T09:38:26+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
cover: ../../assets/covers/claude-workspace-safe-automation.png
coverAlt: "昏暗工作桌上依序排列記憶檔案、專案夾、方法卡與排程時鐘，最後由銅色核准閘門阻擋未驗證動作。"
series: AI Agent 工程化與工作流實戰
seriesOrder: 16
---

每次打開新 chat 又重貼角色、專案、格式與禁忌，確實是浪費；但把所有 connector、排程與瀏覽器權限一次打開，通常會用更大的風險換回那幾分鐘。正確的起點不是「讓 Claude 知道一切」，而是讓它在正確的 project 裡取回足夠的 context，並在需要代表你行動前停下來。

[@undefinedKi 的 X Article](https://x.com/undefinedKi/status/2093685917542158372)把這件事包成一次性的設定清單：memory、projects、skills、connectors、scheduled tasks、文件、瀏覽器與 Cowork。原文說有 12 步，頁面實際只顯示 11 個編號小節；這個小落差反而是提醒：功能清單不能取代工作流設計。

我的立場是：**先讓重複工作少解釋一次，再讓高副作用工作多一個核准點。**

## 把「記得我」拆成三個不同責任

Claude 的 memory 可搜尋舊對話並帶到後續 chat 或 Cowork；使用者也能檢視、修正或關閉它。[Anthropic 的 Memory 說明](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)但這不是一個無限、正確且可授權的資料庫。

| 層次    | 要解決的問題                   | 最小產物                                  | 不該承擔的責任             |
| ------- | ------------------------------ | ----------------------------------------- | -------------------------- |
| Memory  | 我偏好怎麼合作？               | 可編輯的偏好與近期工作脈絡                | 判定今天的 production 狀態 |
| Project | 這件持續工作有哪些資料和規則？ | scope、instructions、參考檔               | 跨 project 擴散 context    |
| Skill   | 哪個已驗證的方法能重複執行？   | 有輸入、步驟、輸出與停止條件的 `SKILL.md` | 取得尚未授權的資料或寫入權 |

Anthropic 說明 Cowork project 有各自的 instructions、tasks、context 與 memory，且 project memory 不會跨越 project。[官方文件](https://support.claude.com/en/articles/14116274-organize-your-tasks-with-projects-in-claude-cowork)所以不要用一個「Everything」project 避免重複貼 context；那只是把舊客戶、不同角色與過期指令混在同一個抽屜。

## Skill 應從兩次正確操作中長出來

Skill 的價值不是存一份很長的 prompt，而是把已知會重複的工作變成能檢查的程序。官方把 Skills 定義為 Claude 可在適當任務自動套用的能力，也展示它能用於 Office add-ins。[Anthropic Help](https://support.claude.com/en/articles/12512180-use-skills-in-claude)

第一次做新工作時，先留下範例與失敗原因；第二次把邊界修正好；第三次才值得萃取。最短的可重用規格可以長這樣：

```yaml
use_when: 每週需要從同一組公開來源做技術摘要
input: 原始 URL 與讀者問題
steps:
  - 擷取原文與發布日期
  - 用一手來源核對可變動的技術主張
  - 列出不能核對的主張
output: 附 URL 的繁體中文摘要
never:
  - 沒有來源時補猜
  - 寫入外部系統
stop_when: 找不到原始來源或來源互相衝突
```

這比「你是一位嚴謹研究員」更可用：下一個人知道何時載入、要交付什麼，以及什麼情況不該繼續。

## 依副作用採用，不依功能數量採用

原文建議在同一個晚上接好工具，並把瑣事排程。這對熟悉權限模型的人可能有效，卻不是安全的預設。Connector 繼承你在外部服務的權限，既可能讀取資料，也可能在服務內執行動作。[Anthropic 的 connector 文件](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities)沒有支持「全部連接」這個通則。

| 順序 | 先做什麼                     | 通過後才能前進的證據                           |
| ---- | ---------------------------- | ---------------------------------------------- |
| 1    | 建 project 與可更正的 memory | 新 chat 能引用正確 scope，且不帶入別的 project |
| 2    | 把重複方法寫成只讀 skill     | 同一輸入可重跑，輸出保留來源與未知項           |
| 3    | 接一個最小 scope connector   | 能回答一個可讀回的小問題，沒有意外寫入         |
| 4    | 建立只讀排程                 | 前兩次結果都由人讀過並確認 scope 正確          |
| 5    | 使用 browser 或寫入型工具    | 發送、發布、付款、刪除與權限修改仍需人核准     |

Cowork scheduled task 即使電腦睡眠或 Claude Desktop 關閉也能遠端執行；不過每次是獨立 session，且不能連結本機資料夾。[官方限制](https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork)因此第一個排程應是「回報」而不是「代為處理」：例如列出昨天承諾卻尚未完成的事項，或整理待人工確認的變更。

## 瀏覽器與檔案不是聊天回答的延伸

Claude in Chrome 能讀、點、輸入與導覽網站；官方也要求你審核其 agent actions。[Anthropic Help](https://support.claude.com/en/articles/12012173-get-started-with-claude-in-chrome)這是一條代表使用者操作已登入帳號的路徑，不是普通搜尋功能。把它放在 connector 和排程之後，並不是保守，而是先確認不需要 API 或只讀整合。

同樣地，能生成試算表不表示它已成為可交付帳務。Anthropic 對 Excel 明確提醒：未經人工審核的內容不適合作為最終對客成果或 audit-critical calculation，外部試算表也可能含有 prompt injection。[Claude for Excel 文件](https://claude.com/docs/office-agents/excel)檔案是工作產物，正因如此更要驗算公式、篩選範圍和輸出目的地。

> [!IMPORTANT]
> **自動化的停止規則：一個動作會寄出、發布、購買、刪除，或改變權限時，必須在動作前等待人類核准；回應超時且無法讀回權威狀態時，標記為 unknown。**

今天不必做完十一項設定。選一件每週確實重複兩次的只讀工作，為它開一個 project、寫一份短 skill，然後跑兩次相同驗收。兩次都能回查來源且不越過權限邊界，再考慮 connector；有了連續正確的只讀紀錄，才安排排程。這樣得到的不是一個「什麼都知道」的 Claude，而是一個知道何時能幫、何時該停的工作環境。
