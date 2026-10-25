---
title: "訂單明細 API：如何限制顧客只能讀自己的訂單"
description: "登入成功後，訂單明細仍要檢查所有權。用可信的顧客身分限定 MySQL 查詢，對照集中 Policy 的取捨，再用跨帳號、快取與帳號切換案例驗收。"
publishDate: 2026-10-25T08:46:40+08:00
draft: false
featured: false
tags:
  - 系統設計
  - API 整合
  - 資安
series: 系統設計每日實戰
seriesOrder: 15
cover: ../../assets/covers/order-system-detail-authorization.webp
coverAlt: "一隻紙雕手拿著有珊瑚色圓片的米白卡，對應兩個深綠紙製資料夾中左側的圓形開口，右側則是方形開口，比喻訂單須符合顧客的存取範圍。"
---

假設顧客 A 已登入商店，把訂單明細網址裡的 ID 換成顧客 B 的合法 ID。API 找得到訂單，便把 B 的地址、電話和購買品項一起回傳。登入檢查正常，訂單也確實存在，少掉的是「A 能不能讀這張訂單」的判斷。

ID 可以來自一條誤貼的連結，不必靠猜。改用 UUID 會讓猜號更困難，拿到別人的連結後仍應被拒絕。[OWASP 的 IDOR 指南](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html#identifier-complexity)也把複雜識別值與存取檢查分開看待。

這是「系統設計每日實戰」第 15 課。前面的[改址流程](/blog/order-system-fulfillment-address/)已要求核對所有權，這次把這個前提補成明細 API 的具體契約。**從已驗證的登入身分取得顧客 ID，查詢時同時限定訂單 ID 與顧客 ID。**

> [!NOTE]
> 商店、流量與延遲預算都是教學假設。SQL 和流程是設計片段，尚未執行 MySQL、登入整合或跨帳號測試。官方文件查核日期為 2026-10-25，文末列出實作後應跑的驗收。

## 先限定為單店、本人查詢

沿用模組化單體與 MySQL 8.4 InnoDB 單一寫入主庫。每張訂單有一個建立後不可轉移的 `customer_id`。顧客只能讀自己的訂單，這條規則不隨付款或配送狀態改變。首版沒有訪客查單、分享連結、家庭共用帳號與客服代查。

`GET /orders/{order_id}` 需要滿足以下行為：

- 身分驗證失敗或 session 已失效，回覆未登入，不查訂單明細。
- 已登入且訂單屬於本人，回傳明細所需欄位。
- 訂單不存在或屬於別人，使用相同的 `404` 狀態與通用錯誤內容。
- 資料庫故障時回覆暫時無法查詢，不把錯誤當成找不到，更不能改走未限定顧客的查詢。

成功查詢的起始目標訂為 p95 小於 200 ms，從應用收到請求到回應準備完成，不含網際網路傳輸。跨帳號請求即使帶著有效的訂單 ID，也不能得到訂單欄位，這要逐例驗收。不能拿「大多數請求都沒有外洩」當作達標。

[OWASP API1:2023](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/)要求，接受物件識別值並對它操作的入口，都要檢查目前使用者是否有權執行該動作。能進入訂單 API，和能讀取某一張訂單，是兩次不同的判斷。

## `customer_id` 由登入系統提供

請求中的 `order_id` 只是要找的物件。顧客身分則由身分驗證層驗證 session 後提供，不能使用 query string、JSON body 或瀏覽器自行填入的 `X-Customer-Id`。客戶端把 `customer_id` 改成 B，不應改變這次請求代表誰。

假設登入帳號與顧客資料分成兩張表，應由伺服器查出它們的有效對應，不把帳號 ID 直接當顧客 ID。如果前方有可信代理傳遞身分，也需要先確認代理邊界與外部同名標頭如何移除，這不在首版的假設內。

在程式介面上，讓查詢用例接收驗證層建立的 `CustomerPrincipal` 和訂單 ID，比傳入兩個毫無區別的字串清楚。型別只是協助審查，呼叫端仍可能傳錯。應一路追到驗證 middleware，確認 principal 的值確實來自已驗證的身分，而不是把 request 欄位重新包裝。

[操作收據篇](/blog/order-system-idempotency-receipt/)的同鍵重放也適用這個原則。知道收據鍵或訂單 ID，不會取得新的存取權。

## 把所有權條件放進訂單查詢

最小方案是在訂單模組提供 `findDetailForCustomer(principal, orderId)`。顧客入口不取得全域的 `findById()` 再自行決定要不要檢查。下面是使用綁定參數的 SQL 設計片段，省略 adapter、完整 schema 與欄位型別：

```sql
SELECT id, status, currency, total_minor,
       recipient_name, recipient_phone, shipping_address
FROM orders
WHERE id = :order_id
  AND customer_id = :authenticated_customer_id;
```

`:authenticated_customer_id` 只能綁定 principal 裡的顧客 ID。查不到就回覆前述通用 `404`。查到後，才使用這筆已確認所有權的訂單 ID 取得品項，組成顧客用的明細 DTO。品項表的 `order_id` 應有明確關聯，不能另開一個只接受任意 `item_id` 就回傳內容的入口。

這份設計假設 `orders.id` 已是唯一主鍵。不要看到第二個條件，就直接斷言還得加一個複合索引。先用實際資料跑執行計畫及查詢量測，確認是否需要改索引。

DTO 明列允許回傳的欄位，不直接序列化整個 ORM model。顧客可能需要看自己的收件電話，但不需要付款供應商的內部回執、風險註記或客服備註。只回傳別人的訂單總額，仍然是越權。欄位過濾減少的是不必要的輸出，所有權檢查仍要在組成 DTO 前完成。

訂單所有人固定不變，讓這次查詢的規則很小。之後若開放轉移帳號或共用訂單，就要重訂查詢期間權限變動的語意，不能繼續假設讀到一次 `customer_id` 就永遠有效。

## 另一條可行路徑是集中 Policy

也可以先載入訂單，再交給集中 Policy 判斷 `view` 權限。當同一份規則要處理顧客、客服與其他角色時，Policy 能把動作與角色規則放在一起，不必散落在多支 controller。[Laravel 13 的授權文件](https://laravel.com/framework/docs/13.x/authorization#introduction)就區分了登入驗證與資源授權，並提供依模型組織的 Policy。

這個方案的代價是每個入口都得確實呼叫授權，還要把呼叫放在序列化、回傳、匯出或其他副作用之前。某支 controller 少呼叫一次，資料仍載得出來。首版只有本人明細查詢，因此選擇限定範圍的查詢介面，讓「只按 ID 找單」不成為顧客入口的預設用法。

兩種方案都能做對，也都需要測試。若採 Laravel Policy，文件中的 [`denyAsNotFound()`](https://laravel.com/framework/docs/13.x/authorization#customizing-the-http-response-status) 可以把拒絕映射成 `404`；它不會自動替所有 route 註冊並執行授權。不同訂單的存在與否也可能反映在耗時上，統一狀態碼和文案只減少直接透露的資訊，沒有消除所有側通道。

## 快取不能先把資料送出去

首版明細延續[讀取契約篇](/blog/order-system-cache-read-contract/)，直接讀主庫，不使用 Redis 明細快取。HTTP 回應採 `Cache-Control: private, no-store`，成功與拒絕回應都要檢查，避免反向代理另存一份依 URL 回傳的結果。

[RFC 9111 §5.2.2.5](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.5)規定 `no-store` 對符合規範的私有與共享 HTTP 快取施加保存及重用限制。這個標頭不會清空既存快取，也不會替應用的 Redis、前端狀態或錯誤 log 執行存取控制。若系統之前已快取過明細，需要另外停用或清除舊路徑，再驗證沒有繼續供應舊回應。

若將來確實需要 Redis，不能在 `cache.get(order_id)` 命中後直接 `return`。快取鍵至少要反映身分／授權範圍，回傳前仍須符合當次請求的授權規則。權限可能撤銷時，還要處理撤銷如何生效，不能只說 TTL 很短。

前端也要驗帳號切換。A 登出、B 登入後，先清掉 A 的明細狀態。A 登出前發出的請求若此時才回來，應依登入世代或請求取消機制丟棄，不能只比較訂單 revision。伺服器已經送到瀏覽器的資料，無法靠下一次 API 拒絕追回。

## 多讀主庫的成本先算清楚

假設尖峰觀察窗內有穩態平均 100 次明細請求／秒，每次累計持有資料庫連線平均 5 ms，平均連線占用約為 `100 × 0.005 = 0.5 條`。這是平均連線持有時間與到達率的估算，不是把 pool 設成一條的建議。登入查詢若另占連線，要算進總量；尖峰突增、慢查詢尾端與其他 API 也會競爭連線。

若每份成功回應平均 4 KiB，且這 100 次都是成功查詢，未壓縮的回應本體約為 `400 KiB／秒`。標頭、TLS、壓縮與重試尚未計入。這組假設足以提出量測問題，還不足以證明「不上 Redis 會撐不住」。

上線後量 p95、p99、連線等待與查詢耗時。只有明細流量造成可重現的瓶頸、且排除查詢與連線使用問題後，才評估快取。若產品新增客服代查、共享訂單或訪客查單，則先升級授權模型，分別定義動作、資料範圍、撤銷與稽核規則，不要在本人查詢裡加一個寬鬆的 `is_admin` 分支就上線。

## 驗收用兩個真實帳號交換訂單 ID

準備 A、B 兩個測試顧客，各自建立訂單。測試應走實際 HTTP、驗證 middleware 與資料存取層，不只測一個 `ownerId === customerId` 函式。

1. A 查自己的訂單，確認成功且欄位符合 DTO。B 也做一次。
2. A 拿 B 的有效訂單 ID 查詢，反向再測一次。兩次都應收到通用 `404`，回應本體、錯誤頁與診斷標頭都不能含對方訂單欄位。
3. A 保持原 session，只把 query、body 或自訂標頭的 `customer_id` 換成 B。結果仍然拒絕。
4. 用不存在的 ID 比較錯誤格式，再以過期 session 重試。確認身分驗證失敗不會退回匿名查單。
5. A 先成功查詢，接著 B 請求相同 URL，經過實際反向代理及曾啟用的快取路徑。不能拿到 A 的回應。
6. 模擬資料庫錯誤。確認沒有去掉顧客條件的 fallback，也沒有把堆疊、SQL 參數或訂單資料放進回應。
7. 暫停 A 的請求，在同一個瀏覽器完成登出及 B 登入，再放行 A 的舊回應。B 的頁面不得出現 A 的明細。

另檢查一般應用 log，只記錄必要的 request ID、內部帳號識別、動作與結果分類，不把 session token、地址、電話或完整 payload 寫進去。紀錄的保留期限和查閱權限也要有限制。跨帳號拒絕次數可協助偵測異常，卻不能單靠一次 `404` 判定使用者惡意。

### 練習

工程師把查詢改成 `WHERE id = :order_id AND customer_id = :request_customer_id`，前端會填入目前登入顧客的 ID。另一位工程師提議保留這段 SQL，只把訂單 ID 改成 UUID。這兩項修改能擋住已登入的 A 讀取 B 的訂單嗎？

### 參考思路

不能。A 可以把請求裡的 `request_customer_id` 和訂單 ID 一起換成 B 的值，兩個條件就都成立。UUID 也無法阻止持有有效連結的人提出請求。

修正時，把顧客條件綁定到驗證層提供的 principal，保留 A 的 session 再送出 B 的合法訂單 ID。這個跨帳號案例應成為固定回歸測試，再沿著成功回應往前追，確認途中沒有快取或序列化提早回傳。
