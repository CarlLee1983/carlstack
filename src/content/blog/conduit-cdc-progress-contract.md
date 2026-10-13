---
title: "Conduit 修掉 CDC 靜默停滯後，Running 仍需要一份進度證明"
description: "從 Conduit v0.20.0 的 snapshot／CDC 交接修復，設計來源位移、sink 水位與 canary 驗收；用故障注入確認重播、停止與恢復，避免把 Running 當成資料已送達。"
publishDate: 2026-10-13T10:11:18+08:00
draft: false
featured: false
tags:
  - 系統設計
  - 開源專案
  - 軟體品質
series: 現代資料庫與儲存引擎內核
seriesOrder: 9
cover: ../../assets/covers/conduit-cdc-progress-contract.webp
coverAlt: "陶製水渠模型中，藍色水道流過階梯，赭色側渠被閘門阻擋，橘色浮標停在門前，象徵必須直接觀察資料是否前進。"
---

[Conduit v0.20.0](https://github.com/ConduitIO/conduit/releases/tag/v0.20.0) 在 2026 年 10 月 12 日發布，修復 v0.19.0 的 PostgreSQL snapshot／CDC 交接問題：負載下，snapshot 結尾等待的 ack 可能遺失，後續變更便送不出去，卻沒有錯誤或 DLQ 紀錄。團隊將它列為 SEV-0，並說明沒有已知正式環境案例。

這種故障會讓維運看見綠燈，使用者卻一直讀到舊資料。我會把上線條件補成一句可驗證的要求：來源已提交的測試變更，必須在約定期限內出現在目的端。程序活著，只能回答另一個問題。

本文查核截至 2026 年 10 月 13 日，沒有執行 Conduit 或重現故障。以下進度契約與注入案例是設計建議。

## 交接成功，要看 snapshot 之後的第一筆變更

假設訂單表先複製十萬筆歷史資料，再持續同步異動。歷史筆數全部對上，仍無法驗證串流已經接手；測試若在十萬筆完成時結束，剛好跳過最需要觀察的邊界。

我會在測試環境準備專用 canary 資料，讓它走相同 connector、篩選與目的端寫入路徑。snapshot 期間修改一次，確認完成後再修改一次，分別保存唯一識別、版本值與提交成功時間。目的端要查到預期版本，不能只看到同一主鍵存在。若流程會排除 canary，測試驗證的就是另一條路。

[PostgreSQL 的 exported snapshot 說明](https://www.postgresql.org/docs/current/logicaldecoding-explanation.html#LOGICALDECODING-EXPORTED-SNAPSHOTS)指出，snapshot 與後續 change stream 可以建立一致的銜接。本文據此提出的驗收重點是：既要有歷史基線，也要觀察交接後的變更；不能從基線完整推論串流正常。

## 位移前進與資料落地，需要分開留證據

我會在每次驗收留下四個時間點：來源提交成功、connector 觀察到事件、可恢復位置持久化、目的端完成可讀取的寫入。拿不到其中一個，就標示未知。它們用來縮小故障區段，不必強行拼成一條看似精確的延遲曲線。

[pg_replication_slots 文件](https://www.postgresql.org/docs/current/view-pg-replication-slots.html)將 `confirmed_flush_lsn` 定義為 consumer 已確認接收的位置，`restart_lsn` 則是 consumer 可能仍需要的最舊 WAL 位置。前者不能單獨證明下游搜尋索引已完成更新；後者也不是最新訂單時間。

目的端水位應以可驗證的業務事件為單位。若一筆文件拆成多個 chunk，只看到最大序號並不代表較早的 chunk 沒有缺口。我會記錄每次 canary 預期的產物集合，再以完整集合更新水位；平行分區則各自保留進度，避免快分區掩蓋慢分區。本站的[複製延遲處理](/blog/database-replication-lag-mitigation-strategies/)討論讀取策略，這裡補上用來判定延遲的交付證據。

閒置來源不應因位移未動而告警。測試 canary 必須先確認提交成功，再開始計時；門檻由應用的新鮮度需求決定。告警應保留缺少的事件 ID、最後成功時間與停在哪個觀測點，讓值班者知道該查來源、checkpoint，還是目的端。

只有 canary 通過，也不能推論整個資料集沒有缺口。它主要證明取樣路徑仍會前進；大量資料的完整性還需另做對帳。我會依主鍵範圍與版本切出小批次，比較來源的預期集合與目的端實際集合，並把刪除納入。對帳須固定可比較的時間邊界，否則同步中的正常差異也會被算成遺失。

復原程序則要寫清楚重播起點如何取得、由誰批准，以及哪些外部副作用不能再做一次。手動把位移往前調，可能讓告警消失，卻沒有交付缺失資料；因此解除事故的條件應包含對帳完成，不能只看 lag 下降。

## 失敗注入要回答重播後留下什麼

以下案例只在隔離環境操作，使用可清除的資料與獨立 replication slot。每次保留輸入清單、版本、設定及查詢結果，不能只截一張綠色儀表板。

### 切斷 snapshot 交接

在歷史資料快複製完時終止程序，同時持續提交帶唯一 ID 的更新，重新啟動後比對所有預期版本。驗收包含交接後 canary 到達、沒有缺項，以及恢復耗時落在預先設定的範圍。只確認服務重新接受連線，這次測試就還沒結束。

### 阻塞目的端，再解除阻塞

暫時拒絕測試 sink 的寫入，觀察來源位移、待處理量與保留空間；解除後核對是否追上。這個案例要區分「安全地等候」和「已經遺失」：前者仍需容量告警，因為等待時間不會自動縮短。

### 在寫入成功與 checkpoint 之間重啟

[PostgreSQL logical decoding 文件](https://www.postgresql.org/docs/current/logicaldecoding-explanation.html#LOGICALDECODING-REPLICATION-SLOTS)提醒，crash 後可能重送近期變更，consumer 必須處理重複。測試應允許觀察到重播，再檢查目的端是否收斂到正確版本、刪除是否生效、外部副作用是否重複。只驗「沒有重複主鍵」不夠，覆寫順序也可能讓舊值蓋回新值。

## 升級仍要驗證停止語意與未修項目

同份 release notes 說明，force stop 現在成為 `UserStopped`；`SystemStopped` 的 pipeline 下次啟動會續跑，停止後的 error 欄位也需要告警。v0.20.0 仍列有特定 PostgreSQL 重啟遺失資料案例，以及 arch-v2 持續 state-write 失敗卻回報健康的限制。此次修復不能當成所有 CDC 路徑都已安全的保證。

因此升級驗收要保存實際 engine、connector 版本與啟動參數，並重跑主動停止、程序關閉、恢復後的資料核對。版本號相同但載入的 connector 不同，不能共用一張驗收結果；重播也不會補回已失去來源保留資料的缺口。

下一次部署可以從一筆測試更新開始：記下來源提交時間，在目的端查到預期版本，再故意阻塞目的端，確認告警能帶出那筆缺失事件。這份紀錄比 Running 多回答了一件值班者需要知道的事：哪一筆資料，確實走完了整條路。
