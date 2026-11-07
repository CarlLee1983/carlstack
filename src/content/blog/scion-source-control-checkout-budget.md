---
title: "從 Scion 看 CI 的原始碼準備成本：每項工作需要多少檔案"
description: "Anthropic 公開 Scion 的內部架構。以 CI 的檔案需求、歷史查詢與驗證佇列拆解 Agent 產碼增加後的瓶頸，說明何時保留 Git、何時值得做服務端卸載。"
publishDate: 2026-10-14T11:24:00+08:00
updatedDate: 2026-11-05T22:50:00Z
draft: false
featured: false
tags:
  - AI 工程化
  - 軟體品質
  - 系統設計
series: AI Agent 工程化與工作流實戰
seriesOrder: 86
cover: ../../assets/covers/scion-source-control-checkout-budget.webp
coverAlt: "橘黑版畫中的大量紙片沿分流軌道進入整理槽，旁邊留有一條空的檢驗通道，象徵產碼流量與驗證容量必須分開規劃。"
---

CI 花十分鐘完成，其中六分鐘在準備原始碼，增加一個寫程式的 Agent，可能只是替佇列多排一件工作。這是教學用的假設場景。把排隊、checkout、依賴準備和測試分開計時，才知道增加並行度會幫上哪一步。

[Anthropic 在 2026 年 10 月 13 日公開 Scion](https://www.anthropic.com/engineering/redesigning-source-control)，說明如何把內部 monorepo 遷離 Git。新系統把歷史查詢、提交與合併放到伺服器，客戶端保留有上限的物件快取，按需要取得檔案。它假設客戶端能持續連線，適用的是大型 monorepo 工作負載。

這篇報導是內部工程案例。官方明確說 Scion 不適合一般用途的 Git 替代，還需要專用的 code review、搜尋與 CI。文章分享的是內部設計，沒有提供可直接安裝的公開 Scion 產品。

2026 年 11 月 5 日查核時，官方文章已註明 10 月 15 日補充技術先例。以下將來源中的架構說明與建議的 CI 試驗分開。沒有存取內部 Scion，也沒有量測讀者的 repository。本機只執行合成資料計算與隔離的 Git 小型案例。

## 把「CI 很慢」拆成可以判斷的數字

假設一個團隊每天啟動 500 個 job，每次取得 2 GB 原始碼，粗略資料搬運量就是每天 1,000 GB。這是十進位 GB 的邏輯讀取量估算，尚未計入壓縮、快取、重試與共享工作區。真實傳輸量應從網路邊界的觀測值加總，不能把工作樹大小當成網路帳單。

例如，以下 Python 3 範例只加總每次 attempt 實際從遠端收到的 bytes。資料全部是假設值：第一次抓取 2 GB、快取命中為 0 bytes、一次失敗嘗試收到 0.5 GB，重試再收到 2 GB。失敗嘗試也要算進去。

```python
def transferred_gb(attempts):
    total = 0
    for attempt in attempts:
        value = attempt["remote_bytes"]
        if type(value) is not int or value < 0:
            raise ValueError("remote_bytes must be a non-negative integer")
        total += value
    return total / 1_000_000_000

attempts = [
    {"job": "A", "attempt": 1, "remote_bytes": 2_000_000_000},
    {"job": "B", "attempt": 1, "remote_bytes": 0},
    {"job": "C", "attempt": 1, "remote_bytes": 500_000_000},
    {"job": "C", "attempt": 2, "remote_bytes": 2_000_000_000},
]
assert 500 * 2 == 1_000
assert transferred_gb(attempts) == 4.5
assert transferred_gb([]) == 0
```

每筆 attempt 在資料收集時必須有唯一識別值，避免重複匯入。若節點有共用快取，job 到節點與節點到遠端是不同的流量，應選定同一個邊界量測，不把兩者相加。

同一批工作，格式檢查可能只讀十個檔案，整合測試卻需要跨模組的 migration 與 fixture。讓兩者下載相同資料，付出的成本很容易混在「測試耗時」裡。

我會讓每個 job 留下四項紀錄：

- 準備原始碼與安裝依賴各花多久。
- 實際讀取哪些目錄，以及是否需要提交歷史。
- 測試開始前的等待時間。
- 結果所對應的精確 commit，以及重試次數。

至少觀察一個正常工作日與一次大量提交時段。若主要時間消耗在資料庫初始化，改版本控制系統並不會解決眼前瓶頸。

## 最小方案是減少搬運，同時保留工具需要的歷史

[Git 的 partial clone 文件](https://git-scm.com/docs/partial-clone)說明按需取得物件的設計。[sparse-checkout 文件](https://git-scm.com/docs/git-sparse-checkout)則處理工作樹呈現哪些路徑。partial clone 限制先下載的物件，缺少時仍可能連回 promisor remote。sparse-checkout 限制工作樹中的路徑，不保證物件已少下載。shallow clone 另外限制提交歷史，不能與前兩者混為一談。

以虛構的訂單服務為例，純文件檢查可以只準備文件目錄。需要比較基準版本的 migration 檢查，則必須能取得基準提交及差異。若工具依賴 blame、標籤或 merge base，縮小 checkout 前要把這些依賴列出來。

建議的驗證方式是：挑一批固定提交，同時用既有完整流程和縮小後流程執行，逐項比較輸出與失敗結果。不能只比較「兩邊都綠燈」，還要放入一筆刻意破壞跨目錄相依性的變更，確認精簡流程同樣會拒絕它。

本機合成 Git 案例保留 docs、排除 shared 目錄後，歷史與 diff 仍可查詢，但讀取 shared 中必要的測試資料會失敗。把 shared 加回後，原先刻意放入的錯誤資料仍在。這只驗證 sparse 路徑與測試前提，沒有測得傳輸量改善，也沒有涵蓋遠端 partial clone。

若精簡 checkout 讓必要的失敗案例消失，就停止推廣。缺檔應讓驗證失敗或回退完整流程，不能跳過測試後回報成功。

## Scion 的快取設計對應長期在線的客戶端

依同一份[官方架構說明](https://www.anthropic.com/research/redesigning-source-control)，Scion 的不可變物件沿節點 daemon、區域快取與權威伺服器取得。查詢可以直接透過 API 完成，需要工作樹的 job 才下載內容。這把客戶端資料準備工作移到持續運作的服務與快取，也讓連線和服務可用性成為前提。

官方公布的改善來自自家環境與舊 Git mirror 基礎設施的比較。checkout 變快、CPU／記憶體需求下降、整體 CI 容量改善，各有不同分母，不能合併成一個通用加速倍數。公開案例沒有替其他 repository 提供可重跑的同條件基準，因此這裡不把它當成採購或遷移承諾。

## 查詢可以卸載，驗證身分不能省略

有些 job 只想知道「這兩個提交改了哪些檔案」。為了回答這個問題，替它建立完整工作目錄未必划算。Scion 的服務端 API 思路可以轉化成更小的改動：由受控的 repository 服務提供查詢結果，執行測試的工作再取得必要內容。

這是工程建議，並非要求另造一套版本控制。代價是查詢服務的可用性與正確性會成為 CI 依賴。回應至少應帶上查詢使用的兩個 commit ID，而不是只寫 main 與 feature 分支名稱。分支會移動。同名不代表同一份輸入。

快取也應依不可變的版本識別值取用。把「最新差異」快取五分鐘，對文件預覽也許可接受，拿來判斷能否部署付款程式就需要另一套失效規則。若服務暫時不可用，回退完整流程和暫停工作各有成本，應事先決定，避免偷偷把查詢失敗當成沒有變更。

## 合併速度要服從可驗證的發布速度

Anthropic 說明其大量並行變更改採合併後與部署前的自動測試，並承認並行變更仍會互相衝突。這是該團隊的風險取捨，不能推成所有專案都適合取消合併前檢查。

假設工作 A、B 各自通過測試，但兩者合起來改壞同一項庫存規則，兩張綠色結果都不足以證明合併後的版本可部署。團隊必須明確說出：哪一個組合版本接受過測試，失敗時誰阻止發布，哪一份產物可以回復。

最小可行方案通常仍是維持必要的合併前檢查，部署前驗證精確候選版本。若吞吐量不足，先找可取消的重複工作與可分流的測試，再評估更複雜的投機測試或批次驗證。新增並行度後，要監看未驗證提交數與最舊待驗證時間，不能只看每分鐘合併數。

相關的[repository 品質門檻](/blog/anti-slop-software-factory-repository-gates/)與[執行收據](/blog/harness-execution-receipt-human-cost/)討論的是同一條責任線：產物增加之後，證據仍要跟得上。

## 下一步：選一個最浪費準備時間的 job

先替它記錄一週的 checkout、依賴準備、排隊與測試耗時，再寫下實際需要的目錄和歷史操作。做一個可回退的小型精簡試驗，保留同版本的完整流程作對照。

只有當這些手段仍無法滿足量測過的吞吐需求，而且團隊有能力承擔新的服務可用性與遷移成本時，才值得討論專用原始碼服務。試驗紀錄要保留同版本的正反例、傳輸量和耗時，讓下一次調整仍有可比較的基準。
