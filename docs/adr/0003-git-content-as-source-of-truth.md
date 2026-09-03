# 0003 內容以 Git repository 為唯一來源，不引入 CMS

- 狀態：accepted
- 日期：2026-08-31

## 脈絡

技術 Blog 的常見起手式是接一套 headless CMS。CarlStack 的實際編輯者是作者本人與 AI Agent（Claude Code、Codex）。

## 決定

文章與專案資料是 `src/content/` 底下的 `.md`／`.mdx`，形狀由 `src/content.config.ts` 的 Zod schema 在 build 時驗證。第一版不做 CMS、資料庫、登入、會員、付費與自製留言。

## 理由

Agent 能直接讀寫檔案、能被 git diff 審查、能在 PR 裡走 CI gate；CMS 的內容躲在 API 後面，Agent 要多一層整合才碰得到，而且無法用 commit 記錄「為什麼改」。schema 驗證發生在 build 期而非儲存期，意味著違規內容根本無法部署，不需要另建後台校驗。

代價是沒有圖形化編輯介面，發布要跑 build。作者本身就在終端機工作，這不構成阻力。

## 後果

- 內容規則的強制點是 schema（`src/content.config.ts`）與 policy script（`src/utils/content-policy.mjs`），不是人工審查
- 正式文章強制要有 `cover` 與 `coverAlt`，由 schema 的 `superRefine` 擋下
- 新增必填 frontmatter 欄位會讓全部既有文章 build 失敗，屬於邊界變更

**Falsified if:** `src/content.config.ts` 的 collection 不再由 `glob` loader 從 `src/content/` 讀取，或專案出現資料庫／CMS client 相依。
