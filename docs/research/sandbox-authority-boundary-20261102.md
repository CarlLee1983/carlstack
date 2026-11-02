# 沙箱執行權限與 host file API 分開驗收

查核日期：2026-11-02 UTC。交付文章：`src/content/blog/sandbox-authority-boundary-acceptance.mdx`。

## 結論與編輯決定

兩份 JFrog CNA CVE 紀錄均於 2026-11-01 公開，修補日期較早。文章以「執行期能力」與「容器外檔案代理」兩個驗收責任為原創主張，不描述為已遭攻擊。僅撰寫文章及此研究檔，沒有部署產品、執行 PoC、重跑上游測試或驗證修補效果。

## 去重、規範與系列

- 已讀 `AGENTS.md`、`docs/content-guide.md`、`src/content.config.ts`、`.agents/skills/carlstack-copywriting/SKILL.md`、humanize-writing 技能及繁中規則。
- `trail map`、`trail ask 'content-guide security series sandbox CVE Prefab Beta9' --source` 均回報 `trail: command not found`，改用 `rg` 與限定檔案閱讀。
- 在 `src/content/blog`、`docs/research`、`docs/article-queue.md` 搜尋 `120338|120307|Prefab|Beta9|PrefectHQ/prefab|beam-cloud/beta9`，寫稿前零命中。原始來源 URL 無追蹤參數，穩定 ID 為兩個 CVE 及兩個 PR 號。
- 近似主題為 `openwa-request-target-boundaries.md`（解析後目的地）與 `octopus-oidc-issuer-identity-boundary.md`（身分來源）。本篇新增執行權限與主機檔案代理分別驗收的收穫，正文連結 OpenWA；不修改既有文章，反向站內連結由發布者依授權決定。
- 既有資安 CVE 群歸於「現代網路協定與 API 平台架構」，現有順序 1 至 26，本篇設 27；已與 parent 協調。另有「Web 安全基礎」僅入門路徑，未採用。
- 封面由 parent 製作，路徑採既有可解析格式 `../../assets/covers/sandbox-authority-boundary-acceptance.webp`。

## 一手來源與正文對照

### Prefab CNA

URL：https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/120xxx/CVE-2026-120338.json

親讀 JSON，來源為 CVEProject 收錄的 JFrog CNA，不能稱為已讀 vendor advisory。

- `cveMetadata.datePublished`：2026-11-01T15:24:54.158Z，對應開頭公開日期。
- `containers.cna.affected[0].versions`：0.14.0 起、低於 0.21.0，對應 Prefab 節版本。
- `descriptions` 與 `metrics.scenarios`：Generative UI opt-in、Deno、工具呼叫條件、Pyodide/JavaScript/Deno 權限交界；無認證 10.0、已有認證且可呼叫工具 9.9。
- `timeline` 與描述：初始化後撤權、禁止提示重新授權、bootstrap 網域限制。對應修補機制。文章不提供持久化寫入方法。

### Prefab 修補及 release

- https://github.com/PrefectHQ/prefab/pull/538 ：親讀標題、合併時間及作者描述，2026-10-25 合併；描述明確說明生成程式前撤銷 bootstrap filesystem/network 權限。
- https://github.com/PrefectHQ/prefab/releases/tag/v0.21.0 ：親讀 release，顯示 26 Oct 18:59，列入 #538。與 CNA 2026-10-26 發布日期一致，正文不聲稱精確分鐘相同。
- https://github.com/PrefectHQ/prefab/security/advisories/GHSA-595q-jv4r-q7j9 ：實際開啟回傳 404，未取得 advisory 內文。保留此限制。

### Beta9 CNA

URL：https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/120xxx/CVE-2026-120307.json

- `cveMetadata.datePublished`：2026-11-01T12:49:51.981Z。
- `affected`：Beta9 worker 低於 0.1.756；`descriptions` 指定 workspace token 與 running sandbox 前提。
- `descriptions`：容器外檔案 API 的路徑與連結解析可影響 worker；多個檔案操作共用 helper，權限涉及 root 與同機租戶。對應 Beta9 節，不擴張為所有公開端點皆可匿名利用。
- 研究者唯讀驗證屬漏洞證據，不是實際惡意利用紀錄。文章不列憑證擷取路徑、不提供 PoC。
- `solutions`、`timeline`：0.1.756 修補，使用 os.OpenRoot；修補與 release 日期 2026-09-15。

### Beta9 修補及 release

- https://github.com/beam-cloud/beta9/pull/1897 ：親讀合併資訊（2026-09-15）、作者描述與 PR 摘要。摘要含 bot 文字，核心機制以 CNA 交叉核對，不把 bot 的測試聲明當本次驗證。
- https://github.com/beam-cloud/beta9/releases/tag/worker-0.1.756 ：親讀 release 頁。版本名稱為 Worker: 0.1.756，頁面顯示 15 Sep 04:03，列入 #1897，日期與 CNA 對照。
- 另開啟兩份 PR 的 `/files` 頁，但不聲稱完成逐行 source audit；正文依據 CNA 與 PR 作者描述。

## 原創分析與未知

- 虛構內部工具、雙責任驗收、標記檔、冷啟動／重啟測試、權限觀測、租戶對照與停止規則皆為工程建議，不是上游已完成測試。
- 沒有觀察讀者的配置、流量、worker 映像或所有節點版本，無法判斷特定部署是否曝險。
- 已讀來源未提供實際惡意利用事件證據；沒有搜尋結果也不能證明從未遭利用。
- 暫停入口與受控資料供應是作者取捨，不宣稱為 vendor 官方替代修補。
- 沒有生圖、測試、commit、push；發布 gate 與封面視覺驗收由 parent 負責。
