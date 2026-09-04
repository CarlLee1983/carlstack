# 本機 AI Agent 執行邊界：研究紀錄

日期：2026-09-04（Asia/Taipei）

## 研究問題

本文檢查「本機 AI Agent」在這套實際開發環境裡代表什麼。重點不是證明模型完全離線，而是確認資料選取、工具執行、權限與驗收分別由哪一層控制。

研究過程只讀取聚合欄位與工具名稱，沒有擷取對話內容、工作目錄、工具參數、工具結果、token、session title 或專案機密。`<CODEX_HOME>` 是匿名佔位符。

## 環境快照

- 裝置：MacBook Air、Apple M4、10 核心、16 GB 記憶體。
- Ollama client：`0.32.0`。
- `ollama list` 無法連接執行中的 Ollama instance，因此沒有證據可宣稱這批紀錄使用本機模型推論。
- Session index：249 筆，更新時間從 `2026-03-18T03:37:02.372742Z` 到 `2026-09-04T15:17:21.449185Z`。
- Thread history 快照：約從 2026-08-07 23:39 到 2026-09-04 23:19（UTC+8）。

## 聚合結果

`thread_turns` 共 3,615 個 turns、1,447 個 threads：

| status        | turns |
| ------------- | ----: |
| `completed`   | 3,489 |
| `interrupted` |   106 |
| `failed`      |    14 |
| `inProgress`  |     6 |

主要 item type：

| item type             |  items |
| --------------------- | -----: |
| `commandExecution`    | 32,856 |
| `mcpToolCall`         |  3,269 |
| `subAgentActivity`    |  3,196 |
| `collabAgentToolCall` |  2,752 |
| `webSearch`           |    868 |

以上是不同層級的計數，不能相加成任務數，也不能推導成功率、token 成本或生產力。`completed` 只代表 turn 的執行狀態，不代表功能已通過測試、review 或部署。

## 重現方式

### Thread 與 item 統計

資料庫：`<CODEX_HOME>/thread_history_1.sqlite`

相關欄位：

- `thread_turns(thread_id, turn_id, status, started_at, completed_at, duration_ms)`
- `thread_items(thread_id, turn_id, item_type, item_json, created_at_ms)`

```sql
SELECT count(*) AS turns,
       count(DISTINCT thread_id) AS threads,
       min(started_at) AS first_started,
       max(completed_at) AS last_completed
FROM thread_turns;

SELECT status, count(*) AS n
FROM thread_turns
GROUP BY status
ORDER BY count(*) DESC;

SELECT item_type, count(*) AS n
FROM thread_items
GROUP BY item_type
ORDER BY count(*) DESC;

SELECT coalesce(json_extract(item_json, '$.server'), '<none>') AS server,
       coalesce(json_extract(item_json, '$.tool'), '<none>') AS tool,
       count(*) AS n
FROM thread_items
WHERE item_type = 'mcpToolCall'
GROUP BY server, tool
ORDER BY n DESC
LIMIT 30;
```

唯讀執行：

```sh
sqlite3 -readonly 'file:<CODEX_HOME>/thread_history_1.sqlite?immutable=1' '<SQL>'
```

### Session index

```sh
jq -s '{
  rows: length,
  with_id: (map(select(.id != null)) | length),
  first_updated: (map(.updated_at) | min),
  last_updated: (map(.updated_at) | max)
}' '<CODEX_HOME>/session_index.jsonl'
```

### 硬體與本機 runtime

```sh
system_profiler SPHardwareDataType |
  sed -E 's/(Serial Number|Hardware UUID|Provisioning UDID).*:.*//'

command -v ollama lmstudio llama-cli mlx_lm qwen 2>/dev/null || true
ollama --version 2>/dev/null
ollama list 2>/dev/null
```

## 外部資料與限制

[OpenAI 的 Codex 安全文件](https://learn.chatgpt.com/docs/agent-approvals-security)把 sandbox 與 approval policy 分成兩個控制面：前者限制 Agent 技術上能做什麼，後者決定何時必須詢問使用者。文件也說明 command network proxy 不涵蓋 web search、apps/connectors、MCP、browser/computer use 與 cloud tasks；這些路徑需要各自的控制。

本次沒有讀取工具參數或結果，因此無法從聚合統計判斷哪些資料曾離開本機、每個工具是否成功、人工接管比例或任務主題。文章中的結論只適用於「本機 harness 控制工作區與工具」這個範圍。
