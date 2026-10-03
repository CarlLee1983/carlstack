---
title: "AI 的下一場競爭，是成為你不想更換的助理"
description: "從 OpenClaw、Grok Bot、OpenAI dots、Meta Muse 與 Gemini Spark 的產品方向，談我對主要助理位置、記憶與信任累積，以及 Agent 遷移成本的預測。"
publishDate: 2026-10-03T09:35:00+08:00
draft: false
featured: false
tags:
  - AI Agent Workflow
  - 技術選型
series: AI Agent 工程化與工作流實戰
seriesOrder: 56
cover: ../../assets/covers/ai-agent-primary-assistant-switching-costs.webp
coverAlt: "前景織機上累積紫褐與金色紋理，少數線頭延伸到後方尚未織成布的框架，象徵個人脈絡的累積與交接成本。"
---

我對接下來 AI 發展的預測是：競爭不會只停留在模型能力，而會逐漸轉向「誰先成為使用者長期依賴的 Agent」。

模型更聰明，當然重要。但當 AI 開始理解一個人的習慣、承接工作、持續追蹤事情，使用者選擇的就不只是工具，而是一個需要時間建立默契的助理。

這也是我從 OpenClaw，以及 Grok Bot、OpenAI dots、Meta Muse 這些產品身上，最在意的變化。只要想想一個已經熟悉專案的助理換人時，哪些背景、待辦與決策理由必須重新交代，就能看見這種競爭與一次性的問答有何不同。

產品資訊核對至 2026 年 10 月 3 日；功能、方案與開放地區仍可能調整。以下關於使用習慣、平台黏著度與競爭結果的判斷，是我的預測。

## 從自己管理 Agent，到直接擁有 Agent

OpenClaw 帶給我的啟發，是 AI 不必只待在聊天視窗裡，而能進入實際的生活與工作流程。它採取由使用者掌握執行環境的路線，讓 Agent 在自己管理的電腦或伺服器上運作，透過熟悉的通訊工具處理事情。[OpenClaw 官方文件](https://docs.openclaw.ai/)將它定位為 self-hosted gateway；[官網](https://openclaw.ai/)也提供桌面安裝方式，並不只有手動部署一條路。

但對一般使用者而言，擁有一個 Agent，不應該以學會部署、管理環境與維護服務為前提。

Grok Bot、dots、Muse 這類產品，把執行環境整合進服務：使用者不必先準備一台專門運作 Agent 的電腦，而是透過帳號、方案與必要的授權開始使用。[Grok Bot](https://x.ai/bot) 與 [dots](https://openai.com/zh-Hant/index/introducing-dots/) 都提供雲端運算環境，並納入符合資格的訂閱方案。這不表示每個 Agent 都有獨立的安全環境；例如 xAI 的[說明](https://docs.x.ai/grok-bot/overview)指出，同一使用者的個人 Bots 共用一台持久雲端電腦。

「訂閱即用」也不是唯一形式。Meta 在 [9 月 8 日推出 Muse](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/) 時，首波於美國開放；它提供[有用量上限的免費服務與付費訂閱](https://www.meta.com/en-gb/help/subscriptions/1021145227643680/)，Meta 在 [9 月 29 日的公告](https://about.fb.com/news/2026/09/introducing-muse-small-business/)則已說明服務開放美國與加拿大。這幾款產品的共同點，是使用者不必自行部署，不一定得先付費訂閱。

我的判斷是，這種門檻下降，會比單次模型升級更直接地改變使用者規模。一般人不需要先理解 Agent 的架構，只需要知道它能不能替自己把事情完成。

不過，免部署不等於免設定，更不等於可以完全不監督。應用程式授權、行動界限與重要操作的確認，仍是[官方產品設計](https://openai.com/zh-Hant/index/introducing-dots/)的一部分。

## 一條路是團隊分工，另一條路是個人助理

從目前的產品設計來看，我會把它們的側重理解成兩個方向。

Grok Bot 比較接近「建立一支 AI 工作團隊」。它強調[建立多個 Bot、賦予不同職責，讓它們平行工作與交接任務](https://x.ai/bot)；9 月 28 日公布的 [Team Bots](https://x.ai/news/team-bots)，則進一步把共用工具、知識與團隊記憶帶進協作流程，同時保留[個別對話的私密性](https://docs.x.ai/grok-bot/team-bots)。

從 [Muse 個人版的產品敘事](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)來看，它比較接近「替一個人處理生活大小事」，圍繞個人目標、日常任務、偏好記憶，以及跨應用程式完成事情。不過，Meta 也已推出 [Muse for Small Business](https://about.fb.com/news/2026/09/introducing-muse-small-business/)，這條路同樣正延伸到工作場景。

dots 則像是以個人為中心、能延伸到工作的代理。它[強調理解你的目標與標準，持續推進專案](https://openai.com/zh-Hant/index/introducing-dots/)；OpenAI 也宣布將向少數企業開放預覽，讓專職 dots 在組織內承擔特定職責，不能把它侷限成生活助理，也不能把預覽當成所有組織都已可用的功能。

對我而言，這兩種方向的差別，是：

> 團隊型 Agent，是把工作分給不同角色；個人型 Agent，是讓一個主要助理越來越了解我，再由它協調事情。

兩者未必互斥，但我預測，個人市場最重要的位置，會是那個「有事先找它」的主要助理。

## 遷移成本，是重新建立默契

只是問一次問題，我可以把同一個問題丟給不同模型，比較誰回答得好。

但假設一個 Agent 已經替我工作幾個月，知道我的寫作風格、專案背景、處理事情的優先順序，也知道哪些事情可以直接做、哪些一定要先問我，更換它就不是換一個聊天視窗那麼簡單。

我需要考慮的是：新助理能否接手正在進行的事情？既有流程要不要重建？它是否理解過去那些「最後為什麼這樣決定」的脈絡？我又需要花多少時間，確認它值得被授予同樣的權限？

我預測，Agent 的黏著度會來自記憶、流程、授權與信任的累積，而不只是模型能力。

這個推論有個重要前提：這些累積的脈絡，無法低成本、完整地移轉。如果未來跨平台交接變得容易，鎖定效果就會減弱。

所以，我在意的不只是資料能不能匯出，還有一個已經熟悉我的助理，能不能把工作與默契一起交接出去。

## 留給 Google 的時間，是搶下主要助理位置的時間

Google 並不是還沒有進場。它在 [2026 年 5 月 19 日公布 Gemini Spark](https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/)，定位也是能持續在背景處理任務的個人 Agent。這是公布日期，不代表當天已對所有使用者開放。

因此，我所說的「留給 Google 的時間不多了」，不是指它來不及推出產品，而是：

> 它必須在使用者與其他 Agent 建立穩定關係之前，讓自己的產品成為日常生活中真正會用、願意交付事情的助理。

Google 也不是沒有優勢。在使用者授權並連結後，Spark 可以使用 [Gmail、日曆、雲端硬碟、文件，以及其他 Google 與第三方服務](https://support.google.com/gemini/answer/17094507?co=GENIE.Platform%3DAndroid&hl=zh-Hant)，這些整合本身就是它競爭的基礎。

但我的推論是，擁有底層服務，不一定等於擁有使用者的主要入口。

假如我習慣先向另一個 Agent 交代事情，再由它操作郵件、整理文件、安排日程，那麼即使資料仍然留在 Google，我與 AI 的主要互動關係，也可能已經屬於另一個平台。

這才是我認為 Google 需要警覺的地方：不只是模型會不會落後，而是使用者會不會逐漸不再直接找它。

## 後來者要提供的，不能只是「好一點」

我不認為未來每個人只會使用一家 AI。不同任務仍然可能使用不同工具。

但我的預測是：工具可以有很多個，長期承接個人脈絡與責任的主要助理，會相對集中。

當一個 Agent 已經穩定完成工作，更換平台帶來的收益，就必須大於重新設定、磨合與承擔風險的成本。模型稍微更強，未必足以說服使用者搬家。

後來者需要的，可能是明顯更可靠的執行能力、大幅更低的成本、不可替代的整合，或者幾乎無痛的遷移方式。反過來，嚴重的隱私或信任事件，也可能讓原本的黏著度迅速瓦解。

所以，我不認為先推出的人一定贏。誰先讓使用者放心交付事情，並持續把事情做好，誰就更有機會成為難以被替換的那個助理。

下一階段 AI 的競爭，會從「你很厲害」，走向「換掉你，我得重新教另一個助理很多事情」。

要檢驗這個預測，可以挑一件仍在進行的工作，試著把它交給另一個 Agent：除了檔案，還得補上多少背景、決策理由與授權界限？這份交接需要付出的時間，就是比較模型回答之外，值得一起衡量的成本。

## 延伸閱讀

本站已有 [dots 的持續責任與停止驗收](/blog/openai-dots-ongoing-work-control/)、[Grok Bot 的共享環境與審批邊界](/blog/grok-bot-cloud-computer-workflows/)，以及 [Muse 的執行權限](/blog/meta-muse-agent-permission-boundaries/)文章。那些文章討論如何控制與驗收工作；這篇關心的是，長期承接工作會如何改變使用者更換助理的意願。

- [OpenAI's Dot agent is enterprise software that can also order your dinner — The Verge](https://www.theverge.com/ai-artificial-intelligence/1004096/openai-chatgpt-dots-hands-on-agent)，2026-10-02
- [Google is launching its own version of OpenClaw — The Verge](https://www.theverge.com/tech/932996/google-gemini-spark-antigravity-io-2026)，2026-05-19
