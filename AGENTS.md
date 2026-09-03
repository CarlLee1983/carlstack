# CarlStack repository instructions

## 文章連結預設為發布任務

當使用者提供文章、長文或社群貼文連結，且未指定其他交付方式時，將它視為完整的 CarlStack 文章發布授權：讀取原文、蒐集一手資料補完與查核、撰寫或更新文章，並依 [`docs/content-guide.md`](docs/content-guide.md) 完成發布檢查。

- 去重檢查必須先於研究：保留平台的穩定內容 ID 與有識別作用的 query 參數，只移除 `utm_*`、`s` 等追蹤參數；再以原始 URL、正規化 URL、穩定 ID、作者與標題關鍵字搜尋 `src/content/blog`、`docs/research` 與 `docs/article-queue.md`。主來源 URL 必須保留在正式文章中，讓 repository 搜尋結果能直接對應發布頁面。
- 同一來源或主題已有文章時，更新既有文章與 `updatedDate`，不要建立重複 URL。
- 同一穩定內容 ID 視為同一來源；只有主題相近但論點與讀者收穫明確不同時才新增文章，並互相加入站內連結。
- 預設成品必須是 `draft: false` 的正式文章；完成後只提交本次相關檔案、推送 `main`、確認部署成功，並驗證正式網址已顯示新內容。
- 只有使用者明確要求加入佇列、保留草稿、僅分析／審閱、不要發布或指定其他交付物時，才停止在對應階段。

## 文章發布控制

文章發布以 [`docs/content-guide.md`](docs/content-guide.md) 為內容規格；`AGENTS.md` 只負責觸發 workflow，不作為唯一控制面。發布或更新文章時，先 format、再 stage 目標文章，接著取得以下綠燈才可 commit：`pnpm content:policy -- HEAD`、`pnpm check`、`pnpm test`。有流程或架構圖時，還要在桌面與 320 px 視窗檢視 SVG 成品。

動到 [`docs/architecture.md`](docs/architecture.md) 邊界清單上的檔案時，先讀該文件與 [`docs/adr/`](docs/adr/)，並回報狀態為 `proposed` 的未決問題。

不得以關閉檢查、改成 draft 或跳過 CI 繞過 gate。正式文章的封面與 `coverAlt` 由 content schema 強制；新增或修改文章中的 Mermaid 由內容 policy 與 CI 阻擋；舊文僅在被修改時才需要遷移其 Mermaid 圖解。
