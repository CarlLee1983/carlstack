# Zerodha Blobasaur：來源與發布查核

查核：2026-11-20，Asia/Taipei。

- https://zerodha.tech/blog/high-performance-distributed-blob-storage/ ，Sarat Chandra，2026-11-19。讀原文，對照服務資料類型、SQLite 分片、同步提交基準、耐久性、靜態 slot 與無自動切換、線上延遲。基準全在 tmpfs；不是磁碟故障測試。應用同步回覆與 SQLite PRAGMA 同步設定是兩個層次，原文沒有明示基準 PRAGMA，稿件未替它補寫。
- https://github.com/iamd3vil/blobasaur ，查閱 HEAD `b4d8512f3fc662005858b52fbc36d078c6150fb0` 及 README、config.example.toml。範例把 async_write 打開，但欄位預設為 false，不能由範例推斷正式環境配置。原文生產模式使用 NORMAL，未推定是否開啟 async_write。
- https://www.sqlite.org/wal.html ：一檔一寫入者及 WAL 提交／checkpoint。
- https://www.sqlite.org/pragma.html#pragma_synchronous ：WAL+NORMAL 與 FULL、應用程序崩潰與主機崩潰分界。不能把 FULL 解讀為跨機保證。
- 內鏈 /blog/sqlite-backup-restore-rto-rpo-drill/ 已查 main 與正式頁。舊文做合成訂單備份／還原實驗；本篇處理可重建 UI 資料的寫入承諾、分片與基準，不重複。另有 Pi Durable 稿涉及 Agent 狀態恢復，非本篇核心。
- 截至查核 CarlStack main `21206de17211d729fd175965381d43f9f7c549ba`；完整 tree 無 Blobasaur/Zerodha 命名，佇列無此題，無 open PR，正式站索引搜尋未見此題；GitHub 針對 Blobasaur、主來源 slug、repo 和作者均 0，但 incomplete_results=true。轉入 repo 前仍應以最新 checkout 對這些字串搜尋 src/content/blog、docs/research 與佇列。公開 tree 無 Trail cache、當前工作環境無 trail 命令。

- 正式封面由原創生圖工具產生，再轉 WebP 1440 × 810（145,554 bytes）；已目視全尺寸構圖及 320 × 200 模擬置中裁切。
