# Alpine OpenSSH 公告查核（2026-11-06）

## 來源與取捨

- 主來源：https://alpinelinux.org/posts/2026-11-05-openssh-password-authentication-bypass/ ，2026-11-05。已逐項核對非 PAM、PasswordAuthentication、`*` 帳號、另一個 `$5$`／`$6$` 雜湊、套件回補版本、重啟與 tiny-cloud 條件。
- 上游：https://www.openssh.org/releasenotes.html#10.6p2 ，2026-11-05。只使用 critical workaround、musl 與非 PAM 範圍等與本次事件相關內容。
- musl 維護者：https://www.openwall.com/lists/musl/2026/11/05/4 。保留與 OpenSSH 對根因歸屬的不同說法，未將歸責爭議寫成技術定論。
- CVE CNA JSON：https://cveawg.mitre.org/api/cve/CVE-2026-123158 。state=PUBLISHED，datePublished=2026-11-05T15:46:26.488Z，dateUpdated=2026-11-05T21:06:39.062Z。Alpine 初版公告的「尚無 CVE」已過時，正式稿使用已登錄狀態。不採用二手文章的未分配說法。
- 指令語義：https://man.openbsd.org/sshd ，`-T`、`-C` 與 `-t`。指令是授權主機上的防禦盤點／修補流程，不包含攻擊重現。

## 內容去重與系列

起點 main 為 48a6176767d90fff58504c0bef0ca83725b8e07d。完整 src/content/blog、docs/research、docs/article-queue.md 未有 Alpine、OpenSSH 或 CVE-2026-123158 的同題文章。既有 NetScaler 文只作事件應變內鏈。「現代網路協定與 API 平台架構」既有順序 1–27，本篇接 28；發布整合前須再次檢查其他同時進行的文章。

## 封面方向

鄰近文章封面是金屬槽位的近距離 3D 視覺，金／深藍配色與戲劇光。本篇使用白色紙雕城門及星形破口，紅色修補片，對角線構圖、薄荷綠／象牙白、柔和日光。在媒材、構圖、主色、光線四個面向區隔。

使用正式 image_gen 生成。最終 1600×900 WebP，封面與縮圖檢查無文字或商標；圖像是概念隱喻，不作為漏洞機制圖。

## 技術檢驗範圍

文章指令已作 shell 語法檢查，套件門檻逐項與 Alpine 官方公告比對。未在 Alpine 主機執行、未進行 exploit 重現，不把編輯環境的站台檢查寫成漏洞修補實測。異常日誌查詢只產生候選紀錄，不能證明未入侵。

預覽已嘗試啟動 dev server 與 headless Chromium。Chromium 因 sandbox socket() Operation not permitted 及唯讀 Crash Reports 路徑退出，未取得桌面、320 px、深淺色頁面截圖；未放寬安全設定繞過。依任務允許，記錄此環境限制並繼續其餘驗收。
