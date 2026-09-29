---
title: "AI Agent 的擴容單位，不該是整台沙盒"
description: "以 Tetral 的雲端 Agent runtime 設計為例，拆解工作狀態、可替換 runtime 與臨時電腦各自的生命週期，並整理驗證重試、恢復與背壓的檢查點。"
publishDate: 2026-09-29T21:55:43+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
  - 雲端架構
series: AI Agent 工程化與工作流實戰
seriesOrder: 35
cover: ../../assets/covers/ai-agent-runtime-durable-scaling.png
coverAlt: "暖白紙面上，一條藍色工作軌道由銅色節點固定並分岔；灰色運算積木可以拆下，軌道仍保持連續，表示 Agent 工作紀錄能跨越短命電腦。"
---

把 Agent 放進雲端沙盒後，最直覺的容量單位是一台電腦：需要更多 Agent，就多開幾台。這個做法能增加執行環境，卻會把 Agent loop、工作上下文與沙盒生命週期綁成同一個故障與擴容單位。

Yang Li 在 2026 年 9 月 6 日的 [Tetral 架構文章](https://tetral.ai/blog/the-next-scaling-problem/)記錄了這個轉折：第一個產品把 Agent loop 放進 E2B sandbox，後來才把 runtime、持久狀態與電腦資源拆開。**擴容前要先拆開工作狀態與執行環境，讓每一種負載依自己的生命週期恢復與擴展。**這篇只談雲端 runtime 邊界；長任務如何留下驗收證據，另見[用驗收證據讓 Agent 接著交付](/blog/argus-persistent-reviewed-agent-runtime/)。

## 整台沙盒不是穩定的工作單位

當 Agent loop、工作檔案與執行環境都住在同一台沙盒，增加一個需要執行的工作通常就意味著再配置一整個 Agent-sandbox 組合。閒置時，系統得在保留暖機容量和釋放資源之間取捨；環境被回收時，除錯紀錄也可能跟著消失。Tetral 原文提到，最早的控制平面雖然接管了沙盒容量與模型流量，仍然是用完整沙盒承載每個 Agent。

這個問題不是 Tetral 才遇到。Anthropic 在 2026 年 4 月描述 Managed Agents 的早期設計時，也提到 session、harness 和 sandbox 起初共用一個 container；把 harness、session log 和 sandbox 拆成介面後，程序與電腦才能分別故障或替換。[Anthropic 的設計回顧](https://www.anthropic.com/engineering/managed-agents)提供了另一個第一方案例，但不代表兩套產品採用相同的狀態模型。

因此，沙盒仍是重要的隔離與執行資源，只是不必成為 Agent 的居所。若讀取檔案、呼叫模型或操作 MCP 都能在獨立服務完成，就不該為每個動作都先啟動完整電腦。Tetral 把模型 provider、MCP 連線與電腦啟用交給不同服務，再讓 runtime 宣告下一步需要哪種能力。憑證留在 Gateway 或 MCP connector 只能限制秘密的可達範圍；真正 dispatch 前還要由工具政策或 approval gate 判斷這次動作是否獲准，兩者是不同的邊界（[Tetral 原文](https://tetral.ai/blog/the-next-scaling-problem/)）。

## 先決定誰擁有狀態與副作用

Tetral 將一個 session 的執行記錄放在 PostgreSQL；thread 是 session 裡單一有序的工作路徑。Runtime 載入已提交的 thread 記錄，計算下一個轉移，再把動作交給真正擁有該能力的服務。Runtime 可以被替換，資料庫中的工作事實則不能只靠某個 pod 的記憶體維持。這是 [Tetral 原文描述的恢復邊界](https://tetral.ai/blog/the-next-scaling-problem/)，不是所有 Agent 產品都必須採用的固定解法。

這種設計的核心不是「加一個資料庫和 Queue」，而是定義每一步的提交順序：

1. 接受輸入時，在同一筆交易記錄輸入、目標 thread 的 Inbox 項目與待派送工作。
2. Runtime 讀取已提交的狀態，提出帶有穩定識別碼的下一個動作。
3. 狀態邊界驗證 thread 擁有權與順序，提交動作紀錄和 receipt；收到提交確認後，才派送外部操作。
4. 操作結果先存下來，再把結果提交回 thread；Reducer 確認結果已進入狀態後才繼續。

PostgreSQL 交易可讓同一資料庫中的多項更新一起成功或一起回滾；Transactional Outbox 也用同一原理把狀態變更與待送事件一併提交。[PostgreSQL 交易文件](https://www.postgresql.org/docs/18/tutorial-transactions.html)與 [Microsoft 的 Outbox 說明](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos)描述的是資料庫內的提交邊界。外部 API、模型請求或 shell 命令不會因此自動加入同一個交易。

所以 `operation_id` 或 receipt 只能讓系統辨認「這是同一個已登記動作」，不能保證任意外部副作用只發生一次。若 worker 在付款或部署已成功後、回報結果前失聯，系統仍要靠對方支援的 idempotency key、查詢對帳，或把結果標成未決並要求人工處理。**沒有副作用邊界的恢復策略，就沒有可安全重試的工作。**

Durable workflow engine 是另一種實作選擇。Temporal 透過 event history 重播 workflow 以恢復程式進度，但 Activity 仍可能由多次 task attempt 完成；外部操作一樣要考慮重試與冪等。[Temporal 的 task 說明](https://docs.temporal.io/tasks)指出了 workflow 恢復與 activity 執行之間的區別。要選的是狀態由誰保存、什麼失敗後能重播，以及副作用怎麼收斂，不是產品名稱。

## 兩種並行度，兩種隔離邊界

同一 thread 的狀態是有序的：兩個 Runtime 不能各自讀到同一個版本，再同時提交互相衝突的下一步。Tetral 的模型把並行拆成兩個方向：

- Thread 內的工作分支：一個任務可建立子 thread，各自保有上下文與順序，再把訊息或完成結果送回父 thread。
- Session 之間的獨立任務：不同 session 共用 workspace 中明確選取的檔案、記憶或憑證，但不共用執行歷史。

這兩軸是 [Tetral 原文提出的 session/thread 模型](https://tetral.ai/blog/the-next-scaling-problem/)，讓系統能增加獨立工作路徑；它不表示加 thread 就會提高交付品質。平行工作仍會增加模型呼叫、Queue、工具服務、儲存與審查負載；有衝突的輸出也需要明確的整合與驗收邊界。原文沒有提供 thread 或 session 的容量數據，因此它說明的是資料與工作如何切分，不是可達吞吐量。

## 把架構主張和容量證據分開

Tetral 在[原文的結尾](https://tetral.ai/blog/the-next-scaling-problem/)坦白說明，當時系統仍是個人 k3s cluster 上的 alpha：runtime 尚未依容量放置、backpressure 尚未串起請求准入／Queue 壓力／worker 供給、持續多節點恢復尚未證明，部署更新也會中斷執行中的 turn。這些限制不能被前面的邊界設計抵銷；它們代表 production scaling 還有待驗證。

沙盒平台也有自己的控制面瓶頸。Modal 在 2026 年 7 月發表的[百萬 sandbox 擴容文章](https://modal.com/blog/scaling-to-1-million-concurrent-sandboxes-in-seconds)稱，該測試在一分鐘內建立一百萬個 sandbox；但文章把單筆建立請求的成功點定義為排程器已指定 worker、sandbox 開始啟動，並另外量測可互動時間。這不是「一百萬個可執行環境都在一分鐘內就緒」的數據。文章也描述高頻建立時的排程與資料庫協調成本。這是 Modal 對自家系統與測試方式的報告，不能直接拿來比較 Tetral；它提醒我們，把 runtime 從 sandbox 拆開之後，sandbox fleet 仍然是一種需要獨立量測與擴展的負載。

開始增加 Runtime 副本前，先用故障注入回答五個問題：

1. 輸入已提交、Runtime 尚未啟動時，哪個 worker 會找到它？
2. Bridge 已提交動作，但 Runtime 沒收到提交確認時，帶相同 declaration identity 重送會取回原 receipt 嗎？
3. Inbox 已記錄輸入送達，但 Queue acknowledgement 遺失時，下一個 runner 能辨認已接受狀態並結束工作嗎？
4. 外部操作已完成但結果尚未回寫時，系統如何去重、查證或標記未決？
5. Queue 積壓或資料庫變慢時，API 會拒絕新工作、延後接受，還是持續把負載推進下游？

**停止規則：**只要重啟後仍無法分辨「尚未執行」「正在執行」「已執行但未確認」，就先修正狀態與副作用協定，再擴 Runtime。否則新增副本只會更快產生互相重複或互相覆蓋的工作。

下一次設計 Agent 平台時，先畫出工作記錄、Runtime、模型與工具連線、沙盒各自的擁有者與生命週期，再選擇 queue、workflow engine 或 sandbox provider。把一個 thread 的事件提交、外部副作用和結果回寫各注入一次故障，確認重試會回到哪個狀態，再依 Queue 最舊工作時間、工具等待時間和 Runtime 忙碌度擴容。

## 延伸閱讀

- [長任務不要從聊天紀錄續命：用驗收證據讓 Agent 接著交付](/blog/argus-persistent-reviewed-agent-runtime/)
- [Scaling Managed Agents: Decoupling the brain from the hands — Anthropic](https://www.anthropic.com/engineering/managed-agents)
- [The Next Scaling Problem — Yang Li, Tetral（2026-09-06）](https://tetral.ai/blog/the-next-scaling-problem/)
- [PostgreSQL 18：Transactions](https://www.postgresql.org/docs/18/tutorial-transactions.html)
- [Temporal：Tasks](https://docs.temporal.io/tasks)
- [Modal：Scaling to 1 million concurrent sandboxes in seconds（2026-07-16）](https://modal.com/blog/scaling-to-1-million-concurrent-sandboxes-in-seconds)
