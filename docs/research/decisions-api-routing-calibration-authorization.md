# Decisions API：分流契約、校準與授權界線

## 查核與差異化

- 查核日期：2026-10-07
- 主來源及正規化 URL：https://community.openai.com/t/decisions-api-is-now-available-in-public-beta/1403877
- 穩定內容 ID：1403877
- 官方指南：https://developers.openai.com/api/docs/guides/decisions
- 官方 reference：https://developers.openai.com/api/reference/resources/decisions/methods/create
- 在 `src/content/blog`、`docs/research`、`docs/article-queue.md` 搜尋主 URL、ID、指南 URL、Decisions API、GPT-6 Luna，未命中既有來源稿
- 另檢視 `claude-eval-hillclimb-validation-boundaries.md` 與 `cloudflare-user-insights-model-routing.md`。既有文分別談評分器迭代與模型候選驗收；新稿聚焦新 endpoint 的具體回應契約，以及分類服務到退款服務的權限界線。文章已連回兩篇既有文；沒有修改它們
- AI Agent 工程化與工作流實戰 seriesOrder 67，由整合者分配

## 取捨與事實使用

正文僅保留官方公告的 beta 時間、模型與輸入類型、速度自報，以及指南/reference 中與實作有關的少數契約。score 的加權意義與每題 refusal 是本稿需要補足的一般產品摘要缺口。價格已查閱但未寫入，避免讓本稿變成易過期價目表。

confidence 的定義與校準品質不自行推定。本文以自訂 selected_probability 作為第一版實驗訊號，明示數字 0.9 非建議門檻。標註流程、內部狀態、fixture、成本算式與付款隔離均為作者工程設計，未聲稱官方已實作或驗證。

- 沒有呼叫付費 API
- 沒有跑 benchmark、退款服務、shadow deployment 或實際流量
- JSON 是依官方契約撰寫的請求 body，非完整 client；本文清楚標示未送出
- 不宣稱 confidence 等於 selected probability、機率保證正確、score 是整數類別或 API 會代為授權工具

## Cover Direction

生成前檢視近期兩張封面：

- ReviewBench：橋梁檢查隱喻；木刻版畫；側向巨大拱橋；靛藍與橙；夕陽強烈對比
- DeepAgents：書頁連到工具抽屜；紙雕；斜向延伸；深綠與米白；柔和暖光
- 本稿：彈珠分流後另設機械閘門；微距產品攝影風格；俯斜視中央分叉；冰藍、銀、鈷藍與銅；明亮冷日光

新封面在媒材、構圖、主色與光線均與相鄰封面有區別。內建 imagegen 單次生成，沒有 CLI/API fallback。儲存於 `src/assets/covers/decisions-api-routing-calibration-authorization.webp`，1536 × 1024、RGB、無透明。

生成 prompt：

Use case: stylized-concept. Asset type: original engineering editorial blog cover, wide landscape 3:2. Primary request: a physical precision marble sorter illustrates probabilistic routing with a separate safety gate. A graceful brushed-aluminum branching chute carries a few cobalt blue glass marbles; one branch curves into a shallow amber review bowl, another stops at a prominent closed copper mechanical gate with its own manual lever. No letters, no numbers, no UI, no logo, no watermark. Style: high-end macro product photograph of a tactile miniature sculpture, clean sculptural geometry, not a diagram. Composition: oblique overhead close view, large recognizable sorter centered, substantial negative space around it, all key shapes stay within central 80 percent for card cropping. Palette: pale icy blue background, cobalt glass, silver aluminum, warm copper gate and amber bowl. Lighting: bright soft daylight with crisp but gentle shadows, analytical calm. The closed gate is visibly a separate mechanism downstream from the sorting junction. Avoid circuit boards, screens, text, people, locks as icons, excessive tiny detail.

## 本地驗收

- 全尺寸目視：分叉滑道、覆核碗與獨立關閉閘門清楚，無文字或 logo；純意象封面，不是系統流程圖
- 320 × 180 cover crop 目視：左右兩個結果與閘門仍可辨識，沒有依賴細小文字
- coverAlt 描述圖中的分流與獨立授權關係，frontmatter 指向實際本地檔案
- 僅寫入文章、此 research 與 cover 三個專屬檔案，未改共享檔，未 stage/commit/push
- JSON 語法、本地站內連結、draft/series 基本檢查已通過
- 兩份 Markdown 以本地 Prettier binary 完成 format 與 check；一般 pnpm exec 因環境 11.19.0 低於 repo 要求 12.1.0 失敗，未以關閉 engine 檢查繞過
- 最終 publishDate、全站 format/check/test、content policy、build 與部署驗收交整合者統一處理

## 2026-10-23 GA 實質更新

- 保留原始 URL、publishDate、seriesOrder 67、封面與既有校準／退款授權論點，依同題去重規則更新本文。
- 新主來源：https://openai.com/index/decisions-api/ （2026-10-22）。完整閱讀公告；GA、400 題上限、JSON、題內圖片、快取、GPT-Live 與 US/EU inference residency 均由公告支持。未將廠商速度自報寫成實測，也未加入易過期價格。
- 重查官方指南 https://developers.openai.com/api/docs/guides/decisions 及 create reference https://developers.openai.com/api/reference/resources/decisions/methods/create 的 What’s new、圖片、題目與回應欄位。現行 input_image 接受公開 HTTP(S) URL 或 data URL，File ID 不支援；修正初版過時的 inline-only 說法。
- 語音來源：https://developers.openai.com/api/docs/guides/decisions-voice 。核對原生委派、逐字稿 trigger 與 session.update / matching session.updated 的順序；未照抄完整車載範例。
- 新增的兩階段升級驗收、快取成本分類、逐字稿版本與操作回報條件為作者建議，未執行或宣稱 API 保證。
- trail map / trail ask 均因 CLI 不存在而無法執行，改讀指定檔案、內容指南與兩個寫作 skill；未安裝替代工具或修改設定。
- 僅修改本文與本 research；未 stage、commit 或 push。完整發布 gates 由整合者負責。

### 本批最終驗收

2026-10-23本批整合已完成pnpm12 frozen install、scope format、stage後policy（3篇）、完整check、117tests及最終build，dist內更新正文/canonical/h1/既有cover/內鏈/list/RSS/sitemap/series/Pagefind均驗證。Local dev與cloud localhost preview不可用，未宣稱mobile/light-dark版面通過，環境限制詳見formal-verification-proof-scope同批紀錄。第二次獨立核對voice guide的session.update→matching session.updated，以及reference圖片public HTTP(S)/dataURL、不支援FileID，與新稿一致。

## 2026-10-23 使用者回饋後的去 AI 味修訂

使用者指出原標題「退款授權仍要留在程式裡」有明顯AI味。本批GA更新曾保留10月7日原標題，沒有對這個標題完成有效去AI味改寫；不能用讀過skill或checker執行紀錄代替成品判斷。

整合者實際讀取紀錄：02:04UTC讀repository `humanize-writing/SKILL.md`；02:05UTC讀`references/zh-tw.md`。首批整合者只對兩篇新稿跑checker，Decisions由研究代理修改並回報checker結果，原標題仍保留。回饋後02:45UTC重新完整讀SKILL.md、zh-tw.md及敘事reference，再逐段審稿。當時main為`feb1cc19c0add420c1efd757e521704a70b4a1d8`，skill blob `ab40928dda9e2d7d6a60c2e32c3c93fa283a6ed3`。

本次改為「用 Decisions API 分流客服案件：分類、覆核與退款流程」，同步改具體摘要，移除開頭格言式轉折、重複「本文」免責及空泛收尾。未改API事實、數字、來源與未知範圍。已搜尋src與docs的原始／百分比編碼anchor及標題，沒有兩個待改小標的站內反向連結。將「三種回答形狀，對應三種不同的程式責任」及「已判定損壞，仍然只能進入退款審核」改為具體的API型別用途、退款服務身分與權限檢查。新增API呼叫或實測為零。

自檢：checker由11處降至4處，剩餘均為真正並列狀態／測試案例的冒號，不是鋪梗修辭。另以程式逐項確認2個code fences、29段inline code、5個外部URL與17段引號內容按原順序逐byte一致。URL檔名、publishDate、cover/coverAlt、tags、seriesOrder均保留；updatedDate記錄實質編輯時間。編輯diff先交父代理審閱，技術gates與部署驗證另接續。

修訂稿發布前：完整pnpm check（0 errors/0 warnings/0 hints）、117/117 tests、final production build完成。最後正文在content sync/build前已固定，另重跑final staged policy（1篇）、scope Prettier check及protected-segment檢查；dist已確認新標題、兩個新小標與三種分類結果的完整敘述。frozen install再次確認鎖檔未變。尚未實測任何付費API。
