---
title: "GitHub 週榜前十：資料與代理工具"
description: "2026 年 11 月 9 日 GitHub Trending 週榜前十名，保留官方順序與兩種星數，查核 Auto Ontology、Claude-Mem、Worktrunk 等專案的工程用途、近期版本、資料流與授權限制。"
publishDate: 2026-11-09T09:12:07+08:00
draft: false
featured: false
tags: [開源專案, AI Agent Workflow, 技術選型]
series: GitHub 熱門專案週報
seriesOrder: 2
cover: ../../assets/github-weekly-2026-11-09.webp
coverAlt: "2026 年 11 月 9 日 GitHub 週榜前十名，深綠雙欄封面左側為第 1 至 5 名、右側為第 6 至 10 名，每項列出專案名稱與以 k 簡寫的累積 stars。"
---

這週榜首 NVIDIA/auto-ontology 處理資料庫的業務語意，第三名 Worktrunk 管理並行開發的 Git worktree。榜上也有紫微斗數排盤引擎與網頁擷取工具。讀這份榜單，可以把注意力放在三件具體的事：資料如何進來、代理能執行哪些動作，以及哪些成果可以重用。

Claude-Mem、T3 Code 與 Hallmark 延續了[上期週榜](/blog/github-weekly-2026-11-02/)的熱度，但文件和版本已經有變化。Claude-Mem 現在預設保留工具截圖，T3 Code 的權限文件則明寫初始預設為 Full access。這些設定，比再多一個介面功能更值得在試用前確認。

## 榜單與查核時間

[GitHub Trending 官方週榜](https://github.com/trending?since=weekly)於 2026-11-09 08:59:45（Asia/Taipei，UTC 00:59:45）擷取，選項為 Spoken Language: Any、Language: Any、Date range: This week。以下依當次頁面前十名原始順序，不依累積或新增星數重排。官方沒有標示精確週期起訖，這裡沿用頁面的 This week。

兩種星數來自同一次快照。封面顯示累積 stars，除以 1,000 後四捨五入到一位小數，再移除結尾的 .0，例如 50,970 顯示為 51k。正文保留整數。

專案資料於 11 月 9 日另行查核，涵蓋官方 README、相關文件、授權檔及近期 GitHub Releases，可能晚於榜單擷取。文中 release 日期統一採 UTC，榜單擷取與文章發布時間採 Asia/Taipei。以下試用方式是工程建議，這次沒有安裝或執行十套工具，也沒有重跑維護者的效能與安全測試。

## 1. NVIDIA/auto-ontology：讓 SQL 查詢帶上業務定義

累積 10,396 stars；本週新增 9,327。

[Auto Ontology](https://github.com/NVIDIA/auto-ontology) 先讀資料表結構、欄位樣本與查詢歷史，整理術語、同義詞、欄位對應和資料關聯，再讓人修訂與認證。查詢時，代理檢索這些語意資料，產生與檢查 SQL，並回傳 SQL 與推理步驟。適合研究企業資料中「營收」「客戶」等詞彙如何對應到可追溯的查詢。

可以用官方銷售範例建立小型驗收集：一題有明確 SQL 答案，一題需要不存在的廣告支出資料，分別檢查答案和拒答。部署則要另外看待。README 要求 3001、3002 連接埠留在私有網路，後端信任前端轉送的使用者身分，ingestion 的修改端點沒有自己的認證。從 UI 加入的連線若未完整設定 Vault，密碼會以明文存於 catalog Postgres。選配 KumoRFM 還涉及上傳連接的資料表，不能只看首頁的本機啟動指令。

程式採 Apache-2.0。查核時沒有 GitHub release，試驗應固定 commit 與模型設定。來源：[README](https://github.com/NVIDIA/auto-ontology/blob/main/README.md)、[連線與 Vault](https://github.com/NVIDIA/auto-ontology/blob/main/docs/connections.md)、[MCP 文件](https://github.com/NVIDIA/auto-ontology/blob/main/docs/mcp.md)、[授權](https://github.com/NVIDIA/auto-ontology/blob/main/LICENSE)、[Releases](https://github.com/NVIDIA/auto-ontology/releases)。

## 2. thedotmack/claude-mem：記憶也包含資料保留設定

累積 114,903 stars；本週新增 6,443。

[Claude-Mem](https://github.com/thedotmack/claude-mem) 以 hooks 收集代理活動，由 observer 產生觀察與摘要，存入 SQLite，並結合全文與語意搜尋。後續工作先載入精簡索引，再按需要取得細節。適合檢查跨工作階段能否找回已做過的決策，而不是每次重述整個專案。

11 月 8 日發布的 v15.12.1 修正 macOS 12 SQLite 寫入等問題。更影響資料管理的是 v15.12.0：工具圖片與截圖預設保留為本機 WebP，關掉 Keep images 只會停止新增，不會刪除舊圖。雲端同步與把圖片送入 observer 推論各自需要啟用，observer 的文字處理仍可能使用外部供應商，匿名分析預設開啟。試用可用一個無機密專案，核對新工作階段找回的摘要、實際保存的影像與清除方式。

目前公開核心採 Apache-2.0，官方另區分 hosted、team、enterprise 的私有實作。來源：[README](https://github.com/thedotmack/claude-mem/blob/main/README.md)、[授權範圍](https://github.com/thedotmack/claude-mem/blob/main/docs/ip-boundary.md)、[LICENSE](https://github.com/thedotmack/claude-mem/blob/main/LICENSE)、[v15.12.0](https://github.com/thedotmack/claude-mem/releases/tag/v15.12.0)、[v15.12.1](https://github.com/thedotmack/claude-mem/releases/tag/v15.12.1)。

## 3. max-sixty/worktrunk：把工作樹建立與收尾一起管理

累積 12,121 stars；本週新增 2,313。

[Worktrunk](https://github.com/max-sixty/worktrunk) 用分支名稱操作 Git worktree，串接建立、切換、hooks、PR 檢出與合併收尾。它適合已經同時開幾個代理任務，卻常花時間處理工作目錄、開發伺服器和快取的人。底層仍是一般 Git worktree，可以直接檢查每份修改。

10 月 20 日 v0.81.0 改了 hooks 的輸入與執行行為，包括移除 stdin 的 JSON context。官方也提醒 hooks 同時寫共用檔案或操作同一工作樹時會競爭。專案 hooks 有首次與變更後的核准流程，使用者 hooks 不需要相同核准，`--yes` 也能略過提示。試用宜在可丟棄的 repository 開兩項小功能，刻意分開服務連接埠，檢查合併和清理是否連忽略檔案一起移除。

授權可選 MIT 或 Apache-2.0。工作樹隔離的是工作目錄，共用資料庫與 hooks 副作用仍要自行安排。來源：[README](https://github.com/max-sixty/worktrunk/blob/main/README.md)、[hooks](https://github.com/max-sixty/worktrunk/blob/main/docs/src/content/docs/hook.md)、[授權](https://github.com/max-sixty/worktrunk/blob/main/LICENSE)、[v0.81.0](https://github.com/max-sixty/worktrunk/releases/tag/v0.81.0)。

## 4. anthropics/skills：把可重複工作整理成技能

累積 189,656 stars；本週新增 3,169。

[Anthropic 的 skills](https://github.com/anthropics/skills) 用 SKILL.md、腳本、參考資料與素材包裝一項工作。技能描述用於判斷何時啟用，詳細規則與資源則按需要載入。文件處理、設計與測試範例，適合拿來研究哪些步驟應寫成明確指令，哪些適合交給確定性腳本。

可從不含個資的 PDF 表單或報表範例開始，固定輸入與期待欄位，比較有無技能時的結果。skill-creator 文件要求測試提示、基準比較與人工檢查，README 也把範例定位為教學展示，提醒正式產品行為可能不同。技能會使用宿主給的工具權限，導入前仍需閱讀腳本與依賴。

目前 README 與各自的 LICENSE.txt 已將 docx、pdf、pptx、xlsx 四項文件技能列為 Apache-2.0，不宜沿用較早的 source-available 說法。授權仍按資料夾與附帶素材核對。查核時沒有 GitHub release。來源：[README](https://github.com/anthropics/skills/blob/main/README.md)、[skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)、[PDF 技能](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md)、[docx](https://github.com/anthropics/skills/blob/main/skills/docx/LICENSE.txt)、[pdf](https://github.com/anthropics/skills/blob/main/skills/pdf/LICENSE.txt)、[pptx](https://github.com/anthropics/skills/blob/main/skills/pptx/LICENSE.txt)、[xlsx 授權](https://github.com/anthropics/skills/blob/main/skills/xlsx/LICENSE.txt)、[Releases](https://github.com/anthropics/skills/releases)。

## 5. Donchitos/Claude-Code-Game-Studios：用遊戲開發檢查代理分工

累積 37,010 stars；本週新增 5,235。

[Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) 是 Claude Code 遊戲開發範本，提供角色分工、技能、路徑範圍規範與不同嚴謹度的流程。它要接到實際引擎與專案，角色數量本身無法證明遊戲品質。比較有參考價值的是 minimal、standard、full 如何調整文件與驗證成本。

試用可以只做一個 Godot 可玩功能，留下啟動畫面與操作結果。官方特別區分語法檢查和真的能玩，畫面功能仍需實際觀察。10 月 19 日 v1.2.0 縮小了多項技能的 Bash 預先授權範圍。設定文件要求從專案根目錄啟動，否則 hooks 與權限規則可能沒載入；auto-accept 模式下，自然語言的「先詢問」也不是強制阻擋。

專案採 MIT。導入前可對照 Python、Bash、引擎編輯器與宿主權限模式，避免把範本的流程要求當成已執行的檢查。來源：[README](https://github.com/Donchitos/Claude-Code-Game-Studios/blob/main/README.md)、[環境要求](https://github.com/Donchitos/Claude-Code-Game-Studios/blob/main/.claude/docs/setup-requirements.md)、[授權](https://github.com/Donchitos/Claude-Code-Game-Studios/blob/main/LICENSE)、[v1.2.0](https://github.com/Donchitos/Claude-Code-Game-Studios/releases/tag/v1.2.0)。

## 6. milind-soni/OpenMausBot：代理團隊背後的執行與資料去向

累積 18,263 stars；本週新增 7,621。

[OpenMausBot](https://github.com/milind-soni/OpenMausBot) 讓不同 bot 使用各自的對話、模型與電腦，介面連到管理 CLI 行程的 harness，再把各供應商事件轉成一致格式。適合研究多人格代理的工作如何交接、事件如何保存，以及本機、虛擬機與雲端電腦如何分工。

11 月 8 日 v0.1.149 調整大量委派時的佇列等待，並加入自架伺服器借用桌面資源時的明確分享選項。試驗可只給兩個 bot 一個無機密資料夾，逐項查看交接紀錄與命令核准。local-first 仍會連到選定的模型、應用整合與雲端服務；終端設定文件也明寫 API keys 存在明文檔案，Unix 的擁有者權限限制不等於加密。

核心採 Apache-2.0，`enterprise/` 則是另外的 source-available 授權，正式使用需要組織授權金鑰，再散布與代管另有限制。來源：[README](https://github.com/milind-soni/OpenMausBot/blob/main/README.md)、[終端設定](https://github.com/milind-soni/OpenMausBot/blob/main/docs/cli-onboarding.md)、[授權分界](https://github.com/milind-soni/OpenMausBot/blob/main/LICENSING.md)、[核心授權](https://github.com/milind-soni/OpenMausBot/blob/main/LICENSE)、[enterprise 授權](https://github.com/milind-soni/OpenMausBot/blob/main/enterprise/LICENSE)、[v0.1.149](https://github.com/milind-soni/OpenMausBot/releases/tag/v0.1.149)。

## 7. pingdotgg/t3code：遠端接手前先選權限模式

累積 52,504 stars；本週新增 15,379。

[T3 Code](https://github.com/pingdotgg/t3code) 用網頁、桌面與手機操作主機上的 coding agents，保留既有供應商登入與專案環境。遠端路徑包含 T3 Connect、區域網路、Tailscale 與 SSH，適合需要離開桌面後查看工作與審查差異的人。

目前權限文件的初始預設是 Full access，允許命令與編輯略過核准提示。Claude、Antigravity 等供應端仍可能要求原生核准，fx 則不提供這個模式。更改預設也不會回寫既有對話的選擇。試用可先選受監督的模式，配對測試環境，做一項小修改後撤銷客戶端連線，核對不同連線路徑的權限是否符合預期。這比只確認手機能連上更接近實際使用情境。

專案採 MIT。穩定版 v0.1.7 於 11 月 4 日發布，包含集中管理政策、單次排程等更新。查核時另有 11 月 9 日的 v0.1.8-nightly.20261109.4392，屬預覽版，不能把其功能都算進穩定版。來源：[README](https://github.com/pingdotgg/t3code/blob/main/README.md)、[權限模式](https://github.com/pingdotgg/t3code/blob/main/docs/user/permission-modes.md)、[遠端存取](https://github.com/pingdotgg/t3code/blob/main/docs/user/remote-access.md)、[授權](https://github.com/pingdotgg/t3code/blob/main/LICENSE)、[v0.1.7](https://github.com/pingdotgg/t3code/releases/tag/v0.1.7)、[nightly](https://github.com/pingdotgg/t3code/releases/tag/v0.1.8-nightly.20261109.4392)。

## 8. Nutlope/hallmark：保留改版前後可核對的介面行為

累積 50,970 stars；本週新增 6,356。

[Hallmark](https://github.com/Nutlope/hallmark) 把設計材料、首屏確認、渲染檢查與獨立 reviewer 放進 coding agent 的工作流程。Floor 是阻擋條件，Reflex 可附理由覆寫，Finish 則處理非阻擋的細節。值得研究的是如何把模糊的美感要求拆成具體檢查，同時維持既有頁面的功能。

可以選一張已有表單的頁面，先記錄連結、欄位、事件處理與標題，改版後用 `--kept` 檢查遺漏，再實際操作提交和鍵盤焦點。靜態檢查能先跑，完整渲染還需要 Chrome 與 puppeteer-core。檔案比對無法證明後端行為或無障礙合規，這些仍是實際驗收的一部分。

程式採 MIT，材料目錄引用的 Wikimedia 照片保留各自授權與署名要求。查核時 GitHub Releases 為空，README 的 v2 是文件版本描述。來源：[README](https://github.com/Nutlope/hallmark/blob/main/README.md)、[完整技能](https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/SKILL.md)、[授權](https://github.com/Nutlope/hallmark/blob/main/LICENSE)、[Releases](https://github.com/Nutlope/hallmark/releases)。

## 9. Renhuai123/ziwei-doushu：規則引擎與資料集要分開讀

累積 16,964 stars；本週新增 4,191。

[ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu) 提供 TypeScript 紫微斗數排盤引擎、示範介面與資料集。工程上可研究曆法轉換、真太陽時、閏月與晚子時等規則如何被明確定義，以及邊界案例如何測試。輸入相同得到相同結果，只能說明實作的確定性，不能證明占星預測有效。

10 月 15 日的 v4.0-13d 是資料集版本，包含 674,976 張命盤、13 個維度共 8,774,688 段規則生成解讀。它使用的部分設定與目前引擎已有差異，重現時必須固定資料與引擎版本。公開示範能在瀏覽器排盤，但沒有線上解讀服務的後端，填入 API key 也不會補上缺少的程式。適合的測試是用合成日期檢查日界與閏月，不需要收集真實個人出生資料。

程式採 MIT，發布資料集採 CC BY 4.0；其中倪海廈引文被排除在資料集授權之外，相關目錄另標 CC BY-NC-SA 4.0，且聲明原著作權仍屬權利人。不可把整包文字一概視為可自由商用。來源：[README](https://github.com/Renhuai123/ziwei-doushu/blob/main/README.md)、[程式授權](https://github.com/Renhuai123/ziwei-doushu/blob/main/LICENSE)、[資料集授權](https://github.com/Renhuai123/ziwei-doushu/blob/main/DATASET-LICENSE)、[引文授權說明](https://github.com/Renhuai123/ziwei-doushu/blob/main/docs/tianji-ziwei/LICENSE.md)、[v4.0-13d](https://github.com/Renhuai123/ziwei-doushu/releases/tag/v4.0-13d)。

## 10. D4Vinci/Scrapling：網頁擷取與登入工作階段一起管理

累積 99,887 stars；本週新增 8,342。

[Scrapling](https://github.com/D4Vinci/Scrapling) 結合 HTML 解析、自適應元素比對、HTTP 擷取、瀏覽器工作階段與並行爬蟲。可以把允許擷取的文件網站整理成含 URL、標題與 Markdown 的語料，接入檢索流程。驗收時適合固定網域、頁數上限與正文 selector，檢查擷取品質和請求頻率。

11 月 4 日 v0.5.1 加入動態畫面觀察與拖曳操作，也改了遠端瀏覽器 API，CDP 連線改用 RemoteSession 或 AsyncRemoteSession。預設新建 context，若設定重用既有 context，就會帶入原有登入狀態。MCP 還能送出 POST、PUT、DELETE、填表與執行頁面 JavaScript，因此要按可寫入的操作介面管理權限。技術上的反爬能力不會授予存取權，網站條款、robots 設定、頻率與個資仍需逐項處理。

程式採 BSD-3-Clause，授權不涵蓋抓回來的第三方內容。來源：[README](https://github.com/D4Vinci/Scrapling/blob/main/README.md)、[RAG 文件](https://github.com/D4Vinci/Scrapling/blob/main/docs/ai/building-rag-systems.md)、[MCP 文件](https://github.com/D4Vinci/Scrapling/blob/main/docs/ai/mcp-server.md)、[授權](https://github.com/D4Vinci/Scrapling/blob/main/LICENSE)、[v0.5.1](https://github.com/D4Vinci/Scrapling/releases/tag/v0.5.1)。

## 選一項工作，留下導入前後的證據

若團隊正在做資料問答，可以優先讀 Auto Ontology 的語意認證與連線邊界。若困擾是幾個代理互相影響開發環境，Worktrunk 的 hooks 與清理流程更直接。這是依工作問題選工具，不需要一次安裝十套。

試用紀錄可保留固定輸入、預期結果、實際差異、人工修正與資料去向。能操作電腦或重用登入狀態的工具，再補一次撤銷權限測試。尚未整理代理驗收方式，可以接著讀 [AI 開發基礎導讀](/blog/ai-development-foundations-reading-path/)，把同一份小任務跑完，再決定是否擴大使用。
