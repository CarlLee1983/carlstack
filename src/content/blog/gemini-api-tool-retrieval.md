---
title: "Gemini API 的工具檢索與 token 成本"
description: "比較 Gemini Interactions API 一次載入全部工具、由 Google 按需載入，以及由應用程式查找工具的成本。用客服工具的例子說明該量哪些 token、延遲和成功率。"
publishDate: 2026-11-20T10:03:41+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - API 整合
series: AI Agent 工程化與工作流實戰
seriesOrder: 117
cover: ../../assets/covers/gemini-api-tool-retrieval.webp
coverAlt: "灰色多層圖紙櫃中有一個抽屜拉開，裡面立著橘色和藍綠色的圖紙。"
---

客服助理接了訂單、物流和帳務系統。客人問「包裹到了嗎」，模型只需要查貨態，卻可能在每次呼叫都讀進退款、發票和對帳工具的參數定義。工具多了，可以把少用的參數留到要呼叫時再載入。要不要這樣做，取決於省下多少工具定義，以及查找時得重讀多少對話。

Google 在 [2026 年 11 月 19 日宣布 Tool Retrieval 預覽](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-api-tool-retrieval/)。功能限定 [Interactions API 的 `v1beta`](https://aistudio.google.com/docs/tool-retrieval)，`generateContent` 不支援。實際可用模型以[官方清單](https://aistudio.google.com/docs/tool-retrieval#supported-models)為準。以下依公告與文件核對，沒有實打 API、量測延遲或驗證帳單；客服案例與數字是教學假設。

## 三種方式提供工具

### 工具少，就直接送

呼叫模型前先按任務選好工具。例如從訂單明細打開的客服助理，可以只收到查訂單和查貨態兩個工具的完整定義。模型第一次推理就有參數格式，不必另外搜尋。如果入口已經能判斷是哪個業務，先把工具清單縮小，再決定要不要引入檢索。

### 固定清單裡的少用工具，交給 Gemini 查找

在 `tools` 放入 `{"type": "tool_search"}`，並對少用的函式設 `defer_loading: true`。此時仍須在 API 請求送出完整工具宣告。推理開始時，模型先看到延後載入工具的名稱與簡短說明，等它選到工具才載入參數 schema。常用的查貨態工具可以照常提供完整定義。伺服器端模式也能把整個 remote MCP server 的工具設為延後載入。[設定與限制](https://aistudio.google.com/docs/tool-retrieval#server-side)

可以從 `interaction.steps` 辨別 `tool_search_call`、`tool_search_result` 和實際工具呼叫。案件期間一旦載入 schema，後續會留在上下文，不能在同一對話卸載。若由應用程式保存對話歷史，接續呼叫時須原樣保留檢索步驟及其 `signature`，別只保存最後的 `function_call`。對自訂函式，執行與回傳結果仍是應用程式的工作。[回應格式](https://aistudio.google.com/docs/tool-retrieval#server-side-response)、[無狀態對話](https://aistudio.google.com/docs/tool-retrieval#stateless)

### 工具由應用程式決定時，自己查找

若可用工具隨租戶、身分或整合版本變動，應用程式可以宣告 `execution: "client"` 的 `tool_search`，由模型提出搜尋，程式再從自己的登錄表挑出這次可用的函式定義，透過 `function_result` 送回。每次搜尋多一次應用程式與 API 的往返。兩種搜尋模式不能在同一請求混用，這個模式也不用 `defer_loading`。[應用端檢索](https://aistudio.google.com/docs/tool-retrieval#client-side)

若助理能查退款進度，也能發起退款，我會在送出定義前就依使用者身分篩選。執行函式時仍要重新確認租戶、訂單歸屬和退款權限。模型之前看過某項工具，或搜尋剛好找到它，都不代表現在有權執行。工具由工作流程揭露再撤銷的另一種設計，可對照 [Deepagents 的 skill 工具管理](/blog/deepagents-skill-tools-runtime-boundaries/)。

## 一次 HTTP 請求也可能把對話讀兩遍

伺服器端搜尋不會多一次應用程式往返，但 Gemini 會在同一 HTTP 請求內再做一次推理，讀入原先的上下文與剛取出的 schema。這段用量計在 `total_tool_use_tokens`。工具清單摘要與搜尋指令則從一開始就占用輸入。Google 未另收工具檢索費，仍按所用模型的正常 token 費率計費；命中隱式快取的部分另按快取費率。[計價細節](https://aistudio.google.com/docs/tool-retrieval#pricing)

假設某客服請求帶 12,000 個 token 的歷史、所有工具定義共 4,000 個 token，直接載入時，第一次推理讀 16,000 個 token。換成伺服器端檢索後，若工具摘要和搜尋指令合計 500 個 token，第一次讀入 12,500 個。但若接著搜尋一次，找到一個 300 個 token 的 schema，第二次又讀約 12,800 個，合計約 25,300 個。這是只算到模型提出業務工具呼叫為止的估算，未計快取、輸出或後續工具結果，不能換成實際帳單。它說明一件事：第一筆 `total_input_tokens` 降了，這次任務不一定比較便宜。

## 用一批客服問題比較

可以先用測試資料挑一批既有問題，包含只查貨態、需跨系統查詢、名稱相近的工具，以及使用者無權操作的案例。用同一個模型、相同的歷史與函式回傳，重播直接載入和伺服器端檢索。如果需要動態篩選才另外測應用端檢索，不必一次改完。

每個問題記錄找到哪個工具、是否完成任務、從提問到答覆的時間，以及所有請求的 `total_input_tokens`、`total_tool_use_tokens`、`total_cached_tokens` 和生成用量。用同一模型的計價方式估算每個完成任務的成本；另看 p95 延遲，不要把冷快取和熱快取混成一個平均。遇到搜尋沒結果時，伺服器端可能只回文字，不能靠有沒有 `tool_search_result` 判定是否成功，應核對預期的工具有沒有呼叫。[已知限制](https://aistudio.google.com/docs/tool-retrieval#limitations)

我會從少用且唯讀的工具開始。若同一批任務的完成率下降、延遲超過目標，或完整互動沒有省下費用，就保留原本直接載入的做法。每次都要用的工具，留在起始清單即可。
