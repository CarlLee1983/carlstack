# Agent 記憶元件：2026-11-07 更新查核

## 編輯決定

更新既有 `memory-engineering-for-ai-agents.md`，保留 URL、原始發布日期、封面與系列第 5 篇。該文已涵蓋擷取、合併、檢索、衝突處理與退場；這次補充原始紀錄回查、候選版本發布與成本驗收，不另開同主題文章。

- 基準：遠端 main `ca94ad6`。
- 已搜尋所有遠端分支、正式文章、`docs/research` 與 `docs/article-queue.md`；沒有 Anthropic 本次來源 URL 的既有文章。
- `codex/agent-memory-runtime-corrections-20261105` 的相關修正已合入 main，保留其中權限、版本與資料刪除邊界。
- Trail CLI 與 `.trail/cache` 均不存在，因此以 repository 檔案及 git 搜尋補足查核。
- 沒有新增流程圖或更換封面。

## 一手來源

1. [Anthropic：The components of agent memory](https://www.anthropic.com/research/components-of-agent-memory)，發布於 2026-11-06。核對原文的記憶修正案例與 Figure 10；內部語料測試的分數是評分條件達成比例，文章沒有寫成一般任務成功率。
2. [Claude Cookbook：Dreaming with a dynamic workflow](https://platform.claude.com/cookbook/managed-agents-cma-dreaming-with-a-dynamic-workflow)，頁面標示發布於 2026-11-02。核對 analyzer／organizer 分工、原始紀錄的資料性質、寫入範圍，以及後續 session 的唯讀掛載。正文中的候選版本與發布檢查另標為設計建議，不宣稱 cookbook 已實作。
3. [Claude Code：How it works](https://code.claude.com/docs/en/memory#how-it-works)，2026-11-07 核對。`MEMORY.md` 載入限制是前 200 行或 25 KB，以先達者為準；主題檔案按需讀取。此限制只用來說明產品行為，沒有當成通用預設。

## 證據與範圍

- 沒有執行 Anthropic 評測或付費模型實驗。
- 原始紀錄、整理筆記、索引與自動載入內容的責任分配，以及發布、回復、遺失更新測試，均為工程設計建議。
- 總成本式只表達建置、更新與查詢的記帳方式，沒有填入虛構實測數字。
- 25 題內部測試不足以推定其他語料、任務或模型會得到相同改善。
- 舊版 X 來源無正文的限制保留並改為「先前查核」，沒有宣稱這次重新取得該來源。

## 本機驗證限制

已檢視沿用封面。桌面與 320 px、深淺色瀏覽器預覽尚未完成：Chromium 在建立本機 socket 時回報 `Operation not permitted`，未產生可驗收截圖。這次只更新 Markdown 文字，沒有變動版型、CSS、圖片或圖解；仍需如實保留此限制。

## 發布前檢查

- 使用 pnpm 12.1.0 完成 `install --frozen-lockfile`，未改 lockfile。
- 完成 `pnpm format`、staged article 的 `content:policy -- HEAD`、`pnpm check`、`pnpm test` 與獨立 `pnpm build`。測試 117 項通過；Astro check 為 0 errors、0 warnings。
- Pagefind 實際搜尋「AI Agent 記憶」與「背景修正」均找到新標題與既有 URL。
- 獨立人工審查沒有必修問題，並補明 `MEMORY.md` 限制只適用 session 開始時的自動載入。
- Astro 的家目錄暫存設定路徑在此環境不可用，改以 `XDG_CONFIG_HOME` 指向 `/tmp` 後完成檢查，沒有修改專案設定或停用任何 gate。
