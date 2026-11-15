# 訂單列表的排序欄位查核

2026-11-15（Asia/Taipei），系統設計每日實戰第 32 課。

## 範圍與去重

獨立 checkout 的最新 main 為 71a0d0ea2695b6e5c149d3fd2e1fa1c29fdae653。GitHub open PR 為空，最近正式部署 43544746856 對應同一 commit，conclusion 為 success。檢查 queue、research、全部 order-system 系列、當日文章與 draft，未見當日系列稿件。

以「排序欄位」、sort_by、ORDER BY、來源網址與相關字詞查重。既有 due-work-index 談工作掃描索引；api-pagination-offset-vs-keyset-cursor-architecture 談翻頁方法與 tie-breaker；database-index-query-foundations 談索引基礎。本篇新增的讀者收穫是公開排序選項的允許清單、參數綁定的界線與每個合法選項的成本。內鏈接回分頁、報表快照、ID 字串及錯誤契約，沒有重寫前課。

已讀 AGENTS、content-guide、content schema、deploy workflow、diagram-guide、copywriting、humanize-writing 與繁體／敘事規則。philosophical-engineering-writing 與題目無關，不套用。Trail 命令不存在，repo 無 .trail/cache，改查原檔。只新增本文、封面與此研究紀錄，不修改其他人的工作。

## 一手來源與對應論點

當日開啟並查閱官方原文，非僅依搜尋摘要。

- https://dev.mysql.com/doc/refman/8.4/en/prepare.html ，15.5.1：參數標記用於資料值，不能替代識別名稱與 SQL 關鍵字。對應固定排序映射段。
- https://laravel.com/docs/12.x/queries#introduction （官方目前重導至 /framework/docs/12.x/queries），Introduction：PDO 不支援欄位名稱綁定，含 ORDER BY。對應 Laravel 實作提醒。
- https://dev.mysql.com/doc/refman/8.4/en/order-by-optimization.html ，10.2.1.16：前段固定、後段排序、反向掃描及成本選擇。對應候選索引。明確保留非涵蓋索引及實際計畫驗證限制。
- https://dev.mysql.com/doc/refman/8.4/en/limit-optimization.html ，10.2.1.19：同排序值資料列可以不固定順序，加入唯一值可明確定序。對應 id 第二排序條件，沒有宣稱它凍結跨請求資料。
- https://dev.mysql.com/doc/refman/8.4/en/explain.html ，Obtaining Information with EXPLAIN ANALYZE：會實際執行並回報 iterator 時間與列數。對應受控資料驗證方法。

兩個排序名、50 筆、80 requests/s、每列 300 bytes、p95 300ms 都是教學設計。50×300=15,000 bytes/request；80×15,000=1,200,000 bytes/s，以十進位 MB 計，不混用 MiB。SQL 未跑真實 MySQL，沒有資料庫整合或壓測宣稱。從文章原文抽出唯一 javascript fence，Node24.22.1 實際執行 exit 0，輸出 sort mapping checks passed。涵蓋省略預設、oldest、六種非法值及惡意顧客字串留在 bindings。

## 編輯與封面

完成人工去 AI 味，移除針對系列日數的聊天殘留句。中文檢查器原本將「最多只讀 50 筆」誤認唯讀術語，改成「讀取量最多是 50 筆」而未扭曲句意。小標直接說明內容，無結論式標題。

封面方向矩陣：第31課為暖光米白紙雕、紅褐紙卡與後景閉合盒；第30課為冷光靛藍陶瓷、三塊直立板；本篇為冷光深灰／綠色玻璃與金屬、斜俯視雙軌旋鈕。與最近一篇在媒材、構圖、主色與光線皆不同。

內建 image_gen 正式工具生成原創封面。生成 prompt：16:9 editorial 3D still life；brushed aluminum selector with two parallel rails of translucent emerald tiles ordered by height and a round knob；charcoal slate backdrop；cool rim lighting；central 70 percent composition；no text, logos, screens, arrows or watermark。最終圖片放 src/assets/covers/order-system-list-sort.webp。全圖、320×200與160×160中心裁切已目視。全圖及一般卡片呈現雙軌與旋鈕，方形縮圖兩端部分裁切但雙組綠片與旋鈕仍可辨識。無文字、標誌或浮水印，coverAlt 對應實圖。最終尺寸1600×900。本文用 SQL 與輸入範例表達決策，未新增圖解。

## 驗收與限制

Node24.22.1、pnpm12.1.0，已執行 pnpm install --frozen-lockfile。正式發布前執行 format、stage 本次檔案、content:policy -- HEAD、check、test 與最終 build，結果以本次工具紀錄及精確 main 部署為準。

正常 ASTRO_TELEMETRY_DISABLED=1 pnpm dev --host 0.0.0.0 於 ready 前退出，輸出 Dev server process exited before becoming ready。依使用者授權，本機預覽桌面／320px、深淺色實頁目視可記錄未驗，不另架伺服器繞過限制。封面本地目視及正式部署檢查另行執行。
