# 系統設計系列最後一批既文修訂

查核日期：2026-10-20。基準為當時最新 origin/main `26415b97cc2809516d50e679968994622bd4e33e`。本批範圍為系列 #5–9；#2/#4 同時由另一工作目錄整合，本批沒有修改它們，也沒有改 #1/#3/#10。保留文章 URL、publishDate、封面與數字假設；updatedDate 交由整合者在發布時設定。

## 逐篇判斷

- #5 `order-system-cancellation-release.mdx` 不改。開頭 A 取消、B 預留、A 重試的數量錯誤已能逐步重算；正文說明持久資格、同一交易、timeout 部分回滾與 driver 列數語義；驗收已有同步屏障、故意占住 SKU、HTTP 丟失與跨訂單對帳。語氣與實務細節已符合本次要求，沒有為統一模板再寫一遍的必要。
- #6 `order-system-late-payment.mdx` 輕修驗收及結尾。把「收件已提交並回 200」與「收款／退款待辦／已處理標記」兩個持久化邊界拆開驗；補暫停重啟、業務交易中途回滾及 B 的庫存不可變。原付款、退款政策與外部結果未知界線不變。
- #7 `order-system-due-work-index.mdx` 補固定 cutoff 的 EXPLAIN／EXPLAIN ANALYZE SQL。說明從讀取、Filter、Sort 到 Limit 的判讀，節點時間不能相加，也不是物理 I/O 計數；零到期工作與歷史量增加對照，正常查詢重複量 p95。沒有捏造執行計畫或 50 ms 達標結果。
- #8 `order-system-cache-read-contract.mdx` 輕修解法前置、快取時間與定位手法。舊摘要回填不能換成當下取得時間；分開追 read-start 與 cache-fill，保留其不是 commit time 的界線。測試要求串起請求、DB 實例、交易邊界與 revision，結尾用具體排錯取代模板總結。
- #9 `order-system-retry-budget.mdx` 補真正發送邊界。提早發許可而延後使用，仍可能形成實際突波；需要在 transport 啟動邊界量間隔。重啟驗收分開處理全域派送權與單筆未知結果；舊程序暫停不等於退出，單筆租約也不等於總額度所有權。仍採單一派送器、5 次／秒、200 ms 間隔、10 個本地在途、3 秒時限與 15 分鐘人工核對的教學假設。

## 一手資料重新核對

- [MySQL 8.4 EXPLAIN](https://dev.mysql.com/doc/refman/8.4/en/explain.html#explain-analyze)：讀取 ANALYZE 指標與完整範例，確認真正執行、TREE 格式、毫秒時間、包含子節點時間、多 loops 平均時間；不把一般 EXPLAIN 的 rows 估計寫成實測。不從單次 ANALYZE 推出 p95。
- [複合索引](https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html)及 [ORDER BY](https://dev.mysql.com/doc/refman/8.4/en/order-by-optimization.html)：保持最左前綴與前段固定、後段排序的原論點；最佳化器是否選取仍須實際計畫。
- [MySQL 一致性讀](https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html)：重讀 RR 第一次一致性讀快照與新交易前進快照的段落；主庫路由和新快照是不同條件。
- [MySQL 鎖定讀](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html)：保留明確交易及鎖釋放邊界；沒有擴大成跨系統時間順序保證。
- [Stripe webhook](https://docs.stripe.com/webhooks#event-delivery-behaviors)：重讀重送與不保證送達順序的規則。持久收件及兩階段本地處理是本案例設計，不宣稱 Stripe 提供本地交易保證。
- [Stripe refunds](https://docs.stripe.com/refunds)：核對 requires_capture 不可直接退款、退款失敗及 pending 狀態，原文區分收款、履約與退款結果不變。
- [Stripe API 冪等](https://docs.stripe.com/api/idempotent_requests)：完整讀取 v1 的首次執行回應、500 保存、至少 24 小時後可刪鍵、相同參數及開始執行前不保存的邊界；未將 v2 行為套進文中 v1 範例。
- [Microsoft Cache-Aside](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)：確認不保證 DB／快取一致，沒有把 write-through 的文件概述延伸為本案例保證。
- [MDN Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control#no-store)：確認 no-store 與 no-cache 不同；原文仍指出它不能替前端狀態管理清舊值。
- [AWS timeout／retry／jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)：重新讀取 timeout、重試放大與 jitter 段落，原網址目前導向 AWS Builder Center。保留穩定來源 URL。真正 transport 啟動邊界與暫停重啟驗法屬本案例的工程推導，並非 AWS 提供的數值保證。

## 驗證界線

本批沒有執行 MySQL、Redis、金流 sandbox、替身服務或負載測試。新增 SQL 與故障注入步驟均為待執行方案。保留原教學算式及未測聲明；沒有變更任何程式、圖解或封面。

本地僅跑目標檔案 Prettier、對已 stage 文章的 content policy 與 git diff whitespace 檢查；完整 check、test、build、桌面／320 px 視覺驗收及正式部署由統一整合流程執行。系列十篇完成本輪審閱後停止，未擴展到其他舊文章。

## 發布整合

父審全文通過後，僅將上述四篇與本查核檔整合到 main `d5f45301c5118b92b1eb84227e0d1fdf2004399f`；不覆蓋已發布的容量與冪等修訂。updatedDate 設為本輪實際修訂時間 `2026-10-20T11:58:20+08:00`。原發表時間、URL、封面與系列序號保留。

同一雲端工作區 Astro dev 已回報 `Dev server process exited before becoming ready`，localhost:4367 連線拒絕；未繞過限制。桌面／320 px 深淺色實頁預覽依既有例外未完成。全套安裝、format、policy、check、test、獨立 build 及正式索引仍以本輪最終產物驗證，不能以先前批次代替。
