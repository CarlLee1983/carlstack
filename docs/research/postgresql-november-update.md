# PostgreSQL 2026 年 11 月更新查核

查核日期：2026-11-13（Asia/Taipei）。正式文章為 `postgresql-november-update.md`。

## 去重與定位

以主來源 URL、CVE-2026-6460、PostgreSQL 18.7 搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md`，未見同一更新。既有索引內核文章是基礎機制，本篇是特定版本維護與後續驗收，保留為獨立安全更新，不加入資料庫內核教學系列。全文適用使用者最新指示：標題直接說明題材，不強塞工程結論。

## 一手來源與結論

- https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/ ：已讀全文。11/12發布18.7、17.12、16.16、15.20、14.25及19 RC2，52項漏洞、140多個錯誤；14已EOL。Updating段載明不同索引重建條件與新完整備份建議。
- https://www.postgresql.org/support/security/CVE-2026-6460/ ：已讀全文。物件建立者可藉型別混淆以資料庫OS帳號執行程式；CVSS8.8，修補版本見各分支。未聲稱未登入即可利用，未取得已利用事件證據。
- https://www.postgresql.org/docs/18/release-18-7.html ：已查閱migration、型別修補、GIN、bpchar、TOAST、pg_trgm及incremental backup相關完整段落。完整型別防護需重建C擴充，部分需原始碼修改。既有WAL summaries未被修補，所以增量備份需新完整基礎。
- https://www.postgresql.org/docs/18/sql-reindex.html ：已讀鎖與CONCURRENTLY相關段落。普通重建阻寫，索引鎖亦可阻讀；併發方式兩次掃描、等待交易及額外負載，不應寫成零影響。
- https://www.postgresql.org/docs/18/continuous-archiving.html ：已讀PITR與連續WAL要求；邏輯dump不能作為WAL還原基礎。

本文的盤點欄位、訂單搜尋例子與驗收步驟為原創工程建議，沒有實作更新、重現漏洞、重建索引或執行還原測試。沒有用碼塊提供未測指令。

## 封面

正式imagegen原創，來源輸出 `exec-d00f5952-3b9b-4d14-a840-0743d2ab9aa7.png`，轉為本地WebP，1672×941、285100 bytes。全圖與480×320中央裁切已目視，主體可辨識、無字與logo。

Cover matrix：資料庫索引與備份圓盤／紙雕版畫／正面置中／米白、深藍、橘／暖影。與前篇AWS Emulator玻璃機房微縮模型的媒材、構圖、色彩不同。

生成提示：original editorial technology blog cover, 16:9; tactile hand-cut paper and screenprint collage; dark navy archive with copper index tabs, backup disk and magnifying glass; ivory background, burnt orange/navy; no text, numbers, logos or watermark; centered objects.

## 內容驗收

已執行 humanize-writing 的繁中檢查並人工修正命中；標題由父任務確認為「PostgreSQL 11 月安全更新」。無新SVG。父任務統一執行格式、policy、check、test、build與正式部署驗證；本研究紀錄不預先宣稱那些檢查通過。
