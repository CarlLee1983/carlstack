---
name: Warrant
description: "以人類核准的 Story 限定 AI Agent 工作範圍，用儲存庫自己的驗證與逐條驗收證據交付結果的開發規則。"
repositoryUrl: https://github.com/CarlLee1983/Warrant
status: 開源
featured: true
cover: ../../assets/projects/warrant.webp
coverAlt: "深藍工坊中，藍圖卷軸穿過青色驗證門並化為通過檢查的發光成品"
tags:
  - AI Agent Workflow
  - Claude Code
  - Developer Tools
startedAt: 2026-09-29
---

Warrant 接替已退場的 PraxisBound，提供一份 Claude Code skill、一段可供其他 Agent 採用的 `AGENTS.md` 規則，以及一份 Story 範本。

工作從人類核准的 Story 開始。每份 Story 是 `specs/stories/` 下的一份 Markdown 檔，寫清楚目標、範圍外事項與驗收條件。Agent 依儲存庫在 `AGENTS.md` 指定的唯一驗證命令執行檢查，並為每條驗收條件留下實際觀察的證據；任何一條缺少通過證據，就只能回報部分完成。

Agent 不得改需求、放寬驗收標準或擴大範圍，遇到範圍外的工作就停下回報。Warrant 提供規則與範本，執行約束由採用端的 CI 與人工審查落實。
