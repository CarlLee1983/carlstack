---
title: "500 行 Harness 跑出 CIFAR-10 成績後，還需要一份可驗收的執行收據"
description: "從 NotesByLex 的 CIFAR-10 範例，核對測試資料接觸、checkpoint 交付、人工介入與未入帳費用。用一份執行收據，分開判定產物完成、需人工與成本未知。"
publishDate: 2026-10-12T10:16:35+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
series: AI Agent 工程化與工作流實戰
seriesOrder: 80
cover: ../../assets/covers/harness-execution-receipt-human-cost.webp
coverAlt: "水彩摺頁冊左側固定紫色礦石，中間並列兩塊拼貼供比對，右側多個空口袋只有一張卡，呈現產物、驗證與證據缺項。"
---

Lex Toumbourou 在 2026 年 10 月 11 日公開了[從零建立 Agent harness 的範例](https://notesbylex.com/building-an-agent-harness-from-scratch.html)。不到 500 行的單一 Agent 程式，完成了一次 CIFAR-10 分類任務；[公開結果](https://github.com/lextoumbourou/notes/blob/5139d7906894cbb9b0fd1df704ed1562d3e56071/code/agent-harness/cifar10-first-run/results.json)記錄 CPU 訓練 12 個 epoch，測試集答對 8,141／10,000 張，準確率 81.41%。

我會用這個案例回答一個交接問題：接手的人能否確認，收到的權重就是產生成績的那份、成功經過哪些人工介入，以及帳單算到了哪裡？本文提出的收據，將這些問題分欄保存；缺證據就留空，不從最後一句「完成了」補推答案。

查核截至 2026 年 10 月 12 日。本文讀取原文、公開程式與結果，沒有啟動 harness、呼叫付費模型或重跑訓練。下列驗收流程是本文的設計建議。

## 81.41% 有結果檔，還要確認它對應哪份權重

[訓練程式第 28–46 行](https://github.com/lextoumbourou/notes/blob/5139d7906894cbb9b0fd1df704ed1562d3e56071/code/agent-harness/cifar10-first-run/train.py#L28-L46)提供了比成績更有用的細節：每個 epoch 都計算並印出 test accuracy，同時覆寫同一個 checkpoint。程式跑完後留下最後一個 epoch 的權重，並非看到最高分才保存。`best_epoch_test_accuracy` 雖有記錄，這段程式沒有拿它決定是否儲存。

可見程式的梯度更新只使用 training loader；test loader 放在 `torch.no_grad()` 下評估。但測試分數在訓練過程中持續可見，因此這份程式本身無法證明，整個實驗從未依測試結果改過架構或重新嘗試。這也不構成作者曾這樣做的證據。

對下一次實驗，我會把資料接觸寫得更細：

- 訓練、調參與最後評估各使用哪個 split，資料版本與校驗值是什麼
- 預先決定要交付最後一輪，或以 validation 分數選 checkpoint
- 最後評估由哪個固定版本的程式執行，評估前是否已鎖定權重
- 哪些測試分數曾回到 Agent 或人工操作者手上

若目標只是確認 Agent 能下載資料、寫訓練程式並交出分類器，驗收可以依這個較窄的目標進行。若要宣稱盲測品質，就需要補上測試資料與決策過程的隔離證據。兩種任務的門檻應在開跑前定下來。

還有一個交付缺口：作者回報儲存了 `cifar10_model.pt`，但[此次公開產物目錄](https://github.com/lextoumbourou/notes/tree/5139d7906894cbb9b0fd1df704ed1562d3e56071/code/agent-harness/cifar10-first-run)只有 `train.py` 與 `results.json`。公開資料足以檢查程式與結果欄位，尚不足以讓讀者重載該次權重。重新訓練會產生另一次執行，不能補充成原 checkpoint 已通過驗證。

## 收據要綁住輸入、權重與評估，不能只列檔名

本站的 [Harness 七個控制面](/blog/harness-engineering-for-reliable-agents/)已介紹一般 change receipt。這裡把它收窄成訓練任務：同名檔案可能被下一次嘗試覆寫，所以交接應綁定內容雜湊、執行識別與評估版本。

下面是可另存為 `receipt.yaml` 的自訂模板，不是原專案現有格式。`null` 表示尚未蒐集證據；這份空白模板不能直接通過驗收。

```yaml
schema_version: 1
run_id: replace-with-unique-run-id
previous_attempt_ids: []
inputs:
  harness_commit: null
  task_sha256: null
  environment_manifest_sha256: null
  dataset_sha256: null
artifacts_sha256:
  train.py: null
  cifar10_model.pt: null
  results.json: null
evaluation:
  evaluator_commit: null
  checkpoint_sha256: null
  split: official_test
  expected_images: 10000
  observed_images: null
  correct: null
  checkpoint_reloaded: false
  test_feedback_used_for_selection: unknown
interventions:
  log_complete: false
  events: []
cost_usd:
  responses_tokens: null
  decision_calls: null
  web_search: null
  compute_and_tools: null
  previous_attempts: null
human_minutes: null
verdict:
  deliverable: unverified
  human: unknown
  cost: unknown
```

環境 manifest 至少保存套件版本、執行裝置與啟動參數；不要把憑證一起封裝。每次重試有新的 `run_id`，透過 `previous_attempt_ids` 連回先前嘗試，避免同一筆費用加總兩次。

收據中的 hash 也需要來源。產物寫入完成後，由執行器或驗收工作計算；若讓 Agent 自己填一串文字，再讓同一個 Agent 宣布相符，仍然只有自述。

## 重載已交付權重，才能測到交接是否成功

我會把驗收拆成一個離線工作：在隔離環境取得指定 hash 的 checkpoint，以固定 evaluator 重載，只做推論，不重新訓練，也不讓 Agent 在驗收期間改檔。

驗收器檢查影像數、正確數與結果檔是否一致，並確認類別順序和前處理相同。若執行環境差異可能造成數值變動，容許條件要預先寫入驗收規則；不能看到差異後才放寬。**找不到權重、hash 不符或重載失敗，都停在未驗證。**

這比檢查 `results.json` 能解析多做了一步，也比重跑整套訓練更貼近交接需求。接手者要使用的是已交付的模型；驗收先證明這份產物能工作，再另外決定是否投入完整重現實驗。

收據保存外部證據即可：評估命令、退出碼、產物 hash、結果摘要與原始紀錄位置。模型的私有推理過程不屬於這份契約。

## 人工放行與人工解題，要留下不同紀錄

[原文的執行說明](https://notesbylex.com/building-an-agent-harness-from-scratch.html#testing-it)記錄了兩種人工介入：放行資料集網域，以及提示 Agent 尋找更快的下載方式。前者改變可存取範圍，後者提供新的解題方向；若都縮成「人按過一次確認」，會失去比較自主程度所需的資訊。

我會讓 `events` 的每筆紀錄包含時間、種類、動作範圍、證據位置與是否仍在等待處理。種類至少能區分 `permission_grant`、`task_hint`、`manual_edit`；未量到的操作分鐘數保持未知。預先配置環境的時間則另列，讓不同實驗採用同一個起算點。

核准內容也要對得上實際工具動作。這延續 [Decisions API 的分類與授權邊界](/blog/decisions-api-routing-calibration-authorization/)：分類結果不能替代操作者已核准的範圍。收據記錄的是哪個動作因何被放行，以及後來是否真的執行。

原始 [ask_user 實作](https://github.com/lextoumbourou/notes/blob/4e43198d8f599dc45eb043b8dfe0c82ecfbbf60a/code/agent-harness/harness.py#L283-L291)在非互動終端回傳拒絕。若搬進 CI 後遇到同一條路徑，我會讓執行器留下待決事件和部分產物，交由既定核准流程處理。沒有核准者時，這次工作就不能以「模型已停止呼叫工具」視為完成。

## US$0.0085 的欄位名稱，應保留「最後一次」與「token」

作者將約 US$0.0085 限定為最後一次嘗試的模型 token 費用，原文也說明搜尋另計。這個數字可以保留，但不適合放進收據的 `total`。

程式還提供一個可查證的記帳邊界：[ResponsesModel](https://github.com/lextoumbourou/notes/blob/4e43198d8f599dc45eb043b8dfe0c82ecfbbf60a/code/agent-harness/harness.py#L334-L373)以 input／output token 和設定單價累加 `self.cost`；[Decisions 分類呼叫](https://github.com/lextoumbourou/notes/blob/4e43198d8f599dc45eb043b8dfe0c82ecfbbf60a/code/agent-harness/harness.py#L244-L283)走另一個方法，沒有加進這個計數器。從程式可知它未納入該計數器，實際費用仍需帳單對帳。

因此收據分開保存 Responses token、分類、搜尋、執行資源，以及先前嘗試的支出。`cost_usd` 前四欄只記本次執行，`previous_attempts` 依 ID 對帳彙總先前支出，避免重複列入。人工工時可先列分鐘，若要換算金額，另附團隊採用的費率。**任何必要項目尚未對帳，總成本就維持未知；缺值不得轉成零。**

已有的 [Grok Bot 成本護欄](/blog/grok-bot-budget-wake-delegation-guardrails/)處理派工前預算與多個額度池。這份收據處理結束後的歸因：同一個成功結果，究竟耗用了哪些請求、工具與人工處理。記帳範圍不同，就不能拿兩個畫面上的金額直接比較。

## 最後分開回答：完成了嗎、需人工嗎、成本知道了嗎

我不會把這三個問題壓成單一綠燈。收據的判定可以同時是「可驗證完成、曾需人工、成本未知」：

- `deliverable`：只有約定產物齊全、hash 對得上且獨立驗收通過，才是 `verified_complete`。只有作者回報或結果檔時，保留 `reported`；必要證據缺漏則維持 `unverified`
- `human`：紀錄完整且沒有介入才是 `none`；已有人工協助為 `assisted`；仍有未處理核准為 `waiting`。空事件清單但未確認紀錄完整，仍是 `unknown`
- `cost`：必要費用都已對帳才是 `reconciled`，否則為 `unknown`。產物通過不會自動改變這一欄

以這次公開資料，我能確認程式與結果的具體內容，並知道作者曾介入；由於未取得該次 checkpoint，也沒有完整帳單，我不會將它寫成已獨立驗證的全自動低成本 benchmark。

下一次跑 Agent 訓練任務時，可以先補一個小而明確的交付要求：將 checkpoint、results 與執行收據放進同一份版本化產物，讓另一個程序只憑這份交付重載評估。這一關通過後，再比較哪一版 harness 更省人工。
