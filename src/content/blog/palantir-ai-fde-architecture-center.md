---
title: "Palantir AI FDE 如何在既有權限下操作資料與工作流"
description: "以 Palantir Architecture Center 與 AI FDE 文件為例，拆解 Ontology、AIP、Foundry、Apollo 如何把資料、邏輯、動作與治理接到可執行的企業流程。"
updatedDate: 2026-11-06T00:02:10Z
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

Palantir AI FDE 可以把自然語言請求轉成 Foundry 的資料處理、程式與 Ontology 操作。對採用團隊而言，第一個問題是它將以誰的身分操作、能改哪些資源，以及哪一步需要核准。

這篇保留 [@oops073111 的系列導讀](https://x.com/oops073111/status/2095341660385509463)作為來源線索。2026 年 11 月 5 日查核時無法讀取 X 全文，因此不沿用「原文分成七個方向」的說法。以下依 [Palantir Architecture Center](https://www.palantir.com/docs/foundry/architecture-center/overview)與 [AI FDE 文件](https://www.palantir.com/docs/foundry/ai-fde/overview)整理當時的產品描述。沒有登入客戶 enrollment 或執行產品測試，後面的試用清單是工程建議。

## Foundry、AIP 與 Apollo 分別承擔什麼

[官方平台說明](https://www.palantir.com/docs/foundry/architecture-center/platforms)將標準架構描述為三個整合平台：

- Foundry：提供資料管理、邏輯、Ontology、分析與工作流能力。
- AIP：提供模型連接、Agent 與自動化工具，以及評估功能。
- Apollo：管理承載服務的基礎設施與持續交付。

「Enterprise Operating System」是 Palantir 對這套整合架構的定位。它不代表採用後所有系統就有相同權限，或所有部署都會自動成功。實際評估時，要列出資料來源、執行環境、身分、核准政策與交付流程，逐項對照產品配置。

對一般工程團隊，可借用的做法是把資料、動作與變更流程放進同一份設計審查。選型比較仍要納入連接既有系統的工作量、授權管理、成本、維護人力與退出方式，不能用這個架構比喻替代實測。

## Ontology 要定義物件、關係與可執行動作

ERP、CRM、MES 裡的欄位名稱不一定能直接告訴 Agent 哪幾筆紀錄指向同一個訂單。團隊仍要處理識別、資料品質、時效與業務語義。

[Ontology 系統文件](https://www.palantir.com/docs/foundry/architecture-center/ontology-system)用 nouns 與 verbs 說明物件和動作，並把資料、邏輯、動作、安全整合起來。這是易懂的介紹，不是說完整模型只有兩種元素；物件屬性、連結、函式和動作規則都會影響執行結果。

以調整訂單配送方式為例，工程設計至少要回答：

- 哪個訂單識別碼能對到權威紀錄？讀到的版本與時間是否仍適合操作？
- 允許調整的是哪個欄位？哪些訂單狀態會拒絕變更？
- 呼叫者是否有權限？是否還需要業務核准？
- 操作會不會呼叫外部物流系統？逾時後要去哪裡查結果？

這些問題是我建議的動作契約。Ontology 可以承載這些概念，資料對應與業務規則仍需由團隊建立、測試和維護。缺少明確語義時也可以採用其他介面或領域模型，不能推論所有 Agent 都必須使用 Palantir Ontology。

## AI FDE 沿用使用者身分，工具選擇另有邊界

[AI FDE 安全文件](https://www.palantir.com/docs/foundry/ai-fde/security-and-governance/)說明，它使用目前已驗證的 Foundry session，並非另一個擁有額外權限的 service account。伺服器端依使用者權限檢查操作，稽核紀錄也歸屬該使用者。

採用時應實際查使用者權限、目標資源政策與工具核准範圍，不能假設另有獨立的 Agent 身分承擔這些限制。

工具核准也不等於所有動作每次都會彈出同樣的確認。查核時文件區分了逐次確認、依分支條件核准與唯讀自動核准，也允許限定範圍的 session 預先核准。檔案編輯和 dataset build 在 feature branch 與 protected branch 的處理不同。操作前須確認當次設定，不能只看模型說「會先問」。

[Modes and capabilities 文件](https://www.palantir.com/docs/foundry/ai-fde/modes-and-capabilities)另指出，啟用 Manage capabilities 時，Agent 可以在工作中調整載入的能力。挑選模式有助於減少不相關工具與文件，但不能把它直接當成不可變的安全 allowlist。真正需要禁止的操作，還要有平台權限與核准政策限制。

## 分支、工具核准與部署是三件事

AI FDE overview 將請求描述為分析意圖、選擇操作、執行工具，最後回傳說明與文件。文件也說明預設透過分支工作，產出 Global Branch proposal 或 Code Repository PR 供審查。

但 [Global Branching 文件](https://www.palantir.com/docs/foundry/global-branching/overview)明確區分分支開發與跨環境 release management。分支支援哪些資源、如何測試，以及合併需要誰批准，應看具體資源的整合與政策。合併分支不等於已把正確版本部署到正式環境。

我會把試用工作拆成以下四個驗收點：

1. 輸入與意圖：確認來源版本、目標資源、要產生的變更，以及不在範圍內的動作。
2. 提案與測試：在適用的分支或隔離環境產生差異，跑 preview、測試或 eval，記錄失敗案例。
3. 核准與套用：核對實際身分、資源、操作與核准範圍，再執行該次變更。
4. 結果與復原：從權威來源讀回結果，確認版本與副作用，保留還原或補償方式。

**分支名稱不能替外部副作用背書。** 呼叫物流、寄信或其他外部系統前，要確認這個工具是否真的隔離、模擬或需要另外核准。預覽與分支無法保證每種整合都可以撤銷。

## 第一個試用只改一條可驗證的轉換

AI FDE 可以協助執行工具，領域負責人仍要決定規則的意義。例如「本週訂單」按下單時間還是出貨時間計算，不能讓模型以看似合理的預設代替業務決定。Evals 也只能檢查事先定義的案例，案例全部通過不代表未知風險消失。

以下是我建議的試用紀錄格式，不是 Palantir 可直接執行的設定：

```yaml
goal: 修正測試資料中一個已確認的日期轉換錯誤
identity: 記錄實際使用者與可修改的資源範圍
inputs: 固定版本的合成資料與已確認的日期規則
change_target: 一個 feature branch 上的指定轉換
acceptance:
  - 原有錯誤案例在修正前失敗、修正後通過
  - 空值、時區交界與既有正常案例符合預期
  - 檢視差異，確認未修改其他資源
  - 記錄 preview 或測試結果與來源版本
stop_when:
  - 操作要求擴大權限或觸及正式資料
  - 發現會呼叫未核准的外部系統
  - 上次寫入結果不明，尚未讀回確認
release: 另依環境發布政策核准與驗收
```

工具回傳逾時時，先查是否已產生結果，避免重做已完成的寫入。保留工具執行與平台稽核證據，並核對輸出是否可供下一位接手者讀取。聊天摘要可以協助閱讀，但不能取代實際變更與測試紀錄。

這個小切片完成後，再比較節省了多少人工步驟、增加多少審查成本，以及哪些錯誤仍需人介入。接著擴充相同類型的任務，或因結果不理想縮小範圍。下一個決定應來自這份試用紀錄，而非「企業作業系統」的名稱。
