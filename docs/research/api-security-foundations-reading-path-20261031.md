# API／網路、安全基礎目錄導讀查核

查核日期：2026-10-31。目的是分類導讀與基本機制說明，不逐 Reel 重寫。新稿：api-network-foundations-reading-path、security-foundations-reading-path。編輯要求為既有基礎文重用、缺口在導讀補清楚、進階文標示延伸；不宣稱讀者已完成練習。

## 去重與來源識別

在 main 5d84b27 的 src/content/blog、docs/research、docs/article-queue.md 搜尋以下 stable ID 未找到已刊對應，但概念已有文章，因此兩篇僅新增跨主題入門閱讀路徑與可驗證基本案例，非重製既有核心正文。保留 canonical Reel URL 在文章：

- 選題來源是公開的 Code H、Sundar Sundar、Code Crack、UCFYX 與 FutureStacks 影片；完整公開來源網址保留在兩篇正式文章的「選題來源」段落，研究紀錄不另存數字識別碼。
- 同一 API 通訊方式影片的重複分享只計一次；Cookie 與 Session 是影片的教學題名，並非任何使用者的登入憑證。沒有收集或保存真實 Cookie、Session ID、Token、帳戶資料或私人專案資料。
- 公開圖卡僅提供選題線索，未採用觀看數為重要性或效能證據。
- 重用：rest-graphql-request-response-foundations、cookie-session-token-login-foundations。其餘站內連結標為深入方向，不宣稱是新寫的入門課程。

## 段落與官方原文

所有下列頁面以 web open 取得原文，非搜尋摘要。正文採摘要轉述，沒有逐字長引文。

- API 第一站：MDN Domain Name https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name 與 HTTP Overview https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview 。支援主機名稱/IP、請求/回應/格式之分。
- API 第二站：GitHub https://docs.github.com/en/webhooks/about-webhooks ，事件訂閱與發送 HTTP 請求；MDN https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API ，雙向連線。Webhook 投遞保證依供應商而異，未宣稱通用 exactly-once。
- API 第三站：MDN https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS ，origin 三部分、preflight 與非 preflight 情況、瀏覽器存取限制。沒有將 CORS 說成授權或 CSRF 的通用替代。
- API 第四站及安全第五站：RFC8446 section1 https://www.rfc-editor.org/rfc/rfc8446.html#section-1 ，TLS 通道安全目標。教學推論明確區分應用層權限。
- 安全第一站：OWASP Authorization https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html ，default deny、每次請求授權、資源/功能範圍。
- 安全第二站：OWASP Session Management https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html ，Cookie 屬性、登入更新 ID、登出失效；CSRF https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html 。
- 安全第三站：OWASP SQL Injection https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html ，參數化；XSS https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html ，依輸出 context 編碼、HTML sanitization。
- 安全第四站：OWASP API4 https://api-security.owasp.org/editions/2023/en/0xa4-unrestricted-resource-consumption/ ，單次筆數、大小、時間、批次與費用限制；20/100 是本文假設，非來源建議或實測值。
- 安全第五站：GitHub https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-graph ，manifest/lockfile、直接間接依賴，明列工具涵蓋限制。

## 既有文章最小勘誤

api-security-owasp-top-10-defenses.mdx 原開頭「企業 90% 以上流量」無可追溯來源，刪除數值主張。原表格將 SSRF 標 API6，官方 https://api-security.owasp.org/editions/2023/en/0xa7-server-side-request-forgery/ 確認 API7；API6 原文 https://api-security.owasp.org/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/ 為敏感業務流程未受限制存取。保留 publishDate，實際 updatedDate，加入更正來源與部分清單說明。不擴大到全文改寫，也不把該舊文推薦為新基礎導讀的可信入門章。

## 驗證與限制

- 所有訂單、limit 數字、測試帳號與 HTTP 片段是教學例，不是公開部署或實測效能。
- 沒有對第三方服務發送安全掃描；練習限制在自有且授權的測試環境。
- 沒有新可執行程式；HTTP 為概念片段。純文字 HTML 練習不是漏洞利用。
- humanize-writing checker 已逐筆檢查並修正提示式冒號與聊天殘留；技術術語、來源 URL 保留。
- 封面、format/policy/check/test/build 與正式部署由批次整合者完成，本紀錄不宣稱已通過。

## 同列 SSRF 防護敘述複核

2026-10-31 10:02 UTC：依上述 OWASP API7 How To Prevent 原文，將原本「私有 IP（10.0.0.0/8, 169.254.169.254）」改為目的地／協定／連接埠限制、停用 HTTP 重新導向及隔離內部資源。移除誤將 link-local 位址稱為私有 IP 的例子，同時避免讓兩個 IP 範例被當成完整 SSRF 防護。僅改既有表格同一列，未擴展新攻擊示例或全文重寫。
