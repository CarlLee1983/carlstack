---
name: ForgePilot
description: "AI 輔助軟體工程的控制平面，管理持久工作佇列、綁定確切 revision 的驗證證據與人工決策閘門。"
repositoryUrl: https://github.com/CarlLee1983/ForgePilot
status: 開源
featured: false
cover: ../../assets/projects/forgepilot.webp
coverAlt: "紫金空中航路控制盤把發光工作令牌導向人工操作的決策閘門，沿途留下固定在航點上的驗證晶體"
tags:
  - AI Agent Workflow
  - Developer Tools
  - CLI
---

以本機 CLI 管理 Goal、Work Item、依賴、Gate 與 Human Review，並在隔離 worktree 對確切 revision 或 immutable snapshot 執行儲存庫自己的 `make verify`。驗證結果寫成可追溯 Evidence，由 `next` 與受界限的 Runner 提供下一個合法動作；工作是否完成，仍由確定性驗證與人工審查共同決定。
