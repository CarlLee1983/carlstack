---
title: "1Password 事件中的正式環境部署權限"
description: "從 1Password 的事件公告出發，說明如何把程式碼審查、建置產物與正式環境部署分開驗證。"
publishDate: 2026-11-26T10:04:34+08:00
draft: false
featured: false
tags: [資安, CI/CD, GitHub Actions]
cover: ../../assets/1password-incident-production-deploy-permissions.webp
coverAlt: "兩道分開的金屬門立在深青色平台上，前方有一張紙。"
---

如果工程師的 GitHub 帳號被盜，這個帳號能改程式碼、啟動建置，還是也能把新版本送進正式環境？三個問題要分開回答。只看到 pull request 有人審過，還不能證明正式環境跑的是那個版本。

[1Password 於 11 月 25 日公布事件](https://1password.com/blog/update-on-nov-2026-security-incident)。公司從 11 月 19 日開始調查，稱入侵者利用員工的公司 GitHub 帳號存取原始碼，並將惡意程式碼推送至後端服務。部分客戶的姓名、登入電郵、帳戶中繼資料與特定邀請或復原連結的 token 遭複製。公司表示，這些 token 無法單獨取得帳戶存取權；密碼庫、內容及保護金鑰未受影響，使用者不必為此重設密碼。若收到非預期的邀請或復原通知，請直接開官方 App 查核。

1Password 也說，入侵者取得了 CI/CD 系統的存取權，公司已撤銷相關存取並輪替可能暴露的內部憑證。公告沒有交代攻擊者透過哪一個 workflow 或哪種部署權限把程式送上去。本文只談自家部署可以怎麼檢查，不推測該公司用了什麼設定。

## 把部署權限留在正式環境的工作

以 GitHub Actions 為例，PR 的工作可以跑測試並建立候選套件，但不應拿到正式部署憑證。負責正式發布的工作才使用 production environment；在目前方案支援的前提下，限制可部署的分支或標籤，要求獨立審查，並禁止觸發者自行核准。[GitHub 的部署規則文件](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)列出了各項保護與適用條件。

如果雲端支援 [OIDC](https://docs.github.com/en/actions/concepts/security/openid-connect)，部署工作可換取短效憑證。要一併檢查雲端信任政策：能申請身份權杖的工作，不應自動取得正式環境的角色。以預備環境驗收時，使用無權限的測試身分從非允許分支發起良性部署，確認它換不到對應角色，且正式環境沒有發生變更。這裡不需要測真實入侵。

## 核准的是產物，不只是綠燈

工作通過和實際部署是兩筆紀錄。分別記下原始碼 commit、建置工作及產物的 digest，部署時核對同一個 digest。如果存放處使用可移動的標籤，比如 latest，核准時看到的名稱可能和送上去的內容不同。可以用 [artifact attestations](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations) 驗證建置來源，但來源證明不負責判斷程式安全，也不取代核准。

小團隊不必為此換一套 CI。先讓正式發布從不可變的版本取出已測過的套件，留下部署紀錄；如果組織方案支援，再加入覆核規則和憑證約束。代價是緊急發布也必須保有可用的核准者和回復路徑，應用一次預備環境演練確認，不要等值班時才發現沒有人有權回復。

今天可以先挑一個後端服務，抽查上一次正式部署，從正在執行的版本往回找到產物 digest 和已審查的 commit。若找不到，先補這條紀錄；日後才能分清楚哪些版本確實跑過、哪些只是留在建置系統裡。
