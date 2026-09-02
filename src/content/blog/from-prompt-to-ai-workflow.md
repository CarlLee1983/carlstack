---
title: "從 Prompt 走向 AI Workflow：串接審查、工具與檢索"
description: "判斷何時使用單一 Prompt、prompt chaining、tool use 或 retrieval，並以原生工具協議、可觀測中間結果與停止條件建立最小工作流程。"
publishDate: 2026-08-31
draft: true
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
  - 軟體品質
series: Claude Prompt Engineering 實戰
seriesOrder: 4
cover: ../../assets/covers/prompt-to-ai-workflow.png
coverAlt: "深夜城市中藍色、金色與紫色光路穿越不同區域，最後匯聚於中央建築"
repositoryUrl: https://github.com/anthropics/prompt-eng-interactive-tutorial
---

Prompt 愈寫愈長，通常代表一個任務正在吞進太多責任：先搜尋資料、再判斷來源、接著計算、產生草稿、自己審查，最後還要修訂格式。這時繼續增加規則，不一定能提高可靠度，只會讓失敗更難定位。

Anthropic 互動式教程第九章與附錄把前面的技巧組合成複雜 Prompt，接著介紹 prompt chaining、tool use 與 search／retrieval。真正重要的分界不是 Prompt 長度，而是任務是否需要外部能力、可檢查的中間結果或確定性的程式控制。

## 先決定是否真的需要 Workflow

不要因為 Agent 很熱門，就把一次分類變成五個節點。可以用四個問題判斷：

| 情境                                       | 最小選擇          |
| ------------------------------------------ | ----------------- |
| 單一模型呼叫即可完成，結果容易驗證         | 一個 Prompt       |
| 中間產物需要獨立檢查或修訂                 | Prompt chaining   |
| 需要計算、查 API、讀資料庫或產生外部副作用 | Tool use          |
| 答案依賴 Prompt 之外的大量知識             | Search／retrieval |

同一個系統可能同時使用多種方式，但每新增一層都增加 latency、成本、錯誤處理與觀測需求。先停在能通過 evaluation 的最低複雜度。

## Prompt chaining：把生成與核准分開

Prompt chaining 適合有固定步驟，而且每一步都值得檢查的任務。Anthropic 的現行 [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) 仍以「產生草稿、依標準審查、根據審查修訂」作為常見模式。

<div class="my-8 overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6">
  <svg viewBox="0 0 800 130" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="pc-flow-title pc-flow-desc">
    <title id="pc-flow-title">Prompt Chaining 審查與修訂閉環流程圖</title>
    <desc id="pc-flow-desc">展示輸入與任務契約生成草稿，依 rubric 審查，符合標準交付，需修改則依問題修訂再審查。</desc>

    <defs>
      <marker id="pc-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#58a6ff"/>
      </marker>
    </defs>

    <rect x="20" y="20" width="140" height="38" rx="6" fill="#1f242c" stroke="#58a6ff"/>
    <text x="90" y="44" fill="#58a6ff" font-size="11" font-weight="700" text-anchor="middle">輸入與任務契約</text>

    <path d="M 160 39 L 200 39" stroke="#58a6ff" stroke-width="1.5" marker-end="url(#pc-arr)"/>

    <rect x="200" y="20" width="110" height="38" rx="6" fill="#161b22" stroke="#388bfd"/>
    <text x="255" y="44" fill="#58a6ff" font-size="11" font-weight="700" text-anchor="middle">產生草稿</text>

    <path d="M 310 39 L 350 39" stroke="#58a6ff" stroke-width="1.5" marker-end="url(#pc-arr)"/>

    <polygon points="410,15 470,39 410,63 350,39" fill="#241b35" stroke="#bc8cff" stroke-width="1.2"/>
    <text x="410" y="43" fill="#d2a8ff" font-size="10" font-weight="700" text-anchor="middle">依 rubric 審查</text>


    <path d="M 470 39 L 630 39" stroke="#3fb950" stroke-width="2" marker-end="url(#pc-arr)"/>
    <text x="540" y="31" fill="#3fb950" font-size="10" font-weight="700" text-anchor="middle">符合標準 ➔</text>

    <rect x="630" y="20" width="140" height="38" rx="6" fill="#1b2e23" stroke="#238636" stroke-width="1.5"/>
    <text x="700" y="44" fill="#3fb950" font-size="12" font-weight="700" text-anchor="middle">✅ 交付 (Deliver)</text>


    <path d="M 410 63 L 410 90" stroke="#f85149" stroke-width="1.5" marker-end="url(#pc-arr)"/>
    <text x="420" y="80" fill="#f85149" font-size="9">需修改</text>

    <rect x="330" y="90" width="160" height="32" rx="4" fill="#2d1d24" stroke="#da3633"/>
    <text x="410" y="111" fill="#f85149" font-size="10" font-weight="700" text-anchor="middle">根據具體問題修訂</text>

    <path d="M 330 106 L 255 106 L 255 58" fill="none" stroke="#bc8cff" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#pc-arr)"/>

  </svg>
</div>

這個拆法的價值不只是「讓模型再想一次」，而是每輪有不同責任與可觀察輸出。Reviewer 應回傳具體缺口，修訂步驟只處理那些缺口，workflow 也要限制最大循環次數。

## Tool use：模型選擇，應用程式執行

原教程的工具附錄使用 `<function_calls>`、regex 與 `stop_sequences` 手動解析工具請求。那是歷史版本，不應直接移植到新系統。

現行 [Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) 將工具分成 client tools 與 server tools。Client tool 的基本流程是：

1. 應用程式把工具名稱、描述與 input schema 傳給 Claude；
2. Claude 回傳 `tool_use` block；
3. 應用程式驗證參數、檢查權限並執行工具；
4. 應用程式以 `tool_result` 把結果送回；
5. Claude 根據真實結果繼續回答。

<div class="my-8 overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6">
  <svg viewBox="0 0 800 230" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="tu-seq-title tu-seq-desc">
    <title id="tu-seq-title">Tool Use Client-Server 互動時序圖</title>
    <desc id="tu-seq-desc">展示使用者提出任務，應用程式傳遞工具定義給 Claude，Claude 回傳 tool_use，應用程式驗證並執行工具後將 tool_result 回傳給 Claude 完成回答。</desc>

    <defs>
      <marker id="tu-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#58a6ff"/>
      </marker>
    </defs>


    <rect x="30" y="10" width="130" height="32" rx="6" fill="#1f242c" stroke="#58a6ff"/>
    <text x="95" y="31" fill="#58a6ff" font-size="12" font-weight="700" text-anchor="middle">使用者 (User)</text>

    <rect x="230" y="10" width="140" height="32" rx="6" fill="#161b22" stroke="#388bfd"/>
    <text x="300" y="31" fill="#58a6ff" font-size="12" font-weight="700" text-anchor="middle">應用程式 (App)</text>

    <rect x="440" y="10" width="130" height="32" rx="6" fill="#241b35" stroke="#bc8cff"/>
    <text x="505" y="31" fill="#d2a8ff" font-size="12" font-weight="700" text-anchor="middle">Claude (LLM)</text>

    <rect x="640" y="10" width="130" height="32" rx="6" fill="#1b2e23" stroke="#238636"/>
    <text x="705" y="31" fill="#3fb950" font-size="12" font-weight="700" text-anchor="middle">外部工具 (Tool)</text>


    <line x1="95" y1="42" x2="95" y2="215" stroke="#30363d" stroke-dasharray="3 3"/>
    <line x1="300" y1="42" x2="300" y2="215" stroke="#30363d" stroke-dasharray="3 3"/>
    <line x1="505" y1="42" x2="505" y2="215" stroke="#30363d" stroke-dasharray="3 3"/>
    <line x1="705" y1="42" x2="705" y2="215" stroke="#30363d" stroke-dasharray="3 3"/>


    <path d="M 95 65 L 300 65" stroke="#58a6ff" stroke-width="1.5" marker-end="url(#tu-arr)"/>
    <text x="195" y="58" fill="#c9d1d9" font-size="9" text-anchor="middle">1. 提出任務</text>


    <path d="M 300 90 L 505 90" stroke="#58a6ff" stroke-width="1.5" marker-end="url(#tu-arr)"/>
    <text x="400" y="83" fill="#c9d1d9" font-size="9" text-anchor="middle">2. 任務 ＋ 工具定義 Schema</text>


    <path d="M 505 115 L 300 115" stroke="#bc8cff" stroke-width="1.5" marker-end="url(#tu-arr)"/>
    <text x="400" y="108" fill="#d2a8ff" font-size="9" text-anchor="middle">3. tool_use (名稱與參數)</text>


    <path d="M 300 140 L 705 140" stroke="#3fb950" stroke-width="1.5" marker-end="url(#tu-arr)"/>
    <text x="500" y="133" fill="#3fb950" font-size="9" text-anchor="middle">4. 驗證權限並執行工具</text>


    <path d="M 705 165 L 300 165" stroke="#3fb950" stroke-width="1.5" marker-end="url(#tu-arr)"/>
    <text x="500" y="158" fill="#3fb950" font-size="9" text-anchor="middle">5. 工具執行結果或錯誤</text>


    <path d="M 300 185 L 505 185" stroke="#58a6ff" stroke-width="1.5" marker-end="url(#tu-arr)"/>
    <text x="400" y="178" fill="#58a6ff" font-size="9" text-anchor="middle">6. tool_result</text>


    <path d="M 505 205 L 95 205" stroke="#3fb950" stroke-width="2" marker-end="url(#tu-arr)"/>
    <text x="300" y="200" fill="#3fb950" font-size="10" font-weight="700" text-anchor="middle">7. 最終結構化回答交付用戶</text>

  </svg>
</div>

模型可以建議呼叫哪個工具，不能替應用程式決定是否有權刪除資料、發送訊息或花費資金。不可逆操作的核准與 idempotency 必須留在模型之外。

## Retrieval：把來源帶進來，不是把答案塞進去

當答案依賴文件庫、產品資料或最新資訊時，retrieval 的工作是找出候選來源，保留來源 ID 與必要片段，再讓模型根據這些資料回答。

一條最小 retrieval pipeline 通常包含：

1. 將問題轉成搜尋條件；
2. 取回少量相關文件與 metadata；
3. 要求模型只根據文件回答，並依回應模式附 citation blocks 或結構化來源欄位；
4. 文件不足時拒答或擴大搜尋；
5. 記錄 query、命中文件與最後引用。

不要把整個資料庫塞進 context。檢索品質、切片方式與來源 freshness 都需要獨立 evaluation；模型無法從一份沒被找回來的文件得到正確答案。

若選擇 API 原生 citations，就不要在同一個 request 啟用 `output_config.format`；兩者目前不相容。需要嚴格 JSON 時，改由 schema 定義來源欄位並自行驗證。[Citations 相容性說明](https://platform.claude.com/docs/en/build-with-claude/citations#citations-and-structured-outputs)

## 一個最小可驗證的 Workflow

以「根據內部文件回答技術問題」為例，第一版不需要自由規劃的 Agent：

```yaml
steps:
  - retrieve_documents
  - answer_with_sources
  - validate_source_support
fallback:
  - insufficient_sources
limits:
  max_retrieval_rounds: 2
  max_documents: 8
```

這是流程設定示意，不是特定框架的可執行設定。重點是每個步驟都有固定輸入輸出、明確 fallback 與停止條件。若 evaluation 顯示固定 pipeline 已足夠，就不需要讓模型動態發明新步驟。

## 觀測中間結果，才能知道該修哪裡

一次 workflow 失敗可能來自完全不同的地方：

- 搜尋沒有找到正確文件；
- 工具 schema 讓模型選錯參數；
- 工具執行成功，但回傳內容過於冗長；
- 回答引用了來源，卻推論過度；
- reviewer 的 rubric 太模糊；
- 重試沒有新證據，只是在重複生成。

因此 trace 至少要保存步驟名稱、工具輸入輸出摘要、來源 ID、驗證結果、錯誤類型與停止原因。不要保存或展示模型的私密推理過程；保存能重現行為的外部證據即可。

這也呼應[上一篇 Harness Engineering](/blog/harness-engineering-for-reliable-agents/)的結論：Prompt 描述任務，harness 則負責工具、狀態、權限、驗證與復原。

## 結語：在 Prompt 失去單一責任時停手

單一 Prompt 適合單一、可直接驗證的轉換。當任務需要外部事實、確定性計算、可核准的副作用，或需要獨立檢查中間產物時，就把那些責任移到 workflow。

好的 AI workflow 不是讓模型做更多，而是讓模型只負責最擅長的判斷，其他部分交給可以驗證、可以限制，也可以在失敗時局部重來的系統。
