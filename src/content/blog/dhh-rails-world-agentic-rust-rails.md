---
title: "DHH 在 Rails World 宣告停止手寫：Rails 還在，工程判斷換了位置"
description: "從 Rails World 2026 keynote 拆解 37signals 將 Agent 設為實作預設、HEY 新版重建計畫採用原生 App 與 Rust 郵件後端的說法，區分自述效能數字與可驗證結論，整理 Rails 的適用邊界和團隊驗收責任。"
publishDate: 2026-09-25T22:22:50+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - Ruby on Rails
  - 技術選型
  - 系統設計
series: AI Agent 工程化與工作流實戰
seriesOrder: 24
cover: ../../assets/covers/dhh-rails-world-agentic-rust-architecture.png
coverAlt: "開放的 Web 拱門連向伺服器核心與六個原生用戶端，呈現 Rails Web 與 HEY 規劃中重建架構各自承擔的角色。"
---

## 「停止手寫」指向工作流轉向，不是 Rails 的訃聞

2026 年 9 月 23 日，DHH 在 Rails World 2026 開場 keynote 說，37signals 已把一般手寫程式碼降為例外，並用「pencils down」描述這次工作方式轉變。官方議程將它列為開場 keynote，簡介提到 Rails 的新內容、接下來的方向與未來；但演講仍最容易被轉述成一句更聳動的話：Rails 不再需要了。[Rails World 官方議程](https://app.railsworld.com/talks/rails-world-2026-opening-keynote)

完整演講說的是幾個不同層次的決定：37signals 如何讓 Agent 參與實作、HEY 下一版重建計畫採取什麼客戶端與後端方案，以及 Rails 還適合哪種交付方式。把三者混成「AI 讓 Rails 過時」，會漏掉他明確保留的 Web 使用情境，也會把一間公司的產品取捨誤當成通用效能證明。[DHH 開場 keynote 影片](https://www.youtube.com/watch?v=vDjW_dRyKXY)

這篇整理 9 月 23 日演講及截至 9 月 25 日可取得的 Reddit、Hacker News 與 YouTube 討論。我的判斷是：這場演講最值得工程團隊檢驗的，不是要不要跟著換 Rust，而是當實作變便宜時，程式庫能否讓大量局部修改仍組成一個可維護的產品。

## 37signals 遇到的問題是局部合理、整體失序

DHH 回顧 Basecamp 5 的一次 Agent 實驗：設計師各自讓 Agent 提交看似合理的變更，合起來卻讓架構像「Swiss cheese」。團隊一度回到人工逐行審查；他在演講中認為，這是在錯誤的地方修補問題。真正該改的是程式庫與工作流，讓 Agent 更容易沿著團隊認可的路徑修改。[keynote，約 21:02 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=1262s)

這個案例與「Agent 寫錯程式」不同。若每個 PR 都能通過局部測試，錯誤可能落在共同資料模型、元件慣例或彼此衝突的假設上。人手逐行讀更多 diff，不一定能及早看見整體結構正在分裂；團隊需要把慣用路徑、禁止跨越的邊界與整合驗證放進程式庫。

因此，「停止手寫」比較像是 DHH 對 37signals 預設工作方式的描述：把手寫從日常主路徑移開，並投入時間整理 Agent 可操作的程式庫。這不等於每個團隊都應讓 Agent 自主合併，也不代表程式理解和責任可以一併外包。37signals 已有自己的產品脈絡、程式庫和驗收能力；搬走一句口號，並不會自動搬走這些前提。

## HEY 下一版重建計畫採六款原生 App 與 Rust

演講中另一個焦點，是 37signals 約在 keynote 前一週著手的 HEY 下一版重建計畫，目標是六款原生 App 搭配 Rust 郵件伺服器後端。演講當時工作仍在進行。DHH 說 Rust 是他不喜歡親自閱讀或撰寫、但願意讓 Agent 產出的語言；這個選擇屬於 HEY 的產品與架構取捨，不是宣布所有既有 Rails 應用都該遷移。[keynote，約 24:54 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=1494s)

他也指出 Web 的優點仍是免安裝、可直接抵達；Rails 仍適合這種交付方式，而慣例與一致的架構可以減少 Agent 每次修改時需要猜測的空間。[keynote，約 33:29 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=2009s) 所以這不是「原生 App 勝過 Rails」的二選一。HEY 可以為它的新客戶端選擇原生體驗，也可以讓其他產品繼續用 Rails 把服務送到瀏覽器。

適合自己的判斷要回到產品要求：使用者是否需要原生互動或平台能力？Web 的免安裝與快速抵達是否更重要？團隊是否能維護、除錯並輪值支援新增的語言與執行環境？若答案仍不清楚，先改一條可量測的服務路徑，通常比全面重寫更容易驗證。

## 99% 與 95% 是演講者自述，不是 Rust 基準測試

DHH 在演講中稱，新後端所需 CPU 少 99%、記憶體少 95%，並提到十台主機作冗餘，以及一台 Raspberry Pi 也許足以承載的粗略推算。[keynote，約 30:56 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=1856s) 這些數字能說明他對新架構的信心，但目前是演講者對自家專案的陳述。Rustify 的整理也提醒，Raspberry Pi 部分是 back-of-envelope 估算，並非公開的獨立測試。[Rustify 對 keynote 的整理](https://rustify.rs/articles/rails-world-2026-keynote-dhh-hey-rust-ai-agents)

單憑演講內容，讀者無法確認比較時的請求量、資料集、延遲目標、主機規格、量測區間或舊系統基線。新舊系統也同時改變了客戶端與架構。這些數字沒有隔離語言、框架或實作方式的影響，因此不能推出「Rust 本身讓任何後端省下 99% CPU」，也不足以推導出 Rails 的成本或效能結論。

若要用這個案例支持自己的技術選型，先列出可重現的量測條件：相同工作負載、吞吐量與 p95 延遲目標、CPU 和記憶體、主機成本、錯誤率，以及誰能接手除錯。否則只比較百分比，實際上是在比較兩份無法重做的故事。

## 社群反應談的不只是語言，也是在問誰還能維護系統

本次 9 月 25 日的研究快照中，官方影片約有 15.2 萬次觀看，YouTube 上一則留言以「最令人困惑的葬禮」形容這場演講。[官方影片與留言](https://www.youtube.com/watch?v=vDjW_dRyKXY) 在 Reddit 的 Rails 討論裡，一則高票留言把參加 Rails 大會、卻聽到講者談放下 Rails 與程式工作的落差，說成 keynote 像在「abandoning both your profession and the project the conference is about」。[r/rails 討論串](https://www.reddit.com/r/rails/comments/1woa8r8/dhh_is_completely_crazy/)

另一邊，也有人提醒，對 DHH 生氣不會讓 agentic programming 消失；更務實的問題是如何因應。[r/rails 討論串](https://www.reddit.com/r/rails/comments/1wprf06/what_the_rails_word_keynote_says_about_dhh/) 對 Rust 的疑慮則聚焦在維護：當團隊把後端交給 Agent 產出，而負責值班的人不熟悉這門語言，遇到模型解不出的故障或隱藏缺陷時，誰能查明原因？[另一則 r/rails 討論](https://www.reddit.com/r/rails/comments/1woxejp/get_dhh_out_of_rails/)

現場回報也不是同一種情緒。一位參加者說，會場氣氛「far from doom and gloom」，並指出多數開發者仍在維護多年累積、客戶持續依賴的系統；同一串回覆裡，另一位參加者則說這次大會讓他感到士氣低落。這提醒我們，台上對未來的宣言與工程師每天維持既有服務的處境並不相同。[Rails World 現場回報與討論](https://www.reddit.com/r/rails/comments/1wozr18/a_field_report_from_rails_world_the_vibe_is_not/)

這些留言不是 Rails 或 Ruby 使用者的代表性民調，也不能證明某一方較多。它們更適合當成一份風險清單：演講內容是否回應了會眾期待？新架構的維護責任由誰承擔？Agent 不能修好時，有沒有人可以定位、回滾並恢復服務？[Hacker News 上的相關討論](https://news.ycombinator.com/item?id=49831875)也以「AI 讓 Rails 不再必要」轉述 keynote，顯示標題式摘要容易把 Rails 的特定產品取捨擴大成框架退場宣言。

這次 Last30Days 可取得的討論來自 Reddit、Hacker News 與 YouTube；X 資料源未啟用，因此不把這些貼文當成完整的 RoR 社群民意。

## 把演講轉成團隊能驗收的實驗

要借用 DHH 的經驗，可以先把三個不同假設分開，避免一次大改後無法判斷改善來自哪裡：

1. **Agent 是否縮短交付時間？** 挑一個可回滾的功能，固定需求、驗收案例與程式庫範圍，比較人工與 Agent 工作流的交付時間、返工和缺陷。
2. **程式庫是否能守住整體架構？** 檢查 Agent 是否沿用既有資料模型、元件與測試入口；把重複偏差寫成 lint、型別、架構測試或清楚的唯一慣用路徑。
3. **新語言是否值得增加？** 在同一工作負載下量測效能與成本，並把除錯、部署、值班和接手能力列入採用條件。

這三項實驗回答的是不同問題。第一項測工作流，第二項測程式庫，第三項測生產架構。不要用「Agent 可以產生 Rust」替代效能證據，也不要用一次基準測試證明團隊已能長期維護它。

如果團隊目前使用 Rails，下一步可以選一個小型垂直切片，記錄基線與明確的完成條件，再讓 Agent 在限定路徑內交付。驗收時同時看使用者行為、整體架構、測試和回滾方式；若打算加新語言，再另做同負載量測並指定維運責任人。對 Agent 如何改變決策與驗收責任，可接著讀站內的 [DHH 談 Agentic Engineering](/blog/dhh-agentic-engineering-podcast/)。

### 參考資料

- [Rails World 2026 Opening Keynote 官方議程](https://app.railsworld.com/talks/rails-world-2026-opening-keynote)，2026-09-23
- [Rails World 2026 Opening Keynote 官方影片](https://www.youtube.com/watch?v=vDjW_dRyKXY)
- [Rails Foundation：Rails World 2026 開幕演講直播公告](https://rubyonrails.org/2026/9/18/rails-world-2026-livestream-and-sponsors)
- [Rustify：Rails World 2026 keynote 的 HEY、Rust 與 AI Agent 整理](https://rustify.rs/articles/rails-world-2026-keynote-dhh-hey-rust-ai-agents)
- [r/rails：What the Rails World Keynote says about DHH](https://www.reddit.com/r/rails/comments/1wprf06/what_the_rails_word_keynote_says_about_dhh/)
- [r/rails：DHH is completely crazy](https://www.reddit.com/r/rails/comments/1woa8r8/dhh_is_completely_crazy/)
- [r/rails：Get DHH out of Rails](https://www.reddit.com/r/rails/comments/1woxejp/get_dhh_out_of_rails/)
- [r/rails：A field report from Rails World: the vibe is not doom and gloom](https://www.reddit.com/r/rails/comments/1wozr18/a_field_report_from_rails_world_the_vibe_is_not/)
- [Hacker News：DHH at Rails World](https://news.ycombinator.com/item?id=49831875)
