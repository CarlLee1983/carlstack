---
title: "Cloudflare 資安 Agent：證據快照必須連同缺口一起驗收"
description: "從 Cloudflare 的資安調查架構出發，設計可重播的證據契約：固定租戶與時間範圍、區分查詢失敗和未命中、限制引用來源，再用合成案例檢查拒收規則與人工覆核邊界。"
publishDate: 2026-10-08T10:09:19+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
  - 資訊安全
series: AI Agent 工程化與工作流實戰
seriesOrder: 69
cover: ../../assets/covers/cloudflare-security-evidence-snapshot-contract.webp
coverAlt: "靛藍布面分成四個證據口袋，三袋分別裝著黃、米白與淺藍材料，以紅線連向中央紅色圓章；右下口袋留空，表達已收集材料與資料缺口都要保留。"
---

假設一份調查報告寫著「沒有查到惡意活動」，但背後的查詢逾時了。這份報告最需要修的，是逾時如何進入資料結構：如果失敗被轉成空陣列，下一個模型拿到的就已經是錯誤前提。

Cloudflare 在 [2026 年 10 月 7 日的架構文章](https://blog.cloudflare.com/agentic-security-operations/)中，說明 Managed Defense 如何先由程式固定蒐證範圍與快照，再交給模型判讀，並保留資料缺口與來源引用。當時仍是合資格應用安全警示與案件的 early beta，最後處置由分析師負責。公開架構說明不足以推定整套 harness 已開源或正式 GA。

本文把這個起點延伸成一份自訂的 evidence contract。以下欄位、停止規則與測試都是本文設計，不是 Cloudflare API，也不代表其內部實作。查核截至 2026 年 10 月 8 日；本次只執行本機合成資料測試，未連接客戶日誌、模型或 Managed Defense。

## 快照要固定的是一次調查看見的資料

以「某租戶的登入路徑在十五分鐘內出現異常請求」為例，蒐證程式至少要固定租戶、案件、事件時間窗與蒐集版本。模型不應自行填寫 tenant ID，再讓查詢工具照單全收；這些值由已驗證的案件身分產生，查詢端也要重新檢查授權。

確定性的程式仍會讀到變動中的資料。上午查一次、下午查一次，即使 API 與參數完全相同，也可能因為延遲到達的日誌而得到不同答案。因此本文把 **replay 定義為讀取已封存的同一份輸入**。重新查詢叫做新一輪蒐證，要另建快照版本。

下面是概念 YAML，只展示契約形狀，不能直接部署。所有識別值均為虛構：

```yaml
schema_version: evidence-envelope/v1
snapshot_id: snap-demo-001
case_id: case-demo-017
tenant_id: tenant-demo
event_window:
  start: 2026-10-07T09:00:00Z
  end_exclusive: 2026-10-07T09:15:00Z
captured_at: 2026-10-07T09:18:00Z
collector_version: login-recon/v3
policy_version: login-review/v2
sources:
  - source_id: edge-log
    query_id: query-demo-01
    state: observed
    coverage: partial
    artifact_id: artifact-demo-01
    source_refs: [evidence-demo-01]
  - source_id: threat-lookup
    query_id: query-demo-02
    state: query_failed
    reason: timeout
    source_refs: []
```

`event_window` 指事件發生時間，`captured_at` 指取得資料的時間，不能互換。來源若提供 ingestion watermark、分頁游標或取樣資訊，也應保存；沒有提供就明記未知。HTTP 成功加上零筆資料，還不足以宣告整個時間窗已被完整觀察。

正式 manifest 還要記錄 artifact 的摘要值、解析器版本及必要的來源版本。摘要依封存位元組計算；若採正規化 JSON，必須固定編碼與序列化方式。驗收器從受保護的 manifest 取得預期摘要，不能拿模型自己回傳的摘要當基準。這能檢查內容是否變動，來源真偽與讀取權限仍需另外驗證。

## 缺口需要型別，才能限制結論

本文的 adapter 使用五種結果。這些名稱是自訂詞彙，目的是讓不同來源回傳的空值不再混成同一種意思：

- `not_checked`：尚未執行，記下未查原因
- `query_failed`：已嘗試但失敗，記下錯誤與重試狀態
- `no_match`：查詢完成，沒有符合條件的結果
- `observed`：取得可納入調查的觀測材料
- `observed_absence`：在明確且已驗證的觀測範圍內，支持某個指定現象沒有出現

最後一種最容易被濫用。假設資料來源完整涵蓋某個時間窗的入口請求，查詢也明確檢查「是否有放行的請求」，才可能支持「該範圍未觀察到放行」。這仍然不能推成「攻擊未成功」，因為應用程式內部或其他入口可能根本不在觀測範圍內。

`coverage: complete` 也不能由模型宣告。它必須由來源 adapter 依游標、完整性資訊與已定義的查詢條件判定；缺少這些條件，就保留 `partial` 或 `unknown`。

我會將停止規則寫成：**缺少支持某項結論的必要來源時，該結論不得進入可採用建議**。其他證據仍可供分析師查看。例如威脅情報逾時，不必抹掉已取得的入口日誌，但報告不能用那次逾時替 IP 背書。

## source_refs 要由伺服器解析，不能讓模型組網址

一個引用存在於資料庫裡，並不代表它屬於這個案件。本文建議模型只輸出已分配的證據 ID，由驗收器在本次 manifest 的允許集合中解析。

每筆引用至少檢查：

1. ID 在本次快照中存在，而且屬於相同租戶與案件
2. 指向的 artifact 與保存的摘要相符
3. 證據型別可用於這類主張，例如 `query_failed` 不能支持「沒有事件」
4. 引用指向足夠細的紀錄或欄位，讓人能核對主張

不要把模型產生的完整 URL 交給後端直接抓取，也不要接受它提出的另一個 tenant ID 作為查詢參數。應用程式只將已驗證的 ID 轉成內部讀取操作。若摘要階段需要補資料，就退回蒐證流程，產生新快照並留下關係。

來源本文本身也可能含有惡意指令。證據中的「請停用防護」應維持待分析文字，不能成為工具授權。最小化提供給模型的欄位、移除不必要的個資與憑證，也應在送出推論請求前完成。

站內〈[Threat Signals 的來源追溯](/blog/threat-signals-provenance/)〉處理的是情報抽取如何連回原文；這裡多了一個案件邊界。同一份情報即使可回查，也得確認它能否被納入這一次調查。

## 引用合法，仍要檢查它是否支持那句話

假設日誌記錄某筆請求被 WAF 阻擋，模型卻引用它寫成「整起攻擊已被完全阻止」。ID、租戶、時間範圍都可能通過檢查，句子仍然超出證據。

因此本文把驗收拆成兩部分。程式負責 ID、scope、摘要、型別與有限欄位間的規則；主張與材料之間的語意關係，另由針對該領域的檢查與人工覆核處理。能精確寫成規則的主張就寫規則，例如指定 request ID 的 action 是否等於 `block`。涉及整起事件成敗的判斷，不能靠一個通用 `citation_valid` 布林值放行。

歷史結論也要帶著自己的適用範圍。昨天某個模式被判為誤報，可以是今天的背景材料；今天若部署了新版本、換了客戶設定，舊結論的前提可能已經失效。這類背景引用應與本次直接觀測分欄保存，避免看起來像今天又確認過一次。

建議輸出的狀態可以叫 `ready_for_review`，明確表示已通過機械式契約檢查。不要把它命名成 `verified_safe`，讓下游誤以為語意正確性與執行授權都已完成。

## 重試沿用輸入，補資料建立新版本

[Cloudflare Workflows 的規則文件](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)要求設計可重試的步驟，並提醒副作用應考慮冪等性；步驟名稱也要保持確定性。[重試文件](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)則允許設定次數、退避與逾時。這些是執行機制，證據版本仍由應用程式決定。

本文建議為每個模型執行保存 `snapshot_id`、模型識別、prompt 版本、工具契約版本與輸出 artifact。推論逾時後重試，沿用原快照；資料來源稍後恢復，要補入新材料時則建立新快照。兩條路徑分開，才能判斷答案變動來自新證據還是不同判讀。即使輸入相同，模型輸出也不保證逐字一致，評估應比較主張、引用與漏判。

物件儲存也需要自己的版本規則。[R2 一致性文件](https://developers.cloudflare.com/r2/reference/consistency/)指出，直接讀取物件具有強一致性，但同一 key 的競爭寫入由最後完成者勝出；經自訂網域快取讀取還有另一層快取行為。因此若用 R2 保存快照，我會採用每版唯一的 key，並由寫入權限與應用規則禁止覆寫，驗收器直接走受控讀取路徑。

若 artifact 與案件狀態放在不同儲存服務，本文建議先寫 artifact、確認可讀與摘要正確，再發布 manifest 為 `ready`。中斷後留下的孤立 artifact 可以清理；尚未就緒的 manifest 不供模型讀取。這套發布協定需要另做故障測試，不能從某個儲存服務的強一致性推導出跨服務交易保證。

## 合成測試能驗證拒收，也要暴露它驗不到什麼

本次用 Python 標準函式庫執行十五組自訂 fixture。案例涵蓋錯租戶、錯案件、錯快照、不存在的引用、逾時材料被引用、未執行的查詢被引用、未命中被冒充為觀測、缺少完整性條件的不存在主張，以及 artifact 遭修改。另保留正常觀測、有效未命中與有界不存在主張的通過案例。

十五組都符合預期，其中有一組刻意讓錯誤敘述通過：結構合法、引用有效，但文字宣稱「攻擊已完全排除」。範例驗收器仍回傳 `ready_for_review`。這個案例保留下來，是為了防止日後有人把結構檢查當成語意驗證。完整程式與預期結果放在[本文的可重跑研究紀錄](https://github.com/CarlLee1983/carlstack/blob/main/docs/research/cloudflare-security-evidence-snapshot-contract.md)。

這些結果只涵蓋記憶體中的小型契約檢查，沒有驗證正式 API、存取控制、分散式重試或模型準確率。採用時還需要端到端測試：來源延遲、分頁漏取、摘要程序崩潰、快照保留期到期、權限撤回後的讀取，以及同一事件重複到達。

正式試行可從 shadow mode 開始，由既有流程做決策，新流程只產生待覆核建議。驗收至少記錄每案人工覆核時間、不受證據支持的主張數、重要事件漏判數、引用拒收原因與缺口處理結果。若某個版本省下蒐證時間，卻讓分析師花更多時間拆解過度結論，就還沒達到採用目的。

處置工具維持獨立授權：通過上述檢查，也不自動取得新增 WAF 規則或封鎖流量的權限。這與〈[Decisions API 的分類與授權邊界](/blog/decisions-api-routing-calibration-authorization/)〉使用同一個原則，調查結果只能成為下一個受控流程的輸入。

## 下一步，讓一次逾時留下正確的結果

挑一件已知結果的歷史警示，固定可合法使用的輸入，在威脅查詢 adapter 注入一次 timeout。驗收成品是否仍保留其他材料、明示查詢缺口，而且沒有寫出「因此安全」。接著沿用同一快照重播，確認每個引用仍回到同一筆資料。

這兩件事做得到，再擴大來源與模型分工。若連一次逾時都會悄悄變成無威脅，增加多少 Agent 都只是讓錯誤前提走得更遠。
