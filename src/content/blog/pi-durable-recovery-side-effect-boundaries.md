---
title: "Pi Durable 能接續任務，但重啟後的副作用仍要自己驗收"
description: "Pi 1.0 與實驗套件 Pi Durable 同日發布。從 checkpoint、工具重播與 requestId 的不同保證，建立部署 Agent 的中斷恢復、外部操作去重與人工介入驗收方法。"
publishDate: 2026-10-02T10:06:52+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
series: AI Agent 工程化與工作流實戰
seriesOrder: 52
cover: ../../assets/covers/pi-durable-recovery-side-effect-boundaries.png
coverAlt: "陶土步道在斷裂處由陶瓷檢查點閘門接續，另一道閘門前停著等待確認的陶土人偶，呈現任務恢復與外部操作授權的不同邊界。"
---

部署服務已接受請求，Agent 卻在把成功結果寫回本機之前當機。重啟後，它應該再部署一次、查詢既有工作，還是停下來等人確認？這比「對話紀錄還在不在」更接近長任務的可靠性問題。

Earendil 在 2026 年 10 月 1 日發布 [Pi 1.0](https://earendil.com/posts/pi-1-0/)，同時推出 [Pi Durable](https://earendil.com/posts/pi-durable/)。前者是團隊稱已經加固的 coding harness；後者是另行探索長任務的實驗套件，API 仍可能改變。本文閱讀官方公告與文件，沒有安裝 Pi 或做當機實測。

我的判斷是：Durable 值得評估的地方，在於它把「哪些工作可以恢復」變成介面契約。外部服務已經做了什麼，仍需要應用自己的證據。

## 1.0 的穩定定位，不等於 Durable 的 API 承諾

Pi 1.0 公告列出 Codemode、virtual models、延後載入工具與提示變更等功能，但把 Durable 明確列為 experimental package。[官方發布說明](https://earendil.com/posts/pi-1-0/)不能當成 Durable 已適合所有正式服務的保證。

昨日〈[Pi 開始支援 MCP：工具接得上之後，還要能組合](/blog/pi-mcp-codemode-tool-composition/)〉討論工具發現與資料組合。本篇換一個驗收問題：程式在任何一步被中斷，下一個 process 能否知道哪些事已完成、哪些事不能直接重做？

站內〈[AI Agent 的擴容單位，不該是整台沙盒](/blog/ai-agent-runtime-durable-scaling/)〉已談狀態、runtime 與冪等的通用邊界。這裡聚焦 Pi 的 `requestId`、`replay` 與取消契約，讓那些原則有具體可查的介面。

官方 Durable 文章也說，它不取代 terminal coding agent。[套件 README](https://github.com/earendil-works/pi/blob/7fbbd5f4a1d982bb02d63472dde0774fa639f99b/packages/durable/README.md)則直接警告 API 可能在版本間無預告變動。評估時應固定套件版本與文件 commit，先選能隔離副作用的測試環境，再決定是否導入。

## checkpoint 記得進度，不能替外部系統作證

[Durable 的恢復說明](https://earendil.com/posts/pi-durable/#survives-crashes)把每一步工作建模為保存 checkpoint 的 task：新 process 開啟同一 storage 後，接續未完成工作。這是官方設計描述，本文不宣稱已驗證所有 storage 的故障行為。

以部署任務為例，先把過程切成三段：

1. 保存要部署的 commit、目標環境與操作識別。
2. 呼叫部署服務，取得工作 ID。
3. 保存工作 ID 與結果，讓後續步驟可查詢。

最危險的位置在第二與第三段之間。外部服務可能已接受工作，本機卻還沒有結果。這是本文的工程推論：harness storage 的原子提交，不能自然延伸成它與遠端部署服務之間的共同交易。

因此，恢復不應只看「上次 checkpoint 停在哪裡」。應另查外部服務能否用穩定操作 ID 找到既有工作；若不能，就保留未知狀態，不把它抹成失敗或成功。

部署拓撲也有前提：官方 [Long runs anywhere 說明](https://earendil.com/posts/pi-durable/#long-runs-anywhere)限定一份 storage 同時由一個 process 擁有，其他 client 連到該 process。多個 client 可以參與，不能據此推論多個寫入者可同時接管，或已具備高可用切換。重啟測試應先確認原擁有者退出，再讓下一個 process 開啟同一份資料。

## requestId、工具重播與副作用去重，是三份契約

官方文件讓相同 `requestId` 的 submission 回到原本的提交，避免重連後又排一次同樣的輸入。[Persist and Resume 文件](https://github.com/earendil-works/pi/blob/7fbbd5f4a1d982bb02d63472dde0774fa639f99b/packages/durable/README.md#persist-and-resume)描述的是這個提交層的去重；它不表示工具內所有 HTTP 操作都取得端到端精確一次保證。

工具層另有 `replay: "safe"`。[Tools 文件](https://github.com/earendil-works/pi/blob/7fbbd5f4a1d982bb02d63472dde0774fa639f99b/packages/durable/README.md#tools)說明：當機後只有宣告可安全重播的工具才重新執行；否則交回 interrupted 結果。這個標記是實作者的承諾，不是框架自動證明工具沒有副作用。

最後才是外部操作本身。官方付款範例把穩定 task ID 用作扣款鍵，顯示去重需要外部服務配合。[Tasks 範例](https://earendil.com/posts/pi-durable/#tasks)是示範設計，不能照此推定任意銀行或部署 API 都支援相同語義。

對部署 Agent，我會訂這條停止規則：**操作結果未知，而且服務沒有可靠查詢或去重能力時，停止自動重試。**

先把「查詢部署狀態」與「建立新部署」做成不同工具。前者可以在確認其讀取契約後評估重播；後者保留人工決策，或要求服務端提供可核對的去重機制。

## 人類介入也要記得批准了哪個版本

官方 hooks 範例將部署核准結果存成 memo，恢復時取回先前決定。[Hooks 說明](https://earendil.com/posts/pi-durable/#hooks)提供的是保存決策的機制；核准範圍仍由應用定義。

以下是本文設計的概念紀錄，不是 Pi API，可用來檢查人工核准是否足以恢復：

```json
{
  "operationId": "deploy-job-42",
  "commit": "<完整 commit SHA>",
  "target": "staging",
  "approvedBy": "<可查核的操作者 ID>",
  "approvedAt": "<含時區的時間>",
  "status": "approved"
}
```

這份紀錄必須能對應實際操作參數。如果模型在批准後換了 commit 或目標，舊的布林值就不足以代表新操作的授權。應用應重新核准或拒絕執行；這是本文建議，並非官方已替使用者實作的政策。

使用者也需要知道「停止」會停到哪裡。官方 ownership 設計區分前景與背景工作，一般 abort 可能留下背景 task。[Abort and Subagents 文件](https://github.com/earendil-works/pi/blob/7fbbd5f4a1d982bb02d63472dde0774fa639f99b/packages/durable/README.md#abort-and-subagents)可作為 UI 契約的起點。取消等待、取消 task 與撤銷已完成的遠端操作，應分別顯示，不能共用一句「已取消」。

子工作是否跟著停，要看它的 ownership；官方設計由被取消的 owner 向下取消其擁有的工作。前景工作取消不包含背景 task，若要停止背景工作，必須明確取消該 task，或使用包含背景工作的 conversation 取消方式。這是應用 UI 與驗收要展示的差異，不應靠使用者猜。

## 先在四個中斷點驗收，再讓它碰正式環境

我建議先用部署服務的 fake 或 staging 建立故障注入測試，固定同一份 commit、storage 與操作 ID。這是驗證方案，本文尚未執行，也沒有恢復時間或成功率數字。

### 呼叫外部服務以前

保存意圖後終止 process。恢復時確認任務仍存在、核准參數相同，而且沒有新增第二份 submission。記錄 harness task ID 與 submission ID，避免只靠自然語言摘要判斷。

### 服務已接受，但回應尚未保存

讓 fake 接受部署，故意丟掉回應再重啟。驗收的是服務端工作數量，以及 Agent 是否先查詢既有操作。查不到就應明確回報「結果未知」，而不是自己再送一次。

### 成功結果已保存以後

重送同一 `requestId`，再查 transcript、外部工作與工具呼叫紀錄。確認回到既有提交，已完成操作沒有因重連而再建立。也要用不同 ID 測試新的合法工作，避免去重鍵把應執行的第二次部署吞掉。

### 等待人工核准時

關掉 client，再連線另一個 client。確認它看到現有狀態、沒有多建立核准請求，且拒絕與批准都能追溯到指定 commit。再改一次 commit，驗證舊批准不會被沿用。

這些驗收延伸了〈[Agent 團隊的交接與停止條件](/blog/claude-agent-team-acceptance-boundaries/)〉：這次的交接發生在 process 與外部服務之間，驗收證據要包含兩邊的紀錄。模型說「我已恢復」只能作為待查主張。

下一步挑一條低風險長任務，在外部操作成功而本機尚未記錄的空窗刻意中斷。能用工作 ID、去重鍵與核准紀錄解釋恢復結果，再考慮擴大 Durable 的使用範圍。
