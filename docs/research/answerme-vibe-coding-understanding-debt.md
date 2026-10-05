# AnswerMe 與 Vibe Coding 理解債

## 編輯決策與來源

作者先要求以本人角度撰稿，明確提供持續使用 vibe coding 累積理解債，以及過去用 show me 請 agent 生成本地暫存 HTML 的經驗；審閱交付稿後要求發布。本文保留這兩項親述動機，不推論 show me 是哪個特定專案，不新增事故、量測成效或他人評語。

2026-10-05 在 main `036742bc0ea3f35799b0f4e58f0b505665879392` 搜尋 AnswerMe repository URL、AnswerMe、answer-me、show me 與 show-me，檢查 `src/content/blog`、`docs/research` 與 `docs/article-queue.md`，沒有同來源文章。已讀 Karpathy 解說篇與 AI 抽象契約篇。前者討論如何選擇解說媒介、驗收人的理解；本篇是作者把理解債與暫存 HTML 習慣整理成 AnswerMe skill 的專案動機與取捨，讀者收穫不同，故建立獨立 URL，並與 Karpathy 篇加入雙向站內連結。抽象篇保留單向延伸閱讀。不改舊文發布／更新日期或網站排序。

納入「AI Agent 工程化與工作流實戰」第 61 篇，承接第 60 篇抽象與驗收契約；既有第 34 號重複不是本次範圍。

已重新核對 AnswerMe master commit `a256d0afb5dffc12e02e19a44e206d57824be437`：

- https://github.com/CarlLee1983/AnswerMe
- https://github.com/CarlLee1983/AnswerMe/blob/a256d0afb5dffc12e02e19a44e206d57824be437/README.md
- https://github.com/CarlLee1983/AnswerMe/blob/a256d0afb5dffc12e02e19a44e206d57824be437/skills/answer-me/SKILL.md
- https://github.com/CarlLee1983/AnswerMe/blob/a256d0afb5dffc12e02e19a44e206d57824be437/tests/answer-me/README.md

主要核對：概念學習／成果審視、代表流程追蹤、HTML／Markdown／對話、未指定格式時詢問、來源事實與推論分開、測試存在／執行／通過的區別、離線 HTML 與互動驗證、完整 code review 與修改程式不在預設範圍、歷史樣本不代表目前 skill 的評估通過。正文把技能指令寫成要求，沒有保證每次執行符合；快取、錯誤處理、模型均為解說情境。

## 封面方向與驗收

封面方向矩陣採文字記錄：

- 相鄰抽象篇：校準不同狀態物件的框架；立體手工質感；斜向近景；淡黃與紫色；暖光。
- Karpathy 篇：打開球殼觀察內部路徑；紙材立體模型；中心圓形與小人；深藍與珊瑚色；聚焦照明。
- 本篇：線團展開為可追溯踏石路徑，放大鏡檢查接點且保留線頭；水粉與色鉛筆；俯視不對稱橫向；淡薄荷、炭黑、珊瑚色；柔和日光。

僅保留橫幅與珊瑚色作系列連續性，其餘媒材、構圖、主色、照明皆與鄰近封面不同。使用內建 imagegen 生成原創圖片，轉存本地 WebP 1672 × 941，已檢視全尺寸與 320 × 180 卡片，無文字、logo 或遮擋主題。coverAlt 描述線團、踏石、放大鏡與未解線頭，不宣稱系統架構。

生成提示重點：original editorial cover about AnswerMe and understanding debt; pale mint desk; tangled charcoal threads becoming a readable sequence of coral stepping stones; hand inspecting the connection through a magnifying lens; loose unresolved thread; flat gouache and colored pencil; overhead asymmetric wide 16:9; no text, logos, UI, robots, circuit boards or spheres。

## 發布檢查

以 pnpm 12.1.0 執行 frozen install、format、stage 後 content policy、check、test、最終 production build，再檢查 RSS、sitemap、Pagefind、系列與正式精確 commit 部署。僅提交新文章、封面、本查核紀錄，以及 Karpathy 文末一段相關閱讀。正文沒有新增流程或架構圖。

本機預覽由正常雲端瀏覽器開啟，回覆 `ERR_BLOCKED_BY_CLIENT`，未繞過；本機文章桌面／320 px 深淺色 UI 未驗收。封面圖片的全尺寸與卡片檢視已完成。技術檢查與正式站驗證分開處理。
