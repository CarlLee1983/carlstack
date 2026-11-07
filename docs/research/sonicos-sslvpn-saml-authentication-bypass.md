# SonicOS SSLVPN CVE-2026-19868 查核紀錄

查核日期：2026-11-07，文章 `src/content/blog/sonicos-sslvpn-saml-authentication-bypass.md`。

## 去重與範圍

以 origin/main `ca94ad6cffc9c80de669b5dc20edc45edbaafcac` 為基準，在獨立 worktree 工作，保留原 checkout 本地分歧 commit。檢索全部遠端分支、正式文章、研究與 article queue，關鍵字為 CVE-2026-19868、SonicOS、SonicWall、公告穩定 ID kA1VN000002eBLN0A2 與原始 URL，沒有同 CVE 或同公告文章。已讀開啟 PR #21、22、23、25、26、27、28、29、30、31 的範圍與所有遠端分支內容，無本主題待發布工作。

既有 SMA1000 文章是 CVE-2026-102255、不同產品與公告。保留原文與 URL，新文連向舊文並說明不可套用版本。納入「現代網路協定與 API 平台架構」下一序號 29。既有系列已有兩篇序號 28，屬先前資料，不在本次範圍更動。未修改程式、站台設定、權限或任何既有 PR。

已閱讀 AGENTS、content guide、content config、CI／deploy workflow、carlstack-copywriting、humanize-writing 及繁中參考文件。Trail CLI 不存在且沒有 cache，因此記錄限制後使用 Git 全文檢索。

## 一手來源與主張

### CNA 與 CISA ADP

https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/19xxx/CVE-2026-19868.json

SonicWall CNA 在 2026-11-06 發布。攻擊前提是持有另一驗證方式的有效憑證，可能繞過 SAML 及其強制的 MFA。受影響 Gen7 至 7.3.3-7015、Gen8 至 8.2.2-8015。CISA ADP 當日更新記錄 Exploitation active、KEV dateAdded 2026-11-06。未把 CVSS PR:N 解讀為不需要任何憑證。

https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-19868

CISA 頁面直接讀取失敗，JSON feed 回傳 403，官方 GitHub 大檔工具讀取因尺寸失敗。KEV 日期與 active 的證據採上述 CVE 官方紀錄中具名 CISA ADP，不宣稱已讀到完整 KEV 頁。正文不加入無法直接確認的期限或勒索軟體欄位。

### SonicWall 版本公告

https://www.sonicwall.com/support/notices/kA1VN000002eBLN0A2

初版 2026-11-03，最後更新 2026-11-06。直接 web open 初次失敗，精確版本搜尋找到同一官方頁後成功讀取全文。Gen7 修補基線 7.3.4-7013 以上，另列 7.3.4-7015 於 11 月 5 日；Gen8 修補 8.2.3-8015，供應欄仍寫預定 11 月 6 日。公告涵蓋實體與虛擬平台。沒有把公告總覽 CVSS 8.8 套成此一 CVE 分數。

https://psirt.global.sonicwall.com/vuln-detail/SNWLID-2026-0014

PSIRT 在 web reader 沒有可讀正文，未聲稱完整讀取或確認其 workaround 文字。

### Release notes 與 NSv 差異

https://www.sonicwall.com/support/technical-documentation/docs/sonicos-7.3-release_notes/Content/sonicos-7-3-4-7013.htm

當時明列 NSv 不在該次發布；不可將通用修補基線當成每個機型可用映像。

https://www.sonicwall.com/support/technical-documentation/docs/sonicos-7.3-release_notes/Content/sonicos-7-3-4-7015.htm

列出 NSv 270／470／870、GEN7-58695 替代驗證 SSLVPN 修正；NSv 7.0.1 升 7.1.x 以上須 fresh installation；不支援從 7.3.4 降版。

https://www.sonicwall.com/support/technical-documentation/docs/sonicos8-release_notes/Content/SonicOS-8-2-3-8015.htm

列出 GEN8-18361 SSLVPN Authentication Enforcement Vulnerability via Alternate Authentication Methods，連至同 SNWLID。不將其與同公告 session validation 或 buffer overflow 混為一談。

### 加拿大通報差異

https://www.cyber.gc.ca/en/alerts-advisories/sonicwall-security-advisory-av26-1133

2026-11-06。確認廠商表示在野利用與 KEV 收錄，但 Gen8 寫 prior to 8.2.2-8015，與原廠及 CNA 所列含該版不同。正文明確以原廠為準，不把該版本誤判為已修補。

## 工程建議與未驗證範圍

盤點、負向登入測試、HA 版本核對、外部可達性限制、日誌關聯與調查結案要求均為工程建議。沒有宣稱已在 SonicOS 上執行、重現漏洞、取得受害資料或測試任何特製請求。沒有發布 exploit、憑證或真實組織設定。

完整封面生成、差異化及視覺驗收見 `sonicos-19868-cover.md`。正文沒有 SVG／Mermaid／架構元件，沒有為繞過 gate 移除圖解。

## 審稿與驗證

逐段審核事實、限定與繁中文風，另一次獨立查核沒有發現事實必修項。標題依本次編輯方向直接介紹主題，不塞入結論。繁中 checker 剩餘兩個命中經人工判斷保留：「異常」描述不正常的驗證方式，並非程式 exception；結尾冒號引出兩個具體驗收項目，沒有抽象鋪梗。checker 不是審稿的替代品。

- Node 24.22.1、pnpm 12.1.0，frozen-lockfile 安裝與 711 項供應鏈檢查通過，lockfile 未修改。
- 完整 `pnpm format` 後只 stage 本文、封面及兩份相關查核紀錄。
- `pnpm content:policy -- HEAD`：1 篇文章通過。
- `pnpm check`：格式、Astro 診斷（0 errors／warnings／hints）、production build、詞雲與 Pagefind 通過。
- `pnpm test`：117／117 通過。
- `pnpm exec wrangler deploy --dry-run`：通過，沒有執行手動部署。
- 以正式 `SITE_URL=https://carlstack.gravito.dev` 建置。HTML 已檢查 h1、canonical、封面路徑／alt／尺寸與站內連結，文章出現在首頁、文章索引、RSS、sitemap、對應系列與 Pagefind fragment。

本機 `pnpm dev` 回報背景服務啟動，但 127.0.0.1:4321 無法連線，後續 status／logs 顯示沒有執行中的服務。未完成瀏覽器實頁、320 px 或深淺色視覺驗收，不用靜態 HTML 驗證代稱。封面本身的大圖與 320 px 卡片已視覺檢查。

提交前另跑 production build 與最終格式／diff 檢查。推送後依精確 commit 監看既有部署工作，待部署與正式文章、封面及索引可讀後才對外交付；部署結果不預先寫成完成。
