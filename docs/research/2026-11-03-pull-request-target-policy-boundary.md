# pull_request_target 政策延後與信任邊界查核

- 查核時間：2026-11-03T10:08:00+08:00。
- 基準 main：58cdcb3ec77ddc88e1593a8190775f1a57858ba6。
- 正式稿：src/content/blog/pull-request-target-policy-boundary.md。
- 去重：blog/research 對 pull_request_target 無既有命中；新資訊為 11/2 官方延期公告，不重寫一般沙箱文。

## 一手來源與段落對應

1. https://github.blog/changelog/2026-11-02-pull_request_target-blocked-by-default-december-2/ — 11/2 15:14:46 UTC 發布、17:43:51 UTC 更新。已直接下載HTML並讀正文；延期到12/2、11/9與11/16 16–18UTC brownout、run failed且不執行、private/internal/GHES除外。對應導言與時程。
2. https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request_target — 事件脈絡、fork pull_request權限與來源。對應權限拆分。
3. https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target — checkout不是執行、建置/安裝/設定可執行未信任內容，workflow_run產物也需視為不可信。對應盤點與輸入處理。
4. https://docs.github.com/en/actions/how-tos/administer/control-workflow-execution — 政策多層、workflow path targeting、Insights。對應例外範圍。未把一般Evaluate企業方案條件推成所有方案可自行建立Evaluate政策。

## 範圍與不確定性

未執行讀者工作流程、brownout或權限變更；範例專案虛構，驗收清單屬工程建議。沒有CV​​E/實際利用歸因或新CVE聲稱。不提供可直接貼上放寬權限的設定。來源截至查核時間，正式生效前需再核官方時程。

## Cover Direction

已目視相鄰sandbox-authority-boundary-acceptance（紙雕等角、奶油/藍/橙、雙圓圍牆）和hackerbooks-source-preserving-index（繪畫筆觸、鼠尾草/陶土、書桌近景）。本篇採輸送帶/門與窄通道的隱喻、網點絲印、非對稱斜向構圖、朱紅/黑/米白、警覺清楚；媒材/構圖/配色均區分。

正式image_gen產物 exec-47e1d938-75c1-49b0-93f8-98ed1184eaba.png，裁為1600×900 WebP quality86。已目視全尺寸與400×225卡片，閘門、摺紙、標籤及工具箱清楚，無文字或品牌Logo。未新增正文圖解。
