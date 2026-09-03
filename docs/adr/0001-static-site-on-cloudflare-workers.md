# 0001 純靜態輸出並部署到 Cloudflare Workers

- 狀態：accepted
- 日期：2026-08-31
- 相關 commit：`fedbc82`（先上 GitHub Pages）、`8e964e4`（同日改為 Cloudflare）

## 脈絡

CarlStack 是個人技術 Blog，內容全部來自 Git 中的 Markdown，執行期沒有任何需要伺服器計算的東西。初版 CI 先部署到 GitHub Pages，當天就改成 Cloudflare Workers Static Assets。

## 決定

`astro.config.mjs` 固定 `output: "static"`，**不安裝 Astro Cloudflare adapter**。Wrangler 直接把 `dist` 當作 Workers Static Assets 部署。

## 理由

沒有 SSR adapter，就沒有執行期程式碼、沒有 cold start、沒有 runtime 相依需要跟著 Astro 主版本升級，任何靜態主機都能接手。選 Workers 而非 GitHub Pages 是為了自訂網域下的 TLS 與邊緣快取，以及與既有 `gravito.dev` DNS 在同一個控制面。

代價是任何需要伺服器的功能——會員、動態 OG 圖、表單、API——都不能直接加，必須先推翻這則決定。這正是想要的摩擦。

## 後果

- `pnpm build` 產出 `dist`，`wrangler deploy` 上傳，沒有中間執行期
- 部署憑證只需要目標 account 的 Workers Scripts Edit 權限
- 留言交給 Giscus、分析交給 Cloudflare Web Analytics，兩者都是第三方 client-side 掛載

**Falsified if:** `astro.config.mjs` 的 `output` 不再是 `"static"`，或 `package.json` 出現任何 `@astrojs/*` adapter 相依。
