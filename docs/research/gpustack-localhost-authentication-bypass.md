# GPUStack localhost 驗證繞過來源查核（2026-11-10）

## 去重與出版決策

- 基線 main `11772b1a698c631340ee98d36836b258e1ce24af`。原始／正規化 URL 相同，穩定 ID `GHSA-gj9m-f8ph-pmhr`、`GHSA-mg63-h38w-8p9p`、CVE、GPUStack／FreeSWITCH 搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md` 均無重複。fetch 全部 18 個遠端分支後，逐一 git grep 同樣無命中。
- 本次優先 GPUStack：自架推理平台與 reverse proxy 的身分誤信直接適用本站工程讀者，可提供版本、設定、負向驗收及持續憑證調查。FreeSWITCH 已完成初步原廠核實，另報後續候選，不把兩個不同入口混成泛用漏洞摘要。
- 整合基線為 `2eec8077cd301f323570c962e4fbe6aaf60ef937`。完整 YAML 解析發現既有 Go JSON v2 與 Alpine 均為第 28 篇，先前文字搜尋漏了帶引號的 series。按原發布順序保留 Go 為 28，僅把 Alpine、SonicOS、Synology、GitHub Actions logs 的 seriesOrder 改為 29–32，本篇為 33；既有文章正文與 publishDate 不變。同步更正 logs 查核紀錄，無程式或站台設定變更。
- `trail` 執行檔與 `.trail/cache` 均缺少，改讀 AGENTS、content-guide、content schema、deploy workflow、copywriting／humanize-writing skills 及鄰近已發布資安稿。隔離 checkout，僅本篇文章、封面及查核檔。

## 一手證據

- https://github.com/gpustack/gpustack/security/advisories/GHSA-gj9m-f8ph-pmhr
  - 公開日期 2026-07-31。CVE-2026-102895，受影響 `<2.2.0`，修補 `2.2.0`。預設 `force_auth_localhost=False`，同機代理 TCP peer 或客戶端可控制 real-IP header 導致 loopback 自動管理員。公告明確觀測 v2.1.1 已被利用。
  - 只概述防禦所需條件，沒有重刊執行 payload、reverse shell 或自訂 backend 攻擊命令。
- https://raw.githubusercontent.com/cisagov/kev-data/main/known_exploited_vulnerabilities.json
  - CISA 官方資料 catalogVersion `2026.11.09`，GPUStack／FreeSWITCH dateAdded 均為 `2026-11-09`、dueDate `2026-11-12`、forensicTriage `Yes`、knownRansomwareCampaignUse `Unknown`。CISA 主站讀取 403，官方 GitHub 資料可讀。正式文沒有把 catalog dueDate 說成所有讀者的法定期限，也未把 Unknown 寫成無勒索使用。
- https://github.com/gpustack/gpustack/blob/v2.1.1/gpustack/api/auth.py
  - `client_ip_getter` embedded 讀 `X-GPUStack-Real-IP`，其他分支取 `request.client.host`；`get_current_user` 在無使用者、IP 為 127.0.0.1、未強制驗證時取得 is_admin=True 帳號。正式文保留 gateway mode 與設定前提，不稱所有 reverse proxy 部署必然脆弱。
- https://github.com/gpustack/gpustack/blob/v2.2.0/gpustack/api/auth.py
  - 自動 loopback admin 分支移除；非 disabled gateway 模式取 real-IP 前呼叫 gateway token 驗證，失敗回退 peer。僅據此說明本案修正，不宣稱全面安全。
- https://github.com/gpustack/gpustack/blob/v2.1.1/docs/cli-reference/start.md
  - `--force-auth-localhost` 預設 False，YAML `force_auth_localhost`，以 `--config-file` 載入。Docker 參數在 image 後、Kubernetes `args`。正文 YAML 是局部合併片段。
- https://github.com/gpustack/gpustack/blob/v2.2.0/docs/upgrade.md
  - 升級前備份資料庫，server 先於 workers，容器程序適用 v2.0+；不鼓勵 main／rc 互升。正式稿不直接複製 destructive docker rm 範例。

## FreeSWITCH 候選

https://github.com/signalwire/freeswitch/security/advisories/GHSA-mg63-h38w-8p9p 於 2026-10-28 發布。CVE-2026-116779，≤1.11.2 受影響，≥1.11.3 修復。入口是能被 profile 接受的 SIP MESSAGE，預設啟用 chat；API proto 可執行 FreeSWITCH API，已觀測實際利用。若強制 MESSAGE auth，一般可註冊帳號即足夠；保留無密碼預設 directory users 時可能不需要自己的帳號。inbound ACL 不涵蓋 MESSAGE，auth-messages 與 disable_system_api_commands 單獨不足。無需 chat 的 profile 可 enable-chat=false，正式修正新增預設關閉的 enable-chat-api-proto。此段為候選研究，未發布獨立 FreeSWITCH 文章。

## 封面方向

先檢視鄰近 Alpine 與 SonicOS 封面。Alpine：紙雕城門／斜角廣景／薄荷白／日光。SonicOS：陶瓷雙入口／正面模型／米白陶土／暖日光。本篇：外部銅管回繞機箱插口／gouache 與網版顆粒／側面剖面近景／靛藍銅色／冷光。媒材、構圖、色盤皆不同，只保留橫幅比例。

內建 image_gen 生成原創 raster，提示詞要求外部管路經 loopback 進入 GPU 旁插口，禁止文字、商標、浮水印與套版盾牌符號。概念視覺，不宣稱是真實 GPUStack 硬體結構。生成 PNG 的實際 bytes 已保存並驗證，轉為 1672×941 WebP（113,548 bytes）。完整圖與 320 px 卡片均直接檢視，無文字、商標或浮水印，銅管與 GPU 主體可辨識，已核對 consuming frontmatter 與 coverAlt。

## 編輯與驗收

版本、CVE、URL 與參數名稱逐項核對。依 humanize-writing 繁體中文規則人工審稿，保留範圍限制於開頭，調查／測試清單標為作者工程建議。沒有實測受害環境、沒有執行 PoC，沒有新增 Mermaid 或正文 SVG。後續紀錄只填實際完成的 gate 與部署結果。

- 獨立內容審閱重新核對 GHSA、兩版 auth.py、start／upgrade 文件與 CISA JSON，事實與條件通過，已修正「雲端端日誌」筆誤。humanize checker 的三個命中分別為合法標籤冒號、動詞「只讀取」及通常語意的「異常使用」，逐項保留。
- Frozen install 已以 pnpm 12.1.0 完成，lockfile 未修改。已將 pnpm-native 所在目錄前置 PATH，確保 pnpm check 的內層腳本也使用 12.1.0。
- 本機視覺預覽受限：Astro dev 回報已啟動，但 localhost HTTP 無法連線；Chromium 使用獨立 profile 仍以 socket() failed: Operation not permitted 結束（exit 134）。未關閉 sandbox 或修改安全設定。桌面／320 px、深淺色互動視覺驗收未完成，改做封面 pixels、production HTML 與索引檢查並明記限制。

- 首輪完整 `pnpm check` 通過：Astro 檢查 247 個檔案，0 errors／warnings／hints；production build 與 Pagefind 完成。`pnpm test` 117／117 通過。修正系列 metadata 後會重新驗證最終檔案。Shell fence 已通過 bash 語法檢查，YAML 片段解析為布林 true，沒有對容器執行盤點命令。
