# Pi MCP / Codemode 來源查核

查核日期：2026-10-01。
主來源與正規化 URL：https://earendil.com/posts/you-said-no-mcp/
穩定識別：you-said-no-mcp；作者 Earendil Engineering；標題 “You Said No MCP!”；發布 2026-09-29。

## 去重與範圍

研究前搜尋 src/content/blog、docs/research 與 docs/article-queue.md 的 URL、slug、Earendil、標題與作者相關字串，未找到同來源。既有 mcp-interface-needs-control-plane 聚焦權限，本篇聚焦工具發現與組合，保留站內連結。納入 AI Agent 工程化與工作流實戰，接續 order 48 為 49；既有 order 34 重複與本次無關，不改動。

## 來源與可支持的事實

- Earendil：https://earendil.com/posts/you-said-no-mcp/ 。團隊宣布 Pi 納入 MCP，說明 deferred / Codemode-only tool metadata、JavaScript 組合、harness 側信任與 transcript 狀態。不宣稱本機驗證版本或 API。
- Anthropic：https://www.anthropic.com/engineering/code-execution-with-mcp 。2025-11-04，說明工具定義與中間結果成本、按需載入與執行環境內過濾，提醒 sandbox、資源限制與監控。未引用示範節省百分比作普遍保證。
- Cloudflare：https://blog.cloudflare.com/code-mode/ 。Code Mode 以程式組合 MCP 工具；不推定所有 MCP client 均支援。
- MCP：https://modelcontextprotocol.io/specification/2025-11-25/server/tools 。固定歷史版本確認 structuredContent / outputSchema；不聲稱為最新規格。

## 作者設計與限制

案件契約、五頁／每頁百筆預算、排序驗收為本文建議，非上游實際 API。程式流程標示為概念，未安裝或執行 Pi，沒有性能實測。讀寫權限指向既有專文，避免重複安全論述。

## Cover Direction

最近封面：藍色紙雕、三條路徑匯聚、深色斜視構圖。
本篇：工具組合／模組合成器隱喻；網版印刷；俯視不對稱；象牙白、酒紅與橄欖綠；柔和日光。媒材、构圖與配色均不同。

內建 imagegen 最終提示：horizontal 16:9 editorial cover; warm ivory vintage modular synthesizer patch panel, burgundy and olive sockets connected by cables into one mechanical sequencer; screenprint with subtle grain; top-down asymmetric composition; no text, logos or watermarks.
資產：src/assets/covers/pi-mcp-codemode-tool-composition.png。
