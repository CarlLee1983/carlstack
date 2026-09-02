# ByteByteGo System Design 101：架構主題清單與研究儲備

> 主來源：<https://github.com/ByteByteGoHq/system-design-101>
>
> 研究與建檔日期：2026-09-02
>
> 狀態：已完成第 1 批（5 篇）、第 2 批（4 篇）、第 3 批（4 篇）、第 4 批（4 篇）與第 5 批（3 篇）共 20 篇架構專題全數發布上線。

---

## 📊 發布進度與狀態

| 批次        | 主題範疇                                                                | 規劃篇數 | 已發布篇數 | 狀態              |
| :---------- | :---------------------------------------------------------------------- | :------- | :--------- | :---------------- |
| **第 1 批** | 科技巨頭核心架構演進（Postgres / ScyllaDB / 支付 / 推播快取 / Kafka）   | 5 篇     | 5 篇       | ✅ **已全數發布** |
| **第 2 批** | 影音、社交與即時高併發管線（Twitter / YouTube / TikTok / Uber）         | 4 篇     | 4 篇       | ✅ **已全數發布** |
| **第 3 批** | 現代通訊協定、API 閘道與網路流量工程（HTTP/3 / gRPC / 閘道邊界 / 安全） | 4 篇     | 4 篇       | ✅ **已全數發布** |
| **第 4 批** | 分散式交易、儲存引擎與資料流（隔離層級 / 樂觀悲觀鎖 / CDC / TSDB）      | 4 篇     | 4 篇       | ✅ **已全數發布** |
| **第 5 批** | AI / LLM 系統架構與 Agent 工程化（推理加速 / Agent 狀態機 / AI Stack）  | 3 篇     | 3 篇       | ✅ **已全數發布** |

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

---

## 📌 後續排期原則

1. **依序自 `docs/article-queue.md` 取出主題**，維持「單篇完成 ➔ 查核 ➔ 圖解 ➔ 封面 ➔ 測試 ➔ 部署」的完整閉環。
2. **所有專題必須具備原生 SVG 圖解元件與專屬 3D 等距封面**，嚴格遵守 CarlStack 內容指南與 Policy Gate。
