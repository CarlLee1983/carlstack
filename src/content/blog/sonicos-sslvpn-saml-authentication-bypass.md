---
title: "SonicOS SSLVPN 的 SAML 驗證繞過漏洞"
description: "CVE-2026-19868 已列入 KEV。整理替代驗證憑證的攻擊前提、Gen7／Gen8 修補版本與 NSv 升級差異，並說明如何驗收 VPN 登入政策與追查可疑連線。"
publishDate: 2026-11-07T10:10:43+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - 事件應變
  - 系統設計
series: 現代網路協定與 API 平台架構
seriesOrder: 29
cover: ../../assets/covers/sonicos-sslvpn-saml-authentication-bypass.webp
coverAlt: "米白陶瓷模型的兩條入口通往同一庭院：左側設兩道閉門，右側僅有一道插著鑰匙的開門，比喻替代驗證仍需有效憑證，卻可能未套用相同的登入政策。"
---

SonicOS SSLVPN 的 CVE-2026-19868 已在 2026 年 11 月 6 日列入 CISA KEV。攻擊者若持有另一種驗證方式的有效憑證，可能繞過 SAML 驗證，以及由 SAML 強制執行的 MFA。已啟用 SAML MFA 的團隊，也需要盤點受影響版本與其他登入方式。

這項前提來自 [SonicWall 提交的 CVE 紀錄](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/19xxx/CVE-2026-19868.json)。同一份紀錄中的 CISA 資料將利用狀態標為 active，並記錄 [KEV 收錄日期](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-19868)。[加拿大資安中心 11 月 6 日通報](https://www.cyber.gc.ca/en/alerts-advisories/sonicwall-security-advisory-av26-1133)也確認 SonicWall 已表示漏洞遭到利用。

以下依 11 月 7 日查閱的一手資料整理。我沒有操作 SonicOS、重現漏洞或檢視受害組織的紀錄。後面的驗收與調查清單是工程建議，實際升級程序要按機型與目前版本確認。

## 替代登入方式可能沒有套用 SAML 政策

CNA 要求另一驗證方式的有效憑證，繞過範圍是 SAML 驗證控制及其強制的 MFA。這不是完全無憑證的登入漏洞，也不足以推論所有 MFA 實作都被破解。

對維運團隊，這會改變「已開 MFA」的驗收方式。只測使用者經過 IdP、收到第二因素挑戰、成功建立 VPN，證明的是這條正常路徑可用。還要確認同一個帳號能不能選擇另一種登入方式，以及那條路徑應該要求什麼。

盤點表可以逐項記錄 SSLVPN 入口、可用驗證方式、帳號來源、適用群組、MFA 執行位置與預期允許結果。例如，本機帳號或外部驗證服務是否仍可登入，應按現場設定查證。這些是盤點項目，不能直接當成每種方式都已確認可利用的清單。

如果組織政策規定某群組必須經過 SAML MFA，替代登入路徑也必須符合該限制。保留給緊急管理的帳號，則要另行確認用途、可達範圍與稽核方式，避免成為未記錄的例外。

## 修補版本按 Gen7 與 Gen8 分開核對

[SonicWall 產品公告](https://www.sonicwall.com/support/notices/kA1VN000002eBLN0A2)初次發布於 11 月 3 日，最後更新於 11 月 6 日。公告涵蓋 Gen7 與 Gen8 的實體及虛擬防火牆，列出的版本如下：

- Gen7：`7.3.3-7015` 及更舊版本受影響，修補範圍從 `7.3.4-7013` 起。公告另列出 11 月 5 日的 `7.3.4-7015`。
- Gen8：`8.2.2-8015` 及更舊版本受影響，修補版本為 `8.2.3-8015`。公告的供應時間欄仍寫預定 11 月 6 日發布，對應的 [8.2.3-8015 release notes](https://www.sonicwall.com/support/technical-documentation/docs/sonicos8-release_notes/Content/SonicOS-8-2-3-8015.htm)已列出替代驗證方式的 SSLVPN 修正。

加拿大通報把 Gen8 範圍寫成「早於 `8.2.2-8015`」，與原廠公告及 CNA 紀錄不一致。**`8.2.2-8015` 本身仍在原廠受影響清單內。** 資產盤點與修補判定採用原廠版本，不把這一版判成已修補。

版本號也要連同機型檢查。[7.3.4-7013 release notes](https://www.sonicwall.com/support/technical-documentation/docs/sonicos-7.3-release_notes/Content/sonicos-7-3-4-7013.htm)當時沒有提供 NSv 版本，[7.3.4-7015 release notes](https://www.sonicwall.com/support/technical-documentation/docs/sonicos-7.3-release_notes/Content/sonicos-7-3-4-7015.htm)才明列 NSv 270／470／870，並列出 SSLVPN 替代驗證修正。Gen7 NSv 應據此確認可下載、受支援的韌體與升級程序，不能只拿通用修補基線安排變更。

同一份 7.3.4-7015 文件還寫明，NSv 從 `7.0.1` 升到 `7.1.x` 或以上需要重新安裝，且不支援從 `7.3.4` 降回較舊版本。變更單若只寫「出問題就降版」，還缺一個可行的復原方案。備份、管理通道與復原程序要在維護前確認。

## 升級驗收要包含被拒絕的登入

對外可達、落在受影響版本且使用 SAML 的 SSLVPN，我會安排緊急修補。暫時無法升級時，可經變更程序限制可達來源，或停用非必要的 SSLVPN 服務，並確認遠端使用者與管理者的替代連線。這是降低暴露面的措施，不取代韌體更新。

每台防火牆的變更紀錄至少留下實際機型、升級前後執行版本、使用中的驗證方式與測試時間。HA 部署也要逐台核對，避免備援節點仍執行舊版。韌體檔已上傳或管理平台顯示工作成功，都不能代替裝置正在執行的 build。

在有權測試的環境，用專用測試帳號檢查以下情況，保留結果與對應紀錄：

1. 正常完成 SAML 與 MFA 後，可以建立授權範圍內的 VPN 連線。
2. 取消或未完成 MFA 時，無法建立新的授權連線。測試前排除既有登入工作階段造成的干擾。
3. 屬於強制 SAML 群組的帳號，不能改走政策不允許的替代驗證方式登入。
4. 已停用帳號與未授權群組受到拒絕，備援切換後仍維持相同政策。

這些測試檢查登入政策與升級後行為，沒有重現漏洞的特製請求。若一般負向測試已出現不該成功的連線，就停止放行，保留紀錄並交由維運與原廠支援確認。

## 從 VPN 連線回查身分驗證紀錄

修補前的調查不能只看 IdP 的 MFA 成功率。既然漏洞涉及替代驗證，調查起點應包含防火牆端已建立的 SSLVPN 連線，再對照相關身分服務紀錄。

可依帳號、連線時間、來源位址與分配的 VPN 位址建立時間線，檢查異常的驗證方式、非預期登入時段，以及登入後的內部存取。同時保留防火牆、IdP、外部驗證服務及集中日誌的原始紀錄，註明時區、時間差與缺漏區間。盡可能在維護前完成匯出，避免只剩升級後的新紀錄。

一筆 VPN 成功連線沒有對應的 SAML 紀錄，值得調查，但也可能來自核准的例外帳號、既有工作階段或日誌缺漏。需要把設定、連線與後續活動放在一起判讀。確認有可疑帳號或工作階段後，再按事件應變程序限制存取、撤銷工作階段與更換受影響憑證，不假設重啟防火牆就已處理所有遭竊憑證。

站內的 [SonicWall SMA1000 修補分析](/blog/sonicwall-sma1000-patch-and-exploitation-evidence/)處理的是另一個產品與 CVE，版本清單不能沿用。[Alpine OpenSSH 驗證漏洞](/blog/alpine-openssh-password-authentication-bypass/)也適合對照閱讀。帳號平常使用的登入方式，不一定涵蓋伺服器仍接受的所有驗證路徑。

下一張變更單可以直接補上兩項驗收資料：每台節點正在執行的修補版本，以及強制 SAML 群組經替代方式登入時的拒絕紀錄。可疑歷史連線另列調查項目，指定負責人與待補的日誌。
