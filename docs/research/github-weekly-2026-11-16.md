# GitHub 週報 2026-11-16 查核

- Asia/Taipei 2026-W47，系列第 3 篇。最新 main 起點 d1da8ec；核對 blog、research、queue、近期 commits 和公開 open PR（空），未發現同週稿件。
- 已讀 AGENTS、content-guide、schema、deploy workflow、copywriting、humanize-writing 及繁中參考規則。trail 指令與 cache 不可用，直接讀取所需檔案。
- 文章標題只說明內容，依使用者最新回饋，不套用抽象結論型標題。

## 榜單

來源 https://github.com/trending?since=weekly 。2026-11-16 08:59:49 Asia/Taipei（00:59:49 UTC）取得官方 HTML，HTTP 200；搜尋工具無法讀取，未以搜尋摘要替代。頁面為全語言、Spoken Language Any、This week，沒有精確週期起訖。原始 HTML 在本次工作區快照，以下保留原始排序及精確星數（累積／本週新增）：

1. meta/astryx：28,866／13,501。
2. anthropics/skills：195,367／6,077。
3. sherlock-project/sherlock：112,485／10,412。
4. backnotprop/plannotator：11,839／1,719。
5. vercel-labs/agent-browser：51,626／4,217。
6. ZhuLinsen/daily_stock_analysis：72,508／4,548。
7. we-promise/sure：15,714／4,556。
8. milind-soni/OpenMausBot：23,411／5,463。
9. google/elephant-goldfish-model：19,772／5,060。
10. google-deepmind/mujoco：18,073／1,922。

依正規 URL、owner/repo、GitHub repo metadata、主題搜尋。Skills 和 OpenMausBot 重複上榜，保留真實排名並連結上期。沒有另複製深度文。封面累積值依序為 28.9k、195.4k、112.5k、11.8k、51.6k、72.5k、15.7k、23.4k、19.8k、18.1k。

## 來源與段落對應

各項官方原文連結保留在文章對應段落。11/16 另讀 README、LICENSE、近期 release 與下列文件；release 日期採 UTC。未安裝或實測十項工具，不把維護者說法寫成親測。

- Astryx：Core README 核對 React 19、CSS、CLI 寫入指引；v0.7.16 11/14 核對錯誤提示時機，MIT。Beta 與 canary 不當穩定承諾。
- Skills：skill-creator 的測試及人工評估流程；根 LICENSE 不存在，不推定整庫一致。docx/pdf/pptx/xlsx 的 LICENSE.txt 均核對 Apache-2.0。無 GitHub release。
- Sherlock：README、網站驗證測試、v0.16.0 誤判排除說明及最新 v0.16.2（9/8），MIT；同名不構成身分確認。
- Plannotator：README 遠端 hook server 0.0.0.0 無登入，v0.28.65 11/15 Tailscale 帳號限制不延伸成所有入口認證；MIT OR Apache-2.0。
- agent-browser：README ref 更新規則、security opt-in 控制、v0.43.0 11/12 同名控制提示與分頁關閉錯誤；Apache-2.0。
- Daily Stock Analysis：full-guide 資料源與費用限制、v3.34.0 11/9 timeout 與 VIX 評分；MIT，非投資建議。
- Sure：Docker 文件備份與 SECRET_KEY_BASE 保留；v0.7.6-hotfix.1 11/12 與 11/14 alpha 區分，AGPLv3。
- OpenMausBot：MCP、LICENSING、enterprise/LICENSE、v0.1.161 11/15；核心 Apache-2.0、企業另授權，排程重試與檔案交接。
- EGM：harnesses 的不同隔離層次、v0.1.1 11/6，Apache-2.0；不繼承對話不能等同排除宿主指引檔。
- MuJoCo：VERSIONING、4.0.1 11/11 求解器修正、Apache-2.0 程式與 CC BY 4.0 文件；跨版本數值不保證重現。

## 封面與文稿

上期為深綠蝕刻等高線、暖白襯線字與金框。本期改淡紫紙張、剪紙邊角、黑色無襯線字與朱紅名次，媒材、配色、構圖均不同。保留 16:9 與雙欄排名。

正式 imagegen 生成，再用同工具把文字縮至中心安全區；未用程式補字。WebP 1600×900 約 202 KiB。全尺寸、1:1 中心裁切、4:3 卡片均人工逐項核對，左 1–5、右 6–10，名稱及十個 k 值正確。卡片小字提供識別，精確整數在正文。

humanize-writing 檢查器 13 項均是冒號：10 個具名小標與 3 個具體說明，逐句審查保留，沒有抽象翻案或口號式標題。

## 驗收

- pnpm 12.1.0 frozen install 完成，未修改 lockfile。Corepack 的預設 cache 路徑不可建立，改使用工作用 `/tmp` cache。
- 本機 dev 以工作用 XDG_CONFIG_HOME 啟動仍回報 `Dev server process exited before becoming ready`。因此桌機、手機、深淺色實頁目視未完成，未繞過限制。圖片本身已目視。
- 最終 format、stage-only、content policy、check（含 production build）、test，以及文章/RSS/Sitemap/Pagefind/系列輸出依發布收據記錄；部署須核對精確 main commit，尚未用 commit 成功代替上線。

初輪型別檢查通過，production build 在圖片轉檔第 112/2532 項被系統終止（exit 137）；與同時進行的系統設計工作協調串行重跑，沒有減少圖片、跳過檢查或改測試。獨立執行單元測試 117/117 通過。

穩定 repository ID 依排名：1131202426、1061953414、162998479、1123956658、1132001614、1131513930、1024661423、1331261687、1368596582、400501136。

第二輪建置遇到 /tmp 的 4.9 GiB tmpfs 滿額，影像轉檔出現 ENOSPC，即使程序回傳成功也未視為驗收通過。只清除本工作可重建的 dist 與 Astro cache，將本工作 clone 移至空間充足的工作根目錄，再完整建置。合併遠端 main 0d84c8139f66dccdaef2fcd986cf48df0cf61a92 後重驗，保留另一篇系統設計文章。
