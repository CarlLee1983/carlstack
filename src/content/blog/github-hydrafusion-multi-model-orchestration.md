---
title: "HydraFusion 多模型編排：把品質與成本放在同一組任務驗證"
description: "區分 HydraFusion 的 Single、Cascade 與 Critique，正確解讀三組離線評測，並補上 Copilot Fusion 後續產品變更與自建工作流的驗收方法。"
publishDate: 2026-10-01T12:05:00+08:00
updatedDate: 2026-11-05T19:16:00+00:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
  - 技術選型
series: AI Agent 工程化與工作流實戰
seriesOrder: 42
cover: ../../assets/covers/github-hydrafusion-multi-model-orchestration.jpg
coverAlt: "鐘錶工坊中，左側工匠快速繪製齒輪草圖，中央獨立玻璃鐘罩內的透鏡唯讀審查機件，右側重型黃銅鐵砧準備進行單次微調，象徵草稿、異質唯讀審查與有界修訂的分工架構。"
---

多模型工作流的價值，應用相同任務的成功率、總成本與等待時間判斷。多一個審查模型可以增加觀察角度，也可能增加延遲、錯誤建議與工具執行費用；「跨模型」本身不是品質保證。

[GitHub 於 2026 年 9 月 30 日的更新](https://github.blog/changelog/2026-09-30-hydrafusion-in-vs-code-and-the-github-copilot-app/)把 HydraFusion 研究預覽擴展到 VS Code 1.140 以上與 Copilot app。這是當時的產品狀態，不應當成永久的啟用指南。

> [!NOTE]
> 2026 年 11 月 5 日更新：GitHub 已於 [10 月 28 日宣布 Copilot Fusion 正式推出](https://github.blog/changelog/2026-10-28-route-and-orchestrate-models-with-github-copilot-fusion/)，整合 HydraFusion 與 Auto 的能力，並提供 Standard、High、Max 等級。以下保留對 HydraFusion 研究設計的分析；舊評測不是新版所有模式的效能保證。

## 三種模式解決不同的派工問題

依[原始研究介紹](https://github.blog/ai-and-ml/github-copilot/project-hydrafusion-frontier-quality-via-multi-model-orchestration/)，當時的三種執行模式是：

- Single：由選定的一個模型直接完成。
- Cascade：較有效率的模型先產生結果，再由品質門檻決定接受或升級。
- Critique：一個模型起草，不同模型家族的唯讀審查員檢查，再由原模型修訂一次。

這些描述沒有公開完整的路由閾值，不能自行補成「70% 日常任務第一輪過關」。Single 省去額外審查步驟，也不等於完全沒有排程成本或必然有最低首字延遲。

對自建系統，我會把路由條件放在可觀察的失敗上：測試失敗、型別錯誤、工具權限不足、超時或缺少必要資料。模型自評信心可以是訊號，但不宜單獨決定是否放行。

## 唯讀審查限制寫入，不能消除共同錯誤

跨家族審查可作為減少相同推理偏差的設計假設，仍須實測。兩個模型可能共享訓練資料、接受相同錯誤前提，或共同漏看測試未涵蓋的情境。因此「終結同源盲點」過強。

唯讀也應由工具權限落實，而不是只在提示詞說「不要修改」。我建議審查員輸出具體位置、失敗條件與可重現案例，交由有寫入權限的工作者處理。

一次修訂可以限制回合數，不能保證固定完成時間。單輪工具呼叫仍可能卡住；完整工作流需要時間上限、最大工具次數、重試預算與取消機制。**達到預算仍未通過驗證，就保留失敗證據並停止自動交付。**

## 評測要逐組讀，不能合成「全面更好」

GitHub 原始文章公布的是最佳調校設定相對 Opus 5 的離線結果：

- TerminalBench 2.1：品質增加 4.9 個百分點，估計成本降低 67%。
- DeepSWE：品質減少 1.5 個百分點，估計成本降低 36%。
- CheckpointBench：品質減少 0.1 個百分點，估計成本降低 65%。

原文採相同 medium reasoning 等級，成本納入起草、審查、修訂、升級、重試與 fallback。結果受模型池、價格、工作流與 benchmark 版本限制；它沒有證明所有真實任務都同時省錢、變快且更準。上述數字應連同[研究方法與限制](https://github.blog/ai-and-ml/github-copilot/project-hydrafusion-frontier-quality-via-multi-model-orchestration/)閱讀。

成本降低也不等於 token 數量同比降低。模型單價、上下文長度與工作流組合都會改變費用；對內評估至少應同時保留 token 用量與金額，而非只報其中一項。

## 自建工作流如何驗收

以下是本文建議的試驗，不是 GitHub 已公開的內部實作：

1. 固定一批代表性任務與程式庫版本。包含簡單修改、多檔案改動及會失敗的邊界案例，不要只選模型擅長的題目。
2. 比較單模型基準、Cascade 與 Critique。每組使用相同工具、權限、時間預算與成功條件，並保留重跑結果。
3. 將修訂後的最終產物重新跑測試。審查員同意不等於測試通過，測試通過也不等於需求全部滿足。
4. 記錄整次工作流的費用與延遲，包括失敗和 fallback。另列誤接受率：品質門檻放行，但最終驗收失敗的比例。
5. 先設定可接受的品質退步範圍，再比較節省金額。付款、權限和資料刪除等高風險任務，不能只用平均成功率決定是否自動交付。

最新版 Copilot Fusion 仍受組織允許的模型政策約束，並按實際使用的模型計費；產品優惠與價格應以當期[官方更新](https://github.blog/changelog/2026-10-28-route-and-orchestrate-models-with-github-copilot-fusion/)及帳戶顯示為準。先選一個能獨立驗收的任務，量出完整成本，再決定是否擴大採用。

原文使用的 [GitHub Blog 首頁](https://github.blog/)保留作為入口，具體產品與評測主張以上方直接連結為準。
