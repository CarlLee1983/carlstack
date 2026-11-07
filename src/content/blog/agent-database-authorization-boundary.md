---
title: "AI Agent 存取資料庫：誰能定義授權規則，哪些執行路徑受到保護？"
description: "從 dbcli 的歷史修補與現行程式碼，區分 Agent host、CLI 閘門、資料庫權限與輸出遮罩，建立可驗證的唯讀及敏感資料邊界。"
publishDate: 2026-09-01T21:30:00+08:00
updatedDate: 2026-11-06T00:55:42Z
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
  - 資訊安全
repositoryUrl: https://github.com/CarlLee1983/dbcli
cover: ../../assets/covers/agent-database-authorization-boundary.png
coverAlt: "深色資料通路在淺色建築模型上通往煙燻玻璃邊界；只有兩條通過精密開口，其他路徑停在邊界前。"
---

給 Agent 資料庫存取權時，要分別確認 host 的工具規則、程式的操作檢查，以及資料庫帳號的 grants。CLI 印出 `query-only`，不會自動改掉資料庫授權。

我維護的 [dbcli](https://github.com/CarlLee1983/dbcli) 曾在不同入口漏接權限檢查。修補紀錄可以用來逐項確認控制在哪裡執行、什麼情況下會失效。

> [!NOTE]
> 2026-11-06 重新核對。版本事實固定於 dbcli commit `392ec27392157fc21a46acc66680cd4953dd5257`：`package.json` 為 12.1.0、MIT、Bun ≥ 1.4.0。下文 v1.47.1、v5、v6、v7、v8 是不同時期的修補，不代表目前仍有那些漏洞。歷史實測數字來自專案 ADR 與 changelog；本次更新核對文件與程式碼，沒有重跑完整資料庫整合測試。[版本來源](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/package.json)

## 先把強制力放在 Agent 改不了的地方

[dbcli 的威脅模型](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/docs/security-threat-model.md) 已經明確限定：CLI 權限、黑名單、dry-run 與 skill 是縱深防禦。能修改設定、取得更高權限憑證或改用另一個 client 的行程，不受這些宣告拘束。

實務上分四層安排：

1. **資料庫授權是底線。** 給 Agent 專用身分，只授予任務需要的資料與操作，不共用應用程式管理員、資料表 owner 或 superuser。讀取工作與正式寫入使用不同憑證。
2. Host 決定哪些工具呼叫要詢問；沙盒限制行程能讀寫哪些檔案、連哪些服務。兩者都不能靠一段 prompt 取代。
3. CLI 在可控入口檢查連線、操作類型與參數，並對支援的引擎使用原生唯讀執行模式。
4. 結果投影、遮罩與稽核降低外洩及追查成本，但不能補回上游已經過寬的授權。

以 PostgreSQL 為例，`SELECT`、`UPDATE`、`EXECUTE` 是不同權限；owner 的物件管理能力也不能靠撤銷一般 DML 權限消掉。即使帳號沒有直接寫表的權限，仍須檢查角色繼承與可執行函式，尤其 `SECURITY DEFINER` 會使用函式擁有者的權限。需要租戶邊界時，另行檢查 RLS；superuser、`BYPASSRLS` 與通常情況下的 table owner 不是驗證一般使用者政策的好身分。[PostgreSQL privileges](https://www.postgresql.org/docs/current/ddl-priv.html)、[函式安全性](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)、[RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

把設定搬到使用者家目錄只能減少誤暴露。若 Agent 與人類使用同一個 OS 身分，`0600` 檔案仍可能被該行程讀取；若更高權限密碼已在它的環境變數中，也不能再宣稱憑證與 Agent 隔離。需要把憑證限制在低權限角色，或交給不受 Agent 控制的執行服務。

## CLI 與 MCP 的政策粒度不同，但都不能從名稱推出安全

Claude Code 的 Bash 規則可比對命令形狀，複合命令會分開檢查。這適合把已核對的 metadata 子命令與任意 SQL 分流。下面只是起點，仍要在實際安裝版本用 `/permissions` 檢查生效規則：

```json
{
  "permissions": {
    "allow": ["Bash(dbcli schema *)"],
    "ask": ["Bash(dbcli query *)"],
    "deny": [
      "Bash(dbcli init)",
      "Bash(dbcli init *)",
      "Bash(dbcli password)",
      "Bash(dbcli password *)"
    ]
  }
}
```

`schema` 也可能讀取資料庫 metadata、更新本機快取。MongoDB 的 schema 推導會抽樣文件，SQL 單表模式可查詢列數，不能假定它只讀 catalog。[MongoDB adapter](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/src/adapters/mongodb-adapter.ts)、[schema command](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/src/commands/schema.ts)這份設定沒有覆蓋所有 dbcli 入口，也沒有封鎖其他 client、絕對路徑執行檔或直連 driver。不能把幾條 Bash deny 當成完整隔離。

截至核對日，MCP 可以逐工具放行，不只「整個 server 全放行」與「全部詢問」兩種選擇。現行文件也允許指定 server 後的工具名稱 pattern，例如 `mcp__reports__get_*`。參數層級 allow 仍不是一般授權方式；而 MCP 參數 deny 的現行入口是 `--disallowedTools`，settings 中帶括號的 MCP 規則會被略過。這些是特定 host 的能力與版本限制，不是 MCP 協定宣告的共同安全模型。[Claude Code permissions](https://code.claude.com/docs/en/permissions)

因此，CLI 子命令與 MCP 工具都需要有可審查、範圍明確的語意。`query_readonly` 這個名字本身沒有強制力；`Bash(dbcli query *)` 會比對任意 query 參數，放進 `allow` 才會免詢問，上面的範例放在 `ask`。工具提供者必須實作驗證，操作者則可以用閘道、hook、獨立執行服務與資料庫身分再縮小範圍。

[ADR-0004](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/docs/adr/ADR-0004-database-access-stays-a-cli-surface.md) 記錄 dbcli 選擇 CLI 的理由，但其中「MCP 操作者無法稽核內部路徑」不宜當成普遍事實：能取得原始碼、測試或自架服務的操作者可以稽核；閉源 CLI 同樣可能看不見內部。查核範圍取決於能否取得實作，以及誰控制部署。

## 歷史修補證明的是路徑覆蓋，不是一次測完就安全

ADR-0004 記錄六類曾讓看似讀取的操作繞過應用層權限的路徑，並記載相關修補隨 v1.47.1 交付：

- MongoDB 的 `$out`／`$merge` 具有寫入效果，不能因為從 `query`、snippet 或 `export` 進來就當成讀取。
- PostgreSQL simple-query protocol 可承載多個 statement，只看第一句會漏掉後續寫入。
- data-modifying CTE 與 `SELECT … INTO` 說明語句的第一個詞不足以分類效果。
- snippet 的 `verify.query` 也是執行入口，不能因為用途叫驗證就跳過權限檢查。
- dollar-quote 與識別字的解析差異，會讓字串分析器錯過後面的語句。
- 多連線路徑有 guard、單連線路徑沒有，仍會讓同一個功能得到兩種安全結果。

專案紀錄描述了七輪對抗性審查，但這個輪數不能換算成安全保證。更可重用的成果是把入口列成清單，再測每一條拒絕路徑。

目前的 [`execution-path-contract.test.ts`](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/tests/unit/core/execution-path-contract.test.ts) 註明使用 source-text heuristic 掃描常見 adapter 呼叫，不是型別層級的證明。換 receiver 名稱、跨行寫法或動態屬性呼叫可能逃過掃描。因此這個測試是新增路徑的警報器，還需要程式碼審查與各引擎的拒絕測試。

落地時要同時登記「從哪裡進入」與「用哪個權限身分執行」，而非只統計 guard 函式被呼叫幾次。互動 shell、export、診斷、驗證、重連與重試也都在清單內。

## 現行唯讀模式已有資料庫邊界，仍要使用低權限帳號

原文只描述 keyword-based proof 的上限，現在已經不完整。[v8.0.0 changelog](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/CHANGELOG.md#800---2026-09-05) 記錄 effective permission 為 `query-only` 的 caller-controlled SQL 增加原生唯讀交易。固定版的 [query executor](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/src/core/query-executor.ts) 與 [REPL](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/src/core/repl/repl-engine.ts) 只在這項條件成立時傳入 `native-read-only`，其他權限走 `normal`。三個 adapter 的處理也要限定在對應模式：

- PostgreSQL 在 `native-read-only` 模式取得同一條 pool client，先執行 `BEGIN READ ONLY` 再送入目標 SQL。
- MySQL／MariaDB 在 `native-read-only` 模式使用 `START TRANSACTION READ ONLY`，在該連線上執行與收尾。
- SQLite adapter 另以唯讀開啟的 handle 處理 `native-read-only` 模式，不能把前三種引擎的交易做法直接套過去。

來源：[PostgreSQL adapter](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/src/adapters/postgresql-adapter.ts)、[MySQL adapter](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/src/adapters/mysql-adapter.ts)、[SQLite adapter](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/src/adapters/sqlite-adapter.ts)。這是文件與讀碼核對，不是本次跨引擎實測結果。

**唯讀交易是額外限制，不是資料庫帳號授權的替身。** PostgreSQL 的 read-only transaction 限制本交易中的寫入，但官方明確說它不是「不會寫磁碟」的保證，也有 temporary table 等語意範圍。可變更 session、另開連線或改用其他 client 的高權限行程，仍須靠帳號權限及執行環境約束。[PostgreSQL SET TRANSACTION](https://www.postgresql.org/docs/current/sql-set-transaction.html)

測試也應區分兩件事：CLI 是否拒絕某句 SQL，以及不經 CLI、使用同一個 Agent 身分時，資料庫是否仍拒絕越權操作。後者驗證資料庫本身的授權。

## 欄位遮罩不能當成不可讀取的保證

[ADR-0018](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/docs/adr/ADR-0018-a-blacklist-rule-that-does-not-match-fails-loudly.md) 記錄 2026-08-31 的 MariaDB probe，八種設定／查詢組合有七種洩漏，其中一種是把 `Password` 改成輸出別名 `PASSWORD`。這是當時的專案實測，不能寫成所有版本都會發生。

修補時間線也必須更新：

- v6.0.0 已發布設定正規化、拒絕無法使用的規則，以及欄位路徑第一段大小寫折疊。
- v7.0.0 再把比對收斂到整條點分路徑；ADR-0020 明確取代 ADR-0018 只折第一段的決策。因此「後面段落永遠保留大小寫敏感」與「尚未釋出」都已過時。
- 這些修補改善的是規則一致性。它們沒有證明任意 SQL 的值都無法經過別名、運算、view 或 function 被重建。[版本紀錄](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/CHANGELOG.md)、[ADR-0020](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/docs/adr/ADR-0020-one-fold-rule-for-every-blacklist-comparison.md)

dbcli 的威脅模型把欄位黑名單稱為顯示過濾，而非存取控制。若帳號本來能讀 `password_hash`，只在回傳欄位名符合規則時遮掉它，無法取代資料庫欄位權限、受控 view 或只輸出必要欄位的服務。更換別名的歷史缺陷修好，也不等於所有資料推導通路都關閉。

CLI 連資料庫與查詢結果回到雲端模型，是兩次不同的資料傳輸。只要工具輸出被加入模型 context，內容便可能傳給所選模型服務；本機 CLI 不等於資料全程留在本機。HTML 匯出、暫存檔與 audit 也可能留下資料，應各自套用保存期限、存取權限及輸出最小化。[Claude Code data usage](https://code.claude.com/docs/en/data-usage)

## WHERE 與 LIMIT 不是人類授權的替代品

[ADR-0010](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/docs/adr/ADR-0010-unattended-callers-are-refused-full-table-writes.md) 記錄 SQL 寫入閘門如何區分一般操作與高風險操作。那是特定入口的產品規則，不是所有引擎、所有 DDL 路徑都共享的保證；權限、黑名單與寫入閘門也會各自拒絕操作。

原文把補上 `WHERE 1=1` 或 `LIMIT` 寫成放行方式，容易教出錯誤的操作習慣。`WHERE 1=1` 會命中所有列；`LIMIT` 只限制數量，沒有回答哪幾列有權被修改，而且各 SQL 方言的 UPDATE／DELETE 語法不同。應將這類條件當作需審查的風險訊號，不能拿來消除原本需要的人類確認。

我會把正式寫入交給另一個受控執行流程，要求明確的環境、資料庫身分、目標鍵值集合、預期筆數與回復方案。超過筆數上限、資料已變更或執行結果不確定時就停止。先查筆數再寫也存在併發空窗，必要時要在同一交易中採用適當鎖定或版本條件；不能把一次預覽當成稍後寫入的永久授權。

> [!CAUTION]
> 破壞性 SQL、別名繞道與權限反例只能在可丟棄的測試資料庫、使用假資料驗證。不要為了「確認 guard 有效」對正式資料送出 DELETE、DROP、TRUNCATE 或全表 UPDATE。

## 稽核必須記錄拒絕，也必須承認未知結果

v5.1.0 修過一個稽核目標錯置問題。查詢碰到黑名單表 `salaries` 被拒絕，稽核的 `target` 卻只保留 JOIN 中另一張表。修補新增 `metadata.blacklist_checked`，保存實際比對過的識別字，而不是假裝它是一份精確的 table list。這份清單可能包含別名與欄位參照。[v5.1.0 release](https://github.com/CarlLee1983/dbcli/releases/tag/v5.1.0)

v5.0.0 則補齊 SQL shell 的稽核寫入點，送出前嘗試寫 `attempt`，完成或拋出錯誤後嘗試寫 `outcome`；執行前被拒絕則只嘗試寫拒絕的 outcome。[ADR-0016](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/docs/adr/ADR-0016-the-sql-shell-audits-every-statement-in-two-rows.md)

固定版的 shell sink 呼叫 `writeAuditEntryResult`，寫入失敗時會收到 `write-failed`；REPL 沒有檢查這個回傳值就繼續送出 SQL。因此 ADR 對 strict 稽核的描述不能直接當作現行強制保證。audit 也可能停用，應另外測試寫入失敗時是否真的阻止執行。這裡只完成靜態讀碼，沒有執行失敗注入測試。[shell sink](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/src/commands/shell-audit-sink.ts)、[audit helper](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/src/core/audit/integration-helper.ts)、[REPL](https://github.com/CarlLee1983/dbcli/blob/392ec27392157fc21a46acc66680cd4953dd5257/src/core/repl/repl-engine.ts)

有 log 不代表已阻止操作，沒有 outcome 也不代表資料沒有改變。網路斷線、client timeout 或程序中斷後，先查明 server 端狀態，再決定能否重試。若 Agent 可以刪改本機 log，這些紀錄也不具防竄改性；有稽核需求時，要另送到受控、限權的紀錄系統，並避免把敏感查詢值完整寫入。

## 接上資料庫之前，先完成一份拒絕證據

接入前，我會留下這份測試紀錄：

1. 固定 CLI 版本、非秘密連線識別與 Agent 的資料庫身分，核對 owner、繼承角色、函式與目標資料範圍。
2. 在假資料 fixture 驗證允許的讀取成功、越權讀取與寫入失敗，再測工具外的同身分 client；不要使用管理員帳號冒充 Agent 測試。
3. 列出單次命令、shell、snippet、verification、export、report、重連與重試入口，對每個受支援入口留下結果。
4. 分別檢查資料庫授權、CLI 判決、實際資料效果、模型可見輸出與稽核。任一欄未知就記未知，不靠退出碼猜測全部結果。
5. 每次升級重跑關鍵反例，特別是輸出別名、巢狀欄位、錯誤路徑與連線收尾失敗；只有新版本的證據能支持新版本的安全主張。

[Harness Engineering 的七個控制面](/blog/harness-engineering-for-reliable-agents/)與 [reverse-skill 的授權與證據鏈](/blog/reverse-skill-security-agent-router/)也要求政策由受信任的一方設定，並在 Agent 無法自行撤掉的地方強制執行。先證明拒絕在哪裡成立，再考慮減少確認次數。
