---
title: "Cloud SQL 的備援副本與增強備份"
description: "Cloud SQL for PostgreSQL 開放已有 DR replica 的主執行個體使用 enhanced backups。整理備份計畫的掛載條件、切換後的備份狀態，以及還原演練應確認的項目。"
publishDate: 2026-11-14T10:05:00+08:00
draft: false
featured: false
tags:
  - 資料庫
  - 系統設計
  - 技術選型
series: 現代資料庫與儲存引擎內核
seriesOrder: 11
cover: ../../assets/covers/cloud-sql-dr-enhanced-backups.webp
coverAlt: "兩座淡紫色陶瓷伺服器以線材連接，前方另有裝著資料圓盤的琥珀色玻璃盒，分別表示備援副本與獨立保存的備份。"
---

Google Cloud 在 [2026 年 11 月 13 日的更新紀錄](https://docs.cloud.google.com/sql/docs/postgres/release-notes#November_13_2026)宣布，Cloud SQL for PostgreSQL 的 enhanced backups 現在支援已有指定災難備援副本（DR replica）的主執行個體。團隊可以直接把 Backup and DR 的備份計畫掛到主執行個體，不必因為它有 DR replica 就放棄集中管理備份。

對已經部署跨區副本的團隊，這是重新檢查備份設定的時機。副本接手服務、保留歷史資料，以及把歷史資料還原成可用資料庫，仍然要分別驗證。我會優先處理切換後的備份狀態，因為應用程式恢復連線時，維運人員很容易把整場演練當成已經結束。

查核日期為 2026 年 11 月 14 日，依據 Google Cloud 官方文件。以下流程是工程建議，沒有實際建立付費資源、執行切換或量測還原時間。

## 備份計畫要掛在主執行個體

[設定文件](https://docs.cloud.google.com/sql/docs/postgres/backup-recovery/manage-enhanced-backups#enable-enhanced-backups)要求，有指定 DR replica 的主執行個體使用的備份計畫必須開啟 PITR，也就是 `log_retention_days > 0`。計畫不能直接掛到仍是 replica 的執行個體；副本提升為主執行個體後，才有主執行個體的設定資格。

備份計畫與主執行個體必須位於同一區域，儲存備份的 backup vault 則可在另一區域。兩者的地點不同，盤點時應分開記錄。掛上計畫還會覆寫原有的備份與還原設定，並可能造成執行個體重新啟動，因此不適合當成無影響的標籤修改。

我會在變更單保留原有排程、日誌保留天數、備份位置及負責人，再逐項對照新計畫。若原先能回到較早時間，新計畫卻縮短日誌保留，集中管理後的恢復能力可能反而變差。

延長保留天數也不會補出過去不存在的日誌。設定文件以七天改十天為例，至少要再經過三天，才可能有十天前的可還原時間點。驗收日期要跟著實際資料累積安排。

## 切換後，兩邊的備份狀態不同

[進階災難復原文件](https://docs.cloud.google.com/sql/docs/postgres/use-advanced-disaster-recovery)將這項能力限定在 Enterprise Plus，指定副本還必須符合跨區、直接副本等條件。規劃中的 switchover 與區域故障時的 replica failover 有不同語義。前者交換主副角色，後者立即提升副本，可能因複製延遲而遺失尚未同步的寫入。

同一份文件的 enhanced backup 章節說明，切換後的新主執行個體會進入啟用中的備份狀態，觸發 operational backup，開始上傳 PITR 日誌，並依計畫繼續排程。原主執行個體降為副本後，備份關聯會暫停。排程備份略過，隨選備份被阻擋，既有備份的儲存費仍會計收。原主執行個體日後再次提升，計畫才恢復保護。

因此監控應依「目前角色」判讀，而不是永遠要求同一台主機每天產生備份。假設原本的訂單資料庫 A 降為副本，B 接手寫入，A 不再產生新備份可能符合設計；B 沒有開始產生備份，才需要繼續調查。

我建議在演練紀錄中把應用恢復時間與新主執行個體的備份、PITR 可用時間分開寫。前者回答訂單何時能繼續處理，後者回答新的資料能從哪個時間點還原。

## 跨區備份也有還原限制

[備份選項文件](https://docs.cloud.google.com/sql/docs/postgres/backup-recovery/backup-options#cross-region-backups)列出一項容易忽略的限制：使用 CMEK 時，跨區備份仍受原執行個體的金鑰保護。原區域不可用時，這些備份也無法還原。PITR 使用跨區備份時，目標則限於原執行個體所在區域的新執行個體。

這些條件會影響備援設計。把 vault 放到另一區，只能證明備份資料存放位置不同，還需要檢查金鑰與還原目標所在位置。如果需求是原區域完全不可用時仍能接手訂單，驗收就要包含那個故障條件，不能只做一次正常網路下的還原。

同份文件也說明，部分操作無法把 operational backup 寫入 vault 時，Cloud SQL 會改做同專案、同區域的標準備份。這份備份沒有 vault 的強制保留保護。因此演練後除了找「備份成功」，也要看備份實際存在哪裡、採用哪一種保留政策。

## 安排兩場不同的演練

我會用獨立測試環境安排以下兩場，不在正式資料庫直接製造誤刪或區域故障。

第一場測試接手服務。記錄一組已確認提交的測試訂單，再執行規劃好的切換。應用改連新主執行個體後，確認能查詢原訂單、建立新訂單，並保留原副本角色、備份關聯與新備份紀錄。這場演練的完成條件包含備份保護恢復，不能只記 HTTP 請求成功。

第二場測試歷史還原。在測試資料中製造一筆已知時間的錯誤更新，選擇之前的時間點還原到隔離執行個體，再用訂單內容核對結果。依[備份管理文件](https://docs.cloud.google.com/sql/docs/postgres/backup-recovery/manage-enhanced-backups#find-and-validate-data-sources-for-pitr)，曾換過 vault 或提升副本的環境可能有多個 data source，要核對來源，並確認存在早於目標時間的備份。

這兩場測試分開留下耗時與資料差異，才能判斷目前方案滿足哪些需求。既有的[資料庫複製延遲文章](/blog/database-replication-lag-mitigation-strategies/)可用來補充副本落後時的讀取問題；歷史還原則應另有演練紀錄。

下一次 DR 演練可以先補一個收尾步驟：列出切換後的新主執行個體、備份計畫、最近成功備份與可還原時間，再安排隔離還原。缺少哪一項，就把它留在演練未完成清單，交給具名負責人處理。
