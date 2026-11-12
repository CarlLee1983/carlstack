# 2026-11-12 科技文章批次

Asia/Taipei 日期去重，基底 main 6cffee0d574700fa6b9d54c84fc4429eaa20f378。當日已有系統設計第29課，不計入快報。本批次AWS Emulator、Aspire CLI、Google Gemini Decisions API各處理不同主題。OpenAI Decisions既有文章保留並從Google新文互鏈。open PR查詢為空。

先讀AGENTS、內容指南、schema、部署workflow與copywriting/humanize技能。trail命令與cache不可用，改查原檔。標題依使用者最新偏好直接說明主題，優先於舊指南「標題是主張」。

## 環境與預覽

使用目前雲端獨立checkout。凍結依賴安裝：初始pnpm11不合engines，改用官方registry pnpm12.1.0。標準下載有tunnel失敗，經核准網路權限安裝完成，未更動lockfile。

本機Astro dev先因telemetry設定目錄不可建立退出；改用工作區可寫設定路徑與停用telemetry後仍在ready前退出，無監聽4321。未繞存取限制。完整本機桌面/手機/深淺色視覺驗收未完成。三篇無新SVG，封面全尺寸與卡片裁切另已目視。發布後須另核實正式頁、封面、列表/搜尋及系列。

## 最終驗收

統一format、stage本批次檔案後執行 content:policy -- HEAD、check（含完整build與Pagefind）、test。最後輸出逐篇核對RSS/Sitemap與適用系列。依結果記錄，不把commit當正式上線。
