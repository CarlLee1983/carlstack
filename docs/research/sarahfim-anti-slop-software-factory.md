# Sarah 的 anti-slop software factory：來源與採用邊界

- 查核日期：2026-10-13（Asia/Taipei）。
- 主來源：https://x.com/sarahfim/status/2109736893198016898
- 貼文穩定 ID：2109736893198016898。
- 長文：https://x.com/i/article/2108633271882145792
- 長文穩定 ID：2108633271882145792。
- 原標題：How to build an anti-slop software factory for teams of 30+。
- 作者：Sarah（@sarahfim），原文自述負責 Composio product engineering。
- 來源取得：X 直接讀取回傳 403；以公開 https://api.fxtwitter.com/status/2109736893198016898 取得回應，code 200，tweet ID、article ID 與 URL 均對上。正文取自 article.content.blocks，不以摘要代替正文。
- 時間：貼文 created_at 為 2026-10-12 20:04:07 UTC（台北 10/13 04:04）；長文 created_at 為 2026-10-12T20:04:06Z，modified_at 為 20:05:02Z。正式文章採台北日期描述貼文。

## 去重與交付判斷

研究前先搜尋原始 URL、tweet ID 與 sarahfim，無結果；取得長文後再搜尋 article ID、anti-slop、software factory、Composio 等關鍵字。只有 agent-work-requires-verifiable-codebase.md 討論相近觀點，來源是 Lauren Tan，沒有這則來源。

新增文章聚焦跨職能團隊共用 repository 的目錄、型別、lint 與 CI；既有 Lauren Tan 文章聚焦 Agent 驗證環境與並行驗收。新文章連到既有文章，採 AI Agent 工程化與工作流實戰系列 order 84；同步遠端 main 後，Muse 文章已使用 order 83。

## 原文重點與證據限制

- 主張 repository 是共同工廠；個人 agent 可以不同。
- 建議 co-location、end-to-end type safety、接受局部 duplication、custom lint、E2E、bugbots、fast CI，再延伸到 cloud agents。
- 原文說 seven practical things，但列出 1 至 8，第 8 項為 Cloud Agents；成文不沿用「七項」作精確計數。
- 近 50 貢獻者、38 custom lint rules、Zen 超過 1,300 merged PRs、九月 245 PRs、Blacksmith 部分 checks 改善 50% 或 70% 以上，均為作者自述，沒有獨立數據驗證。
- 禁 lib/utils、useState/useEffect 需要理由是團隊政策，不能概括成框架規範。
- 原文的 slop exponential 沒有量測模型，文章不當成數學結論。

## 一手資料交叉查核

- Next.js project structure：https://nextjs.org/docs/app/getting-started/project-structure 。App Router 共置與 private folders 不等於 feature import 邊界。
- ESLint custom rules：https://eslint.org/docs/latest/extend/custom-rules 。支援回報、建議、fix 與 RuleTester；能力不能當成特定團隊成效的證據。
- tRPC quickstart：https://trpc.io/docs/quickstart 。靜態型別推導與 input parser 的執行期驗證分開。
- React：https://react.dev/learn/you-might-not-need-an-effect 。衍生資料可以在 render 計算；Effect 仍用於外部系統同步。
- Cursor Bugbot：https://cursor.com/docs/bugbot 。現行文件使用 .cursor/BUGBOT.md，原文簡稱 BUGBOT.md；rules 不自動成為 required merge check。

## 本文延伸建議

以變更一致性決定 duplication；lint 保留正反案例與替代入口；型別與不合法輸入分別驗證；測試觀察產品結果；量測第一次可行動回饋與返工。這些是作者工程建議，沒有宣稱在 Composio 或本文中實測。

## 封面方向

- 最近封面：Karpathy 為綠銅色復古觀測鏡版畫、Harness 為暖色紙藝三折證據板。
- 本文：輸送帶量規的檢驗隱喻；寫實工業產品攝影；斜向寬景；白、銀、紅、綠；明亮精密的 studio 光。
- 與近期封面的媒材、構圖、主色與光線不同。
- 使用內建 imagegen；提示主軸為白色精密檢驗台分流歪斜與合格金屬零件，無文字、品牌或人物。
