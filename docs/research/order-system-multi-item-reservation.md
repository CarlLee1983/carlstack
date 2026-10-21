# 系統設計每日實戰 11：多品項共同預留與缺貨收據

## 範圍與去重

2026-10-21 Asia/Taipei，從 main `6a1f85b42c715a887007cd382a965270473c3f32` 的獨立 worktree 開始。查核當日 blog、research、queue，沒有本系列新稿；系列已到第 10 課。起始 main 的 Deploy to Cloudflare Workers push run `39367436999` 為 success。GitHub CLI 未登入，改由 GitHub connector 讀 Actions REST 集合，沒有用僅列 PR 的 workflow wrapper 代替。

先查第 1–10 課及全站的多品項、購物車、死結、鎖定順序與 savepoint；第 4 課規定缺貨收據持久化，第 5 課提醒 timeout 與死結清理，但仍以單 SKU 為前提。第 6 課已涵蓋 durable inbox，故不另寫重複文章。第 10 課是退款工作的 lease／attempt 寫回資格，本篇不重講。新決策是單 SKU 擴為最多 20 SKU 後，如何在整單缺貨拒絕時保存終局收據、不留下部分預留。與 Shopify 單元池復盤的資料模型和讀者收穫不同，正文互鏈相關既有文，不改其內容。

已讀 AGENTS、content-guide、content schema、Astro config、deploy／CI workflow、diagram-guide、carlstack-copywriting、humanize-writing 與繁中規則，以及適用的 imagegen skill。Trail command 不存在、cache 不存在，依 fallback 直接檢視檔案。未修改共用架構、設定或測試。

## 2026-10-21 一手查核

閱讀下列 MySQL 8.4 官方章節正文，包含範例與限制；查核範圍不是整本手冊：

- https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html ：17.7.2.4 全文與 Locking Read Examples、NOWAIT／SKIP LOCKED。FOR UPDATE 在明確交易內取得排他鎖、讀取最新可用資料、提交或回滾釋放。SKIP LOCKED 略過忙碌列，不能將缺少結果解讀為缺貨。本例逐筆主鍵查詢順序是應用設計，不宣稱 IN 參數順序控制取鎖。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlocks-handling.html ：17.7.5.3 全文。短交易、固定操作順序、索引、死結診斷與整筆重試。本文只解開兩張購物車反向取鎖的具體交錯，不保證全部唯一鍵、外鍵與其他入口均無死結。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html ：17.20.5 全文。Deadlock 整筆 rollback、預設 lock wait timeout 僅 rollback statement、單敘述 rollback 不釋放鎖。本文自行選定所有此類錯誤都清理整筆交易，不把這項應用政策冒稱成 MySQL 的預設。
- https://dev.mysql.com/doc/refman/8.4/en/savepoint.html ：15.3.4 全文。ROLLBACK TO SAVEPOINT 不結束交易，通常不釋放其後記憶體列鎖（新插入列有例外），COMMIT／完整 ROLLBACK 移除 savepoint。正文替代方案要求收據先插入、savepoint 置於第一項業務副作用之前，不把 deadlock 當成可返回 savepoint 的普通缺貨。

本文沒有引用官方效能數據。20 SKU 上限、數量案例、最多三次嘗試與 1／5 毫秒 RTT 全為教學假設；20／100 毫秒僅串行 20 次鎖定讀的網路估算，不是整單延遲或壓測結果。

## 設計審讀邊界

單倉、單幣別、既有庫存列、不跨分片；相同 SKU 合併需求、固定完整主鍵比較、摘要納入正規化版本。先唯一收據、再逐筆鎖定全部並讀數量，全部足夠才有庫存寫入。正常缺貨只提交收據；缺失庫存列或驗過後 UPDATE 零列視為異常整筆 rollback。鎖等待 timeout 不等於缺貨；deadlock／timeout 重試都從唯一收據與新數量開始。COMMIT 結果不明沿用原鍵核對，不改鍵、不假定已 rollback。庫存預留綁定訂單明細；所有寫入共用 transaction context；沒有在 DB 交易中呼叫外部 API。

文章給出四種故障／競爭驗收與單獨練習答案。SQL 只是設計片段，沒有執行真實資料庫、金流或壓測，不以站台 test suite 代替這些證據。

## 封面與圖解

檢視相鄰第 9、10 課封面。第 10 課是帳冊／鑰匙、剪紙與 gouache、俯視、淡紫青綠玫瑰、柔光；第 9 課是金屬閘門與酒紅玻璃球、暗色寫實斜視。本篇選陶瓷整組提盤、一格空缺、3D clay、斜向等角、杏橙鈷藍象牙白芥黃、側光長陰影。與第 10 課的比喻、媒材、構圖、色盤和光線不同，只沿用橫向比例。

內建 imagegen 原創 1672 × 941 PNG，保留原圖，轉為 repository 的 1600 × 900 WebP（quality 88）。全尺寸與 320 × 180 卡片目視確認主體清楚、空槽可辨、無文字／標誌。

生成 prompt：Use case stylized-concept; original editorial engineering cover; one deep cobalt ceramic tray with three fitted recesses, ivory cube and mustard cylinder in two recesses, third visibly empty; one continuous carrying handle spans the whole tray, representing a complete kit; tactile 3D clay/ceramic sculpture, isometric diagonal centered composition, warm apricot background, side morning light and long shadows, wide 16:9, crop-safe at 320px; no people, text, letters, numbers, logos, UI, arrows, receipts, keys or locks.

MultiItemReservationDiagram 使用原生 SVG 960 × 600，桌面流程＋窄版 HTML 說明卡；title／desc、id 前綴、dg tokens、48rem 切換、強調色深色版本。缺貨／足夠為互斥分支，caption 明確排除 lock timeout。未新增 Mermaid。

## 驗收紀錄

Node 24.19.0、pnpm 12.1.0；`pnpm install --frozen-lockfile` 使用既有隔離 store 成功。工作區沒有使用桌面環境。Astro 以可寫 XDG config／cache 與停用 optional telemetry 的環境變數執行，不修改 repository gate。

`pnpm dev --host 0.0.0.0 --port 4371` 回報 `Dev server process exited before becoming ready`，127.0.0.1:4371 連線拒絕。沒有另架服務繞過限制。桌面／320 px、深淺色實頁及 SVG 實際呈現未完成，依使用者既有預覽例外不阻擋發布；封面目視不冒充實頁驗收。其餘格式、內容 policy、check、test、production build 與產物檢查必須對最後檔案執行，部署另核精確 main commit。

初輪 policy 通過 1 篇文章；Astro check 219 檔案為 0 errors／warnings／hints，test 109／109 通過，完整 build 產生 Pagefind 667 頁。檢查產物確認正式 canonical、單一 h1、封面五種輸出、RSS、Sitemap、blog 列表、第 11 課系列頁與精確文章 Pagefind fragment。圖解另外逐項核對 CSS variables，使用 tokens.css 實有的 space-xl／md／xs。發布前整合最新 main 後仍需重跑最後 gates；上述不是正式站上線宣告。
