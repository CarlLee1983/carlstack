# 0005 圖解元件的 design token 契約與強制方式

- 狀態：proposed
- 日期：2026-09-03

## 脈絡

ADR 0004 讓圖解改用原生 SVG，理由之一是「吃 `tokens.css` 所以自動跟隨深淺色」。實際盤點後這個前提**目前不成立**：全部 36 個 `*Diagram.astro` 引用的是 `tokens.css` 沒有定義的名稱（`--color-border`、`--color-text-main`、`--color-text-muted`、`--color-bg-surface`、`--color-bg-card`、`--color-bg-subtle`、`--font-sans`），多數還帶著 Tailwind slate 系硬編 fallback（`#e2e8f0` 62 處、`#ffffff` 34 處、`#64748b` 33 處、`#0f172a` 29 處）。

這些 fallback 只有淺色一組，因此圖在深色模式維持白底黑字，落在曜炭灰頁面上。ADR 0004 的主要收益目前沒有兌現。

## 待決問題

規範已寫進 [`docs/diagram-guide.md`](../diagram-guide.md)（只用已定義 token、不得帶 hex fallback、不得自寫 `prefers-color-scheme`），但**尚未決定強制方式與遷移範圍**：

1. 強制方式：擴充 `src/utils/content-policy.mjs` 掃 `src/components/*Diagram.astro`，比對 `tokens.css` 實際定義的名稱？還是獨立一支檢查 script？前者讓 policy 的職責從「文章內容」擴張到「元件樣式」。
2. 遷移範圍：36 個全部一次改完，還是比照 ADR 0004 只在元件被修改時遷移？後者代表深色模式在未定時間內持續是壞的。
3. 是否在 `tokens.css` 補上這些別名指向正確的值——成本最低，但等於接受兩套命名長期共存，與 DESIGN.md 的「單一視覺真理來源」相衝。

## 傾向

強制方式選獨立 script（職責清楚），遷移選一次做完（36 個是有限工作量，而且深色模式壞掉是使用者可見的缺陷，不該分期）。不採用別名方案。

尚未執行，因此保持 `proposed`。

**Falsified if:** `tokens.css` 定義了 `--color-border` 或 `--color-text-main`（代表改採別名方案），或 `src/components/*Diagram.astro` 不再出現硬編 hex fallback（代表遷移已完成，此則應改為 accepted 並記錄實際做法）。
