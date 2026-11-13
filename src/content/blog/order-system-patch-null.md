---
title: "訂單修改 API 的空值處理"
description: "更新訂單時，沒有傳欄位、傳 null 和傳空字串可能代表不同意圖。以客服備註設計部分更新契約，保留欄位存在資訊，並驗證 SDK、驗證器與資料庫之間的行為。"
publishDate: 2026-11-13T08:07:41+08:00
draft: false
featured: false
tags: [系統設計, API 整合]
series: 系統設計每日實戰
seriesOrder: 30
cover: ../../assets/covers/order-system-patch-null.webp
coverAlt: "深靛色背景上三塊陶瓷板分別保留淡色凸線、呈現空凹槽及嵌入綠色新線，表示保留、清空與替換三種更新意圖。"
---

假設客服只修改訂單上的禮物訊息，儲存後原本的內部備註卻消失了。前端沒有傳 `internal_note`，後端的 DTO 把缺少欄位補成 `null`，ORM 再把這個值寫回資料庫。每一層都接受了輸入，合起來卻執行了一次客服沒有要求的刪除。

這次要決定的是部分更新的欄位契約。對允許清空的文字欄位，採用「省略就保留、`null` 就清空、有效字串就替換」。欄位是否存在，必須一路保留到產生資料庫更新欄位的時候。

這是系統設計每日實戰第 30 課，沿用模組化單體與 MySQL。[備註同時編輯](/blog/order-system-note-concurrent-edit/)處理兩個人互相覆蓋，這次處理單一請求究竟要求改哪些欄位。兩種問題都需要測試。

> [!NOTE]
> 商店情境、流量、長度與驗收目標都是教學假設。來源於 2026 年 11 月 13 日查核。下方 Node.js 契約測試已執行；HTTP、SDK、ORM、資料庫交易及壓測尚未實測。

## 同一個欄位的三種請求

假設後台提供 `PATCH /orders/{id}/annotations`，使用文件明定的 `application/json` 格式，只能修改 `internal_note` 與 `gift_message`。兩者都是可清空文字，儲存時用 SQL `NULL` 表示沒有內容。

```json
{}
```

沒有傳入任何可修改欄位，保留現值。假設現有備註是「已確認自取」，結果仍相同。這個端點接受空物件作為無變更請求，不增加資料版本，也不新增修改事件。

```json
{ "internal_note": null }
```

明確清空內部備註，資料庫設為 `NULL`，回應仍包含 `internal_note: null`。這是應用程式自己定義的空值語意，不能只看到 HTTP 方法是 PATCH 就推定有這個效果。

```json
{ "internal_note": "改由本人領取" }
```

替換備註，禮物訊息保持原值。空字串與全空白字串在這個設計中回覆 422，畫面上的「清除」按鈕負責送 `null`。這樣只有一種正式清空表示，不在不同客戶端各自猜測空白文字的意思。

這份契約也要訂出拒絕條件。頂層陣列、數字與 `null` 不是合法的修改物件；未知欄位、超長文字或不符型別，一律拒絕整個請求。`status`、金額與收件地址不在此端點的允許清單，不能把任意 JSON 直接交給 ORM 批次賦值。

## 在輸入邊界保留欄位是否存在

[MDN 的 Object.hasOwn 文件](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn)說明，它會檢查物件自己的屬性，即使該屬性的值是 `null` 或 `undefined`。這裡需要的正是「有沒有傳」這個資訊。用 `value ?? defaultValue` 會把缺少值與 `null` 合併；用真假值判斷，也會把空字串混進來。

下方程式只建立允許修改的欄位集合，不修改原本物件。限制以 UTF-8 bytes 計算，單欄最多 2,000 bytes。這是傳輸與儲存預算，並不等於 2,000 個中文字。

```js
import assert from "node:assert/strict";

const fields = new Set(["internal_note", "gift_message"]);

function changesFromJson(raw) {
  const body = JSON.parse(raw);
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("expected object");
  }
  for (const key of Object.keys(body)) {
    if (!fields.has(key)) throw new Error("unknown field");
  }
  const changes = {};
  for (const key of fields) {
    if (!Object.hasOwn(body, key)) continue;
    const value = body[key];
    if (value !== null) {
      if (typeof value !== "string") throw new Error("expected string or null");
      if (value.trim().length === 0) throw new Error("empty text");
      if (Buffer.byteLength(value, "utf8") > 2000)
        throw new Error("text too long");
    }
    changes[key] = value;
  }
  return changes;
}

const original = Object.freeze({
  internal_note: "已確認自取",
  gift_message: "生日快樂",
});
const apply = (raw) => ({ ...original, ...changesFromJson(raw) });

assert.deepEqual(apply("{}"), original);
assert.deepEqual(apply('{"internal_note":null}'), {
  internal_note: null,
  gift_message: "生日快樂",
});
assert.equal(apply('{"internal_note":"本人領取"}').internal_note, "本人領取");
assert.equal(
  apply('{"gift_message":"謝謝"}').internal_note,
  original.internal_note,
);
for (const raw of [
  "null",
  "[]",
  "42",
  '{"status":"paid"}',
  '{"internal_note":""}',
  '{"internal_note":"   "}',
  '{"internal_note":false}',
  '{"internal_note":0}',
  JSON.stringify({ internal_note: "香".repeat(667) }),
  '{"internal_note":null,"gift_message":42}',
]) {
  assert.throws(() => apply(raw));
}
assert.deepEqual(
  changesFromJson(JSON.stringify({ internal_note: undefined })),
  {},
);
assert.deepEqual(changesFromJson(JSON.stringify({ internal_note: null })), {
  internal_note: null,
});
assert.equal(original.internal_note, "已確認自取");
console.log("PASS: omitted, clear, replace, rejection and JSON round trip");
```

這段驗證先檢查全部輸入，再回傳修改集合。即使 `internal_note` 合法、`gift_message` 不合法，也不會回傳可以執行的半份更新。程式只接受已解析 JSON 能表示的值，不是一個任意 JavaScript 物件合併工具。

[JSON.stringify 文件](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)說明，物件屬性的 `undefined` 會被省略，`null` 則會保留。因此測試要穿過 JSON 序列化。直接用測試框架塞一個含 `undefined` 的物件，不能代表伺服器實際收到的內容。

## 寫入時只使用已驗證的修改集合

假設每秒有 20 次客服修改請求，每個請求的本文上限為 8 KiB，輸入本文的上限估算是 `20 × 8 = 160 KiB/s`，未含 HTTP 標頭與 TLS。兩個文字欄位各最多 2,000 bytes，最多有 4,000 bytes 的文字內容。JSON 的跳脫字元可能增加線上大小，因此本文總長度和解碼後文字長度需要分開限制。

這組負載先交給既有單體與資料庫，不需要新增佇列。教學驗收目標設為修改 API 的 p95 小於 300 ms、驗證失敗不產生欄位變更；延遲仍要在代表性資料與流量下量測。限制請求大小是在約束工作量，不能由這個算式推論延遲已合格。

實際寫入先驗證操作者能編輯該訂單，解析修改集合，確認版本與訂單狀態，再用同一筆交易寫入變更和必要操作紀錄。[訂單操作紀錄的交易設計](/blog/order-system-transactional-audit/)已說明同成同敗的方式。

產生 SQL 時，只把修改集合裡存在的欄位放入 `SET`，使用參數綁定。沒有出現的欄位不應因 ORM 的預設值而進入更新。若集合為空，跳過資料更新；若值與資料庫相同，是否記錄一次操作嘗試和是否增加資料版本要分開定義，避免「沒變更」也不停觸發下游事件。

[RFC 5789 第 2 節](https://www.rfc-editor.org/rfc/rfc5789#section-2)要求 PATCH 的修改整組套用，失敗時不得留下部分結果。純函式測試只驗證修改集合，實際原子性仍要靠交易整合測試證明。版本衝突沿用既有條件更新方式，不能因為少傳幾個欄位就移除併發保護。

## JSON Merge Patch 適合另一種契約

若系統要修改一般 JSON 文件，可以選標準化的 `application/merge-patch+json`。[RFC 7396](https://www.rfc-editor.org/rfc/rfc7396#section-2)定義物件成員的 `null` 表示移除該成員，未列出的成員保留，陣列則整體替換。它沒有把 `null` 定義成所有資料庫都要寫入 SQL `NULL`。

這次選擇自訂的兩欄更新格式，原因是讀取回應固定保留欄位，而「沒有備註」以明確的 JSON `null` 表示。格式很小，驗證、授權和錯誤訊息也容易對應到表單。代價是客戶端必須遵守這份應用契約，不能直接拿通用 Merge Patch 函式套用，也不能標成 `application/merge-patch+json` 卻採不同規則。

當產品開始允許修改多層巢狀文件、動態欄位或陣列元素時，這個簡單格式就需要重新評估。另一條路是明確的業務命令，例如「清除客服備註」與「變更配送地址」各有入口。若清除需要理由、額外權限或審批，業務命令會比通用欄位更新更容易表達限制，代價是端點與客戶端操作數量增加。

## 舊客戶端與回歸測試

不能在不知道舊行為時，直接把 `null` 改成清空。假設舊 SDK 會把表單未編輯的欄位全部補成 `null`，新伺服器就會把舊 SDK 的一般儲存動作解讀為清除。先用匿名化測試資料重播舊 SDK 的序列化輸出，確認每一種輸入的意圖。若舊契約不同，保留舊端點或明確版本，新客戶端才切換，不從請求內容猜版本。

導入前，在實際 HTTP 與資料存取層補上這些測試：

- 只改禮物訊息，備註逐字不變；送 `null` 後，讀回的欄位存在且值為 `null`。
- 兩欄一起修改，其中一欄錯誤，資料庫兩欄都不變，操作紀錄也沒有成功事件。
- SDK 的省略與清除經過 JSON 往返後仍可區分。伺服器驗證器不得自動補 `null` 或把空字串轉成 `null`。
- 未授權、版本過期及不可編輯狀態都不寫入。錯誤計數只記欄位與原因，不把備註全文寫進日誌。

### 練習

新版表單想簡化送出程式，把所有沒有填文字的欄位都轉成 `null`。客服只改了禮物訊息，內部備註欄位因權限而根本沒有顯示。這個轉換可以共用嗎？請寫出這次請求應送的 JSON，並說明伺服器還需要檢查什麼。

### 參考思路

未顯示、未編輯與明確按下清除，是三種不同情況。這次只送 `gift_message`，不送 `internal_note`。表單應保留使用者實際修改了哪些欄位，只有明確清除才送 `null`。

伺服器仍要檢查操作者權限、允許欄位、值的格式、訂單狀態及版本。畫面沒顯示欄位不等於 API 已限制修改。下一次新增可清空欄位時，把「省略、null、空字串、有效值」各自的結果加入契約測試，再交給 SDK 與表單實作。
