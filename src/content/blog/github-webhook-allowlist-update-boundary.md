---
title: GitHub Webhook IP 更新，要驗收最後生效的清單
description: GitHub 新增 Webhook CIDR 後，靜態 allowlist 可能漏收合法事件。拆開 Meta API 取得、差異審查、規則套用與失敗補送，避免更新腳本成功卻留下過期規則。
publishDate: 2026-10-30T11:22:06+08:00
draft: false
featured: false
tags:
  - API 整合
  - Webhook
  - 資訊安全
series: 現代網路協定與 API 平台架構
seriesOrder: 24
cover: ../../assets/covers/github-webhook-allowlist-update-boundary.webp
coverAlt: 白色托盤內排列粉色玻璃片，另一托盤放著三片琥珀色候選片，中間的檢視鏡表達新增項目需檢查後才加入生效清單。
---

GitHub 發出通知，接收端沒有任何應用程式日誌，問題可能還沒走到 webhook handler。若入口防火牆只接受舊的來源 IP，合法通知會先被擋下，後面的驗簽與事件處理都沒有機會執行。

GitHub 在 [2026 年 10 月 29 日公告](https://github.blog/changelog/2026-10-29-webhook-ip-ranges-added-to-the-meta-api/)，為 github.com 的 Webhook 投遞新增三個 CIDR，並放進 Meta API 的 `hooks` 欄位：

- `9.234.98.160/28`
- `9.234.98.176/28`
- `9.234.106.48/28`

使用靜態清單的接收端應將它們加入既有 Webhook 範圍。已持續透過 Meta API 同步清單者，公告說不需為這次新增另作調整。範圍涵蓋 github.com 各方案，包含 GitHub Enterprise Cloud，不能直接延伸到自管 GitHub Enterprise Server。

查核時實際讀取公開 `GET /meta`，確認三個 CIDR 已存在於 `hooks`。沒有修改任何防火牆、送出 webhook 或測試真實流量；以下的更新與驗收安排是工程建議。

## 只取得 hooks，不把整份 Meta 回應當放行清單

[Meta API 文件](https://docs.github.com/en/rest/meta/meta#get-github-meta-information)提醒，文件中的回應只是範例，最新值要直接查 API。回應還包含其他 GitHub 服務的範圍，因此接收 Webhook 的清單應明確取用 `hooks`，不要順手合併 `actions`、`api` 或所有陣列。

以虛構的部署通知服務為例，最小方案可以是一個定期取得清單的工作，輸出待審差異，再由原本的基礎設施設定流程套用。工作只負責這個入口所需的來源範圍，不取得整個防火牆的任意變更權限。

候選資料需要通過基本檢查：HTTP 取得成功、JSON 能解析、`hooks` 存在且型別正確，每筆可解析成 CIDR，並正確處理 IPv4 與 IPv6。API 文件說端點會回傳兩種位址，但各項功能是否支援 IPv6 仍須依對應文件與部署環境確認。若入口暫不接受 IPv6，這項限制要明列，不能讓解析器靜默忽略後仍報全部同步成功。

## 取得失敗時，保留上一版並交出告警

若抓取逾時後把空陣列寫回防火牆，合法通知可能全被擋下；若腳本改成全面放行，又擴大了入口範圍。比較容易審查的做法，是先產生候選清單，驗證成功才替換生效版本。

**取得或驗證失敗時，不套用候選清單，也不自動改成全面放行。** 保留上一份已驗證設定，同時留下錯誤、最後成功同步時間與接手人。

保留舊版只是短期故障處理。它可能缺少新增範圍，也可能仍允許已移除範圍，因此還要設定可接受的陳舊時間及升級處理方式。這個時間應由通知中斷成本與團隊回應能力決定，官方公告沒有提供通用期限。

人工審查每次差異較慢，但較容易發現意外大幅擴張。完全自動套用比較即時，卻需要額外處理不尋常的增減與錯誤回應。團隊可以先自動取得、人工核對新增與移除，再依累積的變更紀錄決定哪些差異能自動通過。

## API 回應與生效規則要能對起來

排程工作顯示成功，只能證明它走到某個步驟。驗收還應讀回最後生效的規則，確認候選清單沒有在轉換、部署或部分節點更新時遺失。

建議保存三份彼此能對應的證據：取得時間與原始回應雜湊、審查過的新增／移除差異，以及套用後讀回的規則版本。若某個節點更新失敗，就不要把整批標成同步完成。

隔離環境可以安排幾個測試：有效候選能完整套用；缺少 `hooks`、無法解析的 CIDR 或空清單會停止變更；部署失敗時舊規則仍可讀回。測試用位址只放在隔離規則，不把任意測試網段加入正式入口。這些案例尚未執行，不能當作某個防火牆產品已具備原子更新的證明。

回滾也要知道回到哪份設定。若新範圍已開始投遞，退回舊版可能再次漏收通知。回滾後應明確記錄受影響期間，接續檢查投遞失敗紀錄。

## IP 放行之後，驗簽與補送仍要各自完成

[GitHub 驗簽文件](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries)要求在處理通知前，用 webhook secret 驗證 `X-Hub-Signature-256` 與 payload。來源 IP 通過入口規則，沒有取代這項驗證。若前方有代理或負載平衡器，也要確認它沒有改動驗簽使用的 payload 與標頭。

另外，[GitHub 不會自動重新投遞失敗的通知](https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries)。修好 allowlist 之後，仍需查受影響期間的投遞紀錄，依官方手動或 API 方式補送。不要等待一個實際不存在的自動重試流程。

[最佳實務文件](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks)說明，要求重送時 `X-GitHub-Delivery` 與原始投遞相同。應區分「曾看過識別值」和「業務處理已完成」。若第一次只記下收件就失敗，補送時不能因識別值已存在便直接略過未完成工作。這是接收端需要自行設計的狀態判斷。

站內 [Webhook 架構文章](/blog/webhook-system-architecture-hmac-retry-dlq/)討論發送、驗簽與重試管線。這次可先檢查入口前面的那份清單：找出它最近何時取得、誰批准、最後在哪些節點生效，再對照同一時段的 GitHub 投遞結果。這樣才能分清楚通知是被入口擋住，還是已進入應用程式卻沒有完成處理。
