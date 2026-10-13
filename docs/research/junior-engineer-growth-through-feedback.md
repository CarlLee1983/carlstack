# 工程師回看錯誤與判斷力：來源查核

- 查核日期：2026-10-13，Asia/Taipei。
- 正式文章：`src/content/blog/junior-engineer-growth-through-feedback.md`。
- 人物阿哲、公司情境、對話與事故皆為虛構敘事，不是作者的親身經歷或真實公司的事故紀錄。
- 「量變到質變」是本文描述學習轉變的日常用語，不宣稱為哲學家的命題或研究驗證的固定成長階段。

## 去重與系列

在 `src/content/blog`、`docs/research` 及 `docs/article-queue.md` 搜尋四個來源 URL、文章標題、作者與菜鳥、量變、阿哲等主題詞。未有相同來源或敘事；Fowler 在其他文章的引用指向 Bounded Context 等不同資料。

- `ai-coding-beginner-learning-route`：三個可驗收的 AI Coding 練習專案。
- `ai-learning-loop-private-tutor`：教學流程與獨立能力驗證。
- 既有 DDD、重構與技術債文章：模型切分、模組審查或架構決策。
- `order-system-write-ownership`：目前價格與成交快照的資料責任、共同交易及整合驗收。本篇以個人的理解如何轉變為主，建立雙向相關閱讀連結。
- `magpie-lessons-evidence-to-acceptance`：Agent repository 的教訓文件與驗收 gate。本篇不引入 Agent 工作流。

本文的讀者收穫是把自己寫過的錯誤變成下一次可辨認的反例，與上述題目不同，使用新 URL。保持獨立文章，不加入每日系統設計、AI、DDD 或哲學系列，也不另開單篇系列。一般發布，`featured: false`。

## 一手來源與證據界線

### Kent Beck：預期結果需要獨立推導

- 原文：<https://newsletter.kentbeck.com/p/canon-tdd>
- 標題：Canon TDD。
- 日期：2023-12-11。
- 原文提醒把程式實際算出的值直接貼成測試預期值，會失去交叉檢查的功能。
- 本文用於說明反例與預期結果的實務判斷，不宣稱 TDD 保證沒有錯誤，也不把事故後補測試稱為完整 TDD 流程。

### Sandi Metz：錯誤抽象可能比重複昂貴

- 原文：<https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction>
- 標題：The Wrong Abstraction。
- 日期：2016-01-20。
- 原文支持在共用抽象開始受參數和條件分支扭曲時，重新辨認實際需求，必要時先回到重複。
- 這是工程經驗觀點，不是重複永遠較好或抽象應一概刪除的通則。

### Martin Fowler：錯誤修正與重構分開

- 原文：<https://refactoring.com/>
- 定義：以小步轉換改善內部結構，維持可觀察行為。
- 故事先修正錯誤歷史金額，再整理資料責任與輸出格式；不把行為修正全部稱為重構。

### Loksa 等人：短期教學的有限證據

- 作者公開全文：<https://faculty.washington.edu/ajko/papers/Loksa2016ProgrammingProblemSolving.pdf>
- 標題：Programming, Problem Solving, and Self-Awareness: Effects of Explicit Guidance。
- 發表：CHI 2016。
- 48 名高中生，兩個各為期兩週的網頁開發營隊；實驗組 25 人、控制組 23 人。
- 上午／下午班依學生報名時段組成，沒有個體隨機分派程序；作者承認時段等混淆因素。
- 四種介入同時加入，包含解題教學與反思提示；不能把效果單獨歸給反思。
- 自行發起功能的加權完成分數較高；指定作業的完成表現沒有顯著差異。
- 沒有測試職場工程師的長期成長，不足以證明本文敘事中的路徑是普遍規律。故事成長弧線與工程建議均為本文的綜合分析。
