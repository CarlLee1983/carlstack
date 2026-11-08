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

## 2026-11-08：GreyNoise 成功利用觀測更新

- 來源：https://sshole.events.greynoise.io/ 。查閱時間為台北 2026-11-08 上午；採用頁面標示 `08 November 2026, 01:51 UTC` 的快照。首次成功利用列為 `2026-11-07 00:46:51 UTC`，換算台北 `2026-11-07 08:46:51 +08:00`。成功利用是脆弱 gridpoint 上執行 OS commands，公開清單首筆可見 `id` 及 OS 資訊查詢。
- 快照列出 13 條成功利用鏈。計數定義按同一 gridpoint 的 host sessions 串接，相鄰間隔不超過 30 分鐘。這不是受害組織、攻擊者或全球攻擊數；不計算全網成功率，也不把首次感測時間當成全球攻擊起點。
- `How TAC Agent Works` 段明示 LLM-generated analysis。未取得原始 host telemetry、未獨立分析 implant，正式稿不採用其能力與攻擊者意圖推論，不轉載可執行攻擊鏈。
- 重新核對 Alpine 公告和 OpenSSH 10.6p2 release notes，現有受影響條件、分支套件版本與重啟要求未變。新增的緊急修補、保留歷史日誌建議標成作者判斷。
- 依原始／正規化 URL、CVE 與既有 slug 搜尋 blog、research 與 queue，確認更新既有文章。保留 `publishDate: 2026-11-06T10:01:21+08:00`、URL、封面、現代網路協定與 API 平台架構第 28 篇，設定真實更新時間，不新增文章或系列。
- 獨立 checkout 起點 `38c50957fb186528f59a12e4a8fcf825403ab7bb`，已對照 GitHub main 與 tree `f43e08177e19b1018f4792d7ec0e18d41900e90c`。環境沒有 trail 可執行檔或 `.trail/cache`，依可用檔案檢視 AGENTS、內容指南、schema 與鄰近文章。
- 使用 repository 的 carlstack-copywriting、humanize-writing 與繁體中文／敘事規範逐段編輯，保留原有操作指令，檢查新增段落的觀測範圍、時間與語氣。
- 本次 headless Chromium 預覽使用獨立 `/tmp` profile 後，仍因 `socket() failed: Operation not permitted` 退出，未取得桌面／320 px／深淺色截圖；沒有關閉 sandbox 或修改安全設定。既有封面已直接檢視，未改動圖形或版面，部署後另以正式 HTML、圖片與索引驗證內容。
- 獨立逐項審閱已核對 13 條表格紀錄、時間換算、計數範圍與 LLM 標示。humanize checker 唯一命中為既有「異常登入」，語境指 anomalous login，並非程式例外，故保留。
