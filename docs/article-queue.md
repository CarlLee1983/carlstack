# 待整理文章佇列

只放還沒寫成正式草稿的題目，依處理順序由上往下排列。

## 排隊中（第 4 批：分散式交易、儲存引擎與資料流）

1. [資料庫交易隔離層級與 MVCC 底層實作](https://github.com/ByteByteGoHq/system-design-101) — 深度解析 Read Committed、Repeatable Read、Serializable，髒讀／幻讀／寫偏斜（Write Skew）防禦與 PostgreSQL MVCC 快照機制
2. [高併發扣減：樂觀鎖 vs. 悲觀鎖 vs. 分散式鎖](https://github.com/ByteByteGoHq/system-design-101) — `SELECT ... FOR UPDATE`、CAS（Compare-And-Swap）、Redis Redlock 爭議與庫存分段加鎖實踐
3. [CDC（Change Data Capture）與 Debezium 實戰](https://github.com/ByteByteGoHq/system-design-101) — 捕獲 WAL / Binlog、雙寫一致性問題、Transactional Outbox Pattern 與即時 ETL 資料湖管線
4. [時序資料庫（TSDB）架構與 LSM-Tree 寫入特化](https://github.com/ByteByteGoHq/system-design-101) — 倒排索引（Inverted Index）、Gorilla 浮點數壓縮、Rollup 降採樣與 InfluxDB / TimescaleDB 架構對比
