---
title: "pnpm 12.12.1 檢查 OIDC audience，CI 仍要驗收憑證回退"
description: "pnpm 12.12.1 會略過 audience 不符的 NPM_ID_TOKEN，並回退既有憑證。從實作與上游測試拆解多 registry CI 的目的地白名單、OIDC-only 驗收，以及 dist-tag 權限邊界。"
publishDate: 2026-10-12T10:16:34+08:00
draft: false
featured: false
tags:
  - 開源專案
  - 安全架構
  - DevOps 與 CI/CD
cover: ../../assets/covers/pnpm-oidc-audience-credential-fallback.webp
coverAlt: "藍色透明球體與琥珀色三角柱分別停在圓形與三角形閘門前，兩條軌道通往不同入口，象徵憑證與目的地必須匹配，以及分開驗收的認證路徑。"
---

[pnpm 12.12.1](https://pnpm.io/blog/releases/12.12.1) 於 [2026 年 10 月 11 日發布](https://github.com/pnpm/pnpm/releases/tag/v12.12.1)，新增一個容易被綠燈 CI 掩蓋的行為：`pnpm publish` 會先檢查注入的 `NPM_ID_TOKEN` 是否發給目標 registry；不符合就警告、略過，再使用已設定的憑證。

我的判斷是，這次升級應補上「到底用了哪條認證路徑」的驗收。若工作要求只用 OIDC，卻讓靜態 token 接手完成發布，exit code 0 仍不符合要求。

本文核對 release、PR 與 v12.12.1 原始碼，未執行真實 registry 發布。下列案例是建議的 CI 驗收契約；上游測試只作為實作證據，不代表本站親測通過。

## Audience 擋下錯送，回退仍可能讓工作成功

[`get_id_token` 的實作](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/crates/publish/src/oidc/id_token.rs) 先處理 `NPM_ID_TOKEN`，再決定是否向 GitHub Actions 取得 identity token。注入 token 的比對方式很具體：

- 以目標 registry 的 hostname 組成 `npm:<hostname>`，例如 `npm:registry.npmjs.org`。
- `aud` 是字串時須完全相等；是陣列時，其中一個字串相等即可。
- payload 無法解析、缺少 `aud` 或 audience 不符，都回報 `ERR_PNPM_ID_TOKEN_REGISTRY_AUDIENCE_MISMATCH`。

外層會把這類錯誤轉成 `Skipped OIDC` 警告，回退已設定的憑證。注入 token 不符時，也不會接著嘗試 GitHub 的 identity-token endpoint。這是 [`publish_options.rs`](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/crates/publish/src/publish_options.rs) 與前述分支合起來的結果。

這個本機篩選只讀取 payload 的 audience，沒有完成 JWT 簽章驗證；registry 端的身分驗證與套件授權仍然必要。另一方面，hostname 比對不包含 port 或 path。同一主機的 `/team-a/`、`/team-b/` 不會因此獲得不同 audience。這兩項限制都能從程式碼直接看出，不能把「audience 相符」當成完整目的地隔離。

## 多 registry 的白名單，要寫到完整目的地

我會把套件、完整 registry URL 與允許的認證方式放在同一份契約。以下是團隊自訂範例，必須由 release wrapper 或測試實作，pnpm 不會自動讀取這份 YAML：

```yaml
releaseTargets:
  "@example/public-lib":
    registry: "https://registry.npmjs.org/"
    auth: oidc-only
    audience: "npm:registry.npmjs.org"
  "@example/internal-lib":
    registry: "https://packages.example.com/npm/team-a/"
    auth: configured-credential
    credentialScope: "//packages.example.com/npm/team-a/"

promotion:
  allowedTags: [next, beta]
  allowLatest: false
```

`example.com` 與套件名都是占位值。這裡的 tag 白名單也是團隊政策，不能由 npm 的 `Allow npm dist-tag` 勾選推論出逐 tag 限制。

驗收時要比對每個套件最後選到的 registry，不能只看全域預設值。v12.12.1 的 [publish 目的地選擇](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/crates/publish/src/publish_options.rs) 會先採用 manifest 的 `publishConfig` registry 設定，再看 scoped registry，最後才用預設值。修改 `.npmrc`、`publishConfig` 或 CI 參數後，都應重跑這份契約。

公用發布工作若宣告 `oidc-only`，就要移除該工作可取得的靜態發布憑證，包含環境變數、認證檔與 token helper。私有 registry 若仍需既有憑證，將它列為獨立例外，限制在指定 URL 與套件；不要把同一組發布憑證順手帶進所有工作。

## 認證失敗的路徑，也要留下驗收證據

[上游 audience 測試](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/crates/publish/src/oidc/id_token/tests.rs) 已涵蓋相符字串、不符字串與相符陣列；[dist-tag 測試](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/crates/cli/tests/suite/dist_tag/oidc.rs) 則用 mock registry 檢查交換、回退與 scoped registry。團隊還需要把自己的配置放進測試，至少留下以下證據。

### 1. 正確 audience，沒有備援憑證

在專用測試套件或隔離 registry 執行授權寫入，確認目的地與套件相符，OIDC 交換成功，且工作未取得靜態憑證。保留認證方式與結果即可，不把 JWT、Authorization header 或認證檔原文寫入 log。

`dist-tag ls` 可用來確認結果，但公開套件可能允許匿名讀取；只看到列舉成功，證據不足以證明 OIDC 寫入授權可用。

### 2. 錯誤 audience，沒有備援憑證

在 mock 測試提供 audience 不符的合成 token。預期出現 audience 警告，且不送出該 token 的交換請求；需要認證的寫入不能成功。這能驗收 `oidc-only` 的失敗路徑，避免用真實 token 做錯送實驗。

### 3. 錯誤 audience，存在刻意允許的備援

在隔離環境配置測試用憑證，確認警告後確實使用指定 registry 的備援認證。如果這是私有 registry 的明列例外，結果可以接受；若屬於 `oidc-only` 工作，**即使寫入成功，驗收仍應失敗**。

### 4. 目的地被覆寫，或交換被拒絕

分別測試 scoped registry、`publishConfig` 與工作實際使用的 CLI 參數，確認完整 URL 仍在白名單內；不在白名單時，wrapper 應在任何認證請求前停止。再讓測試用交換 endpoint 回覆拒絕，檢查是否回退，以及團隊政策是否允許。

不要把所有 OIDC 故障都預期成回退。取得 GitHub identity token 時的網路錯誤、無效 request URL，會沿硬錯誤分支向外回報；「audience 不符」與「身分服務連不上」需要不同的診斷。這是 [token 取得錯誤分類](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/crates/publish/src/oidc/id_token.rs) 的差異。

## dist-tag 接上 OIDC，仍要另驗權限

這版的 `pnpm dist-tag add`、`rm`、`ls` 接上共用 OIDC 流程。使用 npm Trusted Publishing 時，套件設定仍須啟用 `Allow npm dist-tag`；由 GitHub Actions 取得 identity token 時，工作須有 `id-token: write`。暫時 token 留在記憶體，不寫回 `.npmrc`，標籤操作也不產生 provenance。[v12.12.1 dist-tag 文件](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/docs/cli/dist-tag.md) 列出了這些條件。

npm 平台早在 [9 月 30 日](https://github.blog/changelog/2026-09-30-opt-in-dist-tag-permissions-for-npm-trusted-publishing/) 就加入 opt-in 權限，背景可讀站內的 [npm Trusted Publishing 與 dist-tag 權限](/blog/npm-trusted-publishing-dist-tag-permissions/)。本次新增的是 pnpm 客戶端支援，以及它與憑證回退共用的行為。

驗收時，另用測試套件確認所有會匹配的 trusted publisher 設定都關閉 dist-tag 權限時不能改 tag，啟用指定設定後能對允許的測試 tag 完成 add、ls、rm。兩組工作都不能藏有備援憑證，否則無法判斷 npm 的 OIDC 設定是否生效；`latest` 不適合拿來試跑。

## `tool:` 是另一項相容性變更，可獨立排程

同版新增 `tool:`，用於 pnpm 自行下載的 Node.js、Bun、Deno 與 Yarn，例如 `pnx node@tool:22`。`runtime:` 保留為 alias，兩種寫法可通過對應的 lockfile 新鮮度檢查；named registry 則不能再叫 `tool`。[PR #16838](https://github.com/pnpm/pnpm/pull/16838) 也說明，這一步仍保留寫出的 `runtime:` specifier 與 lockfile key。

這項變更可另外檢查，不必為了採用 audience 檢查，同時大量改寫工具宣告與 lockfile。拆開變更，比較容易定位升級後的失敗來源。

## 下一步：為每個發布工作指定可接受的認證方式

升級 PR 應附上每個套件的完整 registry、允許的認證方式，以及錯誤 audience 的測試結果。對 `oidc-only` 工作，把意外回退列為不通過；對保留憑證的私有 registry，記錄例外範圍與撤除條件。這份證據補齊之後，CI 的綠燈才足以回答：發布成功了，而且使用了團隊允許的身分。
