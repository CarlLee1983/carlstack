---
title: "DHH 在 Rails World 宣告停止手寫：Rails 還在，工程判斷換了位置"
description: "從 Rails World 2026 keynote 拆解 37signals 將 Agent 設為實作預設、HEY 新版重建計畫採用原生 App 與 Rust 郵件後端的說法，區分自述效能數字與可驗證結論，整理 Rails 的適用邊界和團隊驗收責任。"
publishDate: 2026-09-25T22:22:50+08:00
updatedDate: 2026-09-30T00:00:15+08:00
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

## 攝影史類比提醒：產生成本下降後，工作會轉向選擇與驗收

DHH 先用攝影史說明技術如何改變創作者的工作。過去只有少數人能負擔畫家花數月完成的肖像；相機普及後，精確描繪現實不再是畫家的專屬技能，藝術家轉向新的表現形式。他把 Kodak Brownie 相機比作 AI 開發的轉捩點，並將 2025 年 11 月 24 日 Opus 4.5 的發布視為自己的「Brownie 時刻」。這是他對技術轉折的個人判斷，不是已被證實的產業分期。[keynote，約 01:50 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=110s) [轉捩點與模型演進，約 11:10 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=670s)

他把過去爭論的「10 倍工程師」延伸到 AI 時代，估計沒有工具的較弱工程師與善用工具的頂尖工程師，產出差距可能達 100 倍，甚至 1,000 倍。這是他的估計，不是演講中提出的對照實驗。[keynote，約 17:15 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=1035s)

他也分享自己的程式碼行數：長期平均一年約 30,000 行，換算月均約 2,500 行；2026 年 8 月約 150,000 行，是他換算月均的約 60 倍。DHH 同時提醒，行數不是穩定的生產力指標；Rust 比 Ruby 冗長，語言與任務不同時不能直接比較。[keynote，約 37:30 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=2250s)

在他的工作模式裡，英文逐漸成為比 Ruby 更有表達力的「程式語言」，雖然也更模糊、結果較不確定。[keynote，約 38:06 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=2286s) 他說自己約在 2026 年 3 月從職業手寫程式碼的工作方式退休，轉而把自己定位為使用智慧工具創造產品的人。[keynote，約 39:10 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=2350s) 他並預測，到了 2026 年底，手寫程式碼對幾乎所有領域和公司都不再具經濟效益。這是 DHH 的個人經驗與預測，不能直接套用到每個工程團隊。[keynote，約 40:45 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=2445s)

<img
  src="/images/dhh-rails-world-photo-agent-shift.webp"
  width="1536"
  height="1024"
  loading="lazy"
  alt="從傳統肖像畫家與相機轉向工程師指揮 AI 代理創作軟體，呈現 DHH 的攝影史類比。"
/>

## 37signals 遇到的問題是局部合理、整體失序

DHH 回顧 Basecamp 5 的一次 Agent 實驗：設計師各自讓 Agent 提交看似合理的變更，合起來卻讓架構像「Swiss cheese」。團隊一度回到人工逐行審查；他在演講中認為，這是在錯誤的地方修補問題。真正該改的是程式庫與工作流，讓 Agent 更容易沿著團隊認可的路徑修改。[keynote，約 21:02 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=1262s)

這個案例與「Agent 寫錯程式」不同。若每個 PR 都能通過局部測試，錯誤可能落在共同資料模型、元件慣例或彼此衝突的假設上。人手逐行讀更多 diff，不一定能及早看見整體結構正在分裂；團隊需要把慣用路徑、禁止跨越的邊界與整合驗證放進程式庫。

因此，「停止手寫」比較像是 DHH 對 37signals 預設工作方式的描述：把手寫從日常主路徑移開，並投入時間整理 Agent 可操作的程式庫。這不等於每個團隊都應讓 Agent 自主合併，也不代表程式理解和責任可以一併外包。37signals 已有自己的產品脈絡、程式庫和驗收能力；搬走一句口號，並不會自動搬走這些前提。

## HEY 下一版重建計畫採六款原生 App 與 Rust

演講中另一個焦點，是 37signals 約在 keynote 前一週著手的 HEY 下一版重建計畫，目標是六款原生 App 搭配 Rust 郵件伺服器後端。演講當時工作仍在進行。DHH 說 Rust 是他不喜歡親自閱讀或撰寫、但願意讓 Agent 產出的語言；這個選擇屬於 HEY 的產品與架構取捨，不是宣布所有既有 Rails 應用都該遷移。[keynote，約 24:54 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=1494s)

<img
  src="/images/dhh-rails-world-hey-native-apps.webp"
  width="1536"
  height="1024"
  loading="lazy"
  alt="工程師檢視多種裝置上的郵件應用，中央伺服器連接各客戶端，概念化 HEY 原生客戶端與後端重建計畫。"
/>

他也指出 Web 的優點仍是免安裝、可直接抵達；Rails 仍適合這種交付方式，而慣例與一致的架構可以減少 Agent 每次修改時需要猜測的空間。[keynote，約 33:29 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=2009s) 所以這不是「原生 App 勝過 Rails」的二選一。HEY 可以為它的新客戶端選擇原生體驗，也可以讓其他產品繼續用 Rails 把服務送到瀏覽器。

DHH 在演講中說，Rails Foundation 的早期 Agent 評估很快接近 95% 完成率，於是團隊提高了任務難度。[keynote，約 34:24 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=2064s) 這是他的口頭概述；Foundation 第一份公開基準報告則以 Writebook 的 21 項原子任務、每項三次執行評估八個模型，最佳實測模型 Claude Opus 5 完成 58/63 次（92%）。報告另指出，Fable 5 有一項任務因安全措辭而拒答；若不計這項拒答，其完成率約為 95%。[Agents on Rails 第一份基準報告](https://rubyonrails.org/2026/8/13/agents-on-rails-the-first-benchmark-report)

適合自己的判斷要回到產品要求：使用者是否需要原生互動或平台能力？Web 的免安裝與快速抵達是否更重要？團隊是否能維護、除錯並輪值支援新增的語言與執行環境？若答案仍不清楚，先改一條可量測的服務路徑，通常比全面重寫更容易驗證。

同樣選擇 Rust，GitHub Copilot 面對的是另一種工程問題：它把既有 Agent runtime 從 Node 子程序移成可嵌入的原生函式庫，量測重點是 SDK 啟動與 session 密度。[Copilot Agent Runtime 移植的拆解](/blog/copilot-agent-runtime-rust-in-process/)

## 99% 與 95% 是演講者自述，不是 Rust 基準測試

DHH 在演講中稱，新後端所需 CPU 少 99%、記憶體少 95%，並提到十台主機作冗餘，以及一台 Raspberry Pi 也許足以承載的粗略推算。[keynote，約 30:56 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=1856s) 這些數字能說明他對新架構的信心，但目前是演講者對自家專案的陳述。Rustify 的整理也提醒，Raspberry Pi 部分是 back-of-envelope 估算，並非公開的獨立測試。[Rustify 對 keynote 的整理](https://rustify.rs/articles/rails-world-2026-keynote-dhh-hey-rust-ai-agents)

單憑演講內容，讀者無法確認比較時的請求量、資料集、延遲目標、主機規格、量測區間或舊系統基線。新舊系統也同時改變了客戶端與架構。這些數字沒有隔離語言、框架或實作方式的影響，因此不能推出「Rust 本身讓任何後端省下 99% CPU」，也不足以推導出 Rails 的成本或效能結論。

若要用這個案例支持自己的技術選型，先列出可重現的量測條件：相同工作負載、吞吐量與 p95 延遲目標、CPU 和記憶體、主機成本、錯誤率，以及誰能接手除錯。否則只比較百分比，實際上是在比較兩份無法重做的故事。

## Agent 適合非同步交辦，應用程式也要能被代理操作

DHH 建議把工作交給 Agent 後先去做別的事，等成果準備好再審查；使用者不必一直待在聊天視窗等 token 輸出。[keynote，約 32:04 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=1924s) 他也鼓勵以高層次的問題和結果描述任務，不要過早限制代理如何實作。[keynote，約 35:18 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=2118s)

他接著把同一個想法延伸到產品介面：使用者想帶自己的 Agent 操作多個應用程式，不一定需要每個服務再附一個專屬聊天機器人。因此他直接要求應用程式提供 CLI，讓 Agent 能透過明確的命令操作服務。[keynote，約 45:23 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=2723s)

HEY 的搜尋例子說明了這種操作方式的價值：DHH 只記得一封多年以前的郵件大概提到球鞋和 Podcast，忘了寄件人、公司與年份；Agent 仍能依這些概念線索找出郵件。這不只是在命令列執行既有關鍵字搜尋，而是讓個人代理理解需求後，把工作交給合適的應用程式完成。[keynote，約 47:19 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=2839s)

## Omarchy 讓個人想做的小工具也值得實作

DHH 用 Omarchy 展示產生成本下降後能做的產品。他提到作業系統安裝時間從 3 分 33 秒縮短到一台 AMD 筆電上的 35 秒，實驗室測試則到 9 秒；他也示範用 Agent 做的計算機、寫作工具、影片裁切工具，以及以 Markdown 為基礎的簡報軟體 Hype。這些例子從 Linux 系統到個人小工具，說明他現在願意嘗試過去不一定值得投入人力的需求。[keynote，約 48:05 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=2885s)

他特別提到，以前把時間花在把應用程式做得更小、更快，常常比不上工程師時間的成本；如果 Agent 能長時間嘗試最佳化，這類改善就可能重新值得做。他以簡報工具 Hype 約半 MB 的執行檔為例，說明自己現在會要求工具追求更小、更快的結果。[keynote，約 53:30 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=3210s) 這些安裝速度與工具開發時間是 DHH 在演講中的案例，不代表其他團隊能直接複製相同結果。

<img
  src="/images/dhh-rails-world-personal-agent-cli.webp"
  width="1536"
  height="1024"
  loading="lazy"
  alt="工程師透過命令列協調郵件搜尋、計算機、寫作、影片剪輯與簡報工具，概念化個人代理串接應用程式。"
/>

## DHH 選擇樂觀投入，但安全仍是工程工作

DHH 承認代理可能引發安全問題，甚至可能做出有害的事；他的主張是用新的工具與防護措施處理風險，而不是因為風險存在就放棄。他引用 ATM 和銀行分行的歷史，認為降低服務成本可能擴大使用需求，也提醒聽眾別把對經濟與工作未來的預測當成確定事實。[keynote，約 54:50 起](https://www.youtube.com/watch?v=vDjW_dRyKXY&t=3290s)

這是他對未來的樂觀立場，不等於一份完整的安全或就業轉型方案。對工程團隊而言，可採取的部分更具體：將 Agent 權限限制在任務所需範圍，保留測試、審查、回滾與事故處理責任，再逐步擴大可委派的工作。

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
