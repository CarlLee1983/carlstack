---
title: "Agent 要能並行，先把工作變成可驗收結果"
description: "依 Lauren Tan 2026-09-21 的 Cursor Compile 影片，分開信任曲線、CLI 與 feature map、糾正落點，以及 Grok Bot 的 Dune 架構，並給一條把人的糾正上移到檢查的規則。"
publishDate: 2026-09-24T10:04:30+08:00
updatedDate: 2026-09-24T15:15:18+08:00
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

2026-09-21，Lauren Tan（@poteto）公開了原定在倫敦 Cursor Compile 的分享。影片約 38 分鐘。[貼文](https://x.com/poteto/status/2102050467505430555)寫上個月 2,500 個 PR。口播與開場投影片說的是 2,000 個，貢獻圖註記六個月超過 5,000 個。她沒有說明計數區間、這些 PR 是否包含自動開出的變更，或返工比例。數字只標出當時的出貨量級。

同日 Kieran Zhang 的[摘要](https://x.com/i/article/2102795423052419072)把糾正用的五層稱作 Dune。影片約 15:40 的投影片標題是 whenever you correct your agent。Dune 出現在約 26:40，指 Grok Bot 的架構。本文以這支影片為準。

我的立場是：**能同時交給 Agent 的工作量，取決於每條糾正有沒有落到不靠人記得的檢查。**

## 你看住的 Agent 數量，是信任的結果

她畫了一張示意曲線。橫軸是 Agent 數量，刻度從 1、1 到 5、5 到 10、10 到 20，再到數百與數千。縱軸是信任。這張圖沒有對照實驗。她把自己加入 Cursor 的早期放在 1 到 5。人不在對話裡，工作就停，或做完仍然是錯的。她認為這一段最難離開。信任不夠就開出一百個 cloud agent，得到的是一堆有問題的 PR。

對照的經歷是六個月前加入 Cursor，先處理 Agents Window。內部代號是 Glass。當時 PR 不斷進來，她自己看 Chrome DevTools、performance trace 與 heap snapshot，成為瓶頸。後來她改讓 Agent 自己跑應用、抓 trace、找熱點。她說每個月 2,000 個 PR 本來不是目標，出貨量是這段投資做出來的。

她把這套環境比成米其林廚房，並在口播裡劃掉 software factory。要安排的是線上廚師、設備、訓練，以及誰在收拾。成品仍由設置廚房的人負責。

## 正確性來自可重跑的 CLI 與 feature map

她把驗收放在一條光譜上。近端是 verification skill，教 Agent 把應用跑起來，用 Chrome DevTools Protocol 這類介面抓 trace 與 heap snapshot。遠端是 Lean、TLA+ 這類形式化方法。她說遠端更難，而且仍是開放問題。多數團隊走不到那裡。verification skill 已經能把「功能有沒有做對」變成收得回來的證據。

她在 Cursor 做的第一個 skill 叫 Control Glass。它後來分成兩塊，都放在 skill 目錄裡。

- CLI 每次用同一套指令啟動應用、收集 trace 與其他實測。Agent 不必在每個 session 現寫一支 script。
- Feature map 是她稱為落地的記憶，靈感來自 sitemap。它記錄有哪些功能、使用者怎麼到達、快捷鍵，以及要點的 DOM。

只有 CLI 時，Agent 開得了應用，卻讀不懂內部 Slack 上那種很小的截圖加三個問號。Feature map 補上「使用者指的是哪一個功能」。兩塊合在一起之後，Agent 既能重跑證據，也能對上內部與外部回報。她說這套控制技能變成團隊的關鍵基礎設施，而且有自動化在維護 feature map。

正確性在這裡很窄。她的例子是結帳按鈕會不會真的把購物車結掉。效能要另外看 trace 上的數字。程式怎麼寫，她交給另一組 skills。pstack 是她整理的 Cursor plugin，裝的是她自己的工程 playbook。這支影片沒有展開 plugin。

公開文件裡，同一想法寫成專案內的驗證 skill，段落是 Launch、Doctor、Drive、Evidence、Cleanup，再加上一份 feature map。[pstack 的 Verify and ship](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/06-verify-and-ship.md) 寫的是這五段。她公開的範例再規定每個功能檔用四個標題，依序是子功能、使用者怎麼到達、harness 怎麼驅動、常見誤判。[verification-skill-example](https://github.com/poteto/verification-skill-example) 標成虛構產品 Atlas。形狀可以拿來建檔，名詞不是 Grok Bot 的規格。

任務開始前，把這五欄寫進提示或 skill，讓下一個執行者交證據：

```text
功能與到達方式：使用者從哪裡進入，畫面或指令上怎麼到達？
成功證據：哪個輸出、畫面、DOM 狀態或 trace 算數？
失敗證據：哪種結果代表還沒修好？
驅動方式：用 skill 目錄裡的哪支 CLI，而不是現場再寫一支 script？
糾正落點：這次若要改規則，寫進哪一層？
```

> [!NOTE]
> 同串回覆另外推薦 [bend-lang.com](https://bend-lang.com)。2026-09-19 她寫過，弱型別與 lint 走不遠，程式庫若能形式化驗證自己，出貨會快很多。那是形式化那一端的延伸看法，不是這支影片的步驟。

## 每次糾正，從程式庫往下找能擋下它的那一層

約 15:40 起是她要觀眾記住的順序。投影片標題是 whenever you correct your agent。Agent 會沿用上下文裡已經打開的檔案，所以程式庫裡的寫法會被下一個 PR 複製。糾正若只留在對話裡，下一次還會再犯。

她排的順序是約束力由強到弱。

### 1. Codebase

把錯誤變成結構上做不到。資料結構、目錄邊界、合法的 import，都屬於這裡。她把程式庫稱為 Agent 最好的記憶。

### 2. Static analysis

lint、compiler diagnostic、CI。同一種錯誤反覆出現時，先加一條會失敗的檢查。能改程式庫讓它不可能發生時，她把檢查放在第二。

### 3. Rules 與 Bugbot

規則與 Bugbot 提供工作時的指引。駕駛 Agent 的人可以略過它們，Agent 也可能沒讀到。她把這層放在硬約束之後。

### 4. Skills

Skills 教 Agent 依某種工程做法做事，例如除錯或做功能的 playbook。它們處理寫法，仍然可能沒被用到。

### 5. Style guide

Style guide 只在人審查時生效。她的用法是拿審查留言當缺口清單，再把時間花到上面四層。只靠這層，PR 量上來之後沒有人看得完每一行。

**停止規則：一則糾正若只留在審查留言或 style guide，就還沒有提高你能同時看住的 Agent 數量。**

GitHub 的 protected branch 可以把狀態檢查設成合併門檻。Bugbot 評語本身不是這道門。要擋下的條件做成 required status check，才對得上她說的第二層。[GitHub 的 protected branches 說明](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

## Dune 把捷徑收成唯一路徑

約 26:40，Dune 的投影片標題是 Architecture for agent-sized context。副標寫著，一個窄的局部修改可以對整個 Electron 應用保持正確。這是 Grok Bot 的 client framework。

動機來自 Agents Window 的效能回退。原則是 Agent 愛走捷徑，所以捷徑必須是對的那條。這樣的程式庫對人很囉嗦，對上下文很短的 Agent 反而合適。她點名的駕駛者包括設計師、產品經理與執行長。

五個名詞各自佔目錄裡的一個位置，執行時也只有一件工作。

- Feature 是一塊產品 UI，放在一個自己的資料夾。
- Entrypoint 是使用者打得開的一個畫面，角色接近 route。
- Transcript card 是某一種 entry 在畫面上的內容，由 feature 擁有。
- Client 是 renderer 上持久的狀態，包在 hooks 與 commands 後面。
- Host 是常駐行為，包在有型別的契約後面。她說 Host 跑在 Grok Bot 的虛擬機上。

約 27:40 的圖把 renderer 與 serving process 分開。renderer 裡是 Feature UI、Navigation、Client。另一側是 Host extensions 與 Electron main。中間是 typed edge。`shared/` 放跨行程型別，每一側只 import 自己被允許的東西。她用 import 與依賴圖在 CI 裡擋下 main process 的程式被拉進 renderer。她給的幀預算是 60 fps 約 16 毫秒、120 fps 約 8 毫秒。重的工作進了 renderer，就會變成畫面上的長任務。

約 29:40 的 Host-backed feature blueprint 把一條功能收成 Feature UI、Client、Shared edge、Host extension。圖上寫著，元件不處理 IPC、Host 查詢、重試順序或行程啟動。Agent-friendly 在那張圖上的意思是，改對一個開檔案的編輯，整個應用的不變條件還在。

這些名詞綁在 Grok Bot 的 Electron 行程上。一種工作只留一條慣用路徑，跨邊界的 import 由檢查失敗，原本留在審查留言裡的知識改寫進目錄與 CI。她說花夠久之後，上下文短、推理沒那麼強的 Agent 也能寫出過得去的程式。

## 園丁刪的是會被複製的 workaround

約 23:40 的圖把一個 workaround 畫成會被連續複製，註記 Each copy makes the next copy likelier。她的說法是，註解或小繞路會在幾天到幾週內變成大家都在抄的寫法。

Dune 因此禁止程式註解。她原先認為註解可以標出邊界情況。後來在 Cursor 的程式庫裡看到 Agent 用註解說明自己為什麼不修真正的問題，只補一個短期解法。禁註解是為了切斷這個複製鏈。

這是 Grok Bot 的選擇。註解若只重述程式，會變成下一個 Agent 的範例。註解若寫下編譯器看不見的不變條件或相容限制，刪掉會讓下一個維護者少一條理由。註解在替「先不修」辯護時，補上缺少的檢查，並刪掉這則辯護。同一種 workaround 出現第二次，就找共同原因。

園丁的三件事，投影片寫成 delete tech debt、keep one paved path、lint against anti-patterns。

1. 刪掉你不希望被原樣複製的既有債務。
2. 常見工作只留一條有指引的路徑，Agent 不必猜。
3. 看到壞模式就先寫 lint，讓它不能再長。她說不必立刻清完。lint 先止血，再排清理。

收尾標準是：這份程式庫若被下一個 Agent 整段抄走，你還願不願意。

## 外圈自動化排在這套檢查之後

約 30:40 她才講 Grok Bot、cloud agents、automations 與 Agent SDK。Grok Bot 在她的分工裡負責外圈，接到 Slack、Datadog、Sentry、PlanetScale 這類她隨口舉的服務，再決定要不要開 cloud agent。有人把這種彙整叫 company brain。她認為這裡用不到那麼重的系統，因為 Agent 已經會用工具。

Grok Bot routines 可以訂閱 Slack 討論串與 Sentry 告警並自動開工。Cursor automations 與 SDK 則重用同一套 skill 與規則，做更長的任務。約 34:40 的畫面是一則 cloud agent 回報，問題在舊版重現，main 上已經修好。這種回覆省下的是「還要不要發一版」的確認，前提是 Agent 真的把應用跑過。

她把這段放在信任曲線的後段。程式庫、檢查、規則與 skill 還沒有讓你離開 1 到 5 的區間時，外圈同時放大的是還沒被擋下的錯誤。

## 下一步：替最近一次糾正指定落點

翻出你最近打給 Agent 的一則糾正。填上成功證據、驅動用的 CLI，以及它現在落在五層的哪一層。若落在 rules、skills 或 style guide，寫下下一個要上移的檢查，指出哪一個目錄邊界、型別或 lint 會讓同樣的錯誤直接失敗。那個檢查進了 CI 之後，再考慮多開一條工作線。

若下一個問題是多個 Agent 的任務狀態與 review 排程，接著讀 [Grok Bot 的工程管理迴路](/blog/grok-bot-engineering-control-plane/)。若要從任務契約、狀態、權限與 trace 建立 Harness，參考 [Harness Engineering 的七個控制面](/blog/harness-engineering-for-reliable-agents/)。

### 參考資料

- [Lauren Tan 的原始影片](https://x.com/poteto/status/2102050467505430555)，2026-09-21
- [Kieran Zhang 的 X Article](https://x.com/i/article/2102795423052419072)。摘要把糾正五層稱作 Dune；影片把 Dune 用於 Grok Bot 架構
- [pstack 的 Verify and ship](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/06-verify-and-ship.md)
- [poteto/verification-skill-example](https://github.com/poteto/verification-skill-example)
- [GitHub 的 protected branches 說明](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
