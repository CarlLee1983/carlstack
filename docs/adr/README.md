# 架構決策記錄（ADR）

記錄難以反轉、缺少脈絡會被後人「修好」、或來自真實權衡的決定。每則以 `NNNN-短標題.md` 命名，狀態為 `accepted`、`proposed` 或 `superseded`。

0001 至 0004 是回溯記錄：決定在 2026-08-31 至 09-01 之間做出並已落地，理由原本只散在 README、AGENTS.md 與 commit 訊息裡。

| #                                                 | 標題                                         | 狀態     |
| ------------------------------------------------- | -------------------------------------------- | -------- |
| [0001](0001-static-site-on-cloudflare-workers.md) | 純靜態輸出並部署到 Cloudflare Workers        | accepted |
| [0002](0002-pagefind-build-time-search.md)        | 用 Pagefind 做 build-time 搜尋索引           | accepted |
| [0003](0003-git-content-as-source-of-truth.md)    | 內容以 Git repository 為唯一來源，不引入 CMS | accepted |
| [0004](0004-native-svg-over-mermaid.md)           | 新文章圖解改用原生 SVG，禁用 Mermaid         | accepted |
| [0005](0005-diagram-token-contract.md)            | 圖解元件的 design token 契約與強制方式       | proposed |
