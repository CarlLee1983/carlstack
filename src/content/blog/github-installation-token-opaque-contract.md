---
title: "GitHub App Token 已變長，驗收要追到儲存與日誌末端"
description: "GitHub 已完成無狀態 installation token 推出。從約 520 字元的新格式與 11 月 30 日過渡 header 期限，檢查 Bot、CI 的儲存、代理轉送與遮罩規則，避免只改長度驗證就宣告遷移完成。"
publishDate: 2026-10-03T15:40:56+08:00
draft: false
featured: false
tags:
  - API 整合
  - 資訊安全
  - 後端架構
series: 現代網路協定與 API 平台架構
seriesOrder: 13
cover: ../../assets/covers/github-installation-token-opaque-contract.webp
coverAlt: "完整青綠色長帶穿過寬裕的白色門框，旁邊張開的銅色量尺沒有夾住長帶，象徵憑證應完整傳遞而不依固定長度裁切。"
---

GitHub App 今天仍能取得 token，不代表整條 CI 路徑都已相容。假設 Bot 把新 token 寫進只能放 40 個字元的欄位，取回後再交給背景工作，失敗會出現在稍後的 API 呼叫。只看發行 token 的回應，很容易錯過這一段。

GitHub 在 [2026 年 10 月 2 日的公告](https://github.blog/changelog/2026-10-02-stateless-github-app-installation-tokens-rolled-out/)確認，4 月 27 日開始的分階段推出已完成。新發行的 installation token 預設採用 `ghs_APPID_JWT`，仍以 `ghs_` 開頭，長度從 40 個字元變為約 520 個字元。權限、repository 範圍、一小時有效期與發行 token 的 REST endpoint 都沒有改變；已發行的舊 token 仍可使用到過期。

依[官方範圍說明](https://github.blog/changelog/2026-05-15-github-app-installation-tokens-per-request-override-header/#scope)，這次雲端推出涵蓋 GitHub Enterprise Cloud 與 Data Residency 的 App installation server-to-server token，包含 Actions 的 `GITHUB_TOKEN`；GitHub Enterprise Server 不受此次變更影響，也不能將它泛化為所有 GitHub token。

我的驗收重點會放在「每一站收到的憑證是否完整，以及它是否進了日誌」。本文核對官方公告與文件，沒有建立 GitHub App、取得真實 token 或測量效能。以下案例與檢查方法是工程建議。

## 把 token 當成不透明字串，才能保留介面邊界

新格式帶有 JWT 結構，不代表整合端應該開始解析內容。GitHub 的[過渡期說明](https://github.blog/changelog/2026-05-15-github-app-installation-tokens-per-request-override-header/)仍要求呼叫端將 `ghs_` token 當成 opaque string 處理，也提醒既有規則必須容納額外的底線與句點。

對整合端而言，這項約定可以落成幾條實作限制：不從 token 內部取出 App 身分當成授權依據，不自行重組它，也不把「恰好 520 個字元」寫成新的有效性判斷。約 520 是目前格式的描述，無法替下一次變更提供上限保證。

需要追蹤 installation、權限與期限時，使用應用已有的 installation ID 與發行 API 回傳欄位。[官方產生文件](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app)說明，回應會帶回 token、到期時間、權限，以及適用時的 repository 資訊。格式看起來像 JWT，不能替代伺服器接受這顆 token 的結果。

這也意味著不該用放寬權限來解決遷移後的認證失敗。我的排查順序會先確認：是否拿到完整 token、是否走到預期 endpoint、是否已過期，以及原本核准的權限是否足夠。格式遷移本身沒有擴大權限需求。

## 一次寫入成功，只驗到一個節點

我會挑一條實際工作的路徑，例如「取得 token → 暫存 → 背景工作讀取 → HTTP client → 公司代理 → GitHub」，逐站列出負責元件。這裡的箭頭是檢查順序，不是建議把憑證複製到更多系統；原本不需要保存的地方，仍不保存。

### 儲存：查寫入，也查讀回

盤點資料庫欄位、ORM 驗證、快取序列化、秘密管理服務的使用方式，以及工作佇列的資料格式。只把資料庫欄位加長，可能仍留下一個截斷字串的 helper。

建議用不可用於登入的合成字串跑 round-trip 測試，逐字比較讀回結果。測資涵蓋舊長度、目前新長度，以及更長的邊界案例；更長案例由團隊依自己支援的容量設定，不能寫成 GitHub 的長度承諾。若系統有合理上限，超限要明確失敗，不能靜默截斷。

GitHub 的[安全建議](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app#secure-your-apps-credentials)仍適用：使用適合敏感資料的儲存機制；網站後端的 token 應加密並限制存取。擴大容量不等於要把短效憑證搬進一般設定檔。

### 傳輸：走生產會經過的代理

在開發機直接呼叫 GitHub 成功，驗不到正式環境的 gateway、service mesh 或 egress proxy。我的測試會沿同一條出站路徑，檢查 `Authorization` 是否被拒絕、裁切或改寫，也看整份 request headers 的限制。

這裡有兩層證據。合成字串可以驗證內部轉送是否完整；真實 App 的受控整合測試，才有辦法確認 GitHub 接受授權。後者應在已授權的測試環境使用最小必要權限執行，報告只記結果與請求識別資訊，不收錄 token。

兩層都通過，才能把「網路可通」與「應用有權限」分開驗收。單一 `401` 或 `403` 不足以證明問題一定來自新格式。

## 日誌遮罩要驗失敗路徑，成功路徑通常太乾淨

舊正規表示式若只辨認固定長度，可能漏掉新 token，或只遮住前段而留下後段。GitHub 在 10 月公告中也把 logging 與 secret redaction 列為必查項目。

我的做法是優先從欄位控制：`Authorization` 不寫入一般日誌，token 回應欄位不進入追蹤屬性。對不得不處理的既有非結構化文字，再用相容的模式補強遮罩。任何模式都只是一層保護，不能靠「符合 regex」判斷憑證有效。

遮罩測試應故意讓 HTTP client 拋出錯誤，並涵蓋重試、逾時、失敗回應與背景工作例外。檢查最終的 log sink、APM、trace export 與失敗產物，確認合成測資的完整值和刻意設計的尾段標記都沒有出現。只搜尋完整值，可能抓不到被切成兩段輸出的外洩。

**停止規則：只要合成 token 的任何可辨識片段出現在未核准的輸出，就不能把遷移標成完成。**

若檢查發現真實 token 曾暴露，應依事件處理流程限制日誌存取並撤銷受影響憑證。GitHub 的[外洩處理建議](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app#make-a-plan-for-handling-security-breaches)要求立即撤銷受損 token；一小時有效期不適合拿來當作等待它自行失效的處置。

## 驗證完兩種格式，就移除過渡開關

`X-GitHub-Stateless-S2S-Token` 是發行 installation token 時使用的暫時請求 header。依 [5 月的說明](https://github.blog/changelog/2026-05-15-github-app-installation-tokens-per-request-override-header/)，`enabled` 指定新格式，`disabled` 指定舊格式；其他值會被忽略。10 月公告將停用日訂為 2026 年 11 月 30 日，並要求在此前移除；該日期之後不再理會這個 header。公告沒有提供切換的時區與時分，不適合把部署排在最後一刻。

因此，仍靠 `disabled` 維持相容的整合有一項明確的待辦。先在受控環境完成新舊格式驗證，再拿掉正式程式碼中的 header，確認預設路徑也通過。把 `disabled` 留在設定裡，不能當作長期回退策略。

以下是本文建議的驗收紀錄範本，不是 GitHub 設定，也沒有表示測試已執行：

```yaml
installation_token_migration:
  owner: REPLACE_WITH_TEAM
  path: REPLACE_WITH_REAL_COMPONENTS
  evidence:
    storage_round_trip: pending
    outbound_header_preserved: pending
    real_api_authorization: pending
    failure_logs_redacted: pending
    both_formats_checked: pending
    default_path_without_override: pending
  temporary_header:
    name: X-GitHub-Stateless-S2S-Token
    remove_before: 2026-11-30
  completion: all_required_evidence_passed
```

每個 `pending` 應連到一次可重現的檢查或受控測試紀錄。欄位中不要放憑證、token 範例或未遮罩的 request dump。負責人也要註明尚未覆蓋的代理與工作類型，避免一條成功路徑替整個組織背書。

這和〈[GitHub 非同步合併的完成邊界](/blog/github-async-merge-receipt-completion-boundary/)〉討論的是兩種不同的 API 契約：前篇追蹤操作是否完成；這篇驗證憑證在到達操作之前，有沒有被周邊系統改壞或記錄下來。

今天可以先做的事，是找出仍設定過渡 header 的程式與部署設定，選一條實際 Bot 或 CI 路徑，指定一位負責人跑完上述證據清單。沒有設過 header 的整合也要檢查固定長度與遮罩假設；預設已收到新格式，不代表每一條較少執行的失敗路徑都安全。
