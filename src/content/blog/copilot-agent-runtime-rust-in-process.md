---
title: "Copilot Agent Runtime 改寫成 Rust，真正移除的是 SDK 的 Node 子程序"
description: "拆解 GitHub Copilot agent runtime 從 TypeScript／Node.js 移植到 Rust 的原因、效能數據與漸進式驗收方法，並說明為何近 30 天的多篇報導不能直接推論成整個 Agent 產業都在遷移。"
publishDate: 2026-09-25T23:50:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - Rust
  - 系統設計
  - 技術選型
series: AI Agent 工程化與工作流實戰
seriesOrder: 25
cover: ../../assets/covers/copilot-agent-runtime-rust-in-process.png
coverAlt: "工人把笨重的空心機械外殼移開，將銅紅色的小型引擎直接裝進主機內，呈現執行核心從獨立程序移入宿主程式的邊界改變。"
---

近 30 天搜尋 AI Agent 與 Rust，文章看起來不少；但把報導去重後，最完整、可核實的生產級案例集中在同一次移植：GitHub Copilot agent runtime 從 TypeScript／Node.js 改寫為 Rust。GitHub 工程師的長文是第一手紀錄，《The Register》報導的是同一個專案，不能算成兩家公司各自遷移。JetBrains 展示的 Rat Code 則是直接用 Rust 新建一個小型 coding agent，也不是舊系統移植。[GitHub 的專案紀錄](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/)；[The Register 的報導](https://www.theregister.com/devops/2026/09/18/microsoft-agentically-ports-copilot-runtime-to-rust-for-120k/)；[JetBrains 的 Rat Code 示範](https://blog.jetbrains.com/rust/2026/09/09/rust-ai-in-practice/)

**我從這個案例得到的判斷是：重寫的關鍵不是把 TypeScript 換成 Rust，而是讓 Agent runtime 從必須另開 Node 程序的 CLI，變成可嵌入宿主程式的原生函式庫。**Rust 是達成低啟動成本、低常駐記憶體和跨語言呼叫的選擇；它不是單獨解釋所有效能差距的答案。

## 多篇文章說的是同一個移植案例

GitHub 在 2026 年 9 月 16 日發布工程師 Stephen Toub 的第一手紀錄，並於 9 月 23 日更新。《The Register》兩天後報導同一件事，補充成本與回歸問題。兩篇來源能讓我們交叉理解專案，但不是兩個互相獨立的產品遷移案例。[GitHub Blog](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/)；[The Register](https://www.theregister.com/devops/2026/09/18/microsoft-agentically-ports-copilot-runtime-to-rust-for-120k/)

另一種常被混在一起的案例，是新建 Rust Agent。JetBrains 9 月 9 日介紹的 Rat Code 是一個小型終端 coding agent，以 Rust 的 Rig 管理模型與工具、以 Ratatui 呈現終端介面；示範包含讀寫檔案、執行 shell、串流回應和工具呼叫復原。它證明 Rust 可以作為 Agent 應用的實作選項，卻沒有證明一個既有產品已把底層從其他語言遷走。[JetBrains：Rust AI in Practice](https://blog.jetbrains.com/rust/2026/09/09/rust-ai-in-practice/)

因此，這組資料能支持「Agent runtime 的 Rust 化開始有具體案例，也出現 Rust 原生 Agent 示範」，還不能支持「多數 Agent 團隊正在把底層換成 Rust」。這是截至 2026 年 9 月 25 日的研究快照，也不是整個產業的採用普查。

## Copilot 要解決的是 SDK 每次都得多養一個 Node 程序

Copilot runtime 不只服務命令列。GitHub 說它也支援 Copilot app、SDK、Cloud Agent、VS Code、Visual Studio，以及多個 Microsoft 產品。各產品希望重用同一套 Agent loop、安全和可靠性邏輯，不必各自重做一份。[GitHub Blog，Why we needed to port](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/)

早期實作讓 CLI 的 TUI 與 Agent runtime 都在 TypeScript／Node.js 上執行。後來 SDK 需要程式化呼叫 runtime 時，CLI 加上 headless 模式，SDK 再透過 stdin／stdout 與 JSON-RPC 對它送命令。這條路先求把產品交付出去，跨語言也容易接；代價是每個 SDK consumer 都要啟動另一個 CLI 程序，載入 Node 與 V8，並在宿主和 runtime 之間傳送事件與訊息。

當時 SDK 有 TypeScript、Python、Go、C#、Java 和 Rust 版本。GitHub 表示，除了原本的應用執行環境，每個 consumer 還得多帶一份 Node 或內含 V8 的 binary，working set 至少約 100 MB；部署方也要監控、除錯兩個程序。這些成本對互動式 CLI 尚可接受，對需要快速啟動、承載大量 session、控制每個服務常駐記憶體的 host 就更顯眼。[GitHub Blog，原文的 SDK 與程序邊界說明](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/)

目標因此不只是逐檔換語言，而是把 TUI 和 runtime 分層：runtime 成為可被應用嵌入的原生 library，以 C ABI 提供給不同語言的 FFI；Node 端也能透過 N-API 載入它。仍需要程序隔離時，runtime 也保留 server 模式與 socket／標準輸入輸出等路徑。Rust 讓這組封裝方式可行，但工程收益來自「共用 runtime 同時可程序內執行」，不是所有情境都必須放棄程序邊界。[GitHub Blog，Interop](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/)

## 效能提升對應的是特定負載與部署方式

GitHub 的測試刻意使用本機 deterministic completion server，固定模型回覆並排除推論與網路延遲，測量啟動、建立 session、事件傳遞、持久化和 teardown 等 runtime 工作。這使數字能聚焦在本次更動，但不代表真實使用者等待一個遠端模型回覆時，整體請求也會快上相同比例。[GitHub Blog，Perf, perf, and more perf](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/)

在一個共享 client、100 個並行 pipeline 執行 1,000 次 one-turn session lifecycle 的壓測中，原本 TypeScript CLI 約每秒完成 7.55 次；Rust 仍以程序外方式執行時約 57.45 次；Rust 程序內執行時約 120 次。官方特別提醒，這是該工作負載的結果，不能改寫成「Rust 一定快 15.9 倍」。因為比較同時改了實作語言和程序邊界，數據顯示的是整個 runtime 架構在這個負載下的改善，無法只歸功於 Rust 編譯器。

記憶體數字也需連同測量方式看。十個 client 批次中，相對於基線增加的 private resident memory，TypeScript 程序樹為 1,383 MB，Rust 程序外模式為 247 MB，Rust 程序內模式為 126 MB；最後一種比原先少約 91%。這特別有利於共享 runtime、密集建立 session 的服務端部署。若應用本來就只開一個長期存活的 CLI，收益可能完全不同。[GitHub Blog 的負載、throughput 與記憶體細節](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/)；[The Register 的摘要](https://www.theregister.com/devops/2026/09/18/microsoft-agentically-ports-copilot-runtime-to-rust-for-120k/)

選型時應拆開三個變因：語言實作、是否共用同一 runtime、是否跨程序呼叫。若直接把 TypeScript child process 改成 Rust 程序內 library，卻只回報一個「Rust 快了幾倍」，就會把語言和架構邊界的影響混在一起。

## Agent 加快了逐步移植，卻沒有替代行為驗收

GitHub 的初始估算約 13 萬行 TypeScript；由於 TUI 與 runtime 原先糾纏、同期也持續加入功能，作者估計最終約有 43 萬行 production TypeScript 經過移植。8 月 21 日完成時，runtime 有 832,378 行 production Rust 和 468,689 行 Rust unit tests，原有 174,675 行 TypeScript end-to-end tests 仍保留。主分支在 14.5 週內經過 128 個移植 PR，並發布 135 次版本；不是把新 runtime 長時間放在分支上，最後一次切換。[GitHub Blog，porting strategy 與程式碼規模](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/)

他們採取的是逐元件、原地替換：移植期間以暫時互通層連接尚未移植的 TypeScript；每個 PR 合併時，則用呼叫 Rust 的薄層取代舊模組，並在同一變更中移除該模組的 TypeScript 實作。每個 PR 盡量只處理一個可審查的切片，CI 跑既有 CLI 與 SDK end-to-end tests，發布後再由實際 consumer 使用。這保持主分支可交付，也縮小單次變更與回歸的關聯範圍。對高度共享狀態的 Agent session orchestration，團隊避免長期維護兩份可切換實作，因為讓兩種語言的狀態與呼叫路徑永遠同步，本身也會增加複雜度。[GitHub Blog，in-place porting strategy](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/)

這次移植由 Agent 寫出大部分程式碼，但這不會自動產生正確性。GitHub 工程師記錄了功能缺漏、語意差異、分支漂移和生命週期等回歸；有些問題能編譯，也未必會被現有測試發現。作者指出，多數功能缺漏類回歸與 end-to-end 測試不足有關，並強調移植時不能順手把原本的驗收 oracle 也一起重寫。編譯器可以攔下型別與記憶體安全類問題，無法判斷新程式是否仍保留舊產品的行為。[GitHub Blog，Lessons learned](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/)；[The Register 對 compiler 與 regression 的報導](https://www.theregister.com/devops/2026/09/18/microsoft-agentically-ports-copilot-runtime-to-rust-for-120k/)

成本也不該簡化成「AI 花 12 萬美元就重寫了產品」。作者估算 token 使用費約 120,000 美元；他以移植 PR 約佔自己全部 PR 的 20% 推估出約三週投入時間，並說明這只是近似算法。其他工程師負責多語言 FFI、Rust binary packaging、建置改善和 PR review。這是一個以 Agent 擴大程式碼吞吐量、同時由團隊建立邊界、工具鏈、測試與發布節奏的專案，不是無人維護的自動轉譯。[GitHub Blog，What the port cost](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/)；[The Register](https://www.theregister.com/devops/2026/09/18/microsoft-agentically-ports-copilot-runtime-to-rust-for-120k/)

## 動手換底層前，先證明要移除的成本真的存在

若自己的 Agent 服務也在評估 Rust，先把工作拆成能驗收的實驗：

1. **量出程序邊界成本。** 分開記錄啟動時間、空閒記憶體、session throughput、並行度與程序數。固定模型與網路，先確認瓶頸真的在 runtime／process startup，而不是模型推論或遠端 API。
2. **定義不變的行為契約。** session 建立與結束、取消、工具呼叫、權限 callback、事件順序、檔案與錯誤語意都列入驗收。保留獨立於新實作的 end-to-end tests，讓新舊差異可被指出，而不是靠編譯成功判定完成。
3. **小切片移植並逐步曝光。** 為每個切片設計清楚 API 和回退點，CI 驗證舊契約，再從內部 consumer 或少量流量開始。出現回歸時，能定位最近變更並回到已知版本。
4. **把維運成本一起算進去。** 評估跨平台 binary packaging、ABI 與 FFI 維護、建置時間、crash 診斷和 on-call 團隊熟悉度。若團隊沒有人能解釋 Rust 邊界，Agent 生成得再快也不能取代事故時的責任。

停止規則可以簡單寫成：如果實測沒有證明 runtime 或程序邊界是主要成本，或加速後沒有人能負責部署、除錯與回滾，就先不做整體移植。先把一條代表性路徑在相同工作負載下做基線，再試一個可逆的嵌入式切片；只有效能、行為相容和維運責任三者都能通過驗收，才擴大到下一個模組。

這也和站內談 DHH 為 HEY 新版選擇 Rust 郵件後端的文章有關，但問題不同：新產品架構採用 Rust，不能和把既有 Agent runtime 從 Node 子程序改成可嵌入原生 library 混為一談。[DHH 的 Rails World 工程取捨](/blog/dhh-rails-world-agentic-rust-rails/)

### 參考資料

- [Migrating the GitHub Copilot runtime to Rust, using Copilot](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot/)，GitHub Blog，2026-09-16，更新於 2026-09-23。
- [Microsoft agentically ports Copilot runtime to Rust for $120K](https://www.theregister.com/devops/2026/09/18/microsoft-agentically-ports-copilot-runtime-to-rust-for-120k/5297549)，The Register，2026-09-18。
- [Rust AI in Practice: Building LLM Applications With Rig](https://blog.jetbrains.com/rust/2026/09/09/rust-ai-in-practice/)，JetBrains，2026-09-09。
