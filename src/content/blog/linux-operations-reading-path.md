---
title: "主機與 Linux 維運：從看懂資源到確認服務恢復"
description: "以安全指令練習、主機資源診斷與服務驗收串起 Linux 維運閱讀路線，連回 CPU、記憶體、I/O 與網路原理，而不是背完命令就直接操作正式機。"
publishDate: 2026-10-31T17:15:00+08:00
draft: false
featured: false
tags: [Linux, 系統設計]
series: 主機與 Linux 維運
seriesOrder: 1
cover: ../../assets/covers/linux-operations-reading-path.webp
coverAlt: "米白工作檯上的藍色主機概念拆解，分開呈現計算、記憶體與儲存元件。"
---

Linux 指令圖卡適合喚起記憶，卻不會告訴你這次應不應該執行。`free` 的剩餘數字、`top` 的 CPU 百分比、`df` 的使用率，都需要觀測範圍和工作負載才有意義。這個專題從安全操作開始，接著練習把輸出變成可驗證的判斷。

專題沿用 CarlStack 的系列入口，不另外造一套分類系統。既有 CPU、虛擬記憶體、Linux I/O 與網路文章保留原系列，這裡只把適合的閱讀順序接起來。

## 先學指令會改到什麼，再學怎麼排障

第一站是 [Linux 基本指令：在練習目錄完成查找、權限與程序操作](/blog/linux-basic-commands-safe-workspace/)。用自己建立的暫存目錄走過 `ls`、`cd`、`mkdir`、`cp`、`cat`、`grep`、`chmod`、`ps`、`kill`、`rm`。每次操作都有範圍與預期結果，不對正式日誌、資料庫或既有服務試錯。

讀完後應能回答：我現在在哪裡？這行指令只會讀取資料，還是會覆寫、改權限、送訊號或刪除？沒有輸出代表成功，還是查錯範圍？如果這三件事還不確定，就先停在練習環境。

第二站是 [Linux 主機突然變慢：先分清 CPU 排隊、記憶體壓力與磁碟等待](/blog/linux-slow-host-diagnostic-sequence/)。把命令放回一個虛構 API 變慢的情境，分開觀察容量、活動與等待。每個新觀察都應協助排除一個假設，工具數量本身不是成果。

## 輸出看不懂時，回到資源原理

CPU 使用率升高，不一定能靠增加執行緒改善。先讀 [CPU 快取、False Sharing 與記憶體屏障](/blog/cpu-cache-false-sharing-memory-barriers/)，理解多核心程式為什麼可能花時間在協調與資料搬動。這是分析應用行為的背景，不是僅憑主機圖表就能斷定的根因。

看到 page fault 或記憶體用量時，接著讀 [虛擬記憶體、MMU 與 Huge Pages](/blog/virtual-memory-mmu-page-fault-hugepages/)。頁面不在目前映射或實體記憶體中的情況，需要更細的分類；不能把每次 fault 都說成磁碟讀取，也不能看到快取用掉 RAM 就急著清空。

連線數很多但請求仍慢，可以讀 [Linux I/O 多工：select、poll 與 epoll](/blog/linux-io-multiplexing-select-poll-epoll-architecture/)。事件通知機制解決的是等待與通知方式，不會替你消除慢查詢、下游等待或工作佇列塞住。

## 主機正常，不代表使用者的請求正常

如果主機資源沒有明顯壓力，要沿請求路徑查，而不是反覆重啟服務：

- [從 URL 到頁面呈現的網路路徑](/blog/url-to-page-render-network-deep-dive/)：把 DNS、連線、TLS、HTTP 與瀏覽器處理拆開。
- [TCP、UDP 與 QUIC 的取捨](/blog/tcp-vs-udp-vs-quic-transport-protocols/)：辨識傳輸層問題與應用重試的邊界。
- [TLS 憑證驗證排障](/blog/tls-certificate-verification-debugging/)：先核對信任與名稱，不把關掉驗證當作修復。
- [分散式系統可觀測性](/blog/distributed-system-observability-p99-tracing-slo/)：用延遲分布、錯誤率與追蹤連回使用者受到的影響。

這些文章提供原理與深入方向，不表示本系列已經完成所有服務維運、安全強化或災難復原教學。未來補入新章時，再依實際內容安排位置；不把未寫的題目當成已完成的課程。

## 每次操作都留得下驗收依據

建議維運筆記至少記下觀察時間、主機或容器範圍、受影響的請求、支持假設的指標、這次改了什麼，以及復原後的完成量。只寫「重啟後好了」，下次仍然無法判斷是程式狀態、外部依賴，還是工作負載剛好下降。

現在先完成基本篇的隔離練習，再替你熟悉的一個 API 寫一句驗收條件：相近請求量下，哪個延遲、錯誤率和完成量能證明服務已恢復？不必先假定自己已經通過任何能力測驗。

專題起點來自 Securebydefault.io 的[主機排障圖卡](https://www.facebook.com/reel/2100049957275876)與 Afzal Web Solutions 的[十個 Linux 命令圖卡](https://www.facebook.com/reel/1059228207136968)。圖卡提供選題線索；命令語義與限制以各篇連結的工具及核心文件查核。
