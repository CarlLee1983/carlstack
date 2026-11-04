# Safari Adaptive Dark Mode 來源與編輯紀錄

- 查核時間：2026-11-04T09:59:00+08:00。
- 文章：`src/content/blog/safari-adaptive-dark-mode-visual-contract.md`。
- 主來源與正規化 URL：https://webkit.org/blog/18541/introducing-adaptive-dark-mode/ 。穩定文章 ID：18541。作者：Simon Fraser、Luming Yin、Lily Spiniolas、Joanne Pan、Veda Periwal、Jen Simmons。
- 事件與公告：2026-11-03，Safari 27.3 beta 新功能公告，非正式版發布。
- 去重：fresh main eb74f70；搜尋 `Adaptive Dark`、`18541` 於 blog、research、queue 未命中。無前端呈現相容性系列，建立「前端呈現與相容性實戰」第 1 篇，僅內容 frontmatter，不改站台設定。
- 原候選 CodeQL 2.27.3 雖在 11/3 發布 GitHub changelog，官方 release 日期為 10/20，未作為當日新進展撰文。未建立其文章。

## 來源對應

1. WebKit 上述公告全文：開頭版本與日期、第一節 SVG/canvas/JavaScript 顏色行為、第三節 `only` 在 beta 1 尚未支援。初始 HTML/CSS 宣告建議亦見 Building your own dark mode。全文已讀，沒有使用搜尋摘要替代。只摘要與本篇決策有關的少量事實，未轉載原文或圖片。
2. https://www.w3.org/TR/css-color-adjust-1/#color-scheme-prop ：第二節色彩方案宣告、UA 元件與作者顏色的分工。2025-12-16 Candidate Recommendation Snapshot；未宣稱為最終 Recommendation。
3. https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html ：第四節文字對比 4.5:1 與大字 3:1、存在例外。此文件為理解指南，不將其本身稱為規範條文。未據數值宣稱整站無障礙合格。

## 事實、建議與未驗證範圍

- 訂單後台與測試資料皆虛構教學案例。採用順序、完整區塊處理、停止條件與驗收清單皆作者工程建議。
- 未執行 Safari 27.3 beta、未做該功能實機效能、渲染、無障礙測試，文章開頭明示。不得把此文章站台 build/測試等同測過 Safari 功能。
- 未提供可執行示例，CSS property/token 只用於說明官方概念。
- 沒有宣稱 Adaptive Dark Mode 適用所有正式版，也沒有用偵測或 fingerprinting 技巧取代驗收。
- 封面由發布者正式生成後補實際 alt、尺寸、全尺寸與卡片檢查。未使用 WebKit 圖片。
- 最終格式、內容 policy、check、test、build、部署與正式頁面驗證由發布者整合執行，此處尚未聲稱完成。

## 整合驗收紀錄

2026-11-04：正式生圖工具產生原創封面，輸出本地 1600×900 WebP。逐張檢查全尺寸及400×225卡片，無文字、Logo或浮水印；替換實際coverAlt。三篇分別使用米白綠色紙黏土檢查站、紫黃網頁網印插畫、深灰金屬伺服器攝影概念，媒材、構圖及色盤均區隔。完整技術gates與正式部署驗證另於交付紀錄確認。

本地預覽限制：pnpm dev --host 0.0.0.0 回報 Dev server process exited before becoming ready；雲端瀏覽器 localhost:4321 為 ERR_CONNECTION_REFUSED。未完成本地桌機/手機深淺色實頁目視，依使用者授權不因此阻擋發布；不宣稱Safari beta功能或WordPress/APM案例實測。
