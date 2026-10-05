---
title: "錄下 AnswerMe 的操作後，我更想讓人檢查解說從哪裡來"
description: "以 AnswerMe 的 TicketService 操作實錄和離線 HTML 成品，檢查 Agent 如何讀取程式、執行測試、指出 README 與實作的衝突，以及錄影本身不能證明什麼。"
publishDate: 2026-10-05T20:45:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 開源專案
  - 專案復盤
series: AI Agent 工程化與工作流實戰
seriesOrder: 64
repositoryUrl: https://github.com/CarlLee1983/AnswerMe
cover: ../../assets/covers/answerme-demo-source-grounded-explanation.png
coverAlt: "桌上的螢幕顯示從提問到流程圖與來源標記的三段解說，底部播放時間軸和指向證據的手指，象徵可重看、可查核的操作示範。"
---

我替 [AnswerMe](https://github.com/CarlLee1983/AnswerMe) 做了[專案網站](https://carllee1983.github.io/AnswerMe/)，也請 AI 錄下使用它的過程。操作實錄讓人很快看見：Agent 接到問題後，讀了什麼、跑了什麼，最後交出什麼。但我更希望看完的人能繼續問一句：**解說裡的判斷，能回到原始材料核對嗎？**

先前的〈[我為什麼做 AnswerMe](/blog/answerme-vibe-coding-understanding-debt/)〉談的是動機。這篇分開看一段操作錄影，以及網站另存、經人工核對的同題 HTML 範例，說明兩種材料各能證明什麼。

## 先給它一個有明確答案的問題

使用的材料是小型的 [`ticket_api`](https://github.com/CarlLee1983/AnswerMe/tree/v0.1.3/tests/answer-me/evidence/input/ticket_api)：一份 README、`service.py` 和單元測試。問題是 `TicketService` 與 `FakeRepo` 誰先呼叫誰、首次與再次讀取同一張票有何差別，以及找不到票時會怎麼回覆。[專案網站展示了這份請求、操作錄影與同題範例](https://carllee1983.github.io/AnswerMe/)。

這組材料還藏著一個適合檢查解說能力的衝突：[README](https://github.com/CarlLee1983/AnswerMe/blob/v0.1.3/tests/answer-me/evidence/input/ticket_api/README.md)寫快取會在 60 秒後過期，[`service.py`](https://github.com/CarlLee1983/AnswerMe/blob/v0.1.3/tests/answer-me/evidence/input/ticket_api/service.py#L15-L25)卻只用普通的 `dict` 保存結果，沒有時間或過期判斷。照抄 README 的解說會顯得完整，但會讓讀者誤解實際行為。

## 看一次操作，再核對另存的範例

下面是[專案網站的操作實錄](https://carllee1983.github.io/AnswerMe/)。錄影約 53 秒；等待思考與生成的段落已加速，因此片長不能用來推算完成任務所需時間。這是操作錄影，AnswerMe 交付的成果是解說文字或檔案，並不以產生影片為預設能力。

<video controls playsinline preload="metadata" poster="/images/answerme-demo-poster.webp" width="1280" height="760" style="display:block;width:100%;height:auto;margin:1.5rem 0" aria-label="AnswerMe 操作實錄：讀取 ticket_api、執行測試、詢問輸出格式並交付 HTML">
  <source src="https://carllee1983.github.io/AnswerMe/assets/demo.webm" type="video/webm">
  <source src="https://carllee1983.github.io/AnswerMe/assets/demo.mp4" type="video/mp4">
  你的瀏覽器無法播放影片時，可以<a href="https://carllee1983.github.io/AnswerMe/assets/demo.mp4">開啟 MP4 操作實錄</a>。
</video>

這次請求沒有預先指定交付格式。錄影裡，Agent 先讀取材料並執行測試，整理核心答案後，詢問要 HTML、Markdown 還是直接在對話中回答；選擇 HTML 後才開啟 `ticket_api_flow.html`。這與 [AnswerMe 的格式規則](https://github.com/CarlLee1983/AnswerMe/blob/6f868d14ad620ffe86c9694bae7ff7aabd27e48e/skills/answer-me/SKILL.md#確認交付格式)一致。

網站還提供[可直接開啟的 `ticket.html` 解說範例](https://carllee1983.github.io/AnswerMe/examples/ticket.html)，標示由 AnswerMe v0.1.3 產生並經人工核對。它使用同一組 `ticket_api` 材料，但檔名與頁面標題都和錄影中的產物不同；公開材料沒有建立兩份 HTML 的版本關係。以下檢查的是網站保存的 `ticket.html`，不把它當作錄影原檔。

## 成品留下三個可以逐項查的判斷

### 首次讀取與再次讀取

成品把呼叫順序畫成時序圖：第一次讀取時，`TicketService` 的 cache 未命中，才呼叫 `FakeRepo.find`；第二次讀同一張票時，從 cache 直接回傳，不再呼叫 repo。讀者可以拿[`service.py` 第 18–25 行](https://github.com/CarlLee1983/AnswerMe/blob/v0.1.3/tests/answer-me/evidence/input/ticket_api/service.py#L18-L25)與[`test_repeat_hit`](https://github.com/CarlLee1983/AnswerMe/blob/v0.1.3/tests/answer-me/evidence/input/ticket_api/test_service.py#L5-L10)核對這條路徑，而不必只相信圖上的箭頭。

### 找不到票時的回覆

找不到票時，`FakeRepo.find` 回傳 `None`，`get_ticket` 拋出 `NotFound`，最後由 `handle_get` 接住並回傳 `(404, {"error": "not found"})`。[成品的找不到票段落](https://carllee1983.github.io/AnswerMe/examples/ticket.html#missing)和[`service.py` 第 21–31 行](https://github.com/CarlLee1983/AnswerMe/blob/v0.1.3/tests/answer-me/evidence/input/ticket_api/service.py#L21-L31)可以相互對照。這裡的 404 是範例函式回傳 tuple 中的狀態碼，材料沒有真實 HTTP 服務。

### README 與程式說法不一致

[成品的證據與限制](https://carllee1983.github.io/AnswerMe/examples/ticket.html#sources)沒有把「60 秒過期」寫成已實作的行為，而是並列 README 的聲明與程式中缺少過期邏輯的事實，再保留哪個才是預期設計的疑問。對我而言，這比產出漂亮的流程圖更重要：當材料衝突，解說應該指出衝突，不能替專案猜一個答案。

## 錄影是入口，來源與測試決定結論的範圍

這段錄影證明一次操作曾走到 HTML 交付，也讓人觀察 Agent 如何要求格式和檢查材料。它沒有證明 AnswerMe 在每個 repo、每次執行都能找出文件與程式的落差。網站保存的 [HTML 範例](https://carllee1983.github.io/AnswerMe/examples/ticket.html)只支持對那份成品的核對，無法替錄影中未公開的原檔背書；[專案的演練說明](https://github.com/CarlLee1983/AnswerMe/blob/6f868d14ad620ffe86c9694bae7ff7aabd27e48e/tests/answer-me/README.md)要求用原始材料重新產生答案，才能評估目前的 skill。

如果要在自己的專案試 AnswerMe，先挑一條自己說不清楚的請求路徑，請它附上程式位置說明，再核對一個正常分支和一個例外分支。[安裝與首次試用方式在專案 README](https://github.com/CarlLee1983/AnswerMe#安裝-skill)。能指出來源、區分推論與未確認之處，才是這份解說值得留下的理由。

## 來源與查核範圍

- [AnswerMe 專案網站與操作實錄](https://carllee1983.github.io/AnswerMe/)：操作順序與公開展示；錄影中的等待片段已加速。
- [另存且經人工核對的 TicketService 解說範例](https://carllee1983.github.io/AnswerMe/examples/ticket.html)與 [v0.1.3 原始材料](https://github.com/CarlLee1983/AnswerMe/tree/v0.1.3/tests/answer-me/evidence/input/ticket_api)：核對該範例中的呼叫路徑、來源衝突與限制；它不是錄影原檔。
- [AnswerMe 技能規則](https://github.com/CarlLee1983/AnswerMe/blob/6f868d14ad620ffe86c9694bae7ff7aabd27e48e/skills/answer-me/SKILL.md)與[演練說明](https://github.com/CarlLee1983/AnswerMe/blob/6f868d14ad620ffe86c9694bae7ff7aabd27e48e/tests/answer-me/README.md)：核對格式選擇與驗證邊界。

資料查核日期：2026-10-05。本文沒有重跑 AnswerMe 的生成演練；對錄影流程與另存範例的判讀，以各自公開的材料和 repository 原始檔為準。
