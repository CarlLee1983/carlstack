---
title: "Claude 自動化的採用順序：重用 context，依操作風險設定核准"
description: "從 Claude 的 memory、projects、skills、connectors 到排程與瀏覽器操作，建立一條由低副作用到可驗收自動化的採用順序，避免把「少重複貼 context」誤當成「可以自動代表你行動」。"
publishDate: 2026-09-08T09:38:26+08:00
updatedDate: 2026-11-05T23:36:00Z
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

重複貼上專案背景和格式要求，可以靠 project 與 memory 減少。寄信、改檔、付款卻需要另外決定誰能做、何時核准。我建議從一件每週重複的唯讀工作開始，確認資料範圍和輸出，再逐步接上工具與排程。

討論起點是 [@undefinedKi 的 X Article](https://x.com/undefinedKi/status/2093685917542158372)。2026 年 11 月 5 日更新時，X 原頁無法讀取，步驟數與介面描述未能重新核對。下列產品行為依官方文件整理，採用順序與驗收門檻是工程建議，尚未在 Claude 帳號中實測。

## 把「記得我」拆成三個不同責任

先分清楚兩種能力：chat search 是搜尋舊對話，memory 則把工作脈絡帶進後續對話。官方目前說明 chat 與雲端 Cowork 可共用 memory，但本機執行的 Cowork session 不使用這套 memory。[Memory 說明](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)因此，設定完成後仍要確認任務在哪裡執行，不能看到「Cowork」就假設它記得同一組資料。

### Memory：保存合作偏好，不替代即時狀態

適合保存偏好與近期工作脈絡，並定期檢視、更正。今天的 production 狀態仍要查權威來源，不能拿上週對話當部署紀錄。

### Project：整理工作範圍，但要另外確認隔離設定

Project 收納 instructions、檔案與工作脈絡。官方目前說明，新建的 Cowork project 會存入 Claude 帳號；由本機資料夾遷移的 project，其本機檔案仍留在電腦上。Team 與 Enterprise 尚未開啟 Chat and Cowork unified 時，從本機資料夾建立的 project 仍只保存在該電腦。不能把「project 可跨裝置看到」解讀成「所有本機檔案都已同步」。[Cowork projects 文件](https://support.claude.com/en/articles/14116274-organize-your-tasks-with-projects-in-claude-cowork)

Project 不直接採用其他 project 的 memory，但可與 project 外的帳號對話共用記憶。需要分離客戶或角色脈絡時，應在 project 的 Memory 設定關閉 `Use account memory`，再用不含機密的測試資料確認行為。這是記憶設定，不等於檔案權限或組織資料隔離的完整保證。

### Skill：重用程序，不授予新權限

Skill 應交代輸入、步驟、輸出與停止條件。它不應替使用者決定新資料可否讀取，也不能因為文件寫了「發布」就視為已有寫入授權。

## Skill 應從兩次正確操作中長出來

重複工作適合整理成 skill，讓下一次執行能沿用步驟並檢查結果。官方將 Skills 用於專門知識與工作流程，並說明 Claude 會依任務使用已啟用的相關能力。[Anthropic Help](https://support.claude.com/en/articles/12512180-use-skills-in-claude)

第一次做新工作時，先留下範例與失敗原因；第二次把邊界修正好；第三次才值得萃取。下列 YAML 是工作規格示意，不是可直接上傳的完整 `SKILL.md`，也不是產品強制執行的權限設定：

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

## 逐步增加 connector 與排程權限

一次接齊工具並排程，不適合作為所有團隊的預設。Connector 通常繼承使用者在外部服務的權限；使用共用憑證的自訂 connector 則能觸及該憑證可讀寫的範圍。它既可能讀取資料，也可能在服務內執行動作。[Anthropic 的 connector 文件](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities)沒有支持「全部連接」這個通則。

我會按以下順序增加能力，每一步都留下可讀回的結果：

1. 建立 project，確認 account memory 設定。用測試對話檢查 scope；不要先匯入所有客戶資料。
2. 把重複方法寫成唯讀 skill。同一組輸入重跑，檢查來源、未知項與停止條件，而非要求文字逐字相同。
3. 接一個最小範圍 connector。先讀回一筆已知資料，確認實際工具與憑證權限；若不能縮小 scope，就先不要交給無人值守任務。
4. 建立唯讀排程。前兩次由人檢查資料範圍與輸出；兩次通過只是小規模試用門檻，不是可靠度證明。
5. 才考慮 browser 或寫入型工具。先指定目標、可做的動作與核准點，再驗證執行後的權威狀態。

排程還要分清楚執行位置。[官方排程文件](https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork)說明，遠端排程可在電腦睡眠或 Desktop 關閉時執行，使用 connectors 與存於 Claude 帳號的檔案，每次有獨立 session；需要本機檔案或 app 的任務則只在本機執行。文件另保留 Pro、Max、Ultra 在 10 月 6 日前建立的本機排程例外，不能把所有既有任務都當成已遷移雲端。

建立排程前，先記錄執行位置、資料來源、結果位置與失敗時通知誰。本機任務必須另外確認電腦與 app 的可用條件。第一個排程可只整理待確認事項；不要讓排程的存在，變成自動寄信或刪檔的授權。

## 瀏覽器與檔案不是聊天回答的延伸

Claude in Chrome 能讀、點、輸入與導覽網站；官方也要求你審核其 agent actions。[Anthropic Help](https://support.claude.com/en/articles/12012173-get-started-with-claude-in-chrome)這是一條代表使用者操作已登入帳號的路徑，不是普通搜尋功能。採用前先確認 API 或唯讀整合能否完成工作，再決定是否需要操作登入中的網頁。

同樣地，能生成試算表不表示它已成為可交付帳務。Anthropic 對 Excel 明確提醒：未經人工審核的內容不適合作為最終對客成果或 audit-critical calculation，外部試算表也可能含有 prompt injection。[Claude for Excel 文件](https://claude.com/docs/office-agents/excel)檔案是工作產物，正因如此更要驗算公式、篩選範圍和輸出目的地。

> [!IMPORTANT]
> **建議的保守停止規則：一個動作會寄出、發布、購買、刪除，或改變權限時，必須在動作前等待人類核准；回應超時且無法讀回權威狀態時，標記為 unknown。**

今天先完成一個可檢查的小工作流。選一件每週確實重複兩次的唯讀工作，為它開一個 project、寫一份短 skill，然後跑兩次相同驗收。兩次都能回查來源且不越過權限邊界，再考慮 connector；有了連續正確的唯讀紀錄，才安排排程。把每次試跑的資料範圍、輸出與核准紀錄留好，下一次擴大自動化時才有比較依據。
