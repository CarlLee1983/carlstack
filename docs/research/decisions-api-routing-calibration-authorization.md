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
