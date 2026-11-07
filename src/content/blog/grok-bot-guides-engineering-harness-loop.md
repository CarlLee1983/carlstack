---
title: "Grok Bot Guides 工程篇：多 Agent 分工、行動遊戲開發與設計協作"
description: "查核 Grok Bot 工程、Rank’em 行動遊戲與設計案例，區分作者自述與平台規格，並把分工轉成可檢查的版本證據、權限與驗收條件。"
updatedDate: 2026-11-06T00:44:35Z
publishDate: 2026-10-08T17:35:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
series: AI Agent 工程化與工作流實戰
seriesOrder: 73
cover: ../../assets/covers/grok-bot-guides-engineering-harness-loop.png
coverAlt: "翠綠色矩陣面板展現中央調度總台向外連接多條獨立沙盒工作流與自動化測試驗收迴路。"
---

Lingxi Li 在 2026 年 9 月 10 日的工程指南中，自述用五個工程 Bot 管理同時執行的 200 多個 cloud agents。這個數字很容易被當成擴充能力的保證。對準備採用的人，更有用的問題是每件工作的負責人、執行環境與驗收證據能否對得起來。

查核基準是 2026 年 11 月 6 日可讀取的 [Grok Bot Guides](https://x.ai/bot/guides) 與各篇指南。這些是刊登在產品網站的具名使用經驗，數量與成果沿用作者自述，沒有獨立重測，也沒有提供可鎖定的產品版本號。以下把案例事實與 CarlStack 建議分開，後者可用來設計試行流程，不能視為 Grok Bot 已實作的安全機制。

## 五個工程 Bot 的分工有來源，產能倍數沒有共同量尺

在 [Lingxi Li 的〈Grok Bot for Engineering〉](https://x.ai/bot/guides/grok-bot-for-engineering)（2026-09-10）中，五個工程 Bot 各有負責範圍。Baltata 負責行動共用層與 iOS，Shaoruru 負責桌面端與 CI/CD，Hogan 負責基礎設施及歸屬不明的問題，Craig 負責 Android，Quill 負責 harness。

作者說自己先前能同時手動管理 15 個 cloud agents，現在由這組 Bot 管理超過 200 個。15 是她的經驗值，200 多個是當時的執行規模。兩者都沒有附上共同的任務難度、成功率或人工作業時間，不能直接換算成生產力提升倍數。

來源也描述了她的 Notion PR 清單，每 30 分鐘檢查問題，處理中標為 `Working`，符合條件後進入 `Ready for Review` 並啟動審查。她允許高信心、影響範圍小的 PR 自動合併，其餘自己判斷。這是她配置的流程，採用者需要自行決定合併權限。

### 用交付物決定分工

CarlStack 建議從一個工作範圍清楚的 Bot 開始。以「修正登入畫面的錯誤提示」為例，負責人要能查到畫面元件、錯誤格式與相關測試，也要交回可重現的操作步驟。只有當另一批工作需要不同的權限、資料或驗收人時，才值得拆出第二個角色。

角色說明可固定記錄四項內容：

- 負責範圍：哪個 repository、模組或問題類型，以及跨區修改時由誰接手。
- 執行環境：使用哪個分支、工具鏈與測試資料，缺少依賴時向誰提出需求。
- 交付物：變更摘要、commit、測試結果，以及需要視覺檢查時的前後對照。
- 停止條件：權限不足、規格互相衝突，或同一失敗在已知修復後再次出現時，留下證據並請負責人決定。

增加 Bot 之前，先檢查待審工作是否累積。若實作已完成卻長期等人確認，擴大派工只會讓同一位驗收者面前多出一排 PR。試行時應記錄每件工作從派工到驗收的時間、退回原因與人工介入次數，依瓶頸調整並行量。

## Rank’em 的六個角色，包含明確的支出限制

[Ryan Perry 的〈Grok Bot for mobile app development〉](https://x.ai/bot/guides/grok-bot-for-mobile-app-development)（2026-08-25）描述六個 Bot 經營 Rank’em，並自述遊戲在前一週於 iOS、Android 合計超過 1,000 次下載。「遊戲本身約占 15%，其餘工作占 85%」是作者估計，沒有工時樣本可用來推算所有行動開發專案。

案例的角色是 Mobile Orchestrator、Analytics Agent、Creatives Agent、Rank’em Engineer、GCS agent 與 Bug fix Agent，分別涵蓋協調與商店、分析、廣告素材、程式、部署、錯誤修復。原文只允許 Analytics Agent 宣告分析發現，並要求花錢前先詢問作者。這些責任限制比角色數目更適合拿來檢查自己的流程。

### 把分析、修改與發布拆成可追蹤的交接

下面是假設的遊戲維運流程，與 Ryan 的實際成效分開看待。分析工作交回「某一版本的新玩家在哪一步離開」，至少要寫出觀察期間、事件定義、樣本數與查詢條件。若資料缺漏，就交回缺漏的位置，避免讓實作端把猜測當成已證實的原因。

程式負責人接到分析後，提出可測的修改。例如調整提示文字時，驗收可以包含新舊文字、顯示條件與錯誤流程。這只能證明功能符合規格。若還要判斷留存是否改善，需要另外定義比較群組與觀察期間，不能拿通過 CI 的紀錄替代產品實驗。

發布與廣告支出各有自己的放行人。素材完成不等於廣告活動可以啟用，測試通過也不等於商店版本已上線。任務卡應分別保存素材版本、發布版本、投放對象與已核准的預算。遇到預算增加、權限擴大或發布目的地變動，回到對應的決策者，不把先前的同意延伸到新範圍。

## 設計案例的重點是可比對的真實資產

[John Bai 的〈Designing Grok Bot with Grok Bot〉](https://x.ai/bot/guides/designing-grok-bot-with-grok-bot)（2026-08-24）寫到，Motion God 以產品實際使用的動畫規格檔建立 localhost 試作環境，讓他調整動態。另一個例子是 Figma Bro 透過 Figma MCP 讀取元件的精確屬性，完成重複排版。這些例子支持「使用既有資產反覆調整」，沒有提供每次固定產出 10 到 20 個設計版本的規格。

對應的驗收應保留資產識別與版本。設計師看過的動畫，必須能回到同一份規格檔、相同的字型與圖片，否則實作端可能只複製一張外觀接近的截圖。若改到共用元件，檢查範圍也要包含其他使用它的畫面。

「感覺自然」可以保留為設計判斷，同時補上可以重現的操作條件，例如進入畫面的方式、觸發動作與預期結束狀態。視覺審查通過後，仍應分別檢查鍵盤操作、文字溢位與窄螢幕呈現。這些是採用流程的建議，沒有把設計師的個人偏好變成產品的自動驗收能力。

## 憑證與操作權限要獨立管理

專職角色可以縮小上下文，卻不會自動縮小已登入帳號的權限。程式碼讀取、建立分支、合併、部署與修改正式資料，應各自對應可用的服務權限。測試環境能重現問題，就不必先把正式環境的憑證交出去。

CarlStack 建議在開始工作前記錄帳號擁有人、授權的資源與動作、有效期間及撤銷方式。密碼、token 與簽署金鑰留在合適的憑證管理工具，不放進任務描述、提示詞或驗收截圖。任務交接只傳遞憑證的引用及所需權限，接手者仍須使用自己的有效授權。

**缺少權限時停止該動作，不能藉由換帳號或換工具繞過限制。** 可以繼續整理錯誤訊息、準備修正或補測試，但應把待批准的動作與目的地寫清楚，讓負責人能做出一個具體決定。

## 用小模型檢查驗收紀錄是否完整

下面是可在 Node.js 執行的假設模型，只檢查記錄是否一致。它不呼叫 Grok Bot，也不執行合併或部署。`policy` 代表由團隊負責人維護的必測項目與驗收人，`task` 代表這次交付物。`policy.revision` 識別必測清單與驗收人的版本，核准紀錄必須明確表示同意。正式系統仍需由受信任的服務供應政策與紀錄，驗證簽核者身分、權限與檔案雜湊，並在實際使用結果時重查版本。

```js
function acceptance(task, policy) {
  const text = (value) => typeof value === "string" && value.trim() !== "";
  if (
    !task ||
    !policy ||
    ![
      task.id,
      task.owner,
      task.revision,
      policy.approver,
      policy.revision,
    ].every(text) ||
    !Array.isArray(policy.requiredChecks) ||
    policy.requiredChecks.length === 0 ||
    !policy.requiredChecks.every(text)
  )
    return "blocked";
  if (task.blocked === true) return "blocked";

  const checks = task.checks;
  if (
    !Array.isArray(checks) ||
    checks.some(
      (check) =>
        !check ||
        !text(check.name) ||
        check.revision !== task.revision ||
        check.result !== "pass",
    ) ||
    new Set(checks.map((check) => check.name)).size !== checks.length ||
    !policy.requiredChecks.every((name) =>
      checks.some((check) => check.name === name),
    )
  )
    return "needs-evidence";

  const approval = task.approval;
  if (
    !approval ||
    approval.taskId !== task.id ||
    approval.revision !== task.revision ||
    approval.policyRevision !== policy.revision ||
    approval.decision !== "approve" ||
    approval.by !== policy.approver
  )
    return "needs-approval";
  return "accepted";
}

const policy = {
  approver: "release-owner",
  revision: "demo-policy-1",
  requiredChecks: ["unit", "ui"],
};
const task = {
  id: "login-copy",
  owner: "client-engineer",
  revision: "demo-revision-2",
  checks: [
    { name: "unit", revision: "demo-revision-2", result: "pass" },
    { name: "ui", revision: "demo-revision-2", result: "pass" },
  ],
};
console.log(acceptance(task, policy)); // needs-approval
```

這個模型刻意把 `accepted` 限定為交付物通過驗收。發布仍是一件獨立工作。修改交付 revision 後，舊的測試與同意紀錄都不能沿用。必測項目、驗收人或驗收規則改變時，要更新政策 revision 並重新核准。必測清單也由 `policy` 提供，避免執行者刪掉失敗項目就宣告完成。

本次對這段純函式檢查了缺少必測項目、舊版證據、失敗或重複檢查、錯誤任務、驗收人、政策版本，以及拒絕或未決核准等情境。這些檢查只能證明範例按所列規則運作，沒有測量 Grok Bot 的成功率或並行能力。

開始試行時，挑一件能在測試環境結束的真實任務，寫下負責人、必測項目與驗收人。只有在每份結果都能對回同一版本，且交接不再依賴猜測後，再增加同時執行的工作數。
