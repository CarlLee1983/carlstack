# 基礎知識分類導讀整合紀錄

2026-10-31 基礎知識分類內容批次，整理公開教學來源並建立閱讀目錄。

## 去重與範圍

基底 main `5d84b27bc82096f0fa1029aa288790285a1dadda`，已核對 GitHub 最新 main。檢查 AGENTS、content-guide、schema、deploy workflow、article-queue、現有文章與研究紀錄；依來源網址、作者、主題與實際稿件去重。

Linux 已有三篇，沿用 `/blog/linux-operations-reading-path/` 及原系列。新增四個閱讀入口：API 與網路、Web 安全、程式設計與演算法、AI 開發。只有程式分類缺少核心入門正文，新增排序、排程等待與公平、典範混用三篇；其餘由導讀本身補足基本解釋，連結已發布基礎文，進階文明標延伸。沒有空白待填章節，也沒有把每個 Reel 重寫一篇。

各篇公開影片來源、官方文件與段落對應見個別文章和研究紀錄。重複的 API 通訊方式分享只計一次；Cookie 與 Session 教學重用既有基礎文，不另寫同核心文章。這些是公開影片的題材，沒有收集或保存任何使用者的登入 Cookie、Session ID 或其他憑證。Linux 目錄結構影片尚未單獨成章，未宣稱本批涵蓋所有 Linux 目錄教學。

必要連結不更動舊文章系列歸屬。新系列各導讀 order 1，程式正文 order 2–4。API 舊安全文只做可核實勘誤，保留 publishDate，更新 updatedDate；沒有全面重新包裝舊文章。

## 技術與品質驗收

- Node 24.22.1，pnpm 12.1.0，`pnpm install --frozen-lockfile` 已成功，不改 lockfile。
- 可執行排序與計價 JavaScript 斷言由作者及獨立審查各實跑；排程數值重算，無壓測聲稱。SQL 和 HTTP 示意清楚標示未執行。
- 七篇經獨立審查，站內連結避免 draft 文章。新圖解原生 SVG，窄版 HTML 卡片，既有主題 token；靜態座標審查不等於視覺驗收。
- 七張封面正式 imagegen 原創生成，像素、WebP 容量、全尺寸與卡片裁切見封面紀錄。
- 本機預覽伺服器未能啟動，瀏覽器回報 ERR_CONNECTION_REFUSED。未聲稱完成本機桌機或手機實頁目視。最終建置與正式站驗證另在發布收據記錄，不把這個預覽限制當成省略其他檢查的理由。

本紀錄僅描述截至整合時已完成的檢查；完整 format、policy、check/build、test、精確 main 部署與正式站確認，以最終發布收據為準。
