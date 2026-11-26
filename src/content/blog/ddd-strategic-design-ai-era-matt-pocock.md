---
title: "AI 吃掉了戰術設計，DDD 留給人的是戰略設計"
description: "整理 Matt Pocock 2026 年在 AI Engineer、Latent Space、The Pragmatic Engineer 與課程貼文中對 DDD 的說法：他看重的是通用語言、領域建模與模組邊界，而不是把 Entity、Repository 照抄進程式。本文把這個判斷轉成 Bounded Context、Context Map 與介面所有權的可執行清單。"
publishDate: 2026-11-26T15:30:00+08:00
draft: false
featured: false
tags:
  - DDD 與 Clean Architecture
  - AI Agent Workflow
  - AI 工程化
  - Matt Pocock
series: "Agent 時代的代碼庫設計哲學"
seriesOrder: 6
cover: "../../assets/covers/ddd-strategic-design-ai-era-matt-pocock.webp"
coverAlt: "深藍藍圖桌面上三塊琥珀、青綠、紫色的半透明領域區塊，以少數發光閘道相連成上下文地圖，人手與機械手指向同一個閘道，象徵人與 Agent 共用邊界與語言。"
---

2026 年 11 月 11 日，Matt Pocock 在 X 上寫道：課程裡最讓學員驚豔的不是 agentic 技巧，而是 DDD——建立通用語言、讓 Agent 使用它，再把程式碼重構成這套語言。[Matt Pocock 的貼文](https://x.com/mattpocockuk/status/2120503390333768170)

這句話容易被讀成「AI 時代要回去寫 DDD 那一整套」。我讀完他這一年的公開談話後，結論剛好相反：他推崇的是 DDD 的戰略層，對戰術層的程式編碼方式反而保留。這篇整理他的原話，再補上我認為要落地時缺的那一塊：邊界。

站內已有一篇談 [用 CONTEXT.md 記錄領域語言](/blog/domain-modeling-context-spec/) 的實作文，聚焦詞彙表本身；本文往上一層，談詞彙表之所以有效的前提——每個詞只在一個邊界內成立。

## 他推崇的是哪一半的 DDD

先把事實排好，以下都是 Matt Pocock 本人的說法，附來源與日期。

- **AI 吃掉了戰術程式設計。** 他借用 John Ousterhout 的戰術／戰略程式設計區分，說 Agent 已能處理知識、語法這類戰術工作，「AI 已經大致吃掉了戰術程式設計，戰略的部分要靠我們」。（[The Pragmatic Engineer，2026-09-17，22:59](https://newsletter.pragmaticengineer.com/p/ai-skills-with-matt-pocock)）
- **DDD 只推前三章。** 推薦書單時，他說 Eric Evans 那本只推「前三章左右」，也就是通用語言與領域建模；「真正把它編碼進程式碼的那部分，我不是很大的粉絲」。（同上）
- **通用語言讓溝通變短。** 他用 ghost lesson 被轉成 real lesson、連帶讓 ghost section 與 ghost course 一起變真的情境，說一句「materialization cascade」就能取代整段解釋；Agent 也能直接 grep 這個詞找到對應函式。（同上，49:45）
- **人定邊界，模型填內部。** 在 Latent Space 對談中，他說人仍要掌握架構，「尤其是模組」；人設計並理解介面，實作交給 AI，邊界越明確，越不需要信任模型的隱含假設。（[Orply 整理的 Latent Space 對談，2026-05-07](https://orply.com/articles/latent-space/matt-pocock-why-engineering-fundamentals-matter-more-now-61c79f18)）
- **詞義依領域而變。** 同一場對談，他用 mole 舉例：在醫療 App 是皮膚上的痣，在動物園 App 是鼴鼠。（同上）
- **把系統設計所有權留在人手上。** AI Engineer Europe 2026 的演講把通用語言列為第二個失敗模式的解法（6:49–7:55），收尾則是人負責介面設計、保留系統設計的戰略所有權（13:05–16:27）。（[AI Engineer 演講頁](https://ai.engineer/talks/v4F1gFy-hqg)）

他也一再說自己是最近才接觸 DDD、還在探索，不以 DDD 專家自居（同上兩個來源）。所以「Matt Pocock 強調 DDD 戰略設計」這句話，精確的版本是：**他強調的是 DDD 中屬於戰略層的通用語言與領域建模，加上 Ousterhout 意義下的戰略程式設計；他沒有用「戰略設計」這個詞系統性地談 Bounded Context。** 下面關於邊界的部分，是我的延伸推論。

## 為什麼戰術層可以交給 Agent

DDD 傳統上分兩層。戰略設計處理「模型在哪裡成立」：Bounded Context、通用語言、Context Map、核心域與支撐域的區分。戰術設計處理「模型怎麼寫成程式」：Entity、Value Object、Aggregate、Repository、Domain Event。

戰術模式在模型的訓練資料裡極為常見，而且結構規則明確。你說「把 Order 做成 Aggregate Root，金額用 Value Object」，Agent 多半能寫得合格。這正是 Pocock 說的戰術工作。

戰略決策則沒有標準答案可抄。「付款」與「請款」要不要是兩個 context？「會員」在行銷與帳務是不是同一個東西？這些取決於你的組織、法規與變更頻率，Agent 只能從程式碼現況猜，而現況往往就是問題本身。

他在 Pragmatic Engineer 訪談裡還點出一個時間因素：戰略錯誤以前要九個月才回頭咬你，很多人換工作前都沒被咬到；AI 讓產出變快，戰略錯誤也會更快回來。（[The Pragmatic Engineer，1:00:04](https://newsletter.pragmaticengineer.com/p/ai-skills-with-matt-pocock)）**我的停止規則是：Agent 可以提出 context 切分草案，但 context 邊界的合併或拆分，必須由人確認並寫成 ADR。**

## 通用語言需要邊界才會有效

只做一份全專案詞彙表，很快會遇到 mole 問題：同一個詞在兩個子領域意思不同，詞彙表只能二選一，或寫成含糊的妥協定義。Agent 讀到含糊定義，語義漂移就回來了。

Evans 的原始答案是 Bounded Context：通用語言只在一個邊界內通用。Pocock 的 `domain-modeling` skill 其實已經內建這個結構：單一 context 的 repo 只有一份 `GLOSSARY.md`；若根目錄有 `GLOSSARY-MAP.md`，代表 repo 有多個 context，每個 context（例如 `src/ordering/`、`src/billing/`）各自有詞彙表與 ADR 目錄。（[domain-modeling SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)，查閱日期 2026-11-26）

這個 map 檔就是輕量版的 Context Map。我會在裡面多寫兩件事，讓 Agent 跨邊界時有規則可循：

```markdown
# GLOSSARY-MAP.md

## ordering — src/ordering/

上游：catalog（只讀取 ProductSnapshot）
對外介面：PlaceOrder、CancelOrder；發出 OrderPlaced

## billing — src/billing/

上游：ordering（訂閱 OrderPlaced，不直接讀 ordering 資料表）
注意：billing 的 "Account" 是付款主體，不等於 ordering 的 "Customer"

## 跨邊界規則

- 跨 context 只能經由上列對外介面或事件
- 同名異義詞在此列出，禁止在對方 context 內直接引用
```

邊界怎麼切、跨邊界怎麼翻譯，站內的 [限界上下文切分訊號](/blog/ddd-bounded-context-god-object-refactoring/) 與 [上下文映射與 ACL](/blog/ddd-context-mapping-anti-corruption-layer/) 有更完整的討論。一個 context 對應一組深模組與一個小而穩的介面，就把 Pocock 的兩個主張接在一起：通用語言決定詞，模組邊界決定詞在哪裡成立。

## 介面歸人，實作歸 Agent

演講與對談都落在同一個分工：人擁有介面與架構，Agent 填內部；不重要的模組可以當灰箱，金流這類關鍵功能則要看得更仔細。（[AI Engineer 演講頁](https://ai.engineer/talks/v4F1gFy-hqg)）

換成 DDD 語言，我會這樣分：

- **人負責**：context 切分、核心域與支撐域判定、context 之間的介面與事件契約、同名異義詞的仲裁。
- **Agent 負責**：context 內部的 Entity、Aggregate、Repository 實作，以及依詞彙表重新命名與重構。
- **一起做**：用 `grill-with-docs` 這類拷問流程釐清新詞，它會同時呼叫 grilling 與 domain-modeling 兩個 skill，邊討論邊更新詞彙表與 ADR，完整操作見 [grill-with-docs 實作教學](/blog/ddd-grill-with-docs-glossary-adr-tutorial/)。（[grill-with-docs SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)）

最後一項要注意 Pocock 在 skill 裡寫的限制：詞彙表不放任何實作細節，也不是規格或草稿區；ADR 只在「難以回頭、沒有脈絡會令人意外、確實經過取捨」三者同時成立時才寫。（[domain-modeling SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)）邊界決策幾乎總是符合這三點，所以它正是 ADR 該記的東西。

## 下一步

挑一個你最近讓 Agent 改壞過的功能，做三件事：

1. 列出那次對話裡出現、但你和 Agent 理解不同的詞。
2. 判斷每個詞是「定義不清」還是「跨了兩個 context」。前者補進詞彙表；後者在 `GLOSSARY-MAP.md` 拆成兩個詞，並寫明它們只能經由哪個介面互通。
3. 把邊界決定寫成一則 ADR，下次交給 Agent 時只給它所屬 context 的詞彙表。

如果做完發現專案其實只有一個 context，那也是好結果：一份詞彙表就夠了，不必為了 DDD 而拆。

## 參考資料

- [Matt Pocock，X 貼文（2026-11-11）](https://x.com/mattpocockuk/status/2120503390333768170)：課程中最受關注的是 DDD 與通用語言。
- [AI Skills with Matt Pocock，The Pragmatic Engineer（2026-09-17）](https://newsletter.pragmaticengineer.com/p/ai-skills-with-matt-pocock)：戰術／戰略程式設計、Grill With Docs、DDD 書單。
- [Software Fundamentals Matter More Than Ever，AI Engineer Europe 2026](https://ai.engineer/talks/v4F1gFy-hqg)：六個失敗模式與解法。
- [Orply 對 Latent Space 對談的整理（2026-05-07）](https://orply.com/articles/latent-space/matt-pocock-why-engineering-fundamentals-matter-more-now-61c79f18)：模組邊界、mole 範例；屬二手整理。
- [mattpocock/skills：domain-modeling](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md) 與 [grill-with-docs](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)。
