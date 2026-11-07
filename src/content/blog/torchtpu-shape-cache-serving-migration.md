---
title: "用 TorchTPU 遷移 PyTorch 模型，如何量測 shape、編譯快取與 KV 傳輸成本"
description: "Google 開源 TorchTPU，SGLang 同步推出原生 PyTorch TPU plugin。從 shape buckets、編譯快取與 KV 傳輸拆解採用成本，建立冷啟動、長尾延遲與正確性的遷移實驗。"
publishDate: 2026-10-21T02:12:10+00:00
updatedDate: 2026-11-05T22:50:00Z
draft: false
featured: false
tags:
  - AI 工程化
  - PyTorch
  - 技術選型
  - 效能優化
series: AI Agent 工程化與工作流實戰
seriesOrder: 95
cover: ../../assets/covers/torchtpu-shape-cache-serving-migration.webp
coverAlt: "橘色玻璃棒依三種尺寸通過青綠陶瓷拱門，旁邊玻璃珠沿獨立銅槽流入小碗，表達形狀分桶與資料搬運是不同成本。"
repositoryUrl: https://github.com/google-pytorch/torch_tpu
---

把 PyTorch 模型搬到 TPU，現在多了一條可以直接檢查原始碼的路徑。我的採用判斷是：先保留既有推理服務，拿一個代表性流量切片驗證 shape、編譯與 KV 搬運，再討論硬體切換。程式能跑和服務能守住延遲預算之間，仍有一段需要測量。

Google 在 [2026 年 10 月 20 日公告](https://cloud.google.com/blog/topics/ai-infrastructure/torchtpu-is-now-open-source-run-native-pytorch-on-tpus)開源 TorchTPU，讓 PyTorch 透過原生 backend 使用 TPU，支援 eager mode 除錯及 `torch.compile` 的執行路徑。同日 SGLang 團隊公布 [SGLang-TorchTPU](https://www.lmsys.org/blog/2026-10-20-sglang-torchtpu/)，將 serving 的硬體特有實作隔離在 plugin。這擴大了可選部署方式，尚未替任何團隊證明每 token 成本會下降。

## 共用模型程式，不代表共用所有效能假設

[TorchTPU repository](https://github.com/google-pytorch/torch_tpu)列出 TPU 的 ATen kernel、XLA computation 編譯快取、分散式訓練與 `torch.compile` 整合。它是一個 PyTorch backend，不是單獨的推理服務，也不會自動代替 API server、請求排程或應用端的正確性驗收。

這個分層對維護有用：模型與上層服務能重用更多 PyTorch 程式，硬體差異則集中處理。但若既有服務依賴 CUDA 自訂算子、特定數值精度或 GPU 專用除錯流程，仍須逐項確認替代路徑。少改幾行 Python，不等於少掉相同份量的測試與維運責任。

我會把第一個遷移清單限制在可回答的範圍：

- 模型：權重、revision、tokenizer、精度、量化與所有自訂算子。
- 工作負載：輸入與輸出長度分布、並行數、前綴重用比例，以及工具呼叫等結構化輸出要求。
- 部署：TPU 世代、拓樸、資源配額、backend 與 serving plugin 的精確版本。
- 驗收：輸出品質、錯誤率、首 token 時間、後續 token 延遲與可接受的成本上限。

這是本文的評估建議。本次只做文件查核與 CPU 上的算術測試，沒有執行 GPU／TPU 模型、plugin 或傳輸效能測試。

## 先分清 eager、Dynamo 與後端編譯快取

這裡的 eager 不是「完全不用編譯」。[TorchTPU 0.2.0 execution model](https://torchtpu.readthedocs.io/en/0.2.0/torchtpu_execution_model/)說明，strict eager 仍會將個別 op 編成可重用的 executable；一般執行是非同步，debug eager 才逐 op 等待。`torch.compile` 則讓後端取得較大的 FX graph，交由 XLA 編譯。[OpenXLA 架構文件](https://openxla.org/xla/architecture)描述的是編譯器與後端流程，不替 serving runner 定義快取命中或持久化保證。不能用 eager 的除錯體驗，推論 production 沒有冷編譯成本。

另外有三種不同的「命中」：serving runner 選中已準備的 bucket、Dynamo 的 guards 允許重用編譯結果，以及後端取得相容的 executable。[PyTorch 的 torch.compile 文件](https://docs.pytorch.org/docs/2.15/generated/torch.compile.html)明確說明 guard failure 可能引發重編譯。相同長度並不代表 dtype、控制流程與其他 guards 都相同，不能把 bucket 數直接當作整個程序的編譯次數。

本文在 2026-11-05 查核的 [TorchTPU dynamic shapes 文件](https://torchtpu.readthedocs.io/en/0.2.0/dynamic_shapes/)還描述 bounded dynamism：動態維度在編譯邊界內變動，超出邊界才可能重編譯。這與 serving runner 主動 padding 的分桶不是同一層；也不等於任意新 shape 永遠免編譯。不要把舊 PyTorch/XLA 的 lazy graph 經驗或設定直接套到 TorchTPU。

## Shape buckets 把動態流量轉成可重用程式

SGLang 的[實作說明](https://www.lmsys.org/blog/2026-10-20-sglang-torchtpu/)指出：runner 將 prefill 補齊到固定 token-count buckets，decode 則使用 batch-size buckets；在該發布說明的固定配置下，各 bucket 編譯後，後續按 shape 選用已備妥的程式。這不是跨版本、跨模型或跨程序「一生只編一次」的承諾。這條路徑不使用 GPU graph capture，而是由 `torch.compile` 下放到 XLA。

對服務負責人，這帶出一個需要自己量的權衡。桶太細，實際流量可能碰到更多待編譯 shape；桶太粗，補齊帶來的額外運算又可能吃掉收益。不能把某個固定長度、充分預熱的 benchmark，直接當成上線後混合請求的預測。

可以用一份不含敏感內容的請求長度直方圖開始：記錄主要輸入長度、batch 變動範圍與長尾請求比例，再建立固定流量重播。分開量三種情況：

1. 全新程序與空快取，觀察初始化和第一次遇到 shape 的時間。
2. 完成預熱的穩態，觀察代表性混合流量下的 p50、p95 與 p99。
3. 模型版本或配置變更後重新啟動，觀察編譯是否重新發生及恢復時間。

這些場景是本文建議的測試設計。TorchTPU 0.2.0 文件區分預設記憶體快取與可選持久化／遠端層；不能只因機器相同，就假設新程序會沿用舊 executable。記錄快取層是否啟用、版本、編譯選項、模型與硬體拓樸；分別測空快取重啟與保留持久化快取重啟。計時 device 工作時須依該版本 API 等待完成，否則量到的可能只是 enqueue 時間。

下面是可用 Python 3 執行的分桶算術示例，不是 plugin 的設定檔，也不是 TPU benchmark。它只計算 token 槽位；attention 的實際 FLOPs、kernel layout 與 batch packing 仍須實測。

```python
def bucket_slots(lengths, buckets):
    if not buckets or any(type(b) is not int or b <= 0 for b in buckets):
        raise ValueError("buckets must be positive integers")
    if list(buckets) != sorted(set(buckets)):
        raise ValueError("buckets must be strictly increasing")
    total = padded = 0
    for n in lengths:
        if type(n) is not int or n <= 0:
            raise ValueError("length must be a positive integer")
        target = next((b for b in buckets if b >= n), None)
        if target is None:
            raise ValueError("length exceeds configured buckets")
        total += n
        padded += target
    return total, padded

assert bucket_slots([129, 256, 257], [128, 256, 512]) == (642, 1024)
```

這個例子多出 382 個槽位，相對有效 token 是約 59.5%；若分母改成已配置槽位，浪費率則約 37.3%。報告必須標示分母，不能拿這個比例當作延遲增加率。

**如果預熱成功的結果無法在滾動部署後重現，就暫停擴大流量。**否則平時看到的是漂亮的穩態吞吐量，發布時卻讓第一批使用者承擔編譯等待。

## KV 快取命中與 KV 傳輸要分開算

SGLang plugin 的架構保留上層 scheduler、RadixAttention 與 API server，並提供 attention、KV pool、MoE kernel 與 graph runner 等硬體部分。當 KV 離開 device，官方說明使用 TPU Sync 支援 offload 或 prefill／decode 分離；跨主機時由 decode 拉取已完成的 prefill chunk，並可在不同 tensor-parallel 配置間重排資料。[SGLang 的機制說明](https://www.lmsys.org/blog/2026-10-20-sglang-torchtpu/)

這裡至少有兩本帳：前綴重用省掉了多少計算，以及把那些 KV 搬到需要的位置花了多少時間。高命中率不能單獨證明低延遲；如果請求被送往沒有快取的副本，或資料搬運遇到瓶頸，應用端仍可能等待。

本文建議以相同長度和並行度，重播兩組流量：一組有高前綴重用，另一組刻意使用不同前綴。每組再記錄 KV 命中、offload 次數、傳輸量、傳輸等待與端到端延遲。命中率要標示是 request、token 還是 page 的比率，並區分本機 HBM、host 與遠端命中。傳輸量分 H2D、D2H、跨主機各方向計算；吞吐量使用實際 bytes 除以該段搬運秒數，不把雙向合計頻寬當成單向頻寬。

傳輸可與 prefill 重疊，因此各段時間相加不一定等於端到端時間。另量 decode 真正等待資料就緒的 critical-path stall，連同排隊、重排與同步記錄。舉例，若單向有效頻寬假設為 20 GB/s，搬 1 GiB 的純資料時間是 `2**30 / (20 * 10**9)` 秒，約 53.7 ms；這是忽略固定開銷、壅塞與重疊的算術示例，不是 TPU Sync 的量測結果。若測 prefill／decode 分離，明確寫下兩邊的平行度與主機數；拓樸改變後重新量，不把上一組結果當成永久結論。

對多輪 Agent，還要把工具等待與模型等待拆開。工具呼叫慢造成的低吞吐，未必能靠換加速器改善；反過來，工具回傳結果後突發的下一輪 prefill，也可能暴露單輪固定負載沒有測到的壓力。

## 支援標記不能替自己的功能組合背書

[plugin repository](https://github.com/sgl-project/sglang-torchtpu) 與 [TPU Sync repository](https://github.com/google/tpu-sync)提供公開專案入口。本文對 runner 與傳輸行為的說明以官方發布文件為依據，沒有逐行驗證實作。部署前仍應固定 commit 並跑自己的相容性測試。

Google 公告涵蓋訓練和推理等多條整合路徑。做 serving 選型時，我會只選定其中一條，避免把另一個框架的展示數字帶入本次服務。SGLang 的發布文件列出功能與可靠性範圍；其中 structured output 與 function calling 在發布表中仍標為 experimental。[SGLang 的功能與可靠性範圍](https://www.lmsys.org/blog/2026-10-20-sglang-torchtpu/)

因此，確認某個模型能完成一般文字生成後，還要逐項驗證應用會用到的組合：串流取消、結構化輸出、工具參數、長 context、prefix cache、KV offload，以及多主機故障後的回復。功能各自通過，也不能自動推出組合使用時仍通過。

品質比較不要求每次取樣文字逐字相同。可以固定一組可重跑的資料與評分方式，檢查任務成功率、結構解析、工具選擇與數值異常，再量效能。未先通過品質門檻的快，不應進入成本比較。

## 成本分母應是達標的工作量

便宜的 accelerator-hour 不一定帶來便宜的服務。本文建議將成本定義成「達到品質與延遲門檻的有效輸出」：把機器、空閒容量、預熱、失敗重試、跨主機搬運和新增維運工時都列出。若只除以總生成 token，無效輸出與失敗重試反而可能讓分母變漂亮。

一個可執行的小試驗可以這樣收斂：同一模型 revision 與工作負載，在既有 GPU 路徑與一個固定 TPU 配置各跑冷啟動、穩態與重啟測試。事前寫下品質下限、p99 上限及成本門檻；任何一項未達標，就保留原路徑並分析差距，不擴大採購或遷移。

站內的 [KV Cache 容量帳本](/blog/kv-cache-capacity-ledger/)處理記憶體如何被請求佔用；TorchTPU 的評估還要補上編譯 shape 與 KV 的位置。下一步先用一份真實長度分布建立測試切片，讓報告同時回答「哪一段省了」與「發布時哪一段仍會等」。
