# GitHub AI Scan REST 管理查核

查核日期：2026-11-14（Asia/Taipei）。

## 選題與去重

最新 main 起點 585f8584c0d851da27fea84e13b1cc81adf692fb，獨立 worktree。
在 src/content/blog、docs/research、article-queue 以 AI Scan、repository_scan、ai-scan、精確公告 URL 查核，沒有同題。與 Actions 日誌密鑰掃描不同，新增內鏈但不更改舊文日期。現代網路協定與 API 平台架構最高33，新文34。11/14 系統設計文另計，不重寫。人類最新標題方向優先，使用直接描述主題的標題。

## 一手來源與段落對應

- https://github.blog/changelog/2026-11-13-manage-ai-scan-for-repositories-using-the-rest-api/
  - 發布日期 11/13；開頭、設定層級與同請求原子性。repository_scan 新增、公開預覽、組織開啟繼承可退出、組織關閉不得個別啟用、enterprise禁止回422、GHES不支援、啟用不啟動工作。
- https://docs.github.com/en/rest/code-scanning/code-scanning
  - Get/Update AI Scan org/repository 章節全文讀取。端點、GET/PATCH、fine-grained token read/write permission、422含validation/spam。組織GET明示stored值，成稿不把它當完整掃描證明。
- https://docs.github.com/en/code-security/concepts/code-scanning/ai-scan-for-repositories
  - 讀取概念、billing、limitations、enablement。手動掃描default branch、credits、無schedule/push、time-budget非窮盡。個人公開repo亦列可用，但本篇以組織管理為範圍，未誤稱個人不可用。

40/2與10/7/6是教學假設；批次對帳、權限拆分、原值紀錄及讀回均為工程建議。未執行租戶API變更或真實掃描，無可執行範例、無效能宣稱。

## 封面方向

對照近期 error response 的暖色紙板近景靜物、Cargo cooldown 的陶橘沙漏照片。新圖改為版畫紙雕、斜向俯視開關與檔案卡、深藍象牙芥末黃、平光。媒材、構圖、色盤與前圖不同；只保留橫幅。

正式 image_gen 生成原圖，存為 src/assets/covers/github-ai-scan-rest-api.webp，1600×900。全尺寸與480×270卡片直接目視通過，無商標或錯誤文字；程式符號為視覺符號。alt符合控制面板/檔案卡/獨立按鈕實際畫面。

生成prompt：原創wide16:9技術編輯插圖，手工版畫與紙雕，深藍開關控制盤連接檔案卡、獨立啟動按鈕，象牙與芥末黃，不使用商標、文字、霓虹或盾牌。非產品截圖。

## 驗收

- Node24.22.1、pnpm12.1.0；frozen install成功，lockfile未改。
- humanize逐段檢查完成，機械偵測唯一「只讀取」為正常語法，非「唯讀」的錯譯，無須強改。
- 完整技術檢查及正式站驗收於最終稿執行，結果由交付紀錄追蹤。
- GitHub open PR 查核結果為空。
- 本機預覽首次因預設config路徑不可寫失敗，改用可寫 XDG_CONFIG_HOME 後仍回報 Dev server process exited before becoming ready；localhost:4321無法連線。未繞限制，桌機/手機/深淺色本機實頁目視未完成，直接封面目視已完成。
- 獨立內容審閱核對一手原文無阻擋，依建議補 owner/security manager 角色與掃描前 credits/預算檢查。
