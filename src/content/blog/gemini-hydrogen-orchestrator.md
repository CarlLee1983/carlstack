---
title: "Antigravity Orchestrator 的模型分工"
description: "Google 在 Antigravity 加入 Gemini 4 Hydrogen 與 Orchestrator。整理規劃、實作與重新規劃的切換方式，並以訂單功能說明如何驗收多模型開發流程。"
publishDate: 2026-11-13T10:09:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
series: AI Agent 工程化與工作流實戰
seriesOrder: 116
cover: ../../assets/covers/gemini-hydrogen-orchestrator.webp
coverAlt: "深藍紙面上的象牙色圓規與銅色螺絲起子由綠色紙帶連接，分別代表規劃與實作在同一任務中交接。"
---

Google 在 [11 月 12 日的公告](https://antigravity.google/blog/gemini-4-hydrogen-in-google-antigravity/)中，將 Gemini 4 Hydrogen 與 Orchestrator 加入 Antigravity。Orchestrator 讓較大的模型負責規劃，再由 Hydrogen 修改程式、執行檢查。碰到計畫沒有涵蓋的問題，控制權會交回規劃模型。

查核日期為 11 月 13 日，依據是官方公告與模型文件。沒有執行 Antigravity、量測模型成本或重跑官方評測。下列訂單案例與驗收方式是工程建議。

## 一個任務可以來回交接

[官方文件](https://antigravity.google/docs/models#orchestrator)將工作拆成唯讀規劃、實作與重新規劃。每則新訊息先由規劃模型讀取程式與釐清問題，再交給 Hydrogen 執行。文件列出的交回條件包括驗證連續失敗兩次、介面行為與預期不同，以及計畫尚未決定的設計問題。純問答或審查可以由規劃模型直接回答。

這適合觀察需求已知、實作途中仍可能出現岔路的工作。例如為訂單增加「取消原因」：欄位、API 與表單看起來都很單純，實際修改卻發現部分舊訂單沒有取消時間。執行者此時需要知道，應補資料、接受空值，還是縮小功能範圍。

我會把這個問題寫進任務的停止條件。若舊資料使既定不變條件無法成立，就帶著查詢結果與失敗測試重新規劃。否則，執行者很容易靠放寬驗證讓測試通過，順便改掉原本的業務限制。

## 交接需要哪些資料

模型交接時，我會要求保留四種資訊：

- 這次允許修改的檔案與功能範圍。
- 已採用的決策，以及決策依據。
- 已完成的修改、執行過的檢查與實際結果。
- 未解決的問題，以及要由誰決定。

以取消訂單為例，「測試失敗」不夠具體。交接紀錄應指出是哪個案例、預期狀態與實際狀態，以及失敗發生在資料驗證、狀態轉換還是事件發布。規劃模型才能判斷是修實作，還是原需求漏了一種訂單狀態。

同一段對話能保留上下文，但仍值得檢查模型有沒有把早期假設當成已確認事實。重新規劃後，應明確記錄改了哪項決定，讓後續審查能沿著差異往回查。

## 模型分工與平行代理不同

Orchestrator 在同一對話中交接規劃與執行，並不是同時啟動多個代理。需要平行工作時，官方另提供 subagents、Swarm 等功能。Orchestrator 使用固定設定，無法自行調整 thinking level；要控制推理深度，需直接選擇單一模型。[模型文件](https://antigravity.google/docs/models#orchestrator)

對小幅修改，我會先使用單一模型：需求容易描述、檢查快速，額外交接的收益可能有限。涉及多個模組且需要中途修正計畫時，再比較 Orchestrator。至於拆成平行代理，前提是能把檔案與責任分開，例如 API 契約已確定後，分別實作前端與後端。兩個代理同時猜同一份契約，反而增加整合工作。

## 用完成的功能比較成本

Google 報告 Orchestrator 在 Terminal-Bench 4.1 接近 Carbon 的任務成功率，平均少用 24% 額度、快 19%。這是官方評測結果，額度也不應直接換算成每個團隊都能節省相同比例的帳單。[發布公告](https://antigravity.google/blog/gemini-4-hydrogen-in-google-antigravity/)

可從近期已完成的修改挑一組重播案例，固定初始 commit、需求與測試，比較單一模型和 Orchestrator。除了耗時及用量，也記錄人工修正時間、漏掉的驗收項目，以及重新規劃後是否改變需求。

若一種模式比較快，卻經常略過資料遷移或權限檢查，就把這類工作另外分類。不要只看全部任務的平均值。評估方法也可對照[Gemini Decisions API 的批次與延遲](/blog/gemini-decisions-batch-latency/)，將官方速度數字與自己的完整工作時間分開。

第一次試用可選一個有明確回歸測試的訂單修改，先寫下允許變更的範圍和重新規劃條件。最後逐項核對需求、程式差異與測試結果，再決定下一批工作是否採用相同分工。
