# Deno Deploy 遷移退出條件：研究紀錄

查核日期：2026-10-10（Asia/Taipei）。文章：`src/content/blog/deno-cloudflare-deploy-migration-exit-plan.md`。

## 去重

- 研究開始前，主流程已對 Deno 題目完成去重，未發現既有文章。
- 寫作端另搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md` 的 `deno.com/blog/cloudflare`、`deno-joins-cloudflare`、`Deno` 與 `Cloudflare` 組合、`Deno Deploy`、`celld`，沒有既有結果。來源 URL 本身無追蹤參數，正規化後不變。
- 本文新增 URL；主題是託管平台退出的依賴、行為、資料與回滾驗收，不是收購新聞摘要。

## 一手來源

1. https://deno.com/blog/cloudflare
   - 標題：Deno is joining Cloudflare。
   - 作者：Ryan Dahl；發布日期：2026-10-09。
   - 穩定識別：`deno.com/blog/cloudflare`，無內容識別 query。
   - 已讀完整正文及後續安排清單，核對正文列出的團隊去向、Deploy／runtime 時限、付費客戶支援範圍與 JSR 後續安排。
   - 精確停機時刻未列；不自行補成特定年月日時，也不把原團隊停止開發等同所有社群開發終止。
2. https://blog.cloudflare.com/deno-joins-cloudflare/
   - 標題：Deno is joining Cloudflare。
   - 作者：Kenton Varda、Ryan Dahl；發布日期：2026-10-09。
   - 穩定識別：`deno-joins-cloudflare`，無內容識別 query。
   - 已讀兩位作者的完整正文，包含最後 The Plan。確認 celld 與 workerd 整合是計畫；workerd 當時的 Durable Objects 限單一實例，公告承認自架周邊服務／工具缺口。
   - 未沿用公告的「seamlessly migrate」宣傳語作為可無痛替換 Deploy 的結論，也未把整合路線寫成已交付產品。

## 事實、推論與限制

- 上述產品安排均來自官方 2026-10-09 公告，在正文就近附連結並另列來源。
- 依賴盤點、事件 fixture、單一正式寫入來源、暫停擴流、對帳與退出條件是本文提出的工程建議。
- YAML 為自訂、未執行的測試規格，不是 runtime 或平台設定；每案例重設初始狀態，分開新舊隔離資料與測試通知接收端。一次業務效果是範例需求，不宣稱平台提供 exactly-once delivery。
- 未部署 Deno／Workers／celld／workerd、未搬遷資料、未執行 fixture、未測效能或提出虛構結果。
- 備援不能假定切 DNS 即可完成：文章要求檢查資料新舊相容、追平進度與已測恢復時間。日期與數值門檻應由實際服務負責人確認。

## 系列與站內連結

- 已讀 AGENTS、content-guide、schema、carlstack-copywriting、humanize-writing 及 zh-tw 規則；參考近期〈Clef 相容 Jev API，既有分流門檻仍需重新驗收〉的證據與未實測標示。
- 評估「現代網路協定與 API 平台架構」後，本篇核心是供應商停運、runtime 依賴與資料搬遷，不以網路協定或 API 形式為主，不強制納入；也不加入 AI 系列、不為單篇另開系列。
- 正文連到 `/blog/webhook-system-architecture-hmac-retry-dlq/` 和 `/blog/modern-cicd-deployment-strategies-blue-green-canary-rolling/`，分別補足事件驗證與切換策略。
- 若主流程希望建立反向連結，CI/CD 文的資料庫擴展收縮段落最適合連回本篇作為平台停運遷移案例；這是延伸閱讀，不是相同來源去重，因此不為了反向連結擴大本次編修。

## 交付與尚待主流程完成

- 僅建立本文章與本研究紀錄。`draft: false`、`featured: false`，時間戳為實際撰寫時間 `2026-10-10T10:00:46+08:00`。
- 封面路徑依任務指定；coverAlt 為遷移與返回路徑的暫定描述，需主流程以實際產生的封面校對。
- 以現有 `node_modules/.bin/prettier --write` 格式化這兩個檔案，另檢查站內連結對應檔案存在、無 Markdown 表格／Mermaid、必要 frontmatter 與官方 URL 齊備。正文含約 1,740 個中文字。
- `pnpm exec prettier` 因環境 pnpm 11.25.0 不符專案要求 ≥12.1.0 而未執行，改用已安裝 formatter；未安裝或更動工具鏈。
- 未製作圖片、未執行 git stage／commit／push、未宣稱部署完成；全站 gates 與正式封面驗收由主流程統一執行。
