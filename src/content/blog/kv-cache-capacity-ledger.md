---
title: "KV Cache 不是一個優化項：先分清楚你要減少的是容量、頻寬還是重複"
description: "從 Avi Chawla 的 KV cache 分類出發，將模型架構、token 保留、位元精度、配置重用與 offloading 變成一張 production capacity ledger，避免把不同代價誤當成同一個開關。"
publishDate: 2026-09-07T11:12:11+08:00
updatedDate: 2026-09-07T22:00:32+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - LLM推理
  - vLLM
  - 系統設計
cover: ../../assets/covers/kv-cache-capacity-ledger.png
coverAlt: "透明 GPU 記憶體腔室把發光 token 方塊分流為較小、可共享與移至較冷層級的三條路徑，呈現 KV cache 的不同取捨。"
series: AI Agent 工程化與工作流實戰
seriesOrder: 10
---

Avi Chawla 在〈[KV Cache Engineering for LLM Serving, clearly explained](https://x.com/_avichawla/status/2096491130489872479)〉列出一長串 KV cache 技術。Tech with Mak 的[原始貼文](https://x.com/techNmak/status/2096732946405417130)則把同一問題拉回 serving 路徑：prefill、decode、batching 與快取不是可任意混搭的清單。最容易犯的錯不是漏掉某個名詞，而是把它們都歸成「降低 KV cache」：有些真的釋放 GPU 容量，有些只減少每次 decode 讀取的資料；有些能改 engine 設定，有些必須在訓練 checkpoint 時就已經決定。

我的立場是：**先把容量、頻寬、重複與延遲分成不同帳本，再選優化。**否則看到 OOM 就開 sparse attention，或看到慢就做 CPU offloading，通常只會把瓶頸搬到下一個指標。

本文不重講 [PagedAttention 的分頁與 batching 運作](/blog/llm-inference-optimization-kv-cache-pagedattention/)；它提供一張部署前可用的決策帳本。

## 先算一個 request 的起始負債

單一 sequence 的原始 KV cache 可先用下式估算：

```text
bytes = 2 × layers × kv_heads × head_dim × retained_tokens × bytes_per_value
```

前面的 `2` 是 key 與 value。這不是完整的 GPU 記憶體預算：還有模型權重、activation、kernel workspace、block table 與 scheduler 餘裕。但它能明確指出每個方案究竟動到哪一個乘數。

| 要改變的帳本 | 真正減少的東西                | 典型手法                            | 不能承諾的事                              |
| ------------ | ----------------------------- | ----------------------------------- | ----------------------------------------- |
| 容量         | 每個 token 的常駐 bytes       | GQA／MQA、CLA、MLA、KV quantization | 不保證品質或既有 checkpoint 相容          |
| 容量         | 保留的 token 數               | sliding window、eviction            | 不保證遠端 context 還能被取回             |
| 重複         | 同一 prefix 的重算與重存      | prefix caching、block sharing       | prefix 不同一個 token 就不會命中          |
| 配置浪費     | 空洞與過度保留 block          | PagedAttention                      | 不會讓單一 sequence 的原始 KV 表示變小    |
| 頻寬         | 每個 decode step 讀取的 cache | query-aware sparse reads            | 不一定釋放常駐 GPU 容量                   |
| GPU 容量     | 暫時放在 HBM 的冷資料         | CPU offloading                      | 總資料量仍在，恢復會產生 transfer latency |

這張表也說明為什麼「GPU memory 降了」和「tokens/s 變快」必須分開驗收。前者看可接納的 active sequence 與 OOM；後者還要看 prefill、decode、cache read 與資料搬移。

## 架構帳：只有 checkpoint 能改的乘數

GQA／MQA 減少 `kv_heads`；CLA 減少需要獨立保存的 layer cache；MLA 改變保存的 representation。它們都可能帶來很大的起始容量差，但共同限制是：它們不是一般 serving flag。

[GQA 論文](https://arxiv.org/abs/2305.13245)將它定位在 multi-head 與 multi-query attention 之間；[CLA](https://arxiv.org/abs/2405.12981)與 [DeepSeek-V2 的 MLA](https://arxiv.org/abs/2405.04434)也都是模型設計與訓練的一部分。把一個標準 checkpoint 的某層 cache 指去另一層，或直接把完整 KV 改成 latent state，都改變了模型原本計算的內容。

所以選模型時記錄它的 `layers`、`kv_heads`、`head_dim`、local/global attention pattern 和可用 KV dtype；部署既有模型時，別把這些架構參數列入「下週可以開的 optimization」。這個區分能省掉很多錯誤的 benchmark 計畫。

## Serving 帳：先選可逆、可量測的改動

對既有 checkpoint，通常先從不刪 token 的手段開始。

1. **先檢查 prefix reuse。**相同 system prompt、tool schema 與前綴 token 才能共享既有 KV。把會變的時間戳、request ID 或每輪改寫的 JSON 放進前段，會讓命中率歸零。[vLLM 的 automatic prefix caching 文件](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/)明確以 token prefix 而非語意相似度做 reuse。
2. **再測 KV quantization。**將 BF16 改為 FP8 或更低精度，直接動到 `bytes_per_value`，但要在你的長 prompt、tool result 與輸出品質上驗證誤差。vLLM 將 `--kv-cache-dtype` 列為 engine argument；支援範圍取決於硬體與模型。[官方設定文件](https://docs.vllm.ai/en/latest/configuration/engine_args/)
3. **最後才刪 token 或移資料。**eviction 能讓容量封頂，代價是被淘汰資訊無法參與後續 attention；offloading 能釋放 HBM，代價是恢復時的 PCIe／NVLink 或 CPU memory transfer。兩者都不是免費的「long context 開關」。

> [!IMPORTANT]
> **沒先量到 prefix hit rate、KV bytes 與 decode latency，就不要同時打開量化、eviction 和 offloading。**三個改動一起做，失敗時你無法知道是品質、容量還是資料搬移造成。

## 用四格測試取代單一 tokens/s

部署測試至少要有兩種 prompt：可共享 stable prefix 的正常流量，以及刻意讓 prefix 每輪不同的壓力流量。每種都量短／長 context、低／高並發。

```yaml
workload:
  model: 目標 checkpoint 與 revision
  prompt_shapes: [stable-prefix, changing-prefix]
  contexts: [short, target-max]
  concurrency: [1, target-p95]
measure:
  - kv_cache_bytes_or_blocks
  - prefix_cache_hit_rate
  - time_to_first_token
  - inter_token_latency_p50_p95
  - completion_quality_on_delayed_reference
stop_rule: OOM、p95 超過 SLO，或延遲引用題的正確性下降時停止擴大併發
```

`completion_quality_on_delayed_reference` 很重要。若 eviction 讓 Needle-in-a-Haystack 看似通過，卻把一輪前的 tool result 或 system constraint 淘汰，agent 仍可能在較晚的步驟無聲失敗。這是本文的部署推論，不是任一論文已驗證的保證。

## 從 constraint 選手段，不從清單選功能

如果 GPU 已滿，先找能減少常駐 bytes 的手段：量化、token budget、prefix reuse 或模型架構；如果 GPU 還有空間但 decode 慢，才檢查 attention read 與 batch scheduling；如果只有冷 session 壓住 HBM，再評估 offloading。vLLM 的 [PagedAttention 論文](https://arxiv.org/abs/2309.06180)證明 allocation 與共享本身值得處理，但它不能替模型刪除一個 KV head、也不會替你決定哪些歷史 token 可以遺忘。

下一次看到「KV cache 太大」，先填完上面的四格測試。你要減少的是容量、頻寬、重複還是 HBM 駐留？答得出來，才值得改設定或換模型。
