---
title: "GitHub Actions 鎖檔擋住 tag 漂移，審查仍要追進共用工作流"
description: "GitHub Actions workflow lockfiles 進入公開預覽。拆開可變 tag、間接 action 與 reusable workflow 的鎖定範圍，並用逐步導入、完整 diff 審查與停止規則，避免把固定 SHA 誤當成依賴安全保證。"
publishDate: 2026-10-15T10:04:02+08:00
draft: false
featured: false
tags:
  - API 整合
  - 資訊安全
  - 軟體品質
series: 現代網路協定與 API 平台架構
seriesOrder: 18
cover: ../../assets/github-actions-lockfile-review-boundary.webp
coverAlt: "藍色插銷固定三層彩色木框，旁邊另一個木框獨立懸掛，象徵呼叫端與共用工作流各自負責依賴鎖定。"
repositoryUrl: https://github.com/github/gh-actions-lock
---

工作流沒改，下一次部署卻跑了另一份程式。只要 `uses` 指向會移動的 tag 或 branch，審查與執行就可能隔著這個落差。GitHub 在 [2026 年 10 月 14 日公告](https://github.blog/changelog/2026-10-14-github-actions-workflow-lockfiles-in-public-preview/)推出 workflow dependency lockfiles 公開預覽，把實際執行的 commit 留在可審查的檔案裡。

這值得試，但導入工單不能只寫「產生 actions.lock」。我會先追到共用工作流的定義端，再確認每次換 SHA 由誰批准。本文依官方文件分析，未安裝擴充套件、執行 CLI 或在真實 repository 驗證；以下流程是導入建議，查核截至 10 月 15 日台北上午。

## 固定 commit，讓依賴更新回到 PR

依[概念文件](https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles)，`.github/workflows/actions.lock` 記錄工作流使用哪些依賴，以及各參照對應的 commit。它也保存 `owner_id`、`repo_id`，供執行時確認名稱背後的 repository 身分。

假設團隊審過 `deploy-action@v3` 指向的 A，之後上游把 v3 移到 B。已納入鎖檔的工作流執行 A，不會僅因 tag 移動就改跑 B。這讓「接受新程式」有機會回到 PR 審查，而非悄悄發生在排程啟動時。

我的審查清單會分成兩種變更：commit 改動，要看新舊程式差異與必要性；來源身分改動，要查轉移或更名的原因。這份清單應跟著建置安全負責人的交接文件走，否則機器產生的長 diff 很容易被當成可以略過的雜訊。

## 間接 action 有涵蓋，共用工作流另有責任人

同份概念文件把範圍說得很明確：鎖檔涵蓋 action 的間接依賴，但 reusable workflow 內部的依賴，由「定義該工作流的 repository」自己的鎖檔負責。caller 鎖住共用工作流版本，不表示 caller 的鎖檔一路接管它裡面的 action。

例如應用程式 repo 呼叫平台 repo 的部署工作流，平台工作流再呼叫發布 action。我會要求應用團隊交出呼叫參照與鎖定結果，平台團隊交出定義端的導入狀態與更新審查方式。任何一端回答不出來，就只能宣告局部覆蓋。

這也解釋了[官方導入指南](https://docs.github.com/en/actions/how-tos/secure-your-work/lock-workflow-dependencies)為何建議先處理組織的 shared workflow repositories。對有數十個應用 repo 的團隊，先補這一層，比逐個應用勾選完成更有意義。驗收時應保留「誰維護哪一段」的具名清單，讓下一位接手的人找得到 owner。

## 產生鎖檔會改工作流，不能只看新增檔

導入指南提供單一工作流的試行方式。以下指令取自文件，本文未執行：

```bash
gh extension install github/gh-actions-lock
gh actions-lock .github/workflows/ci.yml
gh actions-lock --verify
```

工具可能把大版本參照改成解析到的具體版本，也會將可解析的同 repo `./…` action 改成 `$/…`。因此審查範圍包含 workflow 與本地 action 定義，不能只打開 actions.lock。官方也提醒，納入鎖檔後 allowed actions policy 比對的是 locked SHA；原本以 tag 放行的規則可能不再匹配。

我的做法是用低風險 CI 試行，先確認 allowlist 與本地路徑，再安排部署工作流。若某個 workflow 被跳過，工單要留下原因與負責人，不能因為同一批其他檔案成功就把整個 repo 標成完成。修正權限時也不應順手把 allowlist 放寬成所有來源。

試行的成功條件也要包含失敗案例。我建議在測試分支新增一個尚未登錄的依賴，確認驗證會攔下，再依正常程序重新產生鎖檔。這能檢查團隊設計的審查路徑是否接得起來；只有一個原封不動的工作流跑綠，還看不出日後變更會不會漏過。測試分支不應掛上正式部署權限，避免為了驗證控制反而引入額外風險。

## 預覽工具的限制，需要留在變更單

[擴充套件 README](https://github.com/github/gh-actions-lock)標示 pre-1.0，格式、旗標與行為可能變動；目前不支援 GitHub Enterprise Server。一般執行保留已鎖定的 pin，`--verify-local` 只離線檢查項目是否齊全，不能代替向 GitHub 驗證。

本地 action 的說明尤其需要小心讀：README 的限制段仍寫 local-path actions 無法納入，使用段則描述 `./…` 到 `$/…` 的自動遷移。操作指南進一步說明，若路徑沒有解析到實際 action 檔案，會遭跳過；路徑從 repository root 解析。導入時應記下工具版本與實際訊息，不能把一句「支援本地 action」套用到所有路徑。

方案範圍也有文件落差：10 月 14 日公告已更正為 Free、Team、Enterprise Cloud 與有 data residency 的 Enterprise Cloud；操作指南頁首仍只標 Enterprise Cloud。採購或治理文件應保留查核日期，實際租戶仍要驗證，不能把預覽條件當永久承諾。

## 鎖定錯誤依賴，仍會穩定執行錯誤程式

公告沒有把 locking 當成依賴安全證明。[GitHub 安全指南](https://docs.github.com/en/actions/reference/security/secure-use)也要求檢查 action 如何處理 secrets，並將 `GITHUB_TOKEN` 權限縮到必要範圍。固定版本無法替一份本來就惡意或有漏洞的程式背書。

我的判斷是，鎖檔最有用的地方在於把審查結論與執行版本連起來。它不會自動回答發布 action 為何需要寫入權限，也不會替下載外部腳本的步驟判定來源可信。這些問題仍要在工作流審查時提出。

上游參照異常移動時，也不能為了讓 CI 變綠就接受新 commit。README 區分正常重新鎖定與接受不可達舊 pin 的情況。**停止規則：來源身分變動或舊 commit 不可達而原因未明時，不批准換鎖。** 調查結果應跟更新 PR 放在一起，避免下一次同樣異常又從頭猜。

遇到緊急修補時，固定版本也不該變成拖延更新的理由。我會在修補單寫明舊版風險、候選新版本、必要測試與批准人，讓安全更新沿著同一條審查路徑前進。若上游仍未釐清異常，團隊可以停用受影響步驟或改走已審查的替代流程；不能把「已經鎖住」當成繼續執行的充分理由。

## 先讓一條工作流有可追蹤的更新責任

[強制執行指南](https://docs.github.com/en/actions/how-tos/administer/enforce-workflow-lockfiles)建議先試行再啟用 Require lockfile。Evaluate 模式限 GitHub Enterprise；其他方案不能假設有同樣的觀察期。Dependabot 可維護已導入依賴的版本更新，但不會替尚未導入的工作流完成 onboarding。

我會在第一個 PR 留下四項驗收：已涵蓋的 workflow、共用工作流的定義端 owner、完整 diff 的審查人，以及新增依賴時會失敗的驗證檢查。再由 CODEOWNERS 與必要審查規則承接後續更新。

同一份紀錄還要寫出未涵蓋項目。例如共用部署 repo 尚未導入，就留在待辦清單，指派到平台維護者；本地路徑解析失敗，就連同錯誤訊息交回該 action 的作者。這樣檢討會看到具體缺口，而非一個模糊的採用百分比。

我也會讓負責人演練一次例外處理：當必要驗證失敗，值班者能否找到原審查人、判斷是否停止發布，並保留失敗證據。這是團隊自己的操作驗收，並非工具內建保證。沒有這份交接，深夜部署卡住時最容易出現的選擇，就是移除檢查再說。

下一步可以很小：挑一條不碰正式環境秘密的 CI，列出所有 `uses` 與跨 repo 呼叫，完成一次有審查人的試行。等團隊能說清楚新增工作流如何納入、異常換 SHA 如何停止，再擴大政策範圍。
