# LFM3 本地任務邊界來源紀錄

## 選題與去重

2026-10-28 Asia/Taipei 每日科技快報。main16585957ae9216fe2c53cfc150059d1b1991357f，open PR空。以LFM3、LiquidAI、官方原始／正規化URL搜尋blog/research/queue無同題。既有Terra文討論路由後接受成本，本篇讀者收穫是路由前可接受任務與資料範圍；加內鏈不重寫。全量YAML含draft，AI Agent最高102；103分配Ghostty，本篇104。Octopus另用網路系列22。Trail工具/cache不存在，直接讀規格與全量檔案。此題10/27新發布，非舊模型換日期。

## 原始來源與對應

- https://huggingface.co/blog/LiquidAI/lfm3 ：2026-10-27 LiquidAI Team Article，Build specialized multimodal models with LFM3。已讀全文相關章節，六款2B級／文字約1GB4bit／單GPU專門化為廠商自述。文章只摘要少數定位事實，主要為原創工程採用建議，不複製程式或benchmark表。
- https://huggingface.co/LiquidAI/LFM3-1.7B ：模型卡完整可讀。1.73B、256K輸入加輸出、agentic coding及複雜多步推理限制、32K batch1輸出100的裝置測試條件。License標LFM Open License v1.0，其連結由研究員首讀回401已停止，本工作不再嘗試或推定條款。
- 原產品站 https://www.liquid.ai/blog/lfm3 研究員遭contentlength過大400，使用作者在HF獨立正式出版全文，不是摘要冒充全文或規避拒絕。未下載模型或執行remote code。

## 原創分析與未測範圍

虛構退款訊息分類、無副作用候選、三分類、2000/80token、單槽、100例20歧義、1000訊息20%=200及60%分流皆教學假設。無模型效能或正確率實測；不宣稱單GPU微調或任意裝置RAM可達成。授權條款未讀不建議商用結論。remote fallback資料外送須另授權。分類與業務批准分開是工程建議。

## 美術與驗收

鄰近ub-mode桃綠紙雕框、pending-age藍黃托盤紙雕已目視。此次三封面矩陣：Ghostty深灰青紅玻璃／正面隔板；Octopus象牙紫金平面版畫／對稱雙路；LFM3淺藍白珊瑚陶瓷攝影／低斜視小分類器。至少媒材、配色與構圖三項差異。皆正式imagegen原創、本地WebP，實際尺寸/卡片與全圖檢視待生成後補。

最後技術驗收及精確部署結果另記發布收據。已知先前正式索引/封面HTTP403，禁止以換route/tool重試同資源，不冒稱正式全驗。無程式或站台設定變更。

## 整合美術驗收

正式imagegen原創封面1672×941，轉WebP；三張全尺寸與768×432卡片裁切已目視，無文字商標，圖說依實圖修正。Ghostty玻璃青紅深底，Octopus平面紫金雙路，LFM3淺藍白色陶瓷攝影，媒材/構圖/主色不同。文章沒有流程圖或架構圖，不使用Mermaid，也無需新增SVG元件。

雲端本機預覽於2026-10-28嘗試，Astro回Dev server process exited before becoming ready，browser連線拒絕；未改安全設定或繞限制。全尺寸與卡片封面目視完成，但320px／深淺色實頁目視未完成。三文章無可執行樣本或新增SVG。最後檔案frozen install使用Node24.22.1/pnpm12.1.0；預設pnpm11引擎拒絕後改官方corepack下載指定12.1.0，未更改lockfile。
