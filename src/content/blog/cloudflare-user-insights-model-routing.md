---
title: "Cloudflare 找出模型用得太重的任務，分流前仍要驗收品質"
description: "Cloudflare AI Gateway 於 9 月 29 日新增任務與模型分析。本文將 Potential Savings 轉成可驗證的分流流程：固定任務分類、重跑品質測試，再以版本化規則逐步導入。"
publishDate: 2026-09-30T11:48:30+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 技術選型
series: AI Agent 工程化與工作流實戰
seriesOrder: 39
cover: ../../assets/covers/cloudflare-user-insights-model-routing.png
coverAlt: "俯視精密量測工作台，大小不同的工具與通過圓形量規的小型零件，象徵先驗證任務適配，再選擇足夠的模型。"
---

把摘要、欄位抽取與複雜除錯全部交給同一個高階模型，部署很簡單，帳單卻難以回答一個問題：哪些任務其實可以用更便宜的模型完成？Cloudflare AI Gateway 現在提供了找候選任務的入口；要把候選變成正式分流，還差自己的品質驗收。

[Cloudflare 於 2026 年 9 月 29 日發布的公告](https://developers.cloudflare.com/changelog/post/2026-09-29-user-insights-task-analysis/)說明，User Insights 新增依任務分組對話、追蹤對話回合，以及比較模型適用性、成本與延遲的分析。Potential Savings 則標出可能適合更快或更低價模型的請求。新增分析向所有 AI Gateway 客戶提供，不另收費；這不代表模型推論與日誌儲存都免費。

我的判斷是：先把它當成實驗選題工具。挑一類低風險、可重跑、有明確驗收的工作，測過再改路由。本文查核截至 2026 年 9 月 30 日，沒有執行跨模型實測；下文的分類、閾值與 rollout 方法是工程建議，不是 Cloudflare 提供的品質保證。

## 9 月新增的是任務分析，既有功能是身分與用量觀測

User Insights 並非 9 月才首次出現。[8 月 5 日公告](https://developers.cloudflare.com/changelog/post/2026-08-05-user-insights/)已提供組織花費與個別使用者用量的觀測。9 月這次更新的重點，是往「正在做什麼任務、模型是否用得太重」延伸，讓成本討論能從使用者與模型總額，轉到任務類別。

這兩種觀測不能混為一談。一個使用者花很多錢，可能只是處理更多必要工作；一個請求被列為節費候選，也不代表它的輸出已通過你的業務標準。[User Insights 文件](https://developers.cloudflare.com/ai-gateway/observability/user-insights/)還指出，沒有身分或自訂 metadata 時，流量會合併在匿名識別下。要分辨誰在花費，可傳入使用者識別或整合 Cloudflare Access。

因此，先檢查觀測能否對回應用端的工作。至少保留任務 ID、任務類型、模型與設定版本，並在自己的評估紀錄附上驗收結果。不要把儀表板分類直接視為團隊已定義的工作契約，也不要假設新增分析已提供自訂驗收規則的匯入介面。

## 任務分析要先開啟，資料處理範圍也要先確認

[Log classification 文件](https://developers.cloudflare.com/ai-gateway/observability/log-classification/)說明，任務與模型分析由日誌分類提供，預設關閉。必須在選定 gateway 的 Settings 同時啟用 Collect logs 與 Log classification；只有兩者啟用期間記錄的活動才符合分類條件。啟用一個 gateway，不會同步啟用帳號內其他 gateway。

分類會分析儲存的請求與回應內容，可能包含 prompt、模型回答、metadata，以及用來關聯對話的識別。導入前要確認這批流量是否適合進入分析，不能將一般用量觀測的「不需額外設定」套用到任務分類。關閉分類會停止新活動的分類；既有結果與正在處理的工作仍受保留與刪除政策約束。

還要把可能增加的日誌費用列入淨節省。[Logging 文件](https://developers.cloudflare.com/ai-gateway/observability/logging/)指出，首次建立 gateway 在 2026 年 9 月 24 日或之後的新客戶適用 Workers Logs 的價格與保留規則，較早客戶使用 Legacy Logs。是否產生額外費用取決於方案與用量；新增分析不另收費，不等於啟用所需的觀測成本一律為零。

官方模型適配分類包含 Overkill、Appropriate、Underpowered 與 Could not assess。最後一類尤其值得保留：無法判定的工作應留在未決清單，不能為了提高自動分流比例，直接塞進低價模型分支。

## Potential Savings 提出假說，驗收定義由你負責

[AI Gateway 更新紀錄](https://developers.cloudflare.com/ai-gateway/changelog/)表示，節費分析使用的訊號也用於 Cloudflare Auto Router，依任務與成本選模型。公告沒有附上足以驗證所有業務情境的評估集、錯誤分布或節省率；「可能改用便宜模型」仍需要在自己的資料上驗證。

對欄位抽取而言，JSON 可以解析只是第一關，欄位是否忠於來源才是結果。對文件摘要而言，字數合規仍可能漏掉限制條件。對程式修補而言，測試通過後還要確認需求真的成立。HTTP 200、回答流暢與模型自評，都不能單獨作為驗收。

可以先把日常任務分成三類，選第一類開始：

- 固定欄位抽取：有 schema、來源對照與缺值處理規則，容易建立可重跑的判準。
- 有來源的摘要：要驗證關鍵事實、限制條件與引用，通常需要人工抽查或獨立評估。
- 開放式推理與變更：需求範圍、工具副作用與錯誤代價較難固定，保留原路由直到取得足夠證據。

**停止規則：無法寫出獨立驗收條件的任務，先不自動降級。** 先修補觀測或測試，比直接接受節費建議更容易找出失敗原因。

## 把分類與驗收綁在同一份實驗紀錄

Cloudflare 的[自訂 metadata](https://developers.cloudflare.com/ai-gateway/observability/custom-metadata/)可讓請求攜帶應用脈絡。建議由可信任的應用端產生分類，避免讓使用者輸入直接決定內部模型政策。下列 YAML 是團隊自訂的評估契約示意，不是 AI Gateway 可直接匯入的路由設定：

```yaml
task_type: invoice_field_extraction
task_version: v1
evaluation_set: invoices-held-out-v1
baseline_model: current-approved-model
candidate_model: lower-cost-compatible-model
acceptance:
  schema_valid: required
  critical_fields_exact_match: required
  unsupported_value: reject
measurement:
  - accepted_tasks
  - total_inference_cost_including_retries
  - end_to_end_latency_p95
  - human_correction_minutes
rollout:
  initial_candidate_percent: 5
  rollback_on_critical_field_error: true
```

`5` 是示範的初始比例，應依風險與流量調整。評估集要包含格式異常、缺值、長輸入與不同語言，並保留未參與調整的樣本。對同一批任務固定 prompt、工具、快取策略與參數；候選模型不相容時，將必要的介面修改記為另一個變因。

成本比較也要沿著任務結束，而不是停在第一次回應：

```text
每個驗收任務的模型成本
= 該批任務全部模型費用（含失敗、重試與升級）
  ÷ 最終通過驗收的任務數
```

通過數為零時，不計算有意義的單位成本，直接判定該候選未達要求。人工修正時間、工具與日誌費用另列，避免把品質退步藏在低價 token 後面。這份紀錄可以接上站內的[逐輪成本記帳方法](/blog/agent-loop-cost-ledger/)；兩者分別回答「錢花在哪一輪」與「哪些任務值得換模型」。

## 分流規則可以版本化，品質升級要由應用端執行

[Dynamic Routing 文件](https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/)支援依 body、headers 或 metadata 判斷條件，也支援比例分流、模型節點與版本回復。通過離線驗收後，可將應用端的 `task_type` 對應到已驗證的候選模型；未知類別沿用原模型。先讓小比例流量進入候選分支，再依實際驗收結果擴大。

這裡有一個容易漏掉的邊界：[模型節點的 `success`](https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/json-configuration/)表示模型成功開始串流回應，`fallback` 則處理重試後失敗或逾時。它不是對內容品質的判斷。若回應缺欄位或引用錯誤，應用端驗收器必須拒收，並決定升級重跑或交由人工處理；不要把供應商錯誤 fallback 當成業務驗收器。

對串流場景尤其要先決定何時交付。需要完整 JSON 驗證的結果，應完成檢查後才交給下游；具有外部副作用的工具，不應因為重跑而重複執行。候選品質出現關鍵錯誤時，回復已知可用的 route 版本，保留失敗樣本與實驗版本，再調整分類。

截至查核日，Dynamic Routing 仍標示為 beta；[官方呼叫文件](https://developers.cloudflare.com/ai-gateway/usage/chat-completion/)要求透過 OpenAI-compatible `/compat/chat/completions` 呼叫動態路由，尚不能用新的推論 REST API 呼叫。選候選前先驗證 endpoint、工具與輸出格式相容性，不能只換模型名稱。本文沒有在實際帳號部署這套規則，也不宣稱它已節省任何比例的費用。

## 下一步：把一個節費候選變成可回復的實驗

今天先挑一類欄位抽取工作，從 Potential Savings 找到候選模型，建立固定樣本與關鍵欄位的拒收規則。保留原模型結果，重跑候選，記錄驗收率、每個成功任務的總模型成本與端到端 p95 延遲。只在品質達標且成本確實下降後，才建立小比例、可回復的路由版本。

若你正在比較新模型，可以接著讀[換模型前先量每個驗收任務的成本](/blog/gpt-6-1-sol-cost-per-accepted-task/)。讓儀表板負責找線索，讓自己的測試負責決定是否上線；下一次分流才有可以重現的依據。
