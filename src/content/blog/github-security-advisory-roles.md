---
title: "GitHub 私有漏洞通報的權限分工"
description: "GitHub 將漏洞通報的受理、編修與發布分成不同權限。用一個套件維護團隊的例子，說明角色怎麼配，以及如何驗證值班人員不能提早公開公告。"
publishDate: 2026-11-21T10:09:44+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - GitHub
cover: "../../assets/covers/github-security-advisory-roles.webp"
coverAlt: "封閉的綠色文件夾旁放著四張分開的鑰匙卡，其中一張是琥珀色。"
---

私有漏洞通報送進來時，值班工程師要先決定是否受理。補丁可能還沒寫，受影響的版本也還在查。這時就給值班人員公開公告的權限，等於讓他能在使用者還拿不到修補時揭露問題。GitHub 在 2026 年 11 月 20 日正式推出安全公告的細分權限。[有自訂 repository role 的組織](https://github.blog/changelog/2026-11-20-security-advisory-permissions-are-now-generally-available/)可以把受理與發布交給不同的人，不必為了處理通報給整個 repository 的管理員權限。

## 值班人員可以受理，不必能發公告

設想一個維護兩個公開套件的團隊。值班人員輪流看通報，維護者寫補丁，發布負責人等套件上架後才公開修補資訊。這三個人可以是同一人，但平常不必人人都有三份權限。

- **受理通報**：給「檢視安全公告」及「接受私有漏洞通報、關閉或重新開啟安全公告」。受理權限本身也能關閉案件；若你只希望值班人員閱讀及轉交，先給檢視即可，接受或關閉交給另一人。
- **準備修補**：給「建立、編輯及管理安全公告」。它包含檢視，還可留言、管理協作者、建立暫時的私有 fork。機密留言另需該 repository 的寫入權限。
- **公開公告**：給「發布安全公告及要求 CVE」及其先決的檢視或管理權限。如果發布負責人只驗稿和決定何時公開，檢視搭配發布就足夠。GitHub 把「發布」與「要求 CVE」放在同一項權限；若公司要求分人覆核，需由內部流程補上。

建私有 fork 和把修補合回去也是兩件事。依 GitHub 公告，從暫時私有 fork 合併仍需 repository 管理員或 security manager；給修補人員公告管理權限，並不會讓他取得這項能力。上線前要先指定誰負責合併，否則直到修補做好才發現沒有人能接手。

## 用實際帳號確認權限沒有從別處加回去

自訂角色從既有角色繼承權限，再加上額外項目。[GitHub 的角色文件](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/about-custom-repository-roles)說明，組織預設權限、團隊和個別授權會累加。若值班人員也在管理團隊，即使你給的值班角色沒勾發布，他的實際權限仍可能允許發布。

可在組織的測試 repository 建一份不含真實漏洞或客戶資料的虛構通報。用實際值班身分確認能接受通報、不能公開公告或要求 CVE；換到另一個沒指派角色的 repository，再確認看不到它的私有通報。接著讓修補人員建立暫時私有 fork，核對合併由指定管理角色接手。檢查發布者的有效權限與待發布狀態即可，別為了測試把虛構漏洞寫進公開公告或送出 CVE 申請。

GitHub 的[安全公告文件](https://docs.github.com/en/code-security/concepts/vulnerability-reporting-and-management/repository-security-advisories)說明公開儲存庫的私下協作及公告流程。上述分工是設定建議，沒有在 GitHub Enterprise Cloud 實際操作或驗證。要導入時，先挑一個有值班輪替的 repository，列出誰受理、誰合併、誰公開，再用值班帳號驗一次「可以受理，不能公開」。
