# Contributing to CarlStack

CarlStack 是內容網站，不是 CMS 平台。請讓每次變更保持可讀、可回復，並避免把第一版擴張成需要資料庫或常駐後端的產品。

## 開始前

1. 使用 Node.js 22.13+ 與 pnpm 12.1.0。
2. 執行 `pnpm install --frozen-lockfile`。
3. 閱讀 `README.md`、`docs/architecture.md` 與 `docs/content-guide.md`。
4. 不要提交 `.env`、部署憑證或 Giscus 私密資料。

## 內容變更

- 新文章先設 `draft: true`，在 `pnpm dev` 預覽。
- 使用既有 frontmatter schema；不要在頁面另建分類常數。
- 圖片提供具體 alt、width、height。技術圖一律原生 SVG，新文章禁用 Mermaid（`docs/diagram-guide.md`、ADR 0004）。
- 不捏造 Star、版本、benchmark、案例數字或遠端狀態。
- cross-post 預設以 CarlStack 為 canonical，例外才設定 `canonicalUrl`。

## 程式變更

- 優先靜態 HTML、原生瀏覽器能力與既有相依。
- 非必要互動不要加入 framework hydration。
- 修改 draft、排序、taxonomy、系列或 SEO 規則時更新對應測試（對應表見 `docs/testing.md`）。
- 新 production dependency、動態服務、schema 或 public URL 變更需在 PR 說明理由與回復方式。
- 動到 `docs/architecture.md` 邊界清單上的檔案時，先確認影響範圍；牽涉權衡就補一則 `docs/adr/`。

## 送出前

```bash
pnpm format
pnpm check
pnpm test
pnpm build
```

PR 說明需列出內容／行為變更、實際執行的驗證與尚未驗證的風險。合併到 `main` 後由 GitHub Actions 自動部署。
