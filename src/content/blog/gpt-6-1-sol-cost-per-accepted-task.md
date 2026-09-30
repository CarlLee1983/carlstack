---
title: "GPT-6.1 Sol 發布：換模型前，先量每個驗收任務的成本"
description: "整理 GPT-6.1 Sol 的發布資訊、API 遷移限制與價格條件，並把首日回饋轉成可執行的模型評估：比較驗收率、重試、延遲與人工修正成本。"
publishDate: 2026-09-30T10:30:40+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 技術選型
series: AI Agent 工程化與工作流實戰
seriesOrder: 37
cover: ../../assets/covers/gpt-6-1-sol-cost-per-accepted-task.png
coverAlt: "暖白紙雕中，多條嘗試路徑匯入圓形驗收孔，只有一枚朱紅色成品通過，象徵以完成驗收的任務衡量總成本。"
---

GPT-6.1 Sol 在 2026 年 9 月 29 日發布。OpenAI 將它定位為以較低成本處理複雜程式開發、電腦操作與專業工作的模型，並要求使用者在自己的任務上與 Astra 比較品質與成本。[API 更新紀錄](https://developers.openai.com/api/docs/changelog)與[模型選擇指引](https://developers.openai.com/api/docs/guides/model-selection)支持這個定位，但定位本身還不是你的專案會省錢的證據。

我的判斷是：它值得進入日常 Agent 工作流的候選清單，但換模型前應先量每個通過驗收的任務付出多少成本。一次回答便宜，若多跑兩次、又增加人工修正，整個工作仍可能更貴。

本文資料查核截至 2026 年 9 月 30 日。研究範圍涵蓋近 30 天，但 GPT-6.1 Sol 才剛發布，不能把首日討論寫成一個月的使用趨勢，也不能把本文視為實測報告。

## 已經發布，不代表每個入口都已開放

OpenAI 的 API 更新紀錄明確列出 `gpt-6.1-sol`，並記載它支援 Responses API 的 Multi-agent beta。這是 API 能力的發布資訊，不能直接推導成所有 ChatGPT 方案、所有介面都同時有相同功能。[2026-09-29 更新紀錄](https://developers.openai.com/api/docs/changelog)

GitHub 同日在官方 changelog 宣布 GPT-6.1 Sol 已在 Copilot 正式提供，逐步向 Pro+、Max、Business 與 Enterprise 使用者推出。企業管理者仍能透過模型政策控制存取，因此模型選單尚未出現時，應先檢查方案、推出進度與組織設定。[GitHub Copilot 發布公告](https://github.blog/changelog/2026-09-29-gpt-6-1-sol-in-github-copilot/)

GitHub 也表示，早期測試中它完成任務所用的 token 與步驟，比 GPT-6、GPT-5.6 家族的較早模型少。這是供應方測試觀察，公告沒有提供足以重現比較的完整任務集與統計，不能將它轉寫成「所有程式開發任務都更快」。對工程團隊，它比較適合用來提出評估假說：同一個修 bug 任務，重試與工具步驟是否真的下降？

## API 遷移有兩個容易漏掉的條件

截至查核日，GPT-6.1 Sol 的 `reasoning.effort` 支援 `low`、`medium`、`high`、`xhigh`、`max`，預設為 `medium`，不支援 `none` 與 `minimal`。沿用舊請求設定前，先檢查實際送出的值，不能假設每個 GPT-6 模型接受相同參數。[GPT-6 使用指引](https://developers.openai.com/api/docs/guides/latest-model)

第二個條件影響 Agent 更直接：**GPT-6.1 Sol 的工具呼叫必須使用 Responses API。** Chat Completions 支援不帶工具的請求；若既有流程透過 Chat Completions 呼叫工具，只改模型 ID 並不構成完整遷移。[GPT-6 使用指引](https://developers.openai.com/api/docs/guides/latest-model)

因此，遷移評估應分成兩件事：確認 endpoint 與參數相容，再比較模型行為。若同時更換模型、API、prompt 與工具契約，失敗時就很難辨認是哪一項造成差異。先保留相同的輸入、驗收標準與工具語義；API 必須調整時，把它記為另一個變因。

## 百萬 context 是容量，272K 是計費轉折

官方模型頁列出 1,050,000 token 的 context window 與 128,000 token 的最大輸出。輸入支援文字與圖片，輸出為文字；音訊與影片不在支援模態內。模型可以使用 image generation 工具，不代表模型本身的輸出模態就是圖片。[模型規格](https://developers.openai.com/api/docs/models/gpt-6.1-sol)

價格要連同條件一起讀。截至查核日，Standard、輸入不超過 272K token 的請求，每百萬 token 計價為：

- 輸入：US$2。
- 快取輸入：US$0.10。
- 快取寫入：US$2.50。
- 輸出：US$10。

輸入超過 272K 時，整個請求的輸入與快取費率變為兩倍，輸出費率變為 1.5 倍。Fast 模式另有倍率，Batch 與 Flex 則有不同價格；區域處理也可能加價。它們不是同一張帳單可以任意混用的折扣。[模型頁的計費條件](https://developers.openai.com/api/docs/models/gpt-6.1-sol)

這會改變長 context 的使用方式。把整個 repository 塞進 prompt，可能避免一次搜尋，卻同時跨過價格門檻。是否划算，要比較取回必要檔案的工具成本、漏掉資訊的失敗成本，以及全量輸入的計費，不能只看模型「放得下多少」。

## 首日討論支持比較成本，還不足以宣布勝負

Artificial Analysis 在 2026 年 9 月 29 日公布自己的評測：在 `max` effort 下，GPT-6.1 Sol 的 Intelligence Index 比 Astra 少一分，每個該指標任務的成本為 US$0.72，Astra 為 US$3.26。這提供了獨立於產品定位的量化訊號，但它仍是特定評測集合的結果，不能直接代入你的程式開發預算。[Artificial Analysis 原始評測](https://artificialanalysis.ai/articles/gpt-6-1-sol-replaces-gpt-6-sol-after-just-7-days-with-near-astra-intelligence)

社群反應也圍繞這個取捨。在 r/singularity 的評測討論中，u/artin144 用「but cheaper」回應排名落後的說法；這句話代表有人重視價格，沒有證明品質已達到所有人的要求。[原始討論](https://www.reddit.com/r/singularity/comments/1wtixue/aa_intelligence_index_results_came_for_gpt61_sol/)

另一邊，u/Nomad556 在發布討論寫下「I literally can’t keep up or know the difference」，反映快速更新造成的辨識負擔。[原始留言](https://reddit.com/r/OpenAI/comments/1wtg4f3/comment/pctug3d/) 與其要求團隊追逐每次名稱更新，我會把模型版本與驗收結果綁在一起：哪一批任務改善、哪一批退步、設定是否相同，都比「大家說變強了」更容易成為決策依據。

這些留言是首日個人反應，不是代表性使用者調查。本文也沒有執行跨模型實測；接下來的步驟是把可查核的價格與評測訊號，轉成團隊自己的比較方法。

## 把省錢的主張改成能驗收的實驗

以下是本文提出的評估方法，不是 OpenAI 公布的 benchmark。先選一批團隊已知答案與驗收方式的任務，例如 20 個既有 bug、10 個跨檔案小功能與 10 個文件整理工作。每個模型使用相同起點、相同工具權限與相同時間上限；有副作用的工作放在隔離環境，避免比較結果受外部狀態污染。

已使用 Responses API 的流程，第一輪保留原有 Harness，只更換模型。仍使用 Chat Completions 工具呼叫的流程，先完成 Responses 適配，以同時支援的基準模型驗證工具契約，再固定這個基線比較 GPT-6.1 Sol；不要把 endpoint 遷移的差異歸因於模型。至少記錄五種結果：

1. 任務是否通過獨立驗收，例如回歸測試、實際操作或資料不變量。
2. 全部嘗試的 API 與工具費用，包含失敗與重試。
3. 完成時間與超時比例，區分平均值與長尾。
4. 人工修正時間，避免把模型省下的費用轉嫁給 reviewer。
5. 越界修改、無證據的完成宣告與工具誤用，單獨記錄，不能被平均分數掩蓋。

最小的比較式可以寫成：

```text
每個驗收任務的模型與工具成本
= 全部嘗試的模型與工具總費用 / 通過驗收的任務數
```

人工修正時間另列；若團隊有一致的內部工時成本，再換算進總成本。通過數為零時，不報一個看似正常的單位成本，直接視為未達標。任務類型也要分開算：文件摘要的節省，不能抵消資料遷移的失敗。

**停止規則：若驗收率下降、出現不可接受的越界行為，或人工修正超過既定上限，就停止擴大切換。** 上限由團隊在實驗前寫下，避免看到便宜的 token 費率後才修改標準。

## 模型評估通過後，再動 Harness

第二輪才測試是否能刪除舊流程中的固定拆解、重複摘要或角色接力。把「舊模型搭配舊 Harness」「新模型搭配舊 Harness」「新模型搭配精簡 Harness」分開量測，才能辨認收益來自模型，還是來自流程簡化。

這延續了[模型變強後，Harness 該先刪什麼](/blog/harness-pruning-after-model-upgrade/)的判斷：可以挑戰原有編排，但外部狀態、操作權限與獨立驗收仍有自己的責任。GPT-6.1 Sol 提供成本較低的候選選項，不會自動替系統處理 timeout 後是否已寫入、哪些操作已獲授權，以及最終產物是否真的可用。

若你的目標是長時間持續工作，也可接續閱讀[OpenAI dots 的持續任務控制](/blog/openai-dots-ongoing-work-control/)。模型選擇回答「由誰推理」，任務控制回答「何時繼續、停止與交還使用者」，兩者需要各自的驗收依據。

下一步不用全面切換。從一組可重現的既有任務開始，固定驗收條件，讓 GPT-6.1 Sol 與現有模型跑同一批輸入。等成本、通過率與人工修正資料一起成立，再決定哪些任務改用它。
