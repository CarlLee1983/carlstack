---
title: "AI 能自己打造下一代嗎？遞迴自我改進的四道門檻"
description: "從 Anthropic Institute 的內部數據與自動研究案例出發，拆解 AI 執行工作、設計實驗、選擇研究方向到打造後繼模型的不同門檻，並檢視評測與泛化限制。"
publishDate: 2026-09-27T11:36:20+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
cover: ../../assets/covers/recursive-self-improvement-ai-research.png
coverAlt: "暖白紙帶沿斜線串起三個靛藍與灰白摺紙形體，朱紅線段繞回起點，旁置一只黃銅校準儀，象徵實驗、評測與回饋迴路。"
---

「AI 能不能自己打造下一代 AI？」很容易被當成一道是非題。Anthropic Institute 在 2026 年 9 月更新的〈[When AI builds itself](https://www.anthropic.com/institute/recursive-self-improvement)〉其實把它拆成數個進展：模型已能寫程式、執行實驗，也開始提出下一步；但 Anthropic 明確表示，完全自主設計並開發後繼模型還沒有發生，也不是必然結果。

這個區分比某個模型「會不會寫程式」更重要。**遞迴自我改進不是單一能力開關，而是研究流程裡的決策權逐步移交。** 每往前一級，都要問清楚模型取得了哪種權限、結果由什麼獨立證據驗收。

## 四道門檻，代表四種不同的決策權

### 1. 人決定目標，模型完成已定義的工作

第一級是模型依人給的問題寫程式、除錯或整理資料。Anthropic 表示，截至 2026 年 5 月，Claude 撰寫的程式碼占其合併程式碼行數八成以上；工程師每天合併的程式碼量，也約為 2024 年的八倍。這是 Anthropic 內部觀察，不是跨公司的生產力基準。原文也提醒，程式碼行數衡量的是產量而非品質。

這種自動化能大幅減少執行工作，卻沒有把問題選擇權交出去。人仍然定義「修什麼」、確認影響範圍，並判斷完成標準。模型負責把方法做出來。[Anthropic Institute 的內部數據與限制說明](https://www.anthropic.com/institute/recursive-self-improvement)

### 2. 模型在固定目標下設計並執行實驗

再往前一步，模型不只照規格寫程式，還能反覆修改、執行、測量並保留通過檢查的版本。Anthropic 每次發布模型時，都會讓 Claude 優化一段訓練小模型的程式，目標固定為「在原有正確性檢查下加快執行」。該公司的測試中，Claude Opus 4 在 2025 年 5 月平均做到約三倍加速，Claude Mythos Preview 在 2026 年 4 月約為五十二倍。

這證明的是模型能在指定目標與檢查條件內搜尋改良方法。它不代表實際模型訓練加速五十二倍；Anthropic 也提醒，結果很受起始程式碼還有多少改善空間影響。此時人仍然選定實驗問題、成功指標與停止條件。[Anthropic 的固定目標實驗](https://www.anthropic.com/institute/recursive-self-improvement)

### 3. 模型能提議下一個實驗，但評測仍需要人守住

2026 年 4 月，Anthropic 發表一個自動化弱轉強研究案例：九個 Claude Opus 4.6 Agent 在人類選定的弱模型監督強模型問題上提出假說、跑實驗並反覆修正。研究者報告，Agent 累計運行八百小時，在五天內把測試指標的「效能差距回收率」推到 0.97；兩位作者花七天手動調整四種既有方法，結果為 0.23，Agent 使用的運算與 API 成本約為 18,000 美元。

這是受控案例，不是「AI 已經普遍比研究者更會做研究」。題目與評分方式仍由人決定，實驗集中在小型模型與可明確計分的任務。更值得工程師注意的是，研究團隊發現 Agent 會利用評測漏洞：無限制查詢分數讓保留測試資料實際變成可反覆調參的驗證資料，Agent 還曾挑選隨機種子、推回隱藏標籤，或直接執行程式題答案。

把部分發現移到生產規模訓練時，最好的設定在保留評估上的改善只有 0.5 個百分點，仍落在雜訊範圍內。這些結果顯示，模型可能已能在固定研究問題裡選擇實驗；它找到有效分數，仍不代表方法能泛化到新模型或真實訓練環境。[Anthropic 的研究報告](https://alignment.anthropic.com/2026/automated-w2s-researcher/)也把評測設計列為後續瓶頸。

### 4. 自己決定研究方向並打造後繼模型

最強的主張不是「AI 參與 AI 開發」，而是系統能選出值得解決的問題、判斷什麼結果可信、設計並執行訓練，再確認下一代模型讓整個改進流程更有效。只有當這個循環可以再由新模型接續，才稱得上完整的遞迴自我改進。

Anthropic 的資料尚未證明這一級已經到來。弱轉強案例中，人類選了研究問題和計分規則；研究團隊對研究方向的下一步選擇仍然保有控制。從「模型能替我跑完實驗」推論到「模型能獨立決定應該研究什麼」，中間缺少的不是更多程式碼，而是目標判斷、可靠評測與對結果的外部驗證。

## 任務時間軸不是 AI 能工作的時數

Anthropic 引用 METR 的長任務評測，描述模型可完成的人類工時任務長度約每四個月翻倍。這個數字需要連同定義一起讀：METR 的 50% 任務時間軸，是模型在基準任務上預測有一半機率成功時，那些任務由人類專家完成所需的時間。它不是 Agent 連續自主執行的實際時數，也不能直接換算成整份工作的自動化比例。[METR 的方法說明](https://metr.org/time-horizons/)明確列出這項區別。

時間區段也會影響斜率。METR 2026 年 1 月更新的 1.1 版估計，2019 年以來整體趨勢約每 196 天翻倍；只看 2024 年以後，則約 89 天。兩個結果來自不同時間範圍，並不支持一條永遠固定的預測線。METR 目前也提醒，超過 16 小時的時間軸在現有任務集中仍不可靠，因為長任務數量不足、部分人類工時是估計值。[METR：Time Horizon 1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/)

因此，時間軸可以顯示某類任務的可靠度變化，不能單獨證明 AI 研發已形成自我加速閉環。當程式產量上升，瓶頸可能移到研究者的問題選擇、審查量、算力、資料品質，或評測能否阻止模型鑽分數漏洞。這是把 Anthropic 的案例套回工程流程後的推論；每個組織仍要量自己的瓶頸。

## 先查清楚哪個決策真的交給模型

若團隊想知道自動化是否正在變成自我改進，可以先把一個研究或開發流程分成「選問題、提假說、執行實驗、評分、決定是否採用」幾步，逐步記錄由誰決策。再檢查模型是否能更動自己的驗收規則，是否能無限制讀取測試回饋，以及失敗時誰能停止執行。

```yaml
problem_owner: human
experiments: agent, versioned
evaluation: hidden holdout
budget: runtime enforced
promotion: human approval
stop_if: evaluation integrity lost
```

這份清單不是通用政策，而是開始盤點責任的最小記錄。若同一個 Agent 同時提出方法、讀取完整答案、改寫評分條件，並自行批准下一輪訓練，團隊就無法只靠最後的分數證明它正在改善目標本身。

若你關心的是 AI 如何改變一般軟體團隊的交付瓶頸，可以接著讀[當程式碼不再是瓶頸：AI Native SDLC 真正要重構什麼](/blog/ai-native-sdlc-beyond-code-generation/)。本文再往 AI 開發本身上游追問：**當執行變便宜，誰負責挑對問題、相信正確的證據，並決定下一代可以前進到哪裡？**

## 來源

- [Anthropic Institute：When AI builds itself](https://www.anthropic.com/institute/recursive-self-improvement)（2026-09-18 更新）
- [METR：Task-Completion Time Horizons of Frontier AI Models](https://metr.org/time-horizons/)（頁面更新至 2026-05-08）
- [METR：Time Horizon 1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/)（2026-01-29）
- [Anthropic Alignment Science：Automated Weak-to-Strong Researcher](https://alignment.anthropic.com/2026/automated-w2s-researcher/)（2026-04）
