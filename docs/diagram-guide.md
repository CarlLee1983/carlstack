# 圖解元件規範

新文章的流程、架構、資料流與狀態圖一律使用原生 SVG，封裝成 `src/components/<主題>Diagram.astro`，不使用 Mermaid（見 [ADR 0004](adr/0004-native-svg-over-mermaid.md)）。目前有 36 個這樣的元件，本文件把它們已經共用的慣例寫成規範。

圖解元件是一次性的：一個元件服務一篇文章，可以自由新增或刪除，不是需要向後相容的公共介面。但它的色彩必須走 `tokens.css` 的 `--dg-*` 層與主題選擇器，那是全站唯一的邊界。

## 結構

```
<figure class="<前綴>-diagram" aria-labelledby="<前綴>-diagram-caption">
  <svg class="<前綴>-diagram__desktop" viewBox="0 0 960 430"
       role="img" aria-labelledby="<前綴>-diagram-title <前綴>-diagram-desc">
    <title id="<前綴>-diagram-title">…</title>
    <desc id="<前綴>-diagram-desc">…</desc>
    <defs><marker id="<前綴>-arrow" …></marker></defs>
    …
  </svg>

  <!-- 窄螢幕版面：另一份 SVG，或一組 HTML 卡片 -->
  <div class="<前綴>-diagram__mobile">…</div>

  <figcaption id="<前綴>-diagram-caption">…</figcaption>
</figure>
<style>…</style>
```

硬性規則，36 個既有元件全數符合：

- **雙版面**：桌面一份 SVG，窄螢幕另一份，用 media query 互斥切換。窄螢幕版不是縮小桌面版，而是重新編排成直向流程——這是 320 px 可讀性的唯一可靠做法。窄螢幕版可以是第二份 SVG（15 個元件）或一組 HTML 卡片（21 個元件）；流程本身有拓樸時用 SVG，只是分段敘述時 HTML 卡片更好維護。
- **`viewBox` 且不寫 `width`／`height`**：由 CSS 的 `width: 100%; height: auto` 決定尺寸。不要加 `preserveAspectRatio`。
- **`role="img"` + `aria-labelledby` 指向 `<title>` 與 `<desc>`**：`<title>` 是圖名，`<desc>` 用完整句子描述圖在說什麼，讓螢幕閱讀器使用者不必看圖。窄螢幕版的 `<desc>` 說明它是桌面版的直向排列即可。
- **id 全部加元件前綴**：同一頁可能出現多張圖，`marker` 的 id 尤其容易碰撞；窄螢幕版的 marker 要另取 id（如 `<前綴>-arrow-mobile`）。
- **BEM 命名**：`.<前綴>-diagram__card`、`__title`、`__detail`、`__arrow`、`__arrow--return`。`<style>` 未加 `is:global`，Astro 會自動 scope。

## 色彩與深色模式

圖解的中性階一律用 `tokens.css` 的 `--dg-*` token，**不得寫死中性色，也不得帶 hex fallback**：

| 用途           | Token                         | 淺色      | 深色                    |
| -------------- | ----------------------------- | --------- | ----------------------- |
| 卡片底（浮起） | `--dg-surface`                | `#ffffff` | `#22252c`               |
| 卡片底（次級） | `--dg-surface-2`              | `#f8fafc` | `#1e2024`               |
| 框線、連接線   | `--dg-rule`                   | `#e2e8f0` | `rgba(255,255,255,.14)` |
| 強框線、箭頭   | `--dg-rule-strong`            | `#cbd5e1` | `rgba(255,255,255,.26)` |
| 標題文字       | `--dg-ink`                    | `#0f172a` | `#f2f0eb`               |
| 內文文字       | `--dg-ink-2`                  | `#475569` | `#cbd5e1`               |
| 次要文字、編號 | `--dg-muted`                  | `#64748b` | `#94a3b8`               |
| 字體           | `--font-body` / `--font-mono` |           |                         |
| 外距、字級     | `--space-*`、`--text-*`       |           |                         |

強調色（各家系統圖的藍／綠／橘／紫等語意色）維持每張圖自己的選色，**但每一條有強調色的規則都必須有對應的深色版本**：

```css
.x-diagram__header--blue {
  fill: #0284c7;
}
:global(:root[data-theme="dark"]) .x-diagram__header--blue {
  fill: #38bdf8;
}
```

深色選擇器**必須**是 `:global(:root[data-theme="dark"])`。站台的主題由 `src/layouts/BaseLayout.astro` 解析後一律寫入 `data-theme`（見 [ADR 0005](adr/0005-diagram-dark-mode-selector.md)），所以元件不需要也不應該自己寫 `@media (prefers-color-scheme: dark)`。**不要用 `.dark` class**——那是 Tailwind 慣例，這個專案沒有任何地方會加上它，寫了等於死碼。

SVG 的 `font-size` 屬於 viewBox 座標系，用純數字 px（12／14／18 是既有元件的常用級距），不要套 `--text-*`；`--text-*` 只用在 `figcaption` 這類一般 HTML。

## 斷點

既有元件用了四種寫法（`768px` 21 個、`640px` 12 個、`48rem` 2 個、`42rem` 1 個）。新元件統一用 `@media (max-width: 48rem)`；切換時兩邊都加 `!important`，因為窄螢幕版的 `display: none` 是預設值。

## 排版與座標幾何避坑守則（Anti-Patterns）

在進行複雜架構、狀態機或多階段流程圖解時，必須嚴格遵守幾何與字級防線，杜絕擠壓重疊：

1. **文字座標衝突（絕對 Y 重疊陷阱）**：
   - `<g transform="translate(X, Y)">` 內的相對文字座標（如 `y="-30"`）計算後**絕對不得落入**外層卡片標題（如 `y="52"`）的範圍。
   - 卡片頂部標題、Badge 與圖形節點頂部之間，**保留至少 24px ~ 32px 垂直留白**。
2. **底邊與框線貼合問題**：
   - 節點、說明文字或 Alert Box 下方**必須與卡片底邊保持至少 20px 內邊距**，嚴禁元素緊貼或穿透卡片外框。
   - 必要時直接加大 viewBox 高度（例如由 `360` 提升至 `380` ~ `440`），給予充份垂直呼吸感。
3. **字級與可讀性下限（桌面端 viewBox 座標系）**：
   - 主標題 / 核心卡片標題：`16px` ~ `18px`（`font-weight: 800`）。
   - 階段 / 節點標籤：`12px` ~ `14px`（`font-weight: 700`）。
   - 內文說明 / 註解：`12px` ~ `13px`（`fill: var(--dg-ink-2)`）。
   - 禁止使用小於 `11px` 的文字；桌面端文字如果小於 `11px`，在縮放至常規筆電螢幕時將嚴重失真模糊。
4. **單一圖解職責與複雜度解耦**：
   - 若一個主題包含「核心狀態機」與「時序日誌複製」，或「定理三角」與「延遲代價模型」，**嚴禁硬塞在單一擁擠的圖解中**。
   - 應分拆為兩個語意明確的專屬元件（如 `<RaftRoleFsmDiagram />` 與 `<RaftLogReplicationDiagram />`），分別對應文章的相應章節，並解放水平與垂直排版寬度。
5. **箭頭與文字通道走線（Route Clearance）**：
   - 箭頭連線與文字標籤需預留明確通道，嚴禁連線橫穿文字方塊。
   - 雙向或多路回調箭頭（如 Leader Election 降級、Buffer 切換）應採用具備弧度的貝茲曲線（`M ... Q ...` 或 `M ... C ...`），避開正向直流通道路徑。

## 驗收

發布前在桌面與 320 px 視窗各看一次，淺色與深色各看一次。四種組合都要文字可讀、不產生整頁水平捲軸、顏色隨主題切換。

自動化的下限檢查（跑 `pnpm preview` 後於瀏覽器執行）：每個 `<text>` 對其所在 `rect` 的對比度，深淺兩色都不應低於 3.0。目前 36 張圖的最差值為淺色 2.83、深色 3.82，皆落在強調色小標籤上。
