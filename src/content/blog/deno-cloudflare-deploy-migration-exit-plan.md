---
title: "Deno Deploy 六個月後停運，遷移驗收要包含資料回滾"
description: "Deno 團隊加入 Cloudflare 後，Deploy 停運與 runtime 維護各有期限。用依賴盤點、Webhook 行為測試、單一寫入來源與退出條件，規劃可驗收的遷移，並釐清 celld／workerd 自架方向的限制。"
publishDate: 2026-10-10T10:00:46+08:00
draft: false
featured: false
tags:
  - 系統設計
  - 技術選型
  - 開源專案
cover: ../../assets/covers/deno-cloudflare-deploy-migration-exit-plan.webp
coverAlt: "厚塗油畫中的渡船載著形狀各異的模組，從舊碼頭駛向擺有對照零件的新碼頭，象徵遷移前盤點相依並核對行為。"
---

Deno Deploy 上的服務，現在需要一份能排進工作週期的搬遷計畫。我的建議是先找出誰負責資料寫入、哪些失敗會觸發重試，再選遷移目的地。首頁能回傳 200，還不足以證明訂單通知、排程與資料都搬好了。

依 Ryan Dahl 於 2026 年 10 月 9 日發布的 [Deno 公告](https://deno.com/blog/cloudflare)，整個團隊加入 Cloudflare。既有使用者面對幾項不同的安排：

- Deno Deploy 再營運六個月後關閉；付費客戶遷往 Cloudflare Workers 可獲遷移支援。
- Deno runtime 再維護一年，每月發布錯誤修正與安全更新，之後原團隊停止開發。程式仍然開源。
- JSR 繼續營運，基礎設施移到 Cloudflare。

公告沒有列出精確停機時刻。專案應向供應商確認適用日期，並替演練留下餘裕；也不能把 runtime 的一年維護期當成 Deploy 還有一年可用。本文是依公告整理的遷移設計，沒有執行實際搬遷或量測新平台效能。

## 依賴盤點要能指向一個驗收案例

「使用 Deno」可能只代表 CI 執行工具，也可能代表整個正式服務依賴 Deploy。兩者的待辦量不同。我會替每個入口建立一張紀錄，寫下負責人、目前版本、替代方式與驗證證據，未知項目也要保留。

- 執行環境：搜尋 `Deno.*`、套件載入方式、原生模組、檔案與網路存取。每項都在候選環境實跑，不能從 TypeScript 編譯成功推定相容。
- 持久資料：列出資料庫、KV、物件儲存與本機暫存的用途，確認匯出格式、交易要求、到期時間及備份還原方式。沒有使用的項目標成不適用。
- 非 HTTP 工作：列出排程、佇列消費、重試與長連線，記下停止舊工作和啟動新工作的順序，避免兩邊同時處理同一任務。
- 部署周邊：核對環境變數名稱、機密的重新設定、網域、憑證、日誌、告警與第三方 callback URL。盤點文件只記機密名稱與用途，不放值。

例如「訂單事件寫入 KV」仍太粗。可驗收的描述是「同一事件重送時只產生一次業務效果；改用另一種儲存後，併發重送也必須成立」。這才足以決定 adapter 要保留什麼行為，以及哪個測試失敗就不能切流量。

## 相同行為，要在逾時與重送時仍然成立

下面是本文設計的測試規格，未執行，也不是 Deno 或 Workers 的設定檔。假設服務收到訂單事件後更新狀態，再寄一封通知；新舊環境各自使用相同初始資料的隔離副本，外寄一律導向測試收件端。

```yaml
fixture: order-webhook-migration
event_id: evt-migration-001
order_id: order-test-001
initial_status: pending
incoming_status: confirmed
reset_state_before_each_case: true
cases:
  - valid_event_once
  - same_event_twice_sequentially
  - same_event_twice_concurrently
  - response_lost_after_commit_then_redelivery
assert_after_queue_drained:
  order_status: confirmed
  applied_event_count: 1
  notification_effect_count: 1
```

規格刻意檢查「寫入已提交，但回應丟失」：呼叫端看到逾時而重送時，接收端要辨識事件已完成。測試端必須能注入這個故障，並檢查通知結果；只數 handler 執行次數，抓不到重複寄信。這些是範例應用的驗收要求，不代表任何平台自動提供恰好一次交付。

另外加入錯誤簽章、過期事件、原始 body 位元組與字元編碼案例，確認入口轉換沒有破壞驗證。相關設計可接著讀站內的〈[Webhook 簽章、重試與死信處理](/blog/webhook-system-architecture-hmac-retry-dlq/)〉。若舊站本來就會重複執行，應把它記為待修缺陷，不能因新舊都錯就判定通過。

行為通過後，再以相同輸入、併發與資料量比較錯誤率、尾端延遲、佇列積壓及成本。門檻由服務需求決定；本文沒有一組可套用所有應用的效能數字。

## 流量切得回去，資料也要跟得回去

遷移期間，每個切換單位都要有唯一的正式寫入來源。例如按租戶分批搬遷，就明確記錄各租戶由哪一邊接受寫入；影子執行不能另寄真實通知，也不能讓兩邊的排程各跑一次。

如果新舊程式共用同一資料庫，回滾仍取決於舊程式能否讀懂新寫入。若連儲存都更換，切回舊站前還要處理搬遷後新增的資料、未完成工作與重試進度。只保留舊部署和 DNS 設定，救不回這些差異。站內〈[藍綠、金絲雀與資料庫擴展收縮](/blog/modern-cicd-deployment-strategies-blue-green-canary-rolling/)〉可用來規劃切換順序，但資料同步仍須另做演練。

我會要求演練紀錄回答：誰下令停止擴流、怎麼暫停新寫入、最後一筆一致資料在哪裡，以及恢復到可服務狀態花多久。無法安全回送資料時，備案可能是短暫唯讀或暫停特定功能，必須事前由業務負責人接受。

**停止規則：出現重複業務效果、無法對帳的資料差異，或演練超過已核准的恢復時間，就停止擴流。** 回滾操作只能走已驗證的路徑；未驗證的資料庫反向轉換不應在事故當下臨時執行。

## celld 與 workerd 提供方向，退出條件仍需自己驗證

[Cloudflare 同日的聯合公告](https://blog.cloudflare.com/deno-joins-cloudflare/)說明，團隊將把 celld 的程式與想法整合回 workerd，改善 Workers 與 Durable Objects 的自架體驗。公告也承認，當時 workerd 的 Durable Objects 支援仍限於單一實例，周邊服務與工具尚有缺口。

因此，我會把這條路列入技術評估，並另外驗收多節點故障、資料還原與維運責任。公告中的整合計畫，不能當成今天已有一套完整、可直接替換 Deploy 的成品；runtime 開源也不會自動替應用補齊這些能力。

遷移完成的條件可以直接放進工單：

- 所有正式入口、排程及外部 callback 都有負責人與新去向，沒有未處理的相容性缺口。
- 行為測試、資料對帳與備份還原都有可重跑的紀錄，恢復時間符合服務要求。
- 新環境觀察期涵蓋實際尖峰與必要排程週期，錯誤率、積壓與成本在事先約定的範圍內。
- 確認舊環境不再接收新工作，完成最後對帳與必要留存後，才撤掉舊排程、權限和資源。

下一步可以只選一條會寫資料的 API：今天完成依賴紀錄與上述重送測試規格，排一次回滾演練。它會比「整站預計搬到 Workers」更早暴露需要處理的缺口。

## 來源與查核範圍

- Ryan Dahl，[Deno is joining Cloudflare](https://deno.com/blog/cloudflare)，2026-10-09：團隊去向、Deploy、runtime 與 JSR 的後續安排。
- Kenton Varda、Ryan Dahl，[Deno is joining Cloudflare](https://blog.cloudflare.com/deno-joins-cloudflare/)，2026-10-09：celld／workerd 整合方向與當時自架的限制。
- 查核日期為 2026-10-10。依賴紀錄、測試規格、切換順序與停止規則是本文的工程建議；未進行平台遷移實測，也未推定公告未列出的產品停運日期。
