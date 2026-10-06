# SubQuery 5.8.3：來源與驗收邊界

查核日期：2026-10-06（Asia/Taipei）。對應文章：`subql-common-compromise-execution-boundary.mdx`。

## 查重與範圍

在 main `0fbe00bdb6a00cef9cb1c0e9344b6fc70625037f` 搜尋 blog、research、queue 的來源 URL、`subql`、`SubQuery`、StepSecurity、供應鏈與 supply-chain。無相同來源／事件。既有 npm Trusted Publishing 文章談發布與 dist-tag 權限；本篇增量是惡意版本實際執行、runner 及權限暴露分流，並加既有 npm／NetScaler 站內連結。API 系列原最大15，本篇16。

## 來源

- [StepSecurity 原始研究](https://www.stepsecurity.io/blog/subql-ecosystem-compromised)，作者 Rohan Prabhu，日期 2026-10-05。正文僅保留版本與入口、持續執行及證據限制的短摘要，不轉載解碼器、payload 或完整取證內容。
- [研究者在 SubQuery repository 的 issue #3047](https://github.com/subquery/subql/issues/3047)。查核時頁面 open，未見維護者修復回覆；研究者要求撤回／輪替並不代表已完成。
- [release commit 506863d6fb82bd2714970cf8c6f1bf364374b009](https://github.com/subquery/subql/commit/506863d6fb82bd2714970cf8c6f1bf364374b009)：親讀 workflow diff，只描述外部產物替換；不複製可執行下載命令。
- [npm cli 6.6.3 manifest](https://registry.npmjs.org/@subql/cli/6.6.3)：親讀 dependencies 的 `@subql/common: ~5.8.2`。
- [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/)：固定 lockfile 的範圍。
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements/)：來源證明不保證無惡意程式碼。
- [GitHub secure use](https://docs.github.com/en/actions/reference/security/secure-use)：託管／self-hosted runner 邊界與權限。

## 未實測與原創建議

未下載或執行惡意套件，不存 payload，不接觸任何真實憑證。版本×環境×權限的分流、四份結案證據與停止規則為本文工程建議。只讀 lockfile 命令是初篩範例，不是完整偵測器。

## 封面方向與產出

鄰近 AnswerMe demo 為暖綠室內攝影、NetScaler 為黑白石門版畫。新封面用紫底瓷器黏土微縮、斜向輸送帶、琥珀隔離罩、紅線斷開；在媒材、構圖、主色與氣氛上區分。內建 imagegen 生成，原始產出檔 `exec-08d94ee9-537e-4ac2-b59a-813d093a2daa.png`，已檢視實際像素：無字與 logo、隔離／斷線主題清楚。本站使用 `src/assets/covers/subql-common-compromise-execution-boundary.png`。

Prompt: Original landscape 16:9 editorial cover about compromised package dependency and incident containment; tactile stop-motion clay and porcelain miniature; overhead diagonal porcelain conveyor with pale sealed parcels, a cracked crimson parcel isolated in translucent amber chamber and severed red thread; deep aubergine, lavender and amber accents; readable card-size silhouette, soft raking light, no text, logos, watermark, hackers, shields or padlocks.
