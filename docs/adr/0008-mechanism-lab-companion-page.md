# 0008 概念長文可附一個機制實驗室，網址為 /blog/<slug>/lab/

- 狀態：accepted
- 日期：2026-10-16

## 脈絡

系統設計類長文的靜態圖解能說明結構，卻無法讓讀者看到狀態如何流動，例如舊 token 的轉碼產物為何被發布閘門擋下。把動態圖直接塞進長文會拉長篇幅與載入成本，也會讓概念閱讀被操作打斷。

## 決定

1. 一篇概念長文可以有一個附屬的**機制實驗室**（用語見 `CONTEXT.md`），網址固定為 `/blog/<slug>/lab/`，發布後與文章網址同樣不可更名。第一個實例是 `src/pages/blog/youtube-like-product-system-design/lab.astro`，以靜態路由檔實作。
2. 實驗室是附屬頁，不是文章：不進 content collection、RSS、文章列表與系列導覽；使用 `BaseLayout`，維持 Pagefind 與 sitemap 收錄。長文以手寫深連結指向實驗室的固定英文錨點。
3. 動態圖遵守 `docs/diagram-guide.md` 的 anatomy 規範：在 repo 外以 anatomy skill 產出靜態 SVG 寫入元件，互動由元件內的 vanilla `<script>` 改變既有元素的屬性完成；不 commit anatomy kit，不使用 WebGL。情境邏輯放在 `src/utils/lab/` 的純函式並由 `pnpm test` 驗證。

## 理由

網址掛在長文之下，讓附屬關係從 URL 即可辨識；把實驗室做成獨立文章會讓它脫離脈絡出現在 RSS 與列表，還要承擔封面、系列序號等文章義務。

未採用的方案：獨立的 `/lab/<slug>/` 路由會切斷與長文的網址關係；通用的 `src/pages/blog/[slug]/lab.astro` 加新 collection 在只有一個實例時是預先抽象，等第二個實驗室出現再改，網址不變。將 kit vendor 進 `src/` 能在執行期重建幾何，但每頁多約 35 KB，且情境按鈕只需切換既有元素的狀態。

代價：每個實驗室都是手寫頁面與元件，第二個實例出現時需要重新評估是否抽成動態路由與 frontmatter 欄位。

**Falsified if:** 實驗室需要獨立出現在 RSS 或系列導覽，或互動需要在執行期重新產生幾何而必須把 kit 放進 repo（`docs/diagram-guide.md` 的 kit 規定因此改變），或 `src/pages/blog/[...slug].astro` 生成的文章 id 出現 `<slug>/lab` 而與實驗室路由衝突。
