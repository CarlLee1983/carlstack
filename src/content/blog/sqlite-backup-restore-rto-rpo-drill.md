---
title: "備份成功仍可能丟掉已確認寫入：一次 SQLite 還原演練"
description: "用隔離的 SQLite 訂單服務實際演練備份、故障、還原與回切，量出 RTO／RPO，並逐筆對照已確認卻未恢復的寫入。"
publishDate: 2026-10-05T18:27:00+08:00
draft: false
featured: false
tags: [資料庫, 系統設計, 災難復原]
cover: ../../assets/covers/sqlite-restore-drill.png
coverAlt: "深色資料卡片的備份與恢復位置之間，兩張後續卡片隔著紅線，旁邊放著計時器"
---

「備份檔存在」只能證明某個檔案存在。若要回答能不能恢復，至少得把它放到獨立位置，確認資料仍符合業務規則，再讓服務完成一次讀取與寫入。這次我用合成訂單和本機 SQLite 做了整段演練；結果比單一成功訊號更有用：時間目標通過，但兩筆已確認的訂單沒有恢復。

這是隔離環境的流程檢查，不是正式環境的復原保證。既有的[資料庫複製延遲文章](/blog/database-replication-lag-mitigation-strategies/)討論複本落後；這裡固定採用備份快照，檢查從快照重新提供服務時會發生什麼事。

## 先把目標和量法寫下來

[AWS 的復原目標定義](https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/rel_planning_for_recovery_objective_defined_recovery.html)把 RTO 定為中斷到服務恢復的可接受時間，RPO 定為故障時最近可恢復資料點的可接受時間差。本例先在[可重跑腳本](https://github.com/CarlLee1983/CarlStack/blob/main/scripts/recovery-drill.py)的程式常數中訂示範上限：RTO 10 秒、RPO 2 秒。這不是訂單業務真正能接受的損失；在正式系統中，目標必須先由業務風險決定。

這次的 RTO 從腳本停止原服務算到恢復服務成功讀取預期訂單、並收到新寫入 `R1` 的 ACK。RPO 的觀察值從快照中最後一筆已 ACK 訂單 `A3` 的時間，算到故障時間；再獨立列出快照後被 ACK、卻未恢復的訂單。故障偵測、跨機部署和流量切換都不在這個量測內。

## 在另一份資料庫檔案上完成讀寫

完整實作在 [`scripts/recovery-drill.py`](https://github.com/CarlLee1983/CarlStack/blob/main/scripts/recovery-drill.py)，只用 Python 標準函式庫，執行方式如下：

```sh
python3 scripts/recovery-drill.py
```

腳本在暫存目錄建立本機 HTTP 訂單服務。它先寫入並確認 `A1`、`A2`、`A3`，用 [SQLite Online Backup API](https://www.sqlite.org/backup.html) 產生快照，再確認 `A4`、`A5`。接著停止原服務，將原資料庫移到隔離檔名，並確認舊端點已無法回應。恢復不是把快照蓋回原檔：腳本把快照複製到另一份資料庫，檢查後啟動新服務。

檢查分三層。SQLite 的 `PRAGMA integrity_check` 要回 `ok`；由於它[不檢查外鍵](https://www.sqlite.org/pragma.html)，另跑 `PRAGMA foreign_key_check`；最後對訂單 ID、筆數與逐筆金額核對，並透過 HTTP 讀取和寫入 `R1`。合成資料只有一張訂單表，沒有外鍵關係，因此本次外鍵檢查的零筆違規不代表跨表關聯已受測。這些檢查也不能涵蓋真實訂單系統全部規則。

最後，腳本先停止恢復服務並確認舊端點無法再回應，才從已恢復資料庫複製出全新主庫，切到新端點驗證原資料與新寫入 `F1`。這段暫停寫入的回切耗時另列；它是循序工作負載的受控模擬，沒有並發寫入、負載平衡器或 DNS 切換。

## 實測：兩個時間目標通過，仍有資料缺口

2026-10-05 的[完整執行結果 JSON](/examples/recovery-drill-run.json)記錄 SQLite 3.53.4、事先設定的目標與各步檢查。本機測得故障到恢復服務成功讀寫為 0.112 秒，最後可恢復 ACK 到故障為 0.803 秒；回切時舊服務停止到新服務有效讀寫為 0.095 秒。前兩者都低於示範上限，但快照只含 `A1` 至 `A3`；故障前已 ACK 的 `A4`、`A5` 並不在恢復結果中。恢復服務寫入 `R1` 後共有四筆、400 cents；回切到全新主庫並寫入 `F1` 後為五筆、500 cents。備份、恢復與回切檔案都通過結構、外鍵及逐筆金額檢查。

這個結果提醒我，RPO 的「秒」和損失的「筆」要一起報。在高寫入率系統，0.803 秒可以包含遠多於兩筆已 ACK 的操作。若業務要求任何已確認寫入都不能遺失，這份快照策略即使符合本例的 2 秒門檻也不合格。下一步應由業務確認可接受的資料缺口，再測試能覆蓋它的備份頻率、日誌或同步策略。

演練後也要把資料缺口交給事件處理流程：[故障診斷](/blog/k8s-diagnostic-loop-production/)有助於定義可觀察的恢復訊號，[部署切換策略](/blog/modern-cicd-deployment-strategies-blue-green-canary-rolling/)則涉及服務切換與回退。本例沒有執行那些部署機制，不能把本機 0.112 秒視為跨環境 RTO。你可以先用自己的合成資料重跑腳本，再把「最後可恢復 ACK、遺失的 ACK、第一個有效讀寫」三個觀察點加入實際工作負載的演練紀錄。
