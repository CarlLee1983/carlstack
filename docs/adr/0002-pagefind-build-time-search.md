# 0002 用 Pagefind 做 build-time 搜尋索引

- 狀態：accepted
- 日期：2026-08-31

## 脈絡

站上有 130 篇繁體中文長文，讀者需要全文搜尋。ADR 0001 排除了執行期後端，所以搜尋不能靠自架服務。

## 決定

`pnpm build` 是 `astro build && pagefind --site dist`：Pagefind 掃描已產出的 HTML，把索引寫進 `dist/pagefind/`，`/search/` 頁面在瀏覽器載入分片索引查詢。

## 理由

替代方案是 Algolia 或 Typesense 這類託管搜尋。它們要 API key、要在 build 後推送索引、要處理配額，而且索引與內容會有不同步的狀態。Pagefind 沒有帳號、沒有金鑰、沒有第二份真理來源——索引由 HTML 推導，只要 build 成功就必然一致。

代價是索引隨文章數線性成長並由讀者下載，以及 CJK 斷詞品質不如專業搜尋服務。130 篇的規模下這是可接受的。

## 後果

- `pnpm dev` 不產生索引，`/search/` 在開發模式顯示「索引尚未產生」；要驗證搜尋必須 `pnpm preview`
- Pagefind 只看得到 HTML，因此凡是希望被搜到的內容都必須靜態渲染，不能靠 client-side 產生

**Falsified if:** `package.json` 的 `build` script 不再呼叫 `pagefind`，或出現搜尋服務的 API key 環境變數。
