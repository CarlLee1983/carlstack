---
title: "OpenWA 兩起漏洞的共同缺口：請求送出前，必須核對實際目標"
description: "從 OpenWA 2026 年 10 月 3 日公開的媒體下載 SSRF 與 SDK 路徑漏洞，拆解 URL 解析、資源識別與執行權限之間的落差，附不連網的回歸測試與升級驗收清單。"
publishDate: 2026-10-04T11:05:04+08:00
draft: false
featured: false
tags:
  - API 整合
  - 資訊安全
  - 後端架構
series: 現代網路協定與 API 平台架構
seriesOrder: 14
repositoryUrl: https://github.com/rmyndharis/OpenWA
cover: ../../assets/covers/openwa-request-target-boundaries.webp
coverAlt: "深藍紙雕地圖上的兩條路線匯入黃銅檢查點，白色路徑通往門口，偏向側邊洞口的紅色支線被柵欄阻擋，表達執行前應核對目的地。"
---

應用程式呼叫「刪除一筆子資源」，HTTP client 最後送出的路徑卻指向整個 session。媒體訊息看似只帶來一張圖片，伺服器下載時卻連到傳送者指定的位置。兩種失敗都發生在字串被解讀成操作目標之後。

OpenWA 維護者在 2026 年 10 月 3 日公開 [Baileys 媒體下載 SSRF](https://github.com/rmyndharis/OpenWA/security/advisories/GHSA-43g6-35h4-vpxc) 與 [SDK dot-segment 路徑漏洞](https://github.com/rmyndharis/OpenWA/security/advisories/GHSA-qfv5-qr59-xrvw)，兩者都標為 Moderate。本文於 10 月 4 日查核；公告日期不等於漏洞發現日期。當時兩份公告均顯示沒有已知 CVE 編號，也未提供實際遭利用的事件證據，不能據此宣稱正在遭受攻擊，或反過來保證無人利用。

我的工程判斷是：會下載資料或刪除資源的介面，驗收必須追到**HTTP client 最後採用的目標**。入口通過字串檢查，仍可能在 URL 解析、代理轉送或重新導向後換了目的地。

## 先分清楚需要更新哪一層

### 媒體下載問題在 gateway

[GHSA-43g6-35h4-vpxc](https://github.com/rmyndharis/OpenWA/security/advisories/GHSA-43g6-35h4-vpxc) 涵蓋 OpenWA `0.3.0` 至 `0.23.7`，修補版為 `0.24.0`。觸發路徑是 Baileys engine 收到媒體訊息；傳送者只要能把訊息送達已連結的 WhatsApp 號碼，就可能讓 gateway 對其指定地址發出 GET。預設開啟的媒體下載會使用 session 的 proxy；沒有設定時，才由伺服器直接連出。

這是一個 blind SSRF：下載回應不會傳回訊息傳送者。因此不宜直接寫成「攻擊者能讀取內網資料」。公告確認的是伺服器可被驅使連向可達的目標；個別內部服務會產生什麼影響，還要看網路與服務行為。

`0.24.0` 的修補會按底層函式庫的解析方式取得下載目標，只允許預設 port 上的 HTTPS，以及 `whatsapp.net` 或其子網域，也檢查媒體重新上傳回覆提供的下載位置。暫時緩解方式包括限制 gateway／session proxy 的對外連線，或設定 `MEDIA_DOWNLOAD_ENABLED=false`。停用下載會影響原本需要媒體的工作流，應明確記錄這項取捨。

### 路徑問題在呼叫端 SDK

[GHSA-qfv5-qr59-xrvw](https://github.com/rmyndharis/OpenWA/security/advisories/GHSA-qfv5-qr59-xrvw) 列出 JavaScript、Python、PHP SDK 的 `0.5.0` 及更早版本，修補版都是 `0.5.1`。成立條件包括：應用把不可信來源的 ID 交給相關子資源方法，而且使用 OPERATOR 或 ADMIN key。

這些 SDK 會編碼路徑片段，但原始 ID 若恰好是 `..`，仍可能在 client 的 URL 處理中被折疊。以刪除 webhook 為例，原本刪除子資源的請求會落到 session 刪除路由；session 與 WhatsApp 授權狀態都會被移除，需要重新連結。這裡已經有具權限的呼叫端，不能改寫成未經認證即可刪除任意帳號。

公告把 Go、Java 列為未確認受影響；五種 SDK 都加入了防禦性 ID 檢查。升級清單必須分別記錄 gateway 與 SDK 的實際版本。只更新伺服器，無法證明應用內的舊路徑編碼器已消失。

## 編碼保護字元，資源契約還要另外檢查

[WHATWG URL Standard](https://url.spec.whatwg.org/#double-dot-url-path-segment) 將 `..` 及特定百分比寫法定義為 double-dot path segment，解析時會縮短路徑。這是 URL 的既定語義；如果應用允許這段字串充當資源 ID，就把「資料」與「路徑控制」混在一起。

以下是本文的原創離線範例，只建立 URL 物件，不發 HTTP 請求，也不使用真實 session、key 或 OpenWA endpoint：

```js
import assert from "node:assert/strict";

const origin = "https://api.example.test";
const prefix = "/workspaces/demo/items/";

assert.equal(encodeURIComponent(".."), "..");
assert.equal(
  new URL(prefix + encodeURIComponent(".."), origin).pathname,
  "/workspaces/demo/",
);

assert.equal(
  new URL(prefix + encodeURIComponent("%2E%2E"), origin).pathname,
  prefix + "%252E%252E",
);
```

前兩個 assertion 顯示：做過 `encodeURIComponent`，不代表 ID 一定保留原本的資源位置。最後一個 assertion 則保留了容易被新聞摘要抹平的差異：呼叫者輸入 `%2E%2E` 時，百分比符號會再次編碼，不能把它與原始 `..` 混為一談。SDK 公告也明確區分這兩種輸入。

[修補後的 JavaScript SDK 原始碼](https://github.com/rmyndharis/OpenWA/blob/v0.24.0/sdk/javascript/src/http.ts) 在送出前拒絕空 ID 與 dot ID；raw-request 路徑也有獨立檢查。這兩個入口需要不同驗收：資源方法接收的是 ID，raw-request 接收的是路徑，不能共用一個「字串已經 encode」的保證。

如果自己的系統產生所有資源 ID，我會把合法字元與長度寫成狹窄契約。接入外部 ID 時則要按該系統的規格設計，不能任意刪字元或套用一個通用正規表示式，把兩個原本不同的 ID 清洗成同一個值。

**停止規則：解析後的資源種類或 ID 與呼叫意圖不一致，就不得送出刪除請求。** 建議測試直接比較最終 method、origin、pathname 與預期資源，並讓無效輸入在 transport 被呼叫以前失敗。

## 能解開媒體，不代表有權連到那個地址

媒體處理的驗證點更早。下載回應是否能解密，要等連線與資料傳輸發生後才知道；即使最後拒收內容，對外請求也可能已經送出。這是我從該 SSRF 案例推導的設計要求：判斷目的地的權限，應放在網路動作之前。

可拆成兩個契約：

- 訊息處理層決定是否接受這則媒體，以及最多處理多少資料
- 網路層決定這個工作允許連到哪裡，並約束 redirect、proxy 與實際連線路徑

[OWASP 的 SSRF 防護指南](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) 建議對可預期目的地使用 allowlist，並關閉自動跟隨 redirect，避免初始輸入通過檢查後換到其他位置。它也討論 DNS 解析與網路層限制；只檢查 URL 裡出現某個網域字串，無法覆蓋這些邊界。

因此，我會要求 downloader 使用解析後的 scheme、hostname 與 port 做決策，將通過檢查的目標交給同一個 transport。若業務需要跟隨重新導向，每一跳都必須有新的授權判斷。這是通用防禦建議，本文沒有驗證 OpenWA 修補涵蓋所有 DNS、redirect 或 proxy 組合，也不將一段示意 allowlist 當成可直接部署的完整 SSRF 防護。

兩起漏洞的修補落在不同元件，但測試可以問同一件事：輸入經過每一層解讀後，還是不是原本允許執行的那個目標？

## 回歸測試要觀察「沒有送出」

本文提供的[離線測試檔](https://github.com/CarlLee1983/carlstack/blob/main/docs/research/openwa-request-target-boundaries.test.mjs) 使用 Node.js 內建 test runner，共八項測試。2026 年 10 月 4 日以 Node.js `24.19.0` 執行，八項通過：

- 原始 dot segment 與已編碼 ID 的不同解析結果
- 示意應用拒絕無效 ID，且合法 ID 保留 method、origin 與精確資源路徑
- 已檢查的 request plan 無法直接改寫目標
- 示意媒體政策按解析欄位判斷，改變目的地後必須重新評估

在 repository 根目錄可執行：

```sh
node --test docs/research/openwa-request-target-boundaries.test.mjs
```

測試只驗證 URL 行為與本文示意契約，不啟動 OpenWA、不連接 WhatsApp，也不代表已重現或驗收廠商修補。它的媒體檢查不做 DNS 解析，亦沒有真正跟隨 redirect。

正式整合測試還要向前一步。我會注入不連網的 recording transport，驗證被拒絕的 ID 完全沒有產生送出紀錄；合法刪除則只命中測試環境中預先建立的單一子資源。對 downloader，記錄的是受控測試目標與拒絕原因，不把含憑證的 URL、key 或私訊內容寫入一般日誌。

HTTP mock 也要放在足夠晚的位置。若它只收到應用拼接的原始字串，還沒經過正式 client 的 URL 正規化，就可能漏掉這次問題。需要保留實際 parser 的行為，再以 recorder 取代真正的網路傳輸；正式環境會經過 proxy 時，另以已授權的隔離整合測試補足該段。

## 把升級完成寫成可查核的條件

對使用 OpenWA 的團隊，我會用以下清單結案：

1. 列出實際使用的 engine、gateway 版本與各應用的 SDK 版本，對照公告範圍
2. 受影響的 gateway 更新至 `0.24.0` 或包含該修補的後續版本；受影響 SDK 更新至 `0.5.1` 或包含該修補的後續版本，確認部署產物與 lockfile 一致
3. 暫時無法升級的媒體路徑，依公告限制出站或停用下載，並驗證受影響的業務功能
4. 對所有接受外部 ID 的刪除入口補上拒絕測試，確認錯誤輸入不會退回 session 級操作
5. 在隔離環境驗證正常媒體處理與正常子資源刪除，保留實際測試版本、結果與未覆蓋範圍

這篇與〈[GitHub App Token 的端到端驗收](/blog/github-installation-token-opaque-contract/)〉都把檢查追到 HTTP client 周邊。Token 案例要確認憑證完整且沒有進入日誌；OpenWA 案例則要確認有權限的動作，仍指向原本允許的資源。

下一個 code review 可以從一個具體問題開始：挑出一個會下載 URL 或刪除子資源的 helper，找出它最後一次解析目標的位置，再補一項測試，證明目標改變時 transport 沒有被呼叫。
