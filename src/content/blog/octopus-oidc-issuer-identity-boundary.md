---
title: Octopus 的 OIDC 修補提醒：同名 Subject 不能跨 Issuer 認親
description: CVE-2026-116870 揭露 Octopus Server 的 OIDC issuer 驗證不一致。整理受影響版本與修補分支，並用 CI 部署案例說明服務帳號如何綁定簽發者、subject、audience 與權限。
publishDate: 2026-10-28T10:08:08+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - API 整合
  - 系統設計
series: 現代網路協定與 API 平台架構
seriesOrder: 22
cover: ../../assets/covers/octopus-oidc-issuer-identity-boundary.webp
coverAlt: 兩條酒紅與淡紫路徑通往不同查驗門，外觀相同的金色身分圓牌分別位於門內與門外，表達身分名稱之外仍須核對簽發來源。
---

CI 不必保存長效 API key，也能用 OIDC 換取部署權限。但當部署平台接受多個簽發者，只看 subject 是否相同，會把不同來源的身分混在一起。

Octopus 在 2026 年 10 月 27 日公開 [SA2026-15](https://advisories.octopus.com/post/2026/sa2026-15/)，指出 Server 的 OIDC issuer 驗證不一致，可能把來自特定非合法簽發者的 token，認成可信簽發者下的服務帳號。CVE-2026-116870 評為 High、CVSS 8.7；利用前提包括服務帳號至少設定一個 OIDC identity，且攻擊者需知道或猜到部分 identity 資訊。

這是 10 月 27 日的公開通報，修補早在 9 月 14 日釋出。官方表示尚不知有公開公告或惡意利用，並沒有宣稱已發生攻擊。我核對公告、產品文件與 OIDC 規格，未部署 Octopus 或重現漏洞；後面的測試安排是工程建議。

## 升級要按分支核對

官方列出的受影響範圍為：

- 2024.x.x 中，晚於 `2024.1.11865` 的版本。
- 所有 2025.x。
- 2026.1 中，早於 `2026.1.11781` 的版本。
- 2026.2 中，早於 `2026.2.13438` 的版本。
- 2026.3 中，早於 `2026.3.15816` 的版本。

對應修補版本為 `2026.1.11781`、`2026.2.13438`、`2026.3.15816`。公告建議升至 `2026.3.15973`，並給無法升到該版的分支路徑；2024／2025 使用者至少須移至修補過的 2026.1。Octopus Cloud 已更新，客戶不需額外動作。

公告沒有已知緩解措施，不能將下面的設定盤點當成修補替代品。自管 Server 要留下實際執行版本與節點清單，避免只更新下載檔，舊節點仍接收 token。

## 一筆信任規則要同時回答四個問題

Octopus 的 [Other Issuers 文件](https://octopus.com/docs/api/authentication/openid-connect/other-issuers)允許一個服務帳號設定多筆 OIDC identity。它要求 token 的 issuer 與設定精確相符，並驗證 subject、audience、期限與簽章；subject 設定另外支援萬用字元。這些欄位共同決定誰能換到帳號權限。

假設一個虛構團隊同時使用兩套 CI，甲負責正式部署，乙只跑測試。兩邊都可能有叫 `release-job` 的 subject。名稱相同不代表乙可以取得甲的部署帳號。

我會將部署信任規則記成四個可審查欄位，而非一份單獨的 subject 清單：

- 允許的 issuer 完整識別值。
- 這個 issuer 下允許的 subject 或受控比對模式。
- 接收端預期的 audience。
- 通過驗證後對應的服務帳號與最小權限。

這是一份設計檢查表，不是 Octopus 可直接貼上的設定格式。若團隊只需甲 CI，最小方案就是只登記甲的 identity，將正式與測試權限拆開。共用帳號可以減少維護項目，但多加一筆 identity 就多了一條取得相同帳號權限的入口，審查不能只看新入口本身。

## 簽章、Issuer 與身分映射必須連在一起

[OpenID Connect Core 3.1.3.7](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation)要求 issuer 識別值與 ID token 的 `iss` 精確相符。[16.15 節](https://openid.net/specs/openid-connect-core-1_0.html#IssuerIdentifier)也明確將 URI path 視為 issuer 的一部分，相同主機下不同路徑不可直接合併成同一簽發者。

因此，自家整合層不宜為了容忍設定差異，自動去掉 path、改寫識別值或只比對 hostname。這是從規格推導的設計建議，公開公告沒有揭露 Octopus 是否犯了其中哪一種具體錯誤，不能把示例寫成漏洞根因。

[RFC 8725 第 3.8 節](https://www.rfc-editor.org/rfc/rfc8725.html#section-3.8)還要求驗證所用密碼學金鑰屬於 issuer。實務審查要追到「採用哪一份受信任 issuer 設定、從哪裡取得對應金鑰、驗證後映射到哪個帳號」。不能把「某把金鑰驗簽成功」獨立當成授權結論。

站內的 [Postiz 權杖簽署與用途驗證](/blog/postiz-token-signing-authority/)討論同一系統內不同用途的 token 混用。這次要額外守住簽發來源。即使 subject 與預期相同，來源不在該身分的信任規則中，也應拒絕。

## 回歸測試要讓同名身分來自不同來源

驗收可使用隔離測試環境與兩個受控測試 issuer，不使用生產憑證或嘗試未知站台。測試設計尚未執行，不代表已證明上游修補有效。

第一個案例是基準：允許的 issuer、subject、audience 與有效期限組合，取得預定的低權限測試帳號。接著只改變一個條件，觀察拒絕發生在哪一層：

1. 相同 subject 與 audience，改由未獲該帳號信任的測試 issuer 簽發，應拒絕。
2. 可信 issuer 下，換成未獲准的 subject，應拒絕。
3. 身分正確但 audience 不符，應拒絕。
4. 身分與 audience 都正確，但 token 過期，應拒絕。

如果全部案例都失敗，也可能只是網路或測試金鑰設定壞了，所以合法案例必須一起保留。另加一項授權檢查：成功取得測試帳號後，只能操作預定測試資源，不能因登入成功就獲得正式部署權限。

日誌應留下選用的信任規則、帳號與拒絕原因，不記完整 bearer token。結案時分開保留修補版本、身分設定摘要與正反案例結果，讓下一次加 issuer 或放寬 subject 模式時能重跑比較。

今天可以從最高權限的部署服務帳號開始，把每筆 OIDC identity 的 issuer、subject、audience 與可執行動作列在同一張工作單上。只要其中一項說不清楚，就暫緩擴大該帳號的信任來源；既有漏洞則照官方分支路徑升級。

若簽發流程涉及 Kubernetes 憑證，另一個驗收面向是[修補後的合法續期與憑證載入](/blog/aws-privateca-renewal-validation/)，需要把資源 kind 與 scope 一起確認。
