---
title: "用 REST API 管理 GitHub AI Scan"
description: "GitHub 新增 repository_scan 設定，讓團隊透過 REST API 管理整個 repository 的 AI 掃描。整理政策繼承、權限、批次更新與導入驗證。"
publishDate: 2026-11-14T10:03:43+08:00
draft: false
featured: false
tags: [API 整合, 資訊安全, 軟體品質]
series: 現代網路協定與 API 平台架構
seriesOrder: 34
cover: ../../assets/covers/github-ai-scan-rest-api.webp
coverAlt: "深藍控制面板的開關連到三張程式檔案卡，另一張卡獨立放置，旁邊另有黃色啟動按鈕。"
---

管理多個 GitHub repository 時，安全設定經常散在各個設定頁。GitHub 在 [11 月 13 日公告](https://github.blog/changelog/2026-11-13-manage-ai-scan-for-repositories-using-the-rest-api/)，讓團隊透過 REST API 開關整個 repository 的 AI Scan。新增的 `repository_scan` 欄位，與既有的 `pr_scan` 共用端點，目前仍是公開預覽。

這項更新適合用在設定盤點與批次管理。我會先把它接進既有的安全設定巡檢，留下每次變更前後的值，再決定哪些專案要實際掃描。開啟設定不會啟動掃描，掃描工作還需要另外安排。

查核日期為 2026 年 11 月 14 日，依據官方公告與文件。以下導入流程是工程建議，沒有在 GitHub 租戶修改設定、執行掃描或量測成本。

## 組織設定會影響所有符合資格的專案

[官方說明](https://docs.github.com/en/code-security/concepts/code-scanning/ai-scan-for-repositories#managing-ai-scan-for-repositories-with-the-rest-api)將設定分成 enterprise、organization 與 repository 三層。企業政策必須允許使用 AI Scan，組織才能開啟。組織關閉時，個別 repository 無法自行啟用；組織開啟時，符合資格的 repository 會繼承設定，管理員可以個別退出。

這個繼承方式會影響試行計畫。假設一個組織有四十個符合資格的專案，只想先試其中兩個，直接開啟組織設定會讓其他專案也取得使用資格。四十與二是教學假設，實際清單要從自己的組織盤點。若要把範圍限在兩個專案，應先規劃其餘專案的退出設定及變更順序，也要接受兩次操作之間存在時間差。沒有取得這個範圍的授權，就不適合直接跑批次開關腳本。

公告的組織導入範圍包括組織擁有的公開 repository，以及具 GitHub Code Security 或 GitHub Advanced Security 的私有、內部 repository。GitHub Enterprise Server 不支援這項功能，不能把雲端文件套用到自架版本。

## 讀取設定與修改設定使用不同權限

[REST API 文件](https://docs.github.com/en/rest/code-scanning/code-scanning#get-the-ai-scan-setting-for-an-organization)列出兩組路徑，皆提供 `GET` 與 `PATCH`：

- 組織：`/orgs/{org}/code-scanning/ai-scan`
- Repository：`/repos/{owner}/{repo}/code-scanning/ai-scan`

兩個設定欄位的值都是 `enabled` 或 `disabled`。`pr_scan` 管理 pull request 掃描，`repository_scan` 管理整個 repository 的掃描資格。盤點時應一起保存，避免修改其中一項時不小心覆蓋另一項。

若使用 fine-grained token，組織讀取端點需要 organization 的 Administration read 權限，修改需要 write。Repository 讀取端點需要 Code scanning alerts read，修改則需要 Administration write。組織操作仍須由 owner 或 security manager 執行，token 權限不能代替角色資格。只做巡檢的工作，不需要順便取得修改權限。

實作上可以把流程拆成兩個工作。排程巡檢只讀取設定，產生偏離預期的清單。經核准的變更工作才帶寫入權限，逐一修改清單內的專案。變更紀錄保存目標、原值、預期值、HTTP 結果與完成時間，不保存 token。

## 同一請求的失敗與整批失敗要分開處理

依[公告](https://github.blog/changelog/2026-11-13-manage-ai-scan-for-repositories-using-the-rest-api/)，`pr_scan` 與 `repository_scan` 可以放在同一個更新請求。任一項受到政策阻擋，請求回傳 `422`，兩項都不修改。

這個保證只涵蓋該次請求。若腳本依序更新十個 repository，第七個失敗，前六個已成功的變更不會因此自動還原。批次工具應為每個目標保存結果，停止或繼續的策略要明確，重跑時也只處理尚未達到預期值的項目。

`422` 也不能一律解讀成企業政策禁止。REST 文件列出的可能原因還包含驗證失敗或端點遭過量呼叫。自動化應保留回應訊息供判讀，遇到政策衝突則停止重試，交由政策管理者處理。持續送出相同請求不會取得較高的權限。

對管理者而言，最容易驗證的結果是重新 `GET`。成功回應後再讀一次，對照預期值與原本不打算改動的欄位。若團隊允許人工調整，也要決定巡檢發現差異時是通知負責人，還是由另一次核准的變更覆寫，避免兩套管理方式互相修改。

## 掃描工作需要另外驗收

[AI Scan 概念文件](https://docs.github.com/en/code-security/concepts/code-scanning/ai-scan-for-repositories#limitations)說明，整個 repository 的掃描由具有 write access 的使用者手動啟動，分析預設分支，並消耗 Code Security AI credits。預覽版不支援排程掃描或 push 後自動掃描。把設定納入 infrastructure as code，並不會同時建立定期掃描工作。安排掃描前，也要確認計費帳戶的可用 credits 與預算。

因此我會把導入驗收分成兩份紀錄。設定紀錄確認哪些專案可使用、哪些退出，以及政策衝突是否正確攔下。掃描紀錄則保存實際掃描對象、完成狀態、告警處理人與費用觀察。若只完成設定，進度應寫「已啟用」，不要寫「已掃描」。

AI Scan 在時間預算內挑選程式碼檢查，結果仍需審查。第一次試行可以挑一個有人負責維護、既有測試清楚的專案，確認告警能交給適合的人處理，再擴大使用。發現漏洞後，修正的測試、部署與追蹤仍照原本流程進行。

先前的 [Actions 日誌密鑰掃描](/blog/github-actions-log-secret-scanning/)處理執行紀錄洩漏憑證，這次的 API 管理程式碼 AI 掃描設定。兩者應各自列入盤點，不能用其中一項已啟用來代替另一項的檢查。
