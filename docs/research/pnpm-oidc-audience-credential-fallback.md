# pnpm 12.12.1：audience 與憑證回退查核

查核時間：2026-10-12，Asia/Taipei。文章：`src/content/blog/pnpm-oidc-audience-credential-fallback.md`。

## 去重與內容增量

在 checkout main `b3ab3e4` 搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md` 的兩個原始 URL、版本 `12.12.1`、`NPM_ID_TOKEN`、`audience`、`dist-tag`。無相同 release 文章；有 `npm-trusted-publishing-dist-tag-permissions.md`，站內日期 2026-10-01，來源公告日期 2026-09-30。

本篇聚焦 pnpm 新客戶端對注入 token 的 audience 檢查、warning 後回退既有憑證，以及多 registry CI 如何驗收 OIDC-only。既有文章介紹 npm 平台的 dist-tag opt-in 授權。本篇加入既有文章連結，反向連結交由整合發布者處理，未修改舊文。沒有硬納入系列；內容屬於套件發布的獨立升級驗收。

## 一手來源與核對結果

1. [pnpm release blog](https://pnpm.io/blog/releases/12.12.1) 與 [GitHub release](https://github.com/pnpm/pnpm/releases/tag/v12.12.1) 均已直接讀取。GitHub releases API `published_at` 為 `2026-10-11T11:30:09Z`；tag 對應 `65f29a55286fafa57dbf2770e8d2304df0091cfd`。保留兩個原始 URL 於正式文章。
2. [PR #16840](https://github.com/pnpm/pnpm/pull/16840)：2026-10-11T10:21:49Z 合併，commit `42651359d611ef56a53459b5216062008827ed19`。透過 GitHub API 讀 metadata、比較 v12.12.0...v12.12.1 的 patch，再讀 release tag 的程式碼，非只根據 PR 摘要。PR 描述有維護方測試宣稱；本文未將其轉為本站實測結果。
3. [`id_token.rs`](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/crates/publish/src/oidc/id_token.rs)：`NPM_ID_TOKEN` 優先；expected audience 是 `npm:` 加 `Url::host_str()`，字串完全相等或陣列包含即接受；missing、malformed、mismatch 走 `ERR_PNPM_ID_TOKEN_REGISTRY_AUDIENCE_MISMATCH`。該分支 return 後不再走 GitHub request endpoint。URL 的 port 與 path 不包含在 audience，故本文自行要求 full URL 白名單。
4. [`provenance.rs`](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/crates/publish/src/oidc/provenance.rs)：此次重用的 `id_token_payload` 只拆出 payload、base64url 解碼與 JSON parse，沒有驗 JWT signature。文章提醒 client prefilter 不能取代 registry 驗證。
5. [`publish_options.rs`](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/crates/publish/src/publish_options.rs)：`GetIdTokenError::IdToken` 轉 `Skipped OIDC` warning、`Ok(None)`；其他 identity 取得錯誤向外傳。`fetch_auth_token` 失敗則 warning 後 `Ok(None)`。OIDC 成功才覆寫 `auth_token_override`。`find_registry_info` 是 manifest `publishConfig` registry → scoped registry → default；`publish_config_registry` 也會先看 publishConfig 裡對應 scope 的 registry。正文採足夠精確的總括描述，沒有將所有 CLI 優先序一概化。
6. [`dist_tag/registry.rs`](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/crates/cli/src/cli_args/dist_tag/registry.rs)：`auth_header_for_registry` 共用 OIDC，`Some(false)` 略過 provenance；有 OIDC token 時取 bearer，否則 `auth_header_for_package` 使用既有配置。
7. [`id_token/tests.rs`](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/crates/publish/src/oidc/id_token/tests.rs)：直接讀測試，確認 matching string、mismatched string、matching array；mismatch 的 fake fetch 為 unreachable，證明預期不送交換前身分取得請求。
8. [`dist_tag/oidc.rs` 測試](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/crates/cli/tests/suite/dist_tag/oidc.rs)：read-only 核對 mock add/rm/ls、--registry、scoped registry、401 exchange fallback、GitHub 身分請求 403 fallback、缺少 OIDC env、GitLab forwarded token、`.npmrc` unchanged 與不做 visibility probe。未在本站執行這些測試。
9. [v12.12.1 dist-tag 文件](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/docs/cli/dist-tag.md)：Allow npm dist-tag、GitHub id-token: write、forwarded NPM_ID_TOKEN 優先、暫存記憶體、不寫 .npmrc、不產 provenance。
10. [GitHub/npm 2026-09-30 公告](https://github.blog/changelog/2026-09-30-opt-in-dist-tag-permissions-for-npm-trusted-publishing/)：直接讀取，opt-in 預設 off（新舊 configuration 都一樣），權限獨立於 direct publish；公告沒有承諾逐 tag 白名單，因此本文的 allowedTags 明確標為團隊自訂政策。
11. [PR #16838](https://github.com/pnpm/pnpm/pull/16838)：2026-10-11T09:27:56Z 合併。`tool:` 是 RFC 第一個相容步驟；仍寫 `runtime:` 到 specifier 與 lockfile key。另讀 [`tool-protocol/src/lib.rs`](https://github.com/pnpm/pnpm/blob/v12.12.1/pnpm/crates/tool-protocol/src/lib.rs) patch，確認兩種協定的相等性 helper。named registry 不能叫 tool 由 release 明列。

## 原創驗收契約與未實測範圍

- 未安裝或執行 pnpm 12.12.1，未發布 npm 套件，未變更任何 dist-tag、Trusted Publishing、CI 設定或憑證。checkout 的 `pnpm --version` 是 11.25.0，不能冒稱 pnpm 12 測試。
- YAML 是本文設計的 release wrapper／測試契約，不是 pnpm 原生設定；example.com 與套件名是占位值，沒有提供或要求真實 token。
- 錯誤 audience + 無備援、錯誤 audience + 刻意備援、完整目的地白名單、opt-in 權限負向測試，都是工程建議。本文沒有宣稱這些新增案例已在本文環境執行。
- audience 比對不是 JWT signature validation；同 hostname 不同 port/path 沒有 audience 隔離；因此需要完整 URL 政策。這是基於程式碼的推論，非擴張 release 的安全保證。
- 警告名稱只能用來辨識已知回退路徑，不能靠沒有 warning 證明 token-free；還需清除所有靜態憑證來源並確認真正授權寫入。公開 `ls` 成功不足以證明 OIDC 寫入授權。
- 未宣稱所有 OIDC 失敗都回退；identity request transport 與 invalid request URL 是 hard error，token exchange 的失敗處理另有分支。
- 本文描述一般 per-package publish 與 dist-tag；沒有把結論擴張至 batch publish。程式註解明列 batch 可停用 per-package OIDC。

## Cover Direction

已檢視鄰近 Rollup 木紙軌道、GenOffice 毛氈櫃，以及當日 Postiz 酒紅赭黃色版畫。本文採透明玻璃動態雕塑／斜向分岔／冰藍杏銅與炭黑／邊緣光；保留不同形狀通行物與入口匹配、獨立備援路徑的意象。內建 imagegen 生成原創封面，存為本地 1672×941 WebP。全尺寸與 360×225 中央卡片裁切已看，沒有文字或 logo；coverAlt 與實際圖面一致。

## 檢查

已對這兩個 Markdown 檔單獨執行 Prettier write 與 check，通過。直接呼叫 repository 的 `changedArticlePolicyViolations` 檢查新文章（避免未 stage 的檔案被 git diff gate 漏看），零違規。另完成 YAML 解析、必填欄位／日期 offset／cover 存在與站內連結檢查。沒有宣稱已跑正式 content schema、astro check、test 或 production build；整合者處理 draft:false、相互連結與完整發布 gate。本研究者未操作 git index、未 commit/push、未跑全站 format。

整合補記：已以官方 registry 的 pnpm 12.1.0 成功 frozen install（不是本文研究的 12.12.1），未修改依賴或 lockfile；正常 dev 在 ready 前退出，未宣稱完成整頁互動 preview。新文無 SVG 圖解。舊文先加反向連結；獨立審查又發現直接相關的逐 tag 權限、stage publish 及完全防護保證有誤，故窄幅更正並設定 updatedDate，保留原 publishDate。官方 https://docs.npmjs.com/trusted-publishers/#for-github-actions 明列 npm stage publish 始終允許；移除未有來源的2027全面禁令，將 tag 白名單明標團隊 wrapper，示意Workflow採 env/quote與next/beta白名單、僅接受三段數字版本。未操作任何真實npm設定或tag。

獨立 reviewer 對新文及舊文窄修完成 delta review，無 blocker。舊文新的 Bash 輸入保護在隔離程序測試：next/1.2.3、beta/4.5.6 接受；latest、含 shell 分號的版本字串、帶 prerelease 後綴均拒絕。這只驗 wrapper 白名單（最後 npm 命令以 printf 替代），未執行任何實際 dist-tag 變更或完整 GitHub Actions workflow。
