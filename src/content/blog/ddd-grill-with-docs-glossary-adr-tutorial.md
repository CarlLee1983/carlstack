---
title: "用 grill-with-docs 在動工前把領域語言寫進 repo"
description: "Matt Pocock 的 grill-with-docs 實作教學：安裝與初始化、分輪拷問的運作方式、GLOSSARY.md 與 ADR 的寫入門檻，並以電商部分退款為例走完一次完整 session，附常見失敗與檢查清單。依 2026-11-25 版 mattpocock/skills 撰寫。"
publishDate: 2026-11-26T17:30:00+08:00
draft: false
featured: false
tags:
  - DDD 與 Clean Architecture
  - AI Agent Workflow
  - Matt Pocock
  - 系統設計
series: "DDD 戰略設計實戰：從業務邊界到系統架構"
seriesOrder: 7
cover: "../../assets/covers/ddd-grill-with-docs-glossary-adr-tutorial.webp"
coverAlt: "夜晚工作桌上，編號 1、2、3 的提問卡以琥珀色細線連到攤開的詞彙筆記本，再連到三封封蠟的決策信封，背後浮著程式編輯器面板，象徵拷問、詞彙表與 ADR 的流程。"
---

前六篇談的是邊界怎麼切、跨邊界怎麼隔離。這篇往下落到每天的工作：開一個新功能之前，怎麼讓你、Agent 與程式碼先講同一套話。

工具是 Matt Pocock 的 [`grill-with-docs`](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)。它的全部內容只有一句：依序呼叫 `grilling` 與 `domain-modeling` 兩個 skill。前者負責拷問，後者負責把結論寫進 `GLOSSARY.md` 與 ADR。為什麼通用語言在 Agent 時代值得做，請見上一篇 [AI 吃掉了戰術設計，DDD 留給人的是戰略設計](/blog/ddd-strategic-design-ai-era-matt-pocock/)；本文只談怎麼用。

> [!IMPORTANT]
> 本文依 [mattpocock/skills](https://github.com/mattpocock/skills) 2026-11-25 的版本（commit `6f7f783`）撰寫。1.3.0 起詞彙表從 `CONTEXT.md` 改名為 `GLOSSARY.md`，多 context 的索引從 `CONTEXT-MAP.md` 改為 `GLOSSARY-MAP.md`，原本的 `/ubiquitous-language` skill 已移除、併入 `domain-modeling`。站內較早的 [CONTEXT.md 文章](/blog/domain-modeling-context-spec/) 使用的是舊檔名。

## 先裝齊三個 skill 再開始

`grill-with-docs` 本身不做事，沒有裝 `grilling` 與 `domain-modeling` 就會失效。官方文件明說：單獨安裝 `grill-with-docs` 時，必須另外安裝這兩個基礎 skill，最省事是整包安裝。（[grilling 說明](https://github.com/mattpocock/skills/blob/main/docs/productivity/grilling.md)）

依你用的 Agent 擇一安裝，不要兩種都裝，否則每個 skill 會出現兩次。（[README](https://github.com/mattpocock/skills/blob/main/README.md)）

```bash
# Claude Code（會自動更新）
claude plugin install mattpocock-skills@claude-plugins-official

# Codex
codex plugin marketplace add mattpocock/skills
codex plugin add mattpocock-skills@mattpocock

# 其他 Agent，或想要可編輯的檔案（需手動更新）
npx skills@latest add mattpocock/skills -a cursor
```

接著在 repo 裡跑一次初始化：

```text
/setup-matt-pocock-skills
```

它會問你用哪個 issue tracker、triage 用哪些標籤、文件要放哪裡。若 repo 裡還有舊的 `CONTEXT.md`，重跑這個指令也會提議用 `git mv` 改名，並更新 `docs/agents/domain.md`。（[domain-modeling 說明](https://github.com/mattpocock/skills/blob/main/docs/engineering/domain-modeling.md)）

最後在 `AGENTS.md` 或 `CLAUDE.md` 加一行。官方 FAQ 指出，較弱或較快的模型常在問完幾題後直接開工，可靠的修法就是明文禁止：（[grilling 說明](https://github.com/mattpocock/skills/blob/main/docs/productivity/grilling.md)）

```markdown
未經我明確同意，不要開始實作。
```

## 什麼時候該用它

`grill-with-docs` 只能由你手動輸入觸發，Agent 不會自己啟動。它適合的情境很窄：**在 repo 裡、改動開始前、需求還模糊、名詞還沒定案，而且一個 session 談得完。**（[grill-with-docs 說明](https://github.com/mattpocock/skills/blob/main/docs/engineering/grill-with-docs.md)）

其他情況改用別的 skill：

- **不在 repo 裡**，例如商業決策或寫作：用 `/grill-me`，同一套拷問但不寫任何檔案。
- **一個 session 裝不下**，例如全新系統或大型功能：用 `/wayfinder`，它會先畫地圖，再在每張決策票裡跑拷問。
- **問題要看到東西才答得出來**，例如「表單要一頁還是三頁」：先用 `/prototype` 做拋棄式版本，看完再回來。

另外，開始前把 plan mode 關掉。plan mode 會逼 Agent 趕快交出計畫，而這個 session 要的是它繼續追問。（[grill-me 說明](https://github.com/mattpocock/skills/blob/main/docs/productivity/grill-me.md)）

## 拷問如何分輪進行

`grilling` 把議題建模成一棵**設計樹**：每個決策底下掛著依賴它的其他決策。可以問的只有**前線（frontier）**，也就是前置決策都已定案的那些問題。每一輪把整條前線一次問完，你答完後前線往外推，下一輪才問被解鎖的問題。（[grilling SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)）

每題固定格式：`❓` 加編號與標題、題目內容、再一行 `➡️` 推薦答案。題目會寫成「回答 yes 就等於接受推薦」，所以你可以只用編號回覆：

```text
1 yes
2 選第二個方案
3 no，原因是退款要等物流確認收貨
```

這個設計還有兩條分工：

- **事實是 Agent 的工作。** 能從檔案系統或工具查到的事，Agent 要派子 Agent 去查，不該問你；查詢期間只有依賴它的題目要等。
- **決策是你的工作。** Agent 自問自答就是這次 run 壞掉了。

前線清空後 session 才結束，而且 Agent 要等你確認「我們已有共同理解」才能動手。

如果你閱讀較慢或用第二語言工作，可以在全域 `CLAUDE.md` 改回一次一題，這是官方支援的設定：

```markdown
When grilling, ask one question at a time.
```

## 實作：替電商加入部分退款

以下用一個虛構但典型的情境走一次。repo 已有訂單與金流程式碼，還沒有 `GLOSSARY.md`。

### 第一步：用一句模糊的話開場

```text
/grill-with-docs 我想讓客服可以對訂單做部分退款
```

刻意不要先寫好規格。這個 session 的目的就是消除模糊，模糊不是延後的理由。（[grill-me 說明](https://github.com/mattpocock/skills/blob/main/docs/productivity/grill-me.md)）

### 第二步：回答第一輪，注意它抓到的詞

第一輪通常會同時出現三類題目。下面是示意，實際措辭會依模型與程式碼而不同：

```text
❓ Q1 - 退款的單位：你說的「部分」是以訂單明細（某幾件商品）為單位，
還是任意金額？程式碼裡 Order.refund() 目前只接受整筆訂單。

➡️ 以訂單明細為單位，另外允許運費單獨退。

---

❓ Q2 - 「退款」與「退貨」：客服說退款時，商品一定要寄回嗎？
這兩個在你的程式碼裡都叫 refund。

➡️ 拆成兩個詞：Return（退貨，有實體商品回流）與 Refund（退款，金流動作）。
```

Q1 是 `domain-modeling` 的「對照程式碼」：你說的和程式碼不一致時，它會直接把程式碼引回來問你。Q2 是「銳化模糊用語」：同一個詞指兩件事時，它會提議拆成兩個標準詞。（[domain-modeling SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)）

這裡要主動。官方點名最常見的失敗模式是被動：四十題全回「同意」，最後得到一份 Agent 寫、你只是點頭的計畫。（[grill-me 說明](https://github.com/mattpocock/skills/blob/main/docs/productivity/grill-me.md)）**我的停止規則：如果一整輪你沒有反駁或修正任何一題，就停下來問自己是不是在點頭。**

### 第三步：看 GLOSSARY.md 在對話中長出來

Q2 一定案，`GLOSSARY.md` 就該立刻被寫入，而不是等 session 結束才一次寫。格式依官方 [GLOSSARY-FORMAT.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/GLOSSARY-FORMAT.md)：每個詞一到兩句、只說它是什麼、被淘汰的同義詞放在 `_Avoid_`、提到其他詞條時加粗。

```markdown
# Ordering

接收並追蹤顧客訂單，從下單到售後處理。

## Language

**Order Line**:
**Order** 中的一項商品與其數量，是退款與退貨的最小單位。
_Avoid_: item, 明細列

**Refund**:
把已收款項部分或全部退回給 **Customer** 的金流動作，不要求商品回流。
_Avoid_: 退錢, chargeback

**Return**:
**Customer** 把一或多個 **Order Line** 的實體商品寄回的流程；完成後可能觸發 **Refund**。
_Avoid_: 退款, RMA
```

檢查重點：裡面不能出現資料表欄位、API 路徑或「用 Stripe 的哪個 endpoint」。`GLOSSARY.md` 只是詞彙表，不是規格、不是草稿區，也不放實作決策。（[domain-modeling SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)）timeout、錯誤型別這類通用程式概念也不放，只收這個 context 特有的詞。

### 第四步：只讓三關全過的決策變成 ADR

第二輪假設出現這題：退款要同步呼叫金流，還是先記成待處理再由背景工作執行？你選了後者，因為金流商 API 偶爾逾時，同步呼叫會讓客服畫面卡住。

這個決策要同時通過三關才寫 ADR：難以回頭、沒有脈絡會令人意外、確實經過取捨。（[ADR-FORMAT.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/ADR-FORMAT.md)）它三關都過，於是 Agent 會「提議」而不是直接寫：

```markdown
# 0001 退款以非同步方式送出

客服發起的 **Refund** 先記錄為待處理，再由背景工作呼叫金流商。
我們放棄同步呼叫，是因為金流商 API 會逾時，而客服操作不能因此卡住；
代價是客服畫面需要顯示「處理中」狀態。
```

ADR 可以就是一段話。反過來，「退款按鈕放在訂單頁右上角」明天就能改，不寫；「金額用整數分儲存」沒有人會意外，也不寫。官方的驗收訊號之一，就是它會拒絕替明天就能撤回的決定寫 ADR，並說出是哪一關沒過。（[domain-modeling 說明](https://github.com/mattpocock/skills/blob/main/docs/engineering/domain-modeling.md)）

依本系列的脈絡，最值得寫 ADR 的是跨 context 的整合方式與邊界歸屬，例如「Billing 只透過 `RefundRequested` 事件得知退款，不直接讀 Ordering 的資料表」。ADR 格式文件也把這兩類列為合格範例。

### 第五步：確認共同理解，再交給下一步

前線清空時，Agent 應該停下來請你確認。確認後，不要開新對話，直接在同一個 session 接 `/to-spec` 產出規格；這次 session 建立的脈絡正是它的價值。（[grill-me 說明](https://github.com/mattpocock/skills/blob/main/docs/productivity/grill-me.md)）

## 多個 context 時改用 GLOSSARY-MAP.md

部分退款談到一半，如果發現 Billing 的「Account」指的是付款主體，和 Ordering 的「Customer」不是同一件事，就是兩個 context 該分開的訊號（判斷方式見 [限界上下文切分訊號](/blog/ddd-bounded-context-god-object-refactoring/)）。

這時在 repo 根目錄放 `GLOSSARY-MAP.md`，各 context 各自有 `GLOSSARY.md` 與 `docs/adr/`，系統層級的決策則留在根目錄的 `docs/adr/`：（[GLOSSARY-FORMAT.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/GLOSSARY-FORMAT.md)）

```markdown
# Glossary Map

## Contexts

- [Ordering](./src/ordering/GLOSSARY.md): 接收並追蹤顧客訂單
- [Billing](./src/billing/GLOSSARY.md): 開立發票與處理金流

## Relationships

- **Ordering → Billing**: Ordering 發出 `RefundRequested`；Billing 消費後執行退款
- **Ordering ↔ Billing**: 共用 `CustomerId` 與 `Money` 型別
```

有了 map，`domain-modeling` 會推斷目前話題屬於哪個 context，判斷不出來就問你。

但不要太早拆。官方建議先把單一 `GLOSSARY.md` 精簡乾淨，只有在它仍然同時涵蓋兩個讀者不想一起記住的領域時，才拆成 map；把一份臃腫的檔案拆開，只會得到好幾份臃腫的檔案。（[domain-modeling 說明](https://github.com/mattpocock/skills/blob/main/docs/engineering/domain-modeling.md)）

## 既有 repo 沒有詞彙表時

在 brownfield 專案裡等詞彙表自然累積會太慢，官方建議直接要求：

```text
/grill-with-docs help me scaffold my existing repo with a GLOSSARY.md
```

有使用者回報這會被問超過 50 題才成形，預留一段完整時間給它。（[domain-modeling 說明](https://github.com/mattpocock/skills/blob/main/docs/engineering/domain-modeling.md)）

## 常見失敗與修法

以下都是官方文件記錄的已知問題：

- **它一次問完所有題目、沒有推薦答案。** 代表 `grilling` 根本沒被載入，模型在即興訪談。這是尚未修好的已知 bug。直接問 Agent 有沒有載入 `grilling` 與 `domain-modeling`，通常就能救回來。（[grilling 說明](https://github.com/mattpocock/skills/blob/main/docs/productivity/grilling.md)）
- **它自問自答。** 常發生在其他 skill 呼叫 grilling 處理工單時。這也是它沒有非同步模式的原因：沒人回答的拷問，產出的只是 Agent 的意見。
- **`GLOSSARY.md` 長到幾百上千行。** 檔案吃進了實作細節與決策。修法是：`/grill-with-docs make my GLOSSARY.md more concise and remove any implementation details from it`。
- **它把幾個月前已在 issue 裡定案的命名衝突又拿出來問。** 它只對照程式碼、`GLOSSARY.md` 與 ADR，不讀 issue tracker。暫時解法是把結論寫進 `docs/agents/domain.md`。（[domain-modeling 說明](https://github.com/mattpocock/skills/blob/main/docs/engineering/domain-modeling.md)）
- **問了兩百題。** 通常是範圍太大。先請 Agent 拆小，再分別拷問，或改用 `/wayfinder`。

官方也坦白列了不值得用的情況：一天就做完的小東西不必建詞彙表；沒人審查、由 Agent 自己寫的詞彙表比沒有更糟，因為後續 session 會把裡面那些自信的錯誤當成事實。它也不會替你發明你自己都不懂的領域語言；對錯誤的概念套上正確的名詞，產出看起來對、其實不對。（[domain-modeling 說明](https://github.com/mattpocock/skills/blob/main/docs/engineering/domain-modeling.md)）

## 怎麼判斷這次 session 有效

session 結束後用這份清單檢查，整理自官方的「It's working if」段落：

- 它曾在你說到一半時打斷你，問你指的是兩件事中的哪一件。
- `GLOSSARY.md` 在對話**進行中**就有變動，而不是最後一次寫完。
- 新詞條一到兩句說清它是什麼，並在 `_Avoid_` 列出被淘汰的說法。
- 它曾把你的程式碼引回來，指出和你說的話矛盾。
- 它曾拒絕寫某個 ADR，並說出哪一關沒過。
- 後面幾輪問的，是第一輪不可能問出來的問題。
- 最後它停下來等你確認，而不是直接開工。

## 下一步

挑一個下週要開工、名詞還沒定的功能，跑一次 `/grill-with-docs`。結束後只做一件事：在 code review 時打開 `GLOSSARY.md`，檢查新程式碼的模組名、資料表名、狀態 enum 有沒有用上剛定案的詞。官方文件也指出，同義詞控管最有價值的地方正是這些命名邊界，而不是一般敘述文字。

## 參考資料

- [mattpocock/skills README](https://github.com/mattpocock/skills/blob/main/README.md)：安裝與初始化。
- [grill-with-docs SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md) 與 [說明文件](https://github.com/mattpocock/skills/blob/main/docs/engineering/grill-with-docs.md)。
- [grilling SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md) 與 [說明文件](https://github.com/mattpocock/skills/blob/main/docs/productivity/grilling.md)：設計樹、前線、分輪與常見問題。
- [grill-me 說明文件](https://github.com/mattpocock/skills/blob/main/docs/productivity/grill-me.md)：被動點頭的失敗模式、何時接 to-spec。
- [domain-modeling SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)、[GLOSSARY-FORMAT.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/GLOSSARY-FORMAT.md)、[ADR-FORMAT.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/ADR-FORMAT.md) 與 [說明文件](https://github.com/mattpocock/skills/blob/main/docs/engineering/domain-modeling.md)。
