# Feature Store：時間點取值與線上最新值的可重現案例

查核日期：2026-10-05。這是 `src/content/blog/feature-store-point-in-time-training-serving.md` 的研究筆記與 **SQLite 說明性實驗**，不是 Feast 執行結果，也沒有測量線上服務延遲。

## 已核對的 Feast 行為

- `get_historical_features` 用 entity dataframe 的 `event_timestamp` 當每列可取特徵的時間上界（含該時刻），挑同一 entity 在此前最新的特徵；Feature View 的 TTL 限制向前搜尋的時間長度，且是相對於**每一列 entity 時間**，不是查詢當下。[Feast feature retrieval](https://docs.feast.dev/getting-started/concepts/feature-retrieval)、[Feast point-in-time joins](https://docs.feast.dev/getting-started/concepts/point-in-time-joins)
- 離線 store 是讀取歷史時間序列特徵的介面，用於訓練集與物化來源。批次來源可經 `materialize`／`materialize-incremental` 載入線上 store；線上 store 針對每個 entity key 保留最新值，不保留歷史值，線上查詢不帶 entity timestamp。[Feast offline store](https://docs.feast.dev/getting-started/components/offline-store)、[Feast data ingestion](https://docs.feast.dev/getting-started/concepts/data-ingestion)、[Feast online store](https://docs.feast.dev/getting-started/components/online-store)、[Feast feature retrieval](https://docs.feast.dev/getting-started/concepts/feature-retrieval)
- **事件時間正確不等於當時已可用**：官方文件指出，預設 point-in-time join 只限制 feature event timestamp；`created_timestamp_column` 預設用於相同 event timestamp 的去重，不會額外限制回填或修正資料。若要限制為當時已建立的資料，需在支援的 offline store 中使用 `filter_by_created_timestamp=True`，且 created timestamp 應代表資料實際可用的時間。此選項對 NULL created timestamp 會排除該列。[Feast point-in-time joins](https://docs.feast.dev/getting-started/concepts/point-in-time-joins)

## 最小資料與可執行驗證

合成資料全部使用 UTC。`label_ts` 是預測發生的時間，在 Feast entity dataframe 中對應 `event_timestamp`；`target` 是事後得知的標籤，不參與特徵挑選。Feature View TTL 假設為兩小時。A 在 10:00 預測時只應看見 09:00 的值 10；11:00 的值 99 是未來資訊。B 在 14:00 預測時，其 10:30 特徵已超過 TTL。線上快照另選 11:30，假設截至該時刻的特徵都已完成物化。

以 `python3 - <<'PY'` 開始、`PY` 結束執行以下程式，無第三方依賴：

```python
import sqlite3
import sys

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE features(entity TEXT, event_ts TEXT, value INTEGER);
INSERT INTO features VALUES
  ('A', '2026-01-01T09:00:00Z', 10),
  ('A', '2026-01-01T11:00:00Z', 99),
  ('B', '2026-01-01T10:30:00Z', 7);
CREATE TABLE labels(id INTEGER, entity TEXT, label_ts TEXT, target INTEGER);
INSERT INTO labels VALUES
  (1, 'A', '2026-01-01T10:00:00Z', 0),
  (2, 'A', '2026-01-01T12:00:00Z', 1),
  (3, 'B', '2026-01-01T14:00:00Z', 0);
""")

queries = {
    "naive": """
        SELECT l.id, l.entity, l.label_ts, l.target,
          (SELECT f.value FROM features f WHERE f.entity = l.entity
           ORDER BY f.event_ts DESC LIMIT 1) AS value
        FROM labels l ORDER BY l.id
    """,
    "pit_ttl_2h": """
        SELECT l.id, l.entity, l.label_ts, l.target,
          (SELECT f.value FROM features f
           WHERE f.entity = l.entity AND f.event_ts <= l.label_ts
             AND f.event_ts >= strftime('%Y-%m-%dT%H:%M:%SZ', l.label_ts, '-2 hours')
           ORDER BY f.event_ts DESC LIMIT 1) AS value
        FROM labels l ORDER BY l.id
    """,
    "online_snapshot_11_30": """
        SELECT e.entity,
          (SELECT f.value FROM features f
           WHERE f.entity = e.entity AND f.event_ts <= '2026-01-01T11:30:00Z'
           ORDER BY f.event_ts DESC LIMIT 1) AS value
        FROM (SELECT DISTINCT entity FROM features) e ORDER BY e.entity
    """,
}
print("Python", sys.version.split()[0], "SQLite", sqlite3.sqlite_version)
for name, sql in queries.items():
    print(name)
    for row in db.execute(sql):
        print(row)
```

實際執行結果（本機 Python 3.14.7、SQLite 3.53.4）：

```text
Python 3.14.7 SQLite 3.53.4
naive
(1, 'A', '2026-01-01T10:00:00Z', 0, 99)
(2, 'A', '2026-01-01T12:00:00Z', 1, 99)
(3, 'B', '2026-01-01T14:00:00Z', 0, 7)
pit_ttl_2h
(1, 'A', '2026-01-01T10:00:00Z', 0, 10)
(2, 'A', '2026-01-01T12:00:00Z', 1, 99)
(3, 'B', '2026-01-01T14:00:00Z', 0, None)
online_snapshot_11_30
('A', 99)
('B', 7)
```

第一列的 99 → 10 是排除未來特徵的關鍵差異；第三列的 7 → `None` 是 TTL 的影響。11:30 快照顯示每個 entity 一個最新值，並不代表 10:00 訓練列可使用 A 的 99。快照只模擬物化結果；沒有執行 Feast、Redis、網路服務或排程。

## 一致性與延遲邊界

**推論**：相同 Feature View 定義有助於訓練與推理使用同一組特徵欄位，卻不保證在任意時刻取到相同數值。歷史查詢以每筆預測時間回看；線上查詢讀到的是已載入線上 store 的最新快照。如果來源更新到 11:00，但物化尚未完成，11:30 線上值仍可能是 09:00 的 10；若已物化，則可讀到 99。這是由批次物化路徑與最新值儲存模型推得的情境，**未實測任何延遲或一致性 SLA**。[Feast data ingestion](https://docs.feast.dev/getting-started/concepts/data-ingestion)、[Feast online store](https://docs.feast.dev/getting-started/components/online-store)

若要進一步主張端到端時效，需另記錄來源事件時間、資料實際可用時間、物化完成時間及推理讀取時間，並在實際 Feast 部署上量測。若有晚到或回填資料，也應測試 `filter_by_created_timestamp` 的支援與行為；單靠本例的 event-time SQL 無法驗證當時線上可見性。[Feast point-in-time joins](https://docs.feast.dev/getting-started/concepts/point-in-time-joins)
