# Linux .NET tarball ownership：來源及編輯紀錄

2026-10-26 Asia/Taipei。基底 main 11d58e84fae86d2da323a08ece77b6dc2095c10d。已讀 AGENTS、content-guide、schema、copywriting 與 humanize-writing/zh-tw。Trail CLI/cache 不存在，fallback 搜尋 blog/research/queue 的 CVE、GHSA、tarball/ownership；沒有相同主題文章。與同日 OOB deployment 文章不同，這篇只處理安裝後的寫入權限及 archive 輸入。既有系列不貼合，暫不硬加 network/API 系列。

## 一手來源

- https://github.com/dotnet/aspnetcore/security/advisories/GHSA-r6pf-x897-gm86 ：已讀全文，含 Affected Products、FAQ、兩種 remediation。正文保留主 URL；細分分支版本表請直接回查來源，沒有複製完整表。查閱內容未提供實際利用證據。
- https://learn.microsoft.com/en-us/dotnet/core/install/linux-scripted-manual ：已讀 Manual install、Verify downloaded binaries，支持 no-same-owner 與 checksum 各自作用。
- https://www.gnu.org/software/tar/manual/tar.html ：已取得 GNU tar 1.35 官方文件 Attributes/選項內容；單獨 Attributes.html 兩次 timeout，未繞過。僅用完整手冊的實際可讀段落。
- https://www.gnu.org/s/tar/manual/html_node/Option-Summary.html ：GNU tar 選項語意，配合完整 manual 核對。

## 界線

教學場景不描述已發生的使用者或公司事故。沒有執行漏洞、下載/解壓受影響程式、修改系統權限或實測正式環境。正文沒有可直接執行的完整安裝腳本；操作是工程驗收安排，不能當成已完成稽核。owner、group 與上層可寫性應分開查，單一版本號無法還原安裝來源。source-build 使用與已部署 runtime 的區別保留。

封面、互連、發布時間與完整 gates 由整合者完成；此工作僅兩個文字檔，未 stage、commit 或 push。

## 封面與發布驗收

與同日OOB篇gouache紅藍燈具比較，本篇採black linocut/俯視木箱/黑白青綠/硬陰影，媒材、構圖、色系、光感均不同。正式image_gen生成1672x941，原檔../generated_images/exec-85d2bc9a-67dd-4733-931f-04161616e92e.png，sharp轉WebP。full與320x180卡片已實際目視無文字logo，alt依實圖。保留兩篇內鏈，無不必要圖解。

本機 ASTRO_TELEMETRY_DISABLED=1 pnpm dev --host 0.0.0.0 仍報 Dev server process exited before becoming ready。沒有繞過，桌機/320px/深淺色本機實頁未驗，依使用者預覽例外繼續，技術gates仍完整執行。正式線上另驗。
