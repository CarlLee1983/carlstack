---
title: "NGINX HTTP/2 修補與部署驗證"
description: "核對 NGINX HTTP/2 修補版本、Linux 發行版回補與 Ingress 映像，確認實際接流量的程序已更新。"
publishDate: 2026-11-19T10:02:38+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - HTTP
  - 事件應變
series: 現代網路協定與 API 平台架構
seriesOrder: 35
cover: ../../assets/covers/nginx-http2-patch-rollout.webp
coverAlt: "三台銀灰色機架伺服器，中間一台亮著琥珀色指示燈並略微向外拉出，上下兩台亮著綠燈。"
---

NGINX 於 2026 年 11 月 18 日發布 stable 1.30.7 與 mainline 1.31.9，包含 HTTP/2 等多項安全修補。已使用上游版本的服務，應安排升級；使用 Linux 發行版套件或 Ingress Controller，則先查清楚供應來源與修補狀態，不能只比版本字串。[官方發布紀錄](https://nginx.org/2026.html)

截至 11 月 19 日查核時，CERT-EU 說明 CVE-2026-123007 已有研究展示，但未收到在野利用通報。文中的部署驗收做法未在正式環境實測。[CERT-EU 公告](https://cert.europa.eu/publications/security-advisories/2026-022/)

## 先找出真正處理 HTTP/2 的那一層

這次 HTTP/2 修補涉及 CVE-2026-123007 和 CVE-2026-123633。對上游版本，兩項都已在 stable 1.30.7 和 mainline 1.31.9 修補。較舊版本須依分支及官方版本表判定，其中 CVE-2026-123007 適用於啟用 HTTP/2 的設定。[NGINX 安全公告](https://nginx.org/en/security_advisories.html)

盤點時，畫出「使用者 → CDN／負載平衡器 → NGINX → 應用程式」的實際連線路徑，逐段記錄協定。瀏覽器顯示 HTTP/2，不代表後方每一層都使用 HTTP/2；外層代為終止連線，也不代表其他內部或直連入口可以略過。

核對模組、設定與實際流量三者。NGINX 的 HTTP/2 支援來自 `ngx_http_v2_module`；新版有 `http2` 指令，但該指令自 1.25.1 才加入。檢查舊版時，不要只搜尋 `http2 on` 就判定沒有啟用。[HTTP/2 模組文件](https://nginx.org/en/docs/http/ngx_http_v2_module.html)

每個服務至少留下：套件或映像來源、完整版本、對外與內部入口、HTTP/2 啟用情況，以及負責更新的人。沒有 HTTP/2 的服務仍須另外核對本次其他公告，不能把「不適用這兩項」寫成「整批不受影響」。

## 發行版套件要看修訂號與公告

發行版可能將安全修正回補到較舊的版本，保留原有上游版號。Red Hat 的說明明確提醒，單看上游版本無法判定套件是否已修補。[安全回補說明](https://access.redhat.com/security/updates/backporting)

因此，驗收資料應包含完整套件版本與發行版版本，再對照該供應商針對 CVE 的狀態、修補套件修訂號及適用軟體庫。若目前啟用的軟體庫尚未提供修補，即使套件管理器顯示已安裝最新版，也不能結案。

這也不是可以預設「發行版已回補」的理由。本次查閱 Ubuntu 的 CVE-2026-123007 頁面時，24.04 LTS 與 22.04 LTS 仍標示 Vulnerable，頁面更新日為 11 月 18 日。實際部署前須再查一次，不把這份時間點快照當成永久狀態。[Ubuntu 追蹤頁](https://ubuntu.com/security/CVE-2026-123007)

若供應商尚未提供可用修補，應留下待辦負責人、預定複查時間與服務風險處置。不要為了追上上游版號，未經相容性評估就把既有套件來源換掉。

## 更新檔案之後，還要確認執行中的程序

建議先在測試環境核對設定與必要模組，再以少量實例驗證，通過後分批更新。`nginx -t` 可檢查設定語法及相關檔案是否可開啟；`nginx -V` 可查版本與編譯參數，但這些輸出本身不是所有服務程序已換新的證明。[命令列文件](https://nginx.org/en/docs/switches.html)

尤其不要把設定 reload 當成二進位更新完成。官方將重新載入設定與升級執行檔列為不同流程；舊 worker 在平順關閉期間仍可能處理既有連線。[程序控制文件](https://nginx.org/en/docs/control.html)

部署驗收可分成三項：

- **套件／映像已修補**：保存完整套件修訂號，或實際部署映像的 digest，並能對應供應商公告。
- 程序已替換：依平台的重啟或滾動更新機制，確認所有實例都已切換；檢查舊 master、worker 或舊 Pod 是否仍在服務。
- 服務可正常使用：用既有正常請求驗證 HTTP/2 協商、主要頁面或 API、上傳與長連線等實際功能，再觀察錯誤率、延遲及程序異常退出。

最後一項是功能回歸，不是漏洞測試；正常請求成功不能單獨證明修補完成，仍須搭配前兩項證據。分批期間若出現錯誤率上升，先停止擴大部署並查明原因；回復舊版也會帶回原有風險，不能無限期當成完成狀態。

## Ingress 要用自己的產品版本核對

在 Kubernetes 中，Ingress 資源不是 NGINX 執行檔。先辨識使用哪個 Controller、哪個映像來源，再查內含的 NGINX 版本與供應商發布紀錄，不把所有名稱包含 nginx 的 Controller 視為同一產品。

例如本次查閱 F5 NGINX Ingress Controller 官方規格時，5.8.0 對應 NGINX 1.31.9；這個對照不能直接套用到其他 Controller。仍需核對 Kubernetes 相容性與實際映像，而不是只更新 Helm chart 的版本欄位。[F5 NGINX Ingress Controller 規格](https://docs.nginx.com/nginx-ingress-controller/technical-specifications/)

接下來先挑一個實際對外服務，把供應商修補證據、套件／映像識別值、程序切換結果與功能回歸紀錄放進同一張部署單。這四項都能對應同一批實例，才有足夠依據將它標記為已完成修補。

延伸閱讀：[反向代理、API Gateway 與負載平衡器](/blog/reverse-proxy-api-gateway-load-balancer/)、[Kubernetes Ingress 與 Gateway API](/blog/kubernetes-service-types-ingress-gateway-api/)。
