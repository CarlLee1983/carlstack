---
title: "評估器說 PASS，還不足以讓 Agent 過關"
description: "把 evaluator 的分數、判決門檻與機率校準拆開。從錯放與誤擋的示意案例，建立不放寬底線、不洩漏驗證資料的 Agent 驗收流程。"
publishDate: 2026-10-21T08:46:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
series: AI Agent 工程化與工作流實戰
seriesOrder: 94
cover: ../../assets/covers/evaluator-pass-threshold-calibration.webp
coverAlt: "俯視透明分類盤，紫色與橘色圓片分布在黃銅隔板兩側，一隻手正在移動隔板，象徵調整判決門檻會改變錯放與誤擋。"
---

Agent 回報任務完成，另一個模型讀完執行紀錄，給出 PASS。工作流接著把任務關閉。

這個安排比讓 Agent 自己宣布成功多了一道檢查，但還缺一個數字：已知有問題的執行，有多少也拿到了 PASS？如果評估器放過了這些案例，再換更大的實作模型、加更多 skill，最後的驗收仍可能看不出差異。

Hamel Husain 與 Antaripa Saha 在 2026 年 10 月 20 日發布的〈[How To Use Decision Models for Evals](https://hamel.dev/blog/posts/decision-model-evals/)〉，討論如何選擇 decision model 的判決門檻，以及分數能不能當成機率。本文沿著這個問題，設計一個更窄的工程流程：讓評估器接管 PASS／FAIL 前，先知道它會放過什麼、誤擋什麼。

以下數字案例與驗收流程是本文的示意設計，沒有執行模型實驗。原文的租屋客服結果，也不能直接套用到程式修復或 Story 驗收。

## 先把分數對準一種失敗

假設我們要檢查客服 Agent 是否「宣稱預約成功，卻沒有成功的預約工具結果」。評估器讀取對話、工具呼叫與回傳，給出一個 0 到 1 的分數。

這裡先固定定義：**正類是「存在這種失敗」，分數越高，越應被標記為 FAIL。** 分數達到門檻就標記，低於門檻則不標記。

如果沒有把這句話寫清楚，後面的 precision、recall 很容易算對卻解釋反了。對這個正類而言：

- Precision：被標記為失敗的執行中，有多少確實失敗。太低會讓人忙著處理誤報。
- Recall：已知失敗中，有多少被抓到。太低會讓有問題的執行拿到 PASS。

分數 0.8 的目標，是這筆執行存在指定失敗的可能性；它沒有直接回答「評估器有八成機率判對」。而且在校準前，0.8 是否具有可用的機率意義，仍待檢驗。

對完整任務而言，這個 evaluator 的 PASS 也只表示它沒有標記這種失敗。預約時間有沒有理解錯、是否洩露個資，是其他檢查範圍。把一個窄判決改名成「整體品質通過」，會在接線時擴大它原本沒有驗證的責任。

## 門檻降低，少放過的錯誤會換成更多人工工作

用一組純示意的 100 筆執行來算：人工參考標籤中，20 筆失敗、80 筆通過。以下兩個門檻使用同一批分數，不代表 Hamel 的實驗結果。

### 門檻 0.50：少打擾人，但放過 8 筆失敗

評估器抓到 12 筆失敗，漏掉 8 筆；同時誤擋 4 筆正常執行，正確放行 76 筆。

這時 precision 是 `12 / (12 + 4) = 75%`，recall 是 `12 / 20 = 60%`。一共 84 筆拿到 PASS，其中 8 筆其實有問題。若只看總正確率，`(12 + 76) / 100 = 88%` 看起來不差，卻掩蓋了四成失敗沒有被抓到。

### 門檻 0.30：只漏掉 2 筆，但誤擋增加到 12 筆

降低門檻後，抓到 18 筆失敗，漏掉 2 筆；誤擋 12 筆正常執行，正確放行 68 筆。

Recall 上升到 `18 / 20 = 90%`，precision 則降到 `18 / (18 + 12) = 60%`。若所有被標記的執行都交給人處理，待看清單從 16 筆增加到 30 筆。新增的 14 筆裡，6 筆是多抓到的失敗，8 筆是多出來的誤報。

團隊要決定的是，少漏掉這 6 筆失敗，值不值得多處理 8 筆正常執行。若它只是每日抽查清單，可能可以接受；若每個誤報都會中斷客服流程，成本就不同。門檻應跟著使用位置設定，不能只因為 API 預設 0.50 就沿用。

若決策模型用於客服分流，門檻會直接改變人工佇列；[Clef 遷移驗收](/blog/clef-jev-migration-routing-thresholds/)談的是這種服務替換。本篇則用相同方法檢查 evaluator 能否替其他 Agent 的執行把關。

F1 可以把 precision 與 recall 摺成一個數字，但不會替團隊算出錯誤預約、人工覆核與延遲交付各值多少錢。只要求「找最高 F1」，也沒有表達哪一種錯誤不能接受。

## 找不到符合底線的門檻，就留下「找不到」

Hamel 與 Saha 的資料來自租屋客服：原始 100 筆 trace 排除 2 筆內部 QA，實際評分為 98 筆，參考標籤包含 61 筆已知失敗與 37 筆未標記失敗。這是特定任務的小樣本比較，不是所有 Agent 的模型排行榜。[原文註 3](https://hamel.dev/blog/posts/decision-model-evals/index.html#fn3)

原文還有一個會影響採用判斷的細節。它對候選模型設定 precision、recall 都至少 80% 的訓練門檻；找不到符合條件的選點時，圖表實驗退回無限制的最佳 F1，並保留這些切分的驗證結果。100 次訓練切分中，Perplexity 有 36 次、Liquid d1-ultra 有 29 次遇到這個情況。[原文註 9](https://hamel.dev/blog/posts/decision-model-evals/index.html#fn9)

因此，圖表中的平均成績不能讀成「這兩個候選已保證 precision 與 recall 都達 80%」。原文提供給讀者的操作 prompt，反而要求找不到門檻時直接回報，不放寬要求。實驗展示與正式採用條件，要分開讀。

若我要把 evaluator 接成阻擋條件，會採用後者。報告可以保留最佳可達結果供診斷，但選型結論仍是未達標；接下來縮小失敗定義、補標籤、改 prompt，或保留人工覆核。不能把 fallback 的分數填進同一欄，讓流程誤以為底線已經滿足。

**停止規則：找不到符合預設限制的門檻，或獨立驗證未達限制，就不升為自動放行依據。** 訓練資料上找得到，也只是候選設定，尚未證明新執行能維持相同表現。

## 調門檻決定怎麼做，校準檢查數字怎麼讀

門檻調整與機率校準解決不同問題。

調門檻時，原始分數可以完全不變。我們改的是從哪個分數開始標記 FAIL，因而改變錯放與誤擋的組合。[scikit-learn 的門檻文件](https://scikit-learn.org/stable/modules/classification_threshold.html)把預測分數與採取行動分成兩個層次，也提醒要明確指定計分的正類。

校準則問：假設一批執行的失敗預測都接近 0.8，其中是否約八成確實失敗？這要用同一種目標與適用資料分布，對照實際標籤。不能拿「所有判決有八成正確」代替。[scikit-learn 的校準文件](https://scikit-learn.org/stable/modules/calibration.html)

如果工作流只需要挑一個標記門檻，可以先檢查分數能否提供有用的取捨；若要把分數用於預期損失、覆核優先順序或對外顯示風險，就更需要驗證機率意義。校準映射也要在未參與擬合的資料上比較，不能因為套了 Platt scaling 就宣稱改善。

我會同時保存校準前後的可靠度圖、每組樣本數及 Brier score。Brier score 還受到辨識能力等因素影響，單獨變低不能證明所有改善都來自校準。樣本少的分組也不適合把比例解讀得很精細。[scikit-learn：校準評估的限制](https://scikit-learn.org/stable/modules/calibration.html#calibration-curves)

兩種調整都救不了缺失的證據。若紀錄裡根本沒有預約工具結果，再精細的小數點也無法補出那次操作是否成功。

## 把評估器接進工作流，我會按這個順序做

先前[讓 Claude 自動調 prompt 前，先證明評分器值得相信](/blog/claude-eval-hillclimb-validation-boundaries/)處理的是調整應用時，評分器與資料如何隔離。這裡再往下拆一層：固定一個 evaluator 後，怎麼把它的分數接成決策。

### 1. 留下能被覆核的案例與標籤

對「沒有成功結果卻宣稱預約成功」，標註者要看見使用者要求、適用規則、工具結果與最後回覆。爭議案例先釐清標準，不能用模型分數反過來決定人工答案。

完整紀錄顯示工具失敗、Agent 卻說成功，是可判定的失敗。若收集系統遺失了工具結果，就另外記錄證據缺漏；對要求確認操作成功的驗收，不把它默認成 PASS。這是本文建議的工作流狀態，與模型要判斷的二元失敗標籤分開管理。

程式能直接檢查的欄位與狀態，先由程式檢查。模型負責仍需要讀取語意的部分，例如最後一句話是否構成成功承諾。這樣較容易定位究竟是哪一層出錯。

### 2. 先隔離資料，再改 prompt 與選門檻

開發資料用來定義 rubric、改善 prompt；調整資料用來選門檻與擬合校準映射；最後的保留資料用來評估已凍結的整套方案。資料有限時可使用適合的交叉驗證，但每個被評估的樣本，仍必須在對應輪次的調整之外。

若同時比較多個模型，固定切分，才不會把容易樣本分到某個候選。相同客戶對話的片段、同一個 bug 的改寫版本也應成組切分，避免答案跨組洩漏。這是對工程資料的切分建議；分層抽樣只平衡標籤比例，不能自動消除這種相似性。

每次看完保留集結果再改 prompt，那份資料就參與了開發。不能一直使用它，最後仍把分數稱為未見資料的證明。[scikit-learn 的門檻調整注意事項](https://scikit-learn.org/stable/modules/classification_threshold.html#important-notes-regarding-the-internal-cross-validation)也明確警告，不應用同一批資料訓練分類器又調門檻。

### 3. 保存分數，讓選門檻可以便宜地重算

對固定模型、prompt 與輸入，保留原始分數、人工標籤、案例 ID 和切分 ID。比較不同門檻時直接重算判決與混淆矩陣，不必每次重新呼叫模型。

報告除了平均 precision、recall，還要留下錯放、誤擋的逐案清單、各切分是否達標，以及估計的不確定性。低成本模型若需要大量人工處理誤報，API 帳單便宜未必代表整個流程便宜。

下面是本文自訂的驗收契約示意，不是任何產品可直接匯入的設定：

```yaml
positive_label: has_booking_success_claim_without_successful_tool_result
score_direction: higher_means_more_likely_failure
threshold: null # 完成調整與獨立驗證後才填入
requirements:
  precision_floor: null # 由可接受的誤報成本決定
  recall_floor: null # 由可接受的漏報風險決定
no_feasible_threshold: keep_human_review
missing_required_evidence: needs_review
record:
  - evaluator_model_and_prompt_version
  - rubric_version
  - trace_id_and_evidence_hash
  - reference_label_and_split_id
  - raw_score_and_calibration_version
  - threshold_and_final_decision
```

`null` 表示尚未決定，不能被 runner 當作零或預設值繼續執行。需求、門檻或版本未完整時，這份契約還不能用來自動放行。

### 4. 先觀察錯放，再決定交出多少權限

我的導入建議是先用觀察模式：讓 evaluator 給判決，但既有人工驗收照常進行。除了覆核它標出的問題，也抽查 PASS；只看 FAIL 清單，會永遠看不到被漏掉的失敗。

累積證據後，再決定它適合排序、提醒，還是阻擋。對不確定或缺證據的執行保留人工路徑，並記錄這會增加多少等待。換模型、prompt、rubric、工具格式或任務分布後，重跑相關驗證；不能把舊版本的門檻視為永久有效。

下一次替 Agent 加上 evaluator，我會先選一種最近確實發生過的失敗，拿人工確認過的案例對照它的 PASS 清單。先找出它漏了誰，再談把哪一道人工檢查交出去。

## 來源與查核範圍

- Hamel Husain、Antaripa Saha：[How To Use Decision Models for Evals](https://hamel.dev/blog/posts/decision-model-evals/)，2026-10-20。使用者提供的入口為 [Hamel 的 X 貼文](https://x.com/hamelhusain/status/2112588257104216294)。本文引用其資料範圍、門檻實驗與不可行切分，不重製模型排名。
- scikit-learn：[Tuning the decision threshold for class prediction](https://scikit-learn.org/stable/modules/classification_threshold.html)，用於分數、行動門檻、正類定義與資料隔離。
- scikit-learn：[Probability calibration](https://scikit-learn.org/stable/modules/calibration.html)，用於機率意義、校準映射與評估限制。

來源於 2026-10-21 查核。100 筆案例的混淆矩陣、預約失敗定義、YAML 與導入順序均為本文示意；未重現原文實驗，也未驗證任何模型在程式修復或 Story 任務上的效果。
