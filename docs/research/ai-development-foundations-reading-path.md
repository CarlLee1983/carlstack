# AI 開發基礎目錄導讀查核

- 查核日期：2026-10-31。
- 新文章：`src/content/blog/ai-development-foundations-reading-path.mdx`。
- 授權範圍：使用者要求依分類整理基本知識，以目錄導讀串起文章。此篇建立模型應用開發的初學路徑，不重寫 AI Coding 入門或擴大為工具採購清單。
- 選題來源：Itsrohitdev，Facebook Reel `1421684673366162`。
- 正規化 URL：https://www.facebook.com/reel/1421684673366162
- 分享 URL：https://www.facebook.com/share/r/1Dq3FPQp23/
- 來源定位：沿用本批工作已確認的公開影片字幕與畫面主題（AI roadmap）；未聲稱取得音訊逐字稿。影片僅作選題來源，不用它支持技術規格。

## 去重與既有內容

檢查 `src/content/blog`、`docs/research`、`docs/article-queue.md`，此穩定 ID 與分享 URL 沒有既有文章對應。`ai-coding-beginner-learning-route.md` 是用 AI 協助寫程式與驗收軟體，本篇是將模型接入後端應用，學習目標不同，正文已相互區分並連到舊文。現有四篇 Claude Prompt Engineering 文章為 `draft: true`，本篇不連向未發布頁，也未擅自修改或發布它們。

站內內鏈選擇：

- `rest-graphql-request-response-foundations`：已發布，基本請求／回應觀念。
- `ai-coding-beginner-learning-route`：已發布，不同學習路線。
- `ai-abstraction-contracts-and-acceptance`：已發布，契約與結果未知的延伸。
- `open-source-ai-stack-blueprint-architecture`：已發布，明標進階工具棧，不當先修。
- `agent-database-authorization-boundary`：已發布，進階授權邊界。
- `trace-engineering-for-agents`：已發布，進階工作追蹤。

## 一手來源與段落對應

1. https://platform.claude.com/docs/en/api/messages
   - 完整頁面可讀；Messages 接受結構化訊息並生成下一則訊息。
   - 支持「把模型當成有輸入輸出的 API」。不引用會快速變動的模型名、價格或特定 SDK 版本。
2. https://platform.claude.com/docs/en/about-claude/glossary
   - 完整頁面可讀；context window、token、RAG 等詞。
   - 支持「知道模型看得到哪些資料」的基本定義。
3. https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations
   - 完整頁面可讀；模型可能產生不實或與上下文不一致的內容，允許不確定及引用證據的緩解方向。
   - 不宣稱這些方法能完全消除幻覺。
4. https://platform.claude.com/docs/en/test-and-evaluate/define-success
   - 完整頁面可讀；具體且可測量成功條件、任務指標、延遲及費用。
   - 支持「用固定題目檢查提示修改」；12 個案例為作者教學安排，沒有採用官方範例百分比。
5. https://www.anthropic.com/research/contextual-retrieval
   - 完整頁面可讀，2024-09-19；檢索相關資料供生成、關鍵字與語意檢索各有優勢。
   - 支持 RAG 基本流程；未搬用廠商效能提升數字，未宣稱親測。
6. https://platform.claude.com/docs/en/build-with-claude/embeddings
   - 完整頁面可讀；文字數值表示與語意相似度。
   - 支持 Embedding 定義；省略供應商推薦與模型表，避免工具清單。
7. https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
   - 完整頁面可讀；client tool 結構化呼叫由應用執行。
   - 支持工具執行與模型建議的責任分離；不把 client tool 行為錯套所有 server tools。
8. https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
   - 完整頁面可讀；prompt injection、least privilege、output validation、human in the loop。
   - 支持「工具權限與部署仍由程式負責」。沒有提供攻擊實作或對外測試。

## 教學判斷與未實測

- 客服分類、12 封信、人工接手、只開唯讀工具、資料最小化與有限重試是明示的教學設計／工程建議，非任何公司實務或官方通用門檻。
- JSON 只示意應用契約，非可直接執行 API 程式碼。
- 沒有呼叫付費模型，沒有模型準確率、延遲、價格或壓測結果。
- `working-with-messages` 網頁讀取逾時，改用實際可讀的 API reference 支持同一基本命題，不以搜尋摘要代替原文。
- 封面與其實際 alt、整體格式／建置／正式部署由整合者驗收。本文沒有冒稱已發布或已完成實頁目視。

## 文字檢查

執行 humanize-writing 的 `check_zh.py`。保留目錄清單的冒號：這是導讀清單排版，不是懸念句。其餘聊天殘留提示已改寫。人工檢查基本術語均有解釋，進階內鏈有標記，沒有虛構第一人稱試作。
