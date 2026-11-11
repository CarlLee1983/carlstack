# 訂單查詢的日期與時區查核

日期：2026-11-11（Asia/Taipei），系統設計每日實戰第 28 課。

## 去重與範圍

起點 main：2531c44f66c9fc5bb847d5d31bd89e1b549eb666。已讀最新 AGENTS、content-guide、schema、CI/deploy workflow、architecture、diagram-guide、copywriting 與 humanize-writing（繁體及敘事規則）。Trail 未安裝，改查實際檔案。遠端分支、近期提交、open PR（空）、queue、research 與全部系列文章均已核對；當日無本系列稿件，第 1 至 27 課連續。現有四篇 draft 是無關 Prompt 系列。

原先考慮分頁，查到 api-pagination-offset-vs-keyset-cursor-architecture 後排除。時區關鍵字及來源 URL 查重後，第 12 課只涉及報價到期的 UTC 約定，第 19 課處理資料快照，均沒有處理商店日曆日期的查詢邊界。新文連結分頁、報表快照與受控匯出，核心決策只有日期由誰的時區定義。不推定讀者已完成前課。

## 來源與技術審讀

當日完整開啟並讀取：

- https://dev.mysql.com/doc/refman/8.4/en/datetime.html ：DATETIME 與 TIMESTAMP 的連線時區換算差異及微秒精度。
- https://dev.mysql.com/doc/refman/8.4/en/range-optimization.html ：索引範圍條件與複合索引，未將符合形式直接宣稱為實測執行計畫。
- https://docs.python.org/3/library/zoneinfo.html ：IANA 資料來源、日期轉換與歧義時間。
- https://www.iana.org/time-zones ：時區規則隨政策更新，文章不把固定 offset 當作地區規則。

DATETIME 儲存 UTC 是應用契約，非資料庫保證。已寫明 driver/ORM 整合待測，不假稱 SQL 實測。Python 模型限於三個已驗證、午夜無歧義的日期，不能當成任意歷史時區日界線的通用解法。資料查詢仍驗租戶權限，固定日期範圍不等於快照。

## 實際執行

從正文抽出 Python 原樣執行：台北 2026-11-11 為 UTC 前日 16:00 至當日 16:00，24 小時；紐約 2026-03-08 為 23 小時，2026-11-01 為 25 小時。起點前一微秒、起點、終點前一微秒、終點的結果為 false/true/true/false，相鄰日期邊界相等。輸出 PASS。未跑 MySQL 整合與效能測試，正文已集中說明。

20,000 × 31 = 620,000 筆，50 × 600 = 30,000 bytes ≈ 29.3 KiB，620,000 × 600 = 372 MB（十進位）。流量、資料大小與延遲門檻皆為教學假設。

人工依使用者偏好檢查標題與小標，採直接說明題材的「訂單查詢的日期與時區」，不沿用舊指南的口號式主張標題。humanize checker 一處提示性冒號已改寫，再人工審閱結構、台灣用語、適用範圍與來源。

## 圖像與預覽

封面矩陣：前課為杏橙水粉插畫、雙對角鉛筆構圖；前兩課為苔綠攝影、斜俯視陶瓷木盒。本課採藍紫剪紙、正視分層時鐘與包裹、冷色側光，媒材、構圖及主色不同。由正式 image_gen 工具生成，原創無文字商標，保存 1600 × 900 WebP，已目視全尺寸與 320 × 200 列表裁切，時鐘及三個包裹可辨識。

SVG 使用 token、中性背景、前綴 ID、title/desc、桌面 900 × 540 與窄版 288 × 560，對應 320 px 視窗內文。從實際 SVG 抽出靜態渲染，檢視深淺兩色共四張，無切字、重疊，日界線標示正確。靜態渲染不等於完整瀏覽器頁面驗收。

本機預覽先因 Astro 預設設定目錄不存在失敗，指定可寫 XDG_CONFIG_HOME 後，仍在 ready 前以 Dev server process exited before becoming ready 結束。雲端瀏覽器開 localhost:4321 回報 ERR_CONNECTION_REFUSED。依使用者准許的例外記錄，未用其他伺服器繞過限制。完整本機頁面桌面／手機視覺驗收未完成。

預設 pnpm 11.25.0 不符 engines，改用官方 registry 的 pnpm 12.1.0；npm cache 指到可寫工作暫存。Node 24.22.1 符合要求，鎖定安裝成功，無依賴或設定變更。

## 最終驗收紀錄

模型環境為 Python 3.12.14，系統 tzdata 標示 2026b；IANA 網頁當日列出較新的版本，因此沒有宣稱此執行環境已使用最新全球時區資料。三個測例的結果已列明，其他地區未測。

`pnpm install --frozen-lockfile`、`pnpm format` 與 stage 後的 `pnpm content:policy -- HEAD` 通過。`pnpm test` 117 項全數通過，沒有 skip。Astro diagnostics 248 個檔案為 0 errors、0 warnings。最終 production build 與發布驗證另由提交及部署紀錄追蹤。
