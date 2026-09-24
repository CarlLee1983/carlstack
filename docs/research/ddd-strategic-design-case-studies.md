# DDD 戰略設計案例：第一手來源研究筆記

> 研究日期：2026-09-24（Asia/Taipei）
>
> 研究目的：為 CarlStack「DDD 戰略設計實戰」系列蒐集可引用的公司案例，聚焦子域、限界上下文、上下文關係與模組化單體。
> 來源原則：優先採公司工程部落格或由當事實作者參與撰寫的經驗報告；來源陳述只支持下列明確主張，不延伸推定未公開的模型或成效。

## 候選案例

### Labatt Food Services：核心域聚焦與營運流程共創

- **來源**：[Just-in-time Co-development of Business Process and Software](https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Tony_Canty_Labatt_Food_2012.pdf)，Tony Canty（Labatt CIO），2012。
- **可驗證主張**：學校開學前的集中採購造成易腐食品庫存預測與缺貨風險。案例把開學訂單系統描述為聚焦核心域；軟體與業務流程平行迭代，兩個開發團隊在五個月內完成系統。作者回報第一年節省超過 100 萬美元營運成本；前三年庫存投資減少超過 800 萬美元、缺貨品項減少 50%，同期銷售增加 15%。
- **系列用途**：把核心域從抽象分類落在一個有季節性風險的業務流程，連起領域模型、營運協作與結果指標。
- **限制／未證明**：數字是由公司 CIO 撰寫的回顧，沒有獨立驗證或對照組；可寫為公司回報的成效，不可宣稱 DDD 單獨造成改善。
- **確定性**：高（具名公司主管的一手案例）；量化成效為自述。

### Statoil：Digital Cargo File 的上下文地圖、子域與 ACL

- **來源**：[Architectural Improvement by use of Strategic Level Domain-Driven Design](https://www.dddcommunity.org/wp-content/uploads/files/practitioner_reports/landre_einar_2006_part1.pdf)，Einar Landre、Harald Wesenberg、Harald Rønneberg，Statoil ASA；OOPSLA 2006 practitioner report。
- **可驗證主張**：Digital Cargo File（DCF）用於把處理實際貨運及交易的郵件、傳真、電傳和紙本資料夾數位化。作者的 context map 區分既有 Supply Operation、Invoice、Trading 與 Communication Gateway，也拆出 DCF 的 Front Page、Folder、Document Storage 模型。圖譜分析指出 Communication Gateway 連結過多、Front Page 混入 case management；建議把 Front Page / Case Management 從 Folder 分離，以 Filing Service（OHS）串接，並在 Front Page 與舊有 Trading、Supply Operation 模型間使用 ACL。DCF 專案內的分類是 Front Page / Case Management 為核心域、Folder & Document Control 為支撐域、商用 Communication Gateway 及 Document Storage 為通用域。論文另指出企業級系統可能有多個核心。
- **系列用途**：目前研究到最完整、可直接談 Context Map、OHS、ACL 及專案內子域分類的案例；也展示地圖如何暴露過度連結及責任混雜。
- **限制／未證明**：論文是 2006 年從業者經驗報告。作者明確表示依建議重構預計於 2006 年秋季進行，因此 DCF 目標切分與 ACL 不能寫成已確認全面部署。子域分類只適用於 DCF 專案，不能外推到全公司。
- **確定性**：高（具名 Statoil 員工、實際專案與詳細圖譜）；目標架構完成度有限。

### QuintoAndar：用 ROI 排單體拆解優先順序

- **來源**：[How we planned for monolith decomposition at QuintoAndar](https://medium.com/quintoandar-tech-blog/how-we-planned-for-monolith-decomposition-at-quintoandar-363f160b4427)，José Lima Neto，Blog Técnico QuintoAndar，2021-06-15。
- **可驗證主張**：公司已有部分服務拆分經驗，但使用者、房屋、租賃管理等核心單體業務仍複雜。作者描述用 DDD 技術盤點子域和 bounded contexts，調查現況流程、目標設計與依賴，整理拆解大圖，並以 ROI 曲線比較抽取成本和預期效益。成本包含程式耦合、抽取複雜度、業務複雜度、領域依賴；效益包含業務彈性、單體資料庫負載及業務故障隔離。
- **系列用途**：將 bounded context 候選與實際演進排序連接起來，示範不應把每個上下文一律獨立部署。
- **限制／未證明**：文章記錄計畫方法與當時進度；依 ROI 排序的後續拆分仍以預期或正在進行描述。不可把 ROI 模型或預期效益寫成實現後的成效。
- **確定性**：高（公司技術部落格經驗報告）；最終執行成效未在文中提供。

### Shopify：依商務子域切分的模組化單體

- **來源**：[Deconstructing the Monolith: Designing Software that Maximizes Developer Productivity](https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity)，Shopify Engineering，2019-02-21。
- **來源**：[Under Deconstruction: The State of Shopify’s Monolith](https://shopify.engineering/shopify-monolith)，Shopify Engineering，2020-09-16。
- **可驗證主張**：2019 文章將目標定義為同一程式碼庫內界線受尊重的 modular monolith，說明團隊按 orders、shipping、inventory、billing 等業務概念整理程式碼、設計 public API，並以 Wedge 追蹤跨元件呼叫及資料耦合；也指出 shipping 與 checkout 原先可任意互相呼叫。2020 更新才明確說主單體的元件切分受 DDD 啟發、元件是 commerce domain 子域的實作，並指出其主單體當時已有 37 個元件、Packwerk 約用於三分之一元件、完整強邊界仍未完成。
- **系列用途**：子域如何映射到程式碼與維護責任；元件公開入口、依賴限制；用逐步採用而非一次拆服務治理舊系統。
- **限制／未證明**：文章未公開完整子域清單或核心／支援／通用域分類；「元件」不應直接等同於完整 bounded context。來源明言大量元件邊界尚不完整，不能當作 Shopify 已完成模組隔離的證據。文章談的是元件化與依賴，不是 ACL 或完整 context map。
- **確定性**：高（公司工程團隊直接描述自身系統）；個別成效的因果仍主要是作者經驗敘述，缺少對照研究。

### Xapo Bank：從業務子域到限界上下文與團隊拓撲

- **來源**：[Decentralizing the Practice of Architecture at Xapo Bank](https://martinfowler.com/articles/xapo-architecture-experience.html)，Martin Fowler 網站，2023-07-18；由 Xapo 前 CTO Anouska Streets、CTO Kamil Dziublinski 與 Thoughtworks 技術主管 Andrew Harmel-Law 合著。
- **可驗證主張**：作者描述 Xapo 因金融業務轉型而重新檢視軟體資產，先按 Payments、Cards、Banking Operations、Compliance 等廣泛業務子域粗略盤點，再與產品及營運合作，把交付組織轉成 business-aligned Stream Aligned Teams。後續逐步細化 bounded contexts，並讓它們更貼近團隊、路線圖與架構演進；Architecture Advisory Forum 用 ADR 與跨職能諮詢支持分散式決策。
- **系列用途**：子域分類不是只看程式碼；bounded context 與團隊責任、決策流程和路線圖的聯動；DDD 導入可循序推進。
- **限制／未證明**：這是共同撰寫的實踐經驗報告，不是 Xapo 官方工程部落格或獨立成效研究。它沒有列出最終 bounded context 清單、上下游關係圖、具體 ACL，也沒有用數據隔離 DDD/團隊重組各自對交付速度的影響。
- **確定性**：中高（當事管理者及參與顧問具名敘述）；量化因果主張需另找資料。

### Vinted：先探索領域邊界，再轉向事件與 Saga

- **來源**：[Building a Global, Event-Driven Platform: Our Ongoing Journey, Part 1](https://vinted.engineering/2026/01/09/building-global-event-driven-platform-part-1/)，Vinted Engineering，Dejan Menges，2026-01-09。
- **來源**：[Building a Global, Event-Driven Platform: Our Ongoing Journey, Part 2](https://vinted.engineering/2026/01/09/building-global-event-driven-platform-part-2/)，Vinted Engineering，Dejan Menges，2026-01-09。
- **可驗證主張**：第一篇表示 Vinted 工程師以 DDD 梳理單體責任與自然邊界，幫助明確團隊所有權並發現糾纏責任；作者稱花至少兩年理解領域、辨識近 300 個 domains。由同步整合轉向 business events，並介紹 Saga 式多步工作流及補償、重試、最終完成。第二篇延伸描述全球部署：集中寫入、全球唯讀投影等決策。
- **系列用途**：從領域探索到通訊模式的演進；邊界識別與組織所有權；DDD 分界後的分散式一致性代價。可用於說明「辨識 domain」不等於立刻拆成微服務。
- **限制／未證明**：文章是 2026 年的回顧性系列，約 300 個 domain 並不代表 300 個 bounded context 或服務。來源未逐一列出子域、分類或 context map，也未描述明確 ACL。第一篇寫明 Saga 是「正在引入」，因此不能概括成全平台已完成。第二篇是全球部署方案的敘述，不能單獨證明各 context 的模型隔離品質。
- **確定性**：高（公司工程部落格具名作者直接描述）；系統範圍與 rollout 完成度需按文章時態表述。

### Spotify Data Platform：資料領域、事件契約與分散式責任

- **來源**：[Data Platform Explained Part II](https://engineering.atspotify.com/2024/5/data-platform-explained-part-ii)，Spotify Engineering，2024-05-28；作者 Anastasia Khlebnikova（Senior Engineer）與 Carol Cunha（Product Manager）。
- **可驗證主張**：文章將平台拆述為負責平台構件的 domains；資料收集領域讓使用團隊定義 event schema，平台自動佈署對應 Pub/Sub、匿名化管線及串流工作。作者表示資料集消費者可管理大多數更新而不必依賴基礎設施團隊介入；並描述 Data Collection 團隊按事件交付基礎設施、客戶端 SDK、使用者旅程資料集等職責組織。文中報告當時有 1,800 多種事件類型、平台團隊超過 100 名工程師。
- **系列用途**：平台／領域邊界的責任分配、schema 作為跨團隊契約、中央平台能力與領域使用者自治的取捨。
- **限制／未證明**：文章使用 domains 一詞描述資料平台責任，並未自稱完整 DDD 案例，也沒有說明核心／支援／通用子域、bounded context、ACL 或反腐層。事件 schema 自助流程不能單獨證明消費者與生產者間的語義映射已被妥善治理。
- **確定性**：高（Spotify 工程部落格直接描述平台）；作為 DDD 戰略案例的關聯度中等，宜標記為「領域責任／契約的相鄰案例」。

## 來源比較與使用建議

### 本次案例專文採用

- **Labatt**：最直接呈現核心域投資與營運結果；保留公司自述、無獨立對照組的限制。
- **Statoil DCF**：最完整呈現 Context Map、子域分類、OHS 與 ACL；把已存在的現況圖與尚待實施的目標圖分開描述。
- **QuintoAndar**：最直接呈現按抽取成本和業務收益排列演進順序；只稱 ROI 規劃，不稱已驗證成效。
- **Xapo Bank**：呈現業務子域、bounded context、團隊和架構治理的逐步對齊；不可單獨歸因決策速度改善。
- **Shopify**：呈現 DDD 啟發的模組化單體和漸進式依賴治理；「元件」不等同已完成的 bounded context。

### 其他候選

- **Vinted**：可談領域探索到事件整合及 Saga 演進；勿把約 300 個 domains 等同 bounded contexts，且 Saga 在文章發布時仍在導入。
- **Spotify Data Platform**：可作領域契約與平台責任的對照；文章未自稱完整 DDD 實踐，應標示為相鄰案例。

Statoil 報告直接說明 DCF 的 OHS 與 ACL 目標設計，也列出 Customer-Supplier、Shared Kernel 等關係；其餘候選不應據此推定採用了這些模式。

## 查核紀錄

- 以搜尋引擎搜尋公司工程網站及 DDD、bounded context、modular monolith 關鍵詞；開啟上述 Labatt、Statoil、QuintoAndar、Shopify、Xapo、Vinted、Spotify 原始頁核對標題、日期及段落內容。
- Labatt：核對案例全文中的核心域描述、交付期與自述營運數字；保留沒有獨立驗證的限制。
- Statoil：核對 OOPSLA 2006 原始論文中的現況圖、目標圖、子域分類、ACL／OHS 邊界及預計重構時態。
- QuintoAndar：核對公司技術部落格中的階段規劃、ROI 成本效益維度與文章結尾的後續計畫。
- Shopify：核對 2019 原始文章及 2020 後續狀態文，避免只依早期藍圖描述現況。
- Xapo：核對作者身分、日期，以及業務子域、bounded context、團隊對齊段落。
- Vinted：核對系列兩篇，特別區分「近 300 個 domains」與 bounded contexts，並保留 Saga 正在導入的時態。
- Spotify：核對作者、日期、領域責任、事件 schema 自助流程及平台規模；採相鄰案例標示。
- 尚未檢查各系統的公開原始碼、完整簡報附件或訪談補充；文章未公開的內部模型和成效數據仍屬未知。
