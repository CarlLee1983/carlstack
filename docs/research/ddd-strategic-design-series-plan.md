# DDD 戰略設計實戰研究與篇幅大綱規劃

本文件記錄「領域驅動設計（DDD）戰略分析（Strategic Design）」系列文章的深度規劃與核心乾貨內容。

---

## 核心設計理念與問題意識

在後微服務時代與 AI Coding Agent（Cursor、Claude Code、Hermes）時代，軟體系統最致命的瓶頸不再是戰術層面（如何寫好一個 Aggregate、Repository），而是**戰略層面的邊界失控與概念撕裂**：

1. **資源錯配**：工程團隊投入大量頂尖資源自幹通用基礎設施，真正帶動商業價值的核心域卻漏洞百出。
2. **上帝物件（God Object）與語意漂移**：試圖打造全系統通用的巨型資料模型（如 `User`、`Order`），導致欄位與狀態機衝突。
3. **上游依賴腐蝕**：外部系統或老舊遺留系統（Legacy）的混亂模型直接滲透進核心業務邏輯。
4. **AI 時代架構熵增**：Coding Agent 在缺乏邊界隔離的代碼庫中隨機跨模組引用，幾週內製造出「AI 揉捏出的大泥球」。

---

## 系列篇幅規劃（4 篇工具文 + 1 篇案例總結）

### 第 1 篇：別把百萬預算丟進下水道：DDD 子域劃分（Subdomains）的工程決策矩陣與代碼審計

- **主題定位**：問題空間分析、子域價值分類、工程資源配置與 ROI。
- **核心乾貨**：
  - **核心域測試**：「如果明天開源這個模組，公司會不會倒閉？」
  - **三類子域量化決策樹**：
    - Core Domain（核心域）：自研、最高複雜度、代碼純粹無框架侵入。
    - Supporting Subdomain（支撐域）：特異但非核心優勢，夠用就好（Good Enough），拒絕過度設計。
    - Generic Subdomain（通用域）：SaaS 優先，開源次之，堅決不自幹。
  - **代碼庫子域審計**：透過 Git Churn（變更頻率）與圈複雜度交叉分析，識別資源錯配模組。
  - **子域生命週期矩陣**：核心域如何演進、退化為通用域（如搜尋引擎、推薦系統的商品化）。

### 第 2 篇：拆解 God Object 的手術刀：限界上下文（Bounded Context）的切分訊號與多模型實踐

- **主題定位**：解構全局資料模型幻覺、多維看實體、精確定義業務邊界。
- **核心乾貨**：
  - **萬能實體的代價**：剖析幾十個欄位的 `User` / `Order` 表引發的 Nullable 爆炸、驗證衝突與狀態機混亂。
  - **邊界切割的 4 大工程訊號**：
    1. 語義衝突（Semantic Collision）：同名異義詞的業務分歧。
    2. 變更步調（Change Cadence）：發布週期與頻率脫鉤。
    3. 並行團隊依賴（Conway's Law）：跨團隊代碼修改熱點。
    4. 交易不變量範圍（Transaction Invariant Boundary）：強一致性邊界。
  - **重構實例（TypeScript）**：將 `User` 上帝實體解構為：
    - `IdentityContext.Account`
    - `BillingContext.Customer`
    - `FulfillmentContext.Recipient`
  - **關聯解耦**：使用純 ID（`AccountId`）取代資料庫外鍵（FK）強綁定。

### 第 3 篇：拒絕被上游餵毒：上下文映射（Context Mapping）與防腐層（ACL）的工程模式

- **主題定位**：系統與團隊拓撲關係、邊界防禦機制、ACL 完整落地代碼。
- **核心乾貨**：
  - **上下文映射關係生存法則**：
    - Shared Kernel 的高風險與嚴格限制條件。
    - Customer-Supplier 與 Conformist 的權衡。
    - Open Host Service (OHS) 與 Published Language (PL)。
  - **防腐層（ACL）三層結構**：
    1. HTTP/RPC Facade：連線、重試、底層異常處理。
    2. Adapter & Parser：協議解析、抹平外部畸形資料格式。
    3. Domain Translator：驗證並轉譯為嚴格本地 Value Object 與 Domain Event，形成進口海關防線。
  - **生產級 ACL 代碼實例**：以第三方金流為例，展示嚴格 Schema 驗證（Zod/型別 Guard）與錯誤阻斷。

### 第 4 篇：後微服務時代的架構收斂：模組化單體（Modular Monolith）與 AI Agent 的語義隔離護欄

- **主題定位**：從微服務迷思回歸單體、Deep Modules 實體邊界、AI Coding Agent 的架構護欄。
- **核心乾貨**：
  - **概念糾偏**：Bounded Context $\neq$ Microservice。微服務拆過頭的分散式單體（Distributed Monolith）災難。
  - **模組化單體實踐**：利用 TypeScript project references、Go internal 或 package 邊界實現進程內 100% 硬隔離。
  - **AI Agent 自動化熵增防禦**：
    - 架構即 Prompt：撰寫模組級 `BOUNDARY.md` / `CONTEXT.md` 作為 Agent 圍欄。
    - 自動化邊界執法：利用 Dependency-Cruiser / ESLint 設定 CI 阻斷規則，禁止 Agent 越界私自導入其他模組內部代碼。

### 第 5 篇：DDD 戰略設計的價值，要看它改變了哪個決策

- **主題定位**：用公司公開的實務案例，回頭檢驗前四篇的子域、上下文、映射與模組邊界工具。
- **案例範圍**：
  - Labatt：學校開學季庫存流程，核心域聚焦、軟體與營運流程共同演進及公司回報的營運結果。
  - Statoil：Digital Cargo File 上下文地圖、專案層級的核心／支撐／通用子域，以及建議中的 OHS 和 ACL 邊界。
  - QuintoAndar：盤點既有上下文，依拆解成本、相依與預期業務效益安排單體拆解順序。
  - Xapo Bank：將業務子域、限界上下文、團隊責任、路線圖和架構決策治理逐步對齊。
  - Shopify：在單一程式碼庫中按商務責任元件化，逐步追蹤和治理跨模組依賴。
- **核心觀點**：戰略設計的驗收依據是它是否讓團隊做出可追蹤的投資、範圍、邊界、演進順序或責任決定，而不是畫了多少張圖或建立多少個服務。
- **證據規則**：保留來源的時態和範圍；區分已發生的結果、作者自述的成效與尚在計畫中的目標，不把個案經驗寫成可普遍推論的因果證明。
- **交付產出**：五個具名公司案例、各自的工程決策與限制，以及一份可套用到現有系統的決策檢核步驟。
