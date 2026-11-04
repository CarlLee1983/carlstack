# APM Dependabot 版本更新：來源與驗收紀錄

- 查核時間：2026-11-04T09:59:00+08:00。
- 稿件：`src/content/blog/apm-dependency-behavior-review.md`。
- 選題新進展：GitHub 2026-11-03 發布 APM Dependabot version updates 支援，並非新安全漏洞公告。
- 系列：AI Agent 工程化與工作流實戰，第 111 篇。發布前須再次核對並行稿件與最新 main。
- 去重：父工作以 fresh main `eb74f70afce816c6fd734132497746f94b64138e` 搜尋 APM、Agent Package Manager、公告識別 URL，未見核心同題。這篇不重算 Dan Koe 個別來源文章。

## 原始來源與段落對應

1. [GitHub 11/3 changelog](https://github.blog/changelog/2026-11-03-dependabot-version-updates-support-agent-package-manager/)
   - 開頭：支援 APM git 依賴更新 PR、既有 lockfile 重生。
   - 僅 version updates，不含 security updates。
   - 已讀公開全文，無登入或付費牆。
2. [GitHub APM 支援規格](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories#apm)
   - 「哪些依賴會被更新」：SemVer、完整 SHA、branch 的更新差異與未支援形式。
   - branch ref 需要既有 lockfile，manifest 不變，Dependabot 不主動建立不存在的 lockfile。
   - SHA 更新指向 latest annotated non-prerelease release tag，不能簡化成最新 branch commit。
   - 正文只列部分未支援形式，並明示「例如」，完整清單仍以官方為準。
3. [APM 官方首頁](https://microsoft.github.io/apm/)
   - 「追到實際內容」：lockfile 固定精確版本與內容雜湊。
   - 模型與 harness 版本留存是原創工程建議，沒有主張 lockfile 保證模型輸出一致。
4. [APM Governance deep-dive](https://microsoft.github.io/apm/enterprise/governance-guide/)
   - 開頭 policy engine maturity 與第 2 節：policy engine early preview、安裝時檢查不是 runtime sandbox。
   - 使用固定 APM 版本及實測執行規則是對官方限制的工程建議。

## 原創分析與限制

- 退款助手、四類測試案例、工具替身、停止條件及回退安排均為教學假設或作者工程建議。
- 沒有安裝 APM、執行 Dependabot、測試模型或真實付款，不聲稱通過行為測試或具備效能結果。
- 沒有發布可執行配置，避免用未驗證 YAML 冒充可用設定。
- 不把版本更新包裝成安全更新，也不宣稱 updater 涵蓋所有 APM manifest 形式。
- 正式稿預留封面路徑由父工作生成；目前 coverAlt 必須於看到圖片後替換。

## 封面與發布驗收待續

- 父工作負責原創封面方向矩陣、生圖、像素/容量/全尺寸/卡片裁切檢視及最終 coverAlt。
- 父工作負責格式、content policy、check、test、build、精確 commit 部署與正式文章/封面/索引/搜尋驗證。
- 此紀錄不代表上述發布驗收已完成。

## 整合驗收紀錄

2026-11-04：正式生圖工具產生原創封面，輸出本地 1600×900 WebP。逐張檢查全尺寸及400×225卡片，無文字、Logo或浮水印；替換實際coverAlt。三篇分別使用米白綠色紙黏土檢查站、紫黃網頁網印插畫、深灰金屬伺服器攝影概念，媒材、構圖及色盤均區隔。完整技術gates與正式部署驗證另於交付紀錄確認。

本地預覽限制：pnpm dev --host 0.0.0.0 回報 Dev server process exited before becoming ready；雲端瀏覽器 localhost:4321 為 ERR_CONNECTION_REFUSED。未完成本地桌機/手機深淺色實頁目視，依使用者授權不因此阻擋發布；不宣稱Safari beta功能或WordPress/APM案例實測。
