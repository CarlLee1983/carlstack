# 訂單列表的品項數查詢查核

2026-11-16（Asia/Taipei），系統設計每日實戰第 33 課。

## 範圍與去重

最新 main 基線 d1da8ec4bf35801a5fbef8ef63b3ecd70b7d1206，GitHub open PR 為空；main 正式部署 43661788165 已成功，SHA 相同。讀取當日文章、draft、queue、research 與系列，未見 11/16 系列文章。以 line_count、withCount、N+1、品項數、來源 URL 搜尋。既有 GraphQL／REST 文提及一般 N+1，但未處理訂單列表只取品項數的聚合決策；前課為排序欄位，本文不重寫分頁或排序。

已讀 AGENTS、content-guide、schema、CI／部署 workflow、copywriting、humanize-writing 與繁體參考規則。Trail 命令不可用，改讀原檔。遵守使用者最近要求，主標與小標直接說明內容，不套用結論口號。獨立工作區；與 GitHub 週報協調先後推送，保留彼此修改。

## 來源與論點

當日讀取一手原文，不以搜尋摘要代替。

- https://laravel.com/framework/docs/13.x/eloquent-relationships#counting-related-models ：withCount 不必載入關聯模型；eager loading 避免逐筆 lazy loading。12.x 頁提示舊版，改讀 13.x。目前官方文件路徑含 framework。
- https://dev.mysql.com/doc/refman/8.4/en/aggregate-functions.html#function_count ：COUNT(*) 計算列，COUNT(column) 忽略 NULL。對應品項列數與可空欄位的差別。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html ：REPEATABLE READ 同一交易的一致性讀取共用首次快照；READ COMMITTED 每次重新取得。對應可修改明細時的替代方案。
- https://dev.mysql.com/doc/refman/8.4/en/explain.html#explain-analyze ：EXPLAIN ANALYZE 實際執行語句，回報 iterator 時間、列數與 loops。只建議在受控環境執行。

每頁 50、80 requests/s、8 列明細、600 bytes／40 bytes、p95 300ms 都是教學假設。51×80=4080，2×80=160；50×8×600=240000，50×40=2000。不把查詢數差異當效能倍率。明細固定、至少一列、退款不刪除原始明細是本文明示的業務契約，不聲稱通用規則。

SQL 為未在 MySQL／Laravel 執行的設計片段；文章明標未實測，不宣稱壓測或 SQL 整合通過。重點為授權頁 ID 批次彙總、參數綁定、按 ID 組回與失敗不偽裝零值。沒有新增可執行應用程式。

## 編輯與圖片

人工檢查用詞、句意與練習答案。修正原小標數量與例子不一致；中文檢查器的 COUNT 冒號為技術語意對照，保留。主文使用短段落，不設 Markdown 表格。

封面矩陣：前課為深灰綠色玻璃／金屬斜俯視；前兩課為暖白紙雕；本篇改成淡藍與土橘、俯視粉彩厚塗、陶碗與米白珠子，媒材／構圖／色調不同。內建正式 image_gen 工具生成，未用第三方素材。

Prompt：Original editorial cover about counting order line items in one batch; wide top-down gouache on pale powder-blue paper; four terracotta bowls with differing numbers of ivory wooden beads beside one slim counting ledger with four abstract strokes; no letters/numbers; matte pigment, soft afternoon light, restrained rust orange and blue; central composition; no logos, watermark, UI, arrows, glass, metal or 3D render.

輸出 src/assets/covers/order-system-item-count.webp，1600×900，180586 bytes。已目視全圖、320×200 卡片及 160×160 方形裁切；一般卡片碗與紀錄簿完整，方形左側略裁但四組珠子與紀錄簿仍可辨。coverAlt 符合實圖。本文以 SQL 說明，未新增圖解。

## 驗收紀錄

Node 24.22.1、pnpm 12.1.0。已執行鎖檔安裝；最終 format、content:policy -- HEAD、check（含 build 與 Pagefind）、test 與 build 以發布前工具紀錄為準。不削弱檢查，不改站台設定。

正常本機預覽嘗試 ASTRO_TELEMETRY_DISABLED=1 pnpm dev --host 0.0.0.0；於 ready 前退出，回報 Dev server process exited before becoming ready。桌機／窄版及深淺色實頁目視未完成；依使用者授權不另架伺服器繞過限制、不阻擋發布。封面本地目視另已完成。SQL 未實跑與未壓測的限制不因站台測試通過而改變。
