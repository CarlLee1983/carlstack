# 中文技術寫作與 STE 借鑑

查核日期：2026-10-04（Asia/Taipei）。

## 來源與去重

- 主來源／正規化 URL：https://my.feishu.cn/wiki/H5bCwxXJTiWueHkUiy6cHhy3nwf
- 穩定 ID：H5bCwxXJTiWueHkUiy6cHhy3nwf。
- 頁面標題為「Karpathy 的《ASD-STE100》中文版」。標題中的名字不構成 Karpathy 撰寫中文內容的證據。
- 公開文件作者顯示為磊叔，內容將 ASD-STE100 寫作思路改作中文技術寫作提示。頁面顯示的修改月日沒有年份；不將其當作發布年份依據。
- 在 main `b62f1feda56dd092934c9c0f91d93d64a027fc53` 搜尋原始 URL、正規化 URL、穩定 ID、磊叔、ASD-STE、中文技術寫作，範圍為 `src/content/blog`、`docs/research`、`docs/article-queue.md`。
- 同來源尚無文章。既有 `karpathy-agent-output-human-understanding` 提及中文借用受控語言，但主軸是人的理解驗收與解說媒介選擇。本篇讀者收穫是中文術語表、原句對照、條件／否定／範圍的改寫驗收。新增獨立文章並雙向連結；原篇保留 publishDate，補 updatedDate。
- 系列為「AI Agent 工程化與工作流實戰」，本篇 order 58，承接現有 1–57。

## 一手查核與引用邊界

- https://asd-ste100.org/about_STE.html ：受控自然語言，寫作規則與受限制詞彙；Issue 9（2025-01-15）。
- https://asd-ste100.org/STE_faq.html ：英文規則與詞彙、允許專案技術名詞／動詞、可借用一般原則到其他類型文件。
- https://asd-ste100.org/STE_downloads.html ：AI 看似符合、實際誤用規則或詞彙的風險，正式版本取得處。
- https://asd-ste100.org/STEsoftware.html ：ASD／STEMG 不背書或認證軟體／AI 工具。
- https://www.asd-ste100.org/links.html ：版權與商標歸屬。未取得完整 Issue 9 特別使用條款，不對允許翻譯／重刊範圍做概括法律結論。

本文不全文翻譯標準、不鏡像 PDF、不整段重刊來源提示。中文檢查方法與所有情境均為原創分析／虛構示例，未做模型效能比較；沒有聲稱實測、標準合規、官方中文版或 Karpathy 撰寫此中文提案。來源中的規則／詞數量與效果主張不作為已證實事實引用。

## 封面方向與驗收

- 鄰近 PStack：金屬印章、厚塗插畫、俯視工作檯、鈷藍與紅、硬側光。
- 鄰近主要助手：織機、寫實材質、景深斜視、深綠與棕、暖室內光。
- 鄰近 Karpathy：拆開球體、紙雕雕塑、正面立體、深藍與珊瑚、聚光。
- 本篇：校對紙帶／待確認夾、半透明剪紙拼貼、寬幅對角俯視、象牙白／琥珀／淡紫、明亮柔光。媒材、構圖與配色均與鄰篇有差異。
- Built-in image generation，原始 1672×940，轉 WebP；已檢視全圖與 320×180 卡片，無文字、logo 或浮水印，紙帶與紅夾在卡片尺度可辨識。
- coverAlt 描述實際畫面，不將裝飾圖當成流程證據。本文以結構化段落與短清單表達，無流程／架構圖、無 Mermaid、無表格。

## 驗證

發布檢查與環境限制由本次驗證紀錄追蹤，尚未通過的檢查不得聲稱完成。程式測試證明網站建構行為，不證明本文提示詞的模型效果。
