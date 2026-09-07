---
title: "長任務不要從聊天紀錄續命：用驗收證據讓 Agent 接著交付"
description: "以 Microsoft Argus 與一個公開效能 PR 為例，拆解長時間 Agent 工作真正需要保存的狀態、獨立審查與停止規則；用最小任務契約判斷何時值得增加一層 runtime。"
publishDate: 2026-09-07T09:30:00+08:00
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

長時間的 Agent 工作最容易壞掉的地方，不是它不會寫第一版程式，而是隔天回來後，沒有人知道哪個決定已確認、哪個檢查真的跑過，以及下一步應從哪個成果繼續。

[Russell 的 Argus 長文](https://x.com/russell3402/status/2096582675205361966?s=12)用跨週退款的週報工具說明這個問題：若只把「本週退款」從「本週訂單」扣掉，來自上週訂單的退款就會讓數字看似正確、業務意義卻錯置。這是很好的驗收例子。不過文中關於特定模型的組合是推演，本文不把它當作已驗證結論；以下只採用 [Microsoft Argus 官方倉庫](https://github.com/microsoft/ArgusAgent)與公開程式碼審查能查到的事實。

我的立場是：**長任務需要保存的不是更長的對話，而是已驗證的進度與下一個可檢查的交付物。**如果現有 coding agent 已能保留這些東西，就不必為了「多 Agent」加一個 runtime。

## Argus 解決的是交接，不是替你定義需求

Argus 將執行模型切成 Manager、Planner、Engineer 與 Reviewer。官方定義中，前兩者處理任務與下一步，Engineer 產出程式、研究或實驗結果，Reviewer 則獨立檢查正確性、證據、限制與完成狀態。[Argus README](https://github.com/microsoft/ArgusAgent#runtime-model)

這個切法有價值的地方不是四個名字，而是三個可觀察的邊界：

| 要留下的東西           | 誰能改變它                   | 下一輪如何使用               |
| ---------------------- | ---------------------------- | ---------------------------- |
| 已確認的業務規則與決定 | 操作人或被授權的 Manager     | 不必重新從聊天猜測           |
| 可重跑的產物與檢查結果 | Engineer 產出，Reviewer 判定 | 只從已驗證的 checkpoint 繼續 |
| 未解問題與阻塞原因     | 提出者記錄，操作人裁決       | 精確地向客戶或同事詢問       |

官方倉庫宣稱這些任務、checkpoint、決定、Skills 與證據能跨 session 保存，並讓正常回合以 Reviewer 判斷結束。[持久狀態與審查模型](https://github.com/microsoft/ArgusAgent#what-is-argus) 這不代表 Reviewer 必然正確；它只是把「寫出結果」和「判定可否交付」拆成可被檢查的兩個責任。

因此，客戶要的是「本週訂單在統計日已退款多少」時，FDE 或產品負責人仍要確認口徑。Agent 可以找出跨週退款、修改邏輯、重跑兩組樣例；但不能用多數決替客戶決定 4,000 元該歸到哪個經營指標。

## 先寫一份能讓人接手的任務契約

在裝 runtime 前，先把要交給它的工作縮成這四欄。這同時是可用性測試：若寫不出 evidence 與 stop rule，先別讓 Agent 自主跑很久。

```yaml
goal: 讓週報工具區分本週訂單已退款與本週退款流水
inputs:
  - 訂單、退款、廣告三張已核准使用的樣例表
evidence:
  - 第一週：訂單 100000、同週訂單退款 6000、退款流水 10000
  - 第二週：訂單 80000、同週訂單退款 5000、退款流水 8000
  - 兩週輸出可追溯到原始訂單與退款紀錄
stop_when:
  - 找不到退款對應的原訂單
  - 客戶尚未確認統計範圍
  - 需要讀取未授權的正式環境資料
```

這份契約刻意沒有規定使用者介面、語言或 Agent 角色數量。它只鎖住交付的意義：第一週應同時顯示「本週訂單扣除其已退款後為 94,000」與「本週發生退款總額 10,000」。兩者不能合併成一個看似整齊的數字。

> [!IMPORTANT]
> **沒有預期輸出、資料範圍與停止規則的任務，不適合長時間自動執行。**先補齊這三件事，通常比新增一個角色更能減少返工。

## Reviewer 的價值要能找到一個反例

公開的 [Flash Linear Attention PR #1045](https://github.com/fla-org/flash-linear-attention/pull/1045)提供一個比角色圖更有用的例子。提交者表示 Argus 完成了可選 TileLang kernel 的實作、最佳化、正確性驗證與效能證據；PR 也列出特定 H100 NVL、bf16 工作負載下，forward + backward 從 0.900 ms 到 0.747 ms 的測量。這是該路徑的結果，不是整個模型服務的加速承諾。

更關鍵的是維護者審查時找到了長序列強 gate 下可能出現 `0 × ∞ = NaN` 的數值問題，要求以 block-local reference 重新置中指數；修正後才合併。[審查意見與後續修正](https://github.com/fla-org/flash-linear-attention/pull/1045#discussion_r) 這就是 reviewer 應帶來的產物：具體的失敗條件、對照的 reference 行為，以及可驗證的修正，而不是「看起來沒問題」的第二份摘要。

把這個標準套回一般工程任務，review 任務至少要能回答：

1. 哪個輸入會讓結果錯，而不是只重跑 happy path？
2. 正確答案可從哪個來源或不變量復算？
3. 修正是否保留既有回退路徑與已確認需求？

如果 reviewer 無法指出其中一項，就將它降回一般自檢，不要假裝多一個模型已經形成獨立驗證。

## 用一次暫停與一次交接判斷值不值得

Argus 官方 README 支援多種既有 Agent CLI，也明確列出安裝前提：Node.js 與一個已認證的 Agent CLI；一般安裝不需要 Docker。[安裝與 backend 要求](https://github.com/microsoft/ArgusAgent#quick-install) 這不表示每個團隊都應安裝它。

先用一個兩三天內能完成、但確實會中斷的任務做對照即可。執行一次後暫停，隔一段時間再恢復；接著請一位未參與的人，只讀專案留下的狀態，完成一個很小的變更。記錄下列三件事：

| 觀察 | 通過條件                                          | 不通過時先做什麼         |
| ---- | ------------------------------------------------- | ------------------------ |
| 恢復 | 找到最後一個已驗證 checkpoint，沒有重做已完成工作 | 修正狀態或證據紀錄       |
| 交接 | 新接手者能說出已確認規則與未解問題                | 補回決定與輸入位置       |
| 驗收 | 改動後能重跑原有樣例，並標示未覆蓋情境            | 增加一個反例，不增加角色 |

不要把「Agent 跑了多久」當成成效。比較的是人工是否少花時間重建任務狀態、客戶需求變動時是否少漏掉先前承諾，以及這些收益是否大於設定、模型呼叫與審閱成本。

## 下一步：先留 checkpoint，再決定要不要留 runtime

下次有需要跨好幾輪才交付的工作，先在 repository 留下任務契約、樣例資料的範圍、預期輸出與最後一個已驗證 checkpoint。把工作暫停一次、交給別人續做一次。

若這兩步仍要靠翻聊天紀錄與重新說明背景，Argus 這類 runtime 值得試用；若現有 coding agent 和專案紀錄已經能讓交接順利發生，保留那套更簡單的工作流就好。要管理的是可驗收的進度，不是 Agent 的人數。

## 延伸閱讀

- [Russell：GPT 與 Argus 的 FDE 任務推演](https://x.com/russell3402/status/2096582675205361966?s=12)
- [Microsoft ArgusAgent 官方倉庫](https://github.com/microsoft/ArgusAgent)
- [Flash Linear Attention PR #1045](https://github.com/fla-org/flash-linear-attention/pull/1045)
- [Skill 不會死：把 Agent 指令縮成可驗證的方法，而不是更短的咒語](/blog/agent-methods-over-skill-bulk/)
