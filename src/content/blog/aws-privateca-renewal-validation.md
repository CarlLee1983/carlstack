---
title: AWS 憑證簽發器修補後，續期成功也要列入驗收
description: AWS Private CA Connector for Kubernetes 修補 CVE-2026-119115 時會收緊 issuerRef.kind 驗證。從升級前盤點、合法簽發與拒絕案例，到服務載入新憑證，建立可驗收的修補工作單。
publishDate: 2026-10-30T11:14:24+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - API 整合
  - 系統設計
series: 現代網路協定與 API 平台架構
seriesOrder: 23
cover: ../../assets/covers/aws-privateca-renewal-validation.webp
coverAlt: 綠色憑證沿著深色軌道通過發光檢查框，旁邊的金色時鐘提醒下一次續期也需要完成驗收。
---

一個憑證簽發器更新成功，正在使用的憑證也還有效，服務當下看起來可能完全正常。若新版本開始拒絕舊有設定，問題要等到下一次續期或到期時才會顯現。對這類修補，驗收範圍應包含下一張憑證如何產生。

AWS 在 2026 年 10 月 29 日 09:30 PDT 發布的 [2026-156-AWS](https://aws.amazon.com/security/security-bulletins/2026-156-aws/) 公告 CVE-2026-119115，涉及 AWS Private CA Connector for Kubernetes 的 issuer 解析授權。特定條件下，僅獲 namespace 範圍簽發批准的已驗證使用者，可能取得未授權 cluster 範圍 issuer 簽出的憑證，包含下層 CA 憑證。公告未聲稱已遭實際利用。我核對公開通報，未部署 Kubernetes 或重現漏洞；後續驗收安排都是尚未執行的工程建議。

## 盤點範圍要包含設定與部署版本

[維護者 GHSA](https://github.com/cert-manager/aws-privateca-issuer/security/advisories/GHSA-hjrh-q6pg-mh82) 評為 High、CVSS v3 8.5。修補點為 aws-privateca-issuer 1.10.1，EKS add-on 為 1.10.1-eksbuild.1；早於這兩個版本的對應套件在影響範圍內。

新版本要求 issuerRef.kind 精確設定為 AWSPCAIssuer 或 AWSPCAClusterIssuer，且與參照對象一致。缺少或錯誤 kind 的請求會 Failed；以 AWSPCAIssuer 指向 cluster issuer 的請求會持續 Pending。AWS 因此要求升級前檢查 CertificateRequest、Certificate 與 Ingress。Ingress 缺少 issuer kind 時所產生的 Issuer 值，也在需注意的情況內。

短期無法升級時，官方緩解是把 approval policy 與 RBAC 同時限制 issuer 名稱及 kind。這需要資源擁有者審查，不宜由修補腳本把所有申請一律改成 cluster issuer，否則可能把原本要縮小的權限重新放大。

## 把下一次簽發當成一個獨立測試

以下用虛構的物流 API 說明驗收安排。它的內部 HTTPS 憑證由這套 connector 管理，既有憑證距到期還有一段時間。團隊可以先在隔離環境選一個低權限測試服務，列出申請資源、預期 issuer 的完整身分、核准政策，以及最後接收憑證的工作負載。

第一個測試是合法路徑。名稱、kind 與預期 scope 一致的申請，應能完成簽發，再確認實際憑證由預期的簽發來源產生。接著只改一個條件：讓僅獲 namespace 權限的測試身分參照未授權 cluster issuer，應被拒絕。只測「壞請求失敗」不夠，因為 connector 根本沒啟動時也會得到失敗。

部署驗收要分開記錄兩件事。第一件是新憑證已產生，第二件是測試服務實際載入並使用這張新憑證。這是工程建議，不是公告替每種工作負載保證的行為。若簽發成功但服務仍用舊憑證，排查責任已移到憑證交付或載入流程。

## Pending 與到期時間要一起看

一份單純的「待處理請求數」看不出優先順序。工程上可同時記錄請求開始等待時間、目前憑證剩餘有效時間，以及負責的服務。警報門檻由服務恢復所需時間決定，而不是照抄某個固定天數。

假設測試服務距到期還有 48 小時，調查、修正與驗證預算合計 8 小時。這些都是教學假設。若團隊只設到期前 1 小時告警，即使監控準確，也無法在預算內完成處理。應留下足以完成復原的時間，再決定何時通知、由誰接手。

替代做法是只看 controller 的成功部署狀態。它比較便宜，也能發現程序啟動失敗，但無法回答現有資源能否通過新規則。較完整的做法需要維護少量合法與拒絕案例，代價是多了一組測試資源與驗收紀錄。對會延後顯現故障的憑證流程，這筆成本有明確對應的風險。

## 修補工作單留下下一張憑證的證據

既有 [Octopus issuer 驗證文章](/blog/octopus-oidc-issuer-identity-boundary/)聚焦 OIDC 身分不能只看 subject。這次需要檢查 Kubernetes 資源的 kind 與 scope，還要追蹤收緊驗證後，合法續期能否繼續完成。

可以從一個服務開始，把執行版本、資源參照、批准政策、合法簽發結果、未授權申請拒絕結果，以及服務載入新憑證的證據放在同一張修補工作單。沒有可確認的續期路徑時，工作單就保留未完成，不以服務此刻仍在線上作為結案理由。
