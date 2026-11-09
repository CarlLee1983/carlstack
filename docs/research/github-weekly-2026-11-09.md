# GitHub 熱門專案週報：2026-11-09 查核

- 文章：`src/content/blog/github-weekly-2026-11-09.md`。
- Asia/Taipei 週次：2026-W46，系列第 2 篇。上期 2026-11-02 為第 1 篇。
- 基準 main：`89f998832c5e80e8b1d2f25b3b6aaa7535ce7e25`；精確 SHA 部署 run `42539918878` 成功。
- 開始前查核 blog/research/queue、近期 commits 與開啟的 PR，未找到本週週報，不建立同週第二篇。
- 已讀 AGENTS、content-guide、schema、astro config、deploy workflow、copywriting 與 humanize-writing。`trail` 指令與 `.trail/cache/INDEX.md` 不可用，直接讀取必要檔案。未修改站台程式或設定。

## 官方榜單快照

來源：https://github.com/trending?since=weekly 。正常雲端瀏覽器於 2026-11-09 00:59:45 UTC／08:59:45 Asia/Taipei 讀取，確認 Spoken Language Any、Language Any、This week。搜尋工具同 URL 讀取失敗，未採用搜尋摘要或替代排名。官方未標精確週期起訖，不推定自然週。

依當次頁面原始順序，欄位為累積 stars／stars this week：

1. NVIDIA/auto-ontology：10,396／9,327。
2. thedotmack/claude-mem：114,903／6,443。
3. max-sixty/worktrunk：12,121／2,313。
4. anthropics/skills：189,656／3,169。
5. Donchitos/Claude-Code-Game-Studios：37,010／5,235。
6. milind-soni/OpenMausBot：18,263／7,621。
7. pingdotgg/t3code：52,504／15,379。
8. Nutlope/hallmark：50,970／6,356。
9. Renhuai123/ziwei-doushu：16,964／4,191。
10. D4Vinci/Scrapling：99,887／8,342。

保留官方排序，不依任一星數重排。k 值為除以 1,000、四捨五入至一位小數、移除 .0：10.4k、114.9k、12.1k、189.7k、37k、18.3k、52.5k、51k、17k、99.9k。

## 一手文件查核

11 月 9 日讀完整官方 README、授權與近期 release，再讀與工程使用相關的官方文件。資料查核可能晚於榜單擷取，T3 nightly 發布於 01:00:20 UTC；文章已分開說明時間，release 日期統一用 UTC。各項精確來源連結保留於正式文章。未安裝十項工具，未重跑效能或安全測試，建議試用情境屬作者工程判斷。

- Auto Ontology：業務語意認證、SQL provenance、connections 與 MCP。Apache-2.0，無 GitHub release。內部後端信任轉送身分、ingestion 端點沒有自己認證，3001/3002 須私網；UI 連線未完整設定 Vault 為 catalog 明文密碼，選配 Kumo 涉及資料上傳。
- Claude-Mem：hooks、observer、SQLite/Chroma 與分層檢索。Apache-2.0 公開核心、私有 hosted/team/enterprise 分界。v15.12.0 預設本機影像保留，停用不刪舊圖；雲端同步與影像推論分開。v15.12.1 11/8 22:09 UTC。
- Worktrunk：worktree、hooks 與合併清理。MIT OR Apache-2.0。v0.81.0 10/20，stdin JSON context 移除，hooks 可能競爭、清理可移除忽略檔案，不把工作樹當整體安全沙箱。
- Anthropic skills：skill-creator 與 PDF skill 文件。四項 docx/pdf/pptx/xlsx 各自 LICENSE.txt 均已確認 Apache-2.0，不沿用舊 source-available 說法。無根 LICENSE，依資料夾核對，無 release。
- Game Studios：範本、可調流程嚴謹度與實際遊戲驗證，非自主工作室。MIT，v1.2.0 10/19。根目錄啟動、Python/Bash 與宿主 permission mode 會影響 hooks，文字 ask-first 不是強制阻擋。
- OpenMausBot：harness/事件與執行環境。Apache-2.0 核心，enterprise 有 production key 與再散布限制。CLI 金鑰明文，local-first 仍有外部模型與服務。v0.1.149 11/8。
- T3 Code：permission-modes/remote-access。初始 Full access，改預設不改既有對話；依權限原檔保留 Claude/Antigravity 原生核准例外與 fx 無此模式的限制。MIT，穩定 v0.1.7 11/4，nightly v0.1.8-nightly.20261109.4392 為預覽，不混用功能。
- Hallmark：完整 SKILL 的 Floor/Reflex/Finish 與 before/kept。MIT 程式，照片各自授權；無 GitHub release，v2 只是文件/技能版本。
- Ziwei：日期規則與資料版本。MIT code、CC BY 4.0 dataset、引文另有非商業與原權利人限制。v4.0-13d 10/15 是 dataset，不是目前引擎版本；公開 demo 缺少 AI 後端。確定性不構成占星有效性證據。
- Scrapling：RAG 與 MCP 文件。BSD-3-Clause，第三方內容另計。v0.5.1 11/4 有 remote sessions API breaking change；MCP 可寫入、重用登入與讀取網路資料，非唯讀工具。未將反爬能力寫成存取授權。

## 封面與人工審稿

參照上期象牙白、黑與鈷藍的平面排版，本期選深綠、暖白、橘色、蝕刻等高線背景與置中資訊框。保留 16:9 與雙欄排名，配色、背景媒材、框架構圖改變。正式圖片工具生成後，針對中心安全區編修一次，未以程式重寫文字。

最終封面 WebP 1600×900；左 1–5、右 6–10。已逐項核對名稱、原始順序和上述十個 k 值，檢視全圖及 1:1、4:3 中心裁切，所有文字未裁切。小縮圖提供主題辨識，正文保留可讀整數。格式轉換僅縮放與壓縮。

依 humanize-writing 完成結構與逐句審稿，中文檢查器命中 13 個冒號，均為欄位、具名專案小標或有具體內容的條列引言，保留原義。沒有把乾淨掃描當成文稿品質證明。

## 技術驗收

使用 repository 要求的 pnpm 12.1.0。首次 offline frozen install 因缺少套件 metadata 失敗，改一般 `pnpm install --frozen-lockfile` 並使用既有 store 後成功，未改 lockfile、依賴或停用供應鏈檢查。

本機 dev 首次因預設 Astro 設定目錄不可建立而退出，改用工作用 XDG_CONFIG_HOME 後仍回報「Dev server process exited before becoming ready」。本機整頁桌面與手機預覽未完成，按本次授權記錄環境限制並繼續其他必要驗收。

最終 format、policy、check、test、production build、文章/RSS/Sitemap/Pagefind/系列驗證，以及提交後精確 SHA 部署與正式頁面驗證，另由發布收據記錄，不把研究完成當作上線。
