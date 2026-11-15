---
title: "訂單列表的排序欄位"
description: "訂單列表要開放哪些排序方式？用固定選項映射 SQL，分開參數綁定與欄位選擇，並檢查同時間訂單的順序與索引成本。"
publishDate: 2026-11-15T08:51:56+08:00
draft: false
featured: false
tags: [系統設計, API 整合]
series: 系統設計每日實戰
seriesOrder: 32
cover: ../../assets/covers/order-system-list-sort.webp
coverAlt: "深灰背景上的金屬選擇器有兩條平行軌道，各排著高度依序變化的綠色透明片，前方是一顆圓形旋鈕。"
---

## 列表多一個下拉選單

沿用虛構訂單系統。客服查詢某位顧客的訂單時，預設想看最近成立的訂單，偶爾也想從最早的一筆開始看。前端送來 `sort=created_at&direction=desc`，後端看起來只需要把兩個字串放進 `ORDER BY`。

這個介面一旦接受任意欄位，呼叫端就可能要求依備註、金額或內部狀態排序。即使每個欄位名稱都安全，資料庫也未必能用同一份索引處理。這次只決定訂單列表可以接受哪些排序方式，不重做搜尋與報表。

以下數量與延遲目標都是教學假設。來源查核以 MySQL 8.4 與 Laravel 12.x 官方文件為準。JavaScript 範例可單獨驗證選項與查詢組裝，SQL 是待接入產品的示意，沒有宣稱完成 MySQL 整合或壓力測試。

## 需求只有兩種時間順序

客服已通過權限檢查，服務端取得可查詢的租戶與顧客範圍。列表每次最多回傳 50 筆，欄位只包含編號、成立時間、金額與狀態，不帶完整備註。顧客識別值仍以字串傳入，接續[訂單編號的 API 格式](/blog/order-system-id-api-format/)。

功能需求先限為兩項：最近成立的在前、最早成立的在前。成立時間相同時，也要有明確的第二排序條件。省略排序參數使用預設值，送來不支援的值則回傳欄位驗證錯誤，不偷偷改回預設排序。畫面顯示的排序名稱必須與結果一致。

假設尖峰為每秒 80 次列表查詢，每筆序列化後約 300 bytes，一次取滿 50 筆：

```text
50 rows/request × 300 bytes/row = 15,000 bytes/request
80 requests/s × 15,000 bytes/request = 1,200,000 bytes/s
```

這約是 1.2 MB/s 的資料列本文，未含 JSON 外框、HTTP/TLS 與壓縮。它只能幫忙估傳輸量，無法推算掃了多少資料列。列表 API 的 p95 目標暫訂 300 毫秒，測量需包含授權和資料庫查詢。

## 把公開選項映射成固定 SQL

對外改用 `sort=newest` 與 `sort=oldest`。這兩個名字代表功能，內部欄位改名時也不必要求所有客戶端一起改。

服務端保存完整排序片段：

- `newest` 對應 `created_at_utc DESC, id DESC`。
- `oldest` 對應 `created_at_utc ASC, id ASC`。

欄位與方向都來自程式內的固定集合。租戶、顧客等資料值仍走參數綁定。**參數綁定不會把資料值變成 SQL 欄位名稱。** [MySQL PREPARE 文件](https://dev.mysql.com/doc/refman/8.4/en/prepare.html)明列，參數標記可放在資料值的位置，不能拿來替代識別名稱或 SQL 關鍵字。因此 `ORDER BY ?` 綁入 `created_at_utc`，無法達成選擇該欄位排序的目的。

下面是一個完整的 Node.js 查詢組裝範例，可存成 `order-sort.mjs` 後執行 `node order-sort.mjs`。`scope` 假設由已完成授權的服務端流程提供，不能直接複製請求中的租戶值。

```javascript
import assert from "node:assert/strict";

const orderBy = new Map([
  ["newest", "created_at_utc DESC, id DESC"],
  ["oldest", "created_at_utc ASC, id ASC"],
]);

function buildListQuery(sort, scope) {
  const selected = sort === undefined ? "newest" : sort;
  if (typeof selected !== "string" || !orderBy.has(selected)) {
    throw new RangeError("unsupported_sort");
  }
  return {
    sql:
      "SELECT id, created_at_utc, total_minor, status FROM orders " +
      "WHERE tenant_id = ? AND customer_id = ? " +
      `ORDER BY ${orderBy.get(selected)} LIMIT 50`,
    values: [scope.tenantId, scope.customerId],
  };
}

const scope = { tenantId: "7", customerId: "42" };
assert.deepEqual(
  buildListQuery(undefined, scope),
  buildListQuery("newest", scope),
);
assert.match(buildListQuery("oldest", scope).sql, /id ASC LIMIT 50$/);
for (const value of ["", "total_minor", "__proto__", "id DESC;--", null, []]) {
  assert.throws(() => buildListQuery(value, scope), /unsupported_sort/);
}
const hostileValue = "42' OR 1=1 --";
const query = buildListQuery("newest", {
  ...scope,
  customerId: hostileValue,
});
assert.equal(query.sql.includes(hostileValue), false);
assert.deepEqual(query.values, ["7", hostileValue]);
console.log("sort mapping checks passed");
```

這段程式只組出 SQL 與 bindings。接上驅動程式時要使用其參數化執行介面，不能再把 `values` 自行串進 SQL。HTTP 層也需拒絕重複的 `sort` 參數，避免不同 query parser 對 `?sort=newest&sort=oldest` 各取不同結果。範例只收到單一解析後的值，重複參數須在解析層檢查。

Laravel 可採同樣的映射方式，再把程式選出的欄位與方向交給 `orderBy`，不要直接傳入 `$request->input('sort')`。[Laravel Query Builder 文件](https://laravel.com/docs/12.x/queries#introduction)也提醒，PDO 不支援綁定欄位名稱，包含 `ORDER BY` 使用的欄位。

## 排序允許了，查詢還要負擔得起

這個教學查詢固定以 `tenant_id`、`customer_id` 等值篩選，成立時間不可為空，`id` 是唯一主鍵。可以從以下複合索引評估：

```sql
CREATE INDEX idx_orders_customer_created
ON orders (tenant_id, customer_id, created_at_utc, id);

SELECT id, created_at_utc, total_minor, status
FROM orders
WHERE tenant_id = 7 AND customer_id = 42
ORDER BY created_at_utc DESC, id DESC
LIMIT 50;
```

[MySQL 的排序最佳化文件](https://dev.mysql.com/doc/refman/8.4/en/order-by-optimization.html)說明，前段索引欄位固定時，後段欄位有機會提供排序，方向相反也可能反向掃描。同時，最佳化器會考慮成本，建了索引不保證必然選它。這份索引不是涵蓋索引，查金額與狀態仍可能需要回表。

加入 `id` 是為了補齊同時間的順序。依 [MySQL LIMIT 文件](https://dev.mysql.com/doc/refman/8.4/en/limit-optimization.html)，當排序欄位值相同時，這些列的相對位置可以不同。把唯一值放進排序條件，才可明確排出相同資料集中的順序。

這不會凍結資料。兩次查詢之間新增訂單，列表仍會變動。需要連續翻頁時，接續[游標分頁設計](/blog/api-pagination-offset-vs-keyset-cursor-architecture/)處理，游標需對應這組排序欄位，換排序時清除舊游標。需要固定一批資料做對帳，則是[報表快照](/blog/order-system-export-snapshot/)的問題。

單次最多拿 50 筆，也不等於讀取量最多是 50 筆。加上狀態篩選或改按金額排序，都可能改變計畫。驗證時要使用產品實際的 WHERE、SELECT 與資料分布，分別看兩種排序的 `EXPLAIN ANALYZE`、處理資料列數與耗時，再測 API 的 p95。`EXPLAIN ANALYZE` 會執行查詢，適合先在受控資料環境進行，語法見 [MySQL EXPLAIN 文件](https://dev.mysql.com/doc/refman/8.4/en/explain.html)。

## 多開放欄位的代價

另一個合理方案是公開 `sort=created_at&direction=asc`，把欄位與方向各自限制在允許清單。管理後台確實需要多種排序時，這種介面比較方便，驗證的組合也更多。每增加一個合法欄位，都要確認其空值、同值順序與查詢成本。

這個案例只需要兩種時間順序，因此先用兩個固定選項。金額目前不在清單中，收到 `sort=total_minor` 就拒絕。拒絕任意欄位同時減少輸入風險與效能測試範圍，無須另加 Redis 或搜尋服務。

客服確實需要「最高金額在前」，且使用頻率值得支援時，再新增 `highest_total`，明確定義金額單位與第二排序欄位，評估索引及寫入成本。若未來必須跨多種篩選與排序組合查詢，現有索引在代表性資料上超過延遲目標，才進一步評估獨立讀取模型。新增選項應有查詢計畫與負載證據。

## 用失敗輸入和同值資料驗證

產品整合時，可先做以下檢查：

1. 省略 `sort` 得到 `newest`；空字串、未知值、陣列與重複參數在查詢前被拒絕。錯誤格式沿用[上一課的契約](/blog/order-system-error-response/)。
2. 插入多筆成立時間相同、編號不同的訂單，在資料不變時，確認兩種方向都依完整排序條件回傳。不要用應用程式對單頁結果補排，否則選進這一頁的資料可能已經不對。
3. 兩種排序都保留同一個授權範圍。變更 `sort` 不得讓其他租戶或顧客的訂單出現。
4. 對訂單數較多與較少的顧客分別看執行計畫，納入正式介面允許的篩選組合。若查詢變慢，先判斷是哪一個合法選項及篩選組合造成，再調索引或縮小功能範圍。

組裝函式的斷言只能證明輸入映射與 bindings 分離，以上資料庫、HTTP 和負載驗收仍要在產品環境執行。

## 練習

客服希望增加「最高金額在前」。請寫出一個公開排序值、完整 `ORDER BY` 與候選索引，再選兩種資料分布檢查計畫。若 p95 超過 300 毫秒，你會先保留哪些限制？

### 參考思路

可新增 `highest_total`，映射成 `total_minor DESC, id DESC`。在單一幣別的教學假設下，以 `(tenant_id, customer_id, total_minor, id)` 作為候選索引，仍用實際計畫確認。多幣別系統則要先定義金額可否比較，不能直接把不同幣別混排。

可各選一位有十萬筆與一位只有百筆訂單的顧客，再觀察正式支援的篩選條件。延遲超標時維持 50 筆上限、固定查詢範圍與允許清單，暫緩開放尚未驗證的組合。只有一頁需要金額排序時，也不應把整個列表改成任意 SQL 排序介面。
