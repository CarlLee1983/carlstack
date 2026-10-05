# SQLite 隔離還原演練：證據與邊界

查核與執行日期：2026-10-05。正式文章：`src/content/blog/sqlite-backup-restore-rto-rpo-drill.md`。

## 一手依據

- [AWS Well-Architected：定義 RTO／RPO](https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/rel_planning_for_recovery_objective_defined_recovery.html)：RTO 是中斷到服務恢復的可接受上限；RPO 是故障時最近可恢復資料點的可接受時間差。這是工作負載需求，不由一次演練自動決定。
- [SQLite Online Backup API](https://www.sqlite.org/backup.html)：來源連線可複製一致的資料庫快照到目的連線；本例透過 Python `sqlite3.Connection.backup()` 呼叫該 API。[Python 文件](https://docs.python.org/3/library/sqlite3.html#sqlite3.Connection.backup)列出此方法。
- [SQLite PRAGMA integrity_check / foreign_key_check](https://www.sqlite.org/pragma.html)：`integrity_check` 回傳 `ok` 代表它檢查的結構沒有錯誤，但不檢查外鍵；另需跑 `foreign_key_check`。兩者都不能代替業務資料與服務請求檢查。

## 隔離實驗

可重跑腳本：`python3 scripts/recovery-drill.py`。它只在 `tempfile.TemporaryDirectory` 中建立合成訂單資料庫，用本機 `127.0.0.1` HTTP 服務回覆寫入 ACK。事先寫在腳本中的示範目標：RTO ≤ 10 秒、RPO ≤ 2 秒。這些數值只用來檢查本次本機流程，沒有正式環境需求依據。

順序：ACK A1–A3 → 一致性備份 → ACK A4–A5 → 停止服務並隔離原資料庫 → 從快照複製至另一檔案 → 結構、外鍵及逐筆金額檢查 → 新服務讀取及寫入 R1 → 停止恢復服務並確認舊端點無回應 → 從恢復庫複製至全新主庫 → 讀取及寫入 F1。ACK 時間保存在 orchestrator 記憶體，與資料庫分開。故障後另確認原服務無法再回應。合成資料只有一張訂單表，沒有外鍵關係；外鍵檢查回傳零筆在此不代表跨表關聯已受測。

[本次原始 JSON 結果](../../public/examples/recovery-drill-run.json)：SQLite 3.53.4；故障至有效讀寫 0.112 秒；故障至最後可恢復 ACK A3 為 0.803 秒；A4、A5 兩筆已 ACK 的寫入未恢復。回切期間舊端點停止到新端點有效讀寫為 0.095 秒。備份／還原／回切資料庫的 `integrity_check` 為 `ok`，外鍵違規 0；快照、恢復後與回切後的業務 ID 和逐筆金額均符合腳本期望。這一次兩個時間目標均通過，但有兩筆 ACK 遺失。

## 不可外推

本例沒有網路切換、負載平衡、跨主機儲存、增量備份、並發或持續寫入、操作人員偵測時間與真實客戶資料。RTO 起點是腳本主動停止服務，不含故障偵測；回切計時獨立列出，不算在服務恢復 RTO。RPO 是快照最後 ACK 到故障的時間差，另列遺失筆數。`integrity_check` 成功不能推導零資料遺失或完整業務正確性。實務上要另對此工作負載的故障模式、排程與流量作演練。
