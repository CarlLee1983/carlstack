# Red Hat Quay 修補後的憑證與映像驗證：查核紀錄

- 查核日期：2026-11-28（Asia/Taipei）。以兩個 CVE、Red Hat Quay、公告網址及核心題目查對 blog、research、article queue；無同源稿。既有 1Password 文處理部署權限，這篇處理 registry 復原，從本文連結；無適合的連續系列。
- [TWCERT/CC 11/27 通報](https://www.twcert.org.tw/tw/cp-169-11469-2d7e0-1.html)、[Red Hat CVE-2026-110697](https://access.redhat.com/security/cve/cve-2026-110697) 與 [CVE-2026-123710](https://access.redhat.com/security/cve/cve-2026-123710) 分別支持版本範圍與兩類影響。無由這些公告確認實際利用；registry 服務金鑰與獨立映像簽章分開。
- [Quay 機器人帳號](https://docs.redhat.com/en/documentation/red_hat_quay/3/html/managing_access_and_permissions/allow-robot-access-user-repo) 與 [Sigstore 驗證](https://docs.sigstore.dev/cosign/verifying/verify/) 支持防禦性操作說明。digest A/B 及三執行個體為假設。未做 Quay 叢集演練；不含漏洞重現或攻擊程序。
