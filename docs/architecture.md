# CarlStack 架構

CarlStack 是內容優先的靜態網站：`src/content` 的 Markdown／MDX 是唯一資料來源，經 schema 驗證與 Astro build 產生純靜態 HTML，由 Cloudflare Workers Static Assets 提供服務。沒有資料庫、沒有 SSR、沒有常駐後端，執行期不存在應用程式狀態。

本文件定義**邊界**——改動會影響既有 130 篇文章或對外 URL 的檔案。技術選型的理由記在 [`docs/adr/`](adr/)，視覺規範記在 [`DESIGN.md`](../DESIGN.md)，內容寫作規範記在 [`docs/content-guide.md`](content-guide.md)。

## 建置管線

```
src/content/{blog,projects}/*.{md,mdx}
  → src/content.config.ts          schema 驗證，失敗即中止 build
  → remark: remark-mermaid, remark-callout
  → rehype: rehype-table-scroll, rehypeHeadingIds, rehype-heading-anchor
  → src/pages/**                   透過 src/utils/collections.ts 讀取
  → astro build (output: "static") → dist/
  → pagefind --site dist           掃描 dist HTML 產生 dist/pagefind/
  → wrangler deploy                Workers Static Assets
```

`SITE_URL` 在 `astro.config.mjs` 讀入，決定 canonical、RSS、Sitemap、Open Graph 與 robots.txt。未設定時退回保留字 `https://carlstack.example`，讓本地與 CI 在沒有網域時仍能 build；`scripts/validate-site-url.mjs` 在 `pnpm deploy` 阻擋這個 placeholder 進入正式部署。

## 邊界清單

改動以下檔案前先確認影響範圍，並更新對應測試；牽涉權衡時補一則 ADR。

| 邊界             | 檔案                                                                                           | 契約                                                                                                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 內容 schema      | `src/content.config.ts`                                                                        | 130 篇文章的 frontmatter 形狀。新增必填欄位會讓全部既有文章 build 失敗；只能新增選填欄位，或連同內容一起遷移                                                                                                                 |
| 發布與排序規則   | `src/utils/content.ts`                                                                         | draft 過濾、發布日倒序、taxonomy 正規化、系列排序、slug 推導、閱讀時間估算。純函式，不碰 Astro API，由 `tests/content.test.ts` 守住                                                                                          |
| Collection 存取  | `src/utils/collections.ts`                                                                     | 頁面唯一的內容入口。頁面不得自行呼叫 `getCollection` 或重建分類常數                                                                                                                                                          |
| URL 形狀         | `getEntrySlug` + `postHref`（`src/utils/content.ts`、`collections.ts`）、`src/pages/**` 的檔名 | `/blog/<slug>/` 發布後不可更名。`trailingSlash: "always"`                                                                                                                                                                    |
| Taxonomy URL     | `normalizeTaxonomy`（`src/utils/content.ts`）                                                  | NFKC → lowercase → 非文字數字轉連字號。改動會讓所有既有標籤與系列 URL 失效                                                                                                                                                   |
| 站址真理來源     | `astro.config.mjs` 的 `site`、`scripts/validate-site-url.mjs`                                  | 唯一站址設定。頁面元件不得硬編網域                                                                                                                                                                                           |
| 內容 policy gate | `src/utils/content-policy.mjs`、`scripts/validate-content-policy.mjs`                          | 只檢查本次 diff 新增或修改的文章，舊文維持原樣。放寬等於解除 Mermaid 禁令，見 ADR 0004                                                                                                                                       |
| Markdown 管線    | `astro.config.mjs` 的 `markdown.processor`、`src/utils/*.mjs` 外掛                             | 外掛順序有依賴：`rehype-heading-anchor` 需要 `rehypeHeadingIds` 先產生 id，因此手動掛在使用者外掛之後                                                                                                                        |
| Design tokens    | `tokens.css`                                                                                   | 全站唯一色彩、間距、字級來源。`:root` 為淺色，`:root[data-theme="dark"]` 與 `@media (prefers-color-scheme: dark) :root:not([data-theme])` 為深色。元件只能引用已定義的 token，見 [`docs/diagram-guide.md`](diagram-guide.md) |
| 站台識別         | `src/config/site.ts`                                                                           | 站名、作者、語系、導覽列。導覽項目新增等同新增頁面路由                                                                                                                                                                       |

## 不屬於邊界的部分

`src/components/*Diagram.astro` 是每篇文章專屬的一次性視覺元件，可以自由新增、修改或刪除，不影響其他文章——但它們必須遵守 `tokens.css` 的色彩契約與 [`docs/diagram-guide.md`](diagram-guide.md) 的結構規範。

## 執行期組成

站台在瀏覽器只有三段 JavaScript：主題與字級偏好（`src/layouts/BaseLayout.astro` 的 inline script，寫入 `localStorage` 的 `carlstack-theme` 與 `carlstack-font-scale`）、Pagefind 搜尋（`/search/`）、以及選用的 Giscus 留言與 Cloudflare Web Analytics。沒有 framework hydration；新增互動前先確認原生瀏覽器能力做不到。

Mermaid 只在含文章內容的頁面載入，security level 固定 `strict`。新文章已禁用 Mermaid（ADR 0004），此相依只為舊文保留。

## 驗證

`pnpm check`（Prettier + astro check + build）、`pnpm test`（`tests/*.test.ts`）、`pnpm content:policy -- <base>` 三道 gate 都必須綠燈才能 commit，見 [`docs/testing.md`](testing.md)。CI 在 pull request 執行前兩者，`main` 更新後再部署。
