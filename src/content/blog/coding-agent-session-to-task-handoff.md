---
title: "Coding Agent 要跨 Session 接手，得先保存任務狀態"
description: "綜合 Josh Rosen 對 coding-agent 架構的六項觀察，拆解編排、隔離、外部狀態、目標迴圈與 issue／PR 入口如何改變工作交接，並提供一份可驗收的任務紀錄草圖。"
publishDate: 2026-09-27T14:26:09+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
cover: ../../assets/covers/coding-agent-session-to-task-handoff.png
coverAlt: "中央紙本任務卷宗以細線連到三份分開的工作資料，淡去的對話紙帶沿著畫面右側離開，呈現任務狀態跨執行交接。"
series: AI Agent 工程化與工作流實戰
seriesOrder: 30
---

如果換一個 Coding Agent 或開一個新 Session，就得重新翻聊天紀錄才能知道做了什麼、哪個檢查通過、下一步要交給誰，問題通常不是模型看得不夠多，而是工作只存在執行它的對話裡。

Josh Rosen 在 2026-09-26 發表的 [〈Agentic Coding: Emerging Architectures and the End of the Single-Agent Session〉](https://x.com/i/article/2103544001555013632)列出六種變化：主要 Agent 逐漸負責編排；工作者變得短命且彼此隔離；工作狀態移出 Session；Agent loop 開始提供可程式化的 hooks；工作可依目標持續迭代；聊天視窗不再是唯一入口。[原始 X 貼文](https://x.com/JoshARosen/status/2103831614975246645)連回同一篇文章。

這六項是對公開產品功能的觀察，不是各種團隊已普遍採用的實證。我把它們視為三條架構邊界正在外移：誰負責派工、什麼狀態能跨越執行者、以及人在哪裡監督交付。**模型仍在 Session 中推理；需要離開 Session 的，是工作契約、可恢復進度和驗收依據。**

## 編排者把工作切開，Session 不必陪任務活到最後

第一、第二項變化其實是一組：主要 Agent 轉為協調者，子 Agent 則承接有清楚輸入與輸出的子工作。執行者可以結束，工作仍由外層控制流程繼續推進。

[OpenAI 的 Multi-agent 文件](https://developers.openai.com/api/docs/guides/agents-api/multi-agent)把這個責任分成三步：子 Agent 各自使用獨立 context 並行處理，主要 Agent 負責協調與合併結果。文件也提醒，短工作、相依步驟，以及會共同編輯同一份狀態的任務，通常應留在主要 Agent 裡或先做好協調。

這給出比「多開幾個 Agent」更有用的切分條件：

**只有當子工作能獨立描述、獨立驗收，且不會爭用同一份可變狀態時，才值得並行。**

否則多一個工作者只會多一條需要整合與判斷的結果。

隔離環境能減少互相覆寫，卻不會自動決定誰擁有任務、哪個結果應被採納或什麼條件代表完成。[多 Agent 工作台的注意力、隔離與權限](/blog/multi-agent-workstation-control-plane/)談的是操作與執行邊界；這篇文章往外看一層：任務怎麼在不同工作者與執行環境之間持續存在。

## 進度不能只留在模型看過的 Context

第三項變化是讓計畫、決定、知識與目前進度由外部狀態承載，下一個工作者只讀取完成當前步驟所需的部分。整段逐字稿不是必要的交接格式。

[GitHub Copilot Memory 文件](https://docs.github.com/en/copilot/concepts/agents/copilot-memory)提供一個具體例子：它能保存附有程式碼來源的 repository facts，並讓不同 Copilot 功能重用這些事實。文件截至 2026-09-27 仍將該功能標示為 public preview。這類記憶可以避免重複發現程式庫慣例，但它不是某一張工作單的進度帳本。

這個差別很重要。

**可重用知識回答「之後可能還有用的事實是什麼」；任務狀態回答「目前完成到哪裡，下一個可驗證的動作是什麼」。**

把兩者混成一份模糊摘要，會讓舊結論看起來像目前狀態，也會讓下一個執行者不知道誰能改動什麼。

[Codex Goals 的設計](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex)也呈現一個重要邊界：Goal 能把目標、完成條件與證據檢查保留在多輪工作中，但狀態仍綁定目前的 thread，並不是全域記憶或專案共用工作單。這表示 Session 仍可作為一段執行的容器；架構要補上的，是跨執行時能明確恢復工作的紀錄。

因此，長任務不應靠延長 Context 或要求新 Session「讀懂之前的全部內容」續命。可以接著看 [長任務如何用驗收證據接力](/blog/argus-persistent-reviewed-agent-runtime/)，其中拆解了 checkpoints、reviewer 與人類決策的分工。

## Hooks、目標與 PR 讓監督跟著工作走

第四、第五項變化把控制放到 Agent loop 的特定事件與可檢查的目標。以 [GitHub Copilot hooks](https://docs.github.com/en/copilot/concepts/agents/hooks)為例，程式可在 `preToolUse`、`postToolUse` 或 `subagentStop` 等事件執行，於工具使用前後加入驗證、核准或紀錄。這些動作不必只仰賴模型記得提示詞裡的要求。

Codex 的 [Goals 使用指南](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex)則展示另一種控制方式：定義預期結果、驗證面與限制後，工作可依新證據繼續或停止。Goal 不等於放開無限自主；完成狀態應由可檢查的輸出判定，達到預算、遇到阻礙或需要人類決策時也要停下來。

第六項變化是人不一定從聊天視窗啟動或追蹤工作。[GitHub 的第三方 Coding Agent 文件](https://docs.github.com/en/copilot/concepts/agents/about-third-party-coding-agents)描述從 issue 指派或在 PR 留言開始工作，Agent 完成後提出 PR 並等待 review；文件目前將第三方 Coding Agent 標示為 public preview。介面移到 issue 或 PR 之後，交付物、修改範圍與審查留言自然比完整的子 Agent 對話更適合作為人的工作入口。

聊天沒有消失，而是從唯一容器變成其中一個操作介面。這和 [Plan Mode 中把計畫當成可修正工作假設](/blog/plan-mode-planning-execution-loop/)相連：人不必決定每一步，但必須看得到目標是否仍成立、哪些證據已經到手，以及哪個決策仍需要自己做。

## 一份交接紀錄要回答五個問題

不是每個 Agent 都需要新的任務資料庫。短而單純的工作，用一段對話和一個 diff 足以交付；當工作需要跨 Session、工作者或審查者接力，至少要能從對話外回答五件事：

- **目標與範圍**：要改變什麼、哪些資源可以動？
- **目前狀態**：最後一個已確認的 checkpoint 是什麼？
- **產物與證據**：程式差異在哪裡，哪些命令或人工檢查已完成？
- **待決事項**：還有哪些選擇不能由目前的 Agent 擅自做？
- **下一位責任人與停止條件**：接手者是誰，遇到什麼情況必須交還人類？

以下是我建議的紀錄草圖，不是任何供應商的格式或 API：

```yaml
work_id: profile-pagination
goal: 新增 cursor pagination，保留既有回應預設值
allowed_scope:
  - src/api/profiles/**
  - tests/api/profiles/**
state: needs-review
artifact: branch 或 pull request
evidence:
  - check: 執行過的命令
    result: 結果摘要與可回查位置
open_decision: 是否需要公布新的 API 相容性政策
next_owner: 維護者
stop_when:
  - 必須修改公開回應契約
```

這份紀錄刻意不保存模型完整的推理過程。它保存的是別人接手或稽核時需要的系統狀態：產物、驗證、責任歸屬，以及尚未授權模型替人決定的事情。更完整的 [Harness 控制面](/blog/harness-engineering-for-reliable-agents/)仍負責工具、權限、觀測與復原；這裡只把工作從某一次執行的脈絡中抽離。

## 先測交接，再增加工作者

平行數量不會自動帶來吞吐量。工作切得太細，整合與審查成本會上升；狀態沒有唯一寫入者，兩位 Agent 可能各自基於不同事實繼續；Goal 沒有停止條件，則可能只是把人工催促換成自動重試。

先挑一項確實需要跨 Session 或跨人接手的工作，寫下目標、範圍、checkpoint、驗收證據與停止條件。接著讓一個新的執行者只看這些產物，回答目前狀態、下一步與完成標準。如果它還需要翻完舊對話才能回答，先補足交接資料；若它能從工作紀錄繼續，才比較值得把相同模式擴大到多個工作者。

若你正在設計並行 Agent 的工作單，接著讀[如何先把工作變成可驗收結果](/blog/agent-work-requires-verifiable-codebase/)。它處理的是單條工作線能否被獨立檢查；本文補上的是多條工作線如何共享目標、狀態與接手入口。
