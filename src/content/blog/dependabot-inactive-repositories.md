---
title: "Dependabot 將暫停閒置專案的漏洞警示"
description: "GitHub 將在 2026 年 12 月 8 日暫停多數一年未活動 repository 的 Dependabot alerts。說明適用範圍、恢復方式，以及仍在營運的舊系統如何維持依賴漏洞追蹤。"
publishDate: 2026-11-11T10:03:26+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - 軟體品質
  - 開源專案
cover: ../../assets/covers/dependabot-inactive-repositories.webp
coverAlt: "橘色背景上的伺服器機櫃、日曆、琥珀色警示燈與金屬開關，呈現專案長期未更新後需要確認漏洞警示是否仍啟用。"
---

GitHub 在 [2026 年 11 月 10 日公告](https://github.blog/changelog/2026-11-10-dependabot-alerts-will-pause-on-inactive-repositories/)，將從 **12 月 8 日**起，關閉多數一年沒有活動的 repository 的 Dependabot alerts。舊警示會封存，之後可以恢復。

對維護舊系統的人來說，這項變動值得排進十二月的維運檢查。一個多年沒改需求、每天仍在處理訂單的服務，可能比上週才建立的實驗專案更需要漏洞追蹤。GitHub 看得到程式庫活動，團隊還要補上系統是否仍在使用的資訊。

資料查核至 2026 年 11 月 11 日，依據 GitHub 公告及官方設定文件。新政策尚未生效，我沒有測試暫停與恢復流程，也沒有修改任何 repository 的安全設定。後面的盤點方式是工程建議。

## 哪些專案會受到影響

公告列出的活動只有三種：push 任一 branch 或 tag、建立 repository、啟用 Dependabot alerts。重新 push 或到設定頁啟用 alerts，會恢復封存警示並重新計算一年期限。

適用範圍包括 GitHub.com 各方案，以及使用 data residency 的 GitHub Enterprise Cloud。GitHub Enterprise Server 不在這次變更內。

有兩種政策例外：repository 套用強制執行且啟用 Dependabot alerts 的 security configuration，或企業政策不允許 repository 管理員自行啟停 alerts。這些 repository 不會因這次閒置規則被關閉警示。[完整條件見官方公告](https://github.blog/changelog/2026-11-10-dependabot-alerts-will-pause-on-inactive-repositories/)。

日常有收到 issue、有人閱讀文件，甚至服務每天有流量，都不在公告列出的活動內。盤點時不宜拿這些訊號代替 push 與 alerts 設定，也不要假設設定一份 Dependabot 更新排程就符合政策例外。

## 先找還在使用的舊系統

假設團隊有一個一年沒改程式的物流標籤服務。它仍使用舊版套件，每天由訂單系統呼叫。另一個教學用 repository 也一年沒更新，但已無部署、無人依賴。

這是虛構情境。兩者在 GitHub 的活動狀態可能相同，維運決策卻應不同。我會先把正式服務對回 repository，再逐項記錄：

- 目前部署位置與版本，是否仍有流量或排程工作。
- 維護負責人，以及發現漏洞後誰能安排測試和發布。
- 最近一次 push、Dependabot alerts 是否啟用、目前是否受政策強制管理。
- 這個 repo 是否仍產出其他系統使用的套件或映像。

這張清單應從部署與服務目錄開始。只按 GitHub 最後更新時間排序，容易漏掉多年穩定運作的服務。找不到負責人的正式系統，先指定接手人，再決定警示與修補節奏。

## 個人專案可以逐一確認設定

依 [GitHub 設定文件](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/configure-dependabot-alerts)，repository 的管理頁面可經由 Settings → Security and quality → Advanced Security，查看 Dependabot alerts 並啟用。操作需要對應權限。

對少量專案，逐一確認設定最容易知道改了什麼。保留 repo、檢查時間與負責人，再安排定期複查。不要為了延後一年期限而固定提交空 commit，這會增加 Git 紀錄，卻沒有幫團隊回答「還有誰負責這套服務」。

個人帳號也能在安全設定一次啟用既有 repositories 的 alerts。這種做法省操作，但範圍可能比預期大。若只有少數專案仍在使用，我會優先處理那些專案，避免把大量無人維護的實驗告警重新混進工作清單。

## 組織可用強制安全設定維持覆蓋

維護數十個長期服務時，人工複查容易漏掉交接中的 repository。組織可以評估 [custom security configuration](https://docs.github.com/en/code-security/how-tos/secure-at-scale/configure-organization-security/establish-complete-coverage/create-custom-configuration)，將 Dependabot alerts 明確設為啟用，並使用 Enforce configuration。

官方文件說明，強制設定會阻止 repository owner 改動其中明確啟用或停用的功能。未設定的功能不會一起受到強制。設定建立後也要套用到目標 repository，不能只確認組織裡有一份設定檔就結案。

這個做法能減少各 repo 設定不一致的問題，代價是變更要由組織層級協調。套用前應逐項檢查配置內容，尤其是私有與內部 repository 的付費功能，避免處理 alerts 時順便啟用原本沒有採用的產品。

Enterprise Cloud 另有[限制 repository 管理員啟停 Dependabot alerts 的政策](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-code-security-and-analysis-for-your-enterprise#enforcing-a-policy-to-manage-the-use-of-dependabot-alerts-in-your-enterprise)。這項權限政策和 alerts 目前是否開啟要分開確認。政策阻止管理員改設定，並不等於每個 repo 已經啟用警示。

## 十二月的檢查要保留什麼

在 12 月 8 日前，替仍營運的服務保存 alerts 啟用狀態，以及幾筆已知警示的連結與處理狀態。生效後由有權限的人再次檢查設定，確認原有警示仍可查閱。若發現被暫停，依官方方式恢復，再核對那些警示。

零筆警示可能是沒有符合條件的發現，也可能需要檢查功能是否啟用、依賴是否被辨識或帳號是否看得到結果。驗收紀錄至少應能回答「功能開著嗎」「這個版本的依賴有納入嗎」「誰會處理發現」，不能只有一張空清單截圖。

[GitHub Actions 日誌的密鑰掃描](/blog/github-actions-log-secret-scanning/)也需要在功能啟用後安排人查看結果。兩者偵測的對象不同，維運流程都要把通知、查看與後續處理交給具名負責人。

下一次維運盤點，可以先選一個最久沒更新、仍在營運的服務，核對部署版本與 repo，再記下 Dependabot alerts 狀態。若已經沒有人能安全發布修補，就把維護交接排進工作，而不只重新打開警示。
