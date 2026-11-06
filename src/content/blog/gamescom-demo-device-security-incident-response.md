---
title: "Gamescom 展示裝置失竊後，開發團隊如何隔離資料與撤銷憑證"
description: "Gamescom 2026 多家獨立團隊的展示設備遭竊，未完成 build 與公司資料也面臨曝光風險。本文把事件轉成工程檢查：隔離展示環境、撤銷憑證，並在出發前演練設備失竊應變。"
publishDate: 2026-09-26T23:30:55+08:00
updatedDate: 2026-11-05T22:50:00Z
draft: false
featured: false
tags:
  - 資訊安全
  - 系統設計
  - 事件應變
cover: ../../assets/covers/gamescom-demo-device-security-incident-response.png
coverAlt: "空置的展場展示桌上留著斷開的安全線纜與拔除的電源線，象徵展示設備失竊後的安全風險"
---

展示筆電失竊，團隊會同時失去現場 Demo 的執行環境，以及對機內資料的控制。若裝置還登入公司服務，應變範圍就會延伸到帳號與工作階段。

Gamescom 2026 期間，獨立開發者 Ryan Laley 表示團隊筆電遭竊；Tessera Studios 說，兩台筆電與一台 Steam Deck 從展位失竊，裝置含有個人、公司與重要資料；iam8bit 也通報兩台筆電不見，並提醒被竊裝置可能讓未完成的遊戲版本曝光。[PC Gamer 的事件整理](https://www.pcgamer.com/gaming-industry/cd-projekt-red-opens-its-arasaka-hardware-archives-to-help-an-indie-dev-whose-gear-was-stolen-during-1-of-at-least-4-gamescom-thefts/)記錄了這些回報。這些報導描述的是 build 可能外流，未提供已外流的確認。失竊本身也無法證明資料已遭讀取。

主辦方 8 月 29 日的第一份聲明提到場館有制服保全、參展商可另行預訂攤位保全，並建議為設備投保；案件已通報警方。[Shacknews 整理的原始聲明與開發者回報](https://www.shacknews.com/article/150534/gamescom-2026-booth-theft)保留了當時的說法。依 PC Gamer 9 月 4 日的報導，Gamescom 承認批評有其道理，為第一輪回應缺乏同理心致歉，並承諾專門檢視獨立參展商的安全，以及和共用展位的組織者召開圓桌會議。[道歉聲明](https://x.com/gamescom/status/2093654741192433865)提出了檢討方向，但沒有列出完成期限或補償方案；PC Gamer 向主辦單位詢問後，也只收到請其參考已發布聲明的回覆。[PC Gamer 後續報導](https://www.pcgamer.com/gaming-industry/events-conferences/that-criticism-is-justified-gamescom-apologizes-for-its-callous-response-to-developer-hardware-thefts/)

保險可能補償硬體，展示時段與機內資料的風險仍需另外處理。原先引用的 [r/Games 首次聲明討論](https://www.reddit.com/r/Games/comments/1w1lz89/gamescom_team_addresses_theft_reports_from_show/)與[道歉後討論](https://www.reddit.com/r/Games/comments/1w74vbr/gamescom_apologizes_for_victimblaming_indie_devs/)保留供追溯，不以票數衡量事件嚴重性。

截至 2026 年 11 月 5 日，本次核對了新聞報導與下列安全指引。主辦方 X 道歉原帖未能直接讀取，相關內容依 PC Gamer 轉述；Reddit 討論頁可讀，但無法據此還原當時票數，這次不再引用精確票數或個別留言。後面的清單與演練是工程建議，沒有取得失竊裝置，也未操作真實端點、身分系統或 MDM。

## 展示設備不只是備用筆電

對開發團隊來說，展場 Demo 裝置很像一台被搬到公共空間的工作站。若它保存了內部帳號、有效期很長的 API token、測試客戶資料或未發布 build，設備遺失就同時涉及三種風險：展示服務中斷、資料或智慧財產曝光，以及裝置憑證被拿去存取其他系統。

報導沒有交代被竊裝置持有哪些憑證，不能把這份風險清單當作事件調查結果。Tessera Studios 已說明其設備含有個人與公司資料；iam8bit 則指出未完成版本可能因此外洩。團隊應在事故發生前先確認展示機上實際放了什麼，而不是遺失後才猜測影響範圍。

因此，Demo 機不應沿用工程師平日登入公司系統的個人工作環境。把它當成一台權限受限、資料最少、可以快速重建的臨時端點，會比事後依賴保險或遠端清除可靠。

## 先縮小裝置裡的資料與權限

出發前替展示環境訂一條明確規則：只帶完成 Demo 所需的資料與權限。可用下面這份概念清單檢查；欄位應依團隊的身分系統、裝置管理工具和建置流程調整。

```yaml
# 出展前的要求清單，不是 MDM 可直接匯入的設定
showcase_device:
  account: dedicated_demo
  data: synthetic_only
  credentials:
    production_allowed: false
    short_lived: true
    revocable: true
  storage:
    full_disk_encryption_required: true
    recovery_key_on_device_allowed: false
  remote_management:
    enrollment_required: true
    command_delivery_guaranteed: false
    completion_evidence_required: true
  build:
    trusted_source_required: true
    offline_backup_required: true
  incident_owner_required: true
```

如果 Demo 需要連線到測試服務，使用專用、限時且可撤銷的憑證；不要把正式 API key 寫進設定檔，也不要讓展示機沿用可讀取生產資料的 SSO 工作階段。OWASP 的[機密管理指引](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)建議採取最小權限，並為機密建立輪換、撤銷與生命週期管理方式。

全碟加密主要保護靜態儲存資料。展示機若正在執行、磁碟已解鎖，而且登入工作階段仍可操作，應用程式照樣能讀取檔案。鎖定螢幕也不等於卸載磁碟金鑰。[Microsoft 的 BitLocker 防護說明](https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/countermeasures)區分睡眠、休眠與開機前驗證；收展時應依裝置平台與威脅模型確認電源狀態、驗證方式，以及復原金鑰是否另外保管。

遠端清除則依賴事前完成的管理註冊、平台支援與命令送達能力。[NIST SP 800-124 Rev. 2 第 4.3.3 節](https://csrc.nist.gov/pubs/sp/800/124/r2/final)指出，iOS、Android 原生遠端清除需要裝置開機且連網，也提到部分第三方管理系統有離線清除能力。該指引以行動裝置為範圍，不能直接視為每台筆電或 Steam Deck 都支援相同操作。

對自己的展示機，至少記下最後連線時間、命令狀態與完成回報。**清除命令已送出，不等於裝置已清除。** 即使收到完成回報，也無法收回此前已複製的資料。出發前要驗證所選平台的能力，不能到失竊後才假設它會上線接受指令。

## 把場地方與參展商的責任接起來

活動主辦方負責場館與共用區域的安全安排，參展團隊則最了解自己的裝置、帳號與 build。這兩邊各自有控制面；只把文字寫在合約或參展指南裡，仍不會自動形成一條可操作的事故流程。這裡討論的是作業分工，法律與賠償責任仍須依合約及適用法規判斷。

活動前，主辦方與參展團隊至少應確認三件事：

- 區域分工：列出展位、共用儲物區與夜間封場後的負責窗口，以及出入權限如何核對。
- 事故窗口：提供一個有人值守的聯絡方式，說明如何通報、如何保留現場與紀錄，以及何時聯絡警方。
- 控制與交接：參展商負責裝置清單、加密、備份與帳號隔離；主辦方負責場館側的通行與保全資訊。雙方要事先知道事件發生後如何交接。

這份分工讓參展商知道一般場館保全涵蓋什麼、自己的展位還需要安排什麼，也讓事故後的恢復作業有明確窗口。Gamescom 第一份聲明列出場館保全與另購攤位保全；設備清單、權限清單與備援 Demo，仍須由團隊在出發前備妥。

## 遺失後先撤權限，再追設備

裝置離開團隊控制後，應變負責人應並行通報場地方、保存紀錄，以及限制它對公司服務的存取。先依資產清單確認裝置登入過哪些帳號、持有哪些 token、保存哪些 build 與資料，再決定停用裝置身分、撤銷登入工作階段和輪換機密的範圍。[OWASP 機密管理指引](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)涵蓋撤銷與稽核紀錄，工單應記下誰在何時撤銷了哪項存取，以及如何確認生效。

改密碼不一定會立即終止所有存取。以 [Microsoft Entra 的緊急撤權說明](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access)為例，既有 access token 可能仍有有效期，應用程式自行簽發的 session cookie 也需要應用程式端處理。處置時要分別核對 IdP 工作階段、refresh token、API key 與各服務的登入狀態，並記錄仍待失效的存取。撤權可以在伺服器側進行，不必等待遺失裝置重新連線。

清除裝置前，應變負責人要評估資料暴露風險與證據保全需求，保存雲端登入紀錄、MDM 操作與狀態、裝置識別碼、時間線及報案資料。遠端清除可能破壞機內證據；是否立即執行，應依事件流程由有權限的人決定並留下理由。若有正在發生的危害，不能為了等待完整蒐證而延誤必要的隔離與撤權。找回裝置後也應先交由應變人員處理，避免直接開機接回公司網路。

同時要從另一台乾淨裝置恢復展示能力：使用可信任來源重新佈署 Demo、對照可信任發布管道提供的 build 簽章或雜湊、載入合成資料，並驗證新憑證權限符合預期。若未完成 build 可能已暴露，應依版本保密與合作協議決定是否通知相關團隊；不要在調查結論未明前，直接宣稱「已外洩」或「沒有風險」。

下次帶設備出展前，安排一次失竊演練：假設唯一一台展示筆電在夜間遺失，讓指定負責人用事先核准的測試帳號與備用裝置驗證三件事：如何停用它的登入權限、如何重建 Demo、如何判斷未公開資料是否可能被讀取。若三個答案都依賴「到時候再問某人」，那台設備仍然是沒有復原路徑的單點故障。

## 參考資料

- [Shacknews：Gamescom 2026 展位設備失竊與主辦方聲明](https://www.shacknews.com/article/150534/gamescom-2026-booth-theft)，2026-08-29。
- [Game Developer：獨立開發者與發行商在 Gamescom 遭遇設備失竊](https://www.gamedeveloper.com/business/indie-devs-and-publishers-hit-in-gamescom-equipment-thefts)，2026-08-31。
- [PC Gamer：CD Projekt Red 協助受影響開發者](https://www.pcgamer.com/gaming-industry/cd-projekt-red-opens-its-arasaka-hardware-archives-to-help-an-indie-dev-whose-gear-was-stolen-during-1-of-at-least-4-gamescom-thefts/)，2026-08-31。
- [Gamescom：回應設備失竊批評的道歉聲明](https://x.com/gamescom/status/2093654741192433865)，2026-09-04。
- [PC Gamer：Gamescom 道歉並承諾檢視獨立參展商安全](https://www.pcgamer.com/gaming-industry/events-conferences/that-criticism-is-justified-gamescom-apologizes-for-its-callous-response-to-developer-hardware-thefts/)，2026-09-04。
- [NIST SP 800-124 Rev. 2：企業行動裝置安全管理](https://csrc.nist.gov/pubs/sp/800/124/r2/final)，2023-05。
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)。
