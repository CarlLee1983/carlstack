---
name: dbcli
description: "提供 coding agents 使用的權限控管資料庫 CLI，支援 PostgreSQL、MySQL、MariaDB、MongoDB、Redis 與 Elasticsearch。"
repositoryUrl: https://github.com/CarlLee1983/dbcli
homepageUrl: https://carllee1983.github.io/dbcli/dbcli-intro.html
status: 開源
featured: true
cover: ../../assets/projects/dbcli.webp
coverAlt: "銅版蝕刻風格的地下資料檔案庫，中央機械鑰匙孔與多層權限環守住多座資料儲存槽"
tags:
  - AI Agent Workflow
  - Database
  - CLI
---

讓 coding agent 透過同一套 CLI 探索、查詢及操作資料庫，適合需要由操作者設定連線與存取權限的工作流。支援 PostgreSQL、MySQL、MariaDB、MongoDB、Redis 與 Elasticsearch；各引擎可用的命令不同，使用前先看[功能對照](https://github.com/CarlLee1983/dbcli/blob/main/docs/feature-matrix.md)。

在已設定、僅授權讀取的**合成測試資料庫**中，可先確認資料表與欄位，再決定是否讓 Agent 查詢。以下的 `sample_orders` 是示例表，只有刻意建立的測試資料：

```bash
dbcli list
dbcli schema sample_orders --format json
dbcli query "SELECT id, status FROM sample_orders LIMIT 3" --format json
```

dbcli 在 CLI 邊界提供權限控制與敏感資料保護；唯讀權限本身不會阻止敏感欄位出現在查詢結果。接入真實資料前，仍須核對連線權限、可輸出欄位與遮罩規則。如何檢查授權路徑、遮罩與拒絕紀錄，見[既有實測案例](/blog/agent-database-authorization-boundary/)；安裝與初始設定從[專案文件](https://github.com/CarlLee1983/dbcli#quick-start)開始。
