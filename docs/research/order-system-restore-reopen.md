# 系統設計每日實戰 17：還原後的重新接單條件

## 去重與範圍

2026-10-27 Asia/Taipei，獨立 checkout main 66cfc32089ace3e747e332ba956c932de579aa7a。檢查 AGENTS、content-guide、schema、deploy workflow、testing、diagram-guide、queue、研究紀錄與系列。Trail CLI 與 .trail/cache 不存在，使用檔案搜尋。每日課程 1–16 連續，當日沒有本系列新文；main 新增的七篇「後端工程基礎圖解」另計，不重寫其快取、佇列與部署概念。可見 refs/近期 commit 沒有相同未完成稿。父工作確認前項 exact main 部署與正式七篇驗收完成後才釋出寫入權。

全站既有 sqlite-backup-restore-rto-rpo-drill.md 已討論並附腳本記錄本機恢復量測。新篇聚焦資料庫恢復點與外部金流結果分歧時，何時允許接單；內鏈舊文，不重做量測或聲稱重新執行其腳本。既有 idempotency-receipt、late-payment、worker-takeover 各談正常運行下的重試/晚到/接手，本篇處理收據也被還原而消失的事故邊界。queue 的多活/共識仍是不同題，不移動或新增重複待辦。

## 一手來源與段落對應

2026-10-27，由撰稿及獨立研究代理讀取官方原文相關段落。沒有以搜尋摘要當作全文。

- https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIT.html ：PITR 建立新 instance 且不改原 instance；available 後資料塊仍可背景從 S3 載入、效能未完全恢復。直接採該 PITR 文件第5–12行，不依 snapshot 文件推論。沒有把每五分鐘上傳 log 寫成 RPO 保證。
- https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_planning_for_recovery_objective_defined_recovery.html ：RTO/RPO 的定義與業務目標。60分鐘/5分鐘是教學提案，不是 AWS 建議數字。
- https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_planning_for_recovery_dr_tested.html ：指定時間/狀態的演練與恢復端容量驗證。
- https://docs.stripe.com/api/idempotent_requests ：明確限定 API v1，至少24小時後可清除 key，清除後重用形成新請求。沒有套用至 v2。
- https://docs.stripe.com/api/payment_intents/retrieve ：以既有 ID 取回 PaymentIntent 詳情；訂單關聯/金額/幣別核對及本地修復規則是案例設計。
- https://docs.stripe.com/webhooks#event-delivery-behaviors ：亂序、重複、失敗重試。已成功回覆後 DB 倒退不會自行觸發重送是依機制的工程判斷。通知需驗證真實來源，正式安全流程由既有介接負責，本篇不另提供省略驗簽的程式片段。
- https://docs.stripe.com/api/events/list ：可列最近30天事件，created過濾、分頁；補查不應只挑 delivery_success=false，否則漏掉舊系統已成功收到而還原後消失的事件。query展開 URL 在瀏覽工具回 internal error，基本頁及研究代理已讀到所用參數；不據此宣稱實際呼叫 API。

所有事故、每分鐘20付款、5分鐘100候選、60分鐘RTO、5+25+30分鐘分配、15分鐘/每筆30秒=30筆人工容量均為教學假設。沒有執行 MySQL/RDS/Stripe 故障、負載或還原測試。演練清單是待執行驗證方法。全域停寫選擇及停止規則是作者設計，不以來源當作唯一架構答案。

## 封面與圖解

相鄰16課：網版印刷、俯視木盤、淺藍/赭黃/鈷藍、均勻光。15課：紙雕、正面資料夾、深綠/珊瑚。17課選玻璃工作室攝影、三分之四不對稱近景、煙紫/淡紫/銅、側光，媒材/構圖/色盤至少三項不同。正式 built-in image_gen 一次生成1672×941 PNG，轉WebP quality86。原圖 ../generated_images/exec-257644db-dcb7-45b0-9583-6603a2569b35.png。完整與320×180卡片均已目視，銅幣、玻璃帳頁與橫桿可辨，無文字/品牌。alt按實圖。

Prompt: editorial 16:9 studio photograph of sandblasted glass ledger with two overlapping pages, separate copper coin, closed burgundy mechanical stop bar; smoky plum/lavender/copper, soft side lighting, centered safe crop; no text/logos/UI/arrows.

原生 SVG 是960×600獨立寬列卡，窄版另排HTML段落，全部中性色使用 dg tokens。完整SVG分別以淺/深tokens渲染後目視，標題、內文與框線清楚無重疊。此渲染不等於實頁四種組合驗收。

## 驗收紀錄

Node24.22.1、pnpm12.1.0；獨立 npm cache，pnpm install --frozen-lockfile 成功，未改 lockfile 或 engine。初次 Astro dev 已啟動指令，但雲端瀏覽器 http://localhost:4321/blog/order-system-restore-reopen/ 回 ERR_CONNECTION_REFUSED。本機實頁預覽桌機/320px深淺色尚未驗收，不繞過網路或程序限制；依既有預覽例外繼續。正式站部署後另驗文章、圖片、清單、搜尋與系列。

父對話已全文審閱通過；SQLite 既有實測敘述與 RDS PITR 的 available 邊界再核對原文。humanize checker 僅命中敘述型冒號，已改句號。最終技術 gates 與 exact commit 部署結果於交付記錄，不把內容設計當作已執行還原測試。

發布建置明確指定 SITE_URL=https://carlstack.gravito.dev；正式URL不採預設example。
