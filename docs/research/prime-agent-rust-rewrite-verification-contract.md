# Prime Agent Rust 重寫：來源與驗收記錄

查核日期：2026-10-10（台北）。主來源：Kevin Thomas、Sebastian Müller、Seth Karten，2026-10-09，https://www.primeintellect.ai/blog/prime-agent-rust 。公開 repository：https://github.com/PrimeIntellect-ai/prime-agent 。

## 去重與定位

在基線 aa4120c618d110a2518e4502c41d18dab909df02 的 blog、research、article-queue 搜尋完整 URL、prime-agent-rust、Prime Intellect、Prime Agent 與作者名稱，未有同來源文章。新增文章聚焦重寫的行為契約、授權與驗收成本；與既有 ReviewBench 審查、Haiku 子代理成本、本機 Agent 執行邊界互補。AI Agent 工程化與工作流實戰目前最大 order 77，本文採78。後續新增文章應依最新 main 檢查系列順序，避免並行發布造成重複。

## 事實與限制

- 官方10/9工程文自述超過2,000 Agents、Rust重寫、Windows beta。角色拆分與TUI/harness/protocol parity來自同文。
- 冷啟動time-to-type的比較表為737.8ms對55.8ms、13.22x；正文僅寫約13倍，沒有混用本文另一組hillclimb卡片14.18x。
- 該benchmark使用scripted model、排除inference；跨工具沒有共同標準，不能推導解題速度。
- 官方描述worker process的crash isolation。文章沒有聲稱其為完整安全沙箱，也沒有宣稱存在具體漏洞。
- Rust Send/Sync官方定義：https://doc.rust-lang.org/nomicon/send-and-sync.html 。thread安全與應用授權是不同驗收範圍。

## 本文原創建議與實測範圍

本文fixture契約、停止規則與成本記帳是作者建議，不是廠商API。Python3範例直接從文章code fence抽出執行，輸出 `5 synthetic parity checks passed`：request_id變更可接受，模型替換、額外工具、未授權寫入與核准狀態更動均拒收。僅驗證合成比較函式，未安裝Prime Agent、未連模型、未測真實工具攔截或重跑廠商benchmark。字典比對缺欄位會失敗，並未宣稱production-ready安全控制。

## 系列與封面

AI Agent系列78。封面由獨立原創image_gen流程生成，檔案和檢視記錄見oct10-cover-directions.md。正式publishDate將於發布前以實際時間核對。
