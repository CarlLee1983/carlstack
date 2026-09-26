---
title: "Gamescom 失竊風波提醒開發團隊：Demo 設備也要按生產資產管理"
description: "Gamescom 2026 多家獨立團隊的展示設備遭竊，未完成 build 與公司資料也面臨曝光風險。本文把事件轉成工程檢查：隔離展示環境、撤銷憑證，並在出發前演練設備失竊應變。"
publishDate: 2026-09-26T23:30:55+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - 系統設計
  - 事件應變
cover: ../../assets/covers/gamescom-demo-device-security-incident-response.png
coverAlt: "空置的展場展示桌上留著斷開的安全線纜與拔除的電源線，象徵展示設備失竊後的安全風險"
---

一台展示筆電被偷，損失不只是一張採購單。它可能同時是現場 Demo 的執行環境、未公開版本的載體、公司資料的容器，也是登入公司服務的端點。

Gamescom 2026 期間，獨立開發者 Ryan Laley 表示團隊筆電遭竊；Tessera Studios 說，兩台筆電與一台 Steam Deck 從展位失竊，裝置含有個人、公司與重要資料；iam8bit 也通報兩台筆電不見，並提醒被竊裝置可能讓未完成的遊戲版本曝光。[PC Gamer 的事件整理](https://www.pcgamer.com/gaming-industry/cd-projekt-red-opens-its-arasaka-hardware-archives-to-help-an-indie-dev-whose-gear-was-stolen-during-1-of-at-least-4-gamescom-thefts/)記錄了這些回報。現有報導指出的是 build 有外洩風險，沒有證據證明它們已經外流。

主辦方 8 月 29 日的第一份聲明提到場館有制服保全、參展商可另行預訂攤位保全，並建議為設備投保；案件已通報警方。[Shacknews 整理的原始聲明與開發者回報](https://www.shacknews.com/article/150534/gamescom-2026-booth-theft)保留了當時的說法。9 月 4 日，Gamescom 承認批評有其道理，為第一輪回應缺乏同理心致歉，並承諾專門檢視獨立參展商的安全，以及和共用展位的組織者召開圓桌會議。[道歉聲明](https://x.com/gamescom/status/2093654741192433865)提出了檢討方向，但沒有列出完成期限或補償方案；PC Gamer 向主辦單位詢問後，也只收到請其參考已發布聲明的回覆。[PC Gamer 後續報導](https://www.pcgamer.com/gaming-industry/events-conferences/that-criticism-is-justified-gamescom-apologizes-for-its-callous-response-to-developer-hardware-thefts/)

這件事在社群裡也不只停留在新聞轉貼。r/Games 對第一份聲明與後續道歉的討論，在 2026 年 9 月 26 日查詢時分別有 817 與 816 票。第一篇討論中，u/Zealroth 寫道：「No amount of insurance will salvage that waste of money.」[兩則討論串](https://www.reddit.com/r/Games/comments/1w1lz89/gamescom_team_addresses_theft_reports_from_show/)與[道歉後的討論](https://www.reddit.com/r/Games/comments/1w74vbr/gamescom_apologizes_for_victimblaming_indie_devs/)呈現了焦點：保險或許能賠設備，卻無法補回錯過的展示時段，也無法單獨處理未公開 build 與憑證的暴露風險。

## 展示設備不只是備用筆電

對開發團隊來說，展場 Demo 裝置很像一台被搬到公共空間的工作站。若它保存了內部帳號、有效期很長的 API token、測試客戶資料或未發布 build，設備遺失就同時涉及三種風險：展示服務中斷、資料或智慧財產曝光，以及裝置憑證被拿去存取其他系統。

這是從已知事件延伸出的工程判斷，不代表 Gamescom 的被竊裝置確實含有哪一種憑證。Tessera Studios 已說明其設備含有個人與公司資料；iam8bit 則指出未完成版本可能因此外洩。團隊應在事故發生前先確認展示機上實際放了什麼，而不是遺失後才猜測影響範圍。

因此，Demo 機不應沿用工程師平日登入公司系統的個人工作環境。把它當成一台權限受限、資料最少、可以快速重建的臨時端點，會比事後依賴保險或遠端清除可靠。

## 先縮小裝置裡的資料與權限

出發前替展示環境訂一條明確規則：只帶完成 Demo 所需的資料與權限。可用下面這份概念清單檢查；欄位應依團隊的身分系統、裝置管理工具和建置流程調整。

```yaml
showcase_device:
  account: 專用展示帳號，不使用工程師個人帳號
  data: 合成資料，不複製正式客戶資料
  credentials: 最小權限、短效；不得放入正式環境憑證
  storage: 全碟加密，遺失時可鎖定或清除
  build: 可從可信任來源重建，並保留離線備份
  incident_owner: 指定接報與撤銷憑證的負責人
```

如果 Demo 需要連線到測試服務，使用專用、限時且可撤銷的憑證；不要把正式 API key 寫進設定檔，也不要讓展示機沿用可讀取生產資料的 SSO 工作階段。OWASP 的[機密管理指引](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)建議採取最小權限，並為機密建立輪換、撤銷與生命週期管理方式。

全碟加密與遠端清除也不能互相取代。NIST 指出，遠端清除通常需要裝置開機並連上網路，攻擊者可能在清除前讀取資料；遠端清除不應是保護敏感資料的唯一控制。[NIST SP 800-124 Rev. 2](https://csrc.nist.gov/pubs/sp/800/124/r2/final)因此把裝置生命週期、管理控制與端點防護一起納入考量。實務上應同時降低裝置裡的資料量、加密儲存，並預先確認誰能發出鎖定或清除命令。

## 把場地方與參展商的責任接起來

活動主辦方負責場館與共用區域的安全安排，參展團隊則最了解自己的裝置、帳號與 build。這兩邊各自有控制面；只把文字寫在合約或參展指南裡，仍不會自動形成一條可操作的事故流程。這是本文的工程建議，不是對法律責任的判定。

活動前，主辦方與參展團隊至少應確認三件事：

- **誰負責哪個區域：**列出展位、共用儲物區與夜間封場後的負責窗口，以及出入權限如何核對。
- **事故要找誰：**提供一個有人值守的聯絡方式，說明如何通報、如何保留現場與紀錄，以及何時聯絡警方。
- **哪些控制由誰執行：**參展商負責裝置清單、加密、備份與帳號隔離；主辦方負責場館側的通行與保全資訊。雙方要事先知道事件發生後如何交接。

這份分工不會保證失竊絕不發生。它讓「一般場館保全」與「特定展位需要的保護」之間不再留下一塊沒有人負責的空白。Gamescom 第一份聲明列出場館保全與另購攤位保全；社群的反彈則顯示，受影響者期待的不只是提醒自己投保，也包括事件後誰協助恢復展示。[r/Games 討論串](https://www.reddit.com/r/Games/comments/1w1lz89/gamescom_team_addresses_theft_reports_from_show/)。

## 遺失後先撤權限，再追設備

裝置離開團隊控制後，處置順序不該只有「找回筆電」。負責人應立即確認該裝置登入過哪些帳號、持有哪些 token、保存哪些 build 與測試資料，再依風險鎖定裝置、撤銷工作階段、輪換可能曝光的機密，並保留相關存取紀錄。OWASP 建議機密在可能遭到洩漏時可以被撤銷，並要求團隊保存足以追查其存取與輪換歷程的資訊。[機密管理指引](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

同時要從另一台乾淨裝置恢復展示能力：使用可信任來源重新佈署 Demo、確認 build 簽章或雜湊、載入合成資料，並驗證新憑證權限符合預期。若未完成 build 可能已暴露，應依版本保密與合作協議決定是否通知相關團隊；不要在調查結論未明前，直接宣稱「已外洩」或「沒有風險」。

下次帶設備出展前，做一次 15 分鐘的失竊演練：假設唯一一台展示筆電在夜間遺失，讓指定負責人實際回答並操作三件事：如何停用它的登入權限、如何重建 Demo、如何判斷未公開資料是否可能被讀取。若三個答案都依賴「到時候再問某人」，那台設備仍然是沒有復原路徑的單點故障。

## 參考資料

- [Shacknews：Gamescom 2026 展位設備失竊與主辦方聲明](https://www.shacknews.com/article/150534/gamescom-2026-booth-theft)，2026-08-29。
- [Game Developer：獨立開發者與發行商在 Gamescom 遭遇設備失竊](https://www.gamedeveloper.com/business/indie-devs-and-publishers-hit-in-gamescom-equipment-thefts)，2026-08-31。
- [PC Gamer：CD Projekt Red 協助受影響開發者](https://www.pcgamer.com/gaming-industry/cd-projekt-red-opens-its-arasaka-hardware-archives-to-help-an-indie-dev-whose-gear-was-stolen-during-1-of-at-least-4-gamescom-thefts/)，2026-08-31。
- [Gamescom：回應設備失竊批評的道歉聲明](https://x.com/gamescom/status/2093654741192433865)，2026-09-04。
- [PC Gamer：Gamescom 道歉並承諾檢視獨立參展商安全](https://www.pcgamer.com/gaming-industry/events-conferences/that-criticism-is-justified-gamescom-apologizes-for-its-callous-response-to-developer-hardware-thefts/)，2026-09-04。
- [NIST SP 800-124 Rev. 2：企業行動裝置安全管理](https://csrc.nist.gov/pubs/sp/800/124/r2/final)，2023-05。
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)。
