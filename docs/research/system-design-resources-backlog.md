# System Design 系統設計精選資源與選題大綱規劃庫

> 建立日期：2026-09-21  
> 狀態：規劃階段（以代表性/隨機架構概念擬定綱要，標記待完善撰文，審閱確認後再逐一展開一手調研與發布）

---

## 📚 來源清單與定位分析

| 來源 Repo                                                                                                 | 特色與定位                                                                           | 適合的切入方向                                                           |
| :-------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer)                   | 系統設計界經典教科書，涵蓋擴展性基礎原則、CAP/PACELC、資料庫分片、快取模式與計算估算 | 底層核心理論、經典基礎架構觀念補完                                       |
| [ByteByteGoHq/system-design-101](https://github.com/ByteByteGoHq/system-design-101)                       | 視覺化架構圖、軟體工程日常模式（站內已發布 97 篇基礎與企業案例）                     | 持續追蹤其最新更新的主題、微架構模式                                     |
| [karanpratapsingh/system-design](https://github.com/karanpratapsingh/system-design)                       | 條理分明的架構指南，包含架構原則、通訊模式與容錯設計                                 | 架構模組精華與系統拆解指南                                               |
| [ashishps1/awesome-system-design-resources](https://github.com/ashishps1/awesome-system-design-resources) | 綜合資源清單、各類系統設計主題與面試速查手冊                                         | 選題索引、面試考點橫向對比                                               |
| [binhnguyennus/awesome-scalability](https://github.com/binhnguyennus/awesome-scalability)                 | 海量高擴展性資源彙整，包含巨頭實踐、資料庫架構、失敗案例復盤                         | 企業級高併發實戰與容災復盤專題                                           |
| [madd86/awesome-system-design](https://github.com/madd86/awesome-system-design)                           | 分散式系統理論與實踐的高質量架構精選集                                               | 分散式協同、一致性協定深化                                               |
| [checkcheckzz/system-design-interview](https://github.com/checkcheckzz/system-design-interview)           | 精準的面試題目實戰（如 TinyURL, 搜尋自動補全, 訂票系統等）                           | 具體場景的端到端（E2E）系統設計題目                                      |
| [chiphuyen/machine-learning-systems-design](https://github.com/chiphuyen/machine-learning-systems-design) | Chip Huyen 的經典 ML 系統架構，聚焦 ML/AI 落地與生產環境工程                         | **ML/AI System Design** 專題（特徵工程、模型服務化、線上監控、資料漂移） |
| [systemdesign42/system-design-academy](https://github.com/systemdesign42/system-design-academy)           | 體系化的架構學院教材與系統化評估指南                                                 | 系統設計思考框架與系統性查核清單                                         |

---

## 🧭 系統設計先期規劃大綱（待完善撰文）

從上述 9 個庫中抽樣出 6 個具高度代表性、橫跨不同層級（**協作即時性、ML 基礎架構、海量任務調度、搜尋檢索、全球多活、共識底層**）的核心主題，先擬定完整大綱與架構推演骨架：

---

### 專題 1：即時多人協作系統架構：OT（操作轉換）與 CRDT（無衝突複製資料型態）實戰

- **狀態**：📝 `待完善撰文（Pending Research & Writing）`
- **對應來源**：`binhnguyennus/awesome-scalability`, `madd86/awesome-system-design` (Google Docs / Figma 案例)
- **架構核心大綱**：
  1. **協作難題的本質**：並行編輯衝突、因果順序（Causality）、意圖保留（Intention Preservation）與 CAP 定理取捨。
  2. **OT（Operational Transformation）架構**：
     - 中心化服務器角色：狀態向量（State Vector）與版本變更轉移矩陣。
     - 局限性：複雜的 $O(N^2)$ 轉換函數、高併發中心伺服器效能與維護瓶頸。
  3. **CRDT（Conflict-Free Replicated Data Types）現代演進**：
     - 狀態型（CvRDT / Join-semilattice）vs. 操作型（CmRDT）。
     - 字符序列 CRDT：RGA, Logoot, LSEQ 與 Yjs 的 StructStore 鏈表最佳化。
  4. **工程落地架構圖**：
     - WebSocket 雙向訊息通道 + 本地樂觀更新（Optimistic UI）。
     - 訊息廣播扇出、房間狀態快照（Snapshot）與持久化落庫（S3 / Postgres）。
     - 斷線重連補償機制與增量 Delta 同步。
  5. **一手調研清單**：Figma Multiplayer CRDT 技術博客、Yjs 內部實作白皮書。

---

### 專題 2：生產級 ML 系統架構：特徵存儲（Feature Store）與線上即時推理管線

- **狀態**：📝 `待完善撰文（Pending Research & Writing）`
- **對應來源**：`chiphuyen/machine-learning-systems-design`
- **架構核心大綱**：
  1. **ML 系統特有痛點**：培訓/推理偏差（Training-Serving Skew）、特徵重複計算、即時特徵與批量特徵的時間一致性。
  2. **雙存儲架構（Dual-Storage Engine）**：
     - 線上儲存（Online Store）：低延遲讀取（Redis / DynamoDB），供即時推斷查詢特徵。
     - 離線儲存（Offline Store）：高吞吐歷史查詢（Snowflake / BigQuery / Parquet on S3），供模型批量訓練。
     - 點時間時間旅行（Point-in-time Correctness / Time-travel Joins）防止特徵穿越洩漏。
  3. **模型服務化架構（Model Serving Engine）**：
     - Triton Inference Server / TorchServe 部署拓撲。
     - 動態批次打包（Dynamic Batching）與 GPU 算力飽和度調度。
     - 模型熱加載（Hot Reload）與影子部署（Shadow Deployment / Canary）。
  4. **特徵監控與資料漂移（Drift Detection）閉環**：
     - PSI（Population Stability Index）、KL 散度線上即時計算。
     - 性能衰減自動觸發重新訓練（Continuous Training DAG）。
  5. **一手調研清單**：Feast 開源架構規範、Uber Michelangelo 機器學習平台架構。

---

### 專題 3：全球分散式定時任務調度系統：分級時間輪（Timing Wheel）與分散式協調

- **狀態**：✅ `已發布（Published）` - 詳見 [`src/content/blog/distributed-scheduler-hierarchical-timing-wheel.mdx`](../../src/content/blog/distributed-scheduler-hierarchical-timing-wheel.mdx)
- **對應來源**：`karanpratapsingh/system-design`, `ByteByteGoHq/system-design-101`
- **架構核心大綱**：
  1. **海量延時任務挑戰**：千萬級任務同時註冊、毫秒級觸發精度、高可靠不丟失與分散式容災。
  2. **核心調度演算法**：
     - 最小堆（Min-Heap）$O(\log N)$ 插入性能瓶頸。
     - 階層分級時間輪（Hashed & Hierarchical Timing Wheel，Kafka 內部機制）：時間槽（Bucket）、雙向鏈表與溢位輪（Overflow Wheel）。
  3. **分散式調度架構**：
     - 調度中心（Scheduler Coordinator）：Leader 選主、分區哈希槽分配。
     - 執行節點（Worker Pool）：拉取（Pull）vs. 推送（Push）模式、心跳與優雅停止。
     - 持久化儲存與防重防漏：分散式鎖 + 樂觀重試防重複執行、MySQL / Redis 狀態機雙保險。
  4. **一手調研清單**：Kafka TimingWheel 源碼設計、Airbnb Chronos / Apache DolphinScheduler 架構。

---

### 專題 4：搜尋框即時自動補全（Typeahead / Autocomplete）高併發架構

- **狀態**：✅ `已發布（Published）` - 詳見 [`src/content/blog/typeahead-autocomplete-high-concurrency-architecture.mdx`](../../src/content/blog/typeahead-autocomplete-high-concurrency-architecture.mdx)
- **對應來源**：`donnemartin/system-design-primer`, `checkcheckzz/system-design-interview`
- **架構核心大綱**：
  1. **業務指標與邊界**：P99 延遲小於 50ms、高頻 QPS（10 萬+）、前綴匹配與動態熱門權重排序。
  2. **核心資料結構**：
     - Trie 字典樹：前綴節點存儲 Top-K 候選結果（空間換時間）。
     - 動態評分與更新：點擊日誌串流匯總（Kafka ➔ Flink ➔ 熱度重新打分）。
  3. **高可用分片與快取拓撲**：
     - 前綴分片（Prefix Sharding）與一致性雜湊。
     - 邊緣 CDN 快取熱門前綴（如單字、雙字）、客戶端防抖（Debounce）與本地記憶體快取。
     - 後端唯讀複本（Read Replicas）與離線非同步構建新 Trie 樹替換。
  4. **一手調研清單**：Google / Twitter Autocomplete 搜尋架構白皮書。

---

### 專題 5：全球多活架構（Multi-Region Active-Active）：跨洲資料同步與衝突消解

- **狀態**：📝 `待完善撰文（Pending Research & Writing）`
- **對應來源**：`binhnguyennus/awesome-scalability`, `systemdesign42/system-design-academy`
- **架構核心大綱**：
  1. **多活必然性與物理定律**：跨大西洋 70ms+ 光纖延遲、光速極限對強一致性協定的打擊（CAP 權衡）。
  2. **單元化架構（Cell-based / Pod Architecture）**：
     - 路由分流層：Anycast IP + Geo-DNS + 應用層 Routing Cookie。
     - 業務資料分片單元（Cell）：以 User ID 隔離資料閉環，單元內自包含事務。
  3. **跨單元雙向資料同步與衝突消解**：
     - 雙向異步複製（Bidirectional CDC）與循環複製環路防禦。
     - 衝突消解演算法：LWW（Last-Write-Wins 與向量時鐘 Vector Clock）、CRDT 合併、或業務補償流。
  4. **全域共享資料與極端容災**：
     - 庫存/名額等跨區域共享資源的集中仲裁（Token 預分配與跨區配額調度）。
     - 區域故障自動疏散（Traffic Evacuation）。
  5. **一手調研清單**：AWS Multi-Region Active-Active 架構指引、Alibaba 單元化雙十一架構實踐。

---

### 專題 6：分散式共識深度拆解：Raft 與 Multi-Paxos 演進及常見工程陷阱

- **狀態**：📝 `待完善撰文（Pending Research & Writing）`
- **對應來源**：`madd86/awesome-system-design`, `ashishps1/awesome-system-design-resources`
- **架構核心大綱**：
  1. **共識問題（Consensus）的本質**：非拜占庭容錯、異步網路環境下的日誌複製狀態機。
  2. **Raft 協定三大子問題剖析**：
     - Leader Election（隨機超時、票數過半）。
     - Log Replication（日誌匹配不變量、追加日誌 RPC）。
     - Safety（Leader 完整性條件、不直接提交非當前任期日誌）。
  3. **工程落地效能優化與邊界難題**：
     - Read Index 與 Lease Read：不寫日誌實現線性一致性讀（Linearizable Read）。
     - 聯合共識（Joint Consensus）與成員動態變更。
     - 腦裂防禦與 Pre-Vote 機制防止孤立節點干擾叢集。
  4. **一手調研清單**：Diego Ongaro 博士論文《In Search of an Understandable Consensus Algorithm》、TiKV Raft Engine 最佳化。

---

## 📌 後續執行流程

1. **先規劃確認**：確認上述 6 個大綱題目的方向與切入維度。
2. **依序展開撰寫**：選定具體篇章後，更新 `docs/article-queue.md`，並按照 CarlStack 的一手資料查核、專業 SVG 流程架構圖繪製、專屬 3D 等距封面製作，通過 Quality Gate 後發布。
