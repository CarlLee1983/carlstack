---
title: "AI FDE 不只是聊天機器人：從 Palantir 架構中心看企業 AI 的落地邊界"
description: "以 Palantir Architecture Center 與 AI FDE 文件為例，拆解 Ontology、AIP、Foundry、Apollo 如何把資料、邏輯、動作與治理接到可執行的企業流程。"
publishDate: 2026-09-04T12:00:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
  - 技術選型
cover: ../../assets/covers/palantir-ai-fde-architecture-center.png
coverAlt: "資料卡與動作方塊沿深藍色連線匯入中央 Ontology 節點並通過治理閘門"
---

「AI FDE」容易被理解成一個更會聊天的企業助理。Palantir 的公開文件呈現的是另一種設計：Agent 不只回答問題，而是把自然語言轉成 Foundry 的資料、邏輯、Ontology 與工作流操作；每個動作仍受既有權限、分支與審計約束。

這篇整理自 [@oops073111 的系列導讀](https://x.com/oops073111/status/2095341660385509463)，並以 [Palantir Architecture Center](https://www.palantir.com/docs/foundry/architecture-center/overview) 與 [AI FDE 官方文件](https://www.palantir.com/docs/foundry/ai-fde/overview) 交叉核對。原始貼文把架構中心分成七個方向；本文只保留能幫助工程團隊判斷邊界的部分，不把行銷用語當成普遍保證。

## 先看全局：三個平台，不是一個模型

Palantir 的標準架構由三個互相整合的平台組成：

| 平台    | 主要責任                         | 對 Agent 的意義                |
| ------- | -------------------------------- | ------------------------------ |
| Foundry | 資料作業、Ontology、分析與工作流 | 提供可讀取與可操作的企業語境   |
| AIP     | 生成式 AI、Agent 與 evals        | 讓模型在受控範圍內使用企業語境 |
| Apollo  | 基礎設施與持續交付               | 讓服務、版本與部署保持一致     |

[官方平台說明](https://www.palantir.com/docs/foundry/architecture-center/platforms) 將這三者描述成 Enterprise Operating System。這個比喻的重點不在「什麼都能做」，而在資料、邏輯、工作流、治理與部署共用同一套變更與權限邊界。

## Ontology 是真正的接合層

企業資料通常散落在 ERP、CRM、MES、文件與事件串流。只把這些資料餵給模型，模型仍不知道哪些欄位代表同一個業務對象，也不知道哪些動作可以合法執行。

Ontology 將世界拆成兩種基本元素：

- **nouns**：工廠、訂單、客戶、設備等可識別的物件；
- **verbs**：更新訂單、改變配送策略、啟動模擬等會改變狀態的動作。

每個物件與動作都能掛上資料來源、商業規則、模型、工作流與安全政策。於是 Agent 的輸出不必停在一段建議，而可以變成「對哪個物件執行哪個動作」，再由平台檢查權限與條件。

這也是為什麼「接上 LLM」不是 AI FDE 的完整解法：沒有語義層，Agent 只能在文字與資料列之間猜測；沒有動作層，回答即使正確也無法完成工作。

## AI FDE 的最小執行迴路

[AI FDE 文件](https://www.palantir.com/docs/foundry/ai-fde/overview) 將一次請求分成三步：分析意圖與上下文、選擇適當的 Foundry 操作、使用原生工具執行。把這條路徑落成工程檢查，可以寫成：

1. **界定意圖**：請求要改變哪個可觀察結果？需要哪些 Ontology 物件？
2. **選擇操作**：這是查詢、轉換、建立邏輯、修改 Ontology，還是觸發工作流？
3. **套用政策**：呼叫者、Agent 與目標物件是否都具備所需 scope？
4. **在分支執行**：需要修改 Ontology 時，先在可審查的 branch 產生變更。
5. **留下證據**：保存輸入、工具呼叫、測試與核准紀錄，而不是只保存最後一句回答。

這條迴路的價值在於把「模型覺得可以」拆成多個能被平台拒絕的步驟。模型可以提出計畫，但權限、分支保護與部署核准不應由模型自行宣告。

## 為什麼 FDE 仍然需要人

Palantir 將 Forward Deployed Engineering 描述成貼近現場、持續把回饋送回核心工程團隊的方法。AI FDE 延伸了這個方向，卻沒有消除領域判斷：

- Ontology 的物件與關係仍要由熟悉業務的人確認；
- 高風險動作需要明確的目的、授權與回滾策略；
- evals 只能衡量已定義的案例，不能替團隊決定哪些風險可接受；
- 「能在平台執行」不等於「應該在 production 執行」。

因此，導入 AI FDE 的第一個切片應是低風險、可驗證的工作，例如檢查資料品質、產生轉換草稿或在 branch 建立小型 Ontology 變更。先讓每次執行都能回溯，再逐步增加可執行動作。

## 對一般團隊的可移植結論

不使用 Palantir，也能採用同一個邊界模型：

1. 為核心業務建立穩定的物件與動作語彙，而不是把表格名稱直接暴露給模型。
2. 將讀取、提案、寫入與部署分成不同工具與權限。
3. 讓變更先落在 branch、staging 或 dry-run，再由人核准進入正式環境。
4. 對每次 Agent 執行保留來源、工具、結果與拒絕原因，讓失敗能轉成下一輪測試。

Palantir 的護城河不是某個單獨的模型，而是把資料、語義、動作、治理與交付放進同一個可操作邊界。AI FDE 值得學的，也正是這個邊界；不是把聊天視窗換成更大的按鈕。
