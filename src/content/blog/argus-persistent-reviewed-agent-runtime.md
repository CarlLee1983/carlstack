---
title: "Agent 長任務如何接續：保存進度與可重跑的驗收證據"
description: "以 Microsoft Argus 與一個公開效能 PR 為例，拆解長時間 Agent 工作真正需要保存的狀態、獨立審查與停止規則；用最小任務契約判斷何時值得增加一層 runtime。"
publishDate: 2026-09-07T09:30:00+08:00
updatedDate: 2026-11-05T23:36:00Z
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
cover: ../../assets/covers/argus-persistent-reviewed-agent-runtime.png
coverAlt: "深色工程工作台上，一本帶有流程節點的黃銅活頁簿，以發光路徑連接四座金屬工作站，末端由冷白光檢查。"
series: AI Agent 工程化與工作流實戰
seriesOrder: 9
---

Agent 昨天寫完第一版程式，今天接手的人卻找不到已確認的決定、實際跑過的檢查與下一個交付物。長任務一旦中斷，重建這些背景就會吃掉不少時間。

舊版文章由 [Russell 的 Argus 貼文連結](https://x.com/russell3402/status/2096582675205361966)切入，但本次查核無法取得貼文正文，因此不沿用其中的案例歸屬或模型組合說法。這次查核使用官方倉庫與公開 PR，沒有安裝 Argus、重跑 GPU 測試或稽核各 backend 的隔離實作。角色與持久化能力依版本文件說明，效能數字依提交者紀錄。跨週退款與恢復檢查則是教學用的設計情境，不是 Argus 執行成果或 exactly-once 保證。

我會用交接成本判斷是否需要額外的 runtime：現有 coding agent 若能保存已驗證的進度，讓別人接著完成下一個交付物，就先保留這套工作流。

## Argus 的角色分工需要哪些交接資料

截至 2026-11-05 查閱的 [Argus 官方 README 快照](https://github.com/microsoft/ArgusAgent/blob/fdfeb715b0749db176c7d8b3212a717fb81087ba/README.md#the-driverharness-model)，角色分成 Manager、Planner、Engineer 與 Reviewer：Manager 管理階段轉換，Planner 指定下一項工作及證據，Engineer 產出成果，Reviewer 以唯讀角色判定正確性、證據與限制，也可以回報阻塞。

要讓這些角色接得上工作，我建議留下三種資料：

- 已確認的業務規則與決定：記錄決定者、適用範圍與來源，避免下一輪重新從聊天猜測。
- 可重跑的產物與檢查結果：記錄程式版本、輸入、命令、環境與結果；Reviewer 的一句通過不能取代證據。
- 未解問題與阻塞原因：記錄誰能解決、還缺哪個輸入，以及哪些工作已暫停。

將「寫出結果」與「判定可否交付」分開，能讓責任更可查。但 **checkpoint 代表可追溯的進度，不代表外部操作可以安全重播**。例如工作在退款 API 成功後、寫入本地狀態前中斷，恢復時必須先查交易結果或使用既有冪等鍵，不能因 checkpoint 尚未更新就再退款一次。

因此，客戶要的是「本週訂單在統計日已退款多少」時，FDE 或產品負責人仍要確認口徑。Agent 可以找出跨週退款、修改邏輯、重跑兩組樣例；但不能用多數決替客戶決定 4,000 元該歸到哪個經營指標。

## 先寫一份能讓人接手的任務契約

要交給 runtime 的工作，可以先寫成四欄的任務契約。以下 YAML 只示意契約內容，不能當成 Argus 設定檔使用。預期證據或停止條件尚未確定時，長時間執行很容易累積無法驗收的結果。

```yaml
goal: 讓週報工具區分本週訂單已退款與本週退款流水
inputs:
  - 訂單與退款兩張已核准使用的樣例表
  - 同一時區、幣別、週起訖與統計截止時間
evidence:
  - 第一週：訂單 100000、同週訂單退款 6000、退款流水 10000
  - 第二週：訂單 80000、同週訂單退款 5000、退款流水 8000
  - 兩週輸出可追溯到原始訂單與退款紀錄
stop_when:
  - 找不到退款對應的原訂單
  - 客戶尚未確認統計範圍
  - 需要讀取未授權的正式環境資料
  - 已達預先約定的時間或費用上限
  - 上次外部寫入結果不明，尚未完成對帳
```

樣例將統計截止點設在各週週末，訂單退款欄只計該週訂單截至此時的已退款金額，退款流水欄則按退款發生時間歸週。若報表改用更晚的截止點，必須重算，不能沿用舊驗收數字。

這份契約刻意沒有規定使用者介面、語言或 Agent 角色數量。驗收要求是第一週應同時顯示「本週訂單扣除其已退款後為 94,000」與「本週發生退款總額 10,000」。兩者不能合併成一個看似整齊的數字。

> [!IMPORTANT]
> **沒有預期輸出、資料範圍與停止規則的任務，不適合長時間自動執行。**先補齊這三件事，通常比新增一個角色更能減少返工。

## Reviewer 的價值要能找到一個反例

公開的 [Flash Linear Attention PR #1045](https://github.com/fla-org/flash-linear-attention/pull/1045)留下了一個具體的審查案例。提交者表示 Argus 完成了可選 TileLang kernel 的實作、最佳化、正確性驗證與效能證據；2026-07-18 的 PR 描述也列出 H100 NVL、bf16、`B=8, T=1024, H=8, D=64` 工作負載下，forward + backward 從 0.900 ms 到 0.747 ms 的測量。這是該路徑的結果，不是整個模型服務的加速承諾。

維護者審查時找到了長序列強 gate 下可能出現 `0 × ∞ = NaN` 的數值問題，要求以 block-local reference 重新置中指數；修正後才合併。[審查意見與後續修正](https://github.com/fla-org/flash-linear-attention/pull/1045#issuecomment-5018684498) 這是外部維護者的審查成果，不能拿來證明 Argus 內部 Reviewer 已攔下此問題，也不能由合併推論整個自主流程都被獨立驗證。這份意見給出了失敗條件、reference 行為與修正方法，實作者可以據此重現並修正問題。

把這個標準套回一般工程任務，review 任務至少要能回答：

1. 除了 happy path，哪個輸入可能讓結果錯？
2. 正確答案可從哪個來源或不變量復算？
3. 修正是否保留既有回退路徑與已確認需求？

如果 reviewer 無法指出其中一項，就將它降回一般自檢，不要假裝多一個模型已經形成獨立驗證。

## 用一次暫停與一次交接判斷值不值得

[本次查閱的安裝文件](https://github.com/microsoft/ArgusAgent/blob/fdfeb715b0749db176c7d8b3212a717fb81087ba/README.md#quick-install)列出 Python、Node.js 與已認證的 Agent CLI 等前提，並區分官方 source repository、開發預覽與 Desktop 發行管道。**README 的功能清單不能直接當成已安裝版本的能力清單。**

至少記下來源倉庫、commit 或套件版本、實際 executable 路徑、backend 與模型設定，再依該版本文件做小型驗證。source 更新不表示已發布的 Desktop EXE 同步更新；名稱相同也不能證明命中了相同 executable。安裝與更新命令應使用對應管道、作業系統及版本的文件。

先用一個兩三天內能完成、但確實會中斷的任務做對照即可。執行一次後暫停，隔一段時間再恢復；接著請一位未參與的人，只讀專案留下的狀態，完成一個很小的變更。記錄下列三件事：

### 恢復：先確認哪一版證據仍有效

找到最後一個已驗證 checkpoint，確認程式、輸入與依賴沒有讓舊結果失效。恢復前檢查是否已有 worker 仍在執行，以及上次外部寫入是否成功；無法判斷時停止相關寫入，也不要啟動第二份任務。

### 交接：讓未參與的人指出缺口

新接手者應能說出已確認規則、未解問題與輸入位置。做不到時先補紀錄，不要靠增加角色補背景。

### 驗收：保留反例與停止原因

小改動後能重跑原有樣例，並標示未覆蓋情境。若檢查失敗，補一個能重現的反例；若預算已盡或需要新增權限，留下可恢復狀態並停止，不能把「持續工作」當成略過邊界的理由。

評估這輪試用時，記錄人工是否少花時間重建任務狀態、客戶需求變動時是否少漏掉先前承諾，以及這些收益是否大於設定、模型呼叫與審閱成本。

## 下一步：先留 checkpoint，再決定要不要留 runtime

下次有需要跨好幾輪才交付的工作，先在 repository 留下任務契約、樣例資料的範圍、預期輸出與最後一個已驗證 checkpoint。把工作暫停一次、交給別人續做一次。

若這兩步仍要靠翻聊天紀錄與重新說明背景，Argus 這類 runtime 值得試用；若現有 coding agent 和專案紀錄已經能讓交接順利發生，保留那套更簡單的工作流就好。

## 延伸閱讀

- [原始來源線索：Russell 貼文（本次未取得正文）](https://x.com/russell3402/status/2096582675205361966)
- [Microsoft ArgusAgent 官方倉庫](https://github.com/microsoft/ArgusAgent)
- [Flash Linear Attention PR #1045](https://github.com/fla-org/flash-linear-attention/pull/1045)
- [Skill 不會死：把 Agent 指令縮成可驗證的方法，而不是更短的咒語](/blog/agent-methods-over-skill-bulk/)
- [AI Agent 的擴容單位，不該是整台沙盒](/blog/ai-agent-runtime-durable-scaling/)
