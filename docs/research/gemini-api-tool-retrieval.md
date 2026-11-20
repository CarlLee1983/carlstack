# Gemini API Tool Retrieval 查核

- 查核：2026-11-20（Asia/Taipei）
- 文章：`src/content/blog/gemini-api-tool-retrieval.md`
- 目標：比較同一批工具使用全量定義、Gemini 伺服器端檢索和應用端檢索的取捨，指出單次 HTTP 與模型推理次數不同。
- 基線：checkout `21206de`。搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md` 的公告及文件 URL、`gemini-api-tool-retrieval`、Lucia Loher、Nora Kassner、Tool Retrieval、`tool_search`、`defer_loading`。沒有同源或同一 Gemini API 讀者任務的舊稿。既有 Deepagents 文章聚焦技能開關與撤銷，與本篇有相關但非同題；Antigravity Orchestrator 文章是模型交接，無須互鏈。
- 系列：AI Agent 工程化與工作流實戰，checkout 尾篇順序 116，本篇預定 117，發布前再次確認。
- 站內連結：與 Deepagents 的技能及工具載入文章互鏈，保留既有文章發布時間。

## 一手來源

1. [Google 公告](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-api-tool-retrieval/)：2026-11-19，Lucia Loher、Nora Kassner。查的是正文與直接文件連結，不採用頁面的 AI 摘要。公告與文件同時支持 Interactions API 預覽、伺服器端和應用端檢索的分工。
2. [官方 Tool Retrieval 文件](https://aistudio.google.com/docs/tool-retrieval)：
   - [模式比較](https://aistudio.google.com/docs/tool-retrieval#choosing-a-mode)：伺服器端同一次 API 請求，應用端每次搜尋往返一次。應用端搜尋可回傳動態的函式宣告。
   - [伺服器端模式](https://aistudio.google.com/docs/tool-retrieval#server-side)：`defer_loading` 支援 function、mcp_server，前者仍須向 API 提供完整工具宣告。延後的是模型初始 context 的參數 schema，不是 HTTP payload。
   - [無狀態對話](https://aistudio.google.com/docs/tool-retrieval#stateless)：整個搜尋歷史及 signature 原樣接續，不能只留一般函式步驟。
   - [計價與 usage](https://aistudio.google.com/docs/tool-retrieval#pricing)：搜尋內部再推理，`total_tool_use_tokens` 包含完整上下文及新載入的 schema；快取用量獨立檢視。已載入 schema 在後續保留。無檢索附加費和淨輸入成本下降是不同主張。
   - [限制](https://aistudio.google.com/docs/tool-retrieval#limitations)、[模型](https://aistudio.google.com/docs/tool-retrieval#supported-models)：`v1beta`；不支援 `generateContent`；不能在同一請求混合兩種檢索；伺服器端搜尋未命中可回文字。

## 可驗證範圍

- 未呼叫 Gemini API，未測模型正確率、MCP、快取、價格或延遲。沒有可執行範例。
- 計算是自訂假設：12,000 + 4,000 = 16,000；12,000 + 500 = 12,500；12,500 + 300 = 12,800；12,500 + 12,800 = 25,300。計算只到第一次業務函式呼叫。
- 文章中的權限篩選與重新授權、比較方式為設計建議；不是 Google 對工具檢索的安全承諾。

- 正式封面由原創生圖工具產生，再轉 WebP 1440 × 810（148,266 bytes）；已目視全尺寸構圖及 320 × 200 模擬置中裁切。
