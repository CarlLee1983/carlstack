---
title: "Benchmark 結果要帶著成立條件：用 Cartwright 限定效能測試能證明什麼"
description: "從南希・Cartwright 的 nomological machine 與因果外推問題出發，檢查 workload、執行環境和作用機制如何限制 benchmark 的適用範圍，並建立連到 production-shape 驗證的決策步驟。"
publishDate: 2026-09-26T21:57:15+08:00
draft: false
featured: false
tags:
  - "系統設計"
  - "軟體品質"
  - "架構方法論"
series: "哲學視角下的系統分析與軟體設計"
seriesOrder: 6
cover: "../../assets/covers/cartwright-benchmark-validity.png"
coverAlt: "透明測試艙中的資料庫裝置以細線連到規模更大的運作環境，呈現 benchmark 結果只能在條件相符時外推。"
---

## 一張漂亮的圖，不會自動說明 production 會變快

假設團隊正在評估資料庫的新索引。基準測試使用固定大小的資料集、預熱後的快取，以及以讀取為主的請求；結果顯示新索引在這組條件下有較低的查詢延遲。工程師把圖貼進設計文件，結論卻寫成「新索引會降低正式環境的 P99」。這句話已超過測試直接觀察到的範圍。

正式環境可能有不同的讀寫比例、資料傾斜、併發度、快取狀態與背景工作。索引也會改變寫入成本。這些差異不代表 benchmark 沒用，而是要求我們先問：**這組測試建立了什麼條件？哪些條件與正式環境相同，哪些尚未驗證？**

## Cartwright 提醒我們，規律需要合適的組合

在《The Dappled World》第三章，南希・Cartwright 用「nomological machine」描述一組具有穩定能力的元件，在適當安排下反覆運作，於是產生可觀察的規律。實驗室常藉由控制安排與環境，讓某種規律顯現；她的論點不是每個結果都只能留在實驗室，而是結果能否延伸，取決於目標情境是否保留了相關條件。[《The Dappled World》，第 3 章，頁 49–74](https://www.cambridge.org/core/books/abs/dappled-world/nomological-machines-and-the-laws-they-produce/E0342D6EFB99D1C65B7648EAE455540F)

Cartwright 在討論隨機對照試驗時也區分了試驗內的因果結論與其他情境中的預測。要把結果帶到目標環境，必須說明哪些因果結構與環境條件能延續；單有內部效度，還不足以回答外部效度。[〈What are randomised controlled trials good for?〉](https://link.springer.com/article/10.1007/s11098-009-9450-2)

她談的是科學解釋與因果推論，不是軟體效能測試。本文的工程推論是：一次 benchmark 也由工作負載、軟硬體配置、資料與背景活動共同構成。測試結果先支持「在這組配置下觀察到什麼」，要支持 production 決策，還要證明關鍵條件與作用機制能對上。

## 先把測試結論寫窄，再追問它能否外推

評估新索引時，可以先寫出一條能被反駁的測試主張：

```yaml
claim: 新索引在指定的讀取工作負載下縮短查詢延遲
workload: 查詢類型、讀寫比例、資料量與資料分佈
environment: 資料庫版本、硬體、連線數、快取與背景工作
mechanism: 索引減少候選資料掃描，但增加寫入維護成本
not_yet_supported: 正式環境整體 P99 一定下降
production_check: 在接近正式流量的資料與併發下驗證讀寫延遲、錯誤率與資源使用
```

這些欄位讓團隊分開觀察結果、解釋和預測。尤其要保留可能抵銷收益的機制：如果索引降低讀取工作量，卻讓寫入更慢或增加儲存成本，單一讀取測試就不能代替整體取捨。

驗證時不必一次複製整個 production。先挑會改變決策的條件：流量比例、資料傾斜、併發、快取冷熱與背景維護。用相同版本與資料基線比較新舊配置，記下每次只改變哪些變因；再於受控流量或可回復的灰度環境觀察主要指標與副作用。若結果和預測不合，先檢查環境、資料或作用機制的假設，而不是把原 benchmark 的數字外推得更遠。

## 把「可以採用」連到一條可驗收的證據鏈

效能決策可以設幾個停點：

- **測試條件不完整時，不把結果寫成容量承諾。** 至少記錄資料、工作負載、執行環境、版本、重複方式與資源限制。
- **作用機制不明時，先補觀察再擴大。** 如果查詢變快的同時寫入延遲或 CPU 使用改變，必須找出變化落在哪條工作路徑。
- **production 條件尚未對照時，只能說測試組態改善。** 經過有回復路徑的灰度驗證，才擴大成正式採用結論。
- **正式指標違反預期時，停止擴大並回復。** 預先寫明延遲、錯誤率、資源使用和回復條件，避免把效能調校變成不可逆部署。

最後的驗收不是「benchmark 圖看起來更好」，而是目標工作負載中的延遲、錯誤率、寫入成本和資源消耗符合明確門檻，且回復路徑實際可用。這些門檻要依系統的 SLO、成本與風險決定，哲學概念無法替團隊填入數值。

## Cartwright 的方法不會替你證明兩個環境等價

Cartwright 的論點不等於「benchmarks 永遠不能外推」。如果測試呈現的機制在正式環境仍然成立，相關工作負載與干擾因素也經過驗證，團隊可以合理地把證據帶到新的情境。反過來說，增加更多測試樣本也不會自動補上未觀察到的條件。

本文借用的是一個追問方式：結果依賴哪些安排？目標環境保存了哪些安排？還缺哪項證據，決策才足以擴大？真正的答案仍要靠系統測量、因果分析和可回復的部署取得。哲學視角不會取代效能測試；它幫我們限制測試結論的範圍。

下次在設計文件貼上 benchmark 圖時，先加上工作負載、環境、作用機制與尚未支持的結論。然後挑一項最可能讓 production 結果不同的條件，設計一個可回復的驗證。系列前篇[共享 CI 資源如何治理](/blog/ostrom-common-pool-shared-infrastructure/)談共同規則如何影響共享容量；本篇接著追問哪些證據足以支持行動。更早的[實踐智慧與自動化停點](/blog/aristotle-practical-wisdom-automation-boundaries/)則討論例外判斷由誰負責；後篇可讀[如何配置中央與在地決策權](/blog/hayek-local-knowledge-control/)。

## 延伸閱讀

- Nancy Cartwright, _The Dappled World: A Study of the Boundaries of Science_ (1999), Chapter 3, “Nomological Machines and the Laws They Produce,” pp. 49–74. [Cambridge University Press](https://www.cambridge.org/core/books/abs/dappled-world/nomological-machines-and-the-laws-they-produce/E0342D6EFB99D1C65B7648EAE455540F)
- Nancy Cartwright, “What are randomised controlled trials good for?” _Philosophical Studies_ 147 (2010), pp. 59–70; first published online in 2009. [Springer](https://link.springer.com/article/10.1007/s11098-009-9450-2)
