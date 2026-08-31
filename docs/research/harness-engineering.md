# Harness engineering：研究筆記

> 研究日期：2026-08-31（Asia/Taipei）
>
> 範圍：核對 X 貼文 [@0xwhrrari 原文](https://x.com/0xwhrrari/status/2093685107534000560) 所談的 harness engineering，並以 OpenAI、Anthropic 官方材料補足可驗證背景。本文不把模型能力、提示詞技巧與執行環境混為一談。

## 先說結論

「Harness engineering」可作為一個實用的系統工程框架：模型負責推理，harness 負責提供工具、狀態、回饋、權限、評估與可觀測性。這個框架與兩家模型供應商的公開經驗一致；文章重點不是宣布 prompt engineering 失效，而是把可靠度問題從單一提示詞擴大到完整執行環境。

## X 原文重點

以下摘要於 2026-08-31 直接讀取 X 內嵌長文後整理：

1. **模型只是推理引擎。** Harness 決定模型能看見什麼、能操作什麼、什麼狀態能跨 session 留下、何種證據算完成，以及何時必須停止。
2. **同一模型放進不同環境，會成為不同能力的 agent。** Chat 介面只能回答；加入 repository、terminal、tests、browser、project memory、worktree 與 review loop 後，才具備交付軟體的條件。
3. **Production harness 有七項工作：**把需求轉成契約、提供小而可導覽的專案地圖、暴露正確工具與環境、把記憶外部化成持久狀態、先加感測器再擴大自治、在模型之外強制權限，以及留下 trace 並支援局部復原。
4. **重要規則要從文字升級成基礎設施。** 指南說明原因，機械式檢查強制邊界；過去的一次失敗因此能轉成後續每次執行都受益的護欄。
5. **迭代必須是受控迴圈。** 每輪要有證據、重試上限、預算與升級路徑；模型決定如何修復局部缺口，harness 決定是否允許下一輪。
6. **把腦、手與歷史拆開。** 推理模型、執行 sandbox、持久狀態與 audit log 不該混成一體，否則模型更換、環境故障或工作接手時都難以復原。
7. **每次執行都留下 change receipt。** 除了最終產物，還要保留變更、驗證與決策摘要，才能比較模型版本、定位退化與稽核過程。
8. **從能閉環的最小 harness 開始。** 短而低風險的工作不需要平台；能改檔、連網與建立 PR 的長任務，才值得更完整的權限、追蹤與恢復機制。

## 一手資料核對

- **Harness／環境不是 prompt 的同義詞（高確定性）。** OpenAI 將 Codex harness 描述為協調使用者、模型與工具的核心 agent loop；模型要求工具時，執行結果會追加回上下文，再次查詢模型。[OpenAI, “Unrolling the Codex agent loop”, 2026-01-23](https://openai.com/index/unrolling-the-codex-agent-loop/)
- **長任務需要可交接的持久工件（高確定性）。** Anthropic 指出跨 context window 的新 session 沒有先前記憶，並以 initializer agent、逐步 coding agent、`init.sh`、進度檔和 git history 讓後續 session 接手。[Anthropic, “Effective harnesses for long-running agents”, 2025-11-26](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- **Context 是有限資源，應動態整理（高確定性）。** Anthropic 將 context engineering 定義為管理 system instructions、工具、MCP、外部資料與訊息歷史；建議以高訊號、精簡的上下文，配合 just-in-time retrieval、compaction、筆記或子代理。[Anthropic, “Effective context engineering for AI agents”, 2025-09-29](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- **工具介面是可靠度邊界（高確定性）。** Anthropic 建議工具具備清楚命名、單一責任、明確參數、錯誤處理與 token-efficient 回應，並用評估驗證工具設計；過大的工具集合會增加歧義。[Anthropic, “Writing effective tools for AI agents—using AI agents”, 2025-09-11](https://www.anthropic.com/engineering/writing-tools-for-agents)
- **先簡單、以評估決定是否加複雜度（高確定性）。** Anthropic 的 agent 設計原則是保持簡單、公開規劃、仔細設計並測試 agent-computer interface；只有在簡單方案不足時才增加多步 agent 架構。[Anthropic, “Building Effective AI Agents”, 2024-12-19](https://www.anthropic.com/engineering/building-effective-agents)
- **驗證回饋使迭代可落地（高確定性）。** Anthropic 指出 coding agent 的輸出可由自動測試驗證，測試結果可作為下一輪回饋；但人類審查仍用來確認更廣泛的系統要求。[同上](https://www.anthropic.com/engineering/building-effective-agents)
- **權限與環境隔離不能交給模型自律（高確定性）。** OpenAI 公開的 Codex 安全做法包含 sandbox、approval policy、網路白名單、憑證管理、規則和 agent-native audit logs。[OpenAI, “Running Codex safely at OpenAI”, 2026](https://openai.com/index/running-codex-safely/)
- **模型層不是完整安全邊界（高確定性）。** Anthropic 將防禦拆成執行環境、模型與外部內容三層，明確指出模型防禦不可能 100% 有效；MCP、插件、搜尋結果等外部內容也會進入 context，因此應限制工具權限與 blast radius。[Anthropic, “How we contain Claude across products”, 2026](https://www.anthropic.com/engineering/how-we-contain-claude)

## 可直接寫進技術文章的 checklist

1. **Contract：** 先寫清楚目標、不可違反的 invariant、完成條件與必須留下的證據。
2. **Workspace：** 提供可讀的 repo map；把關鍵決策、進度、命令和產物放進版本控制，而不是只留在聊天記錄。
3. **Loop：** 將工作拆成可驗證的小步驟；每步執行後跑測試／lint／型別檢查，失敗時限制重試並設升級條件。
4. **Tools：** 只暴露必要工具；每個工具有單一責任、清楚輸入、可預期錯誤與有上限的輸出。
5. **State：** 以結構化進度檔或資料庫記錄「已完成、未完成、阻塞、下一步、決策及其依賴」，並保留 git diff／測試結果。
6. **Permissions：** 預設最小權限；將檔案、網路、憑證、部署和破壞性操作分層，敏感動作要求核准。
7. **Observability：** 記錄工具呼叫、輸入／輸出摘要、成本、重試、錯誤和人工核准；用 trace 回放實際行為。
8. **Evaluation：** 用代表性任務與回歸案例衡量成功率、恢復率、成本、延遲及錯誤類型；不要只看一次成功示範。

## 寫作注意

- X 原文是觀點文章；文中的七項工作適合作為設計框架，不代表已由跨模型 benchmark 證明是唯一分類。
- 不延伸採用非官方轉載中的「Google 9-page PDF」、特定 benchmark 提升、模型替換即成 implementation detail，或「prompting 已結束」等宣稱。
- OpenAI 與 Anthropic 文章多為自家系統經驗與建議，不等於跨模型、跨產業的因果證明；文章應把案例、規範性建議與普遍性結論分開標示。

## 參考資料（官方一手）

- [OpenAI — Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)（2026-02-11）
- [OpenAI — Unrolling the Codex agent loop](https://openai.com/index/unrolling-the-codex-agent-loop/)
- [OpenAI — Running Codex safely at OpenAI](https://openai.com/index/running-codex-safely/)
- [Anthropic — Building Effective AI Agents](https://www.anthropic.com/engineering/building-effective-agents)（2024-12-19）
- [Anthropic — Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)（2025-11-26）
- [Anthropic — Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)（2025-09-29）
- [Anthropic — Writing effective tools for AI agents—using AI agents](https://www.anthropic.com/engineering/writing-tools-for-agents)（2025-09-11）
- [Anthropic — How we contain Claude across products](https://www.anthropic.com/engineering/how-we-contain-claude)（2026）
