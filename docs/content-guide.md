# CarlStack 內容指南

## 寫作定位

讀者是需要把系統與 AI 工程落地的工程師。文章應說清楚限制、選擇、驗證方式與結果；避免只有工具清單、抽象口號或無法重現的結論。

## 作者聲音與文章結構

CarlStack 的文章要讓讀者記住作者的工程判斷，而不只是來源摘要：

- **標題是主張，不是題材。** 標題與小標應提出可被檢驗的判斷，少用「全景解析」或產品宣傳式形容詞。
- **每節都要完成一次轉折。** 引用外部觀點後，說明它如何改變讀者的工作；每篇最多一次直接寫「我的立場」。
- **抽象主張要在約 200 字內落地。** 使用表格、可貼上的 YAML／指令，或具名停止規則。
- **事實與判斷分開。** 外部事實附日期或時間碼來源；作者推論用明確句子標示，不把推論寫成來源原話。
- **粗體只強調定義或停止規則。** 每節最多一處，避免 emoji 與產品文案式形容詞。
- **收尾寫下一步。** 給讀者一個可在工作流中執行的動作，避免泛泛的總結。

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

系列文章應設定連續 `seriesOrder`。頁面依此欄位排序，未設定 order 的同系列內容會排在最後。新文章發布時應先對照既有系列，評估是否納入：

- **系統設計面試與架構方法論**：PEDALS 方法論、容量估算與經典系統面試題（TinyURL、Crawler、Dropbox、Stack Overflow）
- **分散式系統共識與事務架構**：CAP/PACELC、Raft、分散式唯一 ID、2PC/3PC/TCC、Saga 與消息交付語義
- **金融級架構與交易系統**：雙式記帳、Stripe 智慧路由、Shopify 彈性架構、清算對帳與即時風控
- **現代資料庫與儲存引擎內核**：B+ Tree/LSM-Tree 索引、MVCC 隔離級別、SQL 執行器、複製延遲、分庫分表與 TSDB
- **高併發快取與訊息中介軟體**：Redis 內核、快取淘汰演算法、快取叢集與模式、Kafka 高吞吐與延遲死信隊列
- **現代網路協定與 API 平台架構**：URL 解析全鏈路、TCP/UDP/QUIC、HTTP 演進、API 風格、反向代理/網關與 Webhook
- **AI Agent 工程化與工作流實戰**：開源 AI 技術棧、vLLM 推理優化、Agent 狀態機沙盒、Trace、Memory、Harness 與 Runtime
- **矽谷巨頭高併發架構復盤**：Slack、Twitter、Reddit、YouTube、Netflix、Airbnb、Discord、Figma 架構演進復盤
- **Claude Prompt Engineering 實戰**：提示詞契約、可維護模板、降低幻覺與工作流串接

若新主題具備連續閱讀或進階學習價值，可開創新系列，並確保系列名稱精確反映主軸、設定遞增的 `seriesOrder`。

## 精選文章策略

首頁設有「精選文章（Featured Articles）」區塊，最多展示 3 篇卡片，標語為「經過實作驗證的長期參考」，供首次造訪的讀者快速掌握全站最高質量的標竿觀點。

- **預設值為 `false`**：一般文章發布一律設 `featured: false`。
- **四選原則**：僅當文章符合以下條件時才考慮標記 `featured: true`：
  1. **強烈的作者聲音與立場**：非單純工具摘要或速查表，有明確的工程判斷與取捨。
  2. **可重現的完整技術閉環**：包含具體架構決策、取捨矩陣、失敗教訓或可驗證的工作流。
  3. **長期參考價值（長青文）**：技術半衰期長（例如系統設計方法論、架構控制面、工程紀律）。
  4. **領域平衡性**：維持 AI Agent 工程化與系統設計／架構各佔席次，避免單一題材霸榜。
- **總量與輪替控制**：全站建議維持 3~5 篇標記為 `featured: true`（首頁取最新前 3 篇），每季或有重大旗艦文章發布時進行回顧與輪替，避免過多文章標記導致舊精選永久遮蔽。

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

專案卡封面放在 `src/assets/projects`，建議使用 4:5 直式構圖。設定 `cover` 時必須同時提供描述圖片資訊的 `coverAlt`。

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
4. **系列檢查**：檢視本文主題是否屬於現有系列，或與站內既有文章形成多篇連續學習路徑。若屬於系列，在 frontmatter 設定對應的 `series` 名稱與遞增的 `seriesOrder`；若開創新系列，應確保同系列有清晰的進階順序。
5. 先執行 `pnpm format`，再將文章檔案 stage；接著執行 `pnpm content:policy -- HEAD && pnpm check && pnpm test`。前者會拒絕本次新增或修改文章中的 Mermaid；`astro check` 會拒絕缺少封面或 `coverAlt` 的正式文章，並校驗 `seriesOrder` 是否伴隨 `series`。
6. 設定正確 `publishDate`，將 `draft` 改為 `false`。新正式文章不得在此步驟前缺少封面。
7. 再次執行 production build，確認文章出現在 RSS、Sitemap、Pagefind 以及 `/series/` 系列清單（若有設定）。
8. merge 到 `main` 後由 GitHub Actions 自動部署。

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
