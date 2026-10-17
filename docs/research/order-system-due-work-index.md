# 系統設計每日實戰 07：到期候選查詢與複合索引

## 去重與核心決策

2026-10-17（Asia/Taipei），基於 main 17d30cf5f8105d82e5f83da7ffeeec4c28a8c9ed。已讀 AGENTS、content-guide、schema、diagram-guide、部署 workflow、copywriting 與 humanize-writing（含 zh-tw 禁用句式）。Trail 執行檔與 .trail/cache/INDEX.md 均不存在，故以檔案搜尋補查，未聲稱執行 Trail。open PR 查詢為空；系列目前1–6，當日無稿。以來源 URL、SKIP LOCKED、next_attempt_at、refund_jobs、索引、EXPLAIN 搜尋 blog/research/queue。既有 Shopify 是庫存預留，pagination 是 API 分頁，資料庫內核篇是通論；本篇聚焦上一節退款待辦的候選讀取路徑，並與第6篇互相連結。未修改或重試已取消的科技快報工作。

主張：LIMIT 限制回傳數，不是低掃描量證據；依固定狀態、到期範圍與穩定排序設計複合索引，用代表性分布與實際計畫驗收。索引不授予執行權、不保證遠端退款正確性。

## 來源對應（2026-10-17 讀原文）

- https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html ：複合索引按欄位順序與最左前綴支援查找；應用至本案例的順序為工程推論，不歸因成官方退款方案。
- https://dev.mysql.com/doc/refman/8.4/en/order-by-optimization.html ：WHERE 固定前段欄位後利用後段排序的條件、成本決策、InnoDB 次要索引隱含主鍵。對應不保證計畫與明寫 id 的說明。
- https://dev.mysql.com/doc/refman/8.4/en/explain.html#explain-analyze ：EXPLAIN ANALYZE 實際執行、TREE、時間與各 iterator rows/loops。未用普通 EXPLAIN 估計值冒充測量，提醒隔離環境與副作用。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html ：SKIP LOCKED 用於部分 queue-like table；非一致完整集合、只略過 row locks、不適用 statement based replication。僅列為多 worker 後續選項。

各來源只摘取上述必要技術要點；範例資料分布、門檻、退款派工場景及驗收設計均為原創教學建議。

## 假設、未實測與停止規則

MySQL8.4/InnoDB、模組化單體、單主庫、單 worker 起步，但承認重啟交接可能重疊，候選後須原子領取。next_attempt_at 非空且UTC；state=ready只包含可安全進入派工的工作，不把未知退款結果重設為新操作。200萬筆＝199萬已結束＋1萬ready；ready裡9800未到期＋200到期；另測零到期、5萬到期與同時間排序。50ms p95是待驗預算，沒有實測。2筆/秒×600秒=1200；理想清空1200/(5−2)=400秒，忽略重試限流且完成率要量測。SQL為未執行設計片段，不聲稱真實MySQL/金流sandbox/壓測完成。

固定狀態/時間/id索引對於客服order_id/created_at查詢不是共用答案；另一選擇是資料小時保留簡單索引並設量測升級門檻。不提供完整多worker租約/接管實作，未將索引章包裝成生產退款worker。

## 封面與圖解

實際檢視第5篇靛藍赭黃版畫、第6篇紫陶瓷金屬靜物。新封面採紙藝索引卡匣、正面構圖、苔綠珊瑚米白、柔和陰影，與鄰篇媒材/構圖/色盤/光線不同，僅保留16:9。正式 image_gen 原創生成，PNG1672×941，輸出1600×900 WebP，目視全尺寸與320×180卡片；無字、品牌、水印，中央分隔與少量卡片可辨。

Prompt: Original editorial 16:9 layered cut-paper card catalogue, muted moss-green archive cards, one coral divider opening a narrow central path to a few cream cards; modern magazine composition, tactile paper, straight-on, soft flat shadows, crop-safe central70%; no words, numbers, logos, arrows, computers, people, coins, packages or watermark. Metaphor, not technical diagram.

DueWorkIndexDiagram 原生SVG960×560寬列卡片＋窄版HTML，title/desc、前綴id、dg tokens，無硬編中性色。正文不逐字重複圖解。

## 環境與技術驗收

雲端獨立 /tmp 工作區。已讀 orbit:software-engineering；list_environments 顯示Mac離線、無saved cloud，使用本雲端工具。Node24.19.0；預設pnpm11.25不符repo，從npm官方registry於隔離toolchain安裝pnpm12.1.0，frozen-lockfile安裝成功。所有後續檢查使用該版本，不改repo工具鏈或鎖檔。

獨立全文審查通過，已釐清5萬到期工作屬另一個較大的ready資料集。封面全尺寸與卡片已目視。pnpm dev 在ready前退出，雲端瀏覽器 localhost:4321 回報 ERR_CONNECTION_REFUSED；桌面/320px、深淺色實頁目視未完成，依使用者明確的CarlStack預覽例外記錄，不修改環境限制或宣稱已驗。圖片及SVG靜態結構檢查不替代整頁目視。一般測試109項通過（不代表本文的SQL或金流實驗已執行）。

完整 pnpm format、content:policy、check（含 Astro 型別與 production build）、109 tests 通過。首次完整 build 產出650個Pagefind索引頁；文章、封面、SVG/窄版結構均在輸出。發布前會以最終檔案再次執行policy/check/test並核對RSS、Sitemap與系列，不以本紀錄替代最終退出碼。
