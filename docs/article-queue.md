# 待整理文章佇列

只放還沒寫成正式草稿的題目，依處理順序由上往下排列。

## ⏳ 排隊中（第 6 批：真實巨頭架構案例二期）

1. [Slack 訊息投遞之旅 (Journey of a Slack Message)](https://bytebytego.com/guides/what-is-the-journey-of-a-slack-message) — 邊緣 Gateway、WebSocket 雙向通道、Channel Server、Redis 緩存矩陣與 MySQL 分片儲存
2. [McDonald's 百萬級即時訂單事件驅動架構](https://bytebytego.com/guides/mcdonald's-event-driven-architecture) — AWS SQS、Lambda、DynamoDB 事件串流、跨區域 Active-Active 容災與訂單狀態機
3. [Airbnb 微服務架構演進：0 到 15 億房客的擴展之路](https://bytebytego.com/guides/airbnb-artchitectural-evolution) — 單體 Monorail 拆分、Thrift RPC 服務網格、Spinnaker 持續交付與資料庫垂直解耦
4. [Pinterest 單行代碼優化 99% Git Clone 耗時](https://bytebytego.com/guides/the-one-line-change-that-reduced-clone-times-by-a-whopping-99-says-pinterest) — commit-graph 底層原理、拓撲排序加速與大規模 CI/CD 構建效能調優
5. [Reddit 核心儲存與高併發架構演進](https://bytebytego.com/guides/reddit's-core-architecture) — PostgreSQL 基礎架構、Cassandra / Redis 快取分層與百萬級貼文投票即時管線

---

## ⏳ 排隊中（第 7 批：分散式高階儲存與資料一致性）

1. [Erasure Coding（糾刪碼 / RS Code）架構原理](https://bytebytego.com/guides/erasure-coding) — 告別 3 副本 200% 儲存成本膨脹、范德蒙矩陣編解碼與節點修復頻寬優化
2. [Event Sourcing（事件溯源）與 CQRS 讀寫分離架構](https://bytebytego.com/guides/differences-in-event-sourcing-system-design) — 不可篡改 Event Store、投影（Projections）構建、事件重放與最終一致性補償
3. [分散式消息交付語義（Delivery Semantics）深析](https://bytebytego.com/guides/delivery-semantics) — At-Most-Once、At-Least-Once 與 Exactly-Once（冪等 Producer + 兩階段事務日誌）
4. [S3 大檔案分段上傳（Multipart Upload）與斷點續傳](https://bytebytego.com/guides/how-to-upload-a-large-file-to-s3) — ETag 驗證、平行上傳管線、分片合併與網絡抖動錯誤復原
5. [主從資料庫複製延遲（Replication Lag）應對策略](https://bytebytego.com/guides/read-replica-pattern) — 讀寫分離陷阱、主庫強制讀、快取暫存（Cache-aside）與 GTID 一致性路由

---

## ⏳ 排隊中（第 8 批：即時通訊、網路協定與授權體系）

1. [即時通訊協定全景對決：WebSocket vs. SSE vs. Long Polling](https://bytebytego.com/guides/shortlong-polling-sse-websocket) — 連線生命週期開銷、伺服器資源消耗、心跳機制與重連風暴防禦
2. [OAuth 2.0 與 OpenID Connect (OIDC) 授權拓撲全景](https://bytebytego.com/guides/a-cheatsheet-to-build-secure-apis) — Authorization Code Flow、PKCE 防禦、JWT 簽名/驗證與 Token 輪換機制
3. [NAT 穿透與 Anycast 邊界路由演進](https://bytebytego.com/guides/how-nat-made-the-growth-of-the-internet-possible) — STUN / TURN / ICE 穿透機制、BGP Anycast 尋址與全球 CDN 邊緣流量加速
4. [現代負載平衡演算法精析](https://bytebytego.com/guides/key-use-cases-for-load-balancers) — 一致性雜湊（Consistent Hashing 虛擬節點）、加權輪詢（Weighted Round Robin）與最小連線數

---

## ⏳ 排隊中（第 9 批：高可用、分散式限流與流量治理）

1. [現代分散式限流演算法：Token Bucket vs. Leaky Bucket vs. 滑動視窗](https://bytebytego.com/guides/top-3-api-gateway-use-cases) — Redis Lua 原子腳本、叢集限流、動態配額與熔斷降級
2. [分散式唯一 ID 生成器架構：Snowflake vs. Leaf vs. UUIDv7](https://bytebytego.com/guides/how-does-rest-api-work) — 時鐘回撥（Clock Drift）防禦、趨勢遞增、B+ Tree 索引友善性與高併發效能
3. [斷路器（Circuit Breaker）與指數退避重試](https://bytebytego.com/guides/10-essential-components-of-a-production-web-application) — 狀態機（Closed/Open/Half-Open）、重試風暴防禦與 Jitter 隨機抖動
4. [分散式快取失效三大災難：快取穿透、快取擊穿與快取雪崩](https://bytebytego.com/guides/4-ways-netflix-uses-caching-to-hold-user-attention) — 布隆過濾器（Bloom Filter）、互斥鎖（Mutex）與隨機過期時間加權

---

## ⏳ 排隊中（第 10 批：DevOps、Git 底層與計算機基礎）

1. [Git 內部核心架構：Blob、Tree、Commit 與 Packfile](https://bytebytego.com/guides/how-tiktok-manages-a-200k-file-frontend-monorepo) — 內容尋址物件資料庫、SHA-1/SHA-256 哈希、Delta 壓縮與 Garbage Collection
2. [瀏覽器渲染引擎底層原理：從 HTML/CSS 解析到 DOM、Layout 與 Composite](https://bytebytego.com/guides/how-does-the-browser-render-a-web-page) — 關鍵渲染路徑（CRP）、重排（Reflow）與重繪（Repaint）效能優化
3. [Linux I/O 多路復用架構演進：select vs. poll vs. epoll](https://bytebytego.com/guides/how-does-javascript-work) — 邊緣觸發（ET）與水平觸發（LT）、紅黑樹/就緒鏈表、Reactor 模式與高效能網路伺服器
