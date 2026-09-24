---
title: "Agent 要能並行，先把工作變成可驗收結果"
description: "從 GrokBot 的 Dune 架構轉述，拆解程式庫、靜態檢查、規則、Skills 與 Style Guide 的責任，並用一條低風險工作線驗證何時該增加 Agent 授權。"
publishDate: 2026-09-24T10:04:30+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
  - 軟體品質
cover: ../../assets/covers/agent-code-garden-verifiable-work.png
coverAlt: "中央是沿幾何支架修剪成形的常綠樹籬，左側纏繞藤蔓已被剪除，右側花園小徑清楚通往可辨識的節點。"
series: AI Agent 工程化與工作流實戰
seriesOrder: 23
---

2026-09-24，Kieran Zhang 的 [X 貼文](https://x.com/ninthbit_ai/status/2102809969070575802)連到一篇談 GrokBot 工程工作的 [X Article](https://x.com/i/article/2102795423052419072)。他把近四十分鐘的分享整理成三個問題：如何讓人信任 Agent、怎麼把程式庫做得更適合 Agent 工作，以及為什麼要像園丁一樣清理重複的 workaround。

原文標題提到每月 2,500 個 PR，但摘要沒有交代計算區間、驗收率或返工比例。這個數字不能單獨證明工程產能或品質，因此本文聚焦在可移植的控制方法。原文提到的 Dune 五層是作者對演講的轉述，以下不把它寫成 GrokBot 的官方規格。

我的立場是：**只有當每個任務都有不靠 Agent 自評的驗收方式，才該增加它能同時處理的工作量。**

## 驗證先回答「什麼算完成」

原文把 verification skill 描述成教 Agent 怎麼驗證成果：啟動本機服務、用 Chrome DevTools 開啟頁面與操作控制項、查看效能追蹤，再保存畫面快照。它也提出 feature map，讓 Agent 知道產品有哪些功能，才能從使用者回報推理出該走哪些驗證路徑。

這兩項材料負責不同工作。Feature map 說明有哪些入口、狀態與功能；verification skill 說明怎麼走過這些路徑、觀察什麼訊號，以及失敗時如何回報。若只叫 Agent「跑完測試」，測試通過可能只代表程式能啟動，不能證明使用者回報的問題已修好。

每項任務開始前，先寫下這幾個欄位：

```text
功能與路徑：使用者從哪裡進入，會經過哪些狀態？
成功條件：使用者最後應看到或完成什麼？
失敗條件：哪些結果代表仍未修好？
驗證方式：要跑哪個檢查、操作哪個頁面，或查看哪項證據？
停止條件：遇到什麼資料缺漏或風險時，Agent 必須停下來？
```

xAI 截至 2026-09-14 更新的 [Grok Bot Skills 文件](https://docs.x.ai/grok-bot/skills-routines-and-automations)也要求 Skill 說明如何驗證結果、如何處理失敗與哪些操作需要批准，並建議先用安全案例測試，再把流程交給背景 Routine。產品不同，原則相同：可重跑的步驟還要帶著驗收條件，否則只是把猜測保存下來。

## Dune 的五層，各自處理不同缺口

Kieran 將分享中的 Dune 分成 `codebase`、`static analysis`、`rules/bugbot`、`skills` 與 `style guide`。他認為由上往下，對 Agent 的約束力與友善度逐漸降低。工程上可以把這個順序讀成：越上層越接近程式庫的真實狀態或可直接執行的檢查；越下層越需要模型或審查者自行解讀。

### 1. Codebase：讓專案本身說明規則

目錄、型別、測試、介面與既有實作，是 Agent 能在任務中直接讀到的專案脈絡。若一項重要規則只存在於 Slack 或某位工程師的記憶裡，Agent 就無從依它行事。

OpenAI 在 2026-02-11 分享的 agent-first 工程經驗也把 repository-local 文件當成知識來源，並用 CI 檢查文件是否過期、缺少連結或結構不一致。這是另一個團隊的實作案例，不能證明 Dune 的細節，但支持同一個判斷：重要知識要放在 Agent 能找到、團隊也能驗證的位置。[OpenAI：Harness engineering](https://openai.com/index/harness-engineering/)

### 2. Static analysis：把可判定的要求變成檢查

格式、型別、lint、compiler、單元測試與 CI 適合攔下有明確判準的錯誤。檢查必須能重跑，結果也要能指向失敗的檔案或條件；只有描述「要寫好程式」的規則，不能取代它。

若 PR 必須通過某項檢查才能合併，就把它設成 repository 的 required status check。GitHub 截至 2026-09-24 查閱的 [branch protection 文件](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)說明，受保護分支可以要求狀態檢查通過後才允許合併。這才是平台能拒絕的閘門；單獨一則 Bugbot 評語或 Agent 自述「測試已完成」都不是。

### 3. Rules 與 Bugbot：補上檢查還看不懂的脈絡

有些要求需要知道任務背景，例如哪些相容性不能破壞、哪種資料不能寫入日誌、遇到特定目錄時該找哪份文件。Rules 可以提供短而具體的條件；Bugbot 可以指出可疑 diff，協助人類把注意力放在高風險處。

但只要一條規則沒有被測試或平台設定強制執行，它就仍是提醒。遇到反覆違規，應判斷能否把條件改成測試、型別或 required check，而不是不斷加長規則檔。

### 4. Skills：保存已經驗證過的做法

Skill 適合描述工作順序、必需輸入、驗證步驟與停止條件。先由人或 Agent 跑通一個真實案例，再保存為可重跑流程；不要把一次成功的對話直接當成可靠作業程序。

如果 Skill 只留下工具指令，沒有說明如何判斷成功，重跑時就會把同一種錯誤包裝得更熟練。它應讓下一個執行者交付證據，而非只回報「完成」。

### 5. Style Guide：留下需要判斷的偏好

命名、語氣、抽象程度與可讀性常有多種合理選擇，適合由短小、有例子的 Style Guide 協助 Agent 靠近團隊習慣。若這些偏好真的不能被違反，再想辦法設計可檢查的規則；否則應承認它是審查判斷，不要假裝文字能自動執行。

## 把程式花園裡的 workaround 清掉

原文轉述的「園丁」比喻指向一個常見累積效應：Agent 容易沿用附近已有的模式；若上一個任務留下臨時繞路，後續修改可能複製它，再產生更多相似分支。這是對程式庫的維護責任，不只是提示詞的維護責任。

原文也提到演講者曾在自己的 Bot 專案禁止 Agent 寫註解，因為她觀察到註解常被拿來合理化 workaround。這是特定專案的選擇，不適合直接變成所有團隊的規則。註解若只重述程式碼，確實可能增加噪音；若它記錄不變條件、相容性限制或非顯然的決策理由，刪掉反而會讓下一個維護者更難判斷。

可以採用更窄的清理準則：若註解是在解釋為何暫時跳過檢查，就把缺少的檢查補上；若同一 workaround 出現多次，就找出共同根因並移除重複路徑；若限制是系統不變條件，就用測試或型別保護它，再留下必要的理由。園丁要移除的是錯誤範例，不是所有說明。

## 用一條低風險工作線測試信任

先選一種重複、可逆、容易觀察結果的任務，不要從新增一群 Agent 開始：

1. 記錄目前人工完成時的步驟、常見錯誤與驗收時間，作為比較基準。
2. 用 feature map 寫出受影響的功能路徑與關鍵狀態，替每條路徑指定驗證方式。
3. 把驗證方式做成 Skill 或專案內指引，讓 Agent 可以啟動環境、執行檢查並保存輸出。
4. 讓 Agent 在明確的檔案與權限範圍內完成任務，交付 diff、檢查結果，以及需要時的頁面快照或追蹤資料。
5. 由獨立檢查或人類確認結果，再記錄返工原因；每次失敗都歸到程式庫、檢查、規則、Skill 或判斷偏好其中一層。

比較人工修正次數、驗證失敗類型、審查花費時間與回退情況，比只比較 PR 數量更能看出工作流是否可靠。要提高並行度，先確認同一類任務在代表性案例裡能穩定通過驗收，而且出錯時能看見明確訊號；不必追求永遠零錯誤，但不能把錯誤藏在 Agent 自己的結論裡。

若驗收路徑尚未定義，任務就先維持在有人監看的範圍。若同一種錯誤反覆出現，先把它移到最能阻止錯誤的那一層，再考慮擴大授權。

## 下一步：替最常見的 Agent 任務寫一張驗收地圖

挑一個最近常交給 Agent 的任務，列出使用者路徑、成功與失敗狀態、獨立驗證方式和停止條件。先讓一個 Agent 跑這條路徑，保留檢查輸出，再決定哪些要求值得變成自動化閘門。

如果下一個問題是多個 Agent 的工作狀態、任務 owner 與 review 排程，可接著讀[多個 Coding Agents 如何組成工程管理迴路](/blog/grok-bot-engineering-control-plane/)。若要從任務契約、狀態、權限與 trace 建立完整 Harness，參考 [Harness Engineering 的七個控制面](/blog/harness-engineering-for-reliable-agents/)；本文聚焦於開始並行之前，如何讓程式庫與驗收路徑先變得可檢查。

### 參考資料

- [Kieran Zhang：原始 X 貼文](https://x.com/ninthbit_ai/status/2102809969070575802)
- [Kieran Zhang：GrokBot 一個月 2,500 PRs 的 X Article](https://x.com/i/article/2102795423052419072)
- [xAI：Skills and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations)，更新於 2026-09-14
- [GitHub：About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [OpenAI：Harness engineering](https://openai.com/index/harness-engineering/)，發布於 2026-02-11
