# Splunk MCP Server：目的地與執行者憑證

- 主來源：https://advisory.splunk.com/advisories/SVD-2026-1004
- 穩定識別碼：SVD-2026-1004、CVE-2026-76286、VULN-83777
- 公告發布／更新日期：2026-10-07；查核日期：2026-10-09（Asia/Taipei）
- 補充一手來源：https://help.splunk.com/en/splunk-enterprise/mcp-server-for-splunk-platform/1.2/managing-custom-tools-in-splunk-mcp-server
- 對應文章：`src/content/blog/splunk-mcp-destination-credential-boundary.md`
- 系列：AI Agent 工程化與工作流實戰，76

## 去重與定位

研究基準 main `4f2b8828c6f00e48521221e72cd78756e13a18ca`，完整查核 blog、research、queue，未發現同一公告或 CVE。既有 Splunk 提及只是 logging 工具列表。mcp-use 2.4.1 一文談 client redirect/final endpoint；Uber gateway 一文談工具受控發布。本文改以 custom tool author、executor、destination 與 credential recipient 的關係為核心，並在正文區別相鄰案例。

## 已重新確認的來源邊界

已直接重讀 Splunk 公告與管理文件。正文保留受影響版本低於 1.2.1、修正版本 1.2.1、管理與執行 capability 前提，以及關閉／移除 app 的官方 workaround。公告的 CVSS v3.1 分數 5.3 Medium、CWE-918 按原文呈現，不外推為匿名攻擊、所有 MCP 的問題或 RCE。

管理文件用於核對 `enabled` 預設 false、管理端 bearer authentication，以及 `_meta.execution.endpoint` 與 placeholder。工具 description 不等於目的地授權是本文設計推論。沒有讀取 patch diff，正文沒有斷言修補內部演算法。沒有查得／宣稱實際遭利用事件。

## 原創設計與測試邊界

YAML 是自建平台概念契約，不是 Splunk API payload。專用服務憑證、工具定義版本綁定審查、執行前判定、出站拒絕理由與正反例均為作者建議。Redirect 案例明確列為額外防禦驗收，不是公告已披露的攻擊機制。

未安裝 Splunk、未調用管理 API、未送出 token、未執行 PoC、未測試修補版。所有驗收案例均標示未執行，只建議測試身分、假 token 與自有隔離接收端。升級指引與設計建議分開，未把後者宣稱為官方替代修正。

## 交付與驗收

正式文章、featured false；採段落、清單與 YAML，無表格與技術圖。封面 alt 應對照完成的原創封面。發布檢查與線上部署驗證由發布流程記錄，本筆記不提前寫入成功結果。

封面已依 `oct9-cover-directions.md` 的驗收描述設定精確 alt；封面工作已檢查 1600 × 900 WebP 及 320 px 兩種卡片裁切，無意外文字／logo。這不等於文章整頁 UI 驗收。
