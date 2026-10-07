# mcp-use client 2.4.1 redirect 查核

查核日期：2026-10-07。文章：`src/content/blog/mcp-use-client-241-redirect-final-endpoint.md`。系列由整合者分配為「AI Agent 工程化與工作流實戰」68。

## 去重與新增理由

研究前已搜尋 src/content/blog、docs/research、docs/article-queue.md 的 mcp-use、2.4.1、redirectPolicy、redirect、OAuth 與 MCP，主來源 release URL 與 tag 無既有稿。既有 OAuth/OIDC 文解釋授權架構，MCP control-plane／gateway 文談權限與工具接入；OpenWA request-target 文談漏洞修補與目標解析。本文獨立增量為 2026-10-06 TypeScript release 帶入的 runtime 相容性變化、HttpConnector 去尾斜線實作、固定 SDK redirect helper 的 method/port/upgrade 特例與未執行的回歸設計。正文連回 OpenWA，未修改既有文章。

## 一手證據

- 主來源 https://github.com/mcp-use/mcp-use/releases/tag/%40mcp-use%2Fclient%402.4.1
- 可讀 release 清單 https://github.com/mcp-use/mcp-use/releases ：client 2.4.1 與 CLI 4.3.0 均顯示 06 Oct 18:59、release commit 56dbe75。單一 tag 網頁快取讀取失敗，內容由 release index 及固定 commit 的 package.json/code 交叉查核；正文只記日期，不推測網頁時間顯示的時區
- https://github.com/mcp-use/mcp-use/blob/56dbe75/libraries/typescript/packages/client/package.json ：name/version 2.4.1；client/core 2.3.1；ext-apps 2.0.3
- https://github.com/mcp-use/mcp-use/commit/24bf7b0fc65595045effe166895522dcc49cada0 ：包含 #2784 SDK refresh、changeset 與 changelog。不要把 canary 改版 commit 誤稱 stable release commit
- https://github.com/mcp-use/mcp-use/blob/56dbe75/libraries/typescript/packages/client/src/transport/http.ts ：親讀完整 connector。constructor `baseUrl.replace(/\/$/, "")`；HttpConnectorOptions 無 redirectPolicy；建構 StreamableHTTPClientTransport 不傳入該選項。gateway fetch 只改寫與 logical server origin/pathname 相符的 transport 請求，設 X-Target-URL，OAuth 自己的 URL 保留，proxy Request 使用 manual redirect
- https://github.com/modelcontextprotocol/typescript-sdk/blob/v2.3.1/packages/core-internal/src/shared/transport.ts ：親讀。301/302/303/307/308，MAX_REDIRECTS=5；GET 或 307/308 才 keepsMethod；userinfo 限制；同 protocol/host，或同 hostname 且雙方 default port HTTP→HTTPS 的 isWithinOrigin 特例。manual/error 直接交底層 fetch；正常 wrapper 使用 manual 逐跳處理；browser opaqueredirect 無可讀 Location。unfollowedRedirect 錯誤文字去 userinfo、query、fragment
- https://github.com/modelcontextprotocol/typescript-sdk/blob/v2.3.1/packages/client/src/client/streamableHttp.ts ：親讀 options/default/helper 使用；redirectPolicy option不涵蓋 provider 自己的 fetch
- https://github.com/modelcontextprotocol/typescript-sdk/blob/v2.3.1/packages/client/src/client/auth.ts ：親核 metadata、token request、registration 使用 fetchWithinOrigin
- https://github.com/modelcontextprotocol/typescript-sdk/releases ：上游 redirect 行為由 2.3.0 upgrade notes 已描述，本篇沒有宣稱它首次出現在 2.3.1

## 作者判斷與限制

從上述 code 推導：填 final URL 仍需驗 connector 正規化後的 URL；尾斜線伺服器可能需路由端改造；Node 成功不能推論 browser；token 不洩漏要看被拒絕接收端是否收到 request。這些是工程建議，不冒充 release 原話或實測事故。

未安裝／執行 mcp-use SDK，未對任何 MCP 或 OAuth endpoint 執行測試，未驗證特定部署。正文負面案例全部標記為原創待驗收設計；沒有成功率、測試通過或 CVE 新公告主張。source retrieval 與本地內容／圖片檢查不等於 SDK 實測。

## Cover Direction 與驗收

比較封面：OpenWA 為深藍紙雕、多路匯流、黃銅檢查點；同批 Django 整合者選酒紅／粉橘水彩、四個閘門。本文為鼠尾草綠與象牙白、玻璃／陶瓷微距攝影、水平直管對彎管封口、柔和側光；媒材、構圖、配色皆不同。

使用內建 imagegen 生成原創 cover，未用外部圖。完整 prompt：

> Use case: stylized-concept. Original editorial cover for a Traditional Chinese engineering article about MCP HTTP redirects: the configured URL must reach the final endpoint directly, and Node/browser have different redirect acceptance. Wide landscape 16:9, no text or logos. A striking macro studio photograph of a single luminous lime-green glass capsule traveling in a straight transparent glass tube toward a precisely fitted circular socket; beside it, a bent detour tube ends at an opaque frosted ceramic cap. Sculptural physical objects, ivory porcelain base, sage green background, soft lateral daylight, restrained elegant composition with large readable silhouettes at small card size. Materials glass and matte ceramic, no paper art, no computer UI, no arrows, no shields, no humans, no watermarks.

成品 `src/assets/covers/mcp-use-client-241-redirect-final-endpoint.webp`，1672 × 941。已看原尺寸與 320 × 180 card：膠囊、直管、彎管封口可辨，無文字／logo。PNG 轉 WebP 只作檔案格式轉換，未更動構圖。coverAlt 對應成品。正文不用圖解，無 Mermaid 或額外 SVG。

## 整合交接

僅新增本文、此 research、cover 三檔，未 stage/commit/push。文章 draft false、featured false，publishDate 由整合者在真正發佈前調整。最終 content policy、astro check、tests、build、UI 與部署驗收由整合者統一執行。

窄範圍格式化最初以環境預設 pnpm 執行，因 11.19.0 不符專案 >=12.1.0 而未執行成功；後改用整合者指定 corepack pnpm 12.1.0 執行兩份自有 Markdown 的 prettier。
