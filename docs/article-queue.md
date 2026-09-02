# 待整理文章佇列

只放還沒寫成正式草稿的題目，依處理順序由上往下排列。

## ⏳ 排隊中（第 6 批：真實巨頭架構案例二期）

1. [Slack 訊息投遞之旅 (Journey of a Slack Message)](https://bytebytego.com/guides/what-is-the-journey-of-a-slack-message) — 邊緣 Gateway、WebSocket 雙向長連線、Channel Server 廣播、Redis 緩存矩陣與 MySQL 訊息分片儲存
2. [McDonald's 百萬級即時訂單事件驅動架構](https://bytebytego.com/guides/mcdonald's-event-driven-architecture) — AWS SQS、Lambda、DynamoDB 事件串流、跨區域 Active-Active 容災與訂單狀態機
3. [Airbnb 微服務架構演進：0 到 15 億房客的擴展之路](https://bytebytego.com/guides/airbnb-artchitectural-evolution) — 單體 Monorail 拆分、Thrift RPC 服務網格、Spinnaker 持續交付與資料庫垂直解耦
4. [Pinterest 單行代碼優化 99% Git Clone 耗時](https://bytebytego.com/guides/the-one-line-change-that-reduced-clone-times-by-a-whopping-99-says-pinterest) — commit-graph 底層原理、拓撲排序加速與大規模 CI/CD 構建效能調優
5. [Reddit 核心儲存與高併發架構演進](https://bytebytego.com/guides/reddit's-core-architecture) — PostgreSQL 基礎架構、Cassandra / Redis 快取分層與百萬級貼文投票即時管線
6. [Meta 規模化自動修復 Bug 架構：SapFix 與 Infer](https://bytebytego.com/guides/fixing-bugs-automatically-at-meta-scale) — 靜態分析、自動生成修復補丁、CI 測試驗證與生產灰度部署

---

## ⏳ 排隊中（第 7 批：分散式高階儲存與資料一致性）

1. [Erasure Coding（糾刪碼 / RS Code）架構原理](https://bytebytego.com/guides/erasure-coding) — 告別 3 副本 200% 儲存成本膨脹、范德蒙矩陣編解碼與節點修復頻寬優化
2. [Event Sourcing（事件溯源）與 CQRS 讀寫分離架構](https://bytebytego.com/guides/differences-in-event-sourcing-system-design) — 不可篡改 Event Store、投影（Projections）構建、事件重放與最終一致性補償
3. [分散式消息交付語義（Delivery Semantics）深析](https://bytebytego.com/guides/delivery-semantics) — At-Most-Once、At-Least-Once 與 Exactly-Once（冪等 Producer + 兩階段事務日誌）
4. [S3 大檔案分段上傳（Multipart Upload）與斷點續傳](https://bytebytego.com/guides/how-to-upload-a-large-file-to-s3) — ETag 驗證、平行上傳管線、分片合併與網絡抖動錯誤復原
5. [主從資料庫複製延遲（Replication Lag）應對策略](https://bytebytego.com/guides/read-replica-pattern) — 讀寫分離陷阱、主庫強制讀、快取暫存（Cache-aside）與 GTID 一致性路由
6. [區塊儲存 vs. 檔案儲存 vs. 物件儲存全景解析](https://bytebytego.com/guides/storage-sy) — POSIX 介面、IOPS 與延遲對比、分散式物件元資料管理（Metadata Engine）

---

## ⏳ 排隊中（第 8 批：即時通訊、網路協定與授權體系）

1. [即時通訊協定全景對決：WebSocket vs. SSE vs. Long Polling](https://bytebytego.com/guides/shortlong-polling-sse-websocket) — 連線生命週期開銷、伺服器資源消耗、心跳機制與重連風暴防禦
2. [OAuth 2.0 與 OpenID Connect (OIDC) 授權拓撲全景](https://bytebytego.com/guides/a-cheatsheet-to-build-secure-apis) — Authorization Code Flow、PKCE 防禦、JWT 簽名/驗證與 Token 輪換機制
3. [NAT 穿透與 Anycast 邊界路由演進](https://bytebytego.com/guides/how-nat-made-the-growth-of-the-internet-possible) — STUN / TURN / ICE 穿透機制、BGP Anycast 尋址與全球 CDN 邊緣流量加速
4. [現代負載平衡演算法精析](https://bytebytego.com/guides/key-use-cases-for-load-balancers) — 一致性雜湊（Consistent Hashing 虛擬節點）、加權輪詢（Weighted Round Robin）與最小連線數
5. [GraphQL 生產級落地與 LinkedIn 架構實踐](https://bytebytego.com/guides/how-does-graphql-work-in-the-real-world) — Schema Federation、N+1 查詢 DataLoader 批處理、查詢深度防禦與快取策略

---

## ⏳ 排隊中（第 9 批：高可用、分散式限流與流量治理）

1. [現代分散式限流演算法：Token Bucket vs. Leaky Bucket vs. 滑動視窗](https://bytebytego.com/guides/top-3-api-gateway-use-cases) — Redis Lua 原子腳本、叢集限流、動態配額與熔斷降級
2. [分散式唯一 ID 生成器架構：Snowflake vs. Leaf vs. UUIDv7](https://bytebytego.com/guides/how-does-rest-api-work) — 時鐘回撥（Clock Drift）防禦、趨勢遞增、B+ Tree 索引友善性與高併發效能
3. [斷路器（Circuit Breaker）與指數退避重試](https://bytebytego.com/guides/10-essential-components-of-a-production-web-application) — 狀態機（Closed/Open/Half-Open）、重試風暴防禦與 Jitter 隨機抖動
4. [分散式快取失效三大災難：快取穿透、快取擊穿與快取雪崩](https://bytebytego.com/guides/4-ways-netflix-uses-caching-to-hold-user-attention) — 布隆過濾器（Bloom Filter）、互斥鎖（Mutex）與隨機過期時間加權
5. [API 分頁架構設計：Offset 分頁 vs. Keyset / Cursor 游標分頁](https://bytebytego.com/guides/how-do-we-perform-pagination-in-api-design) — 深度分頁效能崩潰、B+ Tree 索引跳過與動態資料漂移問題

---

## ⏳ 排隊中（第 10 批：DevOps、Git 底層與計算機基礎）

1. [Git 內部核心架構：Blob、Tree、Commit 與 Packfile](https://bytebytego.com/guides/how-tiktok-manages-a-200k-file-frontend-monorepo) — 內容尋址物件資料庫、SHA-1/SHA-256 哈希、Delta 壓縮與 Garbage Collection
2. [瀏覽器渲染引擎底層原理：從 HTML/CSS 解析到 DOM、Layout 與 Composite](https://bytebytego.com/guides/how-does-the-browser-render-a-web-page) — 關鍵渲染路徑（CRP）、重排（Reflow）與重繪（Repaint）效能優化
3. [Linux I/O 多路復用架構演進：select vs. poll vs. epoll](https://bytebytego.com/guides/how-does-javascript-work) — 邊緣觸發（ET）與水平觸發（LT）、紅黑樹/就緒鏈表、Reactor 模式與高效能網路伺服器
4. [分散式系統共識演算法：CAP 定理、PACELC 與 Raft 協定精析](https://bytebytego.com/guides/cloud-distributed-systems) — Leader Election、Log Replication、安全性保證與分區容忍性

---

## ⏳ 排隊中（第 11 批：分散式事務與跨庫協同模式）

1. [Saga 模式實踐：Orchestration（編排）vs. Choreography（協同）](https://bytebytego.com/guides/how-do-we-manage-data) — 補償事務（Compensating Transactions）、前向恢復 vs. 後向恢復、狀態機持久化
2. [兩階段提交（2PC）與三階段提交（3PC）的極限與阻塞問題](https://bytebytego.com/guides/how-do-we-manage-data) — Coordinator 單點故障、同步阻塞、網路分區腦裂與 TCC（Try-Confirm-Cancel）模式
3. [資料庫分庫分表（Sharding）與分散式主鍵路由](https://bytebytego.com/guides/how-do-we-manage-data) — 範圍分片、雜湊分片、一致性雜湊、跨分片 JOIN 與分散式聚合查詢解法
4. [資料庫索引底層深度拆解：B+ Tree vs. LSM-Tree vs. Hash vs. Bitmap 索引](https://bytebytego.com/guides/database-and-storage) — 磁碟 I/O 特性、隨機寫 vs. 順序寫、寫入放大與覆蓋索引（Covering Index）

---

## ⏳ 排隊中（第 12 批：快取架構與記憶體儲存技術）

1. [五大分散式快取讀寫模式：Cache-Aside、Read-Through、Write-Through、Write-Behind 與 Refresh-Ahead](https://bytebytego.com/guides/4-ways-netflix-uses-caching-to-hold-user-attention) — 併發更新一致性、延遲雙刪與 Binlog 異步更新
2. [記憶體快取淘汰演算法深度對決：LRU vs. LFU vs. ARC vs. W-TinyLFU](https://bytebytego.com/guides/caching-performance) — 突發流量污染（Scan Resistance）、雙向鏈表哈希表實作、Caffeine 快取核心機制
3. [Redis 核心架構與單執行緒反應器模式 (Reactor Event Loop)](https://bytebytego.com/guides/database-and-storage) — 非阻塞 I/O、記憶體資料結構（Sds, Dict, Ziplist, SkipList）、Redis 6.0+ 多執行緒 I/O
4. [分散式快取叢集架構：Redis Cluster vs. Twemproxy vs. Codis](https://bytebytego.com/guides/database-and-storage) — 16384 虛擬槽（Slot）、Gossip 協議節點通訊、主從自動切換與故障轉移

---

## ⏳ 排隊中（第 13 批：現代消息隊列與事件驅動架構）

1. [主流消息隊列技術選型：Kafka vs. RabbitMQ vs. RocketMQ vs. AWS SQS](https://bytebytego.com/guides/types-of-message-queue) — AMQP vs. Log-centric、吞吐量、延遲（Sub-millisecond vs. High-throughput）、死信隊列（DLQ）與延時消息
2. [分散式消息隊列四大核心隊列模式：FIFO、優先級隊列、延時隊列與死信隊列](https://bytebytego.com/guides/explaining-the-4-most-commonly-used-types-of-queues-in-a-single-diagram) — 時間輪（TimingWheel）架構、指數重試隊列與訊息中毒（Poison Pill）防禦
3. [Apache Avro 與 Schema Registry 實戰：平滑資料遷移與版本相容性](https://bytebytego.com/guides/smooth-data-migration-with-avro) — 二進位序列化壓縮、Backward / Forward / Full 相容性規則與資料湖演進
4. [現代即時推播通知系統架構：APNs、FCM、WebSocket 與 SMS 統一調度](https://bytebytego.com/guides/how-does-a-typical-push-notification-system-work) — 頻率限制（Rate Limiting）、優先級佇列、防重複去重與多管道降級

---

## ⏳ 排隊中（第 14 批：微服務治理、服務網格與彈性架構）

1. [服務發現與註冊中心架構：Eureka vs. Consul vs. Nacos vs. ZooKeeper](https://bytebytego.com/guides/cloud-distributed-systems) — AP vs. CP 模式、心跳探活機制、長輪詢推送與一致性協定
2. [Service Mesh 服務網格底層架構：Envoy Sidecar、控制面 Istio 與 mTLS 零信任傳輸](https://bytebytego.com/guides/cloud-distributed-systems) — 流量攔截（iptables / eBPF）、動態服務發現（xDS 協議）、熔斷限流與無侵入觀測
3. [現代 CI/CD 自動化管線與發布策略：Blue-Green、Canary 與 Rolling Update](https://bytebytego.com/guides/netflix-tech-stack-cicd-pipeline) — 自動金絲雀分析（Kayenta）、流量權重切換、快速回滾與資料庫遷移相容
4. [微服務架構隔離模式：Bulkhead（艙壁隔離）、執行緒池隔離與租戶資源配額](https://bytebytego.com/guides/10-principles-for-building-resilient-payment-systems-by-shopify) — 故障蔓延防禦、執行緒池飢餓與服務雪崩阻斷

---

## ⏳ 排隊中（第 15 批：系統架構設計面試與經典系統實戰）

1. [經典系統設計：如何設計 Stack Overflow 高併發問答平台？](https://bytebytego.com/guides/how-will-you-design-the-stack-overflow-website) — 讀多寫少極致快取、全文搜尋、Tag 倒排索引與單體服務極限榨取
2. [經典系統設計：如何設計分散式網址縮短服務 (TinyURL / URL Shortener)？](https://bytebytego.com/guides/do-you-know-all-the-components-of-a-url) — Base62 編碼、哈希衝突解決、KV 儲存選型、高併發讀快取與自增發號器
3. [經典系統設計：如何設計全球分散式檔案存取系統 (Dropbox / Google Drive)？](https://bytebytego.com/guides/how-to-upload-a-large-file-to-s3) — 區塊級差異同步（Chunking & Delta Sync）、中繼資料分離、同步衝突解決與離線佇列
4. [經典系統設計：如何設計分散式網頁爬蟲 (Web Crawler)？](https://bytebytego.com/guides/how-does-the-browser-render-a-web-page) — URL 邊界佇列（URL Frontier）、布隆過濾器去重、禮貌策略（Politeness Policy）與分散式調度
