---
title: "Postiz 修補憑證外洩：刪除權限不能順便取得整筆秘密欄位"
description: "Postiz 2.25.1 修正 channel 刪除與組織清單的秘密欄位外洩。從修補原始碼拆開租戶、操作與回應欄位權限，建立 DTO 白名單、角色驗收和暴露調查的結案條件。"
publishDate: 2026-10-12T10:16:33+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - API 整合
  - 系統設計
cover: ../../assets/covers/postiz-api-response-secret-field-boundary.webp
coverAlt: "版畫中的輸出開口只送出一張空白收據，兩把鑰匙留在外側，象徵 API 回應應挑選必要欄位並保留秘密。"
---

API 已驗證身分，也把操作限制在呼叫者的組織內，回傳資料仍可能越權。社群媒體排程工具 Postiz 這次修補的是回應欄位：獲准刪除社群 channel 的 OAuth app，原本會連該 channel 的平台憑證一起收到；一般成員查詢組織清單，也會拿到管理員用途的 API key。

我的建議是把這類問題列為一份獨立的 API 契約：每個角色可以操作什麼，以及操作後可以收到哪些欄位，都必須可驗收。資料庫回傳完整紀錄，不代表 HTTP 回應可以照單送出。

## 10 月 11 日的新進展是修正版公開

Postiz 的 [PSA-2026-4QX1WG 公告](https://gadvisory.org/advisories/PSA-2026-4QX1WG)於 2026 年 10 月 11 日公開，對應 CVE-2026-107761，標示 CVSS 4.0 為 5.3、Medium，修正版為 2.25.1。[官方 release](https://github.com/gitroomhq/postiz-app/releases/tag/v2.25.1)同日發布，建議所有使用者立即升級。

公告列出的發現日是 10 月 1 日，開發並驗證修補的日期是 10 月 8 日。這幾個時間不能合併成「今天才發現」。本文於 10 月 12 日核對公告與修補原始碼，沒有部署 Postiz 或重現實際攻擊；下方合成測試只驗證本文的欄位契約範例。

兩個問題都有既有存取條件。公告說明，端點需要有效 session、API key 或 OAuth token，範圍限於呼叫者自己的組織，沒有匿名或跨租戶暴露。公告沒有報告在野利用。這些限制縮小了攻擊面，但組織中的低權限成員與第三方 app，仍不該因此獲得其他用途的憑證。

## 操作合法，回應仍可能擴大權限

### 刪除 channel：回傳資料能帶走另一套授權

依公告，public API 的刪除動作原先回傳完整 integration row，其中包含社群平台的 access token 與 refresh token。第三方 OAuth app 即使只有執行這個刪除操作的授權，也會收到能直接作用於已連接平台帳號的憑證。

這裡要分開三件事：請求來自哪個 app、能否刪除該 channel，以及能否接收平台憑證。前兩項檢查通過，不會自動授權第三項。也不能因為 Postiz 將 channel 標記為刪除，就推定平台端 token 已撤銷。

### 組織清單：同租戶不代表同角色

`GET /user/organizations` 原先向組織的每位成員回傳完整組織紀錄，包含原本只應讓 admin 看見的 API key。公告指出，較低角色的成員可以取得它，進而代表組織呼叫 public API。

這不是跨租戶讀取。問題發生在同一租戶內，當角色差異沒有反映到回應欄位時，成員就能跨過另一條權限邊界。排查時只測「A 組織看不到 B 組織」會漏掉它。

## 修補把回應縮到消費端需要的欄位

[官方修補 commit 8ad0df3](https://github.com/gitroomhq/postiz-app/commit/8ad0df3df0f21299b8640568358c1b68c6464e4f)動了兩個地方：

- `IntegrationRepository.deleteChannel()` 在 Prisma update 加上 `select: { id: true }`。更新仍以 channel id 與 organization id 限定範圍，回傳只需要的識別碼。
- `UsersController.getOrgs()` 保留排除停用成員的過濾，再把每筆組織投影為 `id`、`name`、`users`、`subscription`，不再直接回傳整筆組織資料。

[同一版本的 repository 實作](https://github.com/gitroomhq/postiz-app/blob/8ad0df3df0f21299b8640568358c1b68c6464e4f/libraries/nestjs-libraries/src/database/prisma/integrations/integration.repository.ts#L766-L781)顯示，`deleteChannel()` 寫入的是 `deletedAt`。這是軟刪除；單看這段程式，不能宣稱它同時撤銷了外部社群平台上的授權。

我的工程判斷是，在資料查詢時限制 `select`，可以讓未使用的秘密更早離開回傳路徑；在控制器建立明確 DTO，則讓 HTTP 契約有可審查的形狀。兩者適用的位置不同，目的都是避免資料表新增欄位時，API 默默跟著增加輸出。

只寫一份 `delete token` 的黑名單，下一次多出 `providerSecret` 仍可能漏掉。**停止規則：回應多出契約未列出的欄位，就讓測試失敗，即使舊測試只關心的 `id` 仍然正確。** 巢狀 `users`、`subscription` 也要有各自的欄位契約，不能只驗最外層。

## 用合成紀錄檢查「多一個欄位就失敗」

以下是可用 `node response-contract.mjs` 執行的教學範例。它沒有呼叫 Postiz，也沒有使用真正 token；欄位名稱與角色是示意，不能當成上游完整修補或 API 測試。實際專案應將同樣的斷言套在 HTTP 測試收到的 JSON。

```js
import assert from "node:assert/strict";

function deleteReceipt(row) {
  return { id: row.id };
}

function organizationView(row) {
  return { id: row.id, name: row.name };
}

function exactFields(value, fields) {
  assert.deepEqual(Object.keys(value).sort(), [...fields].sort());
}

const channel = {
  id: "channel-test",
  accessToken: "FAKE_ACCESS",
  refreshToken: "FAKE_REFRESH",
  futureSecret: "FAKE_FUTURE",
};
const organization = {
  id: "org-test",
  name: "Example",
  apiKey: "FAKE_ORG_KEY",
};

exactFields(deleteReceipt(channel), ["id"]);
exactFields(organizationView(organization), ["id", "name"]);
assert.throws(() => exactFields({ ...channel }, ["id"]));
assert.throws(() => exactFields({ ...organization }, ["id", "name"]));
console.log("response field contract: PASS");
```

這個小測試的價值，是把「只有需要的欄位」改成程式會拒絕的反例。它還沒有驗證認證、租戶隔離、角色授權或資料庫行為。上線前的整合測試至少要涵蓋以下情境，並使用專屬測試組織、可丟棄 channel 與假憑證，避免真的刪除正式連接：

- 一般成員讀取組織清單，只收到該角色允許的欄位；秘密欄位及巢狀內容都納入斷言。
- 已獲准刪除的測試 app 完成操作，回應符合刪除契約，不包含平台 token。
- 缺少憑證、缺少操作權限，以及指向其他組織的請求，都被拒絕；拒絕回應也不帶出內部紀錄。
- 資料模型加上一個假的新秘密欄位後，原有成功與錯誤回應仍不會把它序列化出去。

回應的精確欄位必須依實際版本與產品契約決定。本文的兩欄組織範例故意縮小範圍，沒有複製 Postiz 的 `users` 與 `subscription` 結構。

## 升級與既有暴露，要分開結案

對 Postiz 維護者，我會先核對所有對外服務副本已執行 2.25.1 或含該修補的後續版本，再用測試帳號驗證這兩條回應。單看映像已下載，還不能證明舊副本已退出流量。

另一張調查單處理過去是否曾經暴露：盤點低權限組織成員、被授權的第三方 app，以及受影響版本期間的相關 API 呼叫。若既有紀錄沒有保存回應，應如實寫明無法從紀錄證明哪些憑證曾被取得，不要為了調查而開始把真實 token 記進日誌。

公告沒有要求所有使用者無差別輪替全部 token。若團隊確認某個 app 或成員曾收到不該取得的秘密，便應依平台能力評估撤銷或輪替該憑證、重新授權及業務影響；這是事件處置建議，並非本文替廠商新增的指示。

[GenOffice 暫存檔權限案例](/blog/genoffice-mcp-temp-file-permission-boundary/)處理的是 HTTP 入口之後的檔案邊界；本篇則把驗收拉到回應欄位。今天可以先挑一個回傳 ORM 紀錄的 API，列出它對一般成員真正承諾的欄位，再加入「新秘密欄位不得出現在輸出」的失敗測試。
