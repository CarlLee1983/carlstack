# 收藏查詢索引基礎查核

- 查核日期：2026-10-27（Asia/Taipei）。
- 對應文章：`src/content/blog/database-index-query-foundations.mdx`。
- 新系列「後端工程基礎圖解」第 3 篇，依使用者要求今天完成基礎內容的明確擴充授權。
- 教學假設：虛構文章收藏站，MySQL 8.4 + InnoDB，bookmarks 主鍵 id，欄位非 NULL。
- 核心決策：替「目前使用者最新 20 筆收藏」選一個能說明用途的候選複合索引。

## 去重與既有內容

已核對 `database-indexing-internals-b-plus-tree-lsm-tree-hash-bitmap`、`sql-query-execution-lifecycle-parser-cbo-executor`、`order-system-due-work-index`。新文以讀者第一次理解資料定位與執行計畫為主，不重寫儲存引擎結構比較、CBO 內核或訂單 worker 索引。三篇以內鏈提供下一步。

## 一手來源及段落對應

官方原文已開啟並讀相關正文。

- https://dev.mysql.com/doc/refman/8.4/en/mysql-indexes.html ：索引提供定位與範圍讀取路徑，B-tree 家族概念。
- https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html ：複合索引左側前綴，欄位順序影響可用範圍，不過度斷言後綴完全不能使用索引。
- https://dev.mysql.com/doc/refman/8.4/en/order-by-optimization.html ：常數前綴後的 ORDER BY、方向一致性、成本決定是否採用，非看到索引就保證免排序。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html ：次要索引帶主鍵，取非覆蓋欄位時由主鍵找聚簇資料。
- https://dev.mysql.com/doc/refman/8.4/en/optimization-indexes.html ：空間、INSERT/UPDATE/DELETE 維護代價。
- https://dev.mysql.com/doc/refman/8.4/en/explain.html ：一般 EXPLAIN 估計計畫，EXPLAIN ANALYZE 實際執行與量測。

示例 SQL 未在 MySQL 執行，正文已集中明標。無虛構 EXPLAIN 輸出、毫秒、倍數或壓測。user 42、20 筆、圖中時間與 ID 皆教學資料。三份結構不推導為三次磁碟寫入。覆蓋索引與小資料掃表選擇為工程取捨，不當成實測結論。

## Cover Direction 與實際產物

- metaphor：卡片目錄分隔卡連向文章卡。
- medium：木刻版畫平面插畫。
- composition：俯視不對稱，抽屜左側、文章卡右側。
- palette：象牙底、炭黑、芥黃與少量青藍。
- lighting：均勻漫射平光。
- 與前一篇陶器寄物牌，在 metaphor、medium、composition、palette、lighting 均不同。
- 正式內建 `image_gen__imagegen` 生成一次；提示為上述方向加無字／logo、縮圖可辨、安全中央裁切。未使用 CLI 或第三方圖。
- 原始：`/workspace/scratch/d935b46a4408/generated_images/exec-4883d3b4-88a7-4068-bdf4-c0a2e5265a97.png`。
- 發布：`src/assets/covers/database-index-query-foundations.webp`，1536 × 1024，475602 bytes，WebP quality 86。
- 原圖與 720 × 405（16:9）與 640 × 400（16:10）中央卡片裁切已逐一目視，黃色分隔卡及藍線均保留，alt 對應實圖。

## 圖解與驗收邊界

`src/components/BookmarkIndexLookupDiagram.astro`：原生 SVG 桌面 960 × 620，手機同義步驟卡。示意先依 user 分組、user 42 內按 saved_at/id 遞減、再由 id 取 post_id；明標非真實頁配置與非實測 I/O。全中性色使用 `--dg-*`，無 Mermaid。尚未在此子任務進行實頁桌機／手機深淺目視；整合者負責共同 build、檢查、預覽與正式部署，若環境受限需如實保留紀錄。
