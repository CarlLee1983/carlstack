# GitHub Actions 日誌密鑰掃描查核（2026-11-10）

## 去重與出版決策

- 起點 main：`11772b1`。以完整主來源 URL、穩定 slug `2026-11-09-secret-scanning-detects-secrets-in-github-actions-workflow-logs`、Actions workflow logs、secret scanning 與中文關鍵字搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md`，未有同題。GitHub open PR 清單為空。已與其他兩篇進行中稿件確認無重複。
- 既有 Actions lockfile 文處理依賴版本與審查，新文處理執行後的秘密輸出、預覽限制與事件處理，讀者收穫不同。兩篇互相內鏈，不改既有 publishDate，也不為單純內鏈新增 updatedDate。
- 新文納入「現代網路協定與 API 平台架構」第 32 篇，GPUStack 稿預留第 33 篇。推送前再確認最新 main 與系列順序，僅非 force 推送。
- 使用隔離 checkout，不修改其他稿件與站台設定。`trail` 與 `.trail/cache` 不可用，依 AGENTS、內容指南、schema 與 repository skills 查閱脈絡。

## 一手來源與結論

1. https://github.blog/changelog/2026-11-09-secret-scanning-detects-secrets-in-github-actions-workflow-logs/
   - 2026-11-09 公開預覽。Enterprise Cloud 加 Secret Protection 或 Advanced Security，含 GHE.com data residency。
   - 預設關閉，適用上述授權下已啟用 secret scanning 的 repositories。enterprise owner 從 Policies → Advanced Security 的 All repositories 啟用。
   - run 完成後掃描 provider patterns，只掃開啟後完成的 run，不回補歷史。generic/custom/AI-detected 與已 masked 的值不偵測。
   - 預覽不發通知，需直接查看 repository secret scanning 告警。支援類型做 validity checks；日誌刪除後告警保留。
2. https://docs.github.com/en/enterprise-cloud@latest/code-security/concepts/secret-security/secret-scanning#secrets-detected-in-github-actions-workflow-logs
   - 獨立確認預設關閉、run 完成後掃描、不回補、各項排除及不通知。
   - 同一告警可包含多個 run/job 位置，連到 workflow 與 log line，沒有日誌行內預覽。
   - 文件稱 new workflow runs，公告稱啟用後完成。文章將驗收 run 安排在啟用後才開始，不推論跨切換時間 run 的額外承諾。
3. https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-code-security-and-analysis-for-your-enterprise#enforcing-a-policy-for-secret-scanning-in-github-actions-workflow-logs
   - 企業範圍政策，All repositories 選單，並非每 repo 獨立試行開關。
4. https://docs.github.com/en/code-security/reference/secret-security/supported-secret-scanning-patterns
   - Provider、generic、AI-detected 的類別與能力不同；validity、Base64 等要依 secret type 個別核對。沒有把通用掃描免費方案的說明誤套本次預覽。
5. https://docs.github.com/en/actions/reference/security/secure-use#use-secrets-for-sensitive-information
   - 遮罩依 runner 可及值與相符內容，結構化或轉換後值可能失敗。需檢查正常及錯誤輸出，處理外洩值要輪替並清理日誌。
6. https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#masking-a-value-in-a-log
   - 先 add-mask，再輸出。範例 runtime UUID 假值無存取能力，僅為遮罩對照，不當作 provider 偵測陽性樣本。
7. https://docs.github.com/en/code-security/tutorials/remediate-leaked-secrets/evaluating-alerts#checking-a-secrets-validity
   - active／inactive／unknown 的語義。unknown 包含不支援與無法驗證，inactive 仍須調查過往未授權使用。
8. https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets#using-secrets-in-a-workflow
   - OIDC 可減少長效秘密儲存，仍須服務與工作流支援。沒有把它當成所有類型的即時替代。

## 分析與實測界線

沒有啟用真實 Enterprise 租戶、製造真憑證外洩、量測掃描 SLA 或確認 webhook 通知。本次只做來源查核與範例 shell 語法檢查，成稿明示未實測。二十分鐘是清楚標示的假設 workflow 長度。值班交接、敏感部署後查看、證據欄位與隔離樣本均屬作者建議。

## 封面方向與驗收

對照 Actions lockfile 的木框／藍橘／斜角日光，以及近期 Synology 文的黏土 NAS／陶橘深紫／近景。新文改用紙雕版畫、俯視紙帶與放大鏡、鼠尾草綠與象牙白、均勻散射光。僅沿用橫向比例；媒材、構圖與配色均不同。

內建 image_gen 原創生成，最終 `src/assets/covers/github-actions-log-secret-scanning.webp` 為 1672×941。完整圖與 360 px 卡片已直接檢視，無文字、商標或浮水印。紙帶、紅色鑰匙與未響鈴是概念視覺，不宣稱為產品介面或技術圖。

生成指示：以紙雕及版畫風呈現完成的 CI 日誌紙帶進入托盤，放大鏡圈出紅色鑰匙，旁有未響鈴；綠白主色、無字無商標，縮圖可辨。

## 編輯與驗證

- 已依 humanize-writing 逐段審稿，`check_zh.py` 無機械命中。獨立內容審閱核對一手文件後確認沒有事實與範例阻擋。
- 標題採最新編輯方向「GitHub Actions 日誌的密鑰掃描」，簡短自然，操作主張放正文。
- Node 24.22.1、pnpm 12.1.0。以可寫的 COREPACK_HOME 完成 `pnpm install --frozen-lockfile`，lockfile 未變。範例 shell `bash -n` 通過，不宣稱已在 GitHub runner 執行。
- 已嘗試 `pnpm dev`。將 Astro config cache 放在可寫目錄後回報啟動，但本機 HTTP 與可用瀏覽器皆無法連線，瀏覽器回報 `ERR_CONNECTION_REFUSED`。未更改 sandbox、安全設定或檢查規則。桌面／320 px／深淺色頁面視覺預覽未完成，此限制另行回報。封面仍已直接檢視。
- 沒有新增正文 SVG 或 Mermaid。完整發布 gate 與 production 索引驗證在最後成稿後執行。

### 最終檢查結果

已整合先發布的 Nitro main `f736123bdf3bdfe60cc96e81e835ce5c78a34222`，重新完成 frozen install、format、stage、content policy、check、117 項測試與獨立 final build。check 的 Astro 診斷為 0 errors、0 warnings、0 hints。過程中兩次 build 被環境以 exit 137 終止；最後用 1024 MB Node heap、兩條 worker threads 與圖片處理執行緒重跑成功，未停用檢查或改動站台設定。

最終 dist 已驗證唯一 h1、正式 canonical、主來源 URL、封面檔案／尺寸／alt、首頁、文章列表、RSS、sitemap、系列第 32 篇、對應文章的 Pagefind fragment，以及 Actions lockfile 文的雙向內鏈。Pagefind 輸出 776 個頁面，既有 zh-hant stemming 提示與 thrift／redis 高亮 fallback 不影響本篇驗收。正式部署仍需以遠端 commit 的 workflow 與公開網址另行驗證。

## 系列順序驗收補記（2026-11-10）

完整 YAML 解析發現 Go JSON v2 與 Alpine OpenSSH 原本同為 28。依既有發布日期，保留 Go 28，僅調整 Alpine／SonicOS／Synology／本篇為 29–32，GPUStack 新文接 33。既有 publishDate、正文與封面不變。最終排序以完整 frontmatter 值核對，不以是否有引號的文字搜尋判斷。
