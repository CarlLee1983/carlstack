# 系統設計每日實戰 06：取消後的晚到收款

## 核心決策與查重

2026-10-16 於 main dad2332 查讀 AGENTS.md、content-guide、content.config、diagram-guide、CI/deploy workflows 及 copywriting/humanize-writing skills（含 zh-tw 禁用句式）。open PR 查詢為空。blog、research、queue 以取消、付款、refund、payment、Stripe URL 檢索；前五篇僅定義未付款取消，第5篇將付款競爭列為後續界線。既有支付路由、對帳閱讀路徑及 webhook 架構沒有本篇的取消終局政策。沿用系列第6篇，不因日期增加難度，也不重複昨日庫存 SQL。

主張：取消已提交便不復活訂單；金流收款事實仍須獨立保存，必要退款待辦與該事實共同提交。這是虛構商店政策，不宣稱供應商採此履約規則。標題「入帳」在正文限定為可對帳收款紀錄，不冒充完整會計帳本。

敘事從 A 取消、商品賣給 B、付款晚到展開，經過單一 status 不足、兩種本地交錯、退款逾時反例，最後回到 A 與 B 的結果。編輯確認起承轉合與明確結論；刪除多餘結構預告、拗口擬人詞，不捏造第一人稱實作經驗。

## 一手來源及對應

於 2026-10-16 讀取原始頁面相關完整段落，而非只用搜尋摘要：

- https://docs.stripe.com/webhooks#event-delivery-behaviors ：事件可能重送、不保證送達順序；對應通知不能代表遠端時序。
- https://docs.stripe.com/webhooks#handle-duplicate-events ：事件 ID 與物件 ID / event type 的不同層次；內部收款唯一鍵是本案例設計。
- https://docs.stripe.com/webhooks#verify-events-are-sent-from-stripe ：簽章與原始 body 驗證。金額、幣別、環境、商戶與既有付款綁定比對屬本案例前提。
- https://docs.stripe.com/refunds#issue-refunds ：成功付款可以退款，requires_capture 仍屬尚未請款、應取消 PaymentIntent；對應成功收款與授權區別。
- https://docs.stripe.com/refunds#handle-failed-refunds ：退款可能 pending、failed，不能只因取得物件就宣稱完成。
- https://docs.stripe.com/api/idempotent_requests ：原文完整24行已讀；API v1 保存首次執行結果（含500），至少24小時後可清除鍵，清除後重用會新建請求，同鍵參數需一致。本文明指 API v1 的期限，不推及所有 API 版本或供應商。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html ：顯式交易 FOR UPDATE、最新可用資料、排他鎖及 commit/rollback 釋放；用以保護本地訂單決定，不聲稱可鎖遠端付款。

## 假設與限制

單倉、每單一種商品、一筆全額付款、未出貨；測試正式資料隔離。取消先本地提交後退款，付款處理先提交後拒絕未付款取消，已付款取消流程另訂。通知時間不等於遠端付款時間。供應商/帳號/付款ID唯一識別；不同未綁定付款不當成重複，而保留核對。原始收件先持久保存，處理交易回滾後仍在，錯誤標記另存。全部寫入入口須遵守共同訂單鎖與同交易寫入。待辦與收款唯一鍵沒有聲稱遠端 exactly-once。

2筆/秒×600秒＝1200筆待辦，僅教學估算。概念流程未作 MySQL、金流 sandbox、併發或壓測；最後驗收案例明標待執行。沒有聲稱供應商費率、退款到帳時限或法律政策。

## 封面與圖解

實際目視前第4篇珊瑚青綠玻璃箱斜俯視、第5篇靛藍赭黃版畫側面機構。本篇採擬真靜物、紫陶瓷/銀金屬/灰、斜俯視硬側光；與第5篇媒材/構圖/色盤/光線均不同。只延續16:9。正式 image_gen 生成原創圖，原PNG1672×941，輸出1600×900 WebP。已檢視全尺寸與320×180卡片，物件可辨，無字樣、品牌、水印。

Prompt: Original editorial wide 16:9 still-life photograph; closed matte plum ceramic parcel and separate shallow brushed-silver dish catching one brass coin, blank receipt; pale cool-gray backdrop, overhead-oblique view, hard morning side light, clean shadows. Central70% crop-safe. No words, numerals, logos, arrows, people, glass safes or turnstiles. Editorial metaphor, not technical diagram.

LatePaymentDiagram 為原生SVG960×580，窄版HTML卡片，title/desc、前綴ID、dg色彩token。只展示兩種提交順序，不畫完整金流平台。

## 環境與驗收記錄

雲端獨立 /tmp 工作區；環境查核使用者Mac offline，saved coding environments空。orbit工程技能在本輪無可用package，未冒稱讀取；以repo規範與既有權限完成內容工作。Node24.19.0、pnpm12.1.0、frozen install成功。預設Astro設定路徑不存在，改用本工作區暫存XDG_CONFIG_HOME後dev仍在ready前退出；雲端瀏覽器localhost拒絕連線。本機整頁預覽未完成，依使用者既有CarlStack授權不以此單獨阻擋發布，後續正式頁仍需驗證。沒有改repo設定或測試。
