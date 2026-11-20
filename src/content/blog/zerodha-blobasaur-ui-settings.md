---
title: "Zerodha 用 SQLite 儲存使用者設定"
description: "從 Blobasaur 的分片與 tmpfs 基準出發，區分寫入入列、交易提交與斷電後可恢復，決定哪些介面設定適合採用。"
publishDate: 2026-11-20T10:03:41+08:00
draft: false
featured: false
tags: [資料庫, 系統設計]
cover: ../../assets/covers/zerodha-blobasaur-ui-settings.webp
coverAlt: "木框裡分成四格，各自收納不同顏色的半透明版面卡片。"
---

忘了上次調整的圖表位置，使用者可能得重排一次；少了一筆已確認的成交，卻不是重排畫面就能補救。這個區別決定了 Zerodha 怎麼用 SQLite。它把 Kite 的圖表配置、指標模板與工作區偏好交給 Blobasaur，不拿同一套儲存設計處理交易資料。[Zerodha 工程文章，2026 年 11 月 19 日](https://zerodha.tech/blog/high-performance-distributed-blob-storage/)

如果你的服務也在反覆覆寫整份介面設定，先決定使用者看到「已儲存」時，哪一種故障仍允許這筆變更消失。答案比選幾個 SQLite 分片更重要。

## 分片讓不同的寫入不用排同一條隊

SQLite 的 WAL 模式讓讀取與寫入可以並行，但每個資料庫檔同一時間只有一個寫入者。Zerodha 的介面設定約有一半請求是寫入，因此 Blobasaur 將 key 分散到多個 SQLite 檔；每個分片用一個寫入工作將多筆操作合成一次交易。這讓不同分片能同時寫，也分攤同一分片內每次提交的成本。[SQLite WAL 文件](https://www.sqlite.org/wal.html)｜[Blobasaur 原始碼與說明](https://github.com/iamd3vil/blobasaur)

分片並不會讓單一熱門 key 的寫入並行。假如慢的是某一份設定被大量同時覆寫，加分片前，應先看各分片的排隊時間與熱門 key 分布。寫入明顯偏在同一處，平均吞吐量就容易掩蓋那批使用者遇到的延遲。

## tmpfs 測到的是寫入競爭，不是磁碟承諾

Zerodha 在同一台 16 核心筆電上比較 1 與 16 個分片。測試使用 64 條並行連線、10 萬個 key、約 64 KiB 的 JSON 請求、每批最多 50 筆，且應用層等待寫入完成再回覆。兩組的總快取與讀取連線數相同，資料目錄放在記憶體檔案系統 tmpfs。純寫入從 **7,740 增到 25,324 次／秒**，p99 從 10.7 降到 8.3 毫秒；純讀取吞吐量則接近。[Zerodha 基準測試](https://zerodha.tech/blog/high-performance-distributed-blob-storage/)

這組數字可用來判斷寫入者競爭有多大，不能拿來估實際磁碟同步成本、主機重啟後的資料損失，或你的正式流量上限。Zerodha 另外公布三節點部署在一個交易時段的整體指令 p99 約 2 毫秒，那是其自報的線上觀察，不是同一個測試。若要估容量，應在目標磁碟、同步設定和預期讀寫比例下，用代表性的資料量、壓縮率及長尾負載重新量測。

## 把入列、提交與主機故障分開驗收

Zerodha 說明生產分片使用 WAL 與 `synchronous=NORMAL`。SQLite 已提交的交易可跨應用程式崩潰保留；但在作業系統崩潰或斷電時，尚未同步到儲存裝置的近期提交可能回滾。若改成 `FULL`，SQLite 在 WAL 模式下每次交易提交會多做一次同步；這不等於有異機副本，也不能防止整顆磁碟遺失。[SQLite 同步設定](https://www.sqlite.org/pragma.html#pragma_synchronous)

Blobasaur 還有選用的 `async_write`。開啟後，回覆成功只表示寫入進了記憶體佇列。讀取能先從待寫資料拿到新值，不代表資料已提交；程序若在提交前退出，重開可能拿不到這筆已回覆的更新。官方基準等待寫入完成，不應把它解讀成開啟非同步寫入的結果。[Blobasaur 設定範例](https://github.com/iamd3vil/blobasaur/blob/b4d8512f3fc662005858b52fbc36d078c6150fb0/config.example.toml)

以可重建的版面偏好為例，可先用等待提交的模式，在實際磁碟量測，再依損失預算決定是否接受 `NORMAL`。若產品只承受得起「這次還沒確認的變更消失」，就不要讓入列回覆冒充已儲存；也不能只用重啟程序的結果證明斷電安全。跨機選用上，Zerodha 說明節點的 slot 配置是靜態的，尚無自動故障切換；部署三台不等於每筆資料有三份可用副本。

## 用最後一次「已儲存」決定要不要上線

先挑一種可重建的偏好，例如圖表面板位置。用合成資料為每次變更加上版本，記下每筆回覆，再分開測試程序停止與隔離測試主機突然重啟。恢復後逐筆對照：最後保住哪次已確認變更、少了幾筆、還能不能正常儲存新變更。若目標環境不能模擬主機或儲存故障，就把該情境列成未驗，不以程序重啟替代。站內的 [SQLite 還原演練](/blog/sqlite-backup-restore-rto-rpo-drill/)示範了如何把時間目標與遺失的已確認寫入分開報告。

本文未執行 Blobasaur 壓測或故障演練。發布前，**先寫清楚哪些已確認變更允許遺失，再要求測試證明損失沒有超過那個範圍。** 如果答案是零，不能憑 tmpfs 吞吐量或這個 UI 設定案例，就把帳務、成交、訂單承諾或稽核紀錄移進同一方案。
