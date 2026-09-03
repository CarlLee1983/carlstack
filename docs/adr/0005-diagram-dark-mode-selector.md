# 0005 圖解深色模式：解析後的 data-theme 作為唯一主題訊號

- 狀態：accepted
- 日期：2026-09-03

## 脈絡

ADR 0004 讓圖解改用原生 SVG，理由之一是「吃 `tokens.css` 所以自動跟隨深淺色」。盤點後發現這個前提並不成立——36 張圖在深色模式全部維持白底深字，落在曜炭灰頁面上。

根因不是缺少深色配色。33 個元件裡本來就有 **737 條作者手寫的深色規則**，涵蓋 90% 的著色選擇器，但寫成 `:global(.dark) .x { … }`——Tailwind 的 class 慣例。CarlStack 的主題訊號是 `document.documentElement.dataset.theme`，全站沒有任何地方會加上 `.dark` class，因此那 737 條規則從來沒有生效過。

另外 65 個選擇器引用了 `tokens.css` 沒有定義的名稱（`--color-border`、`--color-text-main`、`--color-text-muted`、`--color-bg-surface`、`--color-bg-card`、`--color-bg-subtle`、`--font-sans`），靠硬編的淺色 hex fallback 渲染，這部分確實沒有深色值。

## 決定

三項一起：

1. **主題解析集中在 `src/layouts/BaseLayout.astro`**：localStorage 的 `carlstack-theme` 只保存使用者的明確選擇（沒有值代表跟隨系統），`data-theme` 一律寫入解析後的結果。元件因此只需要判斷 `:root[data-theme="dark"]`，不必自己處理 `prefers-color-scheme`，也就不必為了巢狀在 `@media (max-width)` 裡的規則寫出雙重 media query。使用者未明確選擇時，掛上 `change` 監聽讓系統偏好變更即時生效。
2. **元件的深色選擇器一律是 `:global(:root[data-theme="dark"])`**，`.dark` 一律視為錯誤。
3. **中性階收斂到 `tokens.css` 的 `--dg-*` 層**，淺色值沿用圖解原本的階調（`#ffffff`、`#f8fafc`、`#e2e8f0`、`#cbd5e1`、`#0f172a`、`#475569`、`#64748b`），深色值另給。

## 理由

修選擇器而不是重畫配色，保住了作者為每張圖手寫的深淺兩套設計，淺色模式零變化。相對地，把 36 張圖統一成站台的北歐暖色雖然更一致，卻要改動兩個模式共約 2800 處，並讓 33 篇已發布文章的圖在淺色下也改觀——收益不足以蓋過風險。

`--dg-*` 的淺色值刻意等於原本的硬編色，而不是直接接到 `--color-*`，同樣是為了讓淺色模式可證明地零變化。代價是圖解的中性階與站台的暖色系仍有色溫差；這是已知且刻意接受的。

`data-theme` 一律寫入解析值，代價是 JavaScript 停用時 `data-theme` 不存在，圖解會停在淺色（站台外框仍由 `tokens.css` 的 `prefers-color-scheme` 區塊處理）。以靜態站的取捨來說可接受。

## 後果

- 737 條死碼復活，另補 15 條缺少深色對應的強調色規則、85 處中性色改用 token
- 全 36 篇文章 × 深淺兩色的文字對比度稽核：深色最差 3.82、淺色最差 2.83，皆為強調色小標籤，且淺色那批在此次改動前就存在
- 規範寫在 [`docs/diagram-guide.md`](../diagram-guide.md)；`.dark` 的用法一律視為錯誤

**Falsified if:** `src/components/*Diagram.astro` 出現 `:global(.dark)`，或 `src/layouts/BaseLayout.astro` 不再無條件寫入 `document.documentElement.dataset.theme`。
