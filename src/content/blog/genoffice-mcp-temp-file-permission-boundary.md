---
title: "GenOffice 暫存檔漏洞：MCP 的 HTTP token 保護不到共享目錄"
description: "CVE-2026-108582 指向 GenOffice HTTP MCP FileStore 的本地權限。釐清共享暫存目錄、umask、不同 UID 與容器掛載條件，建立不靠猜測的文件隔離驗收。"
publishDate: 2026-10-11T10:07:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - API 整合
  - 系統設計
cover: ../../assets/covers/genoffice-mcp-temp-file-permission-boundary.webp
coverAlt: "毛氈檔案櫃正面有鎖孔，側面開放層架仍露出文件，旁邊封閉布袋象徵需要另外落實的檔案隔離。"
---

替 MCP 的 HTTP 入口加 bearer token，仍可能讓同一台主機上的其他帳號讀到文件。GenOffice 這次的問題落在暫存目錄：HTTP 驗證有自己的邊界，作業系統的檔案權限還需要另一份驗收。

VulnCheck 於 2026 年 10 月 10 日 15:57 UTC 發布 [CVE-2026-108582 紀錄](https://github.com/CVEProject/cvelistV5/blob/main/cves/2026/108xxx/CVE-2026-108582.json)，列出 GenOffice **截至 0.11.505 的版本受影響**。紀錄中的公開日期為 10 月 9 日；10 月 10 日是 CVE 紀錄發布時間，不能寫成當天首次揭露。

CNA 將它評為 CVSS 4.0 的 6.8 分、中度風險，攻擊向量是本地、需要低權限，影響文件機密性。本文沒有找到可核實的正式修補版本或在野利用證據，也沒有重現完整 GenOffice HTTP 伺服器。以下分開整理原始碼、研究者實驗與部署建議，不把這個個案推論成所有 MCP 服務都有同樣漏洞。

## 文件離開 HTTP 路由後，誰還能打開它？

[CVE 指向的 v0.11.505 FileStore 原始碼](https://github.com/genspark-ai/genoffice/blob/v0.11.505/packages/cli/src/mcp/files.ts)在建立 uploads 與個別上傳目錄時，使用 `mkdirSync(..., { recursive: true })`，沒有指定 mode。[HTTP 實作](https://github.com/genspark-ai/genoffice/blob/v0.11.505/packages/cli/src/mcp/http.ts)將根目錄放在系統暫存路徑下，以 PID 與隨機值組合名稱；上傳串流的 `createWriteStream(path)` 同樣未顯式指定檔案模式。

依 [Node.js fs 文件](https://nodejs.org/api/fs.html)，建立目錄的預設 mode 是 `0o777`，`createWriteStream` 建立檔案的預設 mode 是 `0o666`，實際權限再受程序 umask 等作業系統規則限制。在研究者的 POSIX 測試條件中，umask `022` 使目錄成為 `0755`、檔案成為 `0644`：其他帳號可以走入目錄並讀取檔案。

這時請求根本不必經過 HTTP 路由。另一個本地帳號直接從共享檔案系統讀資料，就不會遇到 bearer token 檢查。隨機目錄名稱也不能替代存取控制；能列出上層目錄的帳號，仍可能找到它。

這與站內〈[LMCache 的程序信任邊界](/blog/lmcache-multiprocess-pickle-trust-boundary/)〉有相近的部署提醒：把網路入口限制住之後，還得盤點程序間通道。但本篇影響是本地文件讀取，沒有把它描述成遠端程式執行。

## 研究者測到的是 FileStore 隔離實驗

HaiND 的[研究報告](https://hackmd.io/@haind/genoffice-http-mcp-temp-file-disclosure)在隔離 Linux、Node.js 22 環境中重現 v0.11.505 FileStore 相同呼叫，使用 canary 文件測試另一個 UID 是否可讀。

- umask `022`：觀察到 `0755` 目錄、`0644` 檔案；另一個低權限帳號能讀取 canary。
- umask `077`：觀察到 `0700` 目錄、`0600` 檔案；不同 UID 的讀取失敗。

這是研究者報告的結果，本文未獨立重跑。報告也說明沒有部署完整封裝的 HTTP server，沒有調查常見啟動器的實際 umask。因此可支持的結論是權限風險確實存在於該建立方式與測試條件；不能據此聲稱每一個 GenOffice 安裝都已洩漏文件。

`umask` 的作用是從請求的權限中移除位元。它不會把顯式設定的 `0600` 擴成 `0644`，也不會替既有檔案自動收緊權限。調整啟動設定後，舊暫存資料仍需依維運政策檢查。

## 不同 UID 與同一 UID，需要不同的隔離手段

### 共用主機、不同服務帳號

研究者提出的緩解方向包括限制性 umask、owner-only 私有暫存根目錄，以及明確的 `0700` 目錄與 `0600` 檔案。這些是部署與程式修正建議，目前不能稱為官方已發布修補。

我的部署建議是讓服務使用專用帳號與私有 `TMPDIR`，在隔離環境產生無敏感資料的 canary，再由另一個普通 UID 驗證列目錄和讀檔都被拒絕。還要確認服務確實使用該路徑，以及產出轉檔文件是否維持同等權限；只檢查上傳成功不夠。

### 多個 Agent 或租戶共用同一 UID

owner-only 權限仍允許 owner 讀取。同 UID 的兩個 Agent、同一服務程序內的不同租戶，不能靠 `chmod 600` 分開。這類場景需要應用層擁有權檢查，以及符合威脅模型的程序、帳號或儲存隔離；不能把目錄名字當作租戶權限。

### 容器是否共用掛載與身分

容器能否隔離這條路徑，要看暫存目錄是否共享、UID 如何映射，以及容器可見的掛載。若兩個工作負載能看見同一檔案，且有效 UID 對應同一 owner，檔案模式本身無法提供租戶區隔。若沒有共享掛載，也不能直接套用「同主機就能讀取」的推論。

## 用 canary 驗收，不拿正式文件試權限

下面是本文建議的檢查紀錄格式，尚未在 GenOffice 正式部署中執行。canary 只放無敏感內容；檢查紀錄不保存 token、客戶文件或真實暫存內容。

```yaml
fixture: mcp-temp-isolation
artifact: synthetic-canary-document
service_version: record-exact-version
service_uid: record-effective-uid
temp_root: record-resolved-path
checks:
  - upload_and_generated_output_are_owner_only
  - different_unprivileged_uid_cannot_list_or_read
  - same_uid_workloads_have_separate_isolation_controls
  - shared_mounts_and_uid_mapping_are_documented
  - existing_temp_files_are_reviewed_separately
  - retention_and_cleanup_match_document_policy
result: pending
```

FileStore 原始碼有預設一小時 TTL、每五分鐘檢查過期項目的機制，`get` 也會更新 touched 時間。這些生命週期行為不能補上讀取權限；即使上傳文件稍後會被清除，仍要保護它存在的整段時間；TTL 也不代表所有產出檔案都會從磁碟刪除。

**停止規則：不同信任身分能讀取不屬於自己的 canary，就停止把真實文件交給這個部署。** 若目前使用受影響版本，下一步是確認實際 UID、umask、暫存根目錄與共享掛載，再依正式修補資訊安排升級。未知的修補版本就保持未知，不以套件版本號較新推定漏洞已解決。

## 來源與證據層級

- [CVE-2026-108582 CNA 紀錄](https://github.com/CVEProject/cvelistV5/blob/main/cves/2026/108xxx/CVE-2026-108582.json)：受影響版本、公開與發布日期、評分及本地攻擊前提。
- [VulnCheck 公告](https://www.vulncheck.com/advisories/genoffice-through-0.11.505-insecure-permissions-in-http-mcp-server-file-store)：漏洞摘要。
- [HaiND 研究報告](https://hackmd.io/@haind/genoffice-http-mcp-temp-file-disclosure)：隔離實驗、限制與緩解建議；非本文實測。
- [GenOffice v0.11.505 原始碼](https://github.com/genspark-ai/genoffice/tree/v0.11.505/packages/cli/src/mcp)：FileStore 與 HTTP 實作；[Node.js fs 文件](https://nodejs.org/api/fs.html)用於核對預設權限模式。
