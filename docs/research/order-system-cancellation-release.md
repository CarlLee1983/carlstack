# 系統設計每日實戰 05：取消與一次性釋放預留

## 查重與範圍

2026-10-15 以 main fe6f84c40e8f01803d0adf5c7d4b3996841cb512 查讀 AGENTS、content-guide、content schema、CI/deploy workflow、diagram-guide、copywriting 與 humanize-writing skills、article-queue、blog、research、近期 commit。當時 open PR 為空、當日沒有本系列文章，沿用系列第 5 篇。

已閱讀前四篇 order-system-requirements-slo、capacity-budget、write-ownership、idempotency-receipt。另查閱 high-concurrency-inventory-locking-strategies 與 shopify-inventory-reservations-mysql；前者談購買扣減方案，後者談供應商預留架構。本篇獨立決策是不同取消請求競爭同一份不可變預留，以合法狀態轉移控制一次性釋放。來源 URL 與 cancellation、取消、release、預留等關鍵字對照 blog/research/queue，沒有相同核心稿件。

前篇只加必要的續篇導覽，保留原 publishDate 與既有排序，不用導覽變更刷新 updatedDate。

## 一手來源與段落對應

於 2026-10-15 查讀官方 MySQL 8.4 文件全文，由獨立來源查核及全文審閱交叉確認，非搜尋摘要。

- https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html ：FOR UPDATE 目前資料、排他鎖與交易釋放。對應先鎖定訂單與預留、等待後重新判斷；須在顯式交易中。
- https://dev.mysql.com/doc/refman/8.4/en/update.html ：條件更新、實際變更列數、表達式。對應三個更新片段。
- https://dev.mysql.com/doc/c-api/8.4/en/mysql-affected-rows.html ：預設 changed rows 與 CLIENT_FOUND_ROWS 差異。本文要求確認 driver 回傳契約；狀態 held→released 必有變更，正數數量避免零值 no-op。不是聲稱所有語言 driver 欄位相同。
- https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html ：CHECK 的 TRUE／UNKNOWN 可通過，需另配 NOT NULL。對應數量資料契約，不聲稱 CHECK 能驗證跨表總和。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html ：索引掃描及不同語句的鎖定。對應主鍵、唯一索引與鎖範圍。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html ：deadlock 整筆回滾、預設 lock timeout 只回滾當前敘述。對應補庫存逾時後整筆 ROLLBACK 的應用策略。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html ：一致性快照可見性，不能用舊快照判讀目前取消結果。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlocks-handling.html ：短交易、固定操作順序、索引與重試；不宣稱整體系統不再死結。
- https://dev.mysql.com/doc/refman/8.4/en/commit.html 與 https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html ：共同提交、鎖定讀與快照差異，作為設計交叉查核。

應用契約（created+held、cancelled+released、200回覆）、未知 COMMIT 恢復、資料對帳、排除付款出貨均是案例設計推論，不冒稱 MySQL 文件替業務定義狀態機。依賴單一權威主庫及所有入口遵守共同交易；複寫故障切換未在此驗證。

## 數字與驗證限制

虛構起始 available=8、reserved=2；取消後10/0，另一新訂單預留3後7/3。20次/秒×0.04秒=0.8平均連線，20次/秒×0.5秒=10平均連線。後者為總持有時間（含等待），不是只計等待。所有數字為教學假設，未做 MySQL、併發或效能實測。SQL 有命名參數且省略 adapter，明標設計片段；驗收清單是待執行計畫。

獨立實稿審閱確認授權、不可變數量、異常零列、共同交易、未知提交及練習均一致；已修正平均等待措辭為平均持有連線時間。

## Cover Direction 與視覺

實際檢視第3篇木櫃/正面偏側/胡桃木黃銅/低側光，以及第4篇玻璃收據箱/斜俯視/珊瑚青綠/柔光。第5篇採雙色版畫/側面機構/靛藍赭黃奶油紙/均勻印刷光；媒材、構圖、色盤均不同，只延續16:9。

正式內建 imagegen 一次生成，原 PNG 1672×941，輸出本地1600×900 WebP。Prompt：original editorial wide 16:9 two-color screenprint/linocut; ochre token, one-way turnstile and deep indigo inventory tray; cream textured paper; side elevation; central mechanism; no text, numerals, logos, humans, wood cabinet, glass safe or receipt. 成品是象徵性的籌碼與閘門，不當成數量或流程教學證據。已目視完整圖與320×180卡片，無不當字樣，焦點清楚；alt 按實際多位置籌碼描述，不宣稱畫中只有一枚。

OrderCancellationDiagram 為原生 SVG 雙版面，桌面960×580、窄版288×774；含 title/desc、前綴ID，全部色彩引用 dg token。圖解抽出後按實際主題token渲染深淺四版目視，作為320px視窗留白後的窄圖驗收。完整頁本機 Astro dev 在此環境於 ready 前退出，雲端瀏覽器 localhost 回 ERR_CONNECTION_REFUSED；不冒稱完成本機實頁目視。發布後仍需檢查正式頁與圖像。

## 工程環境

助手雲端獨立工作區；環境目錄無 saved coding environment，Mac離線，未使用使用者電腦。Node24.19.0，專案pnpm12.1.0，frozen install成功。沒有改站台設定、套件版本、測試或排序邏輯。必要檢查針對最終內容執行；發布依既有main部署並另驗正式文章、封面、列表、搜尋與系列。
