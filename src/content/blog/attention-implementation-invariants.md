---
title: "Attention 不是一條公式：用三個不變量看懂 LLM 的 Q、K、V 實作"
description: "從 Tech with Mak 的 Attention 手冊出發，用 tensor shape、mask direction 與 decode state 三個不變量檢查 Q/K/V、RoPE、KV cache 與 FlashAttention 的實作邊界，避免把數學、位置與 kernel 最佳化混成同一件事。"
publishDate: 2026-09-07T12:20:31+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - LLM推理
  - 系統設計
series: AI Agent 工程化與工作流實戰
seriesOrder: 12
cover: ../../assets/covers/attention-implementation-invariants.png
coverAlt: "暖色 query 卡片透過多條細線連到藍色 key 與珊瑚色 value 卡片網格，再匯聚成右側的輸出卡片，呈現 attention 的加權聚合。"
---

[Tech with Mak 的 Attention 手冊](https://x.com/technmak/status/2096004794192404728)把路線從 Q/K/V 一路拉到 RoPE、KV cache 與 FlashAttention。這條路線有一個很實用的工程結論：不要把它們當成一串必須背下來的名詞。它們分別在改不同層次的事。

我的立場是：**review attention 實作時，先驗 shape、再驗 mask、最後驗 state；三者成立後才談 kernel 與吞吐量。**這比對照一條 `softmax(QKᵀ / √d) V` 公式更容易抓到會安靜產生錯誤的問題。

本文不重複 [KV cache 的容量、頻寬與重複帳本](/blog/kv-cache-capacity-ledger/)，也不重講 [PagedAttention 的配置與 batching](/blog/llm-inference-optimization-kv-cache-pagedattention/)。它提供的是把數學接回程式碼時可用的最小檢查表。

## 不變量一：每個 query 都只能輸出一個加權後的 value

Scaled dot-product attention 的數學核心由 Transformer 原始論文定義：[Attention Is All You Need](https://arxiv.org/abs/1706.03762)。若單一 head 的 batch shape 為 `Q: [B, Tq, D]`、`K: [B, Tk, D]`、`V: [B, Tk, Dv]`，中間與輸出的 shape 必須是：

```text
scores  = Q @ K.transpose(-2, -1)   # [B, Tq, Tk]
weights = softmax(scores / sqrt(D)) # [B, Tq, Tk]
output  = weights @ V               # [B, Tq, Dv]
```

`Tq` 是提出問題的位置數，`Tk` 是可供查詢的位置數。這也直接分開 self-attention 與 cross-attention：前者通常讓 Q/K/V 都從同一段 sequence 來，後者讓 Q 來自 decoder、K/V 來自 encoder。兩者共享同一條運算式，差異在輸入來源與 shape，不在另一套「cross-attention 公式」。

下面的概念實作刻意不用 fused kernel；它適合在 unit test 或 code review 中確認 shape 與遮罩，而不是用來量產效能。

```python
import math
import torch


def attention(q, k, v, allowed=None):
    scores = q @ k.transpose(-2, -1) / math.sqrt(q.size(-1))
    if allowed is not None:
        scores = scores.masked_fill(~allowed, float("-inf"))
    weights = scores.softmax(dim=-1)
    return weights @ v


q = torch.randn(2, 3, 4)  # B=2, Tq=3, D=4
k = torch.randn(2, 5, 4)  # B=2, Tk=5, D=4
v = torch.randn(2, 5, 6)  # B=2, Tk=5, Dv=6
assert attention(q, k, v).shape == (2, 3, 6)
```

若 `scores` 的最後兩個維度不是 `[Tq, Tk]`，或 output 最後一維不是 `Dv`，後面的 multi-head reshape、cache append 與 kernel 選擇都沒有意義。先在此停止，比在 loss 異常後追一條錯置的 transpose 便宜得多。

## 不變量二：mask 定義的是可看的位置，不是模型「應該知道」什麼

Causal attention 不讓位置 `t` 讀到未來的 key：對第 `t` 個 query，只有 `key_index ≤ t` 的 score 能進 softmax。padding mask 也同樣是先在 score 層排除不應參與的 key。它們改變的是可連線集合；Q/K/V 的線性投影與加權聚合並沒有換掉。

最常見的錯誤是 boolean 語意倒置。概念實作中 `allowed=True` 表示可以看，因此用 `~allowed` 填入 `-inf`。但 PyTorch 的 [`scaled_dot_product_attention`](https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention)也是 `attn_mask=True` 表示「可參與」；它與 `MultiheadAttention.key_padding_mask=True` 表示「忽略」剛好相反。

> [!IMPORTANT]
> **把 mask 從 `MultiheadAttention` 遷到 SDPA 前，先用一個 3-token 的手算 case 驗證最後一列看不到未來 token。**不要只看 tensor shape；方向反了仍能正常跑完。

位置資訊是另一個容易混淆的責任。原始 Transformer 將 positional encoding 加到 token representation；[RoFormer](https://arxiv.org/abs/2104.09864)提出的 RoPE 則以 rotation 將 position 納入 attention 的 Q/K 表示，並讓 score 帶有相對位置關係。RoPE 不會替 causal mask 決定權限，causal mask 也不會替 RoPE 告訴模型順序；兩者應分開測。

## 不變量三：decode 只新增一個 query，卻必須保留歷史 K/V

在 prefill，模型可以對完整 prompt 同時建立各層 K/V。在 autoregressive decode，每一步只計算新 token 的 Q/K/V；新 Q 要和「歷史 K 加上新 K」打分，並以同樣範圍的 V 聚合。因此 cache 是數學所需的歷史 state，不是獨立的產品功能。

```text
prefill: Q, K, V for tokens 0..n-1  -> cache K[0..n-1], V[0..n-1]
decode:  q_n, k_n, v_n              -> append k_n, v_n
         q_n @ K[0..n]ᵀ             -> one output for token n
```

這個不變量也說明為什麼 MHA、MQA、GQA 與 MLA 不能和 cache management 混談：前者改的是模型產生或保存 K/V 的表示／head 配置，後者處理既有表示如何配置、共享或搬移。需要部署選型時，回到前文的 [KV cache 帳本](/blog/kv-cache-capacity-ledger/)；需要修正模型或 checkpoint 時，先確認它原本的 attention variant。

## FlashAttention 改的是資料移動，不是 attention 的答案

[FlashAttention](https://arxiv.org/abs/2205.14135)的關鍵不是用近似法替換 softmax attention，而是以 IO-aware tiling 減少 GPU HBM 與 on-chip SRAM 間的讀寫，仍計算 exact attention。這是很重要的切分：同一個 Q/K/V、同一個 mask、同一個輸出定義，可以有不同 kernel 排程。

實務上，先讓框架選擇已支援的實作通常就夠了。PyTorch SDPA 會根據 input 與環境在 FlashAttention-2、memory-efficient attention 或其 C++ 實作間選擇；若 fused kernel 無法執行，文件也要求提出原因警告。不要為了「使用 FlashAttention」先自行改寫一份 softmax 或把 shape 硬塞成可用形式。

```python
import torch.nn.functional as F

# q, k, v 的常見 shape 為 [B, heads, T, head_dim]
output = F.scaled_dot_product_attention(q, k, v, is_causal=True)
```

先驗證這個呼叫與概念版在小 tensor、相同 mask 下輸出相符，再量實際 prompt 長度、dtype、head dimension、GPU 與 batch。論文的 benchmark 是受測組態的結果，不是任意模型的速度承諾。

## 把學習清單換成一個停止規則

這份 [33 頁手冊](https://drive.google.com/file/d/1fCHQ5xCQJ6jZszAYf-qP3VIySbzFIEDv/view)的價值不是再增加一份 Transformer 名詞表，而是把抽象公式逐步接回現代執行面。讀完後，對一段 attention 程式碼依序問三個問題：

```yaml
review:
  shape: scores 是否為 [query_positions, key_positions]，output 是否保留 value_dim？
  mask: True／False 是否真的對應「可看」與「不可看」？最後一個 query 能否讀到未來？
  state: decode 是否只 append 新 K/V，並讓新 Q 看見完整歷史？
stop_rule: 任一答案無法用 3-token case 證明前，不開始調 kernel、cache layout 或吞吐量。
```

答得出來，才把 RoPE、head variant、cache 與 FlashAttention 放回各自該在的層；答不出來，繼續增加名詞只會讓除錯面積變大。
