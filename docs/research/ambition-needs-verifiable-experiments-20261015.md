# 把任務交大之前，先把驗收做實：來源與驗收紀錄

查核日期：2026-10-15。獨立指定連結稿，不列入每日快報或系統設計每日篇數。

## 去重與論點

基底 a5c29cc29954b62a694cdc105a2e3aa2eb32de99。以完整及正規 URL、felixrieseberg、Felix、ambitious、野心搜尋 blog、research、queue，未有同來源。Karpathy 能力觀測既文談比較條件；本篇談選擇與擴大任務，保留互補連結而不重寫能力評估。

## 段落對應

- https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/ ：完整原文讀取，87 行。頁面標 2026-10-13，作者自述在 Anthropic 工作。第 27–32 行四方向、第 42 行工具與崩潰案例、第 47/51/63 行方法/外部驗證/角色扮演限制。正文僅短幅摘要；沒有全文翻譯或複製原文提示詞。第 48 行高目標作為批判討論起點，不承諾能達到不合理指標。
- https://www.anthropic.com/engineering/building-effective-agents ：讀官方全文，2024-12-19，現頁註明工具演進。只採簡單優先、外部回饋、停止條件等原則。
- https://sre.google/workbook/implementing-slos/ ：讀官方章節，採使用者經驗與 SLI/SLO 定義原則；付款分層量測為本篇延伸。
- 付款情境、20 件申訴與 200 ms 均明標教學假設；非站主經歷、非實測。無真人私人案例、金流憑證或正式交易操作。
- 原文天文、運動、歷史與心理學例子未採用，因此不以其逸事支撐本篇工程結論。

## 系列與美術

現有 AI Agent 工程化與工作流實戰最高 order 87，本篇 88；不新增 taxonomy 系統。
封面矩陣：Karpathy 為復古版畫/三鏡正視/綠褐；相鄰 Grok 為陶器玻璃3D/水平音波/紫黃。本篇為紙雕建橋/斜向升高/象牙黑橘紅、硬陰影，在媒材、構圖、色盤三項不同。
正式 image_gen 原創一張，無第三方圖。1672×941，WebP quality 88。已檢視全圖及 480×270 卡片，橋樑與量測器可辨識，無文字商標。正文不需額外架構圖，以短段落及工作契約表達決策。

## 驗收

原創文章與封面通過獨立內容審閱。pnpm 12.1.0 frozen install、format、content:policy -- HEAD、68 項單元測試及 Astro check（198 files，0 errors/warnings/hints）已通過。完整 build 與精確 head CI 結果將記錄在 PR；合併後核對正式 main 部署及文章、封面、列表、搜尋與系列。

預覽限制：Astro dev 在此環境於 ready 前退出，雲端瀏覽器 localhost 回報 ERR_CONNECTION_REFUSED。未完成本機整頁桌面／手機目視，依使用者既有預覽例外不阻擋發布，未繞過限制。封面全圖及卡片已目視。不將本文範例視為執行過的付款測試。
