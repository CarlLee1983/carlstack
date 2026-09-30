---
title: "Jeeves 能自架判斷服務，但 17 秒尾端延遲必須先過驗收"
description: "PostHog 的 9B 開源決策模型支援 Noul、多選與評分。拆解推理模式、公開基準的比較限制，以及如何用 Story 缺漏資料驗收漏判、校準與端到端延遲。"
publishDate: 2026-09-30T12:15:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 技術選型
  - 開源專案
series: AI Agent 工程化與工作流實戰
seriesOrder: 40
cover: ../../assets/covers/jeeves-self-hosted-decision-service.png
coverAlt: "橘紅色紙雕判斷站將需求卡片分往三條路徑，其中一條累積等待佇列，旁邊的沙漏表達推理時間與處理速度的取捨。"
repositoryUrl: https://github.com/PostHog/jeeves
---

如果要檢查一則 Story 是否少了驗收條件，我們真正需要的可能只是「完整、缺漏、資訊不足」三種結果，而不是一段語氣流暢的評論。把這項工作拆成獨立判斷服務，可以固定答案格式、替換模型，並單獨量測錯誤與延遲。

[PostHog 的 Jeeves](https://github.com/PostHog/jeeves)讓這條路多了一個可自架的選項。它以 Qwen3.5-9B 為底，加入 LoRA 與 pointer head，支援 yes/no 機率、多選與評分，還能在決定前先推理。但這也是採用前最需要釐清的地方：有限型別的輸出，並不代表有限的等待時間。

本文依 2026-09-30 查閱的一手 README 與程式碼整理，固定參考版本為 [`f04ec556`](https://github.com/PostHog/jeeves/tree/f04ec5567301450dcaae0210dd54deeb4f647f87)。沒有在本站環境執行 GPU 推論，也沒有取得或測試實際團隊的 Story 資料；下文的驗收方案是可落地的實驗設計，不是已完成的效能報告。

## 熱門討論證明有人關注，還不能證明適合你的工作流

[HN 分享](https://news.ycombinator.com/item?id=49891290)的提交時間是 2026-09-29 11:13:54 UTC，也就是台北 19:13:54。2026-09-30 台北約 12:10 查詢 HN Algolia 時，該討論已有 232 分、89 則留言；本文選題時記錄的 225 分、85 則留言是較早快照。這能支持「近 24 小時受到關注」，不能單憑提交時間認定那天是模型首發日。

留言的爭論很貼近工程問題。[hjun1052](https://news.ycombinator.com/item?id=49891626)問，先做自迴歸推理，是否犧牲了 Jev 類模型原本單次前向傳遞與低成本的優勢？[sharih](https://news.ycombinator.com/item?id=49892563)則直接問：「What is the point of this, if it is p90 17 seconds?」

另一位使用者 [TN1ck](https://news.ycombinator.com/item?id=49893066)報告，自己用 M5 Pro 48GB 跑 100 則德文足球推文的反諷判斷，花了超過 30 分鐘，Jeeves 答對 68 題，Jev 答對 79 題。這是留言中的個人實驗，設定與官方 CUDA 路徑不同，不能拿來估算 H100 容量；它提醒我們，語言、任務與執行環境都會改變結果。

我的判斷是：Jeeves 值得放進離線評測候選，但是否進入同步工作流，必須由自己的漏判成本與等待預算決定。

## Jeeves 保留決策介面，卻把推理時間帶回來

在既有的 [Jev 文章](/blog/jev-system-one-decision-model/)裡，我們討論的是把生成與決策分開：模型選路，程式決定如何執行。Jeeves 延續有限答案的介面，但開啟 thinking 時，每個問題會先生成推理鏈，再由 pointer head 對選項評分，經溫度縮放後得到機率。這不是完全不生成文字的同一條推論路徑。[實作說明](https://github.com/PostHog/jeeves/blob/f04ec5567301450dcaae0210dd54deeb4f647f87/README.md#how-it-works)

三種答案也不該混為一談：

- `noul` 回傳敘述為真的機率，介於 0 與 1，不是已套用門檻的布林值。
- `choice` 回傳一個選項、各選項機率與 `confidence`。
- `score` 回傳評分級距索引的期望值，因此可能是 1.5，並附上級距與機率分布。

尤其要留意 `choice.confidence`。[API 程式碼](https://github.com/PostHog/jeeves/blob/f04ec5567301450dcaae0210dd54deeb4f647f87/inference/api.py)把最高選項機率相對於均勻分布基準正規化：`(max(p) - 1/k) / (1 - 1/k)`。它不是「答案正確的機率」。三選一最高機率若為 0.46，confidence 約為 0.19；不能把兩個欄位當成同一個門檻訊號。

這會直接改變 semantic-judge 的設計：判斷結果可以當作訊號，但發布、合併或宣告 Story 完整，仍應由外部規則決定。要允許拒答，就把「資訊不足」明確列為選項；有限答案不會自動替你補出不存在的驗收條件。

## 0.935 是公開題目的成績，不是全面取代 Jev 的證據

[README 的 Results](https://github.com/PostHog/jeeves/blob/f04ec5567301450dcaae0210dd54deeb4f647f87/README.md#results)報告，在開啟 thinking、greedy 解碼與 2,560-token 上限的設定下，Jeeves 在 JevBench 的 231 題公開題目得到 0.935，Jev 為 0.866；公開 hard tier 的 111 題則為 0.865 與 0.730。

但 sealed judge tier 沒有納入，這也不是完整 JevBench 綜合排行榜分數；[JevBench 方法文件](https://github.com/fstandhartinger/jevbench/blob/main/docs/METHOD-v1.4.md)另外定義 sealed 評估與速度、成本等軸。README 另外報告 out-of-domain 與 held-out、按題目加權的 Test overall 為 0.889，並註明 JevBench 以外的 Kev／Jev 比較用了同來源的不同題目。不能把這些數字解讀成每一項都做了相同輸入、相同部署條件的配對測試。

反例也在同一份資料裡：MMLU 的 Jeeves 為 0.793，Jev 為 0.900；MMLU-Pro 為 0.739 與 0.840。因此「推理有助於套用某些規則」與「知識題全面領先」是不同主張。

對 Story 缺漏檢查而言，這些分數只足以形成假設：當規則與必要背景都在輸入裡，推理是否更能抓到缺漏？真正要驗證的是團隊的需求文件、中文表達、資訊不足與相互矛盾案例，不能用公開選擇題的平均成績代替。

## 先為判斷服務訂等待預算，再選 thinking 模式

[官方 325 題 dev 測試](https://github.com/PostHog/jeeves/blob/f04ec5567301450dcaae0210dd54deeb4f647f87/README.md#options)給了三種取捨，數字皆為作者報告：

### 完整思考適合作為品質上限的候選

準確率 0.825，平均 1,138 個推理 token，中位延遲 3.3 秒、p90 17.1 秒。README 的效能說明以單張 H100 為背景。這個 p90 不能當成你部署後的保證，更不能假設併發量增加時仍維持不變。

### 限制推理並加入快速路徑，可以降低尾端等待

`max_think: 768` 加上 `nothink_threshold: 0.9`，dev 準確率為 0.806，平均推理 token 降為 344，中位／p90 延遲為 2.0／5.6 秒。這是兩項設定一起改變的結果，不能把全部改善歸因於其中一項。

`nothink_threshold` 控制模型是否略過推理，並不是你的業務放行門檻。即使走快速路徑，外部程式仍要判斷答案是否足以採用。

### 不思考是基線，不代表所有任務都已足夠

dev 準確率 0.775，延遲約 0.3 秒。README 另有 2,962 題 test split 的 no-thinking／thinking 成績 0.804／0.840；它和前述 dev 表不是同一個口徑，也不能與 Test overall 的 0.889 混成一組消融比較。

我的建議是把三種模式都放進同一份 Story 評測，並保留既有判斷流程作為基線。同步編輯提示應驗收端到端 p95 與逾時率；可等待的批次品質稽核，則可以把較長推理視為候選。README 的推理 token 吞吐量，不等於每秒完成的 Story 數量。

## 用一則 Story 把 API 契約寫清楚

專案提供 Jev 相容的 `/v1/systemone`。以下啟動指令依[官方 Quickstart](https://github.com/PostHog/jeeves/blob/f04ec5567301450dcaae0210dd54deeb4f647f87/README.md#quickstart)整理；需要 Python 3.12 與 CUDA GPU，FP8 kernel 要求 Hopper。這不是一般筆電的即裝即用承諾，也沒有在本文環境實跑。

```bash
git clone https://github.com/PostHog/jeeves.git
cd jeeves
git checkout f04ec5567301450dcaae0210dd54deeb4f647f87
pip install -r requirements.txt
hf download PostHog/jeeves --local-dir jeeves-weights
python -m inference.serve \
  --model jeeves-weights \
  --drafter jeeves-weights/drafter_k4.safetensors \
  --port 8009
```

`hf` 指令須先在環境中可用。模型下載完成後，先在本機介面驗證服務。以下是本文設計的請求，語法符合來源 API；沒有附上虛構的模型回應。

```bash
curl --fail-with-body http://127.0.0.1:8009/v1/systemone \
  -H 'content-type: application/json' \
  -d '{
    "state": "Story：使用者可取消訂單。驗收條件：點擊取消後狀態顯示已取消。規則：必須說明可取消的訂單狀態、付款後如何退款，以及取消失敗時的結果。",
    "questions": {
      "readiness": {
        "type": "choice",
        "instructions": "只依輸入規則與文字判斷；不要補造未寫出的需求。",
        "criteria": {
          "complete": "必要條件均有可驗證描述，且沒有矛盾",
          "missing": "至少一項必要條件明確缺漏或矛盾",
          "insufficient": "缺少判斷規則或背景，無法決定"
        }
      }
    },
    "options": {"max_think": 768, "nothink_threshold": 0.9}
  }'
```

這個例子把問題限制在文件完整度，而不是訂單能否取消。評測標記應由需求負責人依同一規則確認；之後才量測模型是否能抓到狀態限制、退款與失敗結果的缺漏。不要讓分類端點順手變成執行業務動作的入口。

## 驗收應計算漏掉的缺漏，並保留人工出口

以下是建議實驗規格，不是 Jeeves 官方數據。先建立人工標記的 Story 集合，包含完整、明確缺漏、資訊不足與矛盾案例；同一專案或同一模板的變體放在同一資料分組，再分出開發集與保留測試集，避免相似措辭洩漏到兩邊。

在開發集選 prompt、門檻與推理模式，凍結後才跑保留測試集。每一模式記錄：

1. 缺漏 recall：所有真正有缺漏的 Story，有多少被抓到。
2. 完整判定的 precision：被模型標成完整的文件，有多少真的完整。
3. 自動採用覆蓋率與錯誤率：多少案例不用人工處理，以及這些案例的錯誤比例。拒答全部案例不能算成功。
4. 資訊不足案例的錯誤放行率，以及不同中文措辭、長度與專案類別的切片結果。
5. 客戶端端到端 p50、p90、p95、逾時率、實際併發與每批完成時間；把排隊與網路時間算進去。

若使用機率作門檻，再觀察高機率區間的實際正確比例；官方在 dev 上擬合的溫度，不能保證新團隊的中文 Story 仍然校準良好。回傳值有四捨五入，也不應為了微小數值差異設定脆弱的邊界。[校準與輸出實作](https://github.com/PostHog/jeeves/blob/f04ec5567301450dcaae0210dd54deeb4f647f87/inference/api.py)

**停止規則：若保留集的缺漏漏判超過團隊容許值，或同步路徑的 p95 超出等待預算，就不啟用自動放行。** 容許值必須在看測試結果前訂好。逾時、錯誤、未知選項與低可信訊號一律送人工佇列；不可把服務不可用解讀為 Story 完整。

## 自架讓責任回到團隊，下一步先做影子評測

Jeeves repository 採 [MIT 授權](https://github.com/PostHog/jeeves/blob/f04ec5567301450dcaae0210dd54deeb4f647f87/LICENSE)，提供訓練、校準與 serving 程式；README 也明確指出各公開資料集保留自己的授權。開源帶來可檢視與可重現的入口，並不替你完成資料授權盤點或服務維運。

[serve.py](https://github.com/PostHog/jeeves/blob/f04ec5567301450dcaae0210dd54deeb4f647f87/inference/serve.py)預設綁定 `127.0.0.1`。若要提供給其他服務，應由團隊補上存取控制、請求限制與觀測，並決定 Story 原文和推理內容的保存政策。模型推理可以在自家環境執行，但資料是否外流仍取決於實際部署、日誌與回退服務。

下一步可以先抽一批有人工判定的 Story，固定版本與規則，並行跑不思考、限制思考與完整思考三種模式。先做影子評測，不影響既有放行結果；只有在漏判、人工覆蓋與端到端等待都過關後，再逐步開啟採用。這才是把「AI 能判斷」變成「團隊能依賴這個判斷服務」的驗收線。
