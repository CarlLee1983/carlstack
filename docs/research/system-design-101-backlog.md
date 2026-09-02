# ByteByteGo System Design 101：架構主題清單與研究儲備

> 主來源：<https://github.com/ByteByteGoHq/system-design-101>
>
> 研究與建檔日期：2026-09-02
>
> 狀態：已完成第 1 批（5 篇）與第 2 批（4 篇）專題發布，其餘主題已分批結構化歸檔，供後續排期撰寫。

---

## 📊 發布進度與狀態

| 批次        | 主題範疇                                                               | 規劃篇數 | 已發布篇數 | 狀態              |
| :---------- | :--------------------------------------------------------------------- | :------- | :--------- | :---------------- |
| **第 1 批** | 科技巨頭核心架構演進（Postgres / ScyllaDB / 支付 / 推播快取 / Kafka）  | 5 篇     | 5 篇       | ✅ **已全數發布** |
| **第 2 批** | 影音、社交與即時高併發管線（Twitter / YouTube / TikTok / Uber）        | 4 篇     | 4 篇       | ✅ **已全數發布** |
| **第 3 批** | 現代通訊協定、API 閘道與網路流量工程（HTTP/3 / gRPC / 閘道邊界）       | 4 篇     | 0 篇       | ⏳ 排入待辦佇列   |
| **第 4 批** | 分散式交易、儲存引擎與資料流（隔離層級 / 樂觀悲觀鎖 / CDC / TSDB）     | 4 篇     | 0 篇       | 📋 儲備中         |
| **第 5 批** | AI / LLM 系統架構與 Agent 工程化（推理加速 / Agent 狀態機 / AI Stack） | 3 篇     | 0 篇       | 📋 儲備中         |

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

---

## ⏳ 後續批次主題清單與一手資料庫

### 第 3 批：現代通訊協定、API 閘道與網路流量工程

| 專題題目                                     | 涉及核心技術與模組                                                                                  | 建議一手來源                                                                                                           |
| :------------------------------------------- | :-------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **傳輸協定演進：HTTP/1.1 ➔ HTTP/2 ➔ HTTP/3** | 隊頭阻塞（Head-of-Line Blocking）、QUIC / UDP 核心、0-RTT 連線建立、多路復用                        | [RFC 9114 (HTTP/3) / Cloudflare Learning Center](https://www.cloudflare.com/learning/performance/what-is-http3/)       |
| **反向代理 vs. API Gateway vs. 負載均衡器**  | 四層（TCP/UDP）與七層（HTTP）路由、TLS 卸載、服務發現、Rate Limiting 演算法（Token / Leaky Bucket） | [Envoy Proxy Architecture / Nginx Docs](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/arch_overview) |
| **gRPC vs. REST vs. GraphQL 通訊邊界決策**   | Protobuf 二進位序列化、雙向串流、N+1 查詢問題、Schema 演進與向後相容                                | [gRPC Documentation / GraphQL Specs](https://grpc.io/docs/)                                                            |
| **金融與企業級 API 安全防禦藍圖**            | OAuth 2.1 / OIDC、JWT 重放攻擊防禦、mTLS 雙向認證、Rate Limiter 防暴破                              | [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)                                               |

---

### 第 4 批：分散式交易、儲存引擎與資料流

| 專題題目                                       | 涉及核心技術與模組                                                                                      | 建議一手來源                                                                                                                  |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------- |
| **資料庫交易隔離層級與 MVCC 底層實作**         | Read Committed, Repeatable Read, Serializable、髒讀 / 幻讀 / 寫偏斜（Write Skew）、PostgreSQL MVCC 快照 | [PostgreSQL Documentation Chapter 13: Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html)                 |
| **高併發扣減：樂觀鎖 vs. 悲觀鎖 vs. 分散式鎖** | `SELECT ... FOR UPDATE`、CAS（Compare-And-Swap）、Redis Redlock 爭議、庫存分段加鎖                      | [Martin Kleppmann: How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) |
| **CDC（Change Data Capture）與 Debezium 實戰** | 捕獲 WAL / Binlog、雙寫一致性問題、Outbox Pattern、即時 ETL 資料湖管線                                  | [Debezium Documentation / Confluent CDC Guides](https://debezium.io/documentation/)                                           |
| **時序資料庫（TSDB）架構與 LSM-Tree 寫入特化** | 倒排索引（Inverted Index）、Gorilla 浮點數壓縮、Rollup 降採樣、InfluxDB / TimescaleDB                   | [Gorilla: A Fast, Scalable, In-Memory Time Series Database (VLDB Paper)](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf)     |

---

### 第 5 批：AI / LLM 系統架構與 Agent 工程化

| 專題題目                                           | 涉及核心技術與模組                                                                         | 建議一手來源                                                                                                           |
| :------------------------------------------------- | :----------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **大模型推理引擎優化：KV Cache 與 PagedAttention** | 記憶體碎片化治理、vLLM 核心原理、Speculative Decoding（推測解碼）、Continuous Batching     | [vLLM: Efficient Memory Management with PagedAttention (SOSP Paper)](https://arxiv.org/abs/2309.06180)                 |
| **AI Agent 狀態機與工具執行沙盒**                  | ReAct 思考循環、Plan-and-Solve 任務規劃、短期/長期記憶工程（Memory Engineering）、權限沙盒 | [Anthropic: Building Effective Agents / Google Research](https://www.anthropic.com/research/building-effective-agents) |
| **端到端開源 AI 技術棧（Open Source AI Stack）**   | 模型託管（Ollama / vLLM）、向量檢索（Qdrant / Milvus）、工作流編排與評測追蹤               | [LangChain / LlamaIndex / Hugging Face Guides](https://huggingface.co/docs)                                            |

---

## 📌 後續排期原則

1. **依序自 `docs/article-queue.md` 取出主題**，維持「單篇完成 ➔ 查核 ➔ 圖解 ➔ 封面 ➔ 測試 ➔ 部署」的完整閉環。
2. **所有專題必須具備原生 SVG 圖解元件與專屬 3D 等距封面**，嚴格遵守 CarlStack 內容指南與 Policy Gate。
