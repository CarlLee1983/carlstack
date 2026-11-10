---
title: "GitHub Actions 日誌的密鑰掃描"
description: "GitHub 開放 Actions workflow logs 的 secret scanning 預覽。整理 Enterprise Cloud 授權、掃描時機與偵測限制，並設計遮罩對照、告警巡檢和憑證撤銷的驗收方式。"
publishDate: 2026-11-10T10:12:27+08:00
draft: false
featured: false
tags:
  - API 整合
  - 資訊安全
  - 軟體品質
series: 現代網路協定與 API 平台架構
seriesOrder: 31
cover: ../../assets/covers/github-actions-log-secret-scanning.webp
coverAlt: "紙帶日誌通過檢查裝置後落入托盤，放大鏡找到紅色鑰匙，旁邊未響的鈴提醒告警仍需要人員查看。"
---

GitHub 在 [2026 年 11 月 9 日公告](https://github.blog/changelog/2026-11-09-secret-scanning-detects-secrets-in-github-actions-workflow-logs/)，將 secret scanning 擴到 Actions workflow logs，進入公開預覽。工作流結束後，GitHub 才掃描日誌中的 provider patterns；找到的密鑰會進入 repository 原有的 secret scanning 告警清單。

我會把這項功能納入 CI 憑證管理，但導入單還需要寫上誰負責看告警。預覽期間不會發送這類告警的通知，團隊若沿用「收到通知才處理」的習慣，可能已經有發現卻沒有人接手。

查核日期為 2026 年 11 月 10 日，依據 GitHub 公告與官方文件。我沒有在 Enterprise Cloud 租戶啟用此預覽、投放測試憑證或量測告警延遲。下列試行與驗收流程是工程建議，範例只使用無存取能力的假值。

## 企業政策與 repository 設定都要確認

公告把預覽資格限定在 GitHub Enterprise Cloud，企業須有 GitHub Secret Protection 或 GitHub Advanced Security，包含使用 GHE.com data residency 的企業。政策預設關閉，且只適用於上述授權下已開啟 secret scanning 的 repositories。不能從「公開 repo 原本就有免費掃描」推得它已經掃描 Actions 日誌。

依[企業政策文件](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-code-security-and-analysis-for-your-enterprise#enforcing-a-policy-for-secret-scanning-in-github-actions-workflow-logs)，enterprise owner 可到 Policies → Advanced Security，在 Secret scanning for Actions workflow logs 的 All repositories 選單選擇 Enabled。

這是企業層級政策，會套用到企業內已啟用 secret scanning 的 repositories。我建議先列出這些 repo 與負責人，再安排一條低風險工作流驗證。所謂「先試一條」是縮小驗收工作量，不能把企業政策誤寫成單一 repo 的試行開關。

變更單可以先記四個欄位：授權方案、政策啟用時間、納入的 repo 清單、告警查看者。若缺少任何一項，後續的「沒有告警」都很難判讀。

## 掃描發生在 run 完成之後

[secret scanning 概念文件](https://docs.github.com/en/enterprise-cloud@latest/code-security/concepts/secret-security/secret-scanning#secrets-detected-in-github-actions-workflow-logs)說明，功能啟用後才開始掃描新工作流的日誌，過去的日誌不會回補。11 月 9 日公告更明確以啟用後完成的 run 描述掃描時機。為了讓試行結果容易核對，我會在政策開啟後才啟動驗收 run，避開跨越切換時間的執行紀錄。

這個時序會影響事件處理。假設部署步驟把憑證印進日誌，後面還有二十分鐘的整合測試，掃描要等整個 run 完成才開始。二十分鐘是這個假設案例的工作流長度，並非 GitHub 公布的掃描延遲。若有人在執行期間已經發現洩漏，應立即處理憑證，不必等掃描結果。

我也不會把工作流綠燈當成日誌掃描驗收。綠燈回答的是工作流本身的檢查是否通過，掃描結果要另外到告警清單確認。官方這次沒有公布完成 run 到產生告警的固定 SLA，團隊需要量測自己環境的時間，並留下未出現結果時的查核紀錄。

既有歷史日誌則需要另外排查。開啟新政策之後，舊的部署紀錄與曾經開過 debug 的 run 不會自動變成已檢查。

## Provider patterns 與遮罩各自有範圍

日誌掃描目前只偵測 provider patterns。[支援類型文件](https://docs.github.com/en/code-security/reference/secret-security/supported-secret-scanning-patterns)將它們定義為特定服務供應者的憑證格式，例如 AWS、Azure、Stripe。generic patterns、custom patterns、AI-detected secrets，以及 Actions 已遮罩的值，都不在這次日誌偵測範圍內。

因此，團隊自訂的內部 API token、一般密碼、任意連線字串，都不能只因 repo 啟用了 secret scanning 就當成已涵蓋。盤點時應把實際使用的 secret type 對到官方清單，再記錄哪些仍靠輸出規範與人工檢查保護。清單裡的 validity check、Base64 支援等能力也要逐項核對，不能用某一種 token 的結果推論所有類型。

遮罩則是在輸出過程處理敏感值。[Actions 安全指南](https://docs.github.com/en/actions/reference/security/secure-use#use-secrets-for-sensitive-information)提醒，自動遮罩不保證能認出轉換後的值。把秘密包進 JSON、編碼成另一個字串，或用它簽出新的 JWT，都可能需要額外處理。成功與失敗路徑都要檢查，因為工具常在錯誤訊息中印出平常不會輸出的內容。

對已遮罩的值，掃描器不會再把它辨認成密鑰。因此「沒有告警」可能是遮罩有作用，也可能是根本不在支援範圍。驗收要有對照，不能只留一張空白告警頁。

## 用假值驗遮罩，再驗告警處理

第一項驗收可以完全不碰憑證。下面是一份可放在測試 repo 的 workflow，執行時產生隨機假值，再依 [workflow commands 文件](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#masking-a-value-in-a-log)先登記遮罩、後輸出。

```yaml
name: Masking control
on: workflow_dispatch
permissions: {}

jobs:
  mask-control:
    runs-on: ubuntu-latest
    steps:
      - name: Check masking with a dummy value
        shell: bash
        run: |
          set +x
          sample="mask-control-$(python3 -c 'import uuid; print(uuid.uuid4())')"
          printf '::add-mask::%s\n' "$sample"
          printf 'masked_control=%s\n' "$sample"
```

預期日誌最後一行是 `masked_control=***`。假值沒有供應者格式，也沒有存取能力，這項測試只驗遮罩路徑。若把它當成 secret scanning 的陽性測試，會得到沒有意義的陰性結果。

掃描器本身的驗收應由安全團隊另選符合官方格式的測試材料，使用隔離環境與已確認失效、無存取能力的樣本，並記錄對應 secret type。**不要為了製造一則告警，把仍有效的正式憑證印進日誌。** 若無法取得可安全使用且能被辨識的樣本，就把偵測驗收標為待驗，不以遮罩測試代替。

我會把驗收紀錄拆成可以核對的幾項：

- 政策啟用時間，以及測試 run 的開始與完成時間。
- 預期的 secret type、樣本選擇理由，以及它沒有存取能力的確認方式。紀錄不放完整樣本值。
- 第一次看到告警的時間、告警編號，以及能否追到正確的 workflow 與日誌行。
- 指定查看者能否開啟告警、找到憑證 owner，並完成一次不涉及正式憑證的處理演練。

概念文件也說，同一個密鑰可能在一則告警中帶有多個 run 或 job 的位置，且告警不提供日誌內容的行內預覽。驗收時應逐個檢查位置，不用告警數量推算洩漏次數。

## 沒有通知時，巡檢要能找到接手的人

預覽公告要求直接查看 repository 的 secret scanning 告警。我的試行建議是在值班交接和敏感部署結束後安排查看，記錄最後檢查時間與未結案項目。這是團隊自訂的節奏，並非 GitHub 的通知服務或保證。

如果既有流程靠 webhook 或第三方安全平台接手，也應在試行中確認這類日誌告警有沒有抵達。一般 secret scanning 的整合能力，不能直接當成這次預覽已驗證的通知路徑。尚未驗證時，保留直接查看告警清單的步驟。

告警存在的時間還可能比日誌長。11 月 9 日公告明確說，日誌刪除後告警仍會保留。這對追蹤修復有用，卻不代表被刪除的日誌仍可讀取。我建議在處理時留下 run ID、job、步驟、發現時間與撤銷紀錄；需要保存原始證據時，依團隊的存取與保留規範處理，避免把完整秘密複製到工單。

## 撤銷憑證後，修掉會印出它的步驟

[告警評估文件](https://docs.github.com/en/code-security/tutorials/remediate-leaked-secrets/evaluating-alerts#checking-a-secrets-validity)把 validity status 分成 `active`、`inactive` 與 `unknown`。`unknown` 可能是類型不支援檢查，或暫時驗證不了。`inactive` 也仍需要確認先前有沒有未授權存取。公告提到的 validity checks 只適用於支援的類型，不能把未知結果當成已安全。

實際事件中，我會先讓憑證 owner 撤銷或輪替，確認使用端換上新憑證，再追查供應者的存取紀錄。日誌清理與憑證撤銷要分別留下結果，刪掉日誌不會讓外部已取得的值失效。這也符合 GitHub 安全指南對未遮罩秘密的處理要求。

接著修正輸出來源，例如移除完整環境變數 dump、關閉會展開秘密的 shell tracing，或改掉把認證標頭寫進錯誤訊息的工具設定。修正後重跑正常與失敗路徑，確認秘密不再出現，再更新告警的處理結果。

Actions 的其他控制仍各有工作。[依賴鎖檔](/blog/github-actions-lockfile-review-boundary/)讓被審查的程式版本與執行版本對得起來。若雲端服務支援 OIDC，[GitHub 的秘密使用指南](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets#using-secrets-in-a-workflow)也建議改用它，減少工作流儲存長效憑證的需求。日誌掃描可以補上執行後的發現，前面的憑證數量、權限與輸出方式仍值得逐項減少。

下一張導入單可以選一條測試工作流，完成假值遮罩對照，再讓指定查看者走一次告警清單與憑證 owner 的交接。驗收紀錄要能分清楚已確認的遮罩、待確認的偵測，以及實際有人接手的處理流程。
