# 系統設計每日實戰 02：訂單容量預算

- 研究／撰寫日期：2026-10-12（Asia/Taipei）。
- 文章：`src/content/blog/order-system-capacity-budget.mdx`。
- 來源型態：原創教學，無外部貼文或穩定內容 ID。
- 系列：系統設計每日實戰，第 2 篇；承接需求契約，僅深入容量預算，不預設讀者完成前題或直接升級到分散式架構。

## 去重與連續性

先同步遠端 main `77a19b65c7dd66e960bf342eabdad3915eaab3e9`，查最新提交、Actions、正式首頁、`src/content/blog`、`docs/research`、queue 與系列。當日尚無本系列新文。既有 `large-scale-system-capacity-estimation-formulas` 屬廣泛估算／面試方法論，本篇的獨立收穫是承接明確訂單契約，區分 HTTP 嘗試、唯一操作、DB 連線秒與不刪除去重索引，再產出可驗證測試規格。第一篇已由本篇直接內鏈，系列自動維持前後篇導覽。未修改既有 queue 或無關文章。

原案例仍是單倉、單幣別、每單單品項、未付款、同步提交後回 201；尖峰 20 次嘗試／秒維持 10 分鐘；入口 SLI 是合格嘗試的及時且正確終局回覆。完整回覆保留 7 天、精簡去重索引首版不刪除。新增比例、每日量、耗時、資源與磁碟餘裕全為教學假設。

## 一手來源

以下於 2026-10-12 查讀原文。Little's Law 為完整五頁講義；k6 各專題頁、AWS 全文與 MySQL 指定章節支持各自的有限主張，不從摘要推出機器容量。

- https://www.columbia.edu/~ks20/stochastic-I/stochastic-I-LL.pdf ：Karl Sigman，Little's Law 的平均值、同一系統邊界與有限長期極限條件。本文不使用 p99 替代平均，也不把平均在途量當上限。
- https://dev.mysql.com/doc/refman/8.4/en/connection-interfaces.html ：Connection Volume Management 與連線資源。一般上限之外的管理連線不是本文人工預留 8 條的來源，兩者不混用。
- https://dev.mysql.com/doc/refman/8.4/en/memory-use.html ：共用與每連線／查詢記憶體成本。增加 max_connections 不等同增加 CPU、I/O 或鎖容量。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html ：UPDATE、索引紀錄與掃描範圍對鎖的影響；交易提交／中止釋放鎖。每個互斥持鎖區段 80 ms 對應 12.5/s 是作者理想化算例，不是 MySQL benchmark。
- https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/ ：closed model 的回饋與 arrival-rate 的獨立到達；不宣稱固定使用者模型在所有場景無效。
- https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/constant-arrival-rate/ ：rate 是 iterations，不自動等於 HTTP requests。
- https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/dropped-iterations/ ：未送出的 iteration 另列測試負載交付失敗；不加入已抵達服務入口的 SLI 分母，也不算成功。
- https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/ ：負載卸除、超載測試、可觀測拒絕與 goodput。查讀時官方轉址至 https://builder.aws.com/content/3Eun1EEyX6p2e3VYNyRLSJzLuMV/using-load-shedding-to-avoid-overload 。本文 40/s 突發、70% 磁碟門檻與恢復判斷是案例提案。

## 算術與驗證界線

以 Node.js v24.19.0 臨時計算實際核對：12,000 attempts、9,600 unique operations、8,640 orders；每日長期邏輯資料 112.3046875 MiB；90 天 9.870529174804688 GiB；365 天 40.030479431152344 GiB；7 天回覆快取 341.796875 MiB。資料加快取乘 3 的占用假設，90 天為 30.612945556640625 GiB，365 天為 121.0927963256836 GiB。練習 20 × 0.30 + 10 × 0.05 = 6.5 條，6.5 / 8 = 81.25%。

只有算術核對，沒有部署訂單 API、MySQL 或 k6，沒有實測流量／延遲或正式 SLO 結果。文章提供待執行驗收規格，避免把測試計畫寫成測試成果。機器配置是首輪測試候選，不是最低需求保證；高可用、RPO／RTO 未藉容量演算假稱解決。

## 封面方向與驗收

先檢視最近三張封面卡片：首篇是透明玻璃量規與綠色帳本、高斜角、明亮日光；Rollup 是深藍地形與黃銅環軌；GenOffice 是綠皮革文件櫃。本篇改成紙雕／霧面紙板、正面低視角、象牙白與靛藍／朱紅、柔和陰天光；與首篇至少材質、構圖、色調、光線四項不同，只保留橫幅比例。

內建 imagegen 原創生成朱紅包裹通過靛藍入口、旁留空白擴充區。生成原圖已檢視，再轉為 1600 × 900 WebP；全尺寸及 320 × 180 卡片檢視可辨識主體，沒有文字、logo 或浮水印。原始方向：original editorial 16:9 cut-paper relief, vermilion parcels through indigo portal, empty expansion bay, frontal architectural composition, ivory/muted blue, diffuse light, no text/logos/UI。

## 發布檢查紀錄

使用官方 registry 的 pnpm 12.1.0 完成 frozen-lockfile 安裝，未改動 lockfile 或設定。初始預設 pnpm 11.25.0 不符合 engines，因此使用指定版本；npm cache 放可寫臨時目錄。Astro telemetry 預設寫入不可用家目錄，後續命令以 `ASTRO_TELEMETRY_DISABLED=1` 環境變數執行，未修改站台設定。

本地 dev server 在 ready 前退出，預覽環境不可用；不改 sandbox 或啟用其他安全設定。圖解另做桌面／320 px 對應內容寬、深淺色靜態渲染目視，正式站點另以正常雲端 Chrome 驗證。完整頁面本地響應式互動驗收不能因此宣稱完成。

獨立技術審閱核對來源、算式與前篇連續性；修正練習的 8 條應用上限／40 條 DB 上限用語、入口 SLO 計時邊界，並明列三輪測試的重送比例與新操作速率。Node.js 多 pool 亦需合計，不假定一程序一定只有一個 pool。

最終內容 policy 通過（1 篇新文），check 的 Astro 診斷為 183 files、0 errors／warnings／hints，65 項 tests 全數通過。Production build 產出 623 個 Pagefind 頁面；以檔案內容及解壓縮索引片段確認新文進入首頁、文章清單、RSS、Sitemap、系列總覽與系列第 2 篇。原生 SVG 四種靜態渲染皆經目視，無重疊或切字；本地完整頁面預覽仍受限。發布時間在最終檔案定稿時以 Asia/Taipei 實際 offset 記錄。正式 main／Actions／Cloudflare 與公開頁面驗收結果由發布回報另記，不在部署前假稱成功。
