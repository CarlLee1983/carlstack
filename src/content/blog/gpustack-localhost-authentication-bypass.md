---
title: "GPUStack 漏洞讓反向代理流量取得管理權限"
description: "GPUStack CVE-2026-102895 已列入 KEV。核對 2.2.0 修補版本、loopback 與轉送標頭的利用條件，整理暫時緩解、升級驗收及管理 API key 的調查方式。"
publishDate: 2026-11-10T10:25:43+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - 事件應變
  - 系統設計
series: 現代網路協定與 API 平台架構
seriesOrder: 33
cover: ../../assets/covers/gpustack-localhost-authentication-bypass.webp
coverAlt: "深藍色機箱剖面中，銅管從外部繞回 GPU 板旁的開放插口，紅色小球沿管進入，比喻外部請求經本機代理後被錯認為可信流量。"
---

GPUStack 把來自 `127.0.0.1` 的請求當成管理員，放到同機反向代理後，外部流量也可能取得這項待遇。CVE-2026-102895 影響 `2.2.0` 之前的版本，原廠已確認一套 `2.1.1` 部署遭到利用。修補版是 `2.2.0`，CISA 在 2026 年 11 月 9 日將它加入 KEV。

對外提供 GPUStack 的團隊，應優先核對執行版本、代理連線的實際來源與 localhost 驗證設定。**受影響服務在完成修補或有效緩解前，不應繼續開放給不可信來源。**

查核日期為 11 月 10 日，依據 [GPUStack 安全公告](https://github.com/gpustack/gpustack/security/advisories/GHSA-gj9m-f8ph-pmhr)、版本標籤下的程式與文件，以及 [CISA 官方 KEV 資料](https://github.com/cisagov/kev-data/blob/main/known_exploited_vulnerabilities.json)。我沒有重現漏洞或操作受害部署。以下驗收與調查步驟是工程建議，只適用於有權管理的環境。

## 同機代理與轉送標頭是兩條不同路徑

在 [v2.1.1 的驗證程式](https://github.com/gpustack/gpustack/blob/v2.1.1/gpustack/api/auth.py)中，正常憑證沒有取得使用者時，程式還會檢查請求來源。若結果是 `127.0.0.1`，且 `force_auth_localhost` 為 false，就取出管理員帳號。

來源的取得方式又依 gateway mode 分支。embedded 模式讀取 `X-GPUStack-Real-IP`，其他分支讀取連線端的 `request.client.host`。因此要分開檢查：

- 讀取 TCP peer 的路徑：同機代理把請求送往 loopback，後端看到的是代理的本機位址。這條路徑不需要偽造標頭。
- 讀取標頭的路徑：若客戶端提供的 `X-GPUStack-Real-IP` 能送達並被採信，也可能被判成 loopback。

兩種情況都還要符合脆弱版本與未強制 localhost 驗證等前提。不能把「有用 Nginx」直接當成受影響證據，也不能只刪一個標頭就判定已處理 TCP peer 路徑。

我會在部署清單加上「GPUStack 最後採用哪個來源值」，並記錄該值由誰決定。站內的[反向代理、API Gateway 與負載平衡](/blog/reverse-proxy-api-gateway-load-balancer/)介紹了元件分工，這次則需要沿著實際請求路徑，確認身分驗證沒有依賴錯誤的來源判斷。

## 2.2.0 移除了 localhost 自動管理員

[v2.2.0 的驗證程式](https://github.com/gpustack/gpustack/blob/v2.2.0/gpustack/api/auth.py)已移除這段自動取得管理員的分支。讀取 real-IP 標頭前，也會驗證 gateway token，失敗時退回連線端位址。安全公告因此要求升級到 `2.2.0` 或以上。

`2.2.0` 是這個 CVE 的修補基線，選擇實際升級版本時，還要核對後續安全公告與部署相容性。[該版本的升級文件](https://github.com/gpustack/gpustack/blob/v2.2.0/docs/upgrade.md)要求先備份資料庫，先升 server，再升 workers。文件中的容器更新步驟適用於 v2.0 及以後，舊部署應走對應的遷移流程，不宜直接照抄刪除、重建容器的命令。

升級紀錄應包含原本的掛載、資料庫位置、server 與各 worker 的版本、預定映像標籤及實際執行的 image ID。以下只讀取 Docker 容器資訊，將 `gpustack` 換成現場容器名稱：

```sh
docker inspect --format 'image_ref={{.Config.Image}} image_id={{.Image}} started={{.State.StartedAt}}' gpustack
```

這段輸出可以比對重建前後的容器，版本判定仍須連同官方映像與部署紀錄確認。只改 Compose 檔案裡的 tag，舊容器可能還在執行。

## 暫時緩解要確認設定已被載入

原廠提供的緩解措施包含強制 localhost 驗證、在邊界移除客戶端提供的 `X-GPUStack-Real-IP`，以及限制 API 的可達來源。若暫時不能升級，我會先限制入口，再安排設定變更與重啟驗收。

[v2.1.1 的 start 文件](https://github.com/gpustack/gpustack/blob/v2.1.1/docs/cli-reference/start.md)列出 `--force-auth-localhost`，預設為 false。使用既有 YAML 設定檔的部署，可在 server 設定中加入或修改這一項：

```yaml
# 合併到現有設定；不是完整的部署檔案。
force_auth_localhost: true
```

設定檔必須確實由 `--config-file` 指定。採用 CLI flag 時，Docker 的 GPUStack 啟動參數放在映像名稱後方，Kubernetes 則放在容器的 `args`。這些細節會影響參數是否交給 GPUStack，應按現有部署方式修改。

變更前，盤點依賴 localhost 免驗證的腳本、健康檢查與管理工具，替需要存取的程式配置適當憑證。設定生效後要測試它們，避免因檢查失敗又把驗證關掉。

邊界標頭處理也要區分外部輸入與可信 gateway 產生的資訊，不能在不理解拓撲時，一律刪掉所有內部轉送標頭。緩解完成的證據應包含實際生效設定，以及原本可達的入口現在如何拒絕未驗證請求。

## 驗收要測到後端受保護的操作

瀏覽器顯示登入頁，只能證明頁面需要登入。建議選一個現場確認需要驗證、且不會寫入資料的管理查詢，分別經由公開代理、內部管理入口及原本允許的直連路徑檢查。已封閉的路徑則記錄不可達結果。

使用新的測試工作階段，清除 Cookie、Authorization 與 API key 等既有憑證，避免誤把已登入的結果當成未驗證測試。每次留下入口、時間、回應狀態及對應後端紀錄，再用授權帳號確認必要的管理與推理工作仍能執行。

這份驗收不需要建立惡意 backend，也不需要在 worker 執行命令。若一般未驗證請求已取得受保護資料，就停止恢復對外服務，保留結果並檢查是否仍有舊節點、未載入的設定或漏掉的入口。

## 查核管理 API key 與 worker 上的變更

[CISA 的 CVE 項目](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-102895)指出，影響包含持續有效的管理 API key、worker 與雲端供應商秘密，以及 worker 上的程式執行。KEV 資料也將此案標記為需要 forensic triage。調查範圍因此要涵蓋已建立的管理權限與後續活動。

建議先保留可用的代理、GPUStack、worker 與雲端日誌，再與核准變更對照：

1. 新增或異動的管理帳號與 API key，是否有負責人、用途及對應申請。記錄識別碼、權限與時間，避免把完整秘密貼進工單。
2. 自訂 inference backend、模型或 worker 設定，有沒有無法解釋的新增與修改。與部署版本及變更紀錄比對，不靠名稱是否可疑判斷。
3. Worker 的行程、容器、啟動設定與對外連線，是否符合已核准的推理工作。保留時間線及日誌缺漏範圍。
4. GPUStack 可讀取的雲端與 worker 憑證，有沒有異常使用。確認影響後，依事件應變流程撤銷或輪替，並驗收依賴服務。

這些項目是調查線索，不是保證能找出所有入侵的特徵清單。來源顯示為 `127.0.0.1`，在這個部署情境裡也無法證明操作者就在本機。

[NetScaler 的修補與調查案例](/blog/netscaler-cve-2026-88779-saml-kev-remediation/)同樣把版本修補與歷史事件分開驗收。下一張 GPUStack 變更單可以直接列出兩個負責人：一人交付 server、worker 與入口的修補驗收，另一人追查不明管理 key、backend 與憑證使用。後者還沒查完時，維持調查中，不以升級完成結案。
