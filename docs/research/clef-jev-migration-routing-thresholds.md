# Clef：介面相容與分流遷移查核

查核日期：2026-10-02（Asia/Taipei）。基準 main：7a26d102797b7ac607aaf5baa5f4cf11c2ffecc2。

## 去重與證據

- 已查 src/content/blog、docs/research、docs/article-queue.md 的來源 URL、Clef、clef-decision-models、Cloudflare/clef 與作者。今日已有 Pi Durable，未有 Clef；既有 Jev 與 Jeeves 分別談有限答案及自架尾端延遲，本篇聚焦替換模型的門檻、輸入一致性與人工容量，正文連回兩文。
- 主來源：https://blog.cloudflare.com/clef-decision-models/ 。穩定 ID clef-decision-models；2026-10-01；作者 Michelle Chen、Alex Reneau、Kevin Flansburg。核對發布、API 相容、Workers AI、FDE 協助與未來自助平台。
- API：https://developers.cloudflare.com/workers-ai/models/clef/ 。穩定 ID @cf/cloudflare/clef；核對 state/questions、65536 context、截斷與圖片限制、遠端 URL 不支援。
- 模型卡：https://huggingface.co/Cloudflare/clef 。穩定 ID Cloudflare/clef；Apache-2.0、SystemOne 契約與內部 Decision Index 0.2.1 結果。BANKING77 94.2/90.9 與 CLINC150+OOS 97.4/66.8 為廠商結果，未獨立重跑。
- 未呼叫推論、未下載 GPU 模型、未上傳工單；JSON 明確為未執行請求。影子比較、保留集、門檻與停止規則均為作者工程建議。
- AI Agent 工程化與工作流實戰接續 order 53；只提交本篇相關檔案。

## 封面矩陣

- Pi Durable：檢查點閘門／黏土／斜俯視／陶土與鼠尾草／陰天漫射。
- 本篇：可替換鏡片與校準布／刺繡織物／正面分層／紫與青及亞麻／明亮均勻棚光。
- 以原創 imagegen 生成 16:9、無文字與商標。兩片鏡片共享框架，布樣呈不同色帶；媒材、構圖、色盤、光線與近鄰不同。完整封面、文章桌面與 320px 深淺色、索引卡片均以隔離 Chrome 視覺驗收；截圖留任務 workspace。
