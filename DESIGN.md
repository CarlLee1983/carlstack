# CarlStack 設計系統規範 (Design System & Guidelines)

本文檔記錄 CarlStack 的整體視覺哲學、Design Tokens、排版標準與核心組件規範，為專案後續開發、樣式擴充與 AI Agent 協作提供**單一視覺真理來源（Single Source of Truth）**。

---

## 1. 設計哲學與風格基調 (Design Philosophy)

**核心風格：溫潤北歐手記風 (Warm Nordic Craft)**

- **溫暖紙質質地 (Organic Paper Feel)**：告別冰冷刺眼的純黑（`#000`）與純白（`#FFF`），採用帶有微暖色溫的燕麥暖白紙質與曜炭灰。
- **極致長文可讀性 (Human-centric Readability)**：以人類長時間舒適閱讀為第一優先，具備 18px 黃金字級、1.95 寬鬆行高、舒展的段落節奏與即時字級縮放系統。
- **無雜訊工程美學 (Zero-noise Craftsmanship)**：全站**嚴格禁用 Emoji**，所有圖標皆為幾何向量線條 SVG；搭配大圓角、毛玻璃膠囊與柔和漫射陰影。

---

## 2. Design Tokens 色彩與雙模式系統

所有色彩定義集中於 [`tokens.css`](tokens.css)，透過 CSS Custom Properties 驅動。

### 2.1 淺色模式 (Light Mode / Oatmeal Paper)

- **畫布底色 (`--color-paper`)**：`#FAF8F5`（燕麥暖白紙）
- **卡片底色 (`--color-card`)**：`#FFFFFF`
- **次級背景 (`--color-paper-2`)**：`#F1ECE4`
- **主文字色 (`--color-ink`)**：`#212328`
- **內文文字 (`--color-ink-2`)**：`#3A3E47`
- **次要文字 (`--color-muted`)**：`#6C727F`
- **陶土暖橘 (`--color-accent`)**：`#B94A2B`（Hover: `#A53E23`）；小字連結與按鈕文字對比至少 4.5:1。
- **鼠尾草綠 (`--color-secondary`)**：`#4A7C59`（Soft: `rgba(74, 124, 89, 0.12)`）

### 2.2 深色模式 (Dark Mode / Obsidian Charcoal)

- **畫布底色 (`--color-paper`)**：`#161719`（溫潤曜炭黑，非生硬純黑）
- **卡片底色 (`--color-card`)**：`#22252C`（深石墨灰）
- **卡片懸浮 (`--color-card-hover`)**：`#282C34`
- **次級背景 (`--color-paper-2`)**：`#1E2024`
- **主文字色 (`--color-ink`)**：`#F2F0EB`
- **內文文字 (`--color-ink-2`)**：`#DEDAD0`
- **次要文字 (`--color-muted`)**：`#A3A199`
- **柔和陶土橘 (`--color-accent`)**：`#E78466`（Hover: `#F0957B`）
- **淺鼠尾草綠 (`--color-secondary`)**：`#68A678`

### 2.3 陰影與圓角 (Shadows & Radii)

```css
/* 圓角系統 */
--radius-sm: 8px;
--radius-md: 14px;
--radius-lg: 20px;
--radius-pill: 9999px;

/* 柔和漫射陰影 (羽化分層) */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
--shadow-md: 0 8px 24px -4px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 20px 40px -8px rgba(0, 0, 0, 0.12);
```

---

## 3. 圖標與視覺約束 (Iconography & Hard Rules)

1. **🚫 嚴格禁用 Emoji**
   - 任何標題、按鈕、清單、卡片、標籤或文章元數據中，**一律不得使用 Emoji**。
2. **✨ 全面使用幾何線條 SVG**
   - 視圖標準：`viewBox="0 0 24 24"`
   - 線條規格：`fill="none" stroke="currentColor" stroke-width="2"` (重點按鈕可使用 `2.5`)
   - 端點樣式：`stroke-linecap="round" stroke-linejoin="round"`
   - 範例包括：搜尋鏡頭、太陽/月亮主題切換、閱讀時間時鐘、發布日曆、箭頭、GitHub、RSS。

---

## 4. 排版與閱讀舒適度系統 (Typography & Readability)

### 4.1 字體族系 (Font Stacks)

- **標題與介面 (`--font-display`)**：`"Plus Jakarta Sans", "Noto Sans TC", "PingFang TC", -apple-system, sans-serif`
- **文章內文 (`--font-body`)**：`"Plus Jakarta Sans", "Noto Sans TC", "PingFang TC", -apple-system, sans-serif`
- **等寬代碼 (`--font-mono`)**：`"JetBrains Mono", "Fira Code", monospace`

### 4.2 黃金閱讀比例 (`.prose`)

- **內文基準字級**：`1.125rem`（18px）
- **行高 (Line Height)**：`1.95`（給予中文字型充足的垂直呼吸空間）
- **字距 (Letter Spacing)**：`0.015em`
- **段落邊距 (Paragraph Margin)**：`1.65rem`
- **最大閱讀欄寬**：`44rem`（約 704px，單行 35 ~ 42 字舒適掃讀範圍）
- **標題字重與字距**：全站標題（含首頁 hero、文章 h1、內文 h2–h4）統一 `700`，字距 `-0.012em` ~ `-0.02em`。中文字形本身已填滿字框，`800` 搭配強負字距會讓標題黏成一團；負字距只留一點點收攏拉丁字。內文 `body` 字距為 `0`，`.prose` 才加 `0.015em`。
- **內文連結**：底線用 `color-mix(accent 40%)`、粗細 `1.5px`、偏移 `0.2em`，在段落裡看得見但不搶主色。

### 4.3 即時動態字級縮放系統 (Dynamic Font Scale)

透過 `document.documentElement.dataset.fontScale` 控制 `--font-scale` 變數：

- **小 (`sm`)**：`--font-scale: 0.9`（內文 16.2px）
- **標準 (`md`)**：`--font-scale: 1.0`（內文 18px，預設）
- **大 (`lg`)**：`--font-scale: 1.15`（內文 20.7px）
- **特大 (`xl`)**：`--font-scale: 1.3`（內文 23.4px）
- **持久化機制**：自動儲存於 `localStorage.getItem("carlstack-font-scale")`，頁面初次載入由 `BaseLayout.astro` 的 inline script 立即套用，避免任何閃爍。

---

## 5. 核心組件規範 (Component Specifications)

### 5.1 導覽列與頁尾 (Header & Footer)

- **導覽列 (`Header.astro`)**：
  - 固定頂部，採用 `backdrop-filter: blur(16px)` 與微半透明底色。
  - 品牌標誌採用溫潤徽章設計；導覽連結以膠囊切換狀態。
  - 整合 CMDK 彈出搜尋對話框（快速鍵 `⌘ K`）。
  - 日月雙模式平滑切換按鈕（SVG 向量圖標）。
- **頁尾 (`Footer.astro`)**：
  - 整合 SVG RSS 與 GitHub 連結，版權聲明精簡典雅。

### 5.1b 閱讀輔助與編輯記號 (Reading Aids & Editorial Marks)

- **紙質顆粒**：`body::before` 蓋一層 fixed 的 SVG feTurbulence 噪點，淺色 `multiply` 4.5%、深色 `soft-light` 6%，讓大面積底色不像數位平面；`pointer-events: none`，不影響互動。
- **閱讀進度**：文章頁 `.reading-progress` 是貼在頂端 2px 的主色細線，以 `--reading-progress` 變數驅動 `scaleX`；範圍只算正文（捲到內文開頭為 0、內文底部為 1）。
- **目錄目前章節**：`TableOfContents` 用 scroll 事件（rAF 節流）標記最後一個捲過 header 的標題為 `aria-current="true"`，左側補 2px 主色記號；不用 IntersectionObserver，跳躍式捲動才對得上。
- **響應式目錄**：使用原生 `details`／`summary`，顯示「本篇目錄」與章節數；小於 72rem 預設收合，桌面預設展開，切換斷點時同步。JavaScript 停用時保留展開內容。
- **導言與文末記號**：`.prose` 第一段放大到 1.08em、用主文字色；正文結尾以 `.prose::after` 畫一小段主色短線（60% 實線 + 斷點），告訴讀者正文到此為止。
- **程式碼語言標籤**：`pre[data-language]::before` 在右上角顯示 Shiki 給的語言名（等寬、大寫、低對比）；`plaintext` / `text` 不顯示。
- **引言記號**：`blockquote::before` 在左上以 display 字體放一個 35% 透明度的主色引號，與 callout 區隔。
- **首頁區塊序號**：`.home .section-head h2::before` 用 CSS counter 印 `01`、`02`… 等寬主色序號，把首頁讀成一份年鑑索引。

### 5.2 文章與專案卡片 (Cards)

- **文章卡片 (`ArticleCard.astro`)**，兩種 `variant`：
  - `card`（預設）：獨立盒子，給格狀精選；微上浮（`translateY(-3px)`）與陰影加深懸浮微動態，整合標籤膠囊、SVG 時鐘閱讀時間與右側箭頭圓形按鈕。
  - `row`：編輯式列表，給時序清單（首頁最新文章、文章索引、標籤頁、系列頁）。去掉盒子與陰影，只用髮絲線分段；窄視窗以 `4rem` 正方縮圖搭配 metadata，標題與摘要在下方跨滿列寬；箭頭在寬視窗 hover 或鍵盤聚焦才浮現。容器 `.article-list` / `.blog-list` 的 gap 為 0，最後一列補底線收尾。
- **首頁側欄「站點速覽」**：文章數、標籤數、專案數與最近更新日期全部從 content collections 算出，不維護會過期的描述文案。
- **首頁手機版**：縮小前導區與速覽卡內距，數字維持三欄可辨識；文章內容直接顯示，不以捲動淡入控制可見性。
- **文章索引與搜尋**：索引提供原生 GET 搜尋入口及頁次；搜尋頁顯示讀者使用說明、由內容集合計算的熱門主題，以及完整結果數與顯示上限。
- **主題排序**：首頁「主要技術主題」與標籤頁一律依文章數倒序（`sortByPostCount`），同數量依名稱；標籤頁再依數量分三階（`data-tier`：`major` ≥ 10、`minor` ≥ 3、`single`），讓站點重心一眼可見。
- **專案卡片 (`ProjectCard.astro`)**：
  - 固定 4:5 比例、實體厚邊與雙層細框組成收藏卡語彙；預設以主視覺與專案名稱為主，hover 或鍵盤聚焦才揭露摘要與標籤。
  - 點擊卡片以原生 `dialog` 顯示 Markdown 正文、專案連結與完整 metadata；支援 Esc、背景點擊、焦點還原與 reduced-motion。有封面時必須提供具體 `coverAlt`。

### 5.3 關於我與頭像設計 (Profile Hero & Avatar Slot)

- **作者資訊卡 (`about/index.astro`)**：
  - 左側為專屬 **Avatar 容器**（104px 大圓角、雙色漸層外框、在線綠點狀態燈）。
  - 預設狀態為細緻的 Monogram（`CL`）佔位符。
  - **替換自訂頭像方式**：將個人照片放置於 `public/avatar.jpg` 或 `src/assets/`，並以 `<img class="profile-avatar__img" src="/avatar.jpg" alt={siteConfig.author} />` 替換預留插槽。

### 5.4 文章工具列與字級控制 (`FontSizeControl.astro`)

- 位於文章 Header 工具列右側，提供 `[ 小 | 標準 | 大 | 特大 ]` 四段原生 radio 與 label；Tab 進出群組、方向鍵切換，選取及焦點由原生狀態驅動，點擊區至少 44 × 44px。
- 導覽列圖示與分頁頁碼同樣保留至少 44 × 44px 操作範圍。原生表單的 `color-scheme` 跟隨解析後的 `data-theme`；`prefers-reduced-motion` 停用非必要過場。

### 5.5 表格、引用塊與代碼塊

- **表格 (`table`)**：卡片式獨立包覆、圓角外框、深淺自適應表頭、寬鬆內距（`1rem 1.25rem`）。
- **引用區塊 (`blockquote`)**：陶土暖橘左飾條、次級底色襯托、1.85 舒適行高。
- **程式碼 (`pre`)**：曜炭黑專屬代碼背景、大圓角、水平平滑滾動。

---

## 6. 維護與開發檢查清單 (Pre-flight Design Checklist)

在任何修改或新增頁面時，請確認符合以下檢查項：

1. [ ] 沒有引入任何 Emoji（圖標一律使用乾淨的 SVG）。
2. [ ] 淺色與深色模式皆經過檢視，對比度充足且不刺眼。
3. [ ] 互動元素（按鈕、卡片、連結）具備平滑微動態與 `:focus-visible` 焦點外框。
4. [ ] 長篇文字區塊皆置於 `.prose` 容器中，字級能隨 `--font-scale` 和諧縮放。
5. [ ] 執行 `pnpm check`（包含 Prettier、Astro Check、Build 與 Pagefind）確保 0 errors。
