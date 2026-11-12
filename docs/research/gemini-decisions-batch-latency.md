# Gemini Decisions API 查核紀錄

查核日：2026-11-12（Asia/Taipei）。對應文章 `gemini-decisions-batch-latency.md`。

## 來源與去重

- 主來源：https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/ 。2026-11-11 發布，作者 Min Choi、Felix Yu。已讀完整正文，未使用網頁中的 AI 摘要替代原文。
- API 文件：https://aistudio.google.com/docs/decisions-api 。已讀問題、輸入、回應、Limits 及 Limitations。模型獨立頁 https://aistudio.google.com/docs/models/gemini-decision-1 工具無法讀取，未依該頁作出額外主張。
- 已按 `gemini-decisions-api`、`gemini-decision-1` 搜尋文章、研究及佇列，無既有 Google 文章。既有 `decisions-api-routing-calibration-authorization.md` 屬 OpenAI。新文聚焦 Google 多題請求、延遲條件與成本量測，正文連回舊文，不重寫基本分類器。
- AI Agent 工程化與工作流實戰已有1–114，新文用115。發布前由整合者再次檢查是否有並行新文章。

## 編輯查核

公告的150–250ms與1–100題、最多16K上下文一起保留，沒有套用到1,000題／256K上限。沒有宣稱低價或最快的普遍優勢。API文件確認共享輸入、獨立問題、總context上限，以及不支援Batch API／context caching；正常答案與HTTP400安全阻擋分開。Google與OpenAI是不同產品，未搬用舊文SDK欄位。

案例、測試分組、量測步驟及導入建議均為原創工程建議。沒有呼叫API、上傳資料或付費，沒有速度或準確率實測。只以Node v24.22.1的BigInt算術核對9,600與161,600 tokens，以及按每百萬0.10美元計算的0.00096／0.01616美元。初版浮點精確相等比較失敗，改用整數分母10,000,000核對，未把浮點近似當金額真值。

已讀寫作技能及繁中humanize規則，標題人工確認為單純描述內容。checker最終無機械命中，另人工檢查免責聲明與段尾警語沒有反覆堆疊。無可執行API示例，無新流程圖。

## 原創封面

生成前目視前篇AlphaProof紙雕封面及舊Decisions金屬彈珠封面。新封面改用不透明水粉筆觸、俯視托盤、紫紅／淡紫色、晨光靜物；與前兩張在媒材、構圖及主色不同。

正式imagegen生成，提示為：Original editorial blog cover about batching independent API decisions and measuring latency. Wide 16:9 illustration. A warm plum-colored desk viewed from high oblique angle, three lavender ceramic sorting trays holding small cream cards with simple embossed circles, one small coral mechanical stopwatch without digits beside the trays, loosely painted gouache and dry brush texture, soft morning side light. Balanced centered composition that survives 16:9 and 3:2 card cropping. No words, letters, numbers, logos, company symbols, UI, arrows or watermark.

產物轉1600×900 WebP，159,992 bytes。已目視全尺寸及480×320卡片裁切，三托盤與碼錶可辨識，無錯字或Logo，coverAlt描述符合畫面。原圖未刪除。

## 待整合驗收

由發布整合者對最終檔案跑format、policy、check、test與完整build，核對RSS／Sitemap／Pagefind／系列115，並完成可用預覽與正式站驗證。本紀錄不聲稱上述整合檢查已完成。
