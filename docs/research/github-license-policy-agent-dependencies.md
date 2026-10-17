# GitHub license policy 與 Agent 依賴審核

查核日期：2026-10-17。主文：`src/content/blog/github-license-policy-agent-dependencies.md`。

## 去重與系列

固定 main `84c1274190481d23ea0d3799a266b00df1b5af48`，全文讀取 426 個 blog、research 與 queue 檔案，未找到主來源 URL／穩定 slug／license compliance 核心題材。GitHub code search 回 incomplete_results=true，未採信零筆搜尋作為證據。既有 Actions lockfile 文談 tag 漂移，本篇談授權政策與例外審核，保留相關內鏈。本篇為獨立依賴治理文章，不編入不相符的既有系列。

## 來源與段落對應

All sources below were read in full through web tools on 2026-10-17. This is not search-snippet synthesis.

1. Primary announcement:
   https://github.blog/changelog/2026-10-16-open-source-license-compliance-generally-available/
   Publication/event date 2026-10-16, no exact hour. Supports introduction: GA, Enterprise Cloud including data residency, Code Security condition, coding-agent package preflight capability. Do not claim exact 24-hour inclusion down to the minute. No incident/CVE/exploitation claims.

2. Concept reference:
   https://docs.github.com/en/enterprise-cloud@latest/code-security/concepts/supply-chain-security/open-source-license-compliance
   Supports first section: detected direct/transitive dependency graph, PR base/head dependency comparison. Supports Evaluate section: Active blocks unresolved violations; Evaluate annotates without that ruleset blocking; separate comment-resolution protection still applies. Does not establish behavior for unknown licenses or the API's complete request format.

3. Configuration reference:
   https://docs.github.com/en/enterprise-cloud@latest/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/configure-license-policies
   Supports exception section: manager role, package/license/pattern choice and repository/enterprise scope. Supports final warning: informational risk classification is not legal advice and organization's legal team guides policy. Dependency graph must be enabled; needed access to enterprise policy/rulesets. Role assignment and changing security policies are not part of this publication task, and were not performed.

4. Existing alternative:
   https://github.com/actions/dependency-review-action
   README explicitly says unidentified license is reported but will not fail the action. Scope this statement to the Action only; do not infer new Enterprise feature behavior. The Action is a separate product path. No action installation or execution done.

5. API documentation gap:
   https://docs.github.com/en/rest/dependency-graph?apiVersion=2026-03-10
   https://docs.github.com/en/enterprise-cloud@latest/rest/repos
   Followed official announcement/configuration links and read both returned API directory pages. They did not list a directly verifiable package policy preflight endpoint/request/response. No invented endpoint, auth scope, curl, request schema, or execution result included.

6. Original analysis:
   The opening scenario is hypothetical, not user's actual project or claimed personal incident. Distinguishing preflight from final gate, binding evidence to head and policy, separating implementation/exception authority, suggested questions and negative test cases, and gradual rollout are this article's engineering recommendations. They are not claims of built-in enforcement or tested performance.

7. Relation to existing content:
   https://carlstack.gravito.dev/blog/github-actions-lockfile-review-boundary/
   Read repository source in full. Existing article deals with action reference drift, transitive/reusable workflow locking, and SHA review ownership. New article handles detected package licenses, enterprise policy, preflight and independent exception approval. No new core duplicate found in 426 pinned content files.

## 封面方向與驗收

已檢視鄰近封面：Actions lockfile 是藍插銷與木框的立體物件；due-work index 是綠色紙製檔案抽屜。本篇改為深紫紙感網版插畫、平視分工雙手、零件盤與獨立審核章；隱喻、媒材、構圖與色盤均不同。正式 imagegen 生成原創圖，1672×941；轉 WebP，完整像素與384×216卡片裁切皆已目視，無文字／商標。封面為概念圖。

## 技術與預覽

使用 Node24.19.0（符合repo >=22.13.0）、pnpm12.1.0。frozen-lockfile install 通過。其他最後檔案檢查與部署依當次執行紀錄為準；不把來源研究當成測試。未在企業帳號啟用或執行 license compliance，不提供API實測主張。

本機預覽兩次啟動皆在 ready 前退出（Dev server process exited before becoming ready），雲端瀏覽器 localhost:4337 亦回報 ERR_CONNECTION_REFUSED，未完成桌面／窄版實頁目視。依使用者允許的預覽例外續行，未繞過限制；封面全尺寸及卡片裁切已獨立目視。109 項單元測試通過。全域 pnpm 版本較舊，因此以本次暫存 PATH wrapper 使用 Corepack 的 pnpm12.1.0，未改專案 engines 或測試。Trail CLI 與索引未提供，去重改讀 pinned main 的 426 份 blog/research/queue 全文。

2026-10-17 發布暫停：最終單元測試109項通過，content policy通過。預設及768MB heap的完整pnpm check均通過214檔Astro診斷（0 errors/warnings/hints），但build在Vite成功後遭Killed，exit137。512MB heap、UV_THREADPOOL_SIZE=1的有界重試則在Astro診斷因JavaScript heap out of memory終止（134）。因此完整build、RSS、Sitemap、Pagefind尚未驗收，未commit、push或部署；需能完成現行必要檢查的雲端資源後續作，不能把局部通過當成發布完成。

2026-10-17 14:20（Asia/Taipei）續作：更換後的乾淨雲端環境約有8.8GB可用記憶體，未發現本任務殘留dev服務；從已保存的三檔備份恢復至獨立clone，main仍84c1274190481d23ea0d3799a266b00df1b5af48。Node24.19.0、pnpm12.1.0 frozen-lockfile install重新通過；不改程式、schema、測試或系統設定，重跑現行完整驗收。

14:23 續作結果：pnpm check完整通過（214檔0錯誤／警告／提示），build含653個HTML輸出、Pagefind索引651頁；本篇文章、首頁與文章列表、RSS、sitemap-0.xml皆已確認包含slug。109項單元測試再次通過。原有建置資源阻礙在新環境解除。astro preview仍在ready前退出，雲端瀏覽器ERR_CONNECTION_REFUSED，因此實頁預覽目視仍未完成；依既有預覽例外發布前保留此限制，正式站將另行驗收。
