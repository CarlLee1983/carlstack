---
title: "讓 Claude 自動調 prompt 前，先證明評分器值得相信"
description: "從 Claude 的 build-eval 與 hillclimb 工作流出發，建立評分器校準、資料隔離與停止規則，避免把測試集分數上升誤認為正式環境品質改善。"
publishDate: 2026-10-01T14:52:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
series: AI Agent 工程化與工作流實戰
seriesOrder: 50
cover: ../../assets/covers/claude-eval-hillclimb-validation-boundaries.png
coverAlt: "靛藍色等高線山形中，一條銅色路徑逐步上升，另一座山隔著半透明屏障，表達調整資料與未開封驗證資料的界線。"
---

假設客服分類 Agent 把退款案件送錯佇列。團隊請 Claude 改 prompt，跑一次測試，正確率上升，於是準備採用。這時最需要追問的是：同一份回答重評會不會換分數？新 prompt 是否只記住那幾封信？改善幅度是否大到足以改變決策？

Lance Martin 在 2026 年 9 月 28 日的〈[Automating eval design and hillclimbing with Claude](https://claude.dev/blog/automating-eval-design-and-hillclimbing/)〉介紹 `/claude-api build-eval` 與 `/claude-api hillclimb`：前者建立評估，後者逐輪調整應用並用保留樣本檢查改善。本文沒有執行這兩個命令，也沒有重現文中的實驗。

我的工程判斷是：自動化最先應減少的是比較與紀錄的成本。是否值得保留一個修改，仍需要可靠的評分器、隔離的資料與事先寫好的採用條件。

## 評分器先通過校準，prompt 才有調整方向

Anthropic 的〈[Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)〉區分程式、模型與人工評分，並要求模型評分與人類判斷校準。可機械驗證的輸出適合程式檢查；開放答案則需要明確 rubric。這會改變實作順序：先取得可信的錯誤訊號，再請 Agent 找原因。

以客服分類為例，以下是本文設計的驗收方式：

- 分類標籤是否在允許集合內，由程式檢查。
- 該案件應送哪個佇列，由產品負責人先標註；有爭議的案件補上決策規則。
- 回覆是否承諾了政策未允許的退款，用具體條件判斷，再抽樣與人工對照。

「語氣很好」無法說明失敗落在哪裡；「回覆不得承諾尚未核准的退款」才有可檢查的行為。若人工也無法一致判斷，就先改任務規格。

再把同一份輸出交給評分器重評。若結果改變，先記錄差異並校準；不要讓 prompt 同時追逐不穩定的判決。這裡也要把 API timeout、截斷與執行環境錯誤另列，否則基礎設施故障會被誤診成模型不會分類。

## 資料切分必須連到讀取權限

原文提醒，保留樣本與答案隔離能降低過擬合風險。官方 [hillclimb 指南](https://github.com/anthropics/skills/blob/main/skills/claude-api/shared/evals/eval-hillclimb.md)更列出可選的三份切分：用 train 分析、用 validation 選版本，最後以未參與迭代的 test 比較基線與勝出版本。

官方指南把三份切分列為大型資料集（約 150 筆以上）的選項；小資料集拆得太細，可能只剩不穩定的分數。本文建議，當結果會影響正式採用且樣本足夠時，使用這種三份切分；樣本不足則先把結果標成探索訊號，補資料後再做獨立驗證。原因是：即使 Agent 沒有讀到逐筆內容，團隊反覆根據同一份分數選版本，也已讓那份資料參與選擇。把它稱為 validation，能讓報告更誠實；最後再開封 test，才多一層獨立檢查。

資料隔離需要實際安排。調整 Agent 的工作目錄只放 train 輸入與執行紀錄；評分 runner 從另一個權限範圍讀取答案。validation 的逐筆輸入與失敗紀錄不交給調整 Agent，test 則連每輪分數都不提供。若答案仍在可搜尋的 repository、掛載目錄或網路鏡像中，單靠「不要讀答案」的文字規則不足以建立界線。

切分還要避免近似案件跨組。例如同一封信的改寫版，或同一對話的多個片段，應以群組一起分配。這是本文對客服情境的補充建議：形式上的不同 case ID，未必代表獨立樣本。

## 每輪只改一個可歸因的地方

官方 [hillclimb 指南](https://github.com/anthropics/skills/blob/main/skills/claude-api/shared/evals/eval-hillclimb.md)要求先定修改範圍、目標與停止條件，並留下逐輪紀錄。這讓「請幫我提升品質」變成能回復的實驗。

以下 YAML 是本文自訂的實驗契約示意，並非 Claude skill 可直接匯入的設定：

```yaml
objective: 降低客服分類成本，維持品質
editable_surface: prompts/support-routing.md
fixed: [model_version, grader_version, tool_schema, case_split]
analysis_access: train_only
selection_metric: validation_cost_per_case
selection_rule: 在事先訂定的品質底線內，選平均成本最低版本
final_comparison: baseline_vs_winner_on_unopened_test
guardrails:
  - 不增加錯誤退款承諾
  - 不降低既有關鍵案件的分類成功率
record: [diff, scores, latency, billed_usage, errors]
stop:
  - 連續三輪無可辨識改善，先分類失敗原因
  - 到達預先同意的費用或輪數上限
```

例如第一輪只補「退款與取消同時出現時的優先規則」。若同時換模型、改工具描述、放寬 grader，就很難說明改善來自哪裡。要測模型或 effort，可以另開一輪，重新列出固定變因。

這個契約也應補上團隊願意採用的最小改善幅度，以及品質可接受的退步界線。數值由產品要求決定。樣本太少時，多跑相同案件能觀察執行變異，卻不能補上缺少的任務種類；新增案件與增加 repeats 解決的是不同問題。

## 卡住時，先確認失敗是否屬於可修改範圍

官方指南把停滯後的失敗拆成內容、grader、harness 與結構等原因。對工程團隊而言，這代表下一輪不一定該繼續加 prompt。

本文用客服案例示範如何分流：

- 規則確實缺少：補上可泛化的分類條件，再跑比較。
- 政策工具回傳舊版本：修正工具資料；這是另一個變更範圍。
- grader 錯把合法標籤判失敗：校正 grader，並用新版本重跑基線與候選版本。
- 規則已存在但未被載入：檢查 skill 發現與載入路徑，別再複製一段相同文字。

**停止規則：若改善仍落在測量雜訊內，不宣告勝出。** 報告應保留基線與候選的差異、估計不確定性和逐案證據；只貼一個較高的百分比，無法讓 reviewer 判斷收益是否可靠。

評分器修正尤其需要重新建立比較基準。不能拿舊 grader 的基線分數，和新 grader 的候選分數直接比較，然後宣稱 prompt 改善了品質。

## 能力評估與回歸測試，承擔不同責任

Anthropic 的[評估指南](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)區分用來探索能力的 eval 與用來保護既有行為的 regression eval。前者需要改善空間，後者期待既有任務持續通過。這提醒我們：困難樣本的平均分數上升，仍可能掩蓋常見案件退步。

因此，調整客服路由時，除了候選版本的 validation 分數，也保留常見退款、取消、帳務與非客服信件的回歸檢查。若目標是降成本，報告還應包含失敗重試與評分費用；單看成功請求的 token 成本，容易低估實際支出。

下一步可以從一條最近出錯的分類路徑開始：整理少量有明確判決的案件，先讓程式 grader 與人工對齊，再限定只改一個 prompt 檔案。需要調整 effort 時，接著讀[Claude 成本控制與驗證](/blog/claude-token-cost-controls/)；要判斷結果能否外推到正式環境，參考[Benchmark 結果的成立條件](/blog/cartwright-benchmark-validity/)。先把採用證據寫清楚，才讓自動迴圈開始搜尋。

## 來源與查核範圍

- Lance Martin，2026-09-28：[Automating eval design and hillclimbing with Claude](https://claude.dev/blog/automating-eval-design-and-hillclimbing/)。本文保留命令與方法脈絡，未重現其 benchmark，也未引用案例數字作為收益承諾。
- Anthropic：[claude-api skill](https://github.com/anthropics/skills/tree/main/skills/claude-api) 與 [hillclimb 工作流](https://github.com/anthropics/skills/blob/main/skills/claude-api/shared/evals/eval-hillclimb.md)，2026-10-01 查閱。指南會更新；執行前應核對安裝版本。
- Anthropic：[Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)。用於評分器校準與能力／回歸評估的區分。
