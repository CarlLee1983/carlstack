---
title: "Postiz 2.25.3 權杖偽造修補：限制簽署欄位與驗證用途"
description: "Postiz 10 月 24 日發布安全更新。從 JWT 修補原始碼檢查請求資料如何取得簽章，再把用途驗證、欄位白名單與部署驗收分開處理。"
publishDate: 2026-10-25T10:10:00+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - API 整合
  - 系統設計
series: 現代網路協定與 API 平台架構
seriesOrder: 21
cover: ../../assets/covers/postiz-token-signing-authority.webp
coverAlt: "薄荷綠毛氈工作台上，紫色印章對著三條紙帶，中央紙帶被橘色擋板攔在三角形開口前。"
---

Postiz 在 [2026 年 10 月 24 日發布 2.25.3](https://github.com/gitroomhq/postiz-app/releases/tag/v2.25.3)，修正 PSA-2026-YT2HMH 與 PSA-2026-E9AHFV，並建議所有使用者立即升級。JWT 修補移除了一處對請求內容的簽署，另一處則把可簽欄位明列出來。

這次值得檢查簽署端的權限。如果請求能把任意欄位送進共用的簽署函式，後面的驗證器可能收到一份簽章有效、用途卻完全不對的權杖。只在接收端加上簽章檢查，還處理不了這種情況。

我核對官方 release、兩筆 GitHub Advisory Database 紀錄與 JWT 修補 diff，沒有部署 Postiz 或重現攻擊。兩筆 GHAD 紀錄在查核時均標為 Unreviewed，套件的受影響與修補版本欄位是 Unknown，因此不引用評分或推算完整受影響範圍。升級目標依官方 release；以下驗收安排是工程建議，查閱的資料沒有提供已遭在野利用的證據。

## 同一個簽章，可能被不同流程接受

[CVE-2026-115933 的紀錄](https://github.com/advisories/GHSA-9j6f-8rw3-93c4)描述，Postiz 的 session、組織邀請與密碼重設權杖共用 secret，缺少用途標記。瀏覽器擴充套件 channel 的憑證更新路徑會簽署請求帶來的內容，並把結果存到使用者可讀回的位置。具低權限的使用者因此能取得帶有自選 claims 的有效簽章；團隊邀請路徑另有較窄的問題。

這裡要審查的權限包含「能要求伺服器簽哪些內容」。只確認誰能呼叫更新 API，還沒有回答它能否要求伺服器產生可被其他流程接受的權杖。

對自家服務，我會把每個簽署呼叫點列出來，記錄輸入欄位從哪裡來、哪些由伺服器決定，以及產物會被哪些驗證器接受。這份清單通常比只搜尋 `verifyJWT` 更早找出問題。

## 修補先移除不該發生的簽署

[官方 commit a5affe6](https://github.com/gitroomhq/postiz-app/commit/a5affe6)的差異有幾個值得逐項看過的變更。

瀏覽器 cookies 的儲存路徑，從 `AuthService.signJWT()` 改成 `AuthService.fixedEncryption()`。這份資料需要儲存，原本的處理卻會產生可被當成 JWT 使用的簽章。修補把這個簽署呼叫移除。

團隊邀請原本把 `...body` 展開後送去簽署。修補改成明列 `email`、`role`、`orgId`、`timeLimit` 與 `id`，避免請求中的未宣告欄位一起被簽進去。接收端也新增型別、必要欄位與部分互斥欄位的檢查，例如拒絕帶有其他權杖特徵的 payload。

這份 diff 沒有顯示已全面改用分用途 secret。不能把自己希望看到的設計補寫成上游成果。若團隊打算在自己的系統加入用途 claim、分離金鑰或不同 audience，要另開設計與相容性驗收，包含舊權杖何時失效、哪些客戶端會受影響。

先前的 [Postiz 2.25.1 回應欄位外洩](/blog/postiz-api-response-secret-field-boundary/)處理的是 API 回傳了哪些秘密。這次 2.25.3 的 JWT 問題則讓請求內容取得簽署權限，兩者需要不同的回歸測試。

## 驗收要把權杖換到錯的接收端

用途契約可以先寫成小型測試。下面是可用 `node token-purpose-contract.mjs` 執行的教學範例，只驗證已完成簽章檢查之後的 claims 分流，不是 Postiz 的實作，也不包含 JWT 密碼學驗證。

```js
import assert from "node:assert/strict";

function acceptClaims(claims, expectedPurpose) {
  return (
    claims !== null &&
    typeof claims === "object" &&
    claims.purpose === expectedPurpose &&
    typeof claims.sub === "string" &&
    claims.sub.length > 0
  );
}

const session = { purpose: "session", sub: "test-user" };
const invitation = { purpose: "invitation", sub: "test-user" };
assert.equal(acceptClaims(session, "session"), true);
assert.equal(acceptClaims(invitation, "invitation"), true);
assert.equal(acceptClaims(invitation, "session"), false);
assert.equal(acceptClaims(session, "invitation"), false);
assert.equal(acceptClaims({ sub: "test-user" }, "session"), false);
assert.equal(acceptClaims({ purpose: "session", sub: 7 }, "session"), false);
console.log("token purpose contract: PASS");
```

實際服務要把相同方向的反例放到 HTTP 測試，使用隔離環境和合成帳號。正常登入、邀請與重設流程各自成功，再確認每種權杖送到其他接收端都被拒絕。簽署端則測試額外輸入欄位會被拒絕或排除，若組織、角色或到期資訊依產品規則由伺服器決定，也要確認請求不能覆寫。

**驗證器必須先完成簽章及必要的時效、issuer、audience 檢查，再依用途契約授權。**上面六個斷言只測用途分流，不能替這些檢查結案。

## 同版的媒體路徑修補要另外追蹤

2.25.3 還修正另一個問題。[CVE-2026-115932 的紀錄](https://github.com/advisories/GHSA-rmc2-p2gv-m88f)描述，媒體路徑被當成本機檔案處理時，缺少限制在上傳目錄內的檢查。已註冊使用者可經發布流程讓 worker 讀取伺服器檔案；紀錄也指出預設開放自行註冊。

公開註冊會影響誰能取得帳號，不等於這條路徑完全不需要帳號。部署者應核對實際註冊設定與網路可達範圍，同時由維運人員追蹤媒體讀檔路徑的修補。JWT 測試通過，不能替檔案存取驗收。

我會將本次升級拆成三份證據：所有相關服務已換成官方修補版本的產物、正常業務仍可完成，以及權杖與媒體路徑的負向案例被拒絕。映像下載完成不代表舊服務已退出流量。若啟動事件調查，另留調查期間、可用日誌與資料缺漏，不能只靠升級版本推定先前沒有暴露。

今天可以先選一個會簽發權杖的服務，從每個 `sign` 呼叫追到對應的接收端，補上一個「簽章有效、用途錯誤」的拒絕測試。接著核對簽署前的物件是否含有 `...request.body`，把可簽欄位改成可審查的明確清單。
