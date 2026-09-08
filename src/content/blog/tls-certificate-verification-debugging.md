---
title: "TLS 憑證驗證不是黑盒：用一次握手看懂 HTTPS 信任鏈與排錯"
description: "從 TLS 1.3 的身分驗證、完整性與機密性三個目標出發，拆解憑證、ECDHE 與 AEAD 各自的責任；附上可直接執行的 OpenSSL 檢查流程，讓 SSL 憑證錯誤能被定位而非繞過。"
publishDate: 2026-09-08T10:05:07+08:00
draft: false
featured: false
cover: ../../assets/covers/tls-certificate-verification-debugging.png
coverAlt: "藍色與琥珀色資料通道穿過玻璃信任邊界與金屬封印，連接兩台伺服器"
tags:
  - "資訊安全"
  - "網路協定"
  - "TLS 1.3"
  - "API 安全"
series: 現代網路協定與 API 平台架構
seriesOrder: 10
---

「憑證過期」或 `SSLCertVerificationError` 常被當成部署瑣事：換一張憑證、加上忽略驗證的旗標，請求能通就結案。這樣做只是把症狀推走，沒有回答真正的問題：此連線到底為什麼值得信任？

TLS 不是 HTTPS 底下的一個黑箱。它把兩端的身分、協商出的金鑰，以及後續每筆資料的防篡改綁成同一條安全通道。IETF 對 TLS 1.3 的定義也很直接：協定目標是防止竊聽、篡改與訊息偽造。[RFC 8446](https://www.rfc-editor.org/rfc/rfc8446.html) 將這三件事分別落在 authentication、confidentiality 與 integrity。

本文受 [Jaydeep 的 TLS/SSL 說明](https://x.com/_jaydeepkarale/status/2096954076890284516) 啟發，但把重點移到可操作的責任邊界：憑證、金鑰協商、資料保護各自做什麼，以及錯誤發生時該驗證哪一層。

## HTTPS 的三個保證，對應三種不同機制

| 目標                       | TLS 提供的保證                                                    | 不該誤解成                                   |
| -------------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| 身分驗證（Authentication） | Client 確認連到的伺服器持有對應私鑰，且其憑證鏈與主機名稱可被信任 | 憑證本身會加密所有資料                       |
| 機密性（Confidentiality）  | 建立通道後，只有兩端能讀取 application data                       | TLS 會隱藏所有流量中繼資料；長度仍可能被觀察 |
| 完整性（Integrity）        | 攻擊者修改傳輸資料會被偵測                                        | 對內容做一次裸 SHA-256 就能驗證發送者        |

這張表是排錯時最實用的切法。憑證鏈失敗是身分驗證問題；握手完成後被改過的資料是 record protection 問題；兩者不能靠同一個「關掉驗證」解決。

> [!IMPORTANT]
> **停止規則：任何 production client 出現憑證驗證錯誤，都不應以停用驗證作為修復。**先取得握手與憑證鏈輸出，確認 hostname、有效期、信任錨與中繼憑證，再改設定或重新簽發。

## TLS 1.3：憑證驗身分，ECDHE 生金鑰，AEAD 保資料

現代 TLS 1.3 的流程可縮成四個責任明確的階段：

1. ClientHello 帶著支援的版本、演算法與 key share 發起協商。
2. ServerHello 選定參數；伺服器送出憑證與 CertificateVerify，證明它持有憑證公鑰配對的私鑰。
3. client 驗證憑證鏈與主機名稱，雙方以 `(EC)DHE` shared secret 透過 HKDF 派生流量金鑰。
4. 後續資料以 AEAD 保護；其驗證標記同時提供機密性與完整性。

RFC 8446 將握手定義為驗證通訊端、協商參數並建立 shared keying material 的協定；record protocol 才使用這些參數保護後續流量。[握手與 record protocol 的分工](https://www.rfc-editor.org/rfc/rfc8446.html#section-1) 是理解 TLS 的核心。

這也修正一個常見說法：TLS 1.3 不是「client 產生 session key，再用伺服器公鑰加密送過去」。TLS 1.3 已移除靜態 RSA key exchange；雙方用 `(EC)DHE` 協商共享秘密並由 HKDF 派生金鑰。[RFC 8446 的 key schedule](https://www.rfc-editor.org/rfc/rfc8446.html#section-7) 是精確的依據。

同樣地，單純把 `SHA-256(data)` 和資料一起傳送，不能證明來源：能替換資料的攻擊者也能重算 hash。TLS 1.3 使用 AEAD 與握手 transcript 的驗證，將完整性和持有秘密金鑰的端點綁在一起；裸 hash 只適合偵測非對抗性的意外改動。

## 憑證驗證至少包含 hostname、鏈與時間

瀏覽器或 client 不是只看「憑證還沒過期」。它需要確認：

- 目標主機名稱是否符合憑證的 SAN；連 `api.example.com` 卻收到只簽給 `example.com` 的憑證，應該失敗。
- leaf certificate 能否沿著 issuer chain 走到本機信任的 trust anchor。
- 每張相關憑證是否仍在有效期間，並符合用途與基本約束。
- 對端是否真的持有私鑰，亦即能通過握手中的簽名驗證。

X.509 的路徑驗證以 trust anchor、目標憑證與認證路徑為輸入；鏈如何取得則是應用與實作環境的責任。[RFC 5280 §6.1](https://www.rfc-editor.org/rfc/rfc5280.html#section-6.1) 說明了這個邊界。主機名稱比對不是附加功能，而是阻擋「拿到另一個合法憑證就能冒充網站」的必要條件；可參考 [RFC 6125](https://www.rfc-editor.org/rfc/rfc6125.html)。

## 一條命令先把問題拆開

當應用程式拋出 TLS 錯誤時，先在同一個執行環境跑下列命令，保留完整輸出到 incident 或部署紀錄：

```bash
openssl s_client \\
  -connect api.example.com:443 \\
  -servername api.example.com \\
  -verify_hostname api.example.com \\
  -verify_return_error \\
  -showcerts </dev/null
```

`-servername` 送出 SNI，確保虛擬主機回傳正確憑證；`-verify_hostname` 強迫把連線目標納入驗證；`-verify_return_error` 讓驗證錯誤不被默默略過。這些選項與 `s_client` 的連線與驗證行為可見於 [OpenSSL 文件](https://docs.openssl.org/3.4/man1/openssl-s_client/)。

接著，將輸出的 leaf certificate 存成 `certificate.pem`，再只讀你要判斷的欄位：

```bash
openssl x509 -in certificate.pem -noout \\
  -subject -issuer -dates -ext subjectAltName
```

| 現象                                     | 優先檢查                                         | 正確修復方向                                        |
| ---------------------------------------- | ------------------------------------------------ | --------------------------------------------------- |
| `hostname mismatch`                      | SNI、SAN 與 client 實際連線 host                 | 為正確 hostname 簽發或修正 client endpoint          |
| `certificate has expired`                | leaf 與中繼憑證的 `notAfter`、系統時鐘           | 續發與部署完整鏈；對時後重試                        |
| `unable to get local issuer certificate` | server 是否送出 intermediate、client trust store | 補齊鏈或更新受管信任根；不要略過 verify             |
| 只有內網服務失敗                         | private CA 是否安裝在所有呼叫端                  | 發布並輪換內部 trust root，或採 mTLS 的受管身分流程 |

`openssl x509` 支援讀取 subject、issuer、dates 與 extensions；不要從肉眼判斷瀏覽器鎖頭圖示。[OpenSSL x509 文件](https://docs.openssl.org/3.4/man1/openssl-x509/) 是各選項的權威參考。

## 把 TLS 當成一項可驗證的依賴

我的立場是：TLS 不應只由平台或 ingress 團隊「處理掉」。API client 的 endpoint、SNI、trust store、憑證輪換與告警都是服務正確性的一部分。下一次 CI 或部署檢查，至少對每個公開 endpoint 執行一次上述 `s_client` 驗證，並在到期日前告警。這比事故當下把 `verify=false` 寫進程式碼少得多。

若你要再往底層看握手延遲、前向保密與 0-RTT 的取捨，可接著閱讀本站的 [TLS 1.3 握手與 0-RTT 安全](/blog/tls-1-3-handshake-zero-rtt-security/)。
