# ByteByteGo System Design 101：架構主題清單與研究儲備

> 主來源：<https://github.com/ByteByteGoHq/system-design-101>
>
> 研究與建檔日期：2026-09-02
>
> 狀態：已完成第 1 ~ 6 批與 ELK 專題共 27 篇架構文章發布；後續主題（第 7 ~ 20 批共 58 篇，全系列共 85 篇）已全面結構化整理入佇列待後續撰寫。

---

## 📊 發布進度與狀態

| 批次         | 主題範疇                                                                            | 規劃篇數 | 已發布篇數 | 狀態              |
| :----------- | :---------------------------------------------------------------------------------- | :------- | :--------- | :---------------- |
| **第 1 批**  | 科技巨頭核心架構演進（Postgres / ScyllaDB / 支付 / 推播快取 / Kafka）               | 5 篇     | 5 篇       | ✅ **已全數發布** |
| **第 2 批**  | 影音、社交與即時高併發管線（Twitter / YouTube / TikTok / Uber）                     | 4 篇     | 4 篇       | ✅ **已全數發布** |
| **第 3 批**  | 現代通訊協定、API 閘道與網路流量工程（HTTP/3 / gRPC / 閘道邊界 / 安全）             | 4 篇     | 4 篇       | ✅ **已全數發布** |
| **第 4 批**  | 分散式交易、儲存引擎與資料流（隔離層級 / 樂觀悲觀鎖 / CDC / TSDB）                  | 4 篇     | 4 篇       | ✅ **已全數發布** |
| **第 5 批**  | AI / LLM 系統架構與 Agent 工程化（推理加速 / Agent 狀態機 / AI Stack）              | 3 篇     | 3 篇       | ✅ **已全數發布** |
| **獨立專題** | ELK Stack 分散式日誌架構與現代演進（Lucene 倒排索引 / Kafka / Loki）                | 1 篇     | 1 篇       | ✅ **已發布**     |
| **第 6 批**  | 真實巨頭架構案例二期（Slack / McDonald's / Airbnb / Pinterest / Reddit / Meta）     | 6 篇     | 6 篇       | ✅ **已全數發布** |
| **第 7 批**  | 分散式高階儲存與資料一致性（Erasure Coding / Event Sourcing / S3 上傳）             | 6 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 8 批**  | 即時通訊、網路協定與授權體系（WebSocket/SSE / OAuth2 / NAT / GraphQL）              | 5 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 9 批**  | 高可用、分散式限流與流量治理（Token Bucket / Snowflake / 斷路器 / 分頁）            | 5 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 10 批** | DevOps、Git 底層與計算機基礎（Git 內部原理 / 瀏覽器渲染 / epoll / Raft）            | 4 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 11 批** | 分散式事務與跨庫協同模式（SAGA / 2PC-3PC-TCC / 分庫分表 / 索引底層）                | 4 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 12 批** | 快取架構與記憶體儲存技術（快取五大模式 / LRU-W-TinyLFU / Redis 核心）               | 4 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 13 批** | 現代消息隊列與事件驅動架構（Kafka vs RabbitMQ / 延時隊列 / Avro / 推播）            | 4 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 14 批** | 微服務治理、服務網格與彈性架構（註冊中心 / Service Mesh / CI-CD / 艙壁）            | 4 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 15 批** | 經典系統設計實戰面試（Stack Overflow / TinyURL / Dropbox / 網頁爬蟲）               | 4 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 16 批** | 支付系統與金融級帳務架構（Stripe 智慧路由 / 雙式記帳 / 即時風控 / 清算對帳）        | 4 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 17 批** | 資訊安全與現代密碼學架構（TLS 1.3 0-RTT / 端到端加密 / 零信任 / OWASP Top 10）      | 4 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 18 批** | 計算機底層與網路傳輸原理（URL 請求全流程 / TCP-UDP-QUIC / CPU 偽共享 / 虛擬記憶體） | 4 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 19 批** | 大規模資料管道與現代資料湖（ETL-ELT / Iceberg Lakehouse / Flink 串流 / Polars）     | 4 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 20 批** | 系統設計面試方法論與容量估算（PEDALS 4 步法 / 億級容量預估 / P99 延遲 / 技術債）    | 4 篇     | 0 篇       | ⏳ 排入待辦佇列   |

---

## ✅ 已發布專題

### 第 1 批：科技巨頭核心架構演進

1. [**從單體到分片：Figma 如何將 PostgreSQL 擴展 100 倍並維持零停機**](../../src/content/blog/figma-postgres-scaling-architecture.mdx)
   - **一手來源**：[Figma: How Figma scaled to multiple databases](https://www.figma.com/blog/how-figma-scaled-to-multiple-databases/)
   - **核心要點**：單體 RDS 極限、128 邏輯分片解耦、Colo 局部事務、自研 DBProxy AST 路由、影子讀驗證。
2. [**從 Cassandra 到 ScyllaDB：Discord 如何以 Rust 與 Request Coalescing 儲存數兆級訊息**](../../src/content/blog/discord-trillions-messages-scylladb-scaling.mdx)
   - **一手來源**：[Discord: How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages)
   - **核心要點**：JVM GC 停頓與墓碑風暴、C++ Seastar 零 GC 儲存引擎、Rust 單飛請求合併（Request Coalescing）、時間分桶。
3. [**萬億級交易防禦：Shopify 建構高可用支付系統的 10 大彈性原則**](../../src/content/blog/shopify-resilient-payment-systems.mdx)
   - **一手來源**：[Shopify: 10 Tips for Building Resilient Payment Systems](https://shopify.engineering/10-tips-for-building-resilient-payment-systems)
   - **核心要點**：ULID 冪等鍵、明確有限狀態機、帶全抖動指數退避、熔斷降級、頻外對帳循環。
4. [**Netflix 億級即時推播與階層式快取架構：Zuul Push 與 EVCache 的極致實踐**](../../src/content/blog/netflix-hierarchical-caching-push-messaging.mdx)
   - **一手來源**：[Netflix: How Netflix Scales Push Messaging for Millions of Devices](https://netflixtechblog.com/)
   - **核心要點**：Zuul Push WebSocket 長連線、Push Registry 尋址、Goldilocks 輕量節點防驚群、EVCache 跨 AZ 快取、XFetch 演算法防擊穿。
5. [**為什麼 Kafka 既快又不會丟失訊息？Zero-Copy 與 ISR 複寫的底層機制**](../../src/content/blog/kafka-zero-loss-high-throughput-architecture.mdx)
   - **一手來源**：[Apache Kafka Design & Storage Documentation](https://kafka.apache.org/documentation/#design)
   - **核心要點**：OS Page Cache、順序磁碟 I/O、Zero-Copy DMA `sendfile()`、`acks=all` 冪等發送、`min.insync.replicas=2`、手動 Offset 提交。

### 第 2 批：影音、社交與即時高併發管線

1. [**Twitter (X) 1.5 秒渲染「為你推薦」時間軸：Earlybird 檢索、Heavy Ranker 評分與重排管線**](../../src/content/blog/twitter-recommendation-algorithm-pipeline.mdx)
   - **一手來源**：[Twitter Recommendation Algorithm](https://blog.x.com/engineering/en_us/topics/open-source/2023/twitter-recommendation-algorithm)
   - **核心要點**：In-Network Earlybird 與 Out-of-Network GraphJet / SimClusters 候選檢索、Home Mixer 協調、MaskNet 48M 參數多任務評分、可見性過濾與多樣性重排。
2. [**YouTube 海量影片非同步上傳與分塊轉碼串流架構：從 Chunked Upload 到自適應 ABR**](../../src/content/blog/youtube-video-upload-transcoding-pipeline.mdx)
   - **一手來源**：[Google Cloud Video Processing](https://cloud.google.com/solutions/media-entertainment)
   - **核心要點**：Resumable Chunked 上傳協議、GOP 關鍵幀切片、非同步 DAG 任務排程、H.264 / VP9 / AV1 多編碼矩陣、HLS / DASH 自適應碼率。
3. [**TikTok 20 萬檔案超大型前端 MonoRepo 治理：模組邊界、增量快取與微前端架構**](../../src/content/blog/tiktok-massive-frontend-monorepo-architecture.mdx)
   - **一手來源**：[ByteDance Garfish & Rspack Architecture](https://github.com/web-infra-dev)
   - **核心要點**：領域套件邊界隔離、Affected Graph 依賴分析、Content Hash 雲端快取、分散式任務排程（DTE）、Garfish 微前端沙盒。
4. [**Uber 全球 API 閘道四代架構演進史：從單體 RTAPI 到宣告式多區域流量平台**](../../src/content/blog/uber-api-gateway-evolution-architecture.mdx)
   - **一手來源**：[Uber: The Evolution of Uber's API Gateway Architecture](https://www.uber.com/blog/evolution-of-ubers-api-layer/)
   - **核心要點**：四代演進（單體 RTAPI ➔ 去中心化閘道 ➔ 邊緣 gRPC ➔ 宣告式統一平台）、Protobuf Schema-First 自動生成 BFF、多區域主動雙活、自適應限流。

### 第 3 批：現代通訊協定、API 閘道與網路流量工程

1. [**傳輸協定演進史：HTTP/1.1 ➔ HTTP/2 ➔ HTTP/3，從隊頭阻塞到 QUIC 的極致實踐**](../../src/content/blog/http-evolution-http1-http2-http3.mdx)
   - **一手來源**：[RFC 9114 (HTTP/3)](https://datatracker.ietf.org/doc/html/rfc9114) / [Cloudflare Learning Center](https://www.cloudflare.com/learning/performance/what-is-http3/)
   - **核心要點**：HTTP/1.1 應用層阻塞、HTTP/2 二進位多路復用與 TCP 傳輸層阻塞、HTTP/3 QUIC over UDP、0-RTT 握手與 Connection ID 連線遷移。
2. [**反向代理 vs. API Gateway vs. 負載均衡器：架構邊界、選型維度與限流演算法深度對比**](../../src/content/blog/reverse-proxy-api-gateway-load-balancer.mdx)
   - **一手來源**：[Envoy Proxy Architecture](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/arch_overview) / [Nginx Documentation](https://nginx.org/en/docs/)
   - **核心要點**：L4/L7 負載均衡分流、反向代理邊緣 TLS 卸載與快取、API Gateway 微服務業務治理、Token Bucket / Leaky Bucket / 滑動窗口限流。
3. [**gRPC vs. REST vs. GraphQL 通訊邊界決策：傳輸效能、N+1 查詢與 Schema 演進全景分析**](../../src/content/blog/grpc-vs-rest-vs-graphql-communication-boundaries.mdx)
   - **一手來源**：[gRPC Documentation](https://grpc.io/docs/) / [GraphQL Specification](https://spec.graphql.org/)
   - **核心要點**：Protobuf 二進位序列化與 HTTP/2 雙向串流、REST 資源導向與 HTTP 快取生態、GraphQL 宣告式按需查詢與 DataLoader 解決 N+1 查詢。
4. [**金融與企業級 API 縱深防禦藍圖：OAuth 2.1、JWT 防重放、零信任 mTLS 與 OWASP 防護**](../../src/content/blog/enterprise-api-security-blueprint.mdx)
   - **一手來源**：[OWASP API Security Top 10](https://owasp.org/www-project-api-security/) / [IETF OAuth 2.1](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-08)
   - **核心要點**：邊界 WAF 與自適應限流、OAuth 2.1 PKCE 授權碼模式、RS256 非對稱簽名、JTI + Redis 防重放黑名單、微服務間 mTLS 零信任、BOLA 越權防禦。

### 第 4 批：分散式交易、儲存引擎與資料流

1. [**資料庫交易隔離層級與 MVCC 底層實作：從 Read Phenomena、寫偏斜到 PostgreSQL Snapshot 尋址**](../../src/content/blog/database-isolation-levels-mvcc-mechanisms.mdx)
   - **一手來源**：[PostgreSQL Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html) / [A Critique of ANSI SQL Isolation Levels](https://www.microsoft.com/en-us/research/publication/a-critique-of-ansi-sql-isolation-levels/)
   - **核心要點**：ANSI 讀異象（髒讀/不可重複讀/幻讀）、寫偏斜（Write Skew）異常與醫生值班問題、PostgreSQL Heap Tuple（xmin/xmax/t_ctid）、Snapshot 4 步可見性演算法、SSI 可序列化快照隔離與 SIREAD 依賴圖。
2. [**高併發秒殺庫存扣減架構：樂觀鎖、悲觀鎖、Redis 分散式鎖爭議與分段加鎖實踐**](../../src/content/blog/high-concurrency-inventory-locking-strategies.mdx)
   - **一手來源**：[Martin Kleppmann: How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
   - **核心要點**：`SELECT ... FOR UPDATE` 悲觀行鎖瓶頸、CAS 樂觀鎖與重試風暴、Redis Lua 原子扣減、Martin Kleppmann 對 Redlock 批判（GC 停頓/時鐘漂移）與 Fencing Token 解法、10 萬 QPS 分段庫存（Inventory Segment Sharding）。
3. [**CDC（變更資料擷取）與 Debezium 架構實戰：告別雙寫不一致、Transactional Outbox 與即時資料串流**](../../src/content/blog/cdc-debezium-transactional-outbox-streaming.mdx)
   - **一手來源**：[Debezium Documentation](https://debezium.io/documentation/)
   - **核心要點**：應用層雙寫不一致（Dual-Write）難題、Polling vs Log-based CDC、Transactional Outbox 模式、Debezium 引擎解析 Binlog/WAL、SMT 事件路由與 Kafka Connect 串流拓撲。
4. [**時序資料庫（TSDB）架構演進：LSM-Tree 寫入特化、倒排索引與 Facebook Gorilla 浮點壓縮**](../../src/content/blog/tsdb-architecture-lsm-gorilla-compression.mdx)
   - **一手來源**：[Facebook Gorilla Paper (VLDB 2015)](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf)
   - **核心要點**：B+ Tree 隨機寫入崩潰、LSM-Tree/TSM 寫入管線、Tag 多維倒排索引與 Roaring Bitmap 位元運算、Facebook Gorilla 雙重壓縮（時間戳 Delta-of-Delta 與 Float64 XOR 浮點壓縮）、Rollup 階層降採樣。

---

### 第 5 批：AI / LLM 系統架構與 Agent 工程化

1. [**大模型推理引擎優化全景：KV Cache 記憶體碎片化、vLLM PagedAttention 與推測解碼實戰**](../../src/content/blog/llm-inference-optimization-kv-cache-pagedattention.mdx)
   - **一手來源**：[vLLM: Efficient Memory Management with PagedAttention (SOSP 2023)](https://arxiv.org/abs/2309.06180)
   - **核心要點**：Prefill（計算密集）vs Decode（記憶體頻寬受限）階段、KV Cache 顯存浪費 60%~80% 機制、vLLM Logical Block Table 虛擬分頁區塊映射與 Copy-on-Write 零拷貝共享、Continuous Batching 迭代級動態調度、Speculative Decoding 推測解碼。
2. [**AI Agent 狀態機架構演進：ReAct 決策循環、記憶工程與 Firecracker 工具隔離沙盒**](../../src/content/blog/ai-agent-state-machine-sandbox-architecture.mdx)
   - **一手來源**：[Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
   - **核心要點**：Prompt 鏈 vs DAG vs 狀態機（FSM）、ReAct（Thought-Action-Observation）循環與 Plan-and-Solve、短期滑動視窗摘要與長期向量/圖譜記憶加權檢索、Firecracker/gVisor MicroVM 工具隔離沙盒、動作哈希死循環熔斷與 Human-in-the-loop 審批。
3. [**企業級開源 AI 技術棧藍圖：從 vLLM 推理、Qdrant 向量檢索到 LangGraph 編排與 Langfuse 評測**](../../src/content/blog/open-source-ai-stack-blueprint-architecture.mdx)
   - **一手來源**：[Hugging Face Guides](https://huggingface.co/docs) / [Langfuse Observability](https://langfuse.com/docs)
   - **核心要點**：企業開源 AI 四層架構（Serving / Vector & Storage / Orchestration / Observability & Eval）、vLLM 多 GPU 張量平行、Qdrant/Milvus 億級 HNSW 混合檢索（Dense + BM25）、LangGraph 狀態圖編排與 MCP 協議、Langfuse OpenTelemetry 全鏈路追蹤與 RAG Triad 自動評測。

### 獨立專題：ELK Stack 分散式日誌架構

1. [**ELK Stack 分散式日誌架構解析：倒排索引、Kafka 削峰管線與現代 Loki 成本演進**](../../src/content/blog/elk-stack-distributed-log-management-architecture.mdx)
   - **一手來源**：[ByteByteGo ELK Stack Guide](https://bytebytego.com/guides/what-is-elk-stack-and-why-is-it-so-popular-for-log-management/)
   - **核心要點**：Filebeat 邊界採集與背壓控制、Kafka 削峰防禦寫入雪崩、Logstash Grok 結構化解析、Lucene 倒排索引 FST 詞典與 Doc Values 列式儲存、Grafana Loki 僅索引標籤與 S3 壓縮（成本降 80%）、OpenSearch 開源分支選型。

### 第 6 批：真實巨頭架構案例二期

1. [**Slack 訊息投遞之旅：從 WebSocket 邊緣長連線、通道廣播到分片 MySQL 的即時架構實踐**](../../src/content/blog/slack-message-pipeline-architecture.mdx)
   - **一手來源**：[Slack Engineering: Real-time Messaging Architecture](https://slack.engineering/) / [ByteByteGo Guide](https://bytebytego.com/guides/what-is-the-journey-of-a-slack-message)
   - **核心要點**：邊緣 Envoy TLS 終結、WebSocket 雙向通道、Channel Server 記憶體廣播扇出、Flannel 邊緣快取、Vitess MySQL 分片與 Delta Sync 斷線增量補償。
2. [**McDonald's 百萬級即時訂單事件驅動架構：從 AWS Serverless、SQS 削峰到 DynamoDB 全球狀態機**](../../src/content/blog/mcdonalds-event-driven-architecture.mdx)
   - **一手來源**：[AWS Architecture Blog: McDonald's Event-Driven Platform](https://aws.amazon.com/blogs/architecture/) / [ByteByteGo Guide](https://bytebytego.com/guides/mcdonald's-event-driven-architecture)
   - **核心要點**：全通路點餐接入、AWS Lambda + SQS 削峰緩衝、DynamoDB Global Tables 狀態機、DynamoDB Streams + EventBridge 領域事件分發、KVS 門市廚房履約與離線收銀容災。
3. [**Airbnb 微服務架構演進：從單體 Monorail、無序 SOA 蜘蛛網到 DAG 樹狀分層與 Viaduct 資料網格**](../../src/content/blog/airbnb-microservices-evolution-architecture.mdx)
   - **一手來源**：[Airbnb Tech Blog: Microservices Evolution](https://medium.com/airbnb-engineering) / [ByteByteGo Guide](https://bytebytego.com/guides/airbnb-artchitectural-evolution)
   - **核心要點**：Monorail Rails 單體極限、第一代 SOA 蜘蛛網崩潰與循環依賴復盤、第二代 DAG 樹狀服務分層（Presentation ➔ Mid-tier ➔ DAS）、Viaduct GraphQL 資料網格與 OneTouch/Spinnaker 金絲雀自動交付。
4. [**Pinterest 單行代碼優化 99% Git Clone 耗時：Commit-Graph 底層原理與大型 Monorepo CI/CD 加速實踐**](../../src/content/blog/pinterest-git-clone-optimization-commit-graph.mdx)
   - **一手來源**：[Pinterest Engineering: How a single git config line saved 99% clone time](https://medium.com/pinterest-engineering) / [ByteByteGo Guide](https://bytebytego.com/guides/the-one-line-change-that-reduced-clone-times-by-a-whopping-99-says-pinterest)
   - **核心要點**：Git 物件協商 CPU 100% 瓶頸根因、Commit-Graph 二進位結構與 Generation Numbers 拓撲剪枝演算法、`fetch.writeCommitGraph=true` 配置、Blobless/Treeless/Shallow Clone 選型矩陣。
5. [**Reddit 核心儲存與高併發架構演進：從 Thing2 EAV、Redis 快取到 Cassandra 留言樹與 Baseplate 微服務**](../../src/content/blog/reddit-core-storage-high-concurrency-architecture.mdx)
   - **一手來源**：[Reddit Engineering: Evolution of Reddit Core Storage](https://www.reddit.com/r/RedditEng/) / [ByteByteGo Guide](https://bytebytego.com/guides/reddit's-core-architecture)
   - **核心要點**：PostgreSQL 上的 Thing2 EAV 模型得失、Memcached 99% 物件防擊穿快取、Redis Sorted Sets 熱門排行、Cassandra 寬表寫入特化、Materialized Path 留言樹記憶體即時構建、Vote Fuzzing 投票防刷演算法與 Baseplate 微服務。
6. [**Meta 規模化自動修復 Bug 架構：Infer 靜態分析與 SapFix 自動補丁生成的工業級實踐**](../../src/content/blog/meta-scale-automated-bug-fixing-sapfix-infer.mdx)
   - **一手來源**：[Facebook Engineering: Finding and fixing bugs automatically with SapFix and Infer](https://engineering.fb.com/2018/09/13/developer-tools/finding-and-fixing-bugs-automatically-with-sapfix-and-infer/) / [ByteByteGo Guide](https://bytebytego.com/guides/fixing-bugs-automatically-at-meta-scale)
   - **核心要點**：Infer 基於分離邏輯與雙向演繹的差量靜態掃描、SapFix 範本與 AST 變異自動補丁生成、沙盒編譯與差量迴歸測試（零功能回歸）、Human-in-the-loop 審查路由與 75%+ 生產採納率。

---

## ⏳ 後續待辦批次清單與一手資料庫儲備

### 第 7 批：分散式高階儲存與資料一致性

| 專題題目                                            | 涉及核心技術與模組                                                            | 建議一手來源                                                                                                                                           |
| :-------------------------------------------------- | :---------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Erasure Coding（糾刪碼 / RS Code）架構原理**      | 告別 3 副本 200% 儲存成本膨脹、范德蒙矩陣編解碼與節點修復頻寬優化             | [USENIX Fast / Ceph & HDFS Erasure Coding Guide](https://ceph.io/en/news/blog/2014/erasure-coding/)                                                    |
| **Event Sourcing（事件溯源）與 CQRS 讀寫分離架構**  | 不可篡改 Event Store、投影（Projections）構建、事件重放與最終一致性補償       | [Martin Fowler: Event Sourcing & CQRS](https://martinfowler.com/eaaDev/EventSourcing.html)                                                             |
| **分散式消息交付語義（Delivery Semantics）深析**    | At-Most-Once、At-Least-Once 與 Exactly-Once（冪等 Producer + 兩階段事務日誌） | [Confluent: Exactly-Once Semantics in Apache Kafka](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/) |
| **S3 大檔案分段上傳（Multipart Upload）與斷點續傳** | ETag 驗證、平行上傳管線、分片合併與網絡抖動錯誤復原                           | [AWS S3 Developer Guide: Multipart Upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html)                                     |
| **主從資料庫複製延遲（Replication Lag）應對策略**   | 讀寫分離陷阱、主庫強制讀、快取暫存（Cache-aside）與 GTID 一致性路由           | [MySQL Reference Manual: Replication Implementation Details](https://dev.mysql.com/doc/refman/8.0/en/replication-solutions.html)                       |

### 第 8 批：即時通訊、網路協定與授權體系

| 專題題目                                                     | 涉及核心技術與模組                                                                      | 建議一手來源                                                                               |
| :----------------------------------------------------------- | :-------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| **即時通訊協定全景對決：WebSocket vs. SSE vs. Long Polling** | 連線生命週期開銷、伺服器資源消耗、心跳機制與重連風暴防禦                                | [MDN Web Docs: WebSockets / Server-Sent Events](https://developer.mozilla.org/)            |
| **OAuth 2.0 與 OpenID Connect (OIDC) 授權拓撲全景**          | Authorization Code Flow、PKCE 防禦、JWT 簽名/驗證與 Token 輪換機制                      | [RFC 6749: OAuth 2.0 / RFC 7636: PKCE](https://datatracker.ietf.org/doc/html/rfc6749)      |
| **NAT 穿透與 Anycast 邊界路由演進**                          | STUN / TURN / ICE 穿透機制、BGP Anycast 尋址與全球 CDN 邊緣流量加速                     | [Cloudflare Blog: What is Anycast & How BGP Routing Works](https://blog.cloudflare.com/)   |
| **現代負載平衡演算法精析**                                   | 一致性雜湊（Consistent Hashing 虛擬節點）、加權輪詢（Weighted Round Robin）與最小連線數 | [HAProxy Documentation: Load Balancing Algorithms](https://www.haproxy.com/documentation/) |

### 第 9 批：高可用、分散式限流與流量治理

| 專題題目                                                             | 涉及核心技術與模組                                                    | 建議一手來源                                                                                                                  |
| :------------------------------------------------------------------- | :-------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **現代分散式限流演算法：Token Bucket vs. Leaky Bucket vs. 滑動視窗** | Redis Lua 原子腳本、叢集限流、動態配額與熔斷降級                      | [Stripe Engineering: Scaling your API with rate limiters](https://stripe.com/blog/rate-limiters)                              |
| **分散式唯一 ID 生成器架構：Snowflake vs. Leaf vs. UUIDv7**          | 時鐘回撥（Clock Drift）防禦、趨勢遞增、B+ Tree 索引友善性與高併發效能 | [Twitter Snowflake / Meituan Leaf](https://tech.meituan.com/2017/04/21/mt-leaf.html)                                          |
| **斷路器（Circuit Breaker）與指數退避重試**                          | 狀態機（Closed/Open/Half-Open）、重試風暴防禦與 Jitter 隨機抖動       | [AWS Architecture: Exponential Backoff And Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) |
| **分散式快取失效三大災難：快取穿透、快取擊穿與快取雪崩**             | 布隆過濾器（Bloom Filter）、互斥鎖（Mutex）與隨機過期時間加權         | [Redis Documentation: Caching Best Practices](https://redis.io/docs/)                                                         |

### 第 10 批：DevOps、Git 底層與計算機基礎

| 專題題目                                                                | 涉及核心技術與模組                                                              | 建議一手來源                                                                                       |
| :---------------------------------------------------------------------- | :------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------- |
| **Git 內部核心架構：Blob、Tree、Commit 與 Packfile**                    | 內容尋址物件資料庫、SHA-1/SHA-256 哈希、Delta 壓縮與 Garbage Collection         | [Pro Git Book: Git Internals](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain) |
| **瀏覽器渲染引擎底層原理：從 HTML/CSS 解析到 DOM、Layout 與 Composite** | 關鍵渲染路徑（CRP）、重排（Reflow）與重繪（Repaint）效能優化                    | [web.dev: How Browsers Work / Critical Rendering Path](https://web.dev/critical-rendering-path/)   |
| **Linux I/O 多路復用架構演進：select vs. poll vs. epoll**               | 邊緣觸發（ET）與水平觸發（LT）、紅黑樹/就緒鏈表、Reactor 模式與高效能網路伺服器 | [Linux Kernel man-pages: epoll(7)](https://man7.org/linux/man-pages/man7/epoll.7.html)             |
| **分散式系統共識演算法：CAP 定理、PACELC 與 Raft 協定精析**             | Leader Election、Log Replication、安全性保證與分區容忍性                        | [In Search of an Understandable Consensus Algorithm (Raft Paper)](https://raft.github.io/raft.pdf) |

### 第 11 批：分散式事務與跨庫協同模式

| 專題題目                                                             | 涉及核心技術與模組                                                           | 建議一手來源                                                                          |
| :------------------------------------------------------------------- | :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| **Saga 模式實踐：Orchestration（編排）vs. Choreography（協同）**     | 補償事務（Compensating Transactions）、前向恢復 vs. 後向恢復、狀態機持久化   | [Microservices.io: Saga Pattern](https://microservices.io/patterns/data/saga.html)    |
| **兩階段提交（2PC）與三階段提交（3PC）的極限與阻塞問題**             | Coordinator 單點故障、同步阻塞、網路分區腦裂與 TCC（Try-Confirm-Cancel）模式 | [Designing Data-Intensive Applications (Kleppmann)](https://dataintensive.net/)       |
| **資料庫分庫分表（Sharding）與分散式主鍵路由**                       | 範圍分片、雜湊分片、一致性雜湊、跨分片 JOIN 與分散式聚合查詢解法             | [Apache ShardingSphere Documentation](https://shardingsphere.apache.org/)             |
| **資料庫索引底層深度拆解：B+ Tree vs. LSM-Tree vs. Hash vs. Bitmap** | 磁碟 I/O 特性、隨機寫 vs. 順序寫、寫入放大與覆蓋索引（Covering Index）       | [PostgreSQL Indexing Internals](https://www.postgresql.org/docs/current/indexes.html) |

### 第 12 批：快取架構與記憶體儲存技術

| 專題題目                                                            | 涉及核心技術與模組                                                                  | 建議一手來源                                                                                                                      |
| :------------------------------------------------------------------ | :---------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **五大分散式快取讀寫模式：Cache-Aside 到 Refresh-Ahead**            | 併發更新一致性、延遲雙刪與 Binlog 異步更新                                          | [Microsoft Cloud Design Patterns: Cache-Aside Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside) |
| **記憶體快取淘汰演算法深度對決：LRU vs. LFU vs. ARC vs. W-TinyLFU** | 突發流量污染（Scan Resistance）、雙向鏈表哈希表實作、Caffeine 快取核心機制          | [Caffeine: A High Performance Caching Library for Java](https://github.com/ben-manes/caffeine)                                    |
| **Redis 核心架構與單執行緒反應器模式 (Reactor Event Loop)**         | 非阻塞 I/O、記憶體資料結構（Sds, Dict, Ziplist, SkipList）、Redis 6.0+ 多執行緒 I/O | [Redis Source Code & Architecture](https://redis.io/docs/management/optimization/latency/)                                        |
| **分散式快取叢集架構：Redis Cluster vs. Twemproxy vs. Codis**       | 16384 虛擬槽（Slot）、Gossip 協議節點通訊、主從自動切換與故障轉移                   | [Redis Cluster Specification](https://redis.io/docs/reference/cluster-spec/)                                                      |

### 第 13 批：現代消息隊列與事件驅動架構

| 專題題目                                                           | 涉及核心技術與模組                                                                  | 建議一手來源                                                                                                      |
| :----------------------------------------------------------------- | :---------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **主流消息隊列技術選型：Kafka vs. RabbitMQ vs. RocketMQ vs. SQS**  | AMQP vs. Log-centric、吞吐量、延遲（Sub-millisecond vs. High-throughput）、死信隊列 | [RabbitMQ Documentation](https://www.rabbitmq.com/docs) / [Apache Kafka Documentation](https://kafka.apache.org/) |
| **分散式消息隊列四大核心隊列模式：FIFO、優先級、延時與死信隊列**   | 時間輪（TimingWheel）架構、指數重試隊列與訊息中毒（Poison Pill）防禦                | [Enterprise Integration Patterns: Dead Letter Channel](https://www.enterpriseintegrationpatterns.com/)            |
| **Apache Avro 與 Schema Registry 實戰：平滑資料遷移與相容性**      | 二進位序列化壓縮、Backward / Forward / Full 相容性規則與資料湖演進                  | [Confluent Schema Registry Guide](https://docs.confluent.io/platform/current/schema-registry/index.html)          |
| **現代即時推播通知系統架構：APNs、FCM、WebSocket 與 SMS 統一調度** | 頻率限制（Rate Limiting）、優先級佇列、防重複去重與多管道降級                       | [Apple Developer: APNs Overview](https://developer.apple.com/documentation/usernotifications/)                    |

### 第 14 批：微服務治理、服務網格與彈性架構

| 專題題目                                                              | 涉及核心技術與模組                                                          | 建議一手來源                                                                                                                |
| :-------------------------------------------------------------------- | :-------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| **服務發現與註冊中心架構：Eureka vs. Consul vs. Nacos vs. ZooKeeper** | AP vs. CP 模式、心跳探活機制、長輪詢推送與一致性協定                        | [HashiCorp Consul Architecture](https://developer.hashicorp.com/consul/docs/architecture)                                   |
| **Service Mesh 服務網格底層架構：Envoy Sidecar 與 Istio 控制面**      | 流量攔截（iptables / eBPF）、動態服務發現（xDS 協議）、熔斷限流與無侵入觀測 | [Envoy Proxy Architecture](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/arch_overview)                   |
| **現代 CI/CD 自動化管線與發布策略：Blue-Green、Canary 與 Rolling**    | 自動金絲雀分析（Kayenta）、流量權重切換、快速回滾與資料庫遷移相容           | [Netflix TechBlog: Automated Canary Analysis at Netflix with Kayenta](https://netflixtechblog.com/)                         |
| **微服務架構隔離模式：Bulkhead（艙壁隔離）與租戶資源配額**            | 故障蔓延防禦、執行緒池飢餓與服務雪崩阻斷                                    | [Microsoft Cloud Design Patterns: Bulkhead Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead) |

### 第 15 批：經典系統設計實戰面試

| 專題題目                                                          | 涉及核心技術與模組                                                                      | 建議一手來源                                                                                                       |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| **經典系統設計：如何設計 Stack Overflow 高併發問答平台？**        | 讀多寫少極致快取、全文搜尋、Tag 倒排索引與單體服務極限榨取                              | [Nick Craver: Stack Overflow Architecture & Performance](https://nickcraver.com/blog/)                             |
| **經典系統設計：如何設計分散式網址縮短服務 (TinyURL)？**          | Base62 編碼、哈希衝突解決、KV 儲存選型、高併發讀快取與自增發號器                        | [System Design Interview by Alex Xu](https://bytebytego.com/)                                                      |
| **經典系統設計：如何設計全球分散式檔案存取系統 (Dropbox / S3)？** | 區塊級差異同步（Chunking & Delta Sync）、中繼資料分離、同步衝突解決與離線佇列           | [Dropbox Tech Blog: Rewriting the Sync Engine](https://dropbox.tech/infrastructure/rewriting-the-heart-of-dropbox) |
| **經典系統設計：如何設計分散式網頁爬蟲 (Web Crawler)？**          | URL 邊界佇列（URL Frontier）、布隆過濾器去重、禮貌策略（Politeness Policy）與分散式調度 | [Stanford Web Crawler Architecture Paper](http://infolab.stanford.edu/~olston/publications/crawling_survey.pdf)    |

### 第 16 批：支付系統與金融級帳務架構

| 專題題目                                                       | 涉及核心技術與模組                                                    | 建議一手來源                                                                                                     |
| :------------------------------------------------------------- | :-------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **Stripe 全球支付網關與跨國智慧路由架構**                      | 交易有限狀態機、多收單機構（Acquirers）智慧路由、卡組織協議與超時補償 | [Stripe Engineering: How Stripe handles millions of requests per second](https://stripe.com/blog/infrastructure) |
| **雙式記帳（Double-Entry Bookkeeping）與分散式帳本架構**       | 會計借貸平衡不變量、不可篡改流水、分散式鎖與防超賣對帳                | [Modern Treasury: Ledgers Architecture](https://www.moderntreasury.com/learn/ledger-database)                    |
| **即時風控與反詐欺檢測系統（Fraud Detection Architecture）**   | 特徵工程、即時規則引擎（Drools）、圖神經網絡（GNN）與毫秒級風控阻斷   | [Uber Engineering: Real-Time Fraud Prevention Engine](https://www.uber.com/blog/fraud-prevention/)               |
| **銀行間清算與對帳系統（Reconciliation & Settlement Engine）** | 差錯帳處理、T+1/T+0 清算管線、三方對帳矩陣與自動沖正補償              | [Shopify Engineering: Financial Reconciliation System](https://shopify.engineering/)                             |

### 第 17 批：資訊安全與現代密碼學架構

| 專題題目                                                         | 涉及核心技術與模組                                                                  | 建議一手來源                                                                                                  |
| :--------------------------------------------------------------- | :---------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **TLS 1.3 握手協議與 0-RTT 早期數據安全**                        | Diffie-Hellman 密鑰交換、前向保密（PFS）、0-RTT 重放攻擊防禦與證書鏈驗證            | [Cloudflare Blog: The TLS 1.3 Protocol Explained](https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/)          |
| **端到端加密（E2EE）架構：Signal Protocol vs. Telegram MTProto** | 雙棘輪演算法（Double Ratchet）、X3DH 密鑰協商、前向保密與後向安全                   | [Signal: Double Ratchet Algorithm Spec](https://signal.org/docs/specifications/doubleratchet/)                |
| **零信任架構（Zero Trust Architecture）與 BeyondCorp 實踐**      | 永不信任始終驗證、動態存取控制（RBAC/ABAC）、微隔離（Micro-segmentation）與設備信任 | [Google Research: BeyondCorp - A New Approach to Enterprise Security](https://research.google/pubs/pub43231/) |
| **API 安全防禦實戰：OWASP API Security Top 10 與防刷防爆**       | BOLA（失效物件級授權）、Mass Assignment、JWT 簽名混淆防禦與 WAF 邊界防禦            | [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)                                      |

### 第 18 批：計算機底層與網路傳輸原理

| 專題題目                                                         | 涉及核心技術與模組                                                          | 建議一手來源                                                                                                         |
| :--------------------------------------------------------------- | :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **從輸入 URL 到頁面呈現全景：DNS、TCP 三向交握與 TLS 全流程**    | 遞迴/迭代 DNS、SYN/ACK 連線建立、TLS 協商、HTTP 請求到 DOM 繪製             | [What happens when you type google.com into your browser and press enter](https://github.com/alex/what-happens-when) |
| **TCP vs. UDP vs. QUIC 傳輸層協定對決與擁塞控制**                | 滑動視窗、BBR / CUBIC 擁塞控制、隊頭阻塞（HOL Blocking）與 Multiplexing     | [RFC 9000: QUIC A UDP-Based Multiplexed and Secure Transport](https://datatracker.ietf.org/doc/html/rfc9000)         |
| **CPU 多核心快取架構（L1/L2/L3）與 False Sharing（偽共享）優化** | MESI 快取一致性協議、Cache Line（64-byte）對齊、記憶體屏障與 CAS 效能       | [Intel 64 and IA-32 Architectures Software Developer's Manual](https://www.intel.com/)                               |
| **記憶體管理與虛擬位址轉換：TLB、Page Fault 與 HugePages**       | MMU 頁表分級映射、TLB 快取命中率、缺頁中斷開銷與 Linux HugePages 大頁記憶體 | [Linux Kernel Documentation: Virtual Memory Management](https://www.kernel.org/doc/gorman/)                          |

### 第 19 批：大規模資料管道與現代資料湖

| 專題題目                                                          | 涉及核心技術與模組                                                                 | 建議一手來源                                                                                                |
| :---------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| **現代資料管道架構演進：ETL vs. ELT 與 Lambda vs. Kappa 架構**    | 批流一體、即時資料湖入庫、資料品質檢驗（Great Expectations）與 Schema 漂移         | [O'Reilly: Designing Data-Intensive Applications](https://dataintensive.net/)                               |
| **資料湖倉一體（Lakehouse）核心技術：Iceberg vs. Delta vs. Hudi** | ACID 事務、Time Travel 時間旅行、快照隔離（Snapshot Isolation）與 Parquet 列式儲存 | [Apache Iceberg Documentation](https://iceberg.apache.org/) / [Delta Lake Architecture](https://delta.io/)  |
| **即時串流運算引擎對決：Apache Flink vs. Spark Streaming**        | 真正事件驅動 vs. 微批次、Stateful 狀態計算、Watermark 與 Exactly-Once Checkpoint   | [Apache Flink Documentation](https://flink.apache.org/)                                                     |
| **高效能資料處理演進：從 Pandas 到 Polars、Dask 與 Ray**          | Apache Arrow 記憶體格式、Rust 向量化執行、延遲計算（Lazy Eval）與分散式 Actor 模型 | [Polars User Guide](https://pola-rs.github.io/polars-book/) / [Ray Core Architecture](https://docs.ray.io/) |

### 第 20 批：系統設計面試方法論與容量估算

| 專題題目                                                           | 涉及核心技術與模組                                                                  | 建議一手來源                                                                                                       |
| :----------------------------------------------------------------- | :---------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| **系統設計面試黃金 4 步架構法 (PEDALS / 4-Step Framework)**        | Scope 定義、High-Level 設計、Deep-Dive 瓶頸突破與 Wrap-Up 權衡總結                  | [System Design Interview – An Insider's Guide (Alex Xu)](https://bytebytego.com/)                                  |
| **億級系統容量預估（Capacity Estimation）與 SLA/SLO/SLI 數學建模** | 存儲量（Storage）、頻寬（Bandwidth）、QPS 峰值計算與 99.99% 可用性架構設計          | [Google SRE Book: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)                 |
| **高併發分散式系統指標評估：QPS、TPS、P99 延遲與成本精算**         | 長尾延遲（Tail Latency）成因、GC/網路抖動、小定律（Little's Law）與叢集成本模型     | [The Tail at Scale (Dean & Barroso - CACM)](https://research.google/pubs/pub40801/)                                |
| **系統設計反模式與技術債治理（Technical Debt & Anti-Patterns）**   | 分散式單體（Distributed Monolith）、過早優化、神之服務（God Service）與平滑重構演進 | [Martin Fowler: Technical Debt & Microservices AntiPatterns](https://martinfowler.com/articles/microservices.html) |

---

## 📌 後續排期原則

1. **依序自 `docs/article-queue.md` 取出主題**，維持「單篇完成 ➔ 查核 ➔ 圖解 ➔ 封面 ➔ 測試 ➔ 部署」的完整閉環。
2. **所有專題必須具備原生 SVG 圖解元件與專屬 3D 等距封面**，嚴格遵守 CarlStack 內容指南與 Policy Gate。
