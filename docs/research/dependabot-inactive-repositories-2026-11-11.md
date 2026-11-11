# Dependabot 閒置專案警示政策查核

查核日期：2026-11-11（Asia/Taipei）。公告日期：2026-11-10。預定生效日期：2026-12-08。正式文章：`src/content/blog/dependabot-inactive-repositories.md`。

## 去重與範圍

基於 main `57194e239b7e3606c6e286c42b9822fdc607ecac` 搜尋文章、research 與 article-queue 的主來源 URL、標題與 inactive repositories，沒有同題文章。既有 GitHub Actions 日誌密鑰掃描文章談不同偵測對象，僅加入延伸閱讀。

這篇是供應鏈安全維運政策更新，與現有網路協定系列的連續教學主軸不同，不為了編號而加入該系列。此次不另開單篇系列。

## 一手來源

- [GitHub Changelog](https://github.blog/changelog/2026-11-10-dependabot-alerts-will-pause-on-inactive-repositories/)：直接開啟原文，核實生效日期、一年活動條件、alerts 封存與恢復、兩類政策例外，以及 github.com／GHE data residency／GHES 範圍。
- [Configuring Dependabot alerts](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/configure-dependabot-alerts)：核實個人帳號批次開啟及單 repo 設定路徑。網頁工具輸出標示 rewritten summary，另用 HTTPS 取得官方 HTML 原文閱讀設定內容，不以摘要冒充全文。
- [Creating a custom security configuration](https://docs.github.com/en/code-security/how-tos/secure-at-scale/configure-organization-security/establish-complete-coverage/create-custom-configuration)：同樣另取得官方 HTML，核實明確設定、Enforce 與適用 repo，以及付費功能提醒。
- [Enterprise Dependabot alerts policy](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-code-security-and-analysis-for-your-enterprise#enforcing-a-policy-to-manage-the-use-of-dependabot-alerts-in-your-enterprise)：用作政策頁參考。閒置例外的實質依據是直接閱讀的 Changelog。

## 事實與建議

公告尚未生效，未在實際租戶測試自動暫停、恢復或告警延遲。沒有修改任何安全設定。物流服務範例明標虛構；盤點部署、負責人、設定及已知警示的清單為工程建議。沒有推論 issue、瀏覽或服務流量可延長一年期限，也沒有把 security updates 設定視為政策例外。

## 原創封面

正式圖片工具生成原創圖像，檔案 `src/assets/covers/dependabot-inactive-repositories.webp`，1672 × 941、121316 bytes。已目視全尺寸與 480 × 270 卡片縮圖，無文字、標誌、水印，主要物件清楚。與最近綠色紙雕的 Actions 日誌封面比較後，採橘色攝影式材質、斜光與機櫃／日曆／警示燈／開關構圖，在媒材、色彩與構圖上區分。

## 編輯驗收

已閱讀 content guide、schema、humanize-writing 與繁體中文規則，人工確認標題直接描述政策內容，未沿用「主張式」長標題。執行 `check_zh.py` 並移除一處提示性冒號。沒有可執行程式範例或 SVG 圖解。最終 format、policy、check、test、build、部署與正式頁面由整合工作執行。本機 Astro dev 在 ready 前退出，完整本機桌面／320 px 深淺色目視未完成，不將封面靜態檢查當成頁面驗收。

## 整合驗收

以 main `57194e239b7e3606c6e286c42b9822fdc607ecac` 為基線，open PR 為空，當日既有系統設計第 28 課不計入快報。已以 pnpm 12.1.0 執行 frozen-lockfile 安裝，lockfile 未更動。使用雲端獨立 checkout，僅提交文章、封面、必要查核與內鏈。`trail` 與 `.trail/cache` 不可用，改直接讀取規範並完整搜尋來源與主題。

本機預覽在 ready 前退出，localhost 無法連線；完整本機桌面／320 px 深淺色目視未完成，按使用者允許例外保留限制。封面全尺寸與 320 px 卡片已靜態目視，不等同頁面驗收。文章不含新 SVG 或可執行範例。
