---
title: "AI 協作不會自己複利：把每次交付變成下一次可驗證的輸入"
description: "把 AI 協作中的需求邊界、長期規則、驗證結果與重複失敗分開保存，建立能減少重複說明、也不會把舊錯誤自動放大的最小回饋迴圈。"
publishDate: 2026-09-07T18:15:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
series: AI Agent 工程化與工作流實戰
seriesOrder: 15
cover: ../../assets/covers/ai-workflow-compounding-evidence-loop.png
coverAlt: "黃銅機械織機把任務卡、規則書與驗證紀錄接成一條繞回機器的藍色編織線。"
---

AI 幫你完成一個任務，留下的是一次性的 output；能讓下一次工作變快的，是下一個人或 Agent 可以找到、判斷適用範圍並重新驗證的 input。兩者差很多。

[方格 Fango 的文章](https://x.com/zhrichard196220/status/2096486309020029034?s=12)用一次社群功能開發說明這件事：先討論需求，再把當前任務與長期工作約定分開記錄，交給 AI 實作、驗收，最後沉澱重複出現的經驗。我的主張更嚴格：**只有能連回觸發條件與驗證結果的沉澱，才配叫作 AI 工作流的複利。**

否則「記憶」只是把上一輪的猜測帶進下一輪。Agent 會更快，但不一定更對。

## 先分開四種東西，別把聊天紀錄當成 context

一個工作項目通常同時有目標、決策、規則與證據；把它們全塞進 prompt、issue 或一份很長的 instruction 檔，下一輪很難知道哪一段仍有效。最小切法如下：

| 類型     | 回答的問題                             | 放錯地方時的後果             |
| -------- | -------------------------------------- | ---------------------------- |
| 任務契約 | 這次要交付什麼、不做什麼、如何驗收？   | 舊任務的範圍污染新任務       |
| 長期規則 | 這個 repository 一般怎麼工作？         | 每次重複解釋，或規則互相矛盾 |
| 決策紀錄 | 為何選擇這條路、何時要重看？           | 後來的人只能從 diff 猜理由   |
| 驗證證據 | 哪個版本、用什麼步驟、實際結果是什麼？ | 「已完成」無法被重跑或推翻   |

GitHub Issues 適合承接第一類：它可以追蹤 feature、bug、想法與相依關係，也能連到 pull request；但它不是長期規則的唯一歸宿。[GitHub 的 Issues 文件](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues)也將 issue 定義為計畫、討論與追蹤工作的彈性單位。把跨任務仍成立的規則留在 repository 內可讀取的位置，讓 issue 只指向它，比每張 issue 複製一整份規範可靠。

## 每次交接只交付一張小型契約

不要要求 Agent 從一段對話中推導範圍。先把這次工作壓成可以被拒絕的內容；資訊不夠時，Agent 應提出問題，而不是補出一個看似合理的新功能。

```yaml
goal: 使用者可收藏作品；每週依收藏數產生排行榜
in_scope:
  - 收藏與取消收藏
  - 每週排行榜查詢
out_of_scope:
  - 獎勵發放
  - 搜尋與推薦
constraints:
  - 重複收藏不得重複計數
acceptance:
  - 同一使用者重送收藏請求後，計數仍為 1
  - 未登入請求被後端拒絕
evidence:
  - test: pnpm test
  - review: linked pull request
```

這不是把產品需求「格式化」就能解決的問題。它的價值在於讓範圍、限制與驗收各有明確 owner。AI 可以協助把一句需求拆開，但 product owner 必須確認 `out_of_scope`；開發者也不能把「跑過測試」擴張解讀為已經獲得業務決策。

## 規則要由重複失敗觸發，而不是先建知識庫

原文的 SEO 文案案例很實際：AI 把檔案大小與數量限制搬進產品介紹，於是團隊確認「先說工具能解決什麼，不把參數限制當賣點」，再把這條標準做成 Skill。這是好的沉澱時機，因為它同時有觸發案例、可重用的判斷與下一個讀取位置。

我會用一個更小的升級規則：

1. 第一次出錯，留在任務的回饋中修正。
2. 同型錯誤第二次出現，確認它是否跨任務、跨檔案仍成立。
3. 是的話，把「何時適用、要做什麼、怎麼確認」寫入最靠近執行點的規則或檢查。
4. 如果沒有可重跑的確認方式，只記錄為建議，不把它冒充成 gate。

這能避免另一種常見成本：每遇到一次問題，就新增一個巨大 Skill 或長篇 `AGENTS.md`。規則愈多，Agent 越難判斷優先序，維護者也越難刪掉過期內容。本站的[能力採用門檻](/blog/agent-skill-installation-contract/)同樣主張先證明痛點、限制邊界、留下證據；工作流規則也應遵守這個門檻。

## 把驗收的輸出也變成下一輪的輸入

完成程式碼不是工作流閉環。真正能累積的不是「AI 做得很快」這個感受，而是下一輪能拿來做選擇的資料：哪個需求類型容易偏離、哪個測試會抓到它、哪項人工 review 最常回退。

可以先記四個欄位，不必先上資料平台：

| 觀察       | 最小紀錄                           | 下一次用法                         |
| ---------- | ---------------------------------- | ---------------------------------- |
| 範圍偏離   | 漏掉或多做了哪一條 acceptance      | 補 task contract 或 `out_of_scope` |
| 規則找不到 | Agent 少讀了哪個已存在的入口       | 改閱讀順序或連結，而非複製規則     |
| 驗證缺口   | 哪個錯誤在 test 後才被 review 發現 | 新增最小回歸測試或 checklist       |
| 人工決策   | 哪個選擇不能由 Agent 猜            | 指定 owner 與停止條件              |

這些不是 KPI。不要以「新建了幾份文件」衡量複利；更直接的問題是：下一次同類任務是否少了一次重複說明，且沒有增加錯誤率？若答案是否定的，優先刪除或縮短沉澱物，而不是再加一層 memory。

## 記憶是建議，控制必須在模型之外

長期規則能提醒 Agent 先讀哪些檔案、如何命名、哪些檢查不能跳過；它不能取代 branch protection、測試、權限、sandbox 或人工核准。模型讀到「不要部署 production」是一項建議；系統真的不給未授權身分部署，才是控制。

因此每條規則都應標清身分：

```yaml
rule: 修改付款流程後執行整合測試
kind: guidance
verify: pnpm test:payments

rule: production 部署需人工核准
kind: enforced-control
verify: deployment approval log
```

若 `verify` 不存在，就不要讓下一輪 Agent 用肯定語氣說「已符合」。這個界線也與本站的[可靠 Agent Harness](/blog/harness-engineering-for-reliable-agents/)一致：context、state 與 memory 可以協助推理，但授權、可復原性與證據需要在模型之外建立邊界。

## 今天只留下一條可用的線

不必先建立「企業知識庫」。挑一個這週會重複的工作類型，在下一張 issue 補上 `out_of_scope` 與兩條 acceptance；完成後，記下第一個需要人工修正的地方。若它下一次又出現，再把它升級成 repository 規則或可重跑的檢查。

這樣留下的不是更多 context，而是一條從任務、決策、驗證回到下一個任務的線。AI 工作流的複利不在於它記得多少，而在於它是否讓同一個錯誤更難再發生。

## 來源

- [方格 Fango：如何構築你的 AI 複利工作流系統](https://x.com/zhrichard196220/status/2096486309020029034?s=12)（2026-09-06）
- [GitHub Docs：About issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues)
