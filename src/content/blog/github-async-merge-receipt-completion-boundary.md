---
title: "GitHub 非同步合併已 GA，Bot 收到收據仍不能宣告完成"
description: "GitHub async merge API 正式推出。從 UUID、預期 head SHA 與 merge queue 的終態，設計合併 Bot 的狀態紀錄、逾時對帳與發布驗收，避免把入列通知當成程式已合併。"
publishDate: 2026-10-02T12:11:55+08:00
draft: false
featured: false
tags:
  - API 整合
  - 系統設計
  - 開源專案
series: 現代網路協定與 API 平台架構
seriesOrder: 12
cover: ../../assets/covers/github-async-merge-receipt-completion-boundary.png
coverAlt: "琥珀色票券停在折線輸送帶，完成拼合的藍色積木位於另一端，前景收據圓片表達受理與完成的距離。"
---

合併 Bot 回覆「已完成」，發布工作卻找不到新的 commit。查紀錄才發現它收到的是受理回應，PR 還在 merge queue 等待檢查。非同步介面省下請求等待時間，也把「工作究竟完成到哪一步」交回呼叫端。

GitHub 在 2026 年 10 月 1 日[宣布 async merge API 正式推出](https://github.blog/changelog/2026-10-01-github-async-merge-api-generally-available/)，支援個別 PR、stacked PR 與 merge queue，並建議程式化合併改用這個路徑。本文查閱官方文件，沒有建立測試 PR 或呼叫合併 API；以下 Bot 設計與故障案例是工程建議，並非實測結果。

我會把遷移的驗收點放在通知與發布的觸發條件：Bot 是否能分清受理、入列、合併與部署，而不是只把同步呼叫換成新 endpoint。

## UUID 是追蹤工作所需的收據

[REST 文件](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2026-03-10#merge-a-pull-request-asynchronously)提供 `PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge-async`。新請求以 `202` 回傳 UUID；若已有待處理請求，`409` 會回傳既有 UUID 與選項。PR 已合併或已入列時，也可能直接回 `200`。因此，單看 HTTP 成功或失敗區間不足以決定下一步。

我的建議是先保存一次合併意圖，再提交請求：repository、PR 編號、核准的 head SHA、合併選項、提出者，以及本機紀錄 ID。取得 UUID 後補入同一筆紀錄。它讓程序重啟後仍知道要查哪項工作，也能說清楚這次核准對應哪個版本。

若 `409` 帶回既有工作，先比對它的 head 與選項。符合本次意圖才能接續追蹤；若另一位操作者先提交不同選項，Bot 應呈現衝突並等待處理。把所有 `409` 當成可忽略的重複，會讓兩個不同決定共用一句「已受理」。

網路逾時更需要保留「結果未知」。沒有收到 UUID，不代表伺服器沒有受理。我會將這筆紀錄交給對帳流程，查 PR 與既有請求資訊；即使決定重新提交，也仍比對回傳工作。這是呼叫端的恢復策略，不能寫成 GitHub 提供了任意請求的永久冪等鍵。

## 核准必須指向版本，不能隨新 push 漂移

官方文件的 `sha` 可約束 PR head；省略時以請求當下的 head 為準，在執行前收到新 push 會取消合併。這項保護值得沿用，但 Bot 的核准紀錄仍應明確保存 SHA，避免將使用者對舊 diff 的同意，套在稍後讀到的新版本。

下面是本文設計的概念紀錄，不是 GitHub 回應，也不是可直接執行的設定：

```json
{
  "intentId": "review-approved-change",
  "pullRequest": "OWNER/REPO#NUMBER",
  "approvedHeadSha": "FULL_HEAD_SHA",
  "mergeAction": "default",
  "requestUuid": null,
  "mergeProgress": "not-submitted",
  "deploymentProgress": "not-started"
}
```

我的驗收案例會讓 PR 在核准後新增一個 commit：Bot 必須停止原版本的後續提交，或辨識被取消的工作，再請人審閱新的差異。不能捕捉失敗後讀取最新 head，自動重送同一份核准。

`merge_action` 的預設行為會遵循目標分支是否設有 queue；`direct_merge` 與 `merge_queue` 則明確指定路徑。遷移時我會保留既有儲存庫政策，避免為了重現同步 API 的速度而順便切到直接合併。官方的 `bypass_rules` 預設為 false，而且只涵蓋操作者原本有權繞過的規則；Bot 的一般工作流沒有理由自動打開它。[參數來源](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2026-03-10#parameters-for-merge-a-pull-request-asynchronously)

## 入列完成，要換一個問題繼續查

取得 UUID 後，呼叫端可用[結果 endpoint](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2026-03-10#get-the-result-of-an-asynchronous-merge)查狀態。最容易漏掉的官方語義是：`enqueued` 已是這次入列工作的終態，PR 日後合併也不會讓這筆結果改成 `merged`。Bot 必須轉向查 PR 是否合併，不能一直等同一 UUID 變色。

我會將畫面上的進度寫成「已受理，追蹤中」、「已加入合併佇列」與「已合併」，各自附同一筆意圖的連結。對 queue 工作，取得入列結果就結束受理階段的輪詢，另以 PR 事件或低頻對帳追蹤實際合併。事件是喚醒訊號；恢復程序仍讀取目前 PR 狀態，避免事件遺失後永久停住。

即使查詢回 `200`，也要讀結果內容。若是失敗，保存原因，將未完成的工作交回操作者；若仍待處理，繼續有限度輪詢。輪詢退避、最大等待時間與人工接手都是應用自己的設定，本文未測量 GitHub 的處理延遲，也不替它設定完成時間承諾。

把等待預算設為五分鐘，只表示五分鐘後 Bot 停止主動等待。它應回報「仍在處理，稍後對帳」，而不能宣告合併失敗並啟動補償。伺服器可能在第六分鐘完成；錯誤補償會對一個已成功的變更做第二次操作。

## 工作紀錄的保存時間，不能等同於 API 保留期

GitHub 文件說明，非同步結果在最近一次更新後保留 24 小時，過期後 UUID 查詢會回 `404`。因此我的 Bot 會保存已看過的結果與 PR 連結；重新啟動時若收據過期，就依 PR 目前狀態與本地紀錄對帳，不能從 `404` 推論「從未合併」。

對帳結果若仍不足以判定，就保留未知並請人查看。不應只為拿到新的 UUID 再發起一次操作。這與站內〈[Webhook 的重試與交付邊界](/blog/webhook-system-architecture-hmac-retry-dlq/)〉相通：事件、收據與本地狀態各自需要一個可恢復的角色，通知成功也不會替業務完成背書。

權限也要按實際 endpoint 驗證。官方目前要求提交與查詢 async 結果的 fine-grained token 都具備 Contents write；查看一般 PR 合併狀態則有自己的權限要求。不能因為後者是 GET，就預先假設同一顆唯讀 token 可查全部狀態。本文只核對文件，沒有調整任何 repository 權限。[官方權限說明](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2026-03-10#fine-grained-access-tokens-for-get-the-result-of-an-asynchronous-merge)

## 合併完成之後，發布仍是另一項工作

若 Bot 還負責向團隊宣布上線，我會在確認合併後記錄實際 merge commit，再追蹤對應部署。部署成功後檢查正式網址與預期內容，才發送完成通知。這些步驟是本文的發布驗收建議；async merge API 本身沒有提供站台可讀性證明。

Stacked PR 又多一個範圍問題。官方說一次操作包含尚未合併的 downstack PR；核准畫面應列出受影響的 PR，逐一記錄後續狀態。文件的範圍描述不能當成全部變更具有原子回滾承諾，也不能讓一張最上層 PR 的核准隱藏其他變更。

**停止規則：無法對應核准的 head、既有工作選項衝突，或無法確認實際合併結果時，Bot 停在追蹤或人工處理，不能宣告發布完成。**

遷移前，先拿 Bot 的通知模板與狀態欄位做一次桌面演練：受理後重啟、PR 新 push、入列後被移除，以及超過一天才恢復追蹤。每個案例都要指出下一個可查的物件、負責接手的人，以及此刻可以對使用者說的進度，再接上新的 API。
