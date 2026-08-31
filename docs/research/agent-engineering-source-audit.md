# Agent Engineering 系列：原文核對稽核

> 稽核日期：2026-08-31（Asia/Taipei）
> 範圍：commit `15ae080` 新增的 7 篇文章。
> 方法：逐篇讀取文章引用的作者原始 X 貼文。下列數字、成本與成效均屬原作者主張，除非另列第一方文件，未作獨立實驗驗證。

## 已核對內容與文章修正

### active-second-brain-agent-team

- 原文：[rvaniaaaa / 2094035746369749246](https://x.com/rvaniaaaa/status/2094035746369749246)
- 已核對：Second Brain 被比喻為 compiler；`raw/` 是不可變的原始資料，`wiki/` 是編譯後的連結知識；`CLAUDE.md` 保存目標、偏好與權限邊界；角色為 Scout、Analyst、Strategist、Executor、Guardian、Observer，另由 Orchestrator 協調。
- 文章處理：補回六角色與 raw/wiki/CLAUDE.md 的原始設計；既有四角色明確改標為本文收斂後的落地架構。

### agentic-coding-software-engineering-fundamentals

- 原文：[Andrew Ng / 2093388974194872781](https://x.com/andrewyng/status/2093388974194872781)
- 已核對：即使 Agent 撰寫全部程式碼，開發者仍須理解可選權衡；原文列出全端應用、資料管理、系統架構、安全與可靠性、production 擴展與維運五項能力，並具體列出 latency、availability、consistency、reliability、maintainability、simplicity、cost 等取捨。
- 文章處理：以原文的五項能力定位段落，保留後續 Agent 控制面作為本文的工程化解讀。

### claude-obsidian-loop-engineering

- 原文：[polydao / 2094307289280716815](https://x.com/polydao/status/2094307289280716815)
- 已核對：Vault 是 loop 的 state；流程為 capture → context → 在 Git Worktree draft → Critic review diff → append-only commit；`supports`、`contradicts`、`supersedes` 是圖邊而非單純 metadata。
- 作者經驗主張：plain loop 約為直接呼叫成本的 2–4 倍；升級完整 graph 可能為 10–50 倍；一個 review assistant 的評分從 55% 到 72% 再到 84%。
- 文章處理：對齊原始流程，補上成本與升級門檻，並標註數字是作者經驗而非通用基準。

### due-diligent-programming-in-ai-era

- 原文：[jowaywang / 2093682461737967822](https://x.com/jowaywang/status/2093682461737967822)
- 已核對：作者把核心能力稱為「盡職程式設計」；AI 可完成許多子任務，但無法單靠聊天視窗決定為了把事情做成需要哪些子任務與情境資訊；作者以架構圖或面向產品經理的文件理解 Agent 設計，並倡議獨立的 code review context。
- 文章處理：移除未歸因的總體產出差距敘述，將需求契約、架構接縫與獨立審查標示為本文的工程化拆解。

### graph-engineering-for-agents

- 原文：[Anatoli Kopadze / 2080668775796314331](https://x.com/AnatoliKopadze/status/2080668775796314331)
- 已核對：node 是有界工作，edge 必須傳遞真實結果；fake-edge test 用來找出可平行的假相依；菱形模式為 fan-out → plain-code reduce → final-agent synthesize；獨立 verifier 需要新 context；圖仍需 tests、已落地營收等 anchors 才能驗證真實性。
- 文章處理：補入 fake-edge test、deterministic reduce 與 anchors，並保留成本與不適用情境。

### grok-bot-cloud-computer-workflows

- 原文：[Mai Yang / 2090919833366040919](https://x.com/MaiYangAI/status/2090919833366040919)
- 已核對：Bot 使用雲端電腦的瀏覽器、檔案系統與終端；可在使用者離線時執行；Skill 是「怎麼做」、Routine 是「誰在何時做」；發信、公開發布、花錢、刪改資料、改權限／production 與同意法律條款等動作會要求審批。
- 重要更正：同一帳號的所有 Bot **共用**一台雲端電腦、檔案、登入與憑證，Bot 不是安全隔離邊界；密碼、2FA、CAPTCHA 與付款確認須人工接管，API key 使用 secure secret card。
- 第一方交叉來源：[Grok Bot overview](https://docs.x.ai/grok-bot/overview)、[approvals, security, and privacy](https://docs.x.ai/grok-bot/approvals-security-and-privacy)。

### trace-engineering-for-agents

- 原文：[marfinxx / 2094016175617241109](https://x.com/marfinxx/status/2094016175617241109)
- 已核對：作者區分 log、trajectory、trace；提出 append-only event ledger、seed 與 sampling 參數、mocked replay、live state resumption、依資料相依關係回溯的因果故障定位，以及 READ_ONLY／MUTATING 工具分類與 write-ahead log。
- 文章處理：補入上述分類與兩種重播模式，並將所有方法表述為作者提出的 Trace Engineering 架構，而非既有平台的保證。

## 結論

七篇文章已把原文可核對的具體流程、限制與術語補回；本文延伸的工程做法均以「本文架構／本文工程化拆解」區分。最重要的事實修正是 Grok Bot 的 Bot-to-Bot 共用雲端電腦與登入狀態。
