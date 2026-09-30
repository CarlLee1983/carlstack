# Cloudflare User Insights 任務分析查核

查核日：2026-09-30。文章：`src/content/blog/cloudflare-user-insights-model-routing.md`。

## 去重與範圍

研究前搜尋 User Insights、Cloudflare AI Gateway，並在取得主來源後搜尋完整公告 URL 與 `2026-09-29-user-insights-task-analysis`，未找到既有文章或佇列。主來源保留在正式文章。納入 AI Agent 工程化與工作流實戰第 39 篇，既有最大 order 為 38。

## 一手來源與結論

- [9/29 公告](https://developers.cloudflare.com/changelog/post/2026-09-29-user-insights-task-analysis/)：任務分組、對話回合、模型適配、成本與延遲；Potential Savings 是候選，分析不另收費。
- [8/5 公告](https://developers.cloudflare.com/changelog/post/2026-08-05-user-insights/)：User Insights 先前已推出，9 月不是首次發布。
- [User Insights](https://developers.cloudflare.com/ai-gateway/observability/user-insights/)：身分歸因需要 metadata 或 Access；一般用量觀測與分類啟用條件不可混用。
- [Log classification](https://developers.cloudflare.com/ai-gateway/observability/log-classification/)：預設關閉、逐 gateway 開啟，需要 Collect logs；會分析儲存的 prompt、回應、metadata、對話識別。四種 model-fit 標籤含 Could not assess。
- [Custom metadata](https://developers.cloudflare.com/ai-gateway/observability/custom-metadata/)：可攜帶應用分類；不推論成可匯入自訂品質 gate。
- [Dynamic Routing](https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/)：條件、比例分流、版本回復。
- [JSON Configuration](https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/json-configuration/)：success 是開始串流，fallback 是重試後失敗或逾時，不含語義驗收。
- [Compat endpoint](https://developers.cloudflare.com/ai-gateway/usage/chat-completion/)：一般單模型已 deprecated，但動態路由仍需使用；新的推論 REST API 尚不涵蓋動態路由。

## last30days 執行與取捨

使用已安裝 v3.23.0、Python 3.14.6，三條自訂 query plan，CloudFlare、LLMDevs、LocalLLaMA、AI_Agents targeting，cloudflare/ai repo，關閉 browser cookie。原始資料保存在 `/Users/carl/Documents/Last30Days/cloudflare-ai-gateway-user-insights-raw-v3.md`，已附 web supplements。

回傳 20 Reddit threads、2 YouTube videos、15 HN stories、1 GitHub item、18 Digg clusters。這是搜尋輸出數，不是新功能的合格證據數。YouTube 的 Vercel Sonnet 報導屬於另一產品，不採用；cf CLI、crawler 與安全話題不能證明任務分析有效。arXiv timeout，不能解讀為沒有討論。X 未啟用。沒有可支持新功能實際節費的代表性社群證據，文章以一手文件為依據，不宣稱實測。

## 封面與驗收契約

最近封面為深色檔案櫃／紅線攝影與暖白紙雕。本文選俯視冷灰工作台、薄荷綠與銀色精密零件、明亮漫射日光，至少在構圖、色盤與光線上不同。

使用 built-in imagegen，未使用 API fallback。最終檔案：`src/assets/covers/cloudflare-user-insights-model-routing.png`。已檢視原圖，無文字、logo 或 watermark。

Prompt：Horizontal 16:9 editorial engineering cover, straight overhead bright precision metrology workbench, three differently sized titanium tools, oversized gear, small fitting green ceramic gauge in circular fixture, sorted task tokens. Museum-quality product still life, pale cool grey, mint and silver, soft daylight, sparse asymmetry, readable thumbnail. No words, numbers, logos, screens, UI, arrows or watermark; avoid cabinets, red threads, paper sculpture and conveyors.

文章 YAML 是自訂契約示意，不是平台可執行設定；5% 為示範，不是通用安全閾值。沒有部署實際 route，也沒有執行模型比較。

獨立 reviewer 發現日誌計費漏項，已補充首次 gateway 日期分界與條件式費用說明，並將日誌費用納入淨節省。Auto Router 訊號改引官方 aggregate changelog。

## 發布驗證

`pnpm format`、stage 後的 `pnpm content:policy -- HEAD`、`pnpm check`（含 production build 與 Pagefind）及 `pnpm test` 通過，57 個測試成功。獨立 reviewer 的 delta review clean。Chrome 檢視桌面深色與 320 px 深淺色首屏；320 px 的 document scrollWidth 為 320，無整頁水平溢出。RSS、Sitemap、系列頁包含新 slug。
