# GPT-6.1 Terra：畫面操作的可重做邊界

查核時間：2026-10-27（Asia/Taipei）。基準 main：7c612b9268a8d5dfbac59661f7e8d7643c273f36。

## 來源與去重

- https://openai.com/index/introducing-gpt-6-1-terra/ ：OpenAI 一手發布公告，全文已讀；模型視覺推理、電腦操作定位、發票處理例子，以及最複雜 coding 仍建議 Sol/Astra。發布日期由下列系統卡核實，查核日另外標明。
- https://developers.openai.com/api/docs/models/gpt-6.1-terra ：官方完整模型頁已讀；Responses 工具限制、effort 預設與 Standard 價目/快取/長 context 條件。`.md` 官方版本的 web tool 因 unsupported text/markdown 失敗，正常 HTML 版本成功，不使用搜尋摘要替代。
- 以 Terra、來源 URL、accepted-task、token 成本與畫面操作搜尋 src/content/blog、docs/research、docs/article-queue.md。已有 `gpt-6-1-sol-cost-per-accepted-task.md` 與 `haiku55-subagent-accepted-task-cost.md`，所以沒有再以每個驗收任務的成本公式為主軸。新文核心決策是電腦操作依可恢復性分派模型，以及寫入結果不明時停止重新寫入；內鏈兩篇既有成本方法。
- 系列：AI Agent 工程化與工作流實戰。編號 92 由本批整合者協調保留。

- https://deploymentsafety.openai.com/gpt-6-1-terra/ ：官方系統卡 Published October 26, 2026 與首段 Today introducing 核實發布日期。正文僅引日期，不引用安全評測比例。

## 段落對應與限制

- 新模型定位：發布公告。未採用官方 9 倍成本等評測倍率，避免離開 benchmark 範圍。
- API 遷移：模型頁明文 Tool calling requires Responses API；reasoning effort medium default。非聲稱所有 endpoint 均支援工具。
- 價格：Standard 每百萬 tokens input1/cached0.05/output5 美元；cache writes30m1.25、12h2.50；輸入大於272K整個request input/cache2倍、output1.5倍。未套用 Fast/Batch/Flex/區域價格，不提供具體帳單試算。
- 採購案例、狀態不明不重試、ID 查核、分層路由與驗收均為原創工程建議。非 OpenAI 實測、非實際私人專案；沒有宣稱已執行模型或 GUI 測試。
- 不將拒收、工具故障與外部狀態不明視為同一個模型品質問題。較強模型不能替代授權或識別外部副作用。

## 圖片與驗收交接

封面由本批整合者用正式 imagegen 製作，最終 coverAlt 必須按實際圖像填寫。文章沒有流程圖或可執行程式碼。僅此文與研究記錄由撰稿子任務編輯；未 stage、commit、push。最後 format、政策、check、test、build、視覺與正式部署驗證由整合者執行，不在此預稱通過。

## 獨立來源審稿

2026-10-27 10:08（Asia/Taipei），來源研究子任務 research_oct27_ai_tech 核對正文 API、effort、Standard、cache-write 與大於272K的整請求價格，未發現技術或來源阻擋。提醒 usage 欄位須按實際 API 回應核實，正文已寫成核對 usage 與帳單可用欄位的建議。封面 alt 仍待整合者依實際生成圖替換。人文化腳本已執行，最初3個提示性冒號已改直述，複跑0機械命中。

封面生成與全尺寸/卡片驗收、預覽環境限制記錄見 [本批素材紀錄](mcp-toolbox-storage-allowlist.md#最終素材及預覽紀錄)。
