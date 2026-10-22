# 系統設計每日實戰 12：報價有效期與原操作恢復

## 去重與範圍

2026-10-22 Asia/Taipei，獨立 cloud checkout 起始 main `064acacc9ab696ecf7a6c2fc36feaa476d666e85`。其精確 main push deploy run `39628687841` success，open PR 空。讀取最新 AGENTS、content-guide、schema、deploy workflow、diagram-guide、carlstack-copywriting、humanize-writing 及繁中／敘事規則。Trail command 與 cache 不存在，依 fallback 直接查檔。未安裝／更新 skills，未修改設定或共用程式。

完整系列審讀確認第 1–11 課連續、皆正式，沒有 Oct22 本系列文章、研究稿或未完成 draft。queue 僅多活架構及共識題；四份既有 draft 為無關 Prompt 系列。先排除游標分頁，因站內已有 api-pagination-offset-vs-keyset-cursor-architecture。以 quote_id、報價、價格快照、作者／標題／URL 搜尋 blog、research、queue；第3課只保存下單時讀價，明確延後報價有效政策，第11課亦未處理。新決策為展示報價的接受時間點，不重寫既有預留或唯一收據算法。連結第3、4、11課。讀者練習進度未知，不推定已完成。

## 來源查核（2026-10-22）

- Oracle MySQL 8.4 §17.7.2.3，https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html ：完整章節，RR 同交易第一次一致性讀快照，RC 每次讀新快照。支持報價產生端使用一致性讀取，沒有把交易快照當跨請求永久保價。
- Oracle MySQL 8.4 §17.7.2.4，https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html ：完整章節及例子，明確交易 FOR UPDATE，讀取最新可用資料、鎖直到提交或回滾。用同一報價列序列化不同鍵，沒有宣稱只加鎖即所有路徑無死結。
- Oracle MySQL 8.4 §14.7，https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html ：閱讀目前時間函式求值規則、NOW／UTC_TIMESTAMP 精度與時區相關段落，非全部函式逐一驗證。UTC_TIMESTAMP 在 query 開始求值，所以應用等待鎖定讀返回後另發時間查詢。兩個值都採 UTC DATETIME(6) 約定，選擇 accepted_at < expires_at，不宣稱是鎖取得或 COMMIT 的精確物理時刻。
- Oracle MySQL 8.4 §17.20.5，https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html ：完整章節。deadlock 整筆 rollback、lock timeout 預設失敗 statement rollback。應用額外統一清理整筆，與結果未知 COMMIT 區分。
- AWS Builders’ Library，Malcolm Featonby，https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/ ：完整正文及結尾。client request identifier、ACID 原子保存紀錄和副作用、語意相等回覆、晚到重試與不同參數。同一來源已被前課引用，本次新論點是報價到期與原結果恢復順序，非重複來源摘要。

來源去重保留完整原 URL／章節 stable identifier。沒有主來源貼文或外部作者新觀點冒用。5分鐘、500／550元、20 SKU、單次報價、到期比較與流程為教學設計，不是官方效能或商業慣例。沒有可執行程式碼，SQL 明示設計片段；真實 DB、併發、金流、負載均未跑。

## 設計審閱

新產品承諾取代「下單讀到什麼價就用什麼價」。不可變的客戶／品項／數量／幣別／價格／期限，報價不保庫存，單次消耗只在成功共同提交。摘要包含 quote_id，變報價就是變意圖。原鍵終局重放優先，未提交接受時間回滾後失效。持鎖後另取主庫時間，期限前受理、期限後提交可接受，鎖前入口時間不算。死結／timeout 清理與 COMMIT 未知分開。替代方案為版本變更重新確認。

獨立全文審閱指出圖解的「逾時」過寬，已限縮成死結／鎖等待逾時；補文末精確官方來源清單。未製造第一人稱實測、未複製免責聲明到每段，保留未知及產品選擇。

## Cover Direction 與圖解

已目視相鄰第10、11課：10為帳冊鑰匙、剪紙gouache、俯視、淡紫青綠、柔光；11為缺槽提盤、3D陶瓷、等角、杏橙鈷藍、側光。12改為封蠟固定價格吊牌與包裹、linocut版畫、正面低角度、深綠petrol珊瑚紅、清楚輪廓光。與相鄰篇在比喻、媒材、構圖、色盤、光線均不同，只保留16:9。

內建正式 imagegen 原創 PNG 位於 ../generated_images/exec-aaf1f487-4c74-4a1d-b720-a3deda0b9616.png（保留原圖），以 sharp 轉1600×900 WebP quality88 放 src/assets/covers/order-system-quote-validity.webp。已目視完整圖及320×180卡片，吊牌、封蠟與沙漏可辨，無文字／logo，alt與像素相符。

Prompt: Use case stylized-concept. Original editorial cover about a price quote valid until a deadline while a sealed order keeps original terms. Coral-red wax seal fastening a cream blank price tag to dark forest-green parcel, small clear hourglass, deep petrol blue surface. Refined linocut print with ink grain and carved hatching, cream/coral/petrol, frontal low-angle still life, crisp rim light, 16:9 centered crop-safe at320px. No words, letters, numbers, currency symbols, logos, UI, arrows, receipts, keys, locks, trays, ceramic sculpture, book, people.

QuoteAcceptanceDiagram 為960×600原生SVG，三張獨立寬卡避免誤讀成三步串行；窄版HTML、48rem切換、dg tokens及深色強調色、title／desc／前綴id。

## 驗收紀錄

Node24.19.0、pnpm12.1.0，frozen install 成功，使用可寫隔離 npm cache、pnpm store 與 XDG directories，未改 lockfile／工具鏈。全repo pnpm format完成，沒有修改其他既有檔。

Astro dev在ready前退出（Dev server process exited before becoming ready）；實頁預覽不可用。Python Playwright 啟動 /usr/bin/chromium 遭 socket() failed: Operation not permitted，沒有更換旗標／另開伺服器繞過。完整實頁與320px窄版HTML深淺色未驗，依既有環境預覽例外發布時揭露。

桌面SVG另以既有sharp0.35.2從實際component的SVG與style抽出，僅代入tokens及dark selector，渲染960×600淺深兩版，實際像素目視中文字、accepted_at／期限、三卡與footer無截斷／重疊。10組文字／底色對比最低7.13:1；文字14–19px、卡片留白符合規範。窄版HTML僅靜態檢查折行與48rem互斥，未將desktop縮圖冒稱手機通過。

補入每秒10份×300秒=約3000份有效時間窗報價、最多60000筆明細的教學估算，明確排除歷史保留、連線數及實測容量。最後版本須重跑policy、check、test與production build產物驗收，再核對精確main部署。

首輪 gates 全通過：policy 1篇、Astro check221檔案0errors／warnings／hints、117／117tests，production build完成並索引Pagefind676頁。產物核對本文canonical、單一h1、最終3000份估算、封面、RSS、Sitemap、blog清單及系列；Pagefind精確fragment為zh-hant_356cb6a.pf_fragment，內含正式文章URL與正文。這是本地產物證據，部署與正式站另核；最後研究紀錄格式化後重跑全部gates。
