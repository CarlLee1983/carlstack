# 圖解元件規範

新文章的流程、架構、資料流與狀態圖一律使用原生 SVG，封裝成 `src/components/<主題>Diagram.astro`，不使用 Mermaid（見 [ADR 0004](adr/0004-native-svg-over-mermaid.md)）。目前有 36 個這樣的元件，本文件把它們已經共用的慣例寫成規範。

圖解元件是一次性的：一個元件服務一篇文章，可以自由新增或刪除，不是需要向後相容的公共介面。但它必須遵守 `tokens.css` 的色彩契約——那是全站唯一的邊界。

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

  <svg class="<前綴>-diagram__mobile" viewBox="0 0 360 680"
       role="img" aria-labelledby="<前綴>-diagram-mobile-title <前綴>-diagram-mobile-desc">
    …
  </svg>

  <figcaption id="<前綴>-diagram-caption">…</figcaption>
</figure>
<style>…</style>
```

硬性規則，36 個既有元件全數符合：

- **雙版面**：桌面與窄螢幕各一份 SVG，用 media query 互斥切換。窄螢幕不是縮小桌面版，而是重新編排成直向流程——這是 320 px 可讀性的唯一可靠做法。
- **`viewBox` 且不寫 `width`／`height`**：由 CSS 的 `width: 100%; height: auto` 決定尺寸。不要加 `preserveAspectRatio`。
- **`role="img"` + `aria-labelledby` 指向 `<title>` 與 `<desc>`**：`<title>` 是圖名，`<desc>` 用完整句子描述圖在說什麼，讓螢幕閱讀器使用者不必看圖。行動版的 `<desc>` 說明它是桌面版的直向排列即可。
- **id 全部加元件前綴**：同一頁可能出現多張圖，`marker` 的 id 尤其容易碰撞；行動版的 marker 要另取 id（如 `<前綴>-arrow-mobile`）。
- **BEM 命名**：`.<前綴>-diagram__card`、`__title`、`__detail`、`__arrow`、`__arrow--return`。`<style>` 未加 `is:global`，Astro 會自動 scope。

## 色彩契約

圖解只能使用 `tokens.css` 已定義的 token，**不得寫死 hex，也不得帶 hex fallback**。深色模式由 `tokens.css` 在 `:root[data-theme="dark"]` 與 `@media (prefers-color-scheme: dark)` 整批切換；元件自己不寫任何 `prefers-color-scheme` 或 `[data-theme]` 規則。一旦寫死 fallback，深色模式就不會生效。

| 用途                   | Token                                                                        |
| ---------------------- | ---------------------------------------------------------------------------- |
| 卡片底                 | `--color-paper-2`（次級）／`--color-card`（浮起）                            |
| 卡片框線、連接線、箭頭 | `--color-rule-2`（一般）／`--color-rule`（極淡）                             |
| 標題文字               | `--color-ink`                                                                |
| 內文文字               | `--color-ink-2`                                                              |
| 編號、標籤、次要說明   | `--color-muted`（更淡用 `--color-faint`）                                    |
| 強調節點底色           | `--color-accent`，其上文字用 `--color-accent-ink`                            |
| 強調節點淡底           | `--color-accent-soft`                                                        |
| 對照色（第二條路徑）   | `--color-secondary` / `--color-secondary-soft`                               |
| 字體                   | `--font-body`（一般）／`--font-display`（標題）／`--font-mono`（編號、代號） |
| 外距、字級             | `--space-*`、`--text-*`                                                      |

SVG 的 `font-size` 屬於 viewBox 座標系，用純數字 px（12／14／18 是既有元件的常用級距），不要套 `--text-*`；`--text-*` 只用在 `figcaption` 這類一般 HTML。

### 既知問題：36 個元件全部引用了不存在的 token

目前全部 36 個 `*Diagram.astro` 都引用了 `tokens.css` 沒有定義的名稱——`--color-border`、`--color-text-main`、`--color-text-muted`、`--color-bg-surface`、`--color-bg-card`、`--color-bg-subtle`、`--font-sans`。多數還帶著 Tailwind slate 系的硬編 fallback（`#e2e8f0` 62 處、`#ffffff` 34 處、`#64748b` 33 處、`#0f172a` 29 處）。

後果是這些圖在深色模式維持淺色渲染：白底卡片、近黑文字，落在曜炭灰頁面上。沒有 fallback 的（如 `--font-sans`）則靜默失效、繼承外層字體。

新元件一律使用上表的 token。既有元件在被修改時順手遷移，遷移對照：`--color-border` → `--color-rule-2`、`--color-text-main` → `--color-ink`、`--color-text-muted` → `--color-muted`、`--color-bg-surface` → `--color-card`、`--color-bg-card` → `--color-paper-2`、`--color-bg-subtle` → `--color-paper-3`、`--font-sans` → `--font-body`。

## 斷點

既有元件用了四種寫法（`768px` 21 個、`640px` 12 個、`48rem` 2 個、`42rem` 1 個）。新元件統一用 `@media (max-width: 48rem)`；切換時兩邊都加 `!important`，因為 `.<前綴>-diagram__mobile` 的 `display: none` 是預設值。

## 驗收

發布前在桌面與 320 px 視窗各看一次，淺色與深色各看一次。四種組合都要文字可讀、不產生整頁水平捲軸、顏色隨主題切換。
