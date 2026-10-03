# GitHub installation token：格式遷移查核

查核日期：2026-10-03（Asia/Taipei）。基準 main：7181c02fa44aa0fd680abb5f566ff888ac87f345。

## 去重與讀者收穫

以原始與正規 URL、穩定 slug `2026-10-02-stateless-github-app-installation-tokens-rolled-out`、`ghs_APPID_JWT`、`stateless`、`installation token`、`GitHub App` 與無狀態相關詞搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md`，未找到同來源或 installation token 遷移專文。既有 API 安全文討論一般驗證機制，未涵蓋此次 rollout。發布前再次檢查 main，來源與去重結果未變。

新文章的主張是：格式遷移的驗收需追到儲存讀回、出站代理與日誌末端。與既有 async merge 文章的操作終態邊界不同，互加站內連結。納入「現代網路協定與 API 平台架構」第 13 篇，接續現有第 12 篇。

## 一手來源與界限

- 2026-10-02，GitHub Changelog，Stateless GitHub App installation tokens rolled out：https://github.blog/changelog/2026-10-02-stateless-github-app-installation-tokens-rolled-out/ 。核對分階段推出完成、新發行預設格式、約 520 字元與原 40 字元、權限／repository scope／一小時期限／REST endpoint 不變，以及過渡 header 停用日為 2026-11-30，要求此前移除、該日期之後不再受理；未公布時區與時分。正式文章保留來源 URL。
- 2026-05-15（頁面附 5 月 26 日與 6 月 10 日更新說明），GitHub Changelog，Per-request override header：https://github.blog/changelog/2026-05-15-github-app-installation-tokens-per-request-override-header/ 。核對 `enabled`／`disabled`／其他值忽略、opaque string 約定與新舊格式驗收後移除 header。期限採較新的 10 月公告；不沿用早期未定日期。範圍限 GitHub Enterprise Cloud 與 Data Residency 的 App installation server-to-server token，包含 Actions GITHUB_TOKEN；GitHub Enterprise Server 不受此次變更影響。
- GitHub Docs，Generating an installation access token：https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app 。核對回應的期限／權限／repository 欄位，不建議從 JWT 內部自行取得授權結論。
- GitHub Docs，Best practices：https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app 。核對安全儲存、後端加密、最小權限與 token 洩露後立即撤銷的官方建議。

沒有建立 GitHub App、發行或接觸真實 token、呼叫授權 API，亦無效能量測。本文開頭故障是具名假設案例。round-trip、端到端代理、錯誤路徑遮罩測試與 YAML 是本文的工程驗收建議，所有 YAML 證據預設 pending。未把 GitHub 的效能敘述改寫成測量數字，也未把約 520 字元當成固定驗證長度或未來上限。

## 封面方向

- 最近發布文章：織機／寫實木材與織物／斜角近景／紫褐、金、深綠／暖色側光。
- 同系列前篇 async merge：票券與積木／紙與壓克力／斜俯視／琥珀、鈷藍、桃色／明亮斜射日光。
- 本篇：完整長帶與寬裕門框／陶瓷雕塑／正面低角度／青綠、冷白、銅色／柔和漫射光。媒材、構圖、色盤與光線均不同。

封面以內建 image generation 生成，輸出 WebP 1600×900。單圖與 320px 縮圖均已檢視，無文字、標誌或浮水印；長帶完整穿過門框。提示主軸：single continuous matte teal ribbon through three roomy white ceramic portals, unused open copper caliper, low frontal side angle, cool off-white gallery, diffuse overcast light, no words, numbers, logos, tokens or interfaces。
