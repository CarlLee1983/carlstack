---
title: "Feature Store 的時間點檢查：10:00 的訓練資料不能看到 11:00 的特徵"
description: "用三筆合成特徵與三筆標籤重現未來資料洩漏，再檢查 point-in-time join、TTL、線上最新值與物化延遲各自能保證什麼。"
publishDate: 2026-10-05T18:20:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - 系統設計
cover: ../../assets/covers/feature-store-point-in-time.png
coverAlt: "玻璃特徵片沿石製時間軌排列，黃銅閘板隔開預測時刻與未來的一枚珊瑚紅資料片。"
---

訓練資料最容易出錯的地方，不是特徵算錯，而是**時間挑錯**。假設要重建使用者 A 在 10:00 的預測輸入：09:00 的特徵值是 `10`，11:00 更新為 `99`。如果 SQL 只挑「這個人最新的一筆」，10:00 的訓練列就偷看了 11:00 的值。模型在離線評估得到的資訊，線上當時根本拿不到。

[Feast 的歷史特徵查詢](https://docs.feast.dev/getting-started/concepts/feature-retrieval)使用 entity dataframe 每列的 `event_timestamp` 作為時間上界，做 point-in-time join；[TTL](https://docs.feast.dev/getting-started/concepts/point-in-time-joins)再限制往回找多遠。以下先用標準函式庫 SQLite 把條件跑出來，再說明線上讀取與物化的另一個時間邊界。這是說明性實驗，沒有啟動 Feast，也沒有量測服務延遲。

## 六筆資料，把未來洩漏跑出來

這裡的 `label_ts` 是當時要預測的時間；在 Feast entity dataframe 中對應 `event_timestamp`。`target` 是後來才取得的訓練標籤，只用來辨識訓練列，不參與特徵挑選。所有時間都是 UTC，TTL 假設為兩小時。把下列程式存成 `feature-time.py`，執行 `python3 feature-time.py`，不需第三方套件：

```python
import sqlite3

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
        SELECT l.id, l.entity, l.label_ts,
          (SELECT f.value FROM features f WHERE f.entity = l.entity
           ORDER BY f.event_ts DESC LIMIT 1) AS value
        FROM labels l ORDER BY l.id
    """,
    "pit_ttl_2h": """
        SELECT l.id, l.entity, l.label_ts,
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
for name, sql in queries.items():
    print(name, list(db.execute(sql)))
```

在本機 Python 3.14.7／SQLite 3.53.4 執行，得到：

```text
naive [(1, 'A', '2026-01-01T10:00:00Z', 99), (2, 'A', '2026-01-01T12:00:00Z', 99), (3, 'B', '2026-01-01T14:00:00Z', 7)]
pit_ttl_2h [(1, 'A', '2026-01-01T10:00:00Z', 10), (2, 'A', '2026-01-01T12:00:00Z', 99), (3, 'B', '2026-01-01T14:00:00Z', None)]
online_snapshot_11_30 [('A', 99), ('B', 7)]
```

第一列從 `99` 變回 `10`，證明 11:00 的特徵不能進入 10:00 的訓練列。第三列從 `7` 變成 `None`，因為 B 的特徵發生在 10:30，距離 14:00 已超過兩小時。TTL 是相對於**每筆訓練列的時間**，不是相對於查詢執行時刻；過期時要明確決定缺值策略，不能退回讀一筆未來值。[Feast 的 point-in-time join 文件](https://docs.feast.dev/getting-started/concepts/point-in-time-joins)也把 TTL 定義在每列 entity 時間上。

## 線上讀最新值，不會重建過去

第三個輸出模擬 11:30 已物化完成的線上快照：A 是 `99`，B 是 `7`。這個快照回答的是「現在服務可讀到什麼」，不能拿來重建 A 在 10:00 的訓練列。[Feast 的離線 store](https://docs.feast.dev/getting-started/components/offline-store)用歷史特徵建立訓練資料與物化來源；[線上 store](https://docs.feast.dev/getting-started/components/online-store)則為每個 entity key 保留最新值，不保留歷史版本。批次來源透過 [`materialize` 路徑](https://docs.feast.dev/getting-started/concepts/data-ingestion)載入線上 store。

「最新」仍取決於物化有沒有完成。若 11:00 的來源資料尚未載入，11:30 線上讀到的 A 可能仍是 `10`；若已載入，才會是 `99`。這是從 Feast 的離線到線上資料路徑推得的情境，**不是本例量到的延遲或一致性保證**。需要訂線上新鮮度目標時，至少要記下來源事件時間、資料到達時間、物化完成時間和推理讀取時間，再用自己的部署量測。

## 事件時間正確，也可能偷看到晚到資料

還有一個這段 SQL 沒覆蓋的問題：某筆特徵的 `event_ts` 是 09:00，但直到 11:00 才入庫。它符合 10:00 的 event-time 條件，卻不是 10:00 當時可用的資料。[Feast 文件](https://docs.feast.dev/getting-started/concepts/point-in-time-joins)指出，預設 point-in-time join 依事件時間挑選；`created_timestamp_column` 預設處理相同事件時間的去重，並不自動排除事後建立的資料。要把「當時已可用」也納入條件，須確認所用 offline store 支援 `filter_by_created_timestamp=True`，並讓 created timestamp 真正代表可用時間。

因此驗收不能只問「訓練和推理是否使用同一個 Feature View」。先拿一列已知會洩漏的標籤時間做反例，確認未來特徵被排除；再測 TTL 邊界、晚到或回填資料，以及物化落後時線上會讀到哪個版本。這份 SQLite 範例證明時間條件的差異；它沒有證明特定 Feast 部署的查詢效能、端到端延遲或線上離線一致性。若你正在設計推薦管線，也可對照站內的 [Twitter 推薦流程案例](/blog/twitter-recommendation-algorithm-pipeline/)：那篇看整體架構，這裡提供一筆訓練列能否使用某個特徵的檢查方法。
