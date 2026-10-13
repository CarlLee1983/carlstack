# Muse Wonder：需求變更與記憶失效驗收

查核時間：2026-10-13，Asia/Taipei。日報窗口 2026-10-12T02:00Z–2026-10-13T02:00Z。

## 去重與範圍

以 Muse Wonder、來源正規化 URL、Meta、Active Memory 搜尋 blog/research/queue；既有 meta-muse-agent-permission-boundaries 談使用者與第三方執行權限；switching-costs 談遷移成本；本篇為新模型推出後的需求變更測試，讀者收穫不同。AI Agent 工程化與工作流實戰最新 order 82，本篇 83。未重寫每日系統設計 3。

## 一手來源與段落對應

- https://about.fb.com/news/2026/10/introducing-muse-wonder-models/ ：2026-10-12發布，Wonder API/Muse Code、Full訂閱者、Muse逐步推出；對應開場。全頁已讀。
- https://research.meta.ai/blog/muse-wonder ：Active Memory/Focus、長任務主張；對應第二節。廠商自述不寫獨立驗證。
- https://research.meta.ai/static/muse-wonder-model-card ：13頁PDF全文擷取，頁5MemoryBench包含干擾/衝突/更新與LLMjudge，頁6SWE-Marathon不是commonharness；對應記憶與比較限制。未引用分數，未將不同harness分數當模型因果證據。

## 工程建議與未實測

虛構訂單匯入、需求事件/验收狀態分離、撤回硬gate、工具逾時故障注入均為本文工程建議，非Meta實作規格。沒有實際跑模型、金流、物流或負載測試。只測本站文章技術建置。沒有私人資料。

## 封面方向

相鄰圖：Postiz平面版畫黃紅；pnpm深色玻璃軌道；harness水彩摺頁。新圖：淺桃布料上俯視刺繡框、鈷藍線與淘汰紫結；媒材/構圖/配色均不同。與另兩篇GitLab暗色金屬微距、Conduit彩色剖面陶水渠互異。正式imagegen生成，原始輸出與驗收後續記錄。

## 封面與驗收紀錄

2026-10-13 正式 imagegen 各生成一次，1672×941，轉本地 WebP。已目視全尺寸及三圖並列320×180卡片裁切：無文字/標誌，主要物件可辨，alt依實圖調整。三圖分別為暗色金屬微距/淺桃刺繡俯視/陶水渠側視，媒材構圖配色互異。未新增正文流程圖，無SVG驗收項。

本機 `pnpm dev --host 0.0.0.0` 回報 Dev server process exited before becoming ready，無可用頁面；依授權記錄未完成本機桌面/窄版/深淺色實頁目視，不繞過環境限制。正式站部署後另行核對。
