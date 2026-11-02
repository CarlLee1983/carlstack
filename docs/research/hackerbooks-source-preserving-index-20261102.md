# HackerBooks：來源保留型索引研究紀錄

查核日期：2026-11-02（Asia/Taipei）；撰稿範圍僅文章與本研究紀錄。未執行第三方管線或效能測試，未下載完整資料集，未提交或推送。

## 去重與 repository context

- 主來源與正規化 URL 同為 https://news.ycombinator.com/item?id=50326821 ，保留識別用 `id`。
- 研究前搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md` 的 `hackerbooks`、`50326821`、`roansh`、`hacker books`，無既有文章或佇列命中。
- 已讀 AGENTS.md、docs/content-guide.md、src/content.config.ts、`.agents/skills/carlstack-copywriting/SKILL.md`、humanize-writing 及 zh-tw/narrative-zh-tw references。
- AGENTS 要求 Trail 優先；實際 `trail map` 與 `trail ask` 皆回 `command not found`，故採直接檔案與 rg fallback。最初規範讀取時尚未知 Trail 要求，讀到後即嘗試 CLI。
- 系列選擇「產品系統設計實戰」order 2，現有 order 1 為 youtube-like-product-system-design，已回報父代理避免並行衝突。

## 一手來源與段落對照

### A. Show HN 主文

https://news.ycombinator.com/item?id=50326821

- 已讀完整可見貼文與留言，非僅搜尋摘要。
- 作者 roansh 稱約 16.5k 本，至少兩位不同 HN 留言者提及，範圍從 2007 年起；每書連回來源留言。
- 作者明說稱讚與批評均計入，也請讀者回報漏書或錯配。
- 對照正文引言；日期以 2026-11-01 發表、2026-11-02 查核呈現。數量清楚限定為發表時作者自述，不稱現況精確總數。
- 不轉述其使用模型的能力比較，也不把社群留言當實測結果。

### B. 文案修正的作者回覆

https://news.ycombinator.com/item?id=50327270

- 已開啟原留言，作者表示改成 mentioned by。
- 對照「兩個人提過」節第一段；這是當時修正紀錄，不能推導現有推薦分頁仍只計提及。

### C. 作者的架構回覆

https://news.ycombinator.com/item?id=50327179

- 已開啟原留言，作者自述 plain JS/static JSON、Cloudflare、首載約 30kb 熱門索引、完整約 16k 背景清單、hashed filenames、R2 封面、Python + DuckDB over HN dump。
- 對照「靜態發布」節第一段；全部標明作者自述。
- 未量測壓縮前後大小、載入時間、Cache-Control、封面權限或可靠性；不把自述 cached forever 當成已驗證的 HTTP 設定。
- 同節的版本清單、切換入口、回復、子集提示皆為作者工程建議，不宣稱 HackerBooks 已採用。

### D. 官方網站可讀頁尾與導覽

https://hackerbooks.org/

- 直接 web open 最初回 Internal Error；curl /about 25 秒逾時。後以 web search 找到首頁，再 open 該結果成功讀取 HTML shell，共 55 行。
- 可見首頁導覽有 Most recommended；頁尾列 HN comments via open-index/hacker-news、book metadata via Open Library。
- 頁尾直接揭露 Bookshop.org/Amazon affiliate 與 Amazon Associate。
- 對照統計定義節的現況限定、資料出處節；僅用已讀官方可見文字。
- 點 About 只回相同 SPA shell，`/about`、`/about/`、`/about.html` 直接開啟均不可讀。因此沒有聲稱已讀 About 全文或確認下載 schema。
- 搜尋快取曾顯示 15,362 books 與 generated 2026-11-02，與發表時約 16.5k 不同。未以此摘要推導清理方法、改版原因或完整資料筆數，正文刻意不用該數字。

### E. 資料集辨識補查

https://huggingface.co/datasets/open-index/hacker-news

- 已讀官方資料集頁，正確宿主為 Hugging Face；先前嘗試 GitHub 同名路徑得到 404。
- 可見來源欄位包含 id/by/time/text/deleted/dead/parent 等，頁面 metadata 標示 odc-by。
- 這不能自動證明留言全文、書封或 HackerBooks 衍生資料的所有使用權；未做授權法律判斷，正文只要求分項確認。

## 原創工程建議與虛構案例

- 小安、小柏、《可靠系統》與 A/B/C 三則留言全為虛構，不對應真實 HN 使用者或真實書。
- 獨立留言者計數、複合去重鍵、空作者處理、作品/版本拆分、人工覆寫、保留原始字串、分類文字範圍、版本清單與回復流程皆為原創建議。
- 對應正文第 1–3 節及最後驗收清單；明確寫尚未對 HackerBooks 執行，沒有捏造測試結果。
- 站內延伸連結是發布版本一致性，並非宣稱 HackerBooks 採影音平台架構。

## 未知與發布前檢查

- 未讀原始管線原始碼，無法核驗實際去重鍵、書目合併或分類器演算法。
- 未取得 About 動態全文、資料下載授權或來源快照精確版本；未把可公開讀取等同可完整再散布。
- 封面由父代理另行產生及驗證，本代理不生圖；coverAlt 必須與最終實際封面對齊。
- 本代理只做兩個指定檔案的格式與寫作品質檢查；完整 content policy/check/test/build、封面驗收與部署由父代理統籌。

### 已完成的本地檢查

- 正文 CJK 計數 1,836 字（不含 frontmatter）。
- humanize-writing `check_zh.py` 最終無機械命中，並人工覆核虛構標示與事實歸因。
- `pnpm exec prettier` 因執行環境 pnpm 11.25.0 不符合 repository 要求 >=12.1.0 失敗；未改動 engines 或安裝環境。
- 改用已安裝的 `node node_modules/prettier/bin/prettier.cjs --write/--check`，僅指定本次兩檔，格式檢查通過。
- `git diff --check` 通過；新增檔另由 Prettier 檢查。未 stage、commit 或 push，未執行完整網站 gate。
