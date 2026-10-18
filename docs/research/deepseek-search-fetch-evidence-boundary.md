# DeepSeek Search / Fetch 的證據與失敗邊界

## 狀態與範圍

- 查核：2026-10-18 02:03–02:06 UTC（Asia/Taipei 10:03–10:06）。
- 正式文章：`deepseek-search-fetch-evidence-boundary.mdx`，預定 AI Agent 工程化與工作流實戰 91。
- 原始官方公告發布日期 2026-10-17，未從公告推定精確發布時刻。本文是新 API 語義工程分析，不引用模型 benchmark 成績。
- 主線：虛構供應商選型報告，搜尋摘要不可當成已查核原文；保留證據取得狀態、拒絕與暫時錯誤的不同處理，最後才計算排程和成本。
- 父代理已審讀全文通過；整合代理負責最終日期、系列唯一性、全部技術與正式站驗收。此文件不預先宣稱測試或發布完成。

## 去重與規範

讀取整合工作樹 main `f86cee5dab7cdcf004db6bec8c91f5dde81ecd3e` 的 AGENTS.md、docs/content-guide.md、src/content.config.ts、carlstack-copywriting 與 humanize-writing（含 zh-tw 禁用句式）。Trail CLI 不存在，嘗試 map/grep 均 command not found，故針對未能索引的文章與研究進行檔案搜尋。

在 src/content/blog、docs/research、docs/article-queue.md 以 DeepSeek、news261017、正規化 URL 搜尋。命中既有 open-source-ai-stack-blueprint-architecture、kv-cache-capacity-ledger、omarchy-dhh-omakase-linux-desktop，以及其他研究提及，但沒有本次 Search/Fetch 發布、錯誤與計費契約的同核心文章。本次新增，不修改舊文。

封面參考近鄰 poteto-agent-trust-investment（冷藍陶瓷托盤）及 ai-code-review-needs-a-stop-rule（綠色庭院圓軌），均已目視。本文不用哲學論證，不適用 philosophical-engineering-writing 的哲學來源流程。

## 原始來源與逐段對應

### 1. 發布公告

https://api-docs.deepseek.com/news/news261017/

- 完整頁面以公開正常 HTTP GET 取得並讀取，沒有登入、身分變更或規避措施。
- web open 首次 timeout，之後 curl 取得正常 HTML；這不是存取拒絕後換身分。
- 開場：10/17 V4.1-Flash-1017 發布與 Search/Fetch 開放。
- 費用段：each endpoint $0.75 per 1,000 calls；server-side tools in DeepSeek Harness、Claude Code、Codex for DeepSeek API users 暫時免費，Oct 31 2026 16:00 UTC 開始計費。此優惠依呼叫途徑及 DeepSeek API 使用條件，不代表只要安裝上述工具就全部免費。
- 不採用 daily hundreds of millions 或 Pareto improvement 廠商效能宣稱作結論。

### 2. 完整 Search & Fetch 指南

https://api-docs.deepseek.com/guides/search/

讀取完整公開 HTML，含 Request、Response、Errors、Billing、Rate Limits；非搜尋摘要。

- 「summary 很好讀」：兩端點；Search 的 summary 為給模型閱讀的長摘要，need_content default false，content 空字串；true 時 unavailable 仍空。正常無結果是 HTTP 200 results=[]。
- 「Fetch 404」：403 security policy；404 unavailable URL / site policy / target error / unsupported content type / no extractable Markdown。不能推定原網站不存在。408/429/5xx wait and retry；其他4xx不應 unchanged request retry；402 requires balance。
- 「Worker/429」：Search 與 Fetch 各自每帳號5QPS，互不消耗、各key共用帳號額度、與modelconcurrency獨立；Fetch額外per-domainQPS，指南未給數值。本文未猜測具體domain額度。
- 「費用」：成功 HTTP200且Search results非空/Fetch有content才計費；failed/empty/timeouts不計；count不改requestprice。指定serversidetools臨時免費期限 Beijing Nov1 00:00 與公告UTC Oct31 16:00一致，也與Taipei一致。
- 未引用 authority/rerank_score 當成內容真實性保證。

精確章節連結：
https://api-docs.deepseek.com/guides/search/#errors
https://api-docs.deepseek.com/guides/search/#billing
https://api-docs.deepseek.com/guides/search/#rate-limits

### 3. 官方模型卡交叉識別

https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017

直接讀取官方repo raw README（/raw/main/README.md）確認模型識別與 minor update 描述；未將模型卡分數放進文章，亦未聲稱自己測試模型。模型卡與 Search API 契約分開，本文API事實以指南為準。

## 工程建議與未實測界線

- discovered/content_received/unavailable 是本文自訂內部狀態，非API欄位。
- 收到content仍須檢查內容與主張、時效、登入頁或無關內容，非非空即可信。
- 403/明確policy拒絕停止，不換身份或繞過；404保留缺口；獨立公開一手替代來源需明記。
- Retry-After 若存在且有效才遵守，未宣稱DeepSeek必回此header。退避/總時間/次數預算為本文建議。
- 兩個帳號級排程入口與Fetchperdomain queue是建議，非已部署架構；限額非實測吞吐承諾。
- 2 Search +6 Fetch=8 successful billable calls，8/1000*0.75=$0.006，教學假設，不含模型token、儲存等。未執行付費API、沒有token/憑證傳輸或費用。
- 最後四種驗收案例為建議，沒有假稱已跑：正常content、200empty、404、連續429。
- 不描述站主親歷，不使用私有專案資料。虛構供應商明標。

## 原創封面

- 正式生成工具 image_gen，單次新生成，未使用第三方素材。
- 原始輸出：`generated_images/exec-5dba1598-a444-45e9-be58-80201ae35d5a.png`，1672×941。
- 專案輸出：`src/assets/covers/deepseek-search-fetch-evidence-boundary.webp`，1672×941，WebP quality87；未重製其他封面。
- 已目視全尺寸與480×270卡片裁切，索引卡/封閉紅資料夾/展開頁面主題清楚，無文字logo；正式網站實際卡片由整合代理驗收。
- Cover matrix：線索與原文的實體檔案隱喻；紙雕/risograph質地；檔案抽屜近側視；磚紅/象牙白/炭黑；暖色斜光。相對近鄰兩張在媒材、構圖、配色至少三項不同。
- Prompt：Create an original editorial illustration for a software engineering essay about web search finding a reference but not yet obtaining evidence. Wide landscape 16:9, a beautifully composed close side view of a library card catalogue: one warm ivory index card in foreground with a simple punched circular hole, behind it a closed burgundy archival folder, and one opened folder with real blank paper pages illuminated by a narrow warm beam. Modern cut-paper collage / risograph texture, brick red, warm ivory, charcoal palette. Strong central focus and generous negative space, restrained, sophisticated print magazine illustration, readable as small thumbnail. No writing, text, logos, numbers, watermarks, screens, robots, charts or arrows. The three objects are physical metaphors, not a diagram. 1600x900 or similar wide ratio.

## 尚待整合驗收

作者工作不包含commit/push。整合代理需在最後檔案上執行format、contentpolicy、check、test、build，校正真實publishDate並確認seriesOrder91未衝突，再核精確main部署及正式body/cover/index/RSS/sitemap/Pagefind/series。桌機/窄版深淺色預覽未由本作者執行；沒有SVG圖解故不產生額外diagram元件。

整合預覽限制：此工作區Astro dev在ready前退出，自有雲端Chrome localhost:4348拒絕連線，桌面/窄版/深淺色實頁預覽未完成；不影響必要技術檢查要求。
