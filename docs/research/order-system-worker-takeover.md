# 系統設計每日實戰 10：退款工作的接管與舊世代寫回

## 範圍與去重

2026-10-20 Asia/Taipei；起始 main fde7dfcaa70f2ef447d8a5215bc3b5691807b0dd。完整系列1–9，當日無既有稿或未完提交，open PR空。搜尋blog/research/article-queue的租約、fencing、attempt、領取、接管與來源URL；#7明確保留此缺口，#9處理共用外呼額度，本篇處理接管後寫回資格。影片設計已有attempt fencing，正文互鏈並說明退款不可逆副作用的差異。只新增本文、封面、圖解與本查核檔。

已讀AGENTS、content-guide、schema、部署workflow、diagram-guide、copywriting與humanize-writing及繁中規則。Trail命令不存在，cache INDEX不存在，改直接搜尋。沒有更動設定或其他文章。

## 一手全文與證據

2026-10-20 查核官方全文與具體章節：

- https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html ：17.7.2.4、Locking Read Examples、NOWAIT/SKIP LOCKED；FOR UPDATE最新資料與排他列鎖、交易結束釋放、官方計數器遞增範例。不能把SKIP LOCKED當公平或完整快照。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html ：REPEATABLE READ／READ COMMITTED及UPDATE競爭示例；完成與接管序列化為本文設計推論，不是官方退款配方。
- https://dev.mysql.com/doc/refman/8.4/en/update.html 與 https://dev.mysql.com/doc/c-api/8.4/en/mysql-affected-rows.html ：changed rows與CLIENT_FOUND_ROWS的matched差異。本文匹配時必定running→succeeded，不依賴同值更新；零筆不等於外部失敗。
- https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_now ：NOW為statement開始時間，依session時區；本文要求主庫UTC，時間只定義接管資格，不假裝精密commit-time fence。
- https://aws.amazon.com/builders-library/leader-election-in-distributed-systems/ 轉到 https://builder.aws.com/content/3Ev0vH0hfkcUizISUWYTvHibtcp/leader-election-in-distributed-systems ：How Amazon elects a leader、What happens when the leader fails、Best practices。check後GC pause、舊leader可能完成未回報；不宣稱AWS背書本文DB wall-clock租約。
- https://docs.stripe.com/api/idempotent_requests ：區分API v1/v2；v1開始執行後保存首回應含500、同參數、至少24h後可能清除，清除後重用可能新請求。正文只摘要保存邊界，不把虛構供應商當Stripe。
- https://docs.stripe.com/error-low-level ：Network errors、Server errors、POST requests、Sending idempotency keys；跨restart需持久化key，未知結果不能窗口外盲重試。
- https://docs.stripe.com/api/refunds/list 與 https://docs.stripe.com/api/refunds/object ：退款查詢能力與多種狀態。正文未虛構按idempotency key直接查詢；收到受理不當成退款完成。

## 設計邊界與審讀

lease_until只表示可競爭接管，成功提交attempt遞增才撤換本地寫權。attempt單調不重用，固定operation_key不隨世代變；所有完成、錯誤、重排、轉人工均檢state/attempt。接管先核對；未知且無可靠核對／有效冪等則停止自動重送。舊回覆可作去重觀察保存，不授權舊worker改終局。領取commit不明時不外呼，也不靠猜測attempt認領。完成commit不明查回終局；本地退款紀錄與工作完成同交易同連線。單派送出口與前篇額度維持。

30s租約、5s掃描、3s本地外呼均教學假設，30–35s只在正常排程/DB且忽略鎖等待的模型內代表接管開始；不是結案承諾。SQL為未執行設計片段，沒有MySQL、金流、競爭測試或壓測通過宣稱。練習與參考分開。整篇已經全文審讀；題句依審讀改為「退款工作已被接手，舊 worker 還能把結果寫回嗎？」。

## 封面與圖解

檢視最近#8藍印章/杏橙拓印與#9金屬閘門/酒紅玻璃球寫實斜視。新封面為帳冊與兩把鑰匙、gouache剪紙拼貼、俯視平面、淡紫青綠玫瑰、柔光；媒材/構圖/配色至少三項不同，只保持16:9。

正式內建imagegen原創生成1672×941 PNG，轉1600×900 WebP quality88，320×180卡片；全尺寸與卡片已目視，主體清楚無不預期文字或標誌。Prompt：original editorial cover, ivory paper ledger with fitted oval key slot and turquoise key, obsolete pale rose key separate, different teeth; gouache/cut-paper collage, overhead flat-lay, lilac/ivory/turquoise/rose, diffuse daylight, crop-safe central objects, no text/numbers/logos/UI/arrows. 原圖保留於工作區，成品封面存repo。

RefundTakeoverDiagram原生SVG960×620＋窄版HTML卡片，四個時間步驟，無Mermaid；title/desc、dg色彩token、48rem互斥。明確畫「期限可接管」與「B提交8才換權」；反向順序與遠端邊界在caption/正文保留。

## 工程驗收

本次使用雲端獨立 checkout。Node24.19.0、隔離Corepack cache的pnpm12.1.0；frozen-lockfile install通過。執行命令停optionaltelemetry，不改repo設定。Astro dev回報Dev server process exited before becoming ready，localhost:4360連線拒絕；未繞限制，桌機/320px深淺色實頁預覽未完成，依使用者預覽例外續行。封面檢視不能替代實頁預覽。

最終格式、內容policy、check、test、build及RSS/sitemap/Pagefind/series產物檢查，以本次執行紀錄確認；正式站須等精確main提交的部署完成後另核。

## 2026-10-20 敘事修訂

以作者提供的完整改稿為底稿，恢復 Socket Timeout、catch、A／B 持有 attempt 7／8 的提交順序，以及讀者對續約與長交易的疑問。保留原 URL、publishDate、封面與系列第 10 篇位置，更新 updatedDate。這是既有文章修訂，不新增文章。

技術校訂：全文統一退款用語；不同冪等鍵只表示失去同鍵去重，是否退款兩次仍看供應商規則；UPDATE 零筆可能是換代或先前提交已成功，不能直接判定處理權旁落。租約只開放接管，接管 COMMIT 才換代；NOW() 是 statement 起始時間，主庫時鐘跳動的影響沒有「最多幾秒」保證。未知退款在「沒有可靠核對，也沒有有效冪等保證」時停止自動重送；可靠核對證明未發生且原請求不會稍後生效的後續流程，仍須依供應商契約與原業務授權判定。未新增 API 閘道架構。舊回執可去重留存，不授予舊 Worker 修改 Job 的權限。

重新核對 MySQL 8.4 Locking Reads、UPDATE、Date and Time Functions 的 NOW 章節、AWS Leader Election 及 Stripe API v1 Idempotent Requests。官方連結保留於正文。以隔離測試資料推進 lease_until 的 Pause／Resume 計畫取代籠統「快轉時間」，並明寫 A、B 的 COMMIT 次序。SQL 競爭測試、真實退款、壓測仍未執行；此限制集中呈現於正文備註。

本輪從最新 main f57c7b5 的獨立雲端 checkout 開始；Trail 命令與 cache 皆不可用，使用直接檔案檢視。重新讀取 AGENTS、內容指南、schema、部署 workflow、圖解指南與相關寫作 skills。使用 Node 24.19.0、pnpm 12.1.0 執行 frozen-lockfile 安裝成功。其餘發布 gates 待最終整合後執行，不以原發布紀錄代替。

本輪 `pnpm dev --host 0.0.0.0 --port 4367` 回報 `Dev server process exited before becoming ready`，localhost:4367 連線拒絕。未繞過環境限制，桌面與 320 px 的深淺色實頁預覽仍未完成，依既有預覽例外繼續；其餘發布 gates 不豁免。
