# Weight-Space Programming：權重修復與能力驗收

查核日期：2026-11-03（Asia/Taipei）。本紀錄只保存本篇來源與判讀，不代表推論實測已通過。

## 去重與範圍

- 新稿：`src/content/blog/weight-space-programming-evidence.md`。
- 最新 main 查核基底：`58cdcb3ec77ddc88e1593a8190775f1a57858ba6`。
- 在 blog、research、article-queue 查 `rikiyat`、`lm_understand`、`Weight.Space`、`權重編輯` 無既有命中，本文不重複模型新聞清單。
- 本篇聚焦權重編輯的驗收界線，不是 agent 狀態機或一般工作流教學，暫不加入既有系列。
- 父任務執行正式圖片、最後時間戳、格式/技術測試與上線驗證。草稿階段 `draft:true`，不得作為正式完成計數。

## 一手來源與段落對應

1. https://rikiyat.github.io/blog/weight-space-programming/
   - Rikiya Takehi、Jayden Teoh、Alex Zhang、Omar Khattab；頁面日期 November 2, 2026。
   - 讀取全文，正文主用 Experiment 8 與 Gemma 追加實驗。
   - 開頭/修復機制：Qwen3.5-0.8B，Astra作編輯者，Python工具和最多50次forward-pass預算，禁止gradient descent/training；MATH-500 7.9→48.1%，token-limit比例93.0→33.1%；觸及131,072weights，原文約0.016%。
   - Gemma比較：270M baseline6.8%，50passes7.0%，不得宣稱顯著能力提升或證明通用自我改進。
   - 原文也有其他小網路/Go實驗，本篇不擴寫其結果，避免混淆不同工具與預算。
2. https://github.com/RikiyaT/lm_understand-logs
   - 讀取README，核對公開紀錄結構、工具harness說明、未收錄資料與授權。Logs/data/networks CC BY4.0，作者scripts MIT，第三方資料保留各自license。
   - README說只有文章所報runs，早期prompt trial不收錄；不能稱所有探索嘗試完整公開。
3. https://github.com/RikiyaT/lm_understand-logs/blob/main/exp8_math/README.md
   - 以raw官方GitHub版本完整讀取；文章工具預算、成本、重建/缺項段。
   - 單次生成最多512題；teacher-forced最多1024texts。p50c 50passes、158turns、80Pythonruns、20.3hours，含turn154等待4.7h，不當推論延遲/可通用成本。
   - 目標thinking on；評測max32768new tokens，temperature0.6/top_p0.95/top_k20/presence_penalty1.5。
   - p50c觸及131072，bfloat16後130188實際不同。apply_edit.py指定base revision `2fc06364715b967f1860aea9cf38778875588b17`並驗hash。
   - 未收錄workfolders、部分generations、每sample長度、agent harness與部分grader依賴。文章不宣稱能一鍵完整重跑。
   - GPQA圖有中途149/198題的24.5與完成版22.7差異，本篇不引用該數字。

## 原創分析與限制

- 三項指標、逐題配對分類、四項凍結條件、訂單業務回歸、替代方案與停止規則均為CarlStack工程建議，並非作者已驗證結果。
- 未下載模型、執行權重修改、重跑benchmark，無親測/省成本聲稱。
- 未複製原文圖；由父任務生成原創封面。建議畫面：深藍權重點陣中一小段橘色loop局部修正，右側獨立評測刻度，不用研究圖表或Logo。圖片是概念插畫，不宣稱真實張量視覺化。
- 文章不需SVG，指標與流程以清楚段落/短清單表達。
- humanize checker已跑：改掉「優化」用語與不必要冒號；最後「逐題差異清單：哪些…」是真實清單引言，保留。

## 額外逐項核對

- 實際讀取 `exp8_math/eval/unedited/merged.json` 和 `eval/p50c/merged.json`：math500.acc為0.079與0.481，cut_share為0.93與0.3305，與文章百分比四捨五入一致。
- 完整讀取 https://github.com/RikiyaT/lm_understand-logs/blob/main/exp8_math/gemma_followup/README.md ：6.8/7.0對應acc_lenient而非嚴格boxed-only acc；正文已補擷取規則差異，避免跨模型橫比。

## 封面驗收

正式 image_gen 生成 exec-1377871e-8548-48a3-afd0-17139bf6cc01.png，轉1600×900 WebP quality86。畫面為深藍編織網格、橘線圈與鑷子，獨立玻璃稜鏡；宏觀攝影媒材、斜向近景、深藍/琥珀/銀、審慎研究情緒。與前一紅黑絲印閘門封面在媒材/構圖/配色皆不同；亦與相鄰書桌畫作及紙雕分區不同。已目視全尺寸與400×225卡片，線圈和玻璃物件清楚，無字與Logo。coverAlt已依實圖更正。沒有把隱喻當實驗裝置。
