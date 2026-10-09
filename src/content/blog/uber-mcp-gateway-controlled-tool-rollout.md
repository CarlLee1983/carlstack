---
title: "Uber MCP Gateway 的啟示：把工具上架當成一次受控發布"
description: "從 Uber MCP Gateway 的 Registry、虛擬 server 與按需發現設計，建立小團隊可驗收的工具發布契約：誰核准、何時撤權、如何處理舊 schema，以及如何量測整條任務的成本。"
publishDate: 2026-10-04T10:53:28+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - API 整合
  - 系統設計
series: AI Agent 工程化與工作流實戰
seriesOrder: 59
cover: ../../assets/covers/uber-mcp-gateway-controlled-tool-rollout.webp
coverAlt: "淡紫陶瓷水道模型中，上方排列設定牌，中央黃銅閘門控制青綠玻璃球流向分支，表達工具目錄與執行路徑分開管理。"
---

一個團隊把查詢訂單的 API 接成 MCP tool，接著另一個團隊接上出貨查詢。到了第三個團隊，開始有人問：同名工具該選哪支？昨天核准的 schema 今天變了，誰負責？關閉工具後，Agent 手上快取的呼叫還能不能成功？

這時要補上的，是工具從「被發現」到「允許執行」之間的發布流程。每一個入口都應該能回答：誰擁有它、哪個版本被核准，以及現在這個呼叫是否仍符合授權。

Uber Engineering 在 2026 年 10 月 2 日發布的 [X 長文](https://x.com/ubereng/status/2106071967619322330)，與官網 10 月 1 日的〈[Designing MCP Gateway](https://www.uber.com/us/en/blog/designing-mcp-gateway/)〉介紹了其工具平台設計。本文以該設計為起點，提出自己的導入契約與驗收方式；沒有取得 Uber 內部系統，也沒有重現其生產規模。

## Uber 的案例提供了一條工具發布路徑

Uber 將目錄與設定交給 MCP Registry，執行交給 Proxy Gateway；後者透過 Muttley 重用 HTTP、gRPC、TChannel 服務，也代理原生 MCP。AutoCrawler 從 IDL 或原生 server 取得工具，預設停用，交由 owner 審核啟用；描述變更需核准並可回滾。Gateway 統一處理授權、限流與敏感回應遮罩。[架構與發布流程](https://www.uber.com/us/en/blog/designing-mcp-gateway/)

工具量增加後，Omni MCP 分段取得 server、工具與 schema，再執行呼叫；response projection 裁減回傳欄位。Coding agent 的 Code Mode 則用 aifx 經同一 Gateway 呼叫，將輸出留在檔案中供選讀，仍然使用 MCP。[延伸設計](https://www.uber.com/us/en/blog/designing-mcp-gateway/)

文中自報超過 800 個 MCP servers、5,000 個工具，其中包含虛擬 server，不能換算成 800 個獨立程序；也沒有足以重算延遲、節省率或可用性的 benchmark。[規模說明](https://www.uber.com/us/en/blog/designing-mcp-gateway/)

接下來的問題留給自己的系統：同一份核准，在目錄、執行端與快取之間，何時開始生效、何時確定失效？站內〈[MCP 接得上不等於能放心執行](/blog/mcp-interface-needs-control-plane/)〉討論單一工具的授權邊界；這篇關心多個 owner 持續改動工具時，如何維持那條邊界。

## 將設定審查綁到可識別的版本

假設物流團隊提供唯讀的 `shipment_status`。初版只回傳運單狀態，下一版增加收件地址。即使 endpoint 和函式名稱沒變，允許資料進入 Agent 的範圍已經改變。只在第一次上架時按一次核准，無法處理這類更新。

我會讓工具登錄至少帶著下面這份契約。這是本文的概念設定，欄位不屬於 MCP 標準或 Uber 的實際設定格式：

```yaml
id: logistics.shipment_status
owner: logistics-platform
version: 7
state: disabled
review:
  approved_version: null
  includes:
    - input_schema
    - output_schema
    - description
    - downstream_mapping
    - data_policy
execution:
  effect: read_only
  authorization: caller_and_tenant
  deadline_ms: 2000
output:
  allowed_fields: [shipment_id, status, updated_at]
  required_evidence: [shipment_id, updated_at]
```

版本號與 2 秒 deadline 都是示例。正式實作應把 review 指向不可變的內容摘要，包含實際 schema、描述、下游映射與資料政策；一段可任意改寫的 `approved_version` 不能單獨充當核准紀錄。

描述也值得審查。例如「查詢目前狀態」變成「查詢並嘗試修復狀態」，會改變 Agent 選擇這支工具的時機；如果下游偷偷增加寫入，光看輸入型別仍可能找不到差異。

**核准內容與執行內容不一致時，拒絕新呼叫。** 若需要不中斷服務，可以保留上一個已核准版本，讓它繼續服務；新版本維持停用，直到必要的審查與相容性測試完成。

## 撤權要驗收執行端，不能只看目錄消失

工具從搜尋結果移除，只證明新發現流程看不到它。Agent 可能保存了昨天的 schema，長時間任務也可能已經排好下一步呼叫。因此，我會分別測試目錄快取、Gateway 設定快取與下游的授權決策。

[MCP 2026-07-28 Tools 規格](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)允許工具清單依請求授權而不同，也要求 server 實作存取控制、輸入驗證與限流。這給了協定上的落點；撤權的傳播期限仍要由部署者訂出來。

下面是可用 Node.js 執行的最小 admission 測試。它只檢查「是否准許開始一次新呼叫」，不連網，也沒有實作 token 驗證、完整 RBAC、分散式快取或執行中的取消：

```js
import assert from "node:assert/strict";

function admit(tool, actor, call, nowMs) {
  if (
    !tool ||
    !actor ||
    !call ||
    !Number.isFinite(nowMs) ||
    !Number.isFinite(tool.policyValidUntilMs) ||
    !Number.isInteger(tool.version) ||
    tool.version < 1 ||
    !Number.isInteger(call.version) ||
    call.version < 1 ||
    typeof tool.scope !== "string" ||
    !tool.scope ||
    typeof actor.tenant !== "string" ||
    !actor.tenant ||
    typeof call.tenant !== "string" ||
    !call.tenant ||
    !Array.isArray(actor.scopes)
  )
    return "invalid_input";
  if (tool.enabled !== true) return "disabled";
  if (tool.approvedVersion !== tool.version) return "unreviewed";
  if (call.version !== tool.version) return "stale_schema";
  if (nowMs >= tool.policyValidUntilMs) return "stale_policy";
  if (actor.tenant !== call.tenant) return "forbidden";
  if (!actor.scopes.includes(tool.scope)) return "forbidden";
  return "allow";
}

const tool = {
  enabled: true,
  version: 7,
  approvedVersion: 7,
  policyValidUntilMs: 2000,
  scope: "shipment:read",
};
const actor = { tenant: "demo-a", scopes: ["shipment:read"] };
const call = { tenant: "demo-a", version: 7 };

const cases = [
  [tool, actor, call, 1000, "allow"],
  [{ ...tool, enabled: false }, actor, call, 1000, "disabled"],
  [{ ...tool, version: 8 }, actor, call, 1000, "unreviewed"],
  [tool, actor, { ...call, version: 6 }, 1000, "stale_schema"],
  [tool, actor, call, 2000, "stale_policy"],
  [tool, actor, { ...call, tenant: "demo-b" }, 1000, "forbidden"],
  [tool, { ...actor, scopes: [] }, call, 1000, "forbidden"],
  [
    { ...tool, policyValidUntilMs: undefined },
    actor,
    call,
    1000,
    "invalid_input",
  ],
  [{ ...tool, policyValidUntilMs: NaN }, actor, call, 1000, "invalid_input"],
  [tool, actor, call, NaN, "invalid_input"],
  [
    tool,
    { ...actor, scopes: "shipment:readwrite" },
    call,
    1000,
    "invalid_input",
  ],
];
for (const [t, a, c, now, expected] of cases) {
  assert.equal(admit(t, a, c, now), expected);
}
console.log(`${cases.length} admission cases passed`);
```

將它存成 `admission-demo.mjs`，執行 `node admission-demo.mjs`。這十一個案例把型別錯誤、核准版本、停用、政策過期與租戶範圍分開，不把所有失敗壓成一個模糊的「權限不足」。

此處的 `actor` 必須來自可信的驗證結果，不能由模型自行填寫；`call.tenant` 也只是請求範圍，服務端仍須確認查到的資源屬於該租戶。時間截止代表本地政策快照的有效期，不能證明所有副本都已同步。

接到真實 Gateway 後，要再做一次故障測試：讓其中一個副本收不到更新，以控制面提交停用的時間為起點，將保存舊 schema 的請求分別送到隔離更新的副本與其他副本，記錄各副本最後一次准許新呼叫的時間。如果它超過團隊承諾的撤權期限，就不能宣稱停用已生效。政策過期後選擇拒絕呼叫，會犧牲部分可用性；這筆代價應在導入時被接受。

對已在執行中的寫入，停用新呼叫也不等於復原。是否取消、查詢結果或補償，必須另訂業務規則。這也是第一個試點選擇唯讀工具的原因。

## 按需發現的收益，要算到任務結束

工具描述全部放進 context，和先搜尋再載入，會產生不同的成本。後者多了搜尋與取 schema 的往返；如果只有兩支工具、每次都會用到，這些往返可能沒有回本。

我會固定一批唯讀任務，分別量測「預先載入」和「按需發現」：

- 是否找到預定義的正確工具；找不到時是否明確停止
- 從同一任務送入 harness 到結果驗證結束的 p50、p95 延遲
- 模型輸入、輸出、快取 token，以及實際工具呼叫成本
- 取 schema、重試、失敗搜尋各發生幾次
- 任務答案是否完整，人工返工花了多少時間

不要只比較某一輪 prompt 長度。若工具搜尋省下 schema，卻讓任務反覆選錯工具，最後仍會多花時間與費用。可以沿用〈[Coding Agent 的成本要逐輪記帳](/blog/agent-loop-cost-ledger/)〉的帳本，把發現成本列成一個獨立項目。

欄位投影也需要自己的失敗案例。查詢出貨狀態時，`status` 看似足夠，但少了 `shipment_id` 就無法確認是哪一筆，少了 `updated_at` 就無法判斷資料是否過期。投影允許清單與驗收必需欄位，應分開設定；若兩者互相矛盾，應在發布時拒絕這份設定。

[MCP 的結構化輸出規格](https://modelcontextprotocol.io/specification/2026-07-28/server/tools#structured-content)定義 `structuredContent` 與 `outputSchema`。若工具宣告了輸出 schema，server 的結構化結果必須符合它。因此，動態投影不能任意刪掉 schema 的必要欄位，再把結果標成成功；應定義投影後仍成立的契約，並由呼叫端驗證。

把輸出寫成檔案也不會自動消除資料責任。我會另外測試檔案權限、保留時間、清除行為，以及錯誤日誌是否意外帶出完整回應。〈[Pi 的工具組合驗收](/blog/pi-mcp-codemode-tool-composition/)〉接著說明如何讓程式處理中間資料，並只把必要結果送回模型。

## 小團隊可以從一份版本化登錄檔開始

本文的建議是：先集中最常重複、也最容易漏掉的控制，再決定是否建立獨立平台。如果只有一個 owner、少量唯讀工具，一份版本化設定、既有 CI 與共用 middleware，可能已足以驗證發布契約。

開始出現多個 owner、不同宿主反覆實作授權，或無法回答哪個版本正在服務時，再評估把 Registry 與執行代理獨立部署。成本也要同時進帳：設定分發與回滾、Gateway 值班、容量與限流、下游相容性，以及中央服務故障時的影響範圍。

第一個驗收範圍可以很小：一支唯讀工具、兩個測試租戶、兩個 schema 版本、一個故意斷開設定更新的 Gateway 副本。先證明未核准版本叫不動、跨租戶查不到、撤權在約定期限內生效，再談下一百支工具。

**任何一項拒絕案例失敗，就停止擴大工具範圍。** 保留測試輸入、實際結果、政策版本與 request ID，讓修正之後可以重跑同一個案例。這份證據，才足以支持下一次上架。

## 來源

- [Uber Engineering 原始 X 貼文](https://x.com/ubereng/status/2106071967619322330)
- [Uber Engineering：Designing MCP Gateway，2026-10-01](https://www.uber.com/us/en/blog/designing-mcp-gateway/)
- [MCP 2026-07-28：Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)

## 延伸閱讀

[Splunk MCP 自訂工具的目的地與憑證邊界](/blog/splunk-mcp-destination-credential-boundary/)以具體安全公告補充這份發布契約：工具可執行的權限之外，還要核准下游目的地與它能接收的身分。
