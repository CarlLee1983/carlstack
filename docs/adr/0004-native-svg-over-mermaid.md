# 0004 新文章圖解改用原生 SVG，禁用 Mermaid

- 狀態：accepted
- 日期：2026-09-01
- 相關 commit：`792b454`（第一次手動替換）、`18f3abf`（加上 policy gate）

## 脈絡

初版用 Mermaid fence 畫流程與架構圖。實際發布後暴露三個問題：Mermaid 在窄螢幕會溢出或縮到讀不了、配色不吃 `tokens.css` 的雙模式、且需要在瀏覽器載入一個 runtime 才看得到圖。

## 決定

新增或修改的文章不得含 Mermaid fence，改用原生 SVG，需要樣式時封裝成 Astro 元件。由 `src/utils/content-policy.mjs` 強制，`scripts/validate-content-policy.mjs` 只檢查本次 diff 的文章檔。

**舊文不主動遷移**，僅在該篇被修改時才需要一併處理。`mermaid` 相依因此保留，且只在含文章內容的頁面載入，security level 固定 `strict`。

## 理由

原生 SVG 讓圖解變成一般 DOM：吃 `tokens.css` 的 token 所以自動跟隨深淺色、可以為桌面與窄螢幕各畫一份版面、有 `<title>`／`<desc>` 可被螢幕閱讀器讀出、且不需要執行期 JavaScript。Mermaid 三項都做不到。

代價是每張圖要手工排座標，成本高出許多——這也是為什麼 policy 只擋新改動而不做全站遷移：一次遷移 130 篇的風險遠大於收益。

## 後果

- 目前有 36 個 `*Diagram.astro` 元件，慣例寫在 [`docs/diagram-guide.md`](../diagram-guide.md)
- `pnpm content:policy -- <base>` 是 commit 前的第三道 gate
- 不得以改成 draft、關閉檢查或跳過 CI 繞過

**Falsified if:** `src/utils/content-policy.mjs` 的 `changedArticlePolicyViolations` 不再回報 Mermaid fence，或 `tests/content-policy.test.ts` 的「新或修改文章拒絕 Mermaid fence」被移除。
