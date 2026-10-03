# 主要助理與遷移成本：來源、去重與查核

查核日期：2026-10-03。

## 來源與去重

本篇依作者提供的繁體中文第一人稱稿件整理，標題為〈AI 的下一場競爭，是成為你不想更換的助理〉。交接說明與待核實標記不屬於文章正文；發布稿保留作者對 Agent 生態系、主要入口與遷移成本的預測，沒有補造親自測試或長期使用經驗。

寫作前，以 main `3f3e10a` 為基準，搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md` 的文章標題、檔名、主要助理、重新建立默契、遷移成本、OpenClaw、Grok Bot、Gemini Spark，以及 introducing-dots、introducing-muse、next-evolution-gemini 等來源 URL／識別詞。

站內已有 dots 持續責任、Muse 權限、Grok Bot 共享環境與工程協作文章；沒有同標題或相同讀者收穫的競爭評論。本篇保留新 URL `ai-agent-primary-assistant-switching-costs`，連到三篇工程文章，並從最接近的 dots 文章加入反向延伸連結。該舊文僅新增連結，不回填實質更新日期。系列採既有「AI Agent 工程化與工作流實戰」第 56 篇，接續第 54、55 篇。

## 官方來源核對

- [OpenClaw 官網](https://openclaw.ai/)與[官方文件](https://docs.openclaw.ai/)：self-hosted gateway，可在自己管理的電腦或伺服器執行並接通訊工具。官網已有桌面安裝入口，不暗示人人都須手動部署。
- [Grok Bot](https://x.ai/bot)與[Overview](https://docs.x.ai/grok-bot/overview)：服務整合持久雲端電腦、符合資格方案可用；同一使用者的個人 Bots 共用一台電腦，不能把多個角色當成隔離的安全環境。正文不提供易變動的價格表。
- [Team Bots 公告](https://x.ai/news/team-bots)，2026-09-28；[文件](https://docs.x.ai/grok-bot/team-bots)：Teams 與 Enterprise 的 public beta，共用工具、知識、團隊記憶，個別私聊仍保留私密性。
- [OpenAI dots 公告](https://openai.com/zh-Hant/index/introducing-dots/)，2026-09-29：有自己的運算環境，持續推進個人工作，符合資格方案可用。專職組織角色宣布將向少數企業開放預覽，不寫成所有付費帳號或組織已可用。
- [Meta Muse 個人版公告](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)，2026-09-08；[方案說明](https://www.meta.com/en-gb/help/subscriptions/1021145227643680/)：有用量上限的免費服務與付費訂閱。首波美國不代表目前僅有美國。
- [Muse for Small Business](https://about.fb.com/news/2026/09/introducing-muse-small-business/)，2026-09-29：已延伸小型企業場景，並說明服務可於美國、加拿大使用。因此原稿「Muse 偏個人」限定為個人版的產品敘事，而非排他的產品分類。
- [Google：Gemini app 下一階段](https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/)，2026-05-19：公布 Gemini Spark、背景雲端任務。公布不等於當日全面推出。
- [Gemini Spark 說明](https://support.google.com/gemini/answer/17094507?co=GENIE.Platform%3DAndroid&hl=zh-Hant)：核對 Gmail、Calendar、Drive、Docs 與其他 Google／第三方服務整合；正文補上使用者授權並連結的前提。

## 延伸閱讀與主張邊界

原稿兩篇 The Verge 均已核對標題、URL 與內容：[Dot hands-on](https://www.theverge.com/ai-artificial-intelligence/1004096/openai-chatgpt-dots-hands-on-agent)，2026-10-02；[Gemini Spark](https://www.theverge.com/tech/932996/google-gemini-spark-antigravity-io-2026)，2026-05-19。保留為延伸閱讀，產品核心事實以官方來源支持。

作者關於主要助理集中、記憶與信任造成黏著度、Google 面臨主要入口競爭，以及後來者必須超過遷移成本的論點，均標為個人預測。可攜性改善及信任事件可能改變結果的保留條件完整保留。文中的「假設一個 Agent 已替我工作幾個月」仍是假設，不改為已發生的親身經驗。

## 封面方向與驗收

相鄰兩篇封面分別採紙感印刷／斜向檸檬黃光束／灰白背景，以及紙雕建築／剖面球體／深藍珊瑚色。本篇用前景已織成的布與後方未完成織框，表達累積脈絡與重新交接；採寫實纖維靜物、非對稱景深、深森林綠與紫褐金色、暖側光。媒介、構圖、色盤及光感與相鄰封面有明確區別。

原創圖片由內建 image generation 製作，再轉 WebP，1672 × 941。已實際檢視全圖及 360 px 卡片尺寸，確認主體可辨、無文字、商標或浮水印。封面為象徵性插圖，不是產品 UI 或實測截圖。

生成提示的核心描述：wide editorial textile still-life; intricate woven cloth on a foreground wooden loom, sparse loose threads extending toward an empty frame behind; forest green, muted mauve and antique gold; warm lateral light; no text, logos, robots, chains or padlocks。

使用者已明確同意本篇內容與技術檢查完成後先發布，線上版面由本人查看。雲端桌面／320 px／深淺色文章 UI 檢視未完成，不列為通過，也不更改安全設定或繞過預覽限制。文章沒有新增流程或架構 SVG。
