# CarlStack 內容指南

## 寫作定位

讀者是需要把系統與 AI 工程落地的工程師。文章應說清楚限制、選擇、驗證方式與結果；避免只有工具清單、抽象口號或無法重現的結論。

## 檔案與 URL

- 文章放在 `src/content/blog`，使用小寫 ASCII 檔名與連字號，例如 `agent-evaluation-loop.mdx`。
- 檔名會成為 `/blog/<slug>/`；發布後不要任意更名。
- 專案放在 `src/content/projects`。頁面從 collection 讀取，不修改 `projects/index.astro` 增加資料。

## Blog frontmatter

| 欄位            | 必填           | 說明                                              |
| --------------- | -------------- | ------------------------------------------------- |
| `title`         | 是             | 頁面 h1、搜尋與 SEO title                         |
| `description`   | 是             | 一到兩句具體摘要                                  |
| `publishDate`   | 是             | ISO 日期；決定倒序排列                            |
| `updatedDate`   | 否             | 有實質更新才設定                                  |
| `draft`         | 是             | production 排除 `true`                            |
| `featured`      | 是             | 是否進入首頁精選                                  |
| `tags`          | 是             | 由內容生成 taxonomy，可為空陣列                   |
| `series`        | 否             | 系列名稱                                          |
| `seriesOrder`   | 否             | 正整數；設定時必須同時有 `series`                 |
| `cover`         | 新正式文章必填 | `src/assets` 相對圖片路徑；歷史文章可維持無 cover |
| `coverAlt`      | 是             | 描述圖片傳達的資訊                                |
| `canonicalUrl`  | 否             | 只有本站不是原始來源時覆寫                        |
| `repositoryUrl` | 否             | 本文對應 repository                               |

日期不要加引號也可以；schema 會轉成 `Date` 並在格式錯誤時讓 check/build 失敗。

為確保文章依實際發布先後排序，所有**新文章**的 `publishDate` 必須使用含 UTC offset 的 ISO 8601 時間戳，例如 `2026-09-01T12:57:24+08:00`，不可只寫日期。歷史文章不回填無法確認的發布時間；發布前應確認新文章排在同日既有文章之前。

## 標籤與系列

重用既有詞彙，避免只差大小寫、全形或空格的同義標籤。URL 正規化會執行 NFKC、轉小寫、把非字母數字區段改為 `-`。中文會保留。

建議起始主題：AI 工程化、AI Agent Workflow、系統設計、API 整合、DDD 與 Clean Architecture、開源專案、技術選型、專案復盤。這份清單只提供作者選詞；網站顯示的 taxonomy 仍完全來自已發布文章。

系列文章應設定連續 `seriesOrder`。頁面依此欄位排序，未設定 order 的同系列內容會排在最後。

## Markdown 與 MDX

- 一篇文章只使用一個 h1；frontmatter title 會輸出 h1，正文從 `##` 開始。
- 程式碼 fence 要標示語言，讓 Shiki 正確高亮。
- Markdown 表格只用於真正的欄列資料；手機會在表格自身橫向捲動。
- MDX 只在 Markdown 表達力不足時使用，避免把文章寫成前端應用。

## 圖片

正文靜態圖片放 `public/images`，使用明確 width／height：

```html
<img
  src="/images/example.webp"
  width="1200"
  height="675"
  loading="lazy"
  alt="請描述圖中資訊與關係"
/>
```

首屏主要圖片不要 lazy-load。下方圖片使用 `loading="lazy"`。需要多尺寸輸出的 cover 放 `src/assets`，在 schema 中使用 image metadata；不要把遠端圖片 URL 當長期依賴。

## 提示區塊

需要把提醒、前提或警告從正文拉出來時，用 GitHub alert 語法，不要自己刻樣式或引入元件：

```markdown
> [!NOTE]
> 這段是補充說明。
```

可用標記為 `NOTE`／`TIP`／`IMPORTANT`／`WARNING`／`CAUTION`，大小寫不拘，會分別渲染成「備註／提示／重點／注意／警告」。標記可以獨立一行，也可以和內文同一行。未列出的標記與一般引言維持 `blockquote`，所以既有引言不受影響。轉換由 `src/utils/remark-callout.mjs` 處理，`.md` 與 `.mdx` 寫法相同。

## 圖解

新文章內的流程、架構、資料流與狀態圖一律使用原生 SVG；需要樣式時以 Astro 元件封裝，不使用 Mermaid（見 [`docs/diagram-guide.md`](diagram-guide.md) 與 [ADR 0004](adr/0004-native-svg-over-mermaid.md)）。SVG 必須有 `title`／`desc`、可縮放的 `viewBox`，並在 320 px 寬度維持可讀性；窄螢幕需要不同編排時，提供專用 SVG 版面。

## 數學符號

站台沒有載入 remark-math 或 KaTeX，`$O(\log N)$` 這類寫法會原樣輸出成亂碼。用行內程式碼寫複雜度與算式（`` `O(log N)` ``、`` `P(A ∩ B) = P(A) × P(B)` ``），比較運算子與上下標改用 Unicode（`≥ 50%`、`2³²-1`、`RT1`），本來就是一般術語的符號寫成純文字（Z-index、座標 (X, Y)）。

內容 policy 會擋下帶反斜線指令或上下標的 `$…$`；`$O(1)$`、`$N$` 這種無法與金額區分的形式擋不住，靠這條規範自律。真正需要排版引擎的算式目前沒有出現過，若哪天出現，先決定要不要引入 KaTeX，不要先寫了再說。

## draft 到發布

尚未成文的題目先加入 [`article-queue.md`](article-queue.md)，依處理順序由上往下排。開始正式整理時，在 `src/content/blog` 建立 `draft: true` 的文章，並在同一次變更刪除對應的佇列項目；不要保留完成標記或另一份待辦清單。

1. 新檔設 `draft: true`。
2. `pnpm dev` 檢查內容、程式碼、圖片、SVG 圖解、深淺色與手機版。
3. 依 Cover Direction 生成、檢視並驗收封面；將圖片放進 `src/assets`，設定 `cover` 與 `coverAlt`。
4. 先執行 `pnpm format`，再將文章檔案 stage；接著執行 `pnpm content:policy -- HEAD && pnpm check && pnpm test`。前者會拒絕本次新增或修改文章中的 Mermaid；`astro check` 會拒絕缺少封面或 `coverAlt` 的正式文章。
5. 設定正確 `publishDate`，將 `draft` 改為 `false`。新正式文章不得在此步驟前缺少封面。
6. 再次執行 production build，確認文章出現在 RSS、Sitemap 與 Pagefind。
7. merge 到 `main` 後由 GitHub Actions 自動部署。

## SEO 與 cross-post

title、description 與 cover 會生成 Open Graph、Twitter Card；BlogPosting JSON-LD 使用發布／更新日期、作者、標籤與 canonical。`public/social-card.png` 只作為既有無封面文章或使用者明確要求不做封面時的 fallback，不能作為新正式文章跳過封面的理由。

先發布 CarlStack 原文，再同步到 Hashnode 或 Medium，並在外部平台設定 CarlStack URL 為 canonical。若內容原先發布在其他自有來源，才在 CarlStack frontmatter 設 `canonicalUrl` 指回該來源。

## 內容驗收

- 標題能單獨說明問題，不使用「終極」、「革命性」等無證據修飾。
- 摘要包含具體技術範圍與讀者會得到的結果。
- 每個外部事實有可追溯來源；時間敏感數據標示日期。
- 程式碼可以執行，或清楚標示為縮寫／概念片段。
- 圖片與 SVG 圖解在 320 px 寬度不造成整頁水平捲軸，且文字可讀。
- 草稿不會出現在 production build。
