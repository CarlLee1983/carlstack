---
title: "Grok Bot Guides：持久雲端電腦、多 Agent 分工與共享登入風險"
description: "依官方指南與安全文件區分 Grok Bot 的使用模式和產品保證：釐清共享電腦、Reviewer 覆蓋範圍、憑證保護與操作授權，以及 Template 分享前的資料檢查。"
updatedDate: 2026-11-06T00:55:42Z
publishDate: 2026-10-08T17:30:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
series: AI Agent 工程化與工作流實戰
seriesOrder: 72
cover: ../../assets/covers/grok-bot-guides-architecture-overview.png
coverAlt: "深藍色架構面板展現 Outer Loop 協調節點與沙盒執行單元連線，並設有核心審批與信任閘門。"
---

持久雲端電腦讓 Agent 可以保留檔案、登入網站並接續工作。先前留下的權限與資料，也可能被下一個任務使用。評估多 Bot 系統時，角色分工、執行隔離與操作授權必須分開看。

x.ai 官方的 [Grok Bot Guides](https://x.ai/bot/guides) 收錄實務工作流。2026-11-06 查核時，索引列出 19 篇指南，已超過舊稿記錄的 17 篇；Matt Palmer 的 Bot 101 與 Templates，以及 Lingxi Li 的 Engineering，都是署名作者的使用經驗。這些案例很適合學習工作拆分，但不能把作者自己的配置直接升格為產品架構或安全承諾。

> [!NOTE]
> 2026-11-06 校訂時，來源包含 2026 年 9 月的經驗指南與標示更新於 2026-10-28 的 Bot／Security 文件。線上文件可能繼續變動，且不是開源實作稽核；Vault 文件另標示需 0.75.2 或更新版本。這次沒有操作帳號、匯入 Template、呼叫外部 Agent 或驗證任何付費流程。

## Outer／Inner Loop 把背景調查與實作分開

Matt Palmer 在 2026-09-11 的 [Grok Bot 101](https://x.ai/bot/guides/grok-bot-101) 示範：讓 Bot 蒐集討論與文件、整理提示，再交給 Cursor Cloud Agents 執行程式工作。把背景調查與實作分開，有助於控制交接時的上下文量。

指南也明說 Bot 能直接寫程式與執行程式。外環協調、內環實作是可選的分工。每次派工仍要確認實際使用的沙盒、測試套件與交付證據，角色名稱無法保證這些條件已設定。

Lingxi Li 在 2026-09-10 的 [Grok Bot for Engineering](https://x.ai/bot/guides/grok-bot-for-engineering) 描述專職 Bot 管理 Cloud Agents、檢查執行過程與證據的實務。檢查 PR 的頻率、哪些情況自動合併、如何開例會，都是該作者配置的流程，不是建立 Bot 後自動取得的預設行為。

交接時，我會記錄目標、版本與放行範圍。這份任務卡可作為起點，欄位是採用建議，不是產品設定格式：

```text
目標：在指定 repository 修復已重現的錯誤
輸入：問題描述、必要文件、目前 commit、重現步驟
可變更範圍：指定模組與測試
交付證據：diff、實際執行的測試、仍未驗證的項目
停止條件：需要新憑證、擴大資料分享或改動授權範圍時先詢問
發布權限：此任務只交付草稿，不推送、不合併、不部署
```

**交接成功不等於結果正確。** 測試通過只能支持測試涵蓋的情境；協調者仍需核對需求、差異與未執行的檢查，不能把 worker 的自述當成驗收證據。

## 個人 Bot 共用電腦，共享 Bot 另看對話情境

[Teams and enterprises](https://docs.x.ai/grok-bot/teams-and-enterprises) 描述的標準模式，是每位使用者有一台持久 Firecracker microVM，同一使用者的 Bots 共用該電腦。硬體隔離的主要單位是使用者，不是使用者建立的每個 Bot。Bot 101 也提醒，某個 Bot 登入網站後，其他 Bot 可以使用那份登入。

因此，為「研究」與「財務」各建一個 Bot，可以分開對話焦點，卻不能據此認定它們讀不到彼此可觸及的檔案或 browser session。如果需要不同憑證與電腦邊界，應依官方支援方式使用分開的使用者／電腦配置，而不是只改 Bot 名稱或 Prompt。

這項描述也有情境限制。共享 Bot 在私人對話與群組脈絡下的執行電腦可能不同。文件說明私人對話通常使用該成員的電腦，群組則使用共享 Bot 的電腦。擁有人或 Manager 加給共享 Bot 的 secrets、apps 與檔案，可在每位隊友的對話中使用。部署前應先確認「這個任務究竟在哪台電腦、以誰的登入執行」，不要用單一使用者模式概括所有共享情境。[共享環境說明](https://docs.x.ai/grok-bot/teams-and-enterprises)

另一個容易漏掉的狀態是刪除。安全文件說明檔案與 browser sessions 使用持久儲存，刪除 Bot 不會一併清除它們。若目標是移除存取能力，應核對實際登入、整合授權與資料保存狀態，不能把「刪掉角色」當成「撤銷憑證」。[Security](https://docs.x.ai/grok-bot/security)

## Reviewer 的動作覆蓋範圍需要逐項確認

官方 [Security](https://docs.x.ai/grok-bot/security) 將 Auto Review 描述為獨立模型對風險操作進行評估，涵蓋 shell、app calls、computer use、排程修改與派工。它與作業系統隔離是不同控制，啟用與強制範圍要依帳號及管理設定確認。

文件明列覆蓋限制，包括記憶寫入與多數設定變更等效果不在相同審查路徑內；對 prompt injection 的防護也只是降低風險，並非消除風險。自然語言 Ask first／Allow automatically 規則能表達意圖，但仍依賴模型正確解讀與實際工具路徑的執行。

網路控制還要分開檢查。下述 Network Controls 為文件列出的 Enterprise 功能，不能假定個人或 self-serve Teams 帳號也有。封鎖 connector 不等於封鎖其網站，網站／網路限制也不能推論成所有整合都被停用。安全文件指出，網路 allowlist 不會自動涵蓋 remote MCP，必須另啟用「Apply to MCP servers」。[Security 的限制與網路設定](https://docs.x.ai/grok-bot/security)

因此，下列是部署建議，而不是產品已自動完成的保證：

- 測試不允許的外部寫入是否真的被擋住，並分別檢查 browser、connector、shell 與 MCP 路徑。
- 用測試資料演練惡意網頁／文件要求擴權的情境，確認內容不會被誤認為使用者授權。
- 讓任務在需要新資料接收者、不同帳號或額外付款時停下來，記錄人類實際批准的範圍。

**讀取不等於沒有資料傳輸。** 搜尋查詢、模型請求、遠端工具參數或上傳附件，都可能把資料帶到另一個服務。是否能讀來源、是否能把內容交給目的地，以及是否能對外提交，應各自判斷。

## Vault 隱藏秘密值，交易核准仍要另查

原文把密碼、passkey、驗證碼與付款統一寫成「必定交還螢幕給人」，不符合現行文件的不同流程。[Vault](https://docs.x.ai/grok-bot/vault) 文件標示 Vault 需 0.75.2 或更新版本；Secure Forms 可把輸入填到指定網站而不把秘密值顯示給 Bot；未支援的步驟，例如部分 passkey、SSO 或驗證流程，才交由成員接手。網站寄來的一次性驗證碼則可由 Bot 從已連接的收件匣取得，不一定需要接手。API key 使用安全 secret card，而不是普通對話。

這些機制解決的是秘密如何輸入與保存，不能當成授權規則的同義詞。Vault 是帳號層級的資源，browser 登入也可能被同帳號的其他 Bots 使用；文件另說明 shared Bots 不支援 Vault。2026-11-06 查核的 Grok Bot 安全文件說明，已保存的付款卡在 checkout 使用時，不會每次另問一次核准，想逐筆確認的成員不應保存卡片。這是該產品當時的具體限制，不能類推其他助手或付款工具。[Vault 範圍](https://docs.x.ai/grok-bot/vault)、[安全文件的付款說明](https://docs.x.ai/grok-bot/security)

「藏住卡號」本身沒有提供逐筆交易確認，也沒有擴大原任務的付款授權。若工作必須要求逐次核准，就應先驗證可用的操作審查與付款路徑確實符合要求；不符合時，不要因為卡片放在 Vault 就假定已有保護。

## Template 發布前檢查文字內容與外部動作

Matt Palmer 在 2026-09-08 的 [Templates for Grok Bot](https://x.ai/bot/guides/templates-for-grok-bot) 用「食譜」說明 Template：可重用指令、相關記憶、技能與選定整合，不是複製已完成工作的整台環境。該指南說明自訂程式／腳本與非標準 MCP server 內容不會隨模板直接帶走，接收者需要重新安裝相關 plugins。

舊指南說明預設會排除私密內容，現在的文件則仍要求分享者自行檢查。2026-10-28 的 [Bots 文件](https://docs.x.ai/grok-bot/bots) 說明，公開 Template 連結會暴露 Bot 身分、描述、skills 與 routines，並明確要求分享者先移除 API key、內部網址、客戶資料等不適合公開的內容。接收者不會得到發布者的電腦、登入或對話歷史。

這裡有三個不同的檢查對象：

1. 內容：指令、技能、描述、例子與排程參數是否含有內部資訊。沒有附帶登入，不代表文字中沒有秘密或個資。
2. 依賴：模板是否引用接收者沒有的插件、檔案、程式或服務。需要重新安裝／設定整合，不等於每一個整合在每次匯入時必定重新走 OAuth。
3. 行為：例行工作是否可能寄信、分享檔案、呼叫外部 Agent 或付款。複製工作流程並不自動取得這些動作的授權。

分享前檢查實際預覽與輸出內容。匯入後先以測試資料確認技能、排程及外部接收者。不要直接用生產帳號試跑未知模板，也不要把舊版教學中的按鈕位置當成現行介面保證。[Template 指南](https://x.ai/bot/guides/templates-for-grok-bot)、[目前 Bot 文件](https://docs.x.ai/grok-bot/bots)

## 下一步：用一個小任務驗證三條邊界

後續的工程與團隊案例可提供配置靈感。試行時挑一項只需測試資料、沒有外部提交的小任務，記錄：

- 執行邊界：在哪台電腦，會觸及哪些檔案與登入。
- 操作邊界：哪些動作經過 Reviewer，哪些另由工具、網路或人類把關。
- 分享邊界：哪些資料會送往哪些服務，模板輸出又包含什麼。

任一項還無法確認，就縮小任務與權限，再重跑對應的拒絕案例。保留實際使用的帳號、設定與結果，作為下次擴大範圍的依據。
