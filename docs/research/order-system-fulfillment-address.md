# 系統設計每日實戰 13：配送地址的凍結點

## 去重與範圍

2026-10-23 Asia/Taipei，獨立 checkout 起點 main b789f557b240110695d95932ce3cf73371a1477a。最新 AGENTS、content-guide、schema、deploy workflow、diagram-guide、carlstack-copywriting、humanize-writing 及繁中／敘事規則已讀。Trail command 不存在，cache 亦不存在，依 fallback 直接查檔。沒有修改 skills、設定、共用程式或測試。

審讀第 1–12 課及研究紀錄，系列連續且正式，沒有 Oct23 文章或未完成本系列稿。queue 僅多活及共識題，四份 draft 為其他 Prompt 系列。以地址、shipping_address、address、履約快照、派工、出貨凍結搜尋 blog、research 及 queue；既有 DDD 文章談收件資料邊界，未處理本次地址修改與派工截止競爭。主題新增為不可變交付快照的凍結時點，不重寫收據、outbox 重試或 worker 接管演算法。

本次沒有外部貼文主來源。官方 URL 保留原始精確路徑；MySQL 章節 ID、AWS transactional-outbox stable slug 皆與既有來源比較。同一官方來源可用來支持新的具體決策，不另作來源摘要。讀者練習進度未知，不推定已完成。

## 官方來源查核（2026-10-23）

- Oracle MySQL 8.4 §17.7.2.4：https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html 。閱讀正文與鎖定範例，確認明確交易、FOR UPDATE 最新可用資料及提交／回滾釋放。以共同訂單主鍵鎖協調兩條路，沒有聲稱列鎖會阻擋一般快照讀。
- Oracle MySQL 8.4 §17.7.2.2：https://dev.mysql.com/doc/refman/8.4/en/innodb-autocommit-commit-rollback.html 。閱讀正文及 DML 交易範例，確認預設 autocommit 與多敘述交易；業務欄位共同提交為案例設計。
- Oracle MySQL 8.4 §17.20.5：https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html 。全文確認 deadlock 回滾全交易，lock timeout 預設只回滾敘述。應用額外清理整筆，與未知 COMMIT 區分。
- AWS Prescriptive Guidance：https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html 。閱讀意圖、適用性、問題、關聯式 outbox 及範例；採用業務變更和待送紀錄共同交易、提交後交付、接收端去重。未採用其 FIFO 文字作遠端 exactly-once 保證，未執行 AWS 範例。

另查 RFC9110 If-Match 原始章節，但為避免擴大本課深度，正式稿只用應用層 expected_revision，沒有宣稱提供 HTTP ETag 完整實作。

## 設計與審閱

模組化單體、單主庫、單倉單包裹，從 paid 訂單開始，只接受同配送區域且不改運費的完整收件資料。地址簿、可修改訂單地址、不可變派工快照分開。改址收據摘要含預期版本與正規化地址；共同訂單列鎖阻止派工交錯，expected_revision 阻擋舊頁覆寫。派工把完整地址、來源版本、品項、唯一 dispatch_id、交付待辦及 fulfilling 共同提交，首版 UNIQUE(order_id)。

fulfilling 明確只代表本地指令定案，沒有冒充倉庫受理或寄出。外部呼叫在鎖外，重送使用相同 ID／快照；遠端不支援去重則未知結果查詢／人工核對，不盲目重建。截止後更址需撤回或替換確認，不刪待辦／重設 paid 當成功。parent 全文審閱通過，補第9、10課各自精確內鏈。

每天10000份×1KiB約9.8MiB／日只估地址快照；不含品項索引備份。p95 100ms 是待驗預算。SQL 明示未執行，沒有真實 DB、物流整合或壓測成果。

humanize checker 7 hits 已逐項審視：兩個具體提問冒號、四個來源標籤冒號為合理用法；「資料異常」描述狀態與快照不一致，非拋出程式例外，保留。

## Cover Direction

目視最近第11、12課。11：缺槽提盤、3D陶瓷、等角、杏橙鈷藍、硬側光。12：包裹價格封蠟、linocut、低角度正面、petrol珊瑚紅、清楚輪廓光。13：黃銅壓印機固定房屋卡片、水彩與色鉛筆、俯視斜向、米白靛藍赭黃、漫射晨光；比喻媒材構圖色盤光線均有區分，只保留16:9。

正式 imagegen 工具生成原創封面1張，原PNG保留於 ../generated_images/exec-148a5643-56c7-406e-a4be-709fb835edca.png。sharp轉1600×900 WebP quality88至src/assets/covers/order-system-fulfillment-address.webp，已目視原圖與320×180卡片，房屋與壓印機可辨、無文字logo，alt符合像素。

Prompt：stylized-concept original 16:9 editorial cover, brass letterpress lowering over cream shipping card with simple blue house pictogram, second blank loose card, tactile watercolor and colored-pencil on ivory paper, overhead diagonal, warm ivory/indigo/ochre, diffuse morning wash, crop-safe at320px, no words letters numbers logo wax seal hourglass tray lock key UI arrow people watermark。

## 驗收

Node24.19.0；預設pnpm11不符repo要求，未放寬engine，使用隔離工具目錄安裝pnpm12.1.0。pnpm install --frozen-lockfile成功，未改lockfile，使用可寫隔離store／XDG目錄。

FulfillmentAddressDiagram採960×600 SVG三張全幅獨立卡片，窄版HTML卡片、48rem互斥切換，dg中性色token、title／desc及前綴ID。實際元件SVG與CSS以sharp代入站內淺深token渲染，已目視兩版，文字14–19px，無重疊截斷。320px卡片版仍須實頁驗證，不以桌面縮圖冒充。

Astro dev先遇預設設定目錄不可寫，改用工作區內XDG目錄後，仍在ready前退出：Dev server process exited before becoming ready。cloud browser嘗試localhost:4321被connection refused；沒有另改旗標或伺服器繞過。本地完整實頁與320px窄版深淺色未驗，依既有環境預覽例外續作發布，正式站另行驗收。雙版互斥、token與文字折行有靜態檢查，沒有把桌面SVG渲染冒稱手機通過。

已再次驗證本系列seriesOrder為1至13連續，Asia/Taipei2026-10-23恰一篇，draftfalse、featuredfalse、publishDate有正確+08:00 offset。git diff--check通過。首輪policy1篇通過、Astro diagnostics222檔案0errors／warnings／hints；最終build／tests與精確main部署及正式站驗收結果在交付訊息回報，不把本地build當成已上線。
