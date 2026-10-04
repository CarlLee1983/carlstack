# Uber MCP Gateway：工具發布與撤權驗收

查核日期：2026-10-04（Asia/Taipei）。

## 去重與讀者收穫

- 原始來源：https://x.com/ubereng/status/2106071967619322330?s=46
- 正規化來源：https://x.com/ubereng/status/2106071967619322330
- 穩定 ID：2106071967619322330
- 官網來源：https://www.uber.com/us/en/blog/designing-mcp-gateway/
- 以以上 URL、ID、MCP Gateway、Uber 搜尋文章、research 與 queue，沒有同源文章。
- 相近文章：`mcp-interface-needs-control-plane` 著重單一工具授權；`pi-mcp-codemode-tool-composition` 著重按需發現與資料組合；`agent-loop-cost-ledger` 著重逐輪成本。
- 新文收穫：為多 owner 工具定義建立可版本化的發布契約，測試未核准更新、舊 schema、政策過期與撤權傳播。與 Pi 文加入雙向閱讀路徑；Pi 文僅加延伸閱讀，不變更原發布／更新日期。

## 證據與限制

- Uber 官網日期 2026-10-01；X 長文日期 2026-10-02。不得假定 X 長文一定含有官網超連結。
- 官網是架構敘述及公司自報規模，並非本文的實測。800+ server 包含虛擬 server 的登錄與代理概念；沒有可獨立重算的效能 benchmark。
- MCP 2026-07-28 Tools：https://modelcontextprotocol.io/specification/2026-07-28/server/tools
- 規格用於核對授權依請求變動、輸入驗證、限流、結構化輸出及 outputSchema 要求；不把 Uber 的設定或 Omni 功能當成標準 MCP API。
- 發布契約、版本化核准、撤權期限、故障注入與成本比較方法均是本文的工程建議，不聲稱為 Uber 的完整內部實作。
- Node.js admission 範例僅檢查新呼叫准入；actor、tool 的來源必須可信，未實作驗證簽章、完整 RBAC、資源授權、分散式快取或執行中取消。

## Cover Direction

- pstack：驗收沖床隱喻；厚塗質感；俯視工作臺；鈷藍／珊瑚／奶油色；方向性日光。
- 主 Agent 切換成本：織布機隱喻；寫實照片；近景斜側；深綠／棕／紫；暖色工作室。
- 本文：閘門水道與上方設定牌；釉面陶瓷模型；低視角正面偏側；淡紫／梅紫／薄荷／蜜桃；柔光。
- 本文與相鄰封面在隱喻、媒材、構圖、色盤及光線上區隔；保持橫幅比例。
- Built-in image generation 產出原創圖像，無第三方圖片、文字、商標或 logo。原始 1672 × 941；轉存 WebP。已檢視全尺寸與 320 × 180 卡片版本。

## 驗證紀錄

- pnpm 12.1.0，Node.js 24.19.0。
- `pnpm install --frozen-lockfile` 成功，鎖檔未變動；暫存 store/state 使用 workspace 外可寫的暫存位置。
- 從文章原樣抽出的 JavaScript 範例：11 admission cases passed。
- 桌面／320 px 深淺色視覺驗收：尚未完成。嘗試啟動 Astro dev 後，雲端瀏覽器開啟 localhost 預覽回傳 `net::ERR_BLOCKED_BY_CLIENT`，未嘗試繞過限制。
- 獨立內容覆核已完成：修正 X／官網關係、加入非有限時間與 scopes 型別拒絕案例、明確撤權 admission 計時與共同 A/B 起點。
- 本次採直接發布、正式站再檢查的方式；不宣稱已通過本機桌面／320 px 深淺色視覺驗收。
- `pnpm content:policy -- HEAD`、`pnpm check`（format、Astro check、production build）與 `pnpm test` 通過；65 tests 全數通過。
- 使用 `SITE_URL=https://carlstack.gravito.dev` 驗證 canonical、首頁、文章列表、RSS、sitemap、Pagefind、系列與站內連結。
- 系列順序依實際發布序列確認，發布前刷新時間與 main 基底，並重跑完整檢查。
