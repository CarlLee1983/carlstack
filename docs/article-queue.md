# 待整理文章佇列

只放還沒寫成正式草稿的題目，依處理順序由上往下排列。

## ⏳ 排隊中（第 16 批：支付系統與金融級帳務架構）

1. [Stripe 全球支付網關與跨國智慧路由架構](https://bytebytego.com/guides/10-principles-for-building-resilient-payment-systems-by-shopify) — 交易有限狀態機、多收單機構（Acquirers）智慧路由、卡組織協議與超時補償
2. [雙式記帳（Double-Entry Bookkeeping）與分散式帳本架構](https://bytebytego.com/guides/10-principles-for-building-resilient-payment-systems-by-shopify) — 會計借貸平衡不變量、不可篡改流水、分散式鎖與防超賣對帳
3. [即時風控與反詐欺檢測系統（Fraud Detection Architecture）](https://bytebytego.com/guides/10-principles-for-building-resilient-payment-systems-by-shopify) — 特徵工程、即時規則引擎（Drools）、圖神經網絡（GNN）與毫秒級風控阻斷
4. [銀行間清算與對帳系統（Reconciliation & Settlement Engine）](https://bytebytego.com/guides/10-principles-for-building-resilient-payment-systems-by-shopify) — 差錯帳處理、T+1/T+0 清算管線、三方對帳矩陣與自動沖正補償

---

## ⏳ 排隊中（第 17 批：資訊安全與現代密碼學架構）

1. [TLS 1.3 握手協議與 0-RTT 早期數據安全](https://bytebytego.com/guides/a-cheatsheet-to-build-secure-apis) — Diffie-Hellman 密鑰交換、前向保密（PFS）、0-RTT 重放攻擊防禦與證書鏈驗證
2. [端到端加密（E2EE）架構：Signal Protocol vs. Telegram MTProto](https://bytebytego.com/guides/is-telegram-secure) — 雙棘輪演算法（Double Ratchet）、X3DH 密鑰協商、前向保密與後向安全（Future Secrecy）
3. [零信任架構（Zero Trust Architecture）與 BeyondCorp 實踐](https://bytebytego.com/guides/how-to-design-secure-web-api-access-for-your-website) — 永不信任始終驗證、動態存取控制（RBAC/ABAC）、微隔離（Micro-segmentation）與設備信任評估
4. [API 安全防禦實戰：OWASP API Security Top 10 與防刷防爆](https://bytebytego.com/guides/top-12-tips-for-api-security) — BOLA（失效物件級授權）、Mass Assignment、JWT 簽名混淆防禦與 WAF 邊界防禦

---

## ⏳ 排隊中（第 18 批：計算機底層與網路傳輸原理）

1. [從輸入 URL 到頁面呈現全景：DNS、TCP 三向交握與 TLS 全流程](https://bytebytego.com/guides/how-does-the-browser-render-a-web-page) — 遞迴/迭代 DNS、SYN/ACK 連線建立、TLS 協商、HTTP 請求到 DOM 繪製
2. [TCP vs. UDP vs. QUIC 傳輸層協定對決與擁塞控制](https://bytebytego.com/guides/http1-http2-http3) — 滑動視窗、BBR / CUBIC 擁塞控制、隊頭阻塞（HOL Blocking）與 Multiplexing
3. [CPU 多核心快取架構（L1/L2/L3）與 False Sharing（偽共享）優化](https://bytebytego.com/guides/how-does-javascript-work) — MESI 快取一致性協議、Cache Line（64-byte）對齊、記憶體屏障（Memory Barrier）與 CAS 效能
4. [記憶體管理與虛擬位址轉換：TLB、Page Fault 與 HugePages](https://bytebytego.com/guides/how-does-javascript-work) — MMU 頁表分級映射、TLB 快取命中率、缺頁中斷開銷與 Linux HugePages 大頁記憶體

---

## ⏳ 排隊中（第 19 批：大規模資料管道與現代資料湖）

1. [現代資料管道架構演進：ETL vs. ELT 與 Lambda vs. Kappa 架構](https://bytebytego.com/guides/data-pipelines-overview) — 批流一體、即時資料湖入庫、資料品質檢驗（Great Expectations）與 Schema 漂移
2. [資料湖倉一體（Lakehouse）核心技術：Apache Iceberg vs. Delta Lake vs. Hudi](https://bytebytego.com/guides/data-pipelines-overview) — ACID 事務、Time Travel 時間旅行、快照隔離（Snapshot Isolation）與 Parquet 列式儲存
3. [即時串流運算引擎對決：Apache Flink vs. Spark Streaming](https://bytebytego.com/guides/data-pipelines-overview) — 真正事件驅動（Event-driven）vs. 微批次（Micro-batch）、Stateful 狀態計算、Watermark 與 Exactly-Once Checkpoint
4. [高效能資料處理演進：從 Pandas 到 Polars、Dask 與 Ray](https://bytebytego.com/guides/5-functions-to-merge-data-with-pandas) — Apache Arrow 記憶體格式、Rust 向量化執行、延遲計算（Lazy Evaluation）與分散式 Actor 模型

---

## ⏳ 排隊中（第 20 批：系統設計面試方法論與容量估算）

1. [系統設計面試黃金 4 步架構法 (PEDALS / 4-Step Framework)](https://bytebytego.com/guides/the-ultimate-api-learning-roadmap) — Scope 定義、High-Level 設計、Deep-Dive 瓶頸突破與 Wrap-Up 權衡總結
2. [億級系統容量預估（Capacity Estimation）與 SLA/SLO/SLI 數學建模](https://bytebytego.com/guides/10-essential-components-of-a-production-web-application) — 存儲量（Storage）、頻寬（Bandwidth）、QPS 峰值計算與 99.99%（4 個 9）可用性架構設計
3. [高併發分散式系統指標評估：QPS、TPS、P99 延遲與成本精算](https://bytebytego.com/guides/10-essential-components-of-a-production-web-application) — 長尾延遲（Tail Latency）成因、GC/網路抖動、小定律（Little's Law）與叢集成本模型
4. [系統設計反模式與技術債治理（Technical Debt & Anti-Patterns）](https://bytebytego.com/guides/10-essential-components-of-a-production-web-application) — 分散式單體（Distributed Monolith）、過早優化、神之服務（God Service）與平滑重構演進
