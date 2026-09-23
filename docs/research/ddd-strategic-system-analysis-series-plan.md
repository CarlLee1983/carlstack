# DDD 戰略設計實戰：系統分析篇（Strategic System Analysis）研究規劃與篇幅大綱

本文件記錄專題系列《DDD 戰略設計實戰：系統分析篇（Strategic System Analysis）》的深度架構與內容規劃。

---

## 一、核心問題意識：為什麼需要「系統分析篇」？

在過去二十年的軟體工程討論中，領域驅動設計（DDD）經常被嚴重窄化為「代碼實作技術（Tactical DDD）」——大量工程師與團隊沈浸在 Entity、Value Object、Aggregate Root、Domain Event、Repository 的物件導向模式與設計模式中，卻經常面臨以下致命困境：

1. **戰略盲區（Strategic Blindness）**：團隊耗費數月精心封裝了一套極致 Clean 的 Aggregate，上線後才發現該業務模組市面上早已有現成極其成熟且便宜的 SaaS 方案，真正具備商業護城河的業務反而被草率外包。
2. **缺乏結構化需求提煉工法**：業務專家（Domain Experts）講商業故事，工程師（Engineers）思考資料表與 API Schema，中間缺乏共識工具，導致規格在轉譯過程中大量失真，最終只能靠上線後的 Bug 互相指責。
3. **同名異義（Polysemy）引發的全局泥球**：分析階段未能抓出業務概念在不同部門、不同流程中的語義分歧，盲目抽象出龐大的一致性模型，導致上帝實體（God Object）在分析源頭就已注定誕生。
4. **系統分析交付物脫節**：傳統系統分析產出的厚重 UML 或 PRD，工程團隊根本不讀，更無法作為架構劃分與合約定義的正式防線。

**本系列的核心使命**：
跳脫「如何寫代碼」，專注於**「系統分析（System Analysis）」**的四套現代高槓桿架構分析工具，建立從**商業態勢研判 $\to$ 跨職能事件探索 $\to$ 業務敘事語義提煉 $\to$ 限界上下文合約交付**的完整工程閉環。

---

## 二、系列篇幅大綱（四大支柱）

### 第 1 篇：別急著開 IDE：如何用 Wardley Mapping 在系統分析端精準錨定 DDD 核心域

- **分析工具**：Wardley Mapping（瓦德利地圖）
- **核心定位**：價值鏈分析（Value Chain）、組件演進軸（Evolution Axis）、商業護城河與技術選型戰略。
- **痛點破解**：
  - 為什麼 80% 的架構師自以為在做「核心域」，實際卻在自幹「商品域（Commodity）」？
  - 如何從使用者需求（User Need）往下展開價值鏈，繪製可見度（Visibility）與演化度（Evolution: Genesis $\to$ Custom-Built $\to$ Product $\to$ Commodity）雙軸圖。
  - 系統分析如何透過演化態勢決定「真正不可替代的核心域」與「堅決不自建的商品域」。
  - 結合開源與雲端時代的氣候規律（Climatic Patterns）：組件一旦商品化，價值立刻向上遷移。
- **交付產出**：Wardley Map 價值鏈演化圖解、子域投資效益清單與自研/採購邊界決策矩陣。

### 第 2 篇：讓業務與工程在白板前停止吵架：Big Picture EventStorming 的跨職能探索與邊界識別

- **分析工具**：Big Picture EventStorming（全景事件風暴）
- **核心定位**：跨職能協同探索、領域事件時間軸、熱點衝突捕捉、候選限界上下文浮現。
- **痛點破解**：
  - 為什麼傳統訪談式需求分析總是漏掉關鍵約束？
  - 工作坊三階段推進法：混沌發散（Domain Events 橘色便籤）$\to$ 時間軸梳理與觸發源（Commands 藍色、Read Models 綠色、Policies 紫色）$\to$ 衝突收斂（Hotspots 紅色便籤）。
  - 如何從時間軸停頓、參與者權責轉移、悲觀/樂觀語義分歧中，自然識別出「候選限界上下文（Candidate Bounded Contexts）」的天然接縫。
  - 系統分析師如何主導 EventStorming：控場原則、反模式（如 CRUD 導向思維）與熱點消解策略。
- **交付產出**：全景事件時間軸全貌圖、衝突熱點處置表、候選限界上下文清單。

### 第 3 篇：抓出藏在句子裡的語義衝突：Domain Storytelling 如何用業務敘事提煉通用語言

- **分析工具**：Domain Storytelling（領域敘事）
- **核心定位**：圖解工作流、角色與工作物件交互、捕捉同名異義詞（Polysemy）、通用語言（Ubiquitous Language）銳化。
- **痛點破解**：
  - 為什麼說「寫程式容易，懂業務很難」？因為不同部門在說同一個詞時，背後代表完全不同的現實。
  - Domain Storytelling 的極簡語法：Actor（誰）、Work Object（用什麼）、Activity（做了什麼），帶序號的箭頭畫出具體業務場景。
  - 透過多個典型場景敘事（Happy Path vs. Edge Cases），精準抓出「同名異義（Polysemy）」與「異名同義」的語言陷阱（例如電商中「訂單（Order）」在業務、倉儲、會計口中的完全割裂）。
  - 將講故事的過程轉化為明確的領域詞彙表（Domain Glossary）與限界上下文語義邊界。
- **交付產出**：語義故事圖、同名異義解構表、通用語言字典定義。

### 第 4 篇：從業務分析到架構契約：Bounded Context Canvas 的規格交付與通訊拓撲

- **分析工具**：Bounded Context Canvas（Nick Tune 戰略上下文畫布）
- **核心定位**：系統分析的最終交付規格、限界上下文戰略畫布、入站出站通訊契約。
- **痛點破解**：
  - 系統分析做完了，要交給架構師與工程團隊什麼產出？絕對不是 100 頁的 Word 規格書。
  - 深入拆解 Bounded Context Canvas 各大核心區塊：
    1. 定義與商業價值（Strategic Classification & Purpose）
    2. 領域角色類型（Domain Roles: Execution, Ledger, Gateway, Analysis）
    3. 核心業務規則與不變量（Business Rules & Invariants）
    4. 通用語言與邊界字典（Ubiquitous Language）
    5. 入站/出站通訊契約（Inbound/Outbound: Commands, Queries, Domain Events）
  - 畫布如何直接映射到系統架構：同步 API（REST/gRPC）vs. 非同步事件（Event-Driven）的技術接縫。
- **交付產出**：標準化 Bounded Context Canvas 模板與實戰案例、跨上下文通訊協定清單。

---

## 三、視覺圖解規範與組件標準（嚴格遵守 CarlStack 設計規範）

1. **嚴禁 Markdown Table**：所有案例、對比、矩陣一律採用結構化清單、標題層級與粗體鍵值呈現。
2. **嚴禁 Mermaid 語法**：所有架構與工作流一律採用專屬原生雙版面 SVG Astro 組件（`src/components/`）。
3. **Anti-Quadrant 原則**：矩陣與演進維度採用「上方維度橫幅 + 獨立多欄卡片（Three/Four-Column Layout） + 下方警告/反模式列」，避免四象限擁擠。
4. **響應式雙版面與深色模式**：桌面與 320px 窄螢幕最佳化，使用 `tokens.css` 語義變數。
