---
title: "KV Cache 的容量、頻寬與前綴重用，要分開評估"
description: "用可重算的 KV 容量公式與分頁例子，分清模型架構、精度、前綴共享及 offloading 的成本，建立涵蓋容量、頻寬與延遲的部署帳本。"
publishDate: 2026-09-07T11:12:11+08:00
updatedDate: 2026-11-05T22:50:00Z
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

本文原先由 Avi Chawla 的〈[KV Cache Engineering for LLM Serving, clearly explained](https://x.com/_avichawla/status/2096491130489872479)〉與 Tech with Mak 的[原始貼文](https://x.com/techNmak/status/2096732946405417130)引入問題。2026-11-05 複核時，兩個 X 連結都回傳 403，無法重新核對全文；保留來源入口，但以下技術結論改以論文與官方文件為據。

常見的錯誤是把所有技術都歸成「降低 KV cache」：有些減少每個 token 的表示大小，有些只減少讀取；有些改善配置與共享，有些只把資料移出 HBM。它們對容量、頻寬與延遲的影響不能互換。

我的立場是：**先把容量、頻寬、重複與延遲分成不同帳本，再選改善手段。**否則看到 OOM 就開 sparse attention，或看到慢就做 CPU offloading，通常只會把瓶頸搬到下一個指標。

本文不重講 [PagedAttention 的分頁與 batching 運作](/blog/llm-inference-optimization-kv-cache-pagedattention/)；它提供一張部署前可用的決策帳本。

## 先算一個 request 的起始負債

先限定為每層具有相同 KV heads、K/V head dimension 與 dtype，且保留完整歷史的 decoder self-attention。單一 sequence 的有效 KV payload 可用下式估算：

```text
bytes = 2 × layers × kv_heads × head_dim × retained_tokens × bytes_per_value
```

前面的 `2` 是 key 與 value。`kv_heads` 不是 query heads：MHA 兩者相同，GQA 讓多個 query heads 共用一組 KV，MQA 則只有一個 KV head。FP16／BF16 每個值是 2 bytes，FP32 是 4 bytes，FP8 payload 是 1 byte，但量化 scale、對齊與高精度殘留區要另外計算。模型權重量化不代表 KV dtype 也跟著改變。

多個未共享的 sequence 長度不同時，將 `retained_tokens` 換成各 sequence 長度的總和；只有每筆都同長，才可直接用 `batch_size × length`。長度包含已保留的 prompt 與生成 token，不是只看輸入上限。這是張量元素數推導，並非 allocator 的實際預留量。[Transformers cache 文件](https://huggingface.co/docs/transformers/main/en/kv_cache)也區分動態、靜態與量化 cache；sliding-window 層可停止成長，不能對混合架構的每層都乘完整 context。

以下 Python 3 範例只算上述均質、無共享模型的 payload，沒有載入模型。`bytes_per_value` 刻意只接受正整數；4-bit 等 packed sub-byte 格式不在此 helper 支援範圍，必須另算打包、scale 與對齊開銷，不能直接填入 0.5：

```python
def kv_payload_bytes(layers, kv_heads, head_dim, lengths, bytes_per_value=2):
    for n in (layers, kv_heads, head_dim, bytes_per_value):
        if type(n) is not int or n <= 0:
            raise ValueError("dimensions and bytes_per_value must be positive integers")
    lengths = list(lengths)
    if any(type(n) is not int or n < 0 for n in lengths):
        raise ValueError("lengths must be nonnegative integers")
    return 2 * layers * kv_heads * head_dim * sum(lengths) * bytes_per_value

one = kv_payload_bytes(32, 8, 128, [8192])
assert one == 1_073_741_824
assert one / 2**20 == 1024  # MiB
assert one / 2**30 == 1     # GiB
assert kv_payload_bytes(32, 8, 128, [8192] * 4) == 4 * one
```

這個假設模型每 token 需要 128 KiB，8192 token 是 1 GiB，四筆不共享的同長請求就是 4 GiB。`1 GiB = 2**30 bytes`，約等於 1.074 GB；`1 MiB = 2**20 bytes`，不能與十進位 MB／GB 混寫。若誤用 32 個 query heads 取代 8 個 KV heads，會高估四倍；若漏乘 batch，則會低估四倍。

這仍不是完整的每卡預算。模型權重、activation、workspace、page metadata、padding、保留池與安全餘裕要另列；tensor parallel 的 KV 分片或複製規則也要依實作確認，不能無條件除以卡數。MLA、CLA、不同 K/V 維度與混合 local/global layers 必須依實際存放表示逐層加總，不直接套這個簡式。

我會把帳本拆成六項：

- 容量表示：GQA／MQA、CLA、MLA、KV quantization 改變獨立保存的值與大小，不保證既有 checkpoint 相容。
- 保留範圍：sliding window 與 eviction 改變保留的 token；模型原生 local attention 與任意刪掉 full-attention 歷史不是同一回事。
- 前綴重用：共享可相容的已算 KV，減少重算與重複實體頁面，不縮小一份 KV 的表示。
- 配置浪費：PagedAttention 減少過度預留與碎片，但仍有最後一頁未填滿的槽位。
- 讀取頻寬：sparse reads 可減少某次 attention 讀取，未必釋放常駐容量。
- HBM 駐留：offloading 把資料移到 host 等層級；資料總量仍在，取回需要傳輸。

例如 page size 為 16 tokens，兩筆不共享、各長 17 的序列，有效 token 共 34，但要配置 4 頁、共 64 槽。若兩筆的前 16 tokens 相同且允許共享完整 prefix page，可減成 3 個實體頁、48 槽。這不是把每 token 的 KV bytes 變小，也不能保證預先配置的整個 GPU pool 會立即歸還給系統。

## 架構帳：不是一般 serving flag 能改的乘數

GQA／MQA 減少 `kv_heads`；CLA 減少需要獨立保存的 layer cache；MLA 改變保存的 representation。它們都可能帶來很大的起始容量差，但共同限制是：它們不是一般 serving flag。GQA 論文本身包含由 MHA checkpoint 轉換再 uptraining 的方法，因此也不該說「只能從頭訓練時決定」；重點是需要相容權重與品質驗證。

[GQA 論文](https://arxiv.org/abs/2305.13245)將它定位在 multi-head 與 multi-query attention 之間；[CLA](https://arxiv.org/abs/2405.12981)與 [DeepSeek-V2 的 MLA](https://arxiv.org/abs/2405.04434)也都是模型設計與訓練的一部分。把一個標準 checkpoint 的某層 cache 指去另一層，或直接把完整 KV 改成 latent state，都改變了模型原本計算的內容。

所以選模型時記錄它的 `layers`、`kv_heads`、`head_dim`、local/global attention pattern 和可用 KV dtype；部署既有模型時，別把這些架構參數列入「下週可以開的 optimization」。這個區分能省掉很多錯誤的 benchmark 計畫。

## Serving 帳：先選可逆、可量測的改動

對既有 checkpoint，通常先從不刪 token 的手段開始。

1. 先檢查 prefix reuse。可共享範圍取決於實際送入模型的 token prefix 與相容的 cache 身分，不能只比較顯示的 system prompt 或 tool schema 文字。把會變的時間戳、request ID 或每輪改寫的 JSON 放進前段，會縮短可共享前綴，但不是任一 token 不同就讓整筆命中歸零。[vLLM 的 automatic prefix caching 文件](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/)明確以 token prefix 而非語意相似度做 reuse。[vLLM 的設計文件](https://docs.vllm.ai/en/latest/design/prefix_caching/)進一步說明完整 block 的 hash 包含前方 prefix 與額外識別資訊。後方 token 改變，不影響前面已符合條件的完整 block；LoRA、多模態內容或隔離 salt 不同，即使文字相同也未必能共享；頁面已被淘汰或請求落到沒有該 cache 的副本，也會失去命中。
2. 再測 KV quantization。將 BF16 改為 FP8 或更低精度，直接動到 `bytes_per_value`，但要在你的長 prompt、tool result 與輸出品質上驗證誤差。vLLM 將 `--kv-cache-dtype` 列為 engine argument；支援範圍取決於硬體與模型。[官方設定文件](https://docs.vllm.ai/en/latest/configuration/engine_args/)
3. 最後才刪 token 或移資料。若刪除 active sequence 的歷史 KV 且不重算，會改變後續 attention 可見的資訊；這不同於淘汰閒置 prefix-cache block，後者通常只是讓下次請求重算 prefill。offloading 則讓 HBM 槽位可供其他資料使用，代價是恢復時的 device-host interconnect 與 host memory transfer；pool 是否歸還給系統是另一件事。兩者都不是免費的「long context 開關」。

> [!IMPORTANT]
> **沒先量到 prefix hit rate、KV bytes 與 decode latency，就不要同時打開量化、eviction 和 offloading。**三個改動一起做，失敗時你無法知道是品質、容量還是資料搬移造成。

## 用八種流量組合取代單一 tokens/s

部署測試至少要有兩種 prompt：可共享 stable prefix 的正常流量，以及刻意讓 prefix 每輪不同的壓力流量。每種都量短／長 context、低／高並發，共 `2 × 2 × 2 = 8` 種組合。以下 YAML 是測試規格示意，不是可直接傳給 vLLM 的設定檔：

```yaml
workload:
  model: 目標 checkpoint 與 revision
  prompt_shapes: [stable-prefix, changing-prefix]
  contexts: [short, target-max]
  concurrency: [1, target_concurrency]
measure:
  - kv_payload_bytes_and_physical_blocks
  - allocated_pool_bytes_and_hbm_resident_bytes
  - host_resident_bytes_and_transfer_bytes_by_direction
  - prefix_cache_hit_tokens_over_lookup_tokens
  - transfer_duration_and_decode_wait_ms
  - time_to_first_token
  - inter_token_latency_p50_p95
  - completion_quality_on_delayed_reference
stop_rule: OOM、p95 超過 SLO，或延遲引用題的正確性下降時停止擴大併發
```

`target_concurrency` 應換成測試前選定的正整數，例如 8，不是延遲百分位數。

命中率要固定分母，不能混用「請求有任何命中」與「查詢 token 有幾成命中」。同步記錄有效 payload、實體頁與 pool 預留量，避免用系統看到的 GPU memory 判斷 prefix reuse 是否生效。搬運的總時間可能與運算重疊，decode 等待資料的時間才是另一個需要單獨追的指標。

`completion_quality_on_delayed_reference` 很重要。若刪除 active sequence 歷史的策略讓 Needle-in-a-Haystack 看似通過，卻把一輪前的 tool result 或 system constraint 淘汰，agent 仍可能在較晚的步驟無聲失敗。這是本文的部署推論，不是任一論文已驗證的保證。

## 從 constraint 選手段，不從清單選功能

如果 GPU 已滿，先找能減少常駐 bytes 的手段：量化、token budget、prefix reuse 或模型架構；如果 GPU 還有空間但 decode 慢，才檢查 attention read 與 batch scheduling；如果只有冷 session 壓住 HBM，再評估 offloading。vLLM 的 [PagedAttention 論文](https://arxiv.org/abs/2309.06180)證明 allocation 與共享本身值得處理，但它不能替模型刪除一個 KV head、也不會替你決定哪些歷史 token 可以遺忘。

下一次看到「KV cache 太大」，先填完上面的八種流量組合。你要減少的是容量、頻寬、重複還是 HBM 駐留？答得出來，才值得改設定或換模型。

本次僅驗證容量、分頁與單位換算的 CPU 算術，沒有執行模型品質或 GPU／TPU 效能測試。

若同時評估 TPU 後端，可接著看 [TorchTPU 的 shape 與 KV 搬運驗收](/blog/torchtpu-shape-cache-serving-migration/)：容量足夠之外，編譯預熱與快取資料所在位置仍會影響服務延遲。
