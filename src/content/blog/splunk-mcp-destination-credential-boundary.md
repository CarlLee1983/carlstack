---
title: "Splunk MCP 漏洞揭露：工具目的地必須與執行者憑證分開授權"
description: "CVE-2026-76286 涉及 Splunk MCP Server 自訂 API 工具把執行者 token 送到設定的 URL。本文釐清管理與執行權限、1.2.1 修補範圍，並提出目的地、憑證與工具版本的驗收契約。"
publishDate: 2026-10-09T10:22:58+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - API 整合
  - 資訊安全
series: AI Agent 工程化與工作流實戰
seriesOrder: 76
cover: ../../assets/covers/splunk-mcp-destination-credential-boundary.webp
coverAlt: "三葉形憑證對準相同輪廓的入口，遠處另一個方形入口與它不相容，象徵憑證必須綁定目的地"
---

工具管理員可以修改一個 API 的目的地，是否也等於他可以決定下一位執行者的 token 要交給誰？在自訂工具平台，這兩件事如果共用同一份信任，管理設定的人便可能間接取得另一個人的權限。

Splunk 於 [2026 年 10 月 7 日發布 SVD-2026-1004](https://advisory.splunk.com/advisories/SVD-2026-1004)，揭露 Splunk MCP Server 自訂 API 工具的 SSRF 問題 CVE-2026-76286。公告要求將低於 1.2.1 的版本升級至 1.2.1 或更新版本；暫時處置是關閉或移除 MCP Server app。對受影響的部署，這是應採取的產品處置，本文提出的設計契約不能替代升級。

本文依公告與官方管理文件分析，沒有安裝 Splunk、執行 PoC 或讀取修補差異。因此不推測 1.2.1 內部究竟用了哪一種 URL 驗證方式。

## 問題需要管理設定與執行動作共同成立

公告中的權限條件很明確：具有 `mcp_tool_admin` capability 的角色可以設定自訂 API 工具；具有 `mcp_tool_execute` capability 的使用者才可以執行它。受影響版本可能把執行者的 Splunk platform authentication token 送到該工具設定的 URL。若 URL 由另一人控制，token 可能被取得，並用來以執行者身分存取資料或操作。

Splunk 將其分類為 CWE-918，CVSS v3.1 為 5.3、Medium。這個分數保留了高權限與使用者互動等成立條件；它不保證個別部署的資料影響有限。另一方面，公告也沒有支持「匿名使用者即可利用」「所有 MCP server 都受影響」或「未經驗證的遠端程式執行」等說法。

我的工程判斷是，盤點時要同時看三個角色：誰能定義工具、誰能執行工具、誰控制目的地。只檢查 Agent 是否有執行權限，會漏掉前一個人已經改寫執行結果所指向的信任關係。

## 啟用工具時，要核對實際連線設定

[Splunk 自訂工具管理文件](https://help.splunk.com/en/splunk-enterprise/mcp-server-for-splunk-platform/1.2/managing-custom-tools-in-splunk-mcp-server)區分工具的名稱、描述、輸入 schema 與 `_meta` 執行設定。管理 API 使用具備 `mcp_tool_admin` 的使用者 token；`enabled` 預設為 `false`，也可在建立時設為 `true`。

API 類型工具的目標位於 `_meta.execution.endpoint`，執行時會替換 placeholder。這使審查有一個具體對象：工具名稱與 description 方便模型選擇工具，實際連線位置則要從執行設定與參數解析後的結果確認。描述寫著「讀取內部紀錄」，不會自動限制請求只能前往內部紀錄服務。

我建議把審查拆成兩次。登錄時檢查目的地模板與允許的參數；執行時檢查解析後的目的地，最後才決定是否附帶憑證。只有模板通過審查，仍不足以證明每次替換結果都在允許範圍內。

下面是自建平台可使用的概念政策，不是 Splunk 設定格式，也不代表 1.2.1 的修補實作。網域與工具名稱均為示例。

```yaml
tool_policy:
  id: example-app:read-status
  definition_revision: revision-7
  reviewed_revision: revision-7
  destination:
    scheme: https
    host: status.example.org
    port: 443
    path_prefix: /api/status/
    follow_redirects: false
  credential:
    forward_invoker_token: false
    service_credential_ref: status-read-only
    allowed_recipient: https://status.example.org:443
  execution:
    require_current_revision_approval: true
    missing_policy: deny
```

範例選擇不轉送執行者 token，改由平台為已核准服務取得專用、最小權限的憑證。這是可選的設計取捨：它增加憑證生命週期與權限對應成本，也可能不符合必須代表個別使用者執行的業務。需要委派使用者權限時，仍要另行確認接收服務、憑證用途與可執行範圍，不能把任意 URL 當成合法接收者。

## 工具改版後，舊核准不應繼續套用

一個常見的審查缺口是：安全團隊核准過工具名稱，之後設定被更新，平台卻仍沿用「已核准」標記。上述契約因此把 definition revision 與 reviewed revision 分開記錄。

我建議至少讓以下變更撤銷原本的可執行狀態：目的地主機或連接埠改變、路徑範圍放寬、參數可以影響新的 URL 部分、憑證來源改變，以及重新導向政策放寬。對應到實作，應由政策層比較完整定義版本，並在真正送出請求前再次確認；只在 UI 儲存時跳出提醒，不足以涵蓋 API 更新或舊 cache。

**停止規則：無法證明當前工具版本、解析後目的地與憑證接收者都在核准範圍內，就在網路請求送出前拒絕執行。** 這裡的拒絕要有可稽核理由，例如 `definition_changed` 或 `destination_not_approved`，但 log 不應記下原始 token。

這與[Uber MCP gateway 的受控工具上線](/blog/uber-mcp-gateway-controlled-tool-rollout/)可以接起來：工具目錄解決可見性與發布管理，執行時的出站政策則負責每一次資料與憑證的去向。目錄裡有一個可信名稱，仍需要後面的請求檢查。

## 驗收要看接收端，也要有合法路徑的正例

以下是建議給自建工具平台的隔離測試，並非本次 CVE 的重現報告。本文沒有執行這些測試；應只使用測試身分、假 token 與自己控制的隔離接收端，不把真實憑證送往第三方。

- 未核准目的地：執行請求應被拒絕；接收端觀察到的請求數與 token 數均為零。
- 權限不足：沒有管理 capability 的身分無法修改工具；沒有執行 capability 的身分無法呼叫工具。
- 定義被修改：已核准工具變更目標後，原核准失效，即使名稱與描述完全相同也一樣。
- 合法直接連線：核准版本能成功到達核准服務，且只攜帶預定的憑證。否則「全部擋住」會被誤當成安全政策有效。
- 重新導向：若平台支援 redirect，下一個目的地必須重新接受政策判定。若政策禁止，便不應跟隨。

最後一項是本文延伸的防禦測試。Splunk 公告沒有把 redirect 描述為這次漏洞的利用機制；不要用它補寫公告沒有披露的細節。[mcp-use 的 final endpoint 檢查](/blog/mcp-use-client-241-redirect-final-endpoint/)討論的是 client runtime 另一條邊界，可以共用測試思路，但產品與成因應分開記。

升級後也應保留合法路徑的正例，確認業務所需的工具仍可運作。只看到錯誤回應，無法區分政策正確拒絕、環境斷線或測試工具本身壞了。

## 從版本與工具清單開始收斂風險

現在可以建立一份有 owner 的盤點：MCP Server app 版本、已啟用自訂 API 工具、解析後可到達的目的地，以及具有管理與執行 capability 的角色。對受影響版本依官方指引升級；暫時無法升級時，評估關閉或移除 app 對工作流的影響。

下一個驗收動作，是選一個合法工具與一個未核准目的地，在隔離環境完成正反例，留下請求紀錄與政策版本。這會直接回答平台是否能把「誰可以執行」與「憑證可以交給誰」分開落實，也讓下一次工具定義變更有可重跑的檢查。
