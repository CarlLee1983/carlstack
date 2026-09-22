---
name: AgentPort
description: "將主機上的 Claude Code 與 Codex 封裝為受控 Logical Agent 的遠端 MCP 派工閘門，具備目錄綁定、狀態持久化與非同步追蹤能力。"
repositoryUrl: https://github.com/CarlLee1983/AgentPort
status: 開源
featured: true
cover: ../../assets/projects/agentport.webp
coverAlt: "復古牌卡風格的拱門機械閘門，中央懸浮著發光琥珀色傳送通道，由黃銅齒輪、精密儀表與鎖定插銷嚴密守護"
tags:
  - AI Agent Workflow
  - Developer Tools
  - MCP
  - CLI
startedAt: 2026-09-15
---

將目標主機上的 AI Coding Runtime（如 Claude Code 與 Codex）以 Logical Agent 身分提供遠端工作執行能力。主機管理者在設定檔中將 Agent 明確綁定至特定工作目錄（Workspace）與執行策略，遠端交辦方（Caller）僅能在授權範圍內提交與追蹤工作，無法隨意指定任意主機路徑或註冊未授權 Agent。支援持久化狀態存取、Long-poll 等待與非同步任務取消。
