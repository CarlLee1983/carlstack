---
title: "mcp-use client 2.4.1 升級後連不上：先查最終端點與尾斜線"
description: "mcp-use client 2.4.1 帶入新的 HTTP／OAuth redirect 限制。從固定版本原始碼拆解 Node 與瀏覽器差異、尾斜線正規化陷阱，以及不把 token 送往錯誤目的地的驗收設計。"
publishDate: 2026-10-07T10:11:35+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - API 整合
  - 資訊安全
series: AI Agent 工程化與工作流實戰
seriesOrder: 68
repositoryUrl: https://github.com/mcp-use/mcp-use
cover: ../../assets/covers/mcp-use-client-241-redirect-final-endpoint.webp
coverAlt: "鼠尾草綠背景上，透明直管中的萊姆綠玻璃膠囊朝圓形插槽前進，旁邊彎曲的繞路管被霧面陶瓷封住，表達直接連到最終端點與拒絕不被允許的轉向。"
---

同一個 MCP endpoint，Node 程式能連，搬到瀏覽器卻失敗；把 `/mcp` 改成 `/mcp/`，問題仍在。遇到這種升級回歸，我會先查 HTTP 請求到底落在哪個 URL，再查模型或工具定義。

[mcp-use 在 2026 年 10 月 6 日發布的 `@mcp-use/client 2.4.1`](https://github.com/mcp-use/mcp-use/releases/tag/%40mcp-use%2Fclient%402.4.1) 說明了 HTTP 與 OAuth helper 的 redirect 限制。同批 `@mcp-use/cli 4.3.0` 也列出這項更新：官方 MCP client、core、server SDK 升到 `2.3.1`，MCP Apps 升到 `2.0.3`。本文於 10 月 7 日查核，範圍是這組 TypeScript 套件及其預設行為，不能外推成所有 MCP client 同時改變，也不把 release note 當成新的 CVE 公告。

這次值得加進升級清單的項目是：**驗收 connector 實際使用的最終 URL，而且 Node 與瀏覽器分開測。** 單看設定檔中的 URL，還少了一層轉換。

## 「同源」還有 method 與執行環境條件

[`2.4.1` 的套件定義](https://github.com/mcp-use/mcp-use/blob/56dbe75/libraries/typescript/packages/client/package.json) 明確依賴 MCP client/core `2.3.1` 與 ext-apps `2.0.3`。上游在 [`2.3.0` 的升級說明](https://github.com/modelcontextprotocol/typescript-sdk/releases) 已列出 redirect 變更；本次是 mcp-use 帶入新依賴，不代表限制首次出現在 SDK `2.3.1`。[`v2.3.1` 的 transport helper](https://github.com/modelcontextprotocol/typescript-sdk/blob/v2.3.1/packages/core-internal/src/shared/transport.ts) 才是 redirect 判斷的具體實作。

在預設路徑、底層 fetch 尊重 `redirect: 'manual'` 的前提下：

- **Node 的 GET**：可跟隨同源的 301、302、303、307、308；仍受跳數、目標與 userinfo 檢查限制
- **Node 的非 GET**：只有 307、308 通過 method 條件。因此 POST 遇到同源 301／302／303，也不能用「還在同一個網站」解釋成應該成功
- **瀏覽器**：manual redirect 產生不公開 Location 的 opaque redirect 回應；預設連同源轉向也失敗。伺服器端成功不代表瀏覽器端相容

原始碼的 `isWithinOrigin` 還有一個容易被摘要省略的特例：同一 hostname、雙邊都是預設 port 的 HTTP→HTTPS 升級可以通過。除此之外才按 scheme 與 host（含 port）比較；HTTPS→HTTP 降級不在允許範圍。這是該版本 helper 的規則，不能拿來重定義瀏覽器標準的 origin，也不表示適合先把帶憑證的請求送到 HTTP。

我的部署選擇仍是直接設定 HTTPS 最終端點。靠 redirect 補正 URL 會多出一個失敗位置，也讓 Node 與瀏覽器需要維護不同的成功條件。

## 補上尾斜線，可能又被 connector 刪掉

[mcp-use 發布 commit 的 `HttpConnector`](https://github.com/mcp-use/mcp-use/blob/56dbe75/libraries/typescript/packages/client/src/transport/http.ts) 建構時有這段處理：

```ts
const originalUrl = baseUrl.replace(/\/$/, "");
this.baseUrl = originalUrl;
```

這是原始碼節錄，並非本文的修補程式。它代表傳入字串若以 `/` 結尾，最後一個斜線會被移除。假設部署只在 `/mcp/` 提供服務，並將 `/mcp` 以 307 導向 `/mcp/`：Node 的預設 helper 可能走得通，瀏覽器仍會遇到 redirect 限制。單純在設定補 `/`，不能證明送出的請求已經改了。

因此「設定 final URL」必須驗收到封包邊界。我會先確認 connector 建構後的路徑，再讓 gateway 或應用直接服務這個路徑；若端點合約一定要保留尾斜線，則把正規化行為列為待處理的相容性問題，連同版本、輸入 URL 與觀察到的 request URL 回報。不要偷偷加 query string 來躲過字串處理，讓網址的其他語義跟著改變。

這個取捨的成本是 endpoint 設定與 gateway route 必須一起維護；收益是跨 runtime 不再依賴同一跳 redirect 能否被跟隨。站內的 [OpenWA 請求目標檢查](/blog/openwa-request-target-boundaries/) 討論輸入如何變成操作目標，本篇追加的是具體版本的「connector 正規化＋runtime redirect 政策」相容性邊界。

## OAuth 與 proxy 要各自留下目的地證據

上游 [`StreamableHTTPClientTransport` 的選項與實作](https://github.com/modelcontextprotocol/typescript-sdk/blob/v2.3.1/packages/client/src/client/streamableHttp.ts) 有 `redirectPolicy`，預設為 `same-origin`；但本次 mcp-use 的 `HttpConnectorOptions` 及建立 transport 的呼叫沒有將這個選項暴露或傳入。把上游文件的參數貼到 mcp-use 設定，不能當成有效修正。

同一份 connector code 的 gateway fetch 也區分了兩種請求：符合 logical server origin 與 pathname 的 MCP transport 請求會改送 proxy，並加上 `X-Target-URL`；OAuth discovery／token 請求則保留自己的 URL，交給底層 fetch。也就是說，測到 MCP gateway 能通，還不能推論 OAuth 也走過相同路由。

上游 [`auth.ts`](https://github.com/modelcontextprotocol/typescript-sdk/blob/v2.3.1/packages/client/src/client/auth.ts) 在 metadata、token 與 registration 等請求路徑使用受限制的 fetch helper。這裡的限制針對程式發出的 HTTP 請求，不應讀成「使用者登入後的 OAuth callback 一律禁止」。此外，provider 自己發起的 fetch 不一定受到 transport 選項控制。

我會在測試環境分別記錄 MCP endpoint、gateway、discovery 與 token endpoint 的 method、origin、pathname、status，以及是否發生下一跳；不記錄 Authorization、token body、authorization code 或帶敏感 query 的完整 URL。合法 authorization server 與 MCP server 位於不同 origin，並不等於「某一次 HTTP 請求可任意跨 origin redirect」：兩件事的授權依據要分開檢查。

**停止規則：被拒絕的轉向目標只要收到請求，或測試憑證到達非預期服務，就停止升級驗收。** 錯誤畫面本身不足以證明沒有洩漏；自訂 fetch、proxy 或重試層可能已經送出第二跳。

## 用負面案例驗收，先保留「應該失敗」的結果

下面是本文原創的測試設計，依已讀取的固定版本原始碼推導。本文沒有安裝執行 mcp-use SDK，也沒有對測試或正式 MCP／OAuth endpoint 發出驗證請求；以下都是待驗收條件，不是實測通過報告。

### 直接端點：建立成功基準

- 讓無副作用的測試 endpoint 直接回覆協定所需結果，不經 redirect
- 分別在 Node 與真實瀏覽器執行連線與只讀操作，記錄實際套件解析版本
- 預期兩者都不因 redirect 政策失敗；CORS、TLS、認證與協定本身仍須各自通過

### 同源轉向：刻意拆開 GET 與 POST

- 為同一 host 準備同源 302 與 307 路由，每條路由都記錄是否收到下一跳
- 預期 Node GET 可通過兩者的 redirect 條件；Node POST 的 302 應被拒絕，307 可通過條件
- 瀏覽器在預設政策下兩者都應拒絕；不要因為這個負面結果把瀏覽器測試刪掉
- 再覆蓋 connector 輸入 `/mcp/`、實際 `/mcp` 的情境，證明測到的是正規化後的 URL

### 跨 origin 與降級：檢查接收端為零

- 讓入口分別轉到另一 host、另一非預設 port，以及 HTTPS→HTTP
- 使用隔離環境的假憑證與可計數的接收端，不使用正式 token
- 預期被拒絕的目標沒有收到任何請求；client 拋錯與接收端零次請求都要保存
- 額外把循環 redirect 納入，確認請求有界限，應用自己的 retry 不會形成另一個無限迴圈

### OAuth 與 proxy：不能只驗 MCP 初始化

- 對實際使用的 discovery、token 路徑分別建立直接回應、同源 redirect 與跨源 redirect 案例
- 加入 gateway 後重跑，觀察 transport 與 OAuth 的實際目的地，而非只看 logical URL
- 若使用 custom fetch，先證明它尊重 manual redirect；mock 一個 status 0 回應只能測錯誤分支，不能代替真實瀏覽器行為

## 升級前先列出會偷偷轉向的路由

下一步可以很小：從一個即將升級的 MCP 整合，列出設定 URL、connector 使用 URL，以及 gateway、OAuth endpoint 的路由。把 canonical host、尾斜線、HTTP 升 HTTPS 等補正規則標出來，逐個換成直接抵達預期服務的配置，並跑完上面的正負案例。

若一時無法調整 route，就記錄確切阻塞條件與負責修正的元件，暫停該整合的升級驗收。不要以自訂 fetch 自動跟隨所有轉向、關閉 TLS 檢查或略過 issuer 驗證換取綠燈。這次 patch 對工程流程的具體要求，是讓「連得上」同時帶有可查證的目的地與 runtime 條件。
