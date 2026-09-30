# GPT-6.1 Sol 發布研究紀錄

查核日期：2026-09-30。搜尋期間：2026-08-31 至 2026-09-30。模型於 9 月 29 日發布，因此產品回饋主要是首日資料。

## 交付與範圍

文章：`src/content/blog/gpt-6-1-sol-cost-per-accepted-task.md`。最初請求為研究與撰文，後續使用者明確要求整理並發布；正式版含獨立封面，依內容指南驗證後提交、推送 main 與確認部署。去重搜尋未找到既有 GPT-6.1 Sol 文章，與 Harness 升級、dots 文章互相銜接，使用既有 AI Agent 系列第 37 篇。

## 一手來源與支持的事實

- [OpenAI API changelog](https://developers.openai.com/api/docs/changelog)：9 月 29 日發布、短 context Standard 價格、Responses 工具呼叫與 Multi-agent beta。已讀取網頁與 Markdown。
- [模型規格](https://developers.openai.com/api/docs/models/gpt-6.1-sol)：context 1,050,000、最大輸入 922,000、最大輸出 128,000；輸入文字與圖片、輸出文字；272K 計價門檻。已讀取網頁與 Markdown。
- [GPT-6 使用指引](https://developers.openai.com/api/docs/guides/latest-model)：effort 選項、none/minimal 不支援、工具呼叫需要 Responses。已讀取網頁與 Markdown。
- [模型選擇指引](https://developers.openai.com/api/docs/guides/model-selection)：同任務比較 Astra 的品質與成本。已讀取網頁與 Markdown。
- [GitHub Copilot 公告](https://github.blog/changelog/2026-09-29-gpt-6-1-sol-in-github-copilot/)：適用方案、逐步 rollout、管理者政策與供應方早期測試觀察。已讀取全文。
- [Artificial Analysis 原始評測](https://artificialanalysis.ai/articles/gpt-6-1-sol-replaces-gpt-6-sol-after-just-7-days-with-near-astra-intelligence)：9 月 29 日報告在 max effort 下 Sol 指標少 Astra 一分，該指標任務成本 US$0.72 / US$3.26。搜尋索引提供完整相關摘要；web open 無法開啟頁面，故未聲稱複核其完整測試方法。

## 社群證據

- [r/singularity 指標討論](https://www.reddit.com/r/singularity/comments/1wtixue/aa_intelligence_index_results_came_for_gpt61_sol/)：u/artin144 的「but cheaper」呈現價格取捨；不當成品質結論。
- [u/Nomad556 發布留言](https://reddit.com/r/OpenAI/comments/1wtg4f3/comment/pctug3d/)：「I literally can’t keep up or know the difference」呈現版本辨識負擔；不當成代表性調查。

## last30days 執行與限制

使用 v3.23.0、Python 3.14、三組具名實體 query plan，啟用 native web supplement，禁止 browser cookie reads。原始結果位於 `/Users/carl/Documents/Last30Days/gpt-6-1-sol-raw-v3.md`，已追加 WebSearch Supplemental Results。

結果包含 Reddit 17、YouTube 12、HN 20、GitHub 31、Digg 21、Techmeme 2 與 Polymarket 5。這些是擷取候選數，非全部可採用來源數。YouTube 只取得 2/12 字幕，其他字幕遇到 HTTP 429；X 未配置；Jobs 不可達；arXiv 無結果。

Polymarket 候選包含未來 Astra 與模型發布市場，未用它們證明已發布模型的品質或採用率。影片標題、無關 GitHub bot 留言、舊 GPT-6 模型回饋均未當成 GPT-6.1 Sol 的實測證據。

## 作者判斷與驗收

文章的固定任務集、成本式、停止規則與 Harness 分輪評估是作者提出的方法，非外部 benchmark，也未執行 API 實測。保留價格條件、發布入口差異與首日樣本限制。未增加依賴或修改架構邊界。

## 複核紀錄

獨立 reviewer 查核發布、推出、參數與價格，要求釐清 endpoint 遷移的實驗前提，已修正。模型規格 HTML 與 Markdown 對最大輸入欄位顯示不同，文章保守移除 922,000 數字，避免讀者將 context 減最大輸出當成一致保證。
