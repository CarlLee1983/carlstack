# QA-bench：評分分母與執行隔離查核

- 查核時間：2026-11-03T10:09:39+08:00。
- 目標文章：`src/content/blog/qa-bench-evaluation-boundaries.md`。
- 主題：2026-11-02 結果版本的 QA-bench，評測分母、未判定回報和答案隔離如何影響工程試用。
- 狀態：文稿與來源查核完成，封面、最後發布日期、技術 gates、部署與正式頁驗證由發布流程接續，尚未宣稱上線。

## 去重與系列

於最新 main `58cdcb3ec77ddc88e1593a8190775f1a57858ba6` 對 blog、research、queue 搜尋 qa-bench、Momentic 及主來源 URL，未見同核心內容。既有 `sandbox-authority-boundary-acceptance` 是沙箱產品和檔案 API 的權限邊界，這篇聚焦 QA benchmark 的計分分母與答案隔離，讀者決策不同。

使用「AI Agent 工程化與工作流實戰」第 109 篇；前一篇為第 108 篇 `prospero-process-lifecycle-acceptance`。已與同批發布者協調序號。

## 一手來源

1. 專案：https://github.com/momentic-ai/qa-bench
2. 固定 README：https://github.com/momentic-ai/qa-bench/blob/a4dc8987edab813482e5f849c9a85eb7780f6979/README.md
3. 結果 CSV：https://github.com/momentic-ai/qa-bench/blob/a4dc8987edab813482e5f849c9a85eb7780f6979/results/2026-11-02.csv
4. 授權：https://github.com/momentic-ai/qa-bench/blob/a4dc8987edab813482e5f849c9a85eb7780f6979/LICENSE

GitHub API 取得 main commit `a4dc8987edab813482e5f849c9a85eb7780f6979`，committer 日期 `2026-11-02T16:29:43Z`。全文 README、CSV 與 MIT 授權已讀。廠商 blog web 工具未能取得原文，因此成稿沒有引用該文章或轉述其額外主張。不能把 commit 時間當作首發時刻，內文僅定位 11 月 2 日的結果檔。

## 段落與證據對應

- 導言、數字：README Results，四個應用、20 areas、1,396 labels，Mo 60-minute Correct269.3、recall19.3%、precision84.2%。Momentic 同時維護 benchmark 與開發 Mo，成稿明標廠商結果。
- 計分：README Scoring。Correct/Incorrect 對應 confirmed/rejected labels，Unmatched 兩者不符且未定對錯。Precision 為 C/(C+I)，不含 Unmatched 或 duplicates。Recall 為 C/labels。跨區域命中另計、不進該套指標；成稿未擴大為任意所有回報率。
- CSV 重算：實際以 Python csv.DictReader 篩選 Effort=`60 min`、Agent=`Mo`，累加各列 Correct、Incorrect、Unmatched。分別為269.32、50.67、0.0。269.32/(269.32+50.67)=0.8416513，269.32/1396=0.1929226，與 README 四捨五入相符。CSV 已對各列均值四捨五入，成稿不將加總269.32當更精確原始測量。
- 比較條件：README Results / Browsers and subagents。Devin 每區每預算1次，其餘3次。模型+工具組合各列不同。對微小差異穩定性的保留是工程判斷，不捏造信賴區間。
- 時間費用：README Time / Scoring Costs。不含 fixture setup、grading 時間。費用不含 E2B、grading。人工重現成本屬自有採用評估建議。
- 隔離：README Web access / Browsers and subagents。prevent-cheating 預設 off；旗標限制的範圍依工具而異。codex-agent-browser 不用 Codex sandbox，旗標不提供網路防火牆；本機 browser 無同等導覽限制；fixture server-side fetch 亦未被該旗標阻擋。
- 最小方案與替代方案：自行提出的虛構訂單後台案例，使用可拋棄環境、獨立答案、出口驗證、原始報告和版本化標註，均明標工程建議未實測。無可執行範例，未聲稱跑過 QA-bench。

## 寫作與剩餘驗收

已讀 AGENTS、content-guide、schema、copywriting、humanize-writing 及 zh-tw 完整參考。Trail CLI與索引不可用，依檔案直接查核。無表格、無新增圖解元件、無直接長段引文。humanize checker 原有一個提示性冒號命中已修正。

封面預定 `src/assets/covers/qa-bench-evaluation-boundaries.webp`，概念為分類樣本盤與透明隔板，alt 暫描述該概念，發布者生成後需依實際畫面調整。未生圖、不提交、不推送，未跑全 repo format，避免干擾同批其他作者。

## 封面驗收

正式 image_gen 生成PNG，轉1600×900 WebP quality86。畫面為三色樣本盤、檢視鏡與隔板後信封；黏土靜物媒材、俯視橫排構圖、粉紫/薄荷/珊瑚、冷靜分類情緒。與本批紅黑絲印閘門和深藍攝影線圈在媒材/構圖/配色皆不同。已目視全尺寸與400×225卡片，三盤與隔板可辨，無字與Logo；不是精確數量圖表。coverAlt已依實圖更正。
