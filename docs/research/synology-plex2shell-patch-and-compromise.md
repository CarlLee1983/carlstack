# Synology Plex2Shell 來源查核（2026-11-09）

## 去重與出版決策

- 起點 main：`efe5e559f82392ec31a948a98a984a1915bf59ee`。以原始與正規化 URL、`Synology_SA_26_17`、穩定論壇 ID `942319`、Plex2Shell、Plex Media Server、Synology 與四個 CVE 搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md`，無同題。進行中工作亦無同題，GitHub open PR 查詢無 Plex 項目。
- 新文價值為 DSM 套件修補版與上游修補界線的對照，以及已暴露 NAS 的調查與共享資料權限盤點。11/8 是 Synology 公告首發，不能寫成新漏洞、首次利用或所有 Synology 裝置首次獲得修補。
- 既有「現代網路協定與 API 平台架構」順序為 1–29，本文接第 30 篇，內鏈 Alpine OpenSSH 文。整合前重新檢查 main 與系列。
- 現有 checkout 另有其他工作的 staged 檔案，本次使用獨立 checkout，不接觸那些變更。只提交本篇文章、必要封面與此來源記錄。
- `trail` 執行檔與 `.trail/cache` 均不存在，改依 repository 的 AGENTS、內容指南、schema、寫作 skills 及鄰近文章取得脈絡。

## 一手來源

1. https://www.synology.com/en-global/security/advisory/Synology_SA_26_17
   - Publish／Last Updated：2026-11-08 10:15:47 UTC+8。Severity Important、Status Resolved。
   - DSM 7.4／7.3：`1.43.5.11079-720011079` 或以上。DSM 7.2.2／7.2.1：`1.43.5.11079-700011079` 或以上。
   - 四個 CVE 的描述均以 Plex Media Server before `1.43.3.10861` 為範圍。Mitigation 欄為 None，正式稿不把暫時限制存取說成原廠修補替代方案。
   - `96656` 為管理者任意檔案寫入及載入執行；`96654` 為內部函式與 URL 處理；`96652`、`96655` 描述 SSRF。只保留防禦所需的機制概述，不轉載可執行 payload。
2. https://forums.plex.tv/t/important-security-update-for-plex-media-server-v1-43-2-and-earlier/942319/1
   - PlexInfo 2026-09-01 初始公告已要求 PMS 升至 1.43.3 或以上，NAS 套件管理器可能落後，可按裝置取得官方安裝包。
   - 同篇亦涵蓋 Plex Desktop 1.115.0，但本篇僅討論 Plex Media Server；不混用 Desktop 修補版。
3. https://forums.plex.tv/t/important-security-update-for-plex-media-server-v1-43-2-and-earlier/942319/3
   - PlexInfo 2026-10-19 更新。完整漏洞鏈可讓未驗證遠端攻擊者以 PMS 行程權限執行程式；`1.43.3.10861` 及以後不受影響。
   - 10/16 公開 PoC，原廠於 10/19 已明確確認廣泛利用、挖礦及代理濫用；沒有以 11/8 作為首次利用日期。
   - 保留版本查核、可疑行程／Codecs 程式庫／CPU／網路線索、乾淨重建、登出所有裝置／改密碼、服務帳號可及資料等防禦建議。沒有觀測到特徵不等於排除入侵。

## 描述差異與邊界

- `96652`：Synology CVSS `PR:L`，Plex 描述為 unauthenticated SSRF。正式稿明示差異，完整鏈風險採上游明確說明，不宣稱已獨立裁決單項評分。
- `96655`：Synology 描述已驗證 SSRF，Plex 描述鏈中的 admin token disclosure 效果。兩者保留來源歸屬，不自行把它們當成互斥結論。
- `96656` 的單項管理權限條件，不可擴大成整條鏈須預先有管理權限。
- 上游安全版本與 DSM 套件版本分開判讀。不把先前手動裝上游修補版者列為仍受影響，也不假定未列出的 DSM 分支可用同一包。
- 未登入任何 NAS、未執行漏洞 PoC、未在受影響主機做修補測試。盤點、備份、存取限制、功能測試與調查分工是作者的工程建議。

## 封面方向與驗收

對照 Alpine 的薄荷綠／象牙白紙雕城門，以及 NetScaler 的黑白版畫城門。新封面使用掀蓋 NAS、黏土與陶瓷微縮攝影、俯視斜角近景、陶土橘／深紫、局部檢查燈，媒材、構圖、配色均不同。僅沿用橫向比例，不沿用城門圖像。

使用內建 image_gen 生成，第一次意外出現標題文字，已再以同工具移除所有文字。最終 1600×900 WebP，完整圖與卡片尺寸檢視無文字、商標或浮水印。封面為概念視覺，不宣稱為 NAS 硬體結構圖。

## 編輯與技術驗收

依 humanize-writing 及繁體中文參考逐段人工審稿，再執行 checker。標題採「Synology Plex2Shell 漏洞與修補」，遵守簡短自然、說明主題的要求。版本號、CVE 與 URL 保留原始字串。沒有新增 Mermaid 或正文 SVG。

使用 Node 24.22.1、pnpm 12.1.0，已完成 `pnpm install --frozen-lockfile`，lockfile 未變。其餘 gate、production build 與正式部署驗收於成稿後執行。

- 獨立內容審閱已通過，重新讀取兩家原廠頁面並核對版本與日期。humanize checker 的 6 項皆為 DSM／CVE 清單欄位冒號，符合合法標籤用法，逐項審核後保留。
- 瀏覽器桌面／320 px／深淺色視覺預覽受限：Chromium 使用獨立可寫 profile 仍因 `socket() failed: Operation not permitted` 退出，沒有關閉 sandbox 或修改安全設定。dev 指令回報啟動後，本機 HTTP 仍無法連線。封面已直接檢視，頁面改以 production HTML、圖片及索引驗收，不能聲稱完成互動與響應式視覺測試。
