---
title: "48GB Mac 跑 70GB MoE 模型：先分清磁碟、常駐記憶體與 Context"
description: "從 Qwen3.8-Flash-Next REAP-288 的 Mac 部署案例，拆解裁剪、量化、NVMe mmap 能省下什麼，以及為何 48GB 並不等於長 Context 或 agent 穩定運行。"
publishDate: 2026-09-01T19:53:37+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - 系統設計
cover: ../../assets/covers/local-qwen-moe-on-48gb-mac.png
coverAlt: "銀色筆電上方浮現大量透明資料方塊，光束延伸至右側的外接 NVMe 固態硬碟。"
---

「70GB 模型跑在 48GB Mac 上」聽起來像是記憶體容量被突破了。其實它比較像一次很值得研究的部署取捨：模型檔案大小、執行時常駐記憶體，以及可用的 context window，本來就是三筆不同的帳。

[@xueyu1125 的部署紀錄](https://x.com/xueyu1125/status/2094711023261630514)指向一個明確組合：M4 Pro、48GB 統一記憶體、`Qwen3.8-Flash-Next REAP-288 MLX 4-bit`、oMLX，以及把 PLE N-gram 表用 mmap 從 NVMe 讀取。這不是原始 Qwen 模型完整裝進 48GB 的宣告，也不是可直接推論為長 context 或 agent 穩定可用的保證；它是特定衍生 checkpoint 與 runtime 路徑的個人部署案例。

## 先把「70GB」拆成三個數字

部署大模型時，最容易混在一起的是以下三種容量：

| 數字         | 回答的問題                                    | 在這個案例代表什麼                                                                                            |
| ------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 模型檔案大小 | 下載與磁碟要多少空間？                        | [REAP-288 4-bit model card](https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit) 標示約 68GB。 |
| 常駐記憶體   | 執行時有多少資料必須留在統一記憶體？          | 同一張 model card 對 NVMe N-gram 模式記錄約 39GB。                                                            |
| 可用 context | 還剩多少空間給 KV cache、prefill 與系統餘裕？ | 不能從前兩個數字直接推出，必須用目標 prompt 和實際負載量測。                                                  |

第一項決定下載與 SSD 空間；第二項才接近「能否載入」；第三項才接近「能否完成我的工作」。把它們當成同一個數字，會得到兩種同樣危險的結論：不是過早放棄，也是在短 prompt 成功後誤以為可以無限制延長 context。

## 這個配置靠的是縮小與搬移，不是讓權重消失

[Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next)的架構包含 125B 主模型，另有 51B N-gram embedding 表。Qwen 官方特別說明後者可 offload 到 host memory，並以非同步 prefetch 與運算重疊；因此這個表放在哪裡，會實質改變 runtime 的記憶體輪廓。

此案例使用的並非原始 checkpoint，而是 [REAP-288 4-bit 衍生 build](https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit)：每層專家從 512 個裁至 288 個，再以 4-bit MLX 格式保存。這先降低了要長期存取的權重規模；接著才讓 N-gram 表走 NVMe mmap 路徑。oMLX 的發布說明也列出可將大型 N-gram PLE 表留在常駐記憶體或採 SSD mmap 的能力。

這裡的關鍵限制是：**mmap 不是把整個模型免費放到 SSD。** 它只處理可被這個 runtime 與此 build 外部化的那一段資料；其餘權重、KV cache、Metal 配置與系統仍在競爭統一記憶體。用一般「把模型 swap 到硬碟」的想像來套，會錯估延遲與風險。

想先理解 MoE 為何能讓每個 token 只啟動部分 Expert，可接著閱讀〈[MoE 如何讓大模型變大卻不等比例變慢？從 Router 到記憶體成本](/blog/moe-router-memory-tradeoffs/)〉；但稀疏啟動不會自動免除所有權重的儲存與可存取成本，這正是部署端仍要精算記憶體的原因。

## 48GB 的真正預算是：39GB 之後還剩多少

若採用 model card 自報的約 39GB resident memory，48GB 機器表面上只剩約 9GB。這個差額還要同時容納：

- macOS 與背景程式；
- 隨輸入長度成長的 KV cache；
- prompt prefill 時的暫態配置；
- Metal／driver 的配置與記憶體波動。

所以「短回覆能生成」最多證明它通過了載入與一次互動的門檻。它沒有證明 32K prompt、同時多個請求，或長時間 agent loop 也能順利完成。尤其是硬體記憶體接近上限時，第一個該保留的不是更長的 context，而是可觀察的餘裕與可回退的設定。

## Config 的最大 context 不是你的可用 context

模型設定可接受的最大 sequence length，是架構或訓練配置的上限；部署時真正能用多少，還取決於 KV cache、量化格式、batch／並發、prompt prefill 與當下系統壓力。

因此驗收本地模型時，建議把測試改成一張小表，而不是只記一個 tokens/s：

| 測試          | 要記錄的觀察值                                                          |
| ------------- | ----------------------------------------------------------------------- |
| 冷啟動        | 載入時間、SSD 路徑與可用空間、常駐記憶體峰值。                          |
| 代表性 prompt | 你的真實輸入長度、首 token 延遲、prefill 吞吐、輸出吞吐。               |
| 壓力邊界      | context 逐步增加時的成功／失敗點、swap、memory pressure 與回復情況。    |
| 持續工作      | 同一 runtime 的連續請求、工具呼叫或 agent loop 是否出現尾端延遲與失敗。 |

這些資料才能把「可跑」說清楚：是成功載入、可互動、能完成某一種長度的任務，還是能承受持續負載。原始貼文沒有提供足以獨立核對的完整 benchmark、KV-cache 設定與失敗條件，因此不應把它延伸成 48GB M4 Pro 的速度、品質或 agent 效能結論。

## 對本地部署更有用的決策順序

這個案例最有價值的地方，不是找出一條神奇指令，而是示範部署設計可以拆成四個可驗證的選項：

1. **先選 checkpoint，而不是只看模型家族。** 原始模型、裁剪版與不同量化版會有完全不同的檔案與常駐輪廓。
2. **確認哪一段資料真的能外部化。** 需要 runtime、版本與 model card 都明確支援，不能把任意 SSD 當成通用 RAM。
3. **為 context 預留固定預算。** 以目標工作負載的長度測試，並在壓力升高前停止，而不是從 config 宣稱值倒推可用值。
4. **保留回退路徑。** 先降低 context 或並發、關閉背景負載；若需要調整系統層記憶體限制，必須知道它的影響範圍與如何復原。

依作者部署紀錄，70GB 檔案能在 48GB Mac 上形成一次可用的本地推論，靠的是裁剪、量化與針對特定表格的 NVMe 資料路徑共同作用。它不是「模型大小不再重要」，反而提醒我們把容量、常駐資料與工作負載分開量。只要這三條線不混淆，本地模型的可行性就能從炫目的單一數字，變成可重現、可取捨的工程決策。

## 來源

- [雪瑜：70GB 模型跑在 48GB Mac 上：Qwen3.8-Flash-Next 部署實錄](https://x.com/xueyu1125/status/2094711023261630514)
- [Qwen：Qwen3.8-Flash-Next 官方 repository](https://github.com/QwenLM/Qwen3.8-Flash-Next)
- [sh0wie：Qwen3.8-Flash-Next-REAP-288-MLX-4bit model card](https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit)
- [oMLX 0.6.3 release notes](https://sourceforge.net/projects/omlx.mirror/files/v0.6.3/)
