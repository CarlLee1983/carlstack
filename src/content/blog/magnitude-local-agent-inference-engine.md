---
title: "Magnitude 本機推論引擎：Kernel 調校、量化與 Radix Attention 如何減少記憶體讀取"
description: "依固定版本程式庫、文件與 Launch HN 一手說明，釐清 Magnitude 的 Kernel 調校、前綴快取與 KV 量化；分開解讀作者效能數字、理論容量與本機導入驗收。"
updatedDate: 2026-11-06T00:44:35Z
publishDate: 2026-10-01T12:15:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
  - 開源專案
series: AI Agent 工程化與工作流實戰
seriesOrder: 44
cover: ../../assets/covers/magnitude-local-agent-inference-engine.jpg
coverAlt: "暗色石墨表面上，雷射精確在晶片核心雕刻微型電路，四周記憶體通道以樹狀分支傳遞發光藍色資料封包，象徵裝置端 Kernel 自動微調與前綴快取記憶體架構。"
repositoryUrl: https://github.com/magnitudedev/magnitude
---

Magnitude 在 Launch HN 的長上下文比較中使用量化 KV cache，對照的 llama.cpp 則使用 16-bit KV cache。作者說明，他們曾嘗試讓 llama.cpp 使用同樣的位元配置，但解碼速度下降，因此改用 16-bit。這可以比較兩套當時選定的設定，卻無法單獨證明 Kernel autotuning 帶來多少加速。[作者對 KV 設定的回覆](https://news.ycombinator.com/item?id=49912452)

這次查核固定在 2026-11-06 讀到的 [`magnitudedev/magnitude`](https://github.com/magnitudedev/magnitude) commit [`47156a8`](https://github.com/magnitudedev/magnitude/tree/47156a8c2d793b3036b9ec4bd87c8f40d78ab28f)。本次修訂核對了程式庫、文件與原始討論，下方容量範例已做局部執行檢查。調校、精度、狀態與排程的細節依固定版文件描述，其中的設計要求未逐項驗證執行行為。查核環境沒有安裝推論引擎、載入模型或重跑 GPU benchmark。文中的產品速度都是維護者公布的結果。

舊版引用的 [HN item 45427188](https://news.ycombinator.com/item?id=45427188) 實際是 2025 年另一個議題下的留言。這裡保留連結作為更正紀錄，Magnitude 的 Launch HN 應連到 item 49911995。團隊在發布文中提過先前做過瀏覽器 agent，因此只憑舊版專案介紹，也會辨識錯目前的產品。

## 固定版本後，才能談實作與授權

此 commit 的 `inference/` 是 Rust workspace，含排程器、模型執行器、Kernel、Seismic runtime 與多個硬體 backend。把它當成只有 TypeScript 的瀏覽器自動化工具，已不符合這份程式碼。反過來，把 repository 的所有功能都說成單一 Rust 核心，也會忽略桌面應用程式與整合層。[Rust workspace](https://github.com/magnitudedev/magnitude/blob/47156a8c2d793b3036b9ec4bd87c8f40d78ab28f/inference/Cargo.toml)、[固定版 README](https://github.com/magnitudedev/magnitude/blob/47156a8c2d793b3036b9ec4bd87c8f40d78ab28f/README.md)

根目錄 [`LICENSE`](https://github.com/magnitudedev/magnitude/blob/47156a8c2d793b3036b9ec4bd87c8f40d78ab28f/LICENSE) 是 Apache License 2.0，README 與發布文也使用這個授權名稱。不過，同一版本的 `inference/Cargo.toml` 仍有 `license = "UNLICENSED"` 的 workspace metadata。這兩處標示不一致，不能略過。若要重新散布或納入公司的產品，應請維護者釐清實際使用範圍，並另查模型權重與相依套件的授權。

服務的 API 也需要固定路徑。該版文件列出 OpenAI Chat Completions、Responses，以及 Anthropic Messages 相容路由。其中 Chat Completions 是 `/inference/v1/chat/completions`，模型清單是 `/inference/v1/models`。相容路由存在，不代表每個模型都支援每種輸入、工具呼叫或輸出格式。文件明確把對話歷史與工具執行留給呼叫端。[API endpoints](https://github.com/magnitudedev/magnitude/blob/47156a8c2d793b3036b9ec4bd87c8f40d78ab28f/docs/api/endpoints.mdx)

## Autotuning 有時間預算，也有數值檢查

固定版的 [tuning 文件](https://github.com/magnitudedev/magnitude/blob/47156a8c2d793b3036b9ec4bd87c8f40d78ab28f/inference/docs/tuning.md) 將一次載入的調校預算設為 60 秒。這段時間包含候選形成、執行、比較與結果保存。模型載入與 readiness 則另外計時。因此，「每次啟動約一分鐘就能使用」和「調校有 60 秒預算」是兩個不同敘述。

調校器在同一工作負載下比較候選設定，候選也要通過數值檢查。文件要求保留實際選中的 artifact、測量與數值證據，後續相同身分的載入可以使用保存的選擇。時間不夠時，預設設定是合法結果，文件沒有承諾窮舉所有參數後找到全域最快版本。

這會影響導入時的測量方式。第一次啟動要記錄下載、模型載入、調校與 readiness，各次使用則量穩態推論。把這些時間加成一個數字，很難判斷使用者到底在等哪一步。

局部數值通過也不能替代模型品質驗收。[precision 文件](https://github.com/magnitudedev/magnitude/blob/47156a8c2d793b3036b9ec4bd87c8f40d78ab28f/inference/docs/precision.md) 明確區分 Kernel 的誤差門檻與模型層級品質。團隊若用它產生工具參數，仍要測自己的 JSON schema、長上下文檢索與多輪任務成功率。

## 前綴共享省下已經算過的部分

Launch HN 將其設計稱為 hybrid paged attention，並說明借鏡 SGLang 的 radix attention。固定版的 [sequence state 文件](https://github.com/magnitudedev/magnitude/blob/47156a8c2d793b3036b9ec4bd87c8f40d78ab28f/inference/docs/engine/state.md) 則說明共享的狀態契約。checkpoint 保留既有歷史的擁有權，fork 複製描述，而非把整份歷史 tensor 再複製一遍。新增內容需要專用尾端或新的儲存區段，不能改寫其他 checkpoint 可見的歷史。

例如兩個 agent 共用相同模型、模板與 8,000-token 前綴，各自追加不同的 2,000-token 輸入。共享命中時，已完成的共同前綴可以重用，各自新增的部分仍要計算。這個例子只是工作負載設計，沒有預測 TTFT。首次請求、前綴改動、快取被回收，以及需要重播的狀態，都會改變延遲。

固定版的 [排程文件](https://github.com/magnitudedev/magnitude/blob/47156a8c2d793b3036b9ec4bd87c8f40d78ab28f/inference/docs/engine/scheduling.md) 還列出容量不足時的處置：回收閒置資源、縮小批次與允許的工作量、選擇可回收的序列，最後才等待或失敗。記憶體要在邏輯擁有權與實際裝置工作都結束後才能回收。只看到 agent 已停止輸出，不能推定相關配置已立即歸還。

## 8-bit K 與 4-bit V：先算 payload，再量整個行程

作者在 HN 回覆中使用的是「受 TurboQuant 啟發」的 KV 量化，配置為 8-bit keys 與 4-bit values。這個說法不能改寫為完整採用 TurboQuant 論文演算法，更不能由位元寬度直接推導任務品質不變。[作者的量化說明](https://news.ycombinator.com/item?id=49912522)

對具有一般 attention KV 儲存的假設模型，若各層的 KV heads 與 head dimension 相同，原始 payload 可寫成 `layers × tokens × kv_heads × head_dim × (key_bits + value_bits) / 8`。下方是可用 Python 3.12 執行的容量練習，刻意不使用某個真實模型的規格。

```python
from fractions import Fraction


def kv_payload_bytes(layers, tokens, kv_heads, head_dim, key_bits, value_bits):
    values = (layers, tokens, kv_heads, head_dim, key_bits, value_bits)
    if any(type(value) is not int or value <= 0 for value in values):
        raise ValueError("all dimensions and bit widths must be positive integers")
    total_bits = layers * tokens * kv_heads * head_dim * (key_bits + value_bits)
    return (total_bits + 7) // 8


shape = dict(layers=32, tokens=32768, kv_heads=8, head_dim=128)
fp16 = kv_payload_bytes(**shape, key_bits=16, value_bits=16)
k8_v4 = kv_payload_bytes(**shape, key_bits=8, value_bits=4)
assert fp16 == 4 * 1024**3
assert k8_v4 == 1536 * 1024**2
assert Fraction(k8_v4, fp16) == Fraction(3, 8)
print(f"payload: {fp16 / 1024**3:g} GiB -> {k8_v4 / 1024**3:g} GiB")
```

這組假設的 payload 從 4 GiB 降為 1.5 GiB，減少 62.5%。scale、對齊、頁面 metadata、模型權重、工作區與其他狀態都還沒算進來。混合 attention、滑動視窗或 recurrent 架構也不能直接套這組等層公式。因此，這個比例不等於整個行程 RSS 或每個 agent 的實測節省量。

原文「每產生一個 token，都要完整載入所有權重與 KV cache」也太絕對。讀取量取決於模型架構、啟用的 experts、attention 視窗、快取與批次安排。低批次解碼值得調查記憶體頻寬限制，仍需要 profiler 判斷實際瓶頸。

## 兩次 benchmark 不能合併成同一個結論

### Launch HN 的 llama.cpp 比較

發布文列出的設定是 Qwen 3.6 35B A3B、4-bit 權重、64k context，關閉 speculative decoding。作者公布的 M4 Pro 48 GB 成績為 decode 30 → 57 tok/s、prefill 466 → 507 tok/s，每 agent 記憶體減少 28%。DGX Spark 則為 decode 49 → 58 tok/s、prefill 2,033 → 2,507 tok/s，每 agent 記憶體減少 27%。這些都是發布者數字。[原始發布文](https://news.ycombinator.com/item?id=49911995)

來源把 M4 decode 增幅寫為 92%，但用公開且已四捨五入的 30 與 57 計算得到 90%。沒有未取整的測量值，無法重算出精確的 92%。比較中的 KV 精度也不同，不能把整個差距歸因於 Metal Kernel、autotuning 或 Apple 統一記憶體的其中一項。

### 2026-11-06 查到的 Ollama 比較

[官方 benchmark 頁](https://magnitude.dev/benchmarks) 已改成對照 Ollama 0.35.1，涵蓋 11 個模型。Mac 使用 Ollama MLX 路徑，DGX Spark 使用 Ollama llama.cpp 路徑，兩邊開啟各自的 speculative decoding。平均 decode 加速比分別標為 2.19× 與 2.17×。

該頁的工作負載是約 64k tokens 的《白鯨記》段落，要求重複末段並輸出 256 tokens。平均值是各模型加速比的算術平均，並非把全部 tokens 與時間合併後的吞吐量。每項取兩次請求的中位數，部分 Ollama 項目沿用先前單次結果。頁面也揭露權重、模板與數值計算不完全相同，沒有評分回答品質，且存在 Magnitude 較慢的項目。

這個頁面沒有標出 Magnitude 的精確 build，因此不能把這批數字歸屬到前面固定查核的 commit。它能幫讀者選擇下一個要測的模型，還不足以代表多 agent 工具工作負載。

## 導入時，保留能解釋差異的測試紀錄

我會先挑一個已經穩定執行的 agent 任務，固定模型檔案雜湊、模板、量化、推論引擎版本與 sampling，再比較兩種設定。若要評估預設產品體驗，可以各用預設值，但要把權重、KV 與 drafter 的差異逐項留下，避免事後誤稱是在比較同一套數值設定。

測試至少要留下以下紀錄，這是驗收設計，沒有預先指定勝負：

- 冷啟動與已調校啟動分開，記錄 readiness、TTFT、prefill 與 decode。
- 同一任務分別使用空快取與共同前綴，再增加到實際需要的同時 session 數。
- 記錄峰值記憶體、回收時間與機器是否換頁。工具等待時間另外計算。
- 每次輸出核對工具參數、預期檔案或測試結果。溫度、上下文長度與重複次數一起保存。

**只要工具參數或任務結果不符合既有驗收條件，就停止切換預設引擎。** 下一步是替一個真實任務建立可重播輸入與正確性判準，再決定是否值得投入較長的效能比較。
