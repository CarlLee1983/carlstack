---
title: "把資料庫接給 AI Agent 之前：授權詞彙屬於誰，機制又到得了幾條路徑"
description: "以開源專案 dbcli 的決策紀錄與實測為例，說明 Agent 的資料庫控制為何多半敗在路徑覆蓋而非機制設計，以及命令字串與工具名稱在授權表達力上的差別。"
publishDate: 2026-09-01T21:30:00+08:00
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

給 Agent 資料庫存取權時，第一個被討論的通常是「要不要開寫入」。真正決定風險的卻是另外兩件事：授權規則用誰的詞彙寫，以及已經寫好的保護機制實際覆蓋到幾條執行路徑。

這兩個問題都不是模型能力問題，換更強的模型不會改善任何一項。以下用我維護的開源專案 [dbcli](https://github.com/CarlLee1983/dbcli)（v5.1.0，MIT）當作案例：它是一個給 coding agent 使用的資料庫 CLI，支援 PostgreSQL、MySQL、MariaDB、MongoDB、Redis 與 Elasticsearch，把權限分級、寫入閘門、敏感資料遮罩與稽核放在 CLI 邊界上執行。它的價值不在於功能表，而在於這些機制被自己攻擊之後留下的紀錄。

## 授權詞彙屬於工具作者，還是屬於操作者

Agent host 授權一個 CLI，比對的是整串命令字串。Claude Code 的權限文件說明 `*` 可以放在規則的任何位置，而且它「aware of shell operators」——`Bash(safe-cmd *)` 不會順帶允許 `safe-cmd && other-cmd`，被識別的分隔符包含 `&&`、`||`、`;`、`|`、`|&`、`&` 與換行，每個子命令都要各自命中規則。[Claude Code：Configure permissions](https://code.claude.com/docs/en/permissions)

這讓授權可以是一個梯度，而不是開關：

```json
{
  "permissions": {
    "allow": ["Bash(dbcli schema *)", "Bash(dbcli query *)"],
    "deny": ["Bash(dbcli init *)", "Bash(dbcli password *)"]
  }
}
```

同一份文件對 MCP 工具的規則寫得同樣清楚：allow rule 只接受 `mcp__<server>`、`mcp__<server>__*` 或 `mcp__<server>__<tool>`，server 段不能是萬用字元；參數層級的比對限於 deny 與 ask，理由寫在文件裡——「An allow rule for one parameter value wouldn't establish that the call is safe overall」。

結果是：操作者可以**依參數封鎖**一個 MCP 工具，卻不能**依參數放行**。能表達的政策實際上只有「這個 server 的東西全部直接跑」與「這個 server 的東西每次都問」，而每次都被問的人最後會全部按同意。MCP server 要重新取得梯度，只能把介面拆成 `query_readonly` 與 `query_write` 這類分開命名的工具——但那份命名屬於 server 作者，不屬於操作者。CLI 這一側，規則寫在操作者自己的 settings 檔裡，逐專案調整，不需要工具配合。這是 dbcli 選擇不出 MCP server 的理由，記在 [ADR-0004](https://github.com/CarlLee1983/dbcli/blob/main/docs/adr/0004-database-access-stays-a-cli-surface.md)。

這個論證有一個必須一起說的限制，而且同樣寫在 Claude Code 的文件裡：**試圖用 Bash 規則約束參數是脆弱的**。文件舉的例子是 `Bash(curl http://github.com/ *)` 擋不住換協定、跟隨轉址或把 URL 塞進變數的寫法。所以命令字串的梯度應該用在「允許哪一個子命令」，不該用在「允許哪一個參數值」——參數是否安全，必須由工具自己在執行前判斷。這正好把問題交回下一節。

## 機制不缺，缺的是機制到達的路徑

dbcli 對自己做過一次稽核，題目是「宣稱 `query-only` 的連線，有沒有辦法寫到資料」。答案是有，而且有六種，全部是已經出貨的版本：

| 路徑                                               | 為什麼看起來像讀                               |
| -------------------------------------------------- | ---------------------------------------------- |
| MongoDB `$out` / `$merge`                          | 在 `query`、saved snippet 與 `export` 三條路徑 |
| PostgreSQL simple query protocol 的多語句堆疊      | 一次送出的字串裡第二句才是寫入                 |
| snippet 內的 data-modifying CTE 與 `SELECT … INTO` | 語句開頭是 `WITH` 或 `SELECT`                  |
| snippet frontmatter 的 `verify.query` 原樣執行     | 它被當成驗證用途，不是查詢                     |
| 識別字裡的 `$` 被讀成 dollar-quote 起點            | 後半段語句因此對分析器隱形                     |
| 唯讀證明只在多連線 fan-out 才跑                    | 單連線的 `dbcli query` 直接接受 DML CTE        |

ADR 對這份清單的結論只有一句：「Not one of them is a missing mechanism. Every one is a mechanism that did not reach a path.」

其中兩條不是靠逐一稽核命令找到的。四次針對個別命令的稽核都漏掉它們，它們是在把「所有會走到 adapter 的呼叫點」列成清單之後才浮現的。這件事只有握有整個介面的人做得到——MCP server 的操作者做不到，那些路徑在 server 的行程裡面。

同樣值得記的是修復過程：七輪對抗式審查，第二到第六輪每一輪都在前一輪的修補裡找到新缺陷，其中兩次出在「為了讓 guard 不要誤擋合法查詢而加的例外」。第七輪才乾淨。現在這份列舉變成一個結構性測試合約（`tests/unit/core/execution-path-contract.test.ts`）：新增一條通往 adapter 的路徑，測試會失敗，直到它被登記到閘門為止。合約不禁止新增路徑，它只是讓路徑無法被無聲地加進來。

延伸閱讀：[Harness Engineering 的七個控制面](/blog/harness-engineering-for-reliable-agents/)把權限與驗證列為 harness 的控制面之一；[reverse-skill 的授權與證據鏈](/blog/reverse-skill-security-agent-router/)談的是同一個形狀在另一個工具上的版本——一個由呼叫端自行宣告的授權，不構成強制力。

## 八種黑名單寫法，七種靜默無效

敏感資料保護是同一個問題的第二個切面。dbcli 的 blacklist 可以擋整張表，也可以遮欄位，遮罩在渲染之前套用，`--format html` 與 `--ui` 也一樣。問題不在於機制有沒有寫，而在於**操作者怎麼知道自己寫的規則有生效**。

實測方式很土：本機 MariaDB，建表 `probe_users (id, Password, note)`，值 `s3cret`，用八種合理的設定寫法各跑一次。七種洩漏，而且八種全部被設定載入器無聲接受——操作者「規則有效」的唯一證據，是 dbcli 沒有抱怨。

最尖銳的一則不是設定寫錯。規則的大小寫**寫對了**，`SELECT Password AS PASSWORD` 照樣把值送回來，在 `query-only` 就做得到：遮罩比對的是回傳時的鍵名，而別名剛好選了那個鍵名。

修法記在 [ADR-0018](https://github.com/CarlLee1983/dbcli/blob/main/docs/adr/0018-a-blacklist-rule-that-does-not-match-fails-loudly.md)，已併入 `main`、尚未隨版本釋出，方向是「對不上的規則要大聲失敗」：

- 比對時把路徑的**第一段**折成小寫，後面的段落不折——那些是巢狀物件的鍵（`profile.SSN`），不是 SQL 識別字。代價是 PostgreSQL 允許 `"Password"` 與 `"password"` 並存，規則寫一個現在兩個都遮，這是刻意的過度拒絕。
- `{"users": ["users.password"]}` 這種以自己的表限定的欄位項從來沒命中過任何東西，現在改為**載入失敗**而非靜默忽略——因為欄位項裡的點號已經有第二個合法意思，猜測會猜錯。
- 前後空白與外層引號（`" password "`、`"\"password\""`）會被去掉；表規則同時以完整名稱與最後一段查找，`public.users` 與 `users` 解析到同一份規則。
- 寫入側改用與讀取側相同的祖先走訪，否則規則 `profile` 之下的 `profile.ssn` 會出現「能寫不能讀」。

過程裡有一個值得記下來的失誤：第一版把規則在**載入時**就折成小寫，單元測試全綠，對真實 MariaDB 跑起來八格全漏——連原本擋得住的那格也漏了，因為遮罩路徑仍以原樣比對回傳欄位名，等於親手製造了一次「兩端摺疊規則不一致」，正是這一則要修的東西。改成比對時折之後八格全數符合設計。這個失誤被寫進 ADR 的第一則決策，理由是單元測試看不到它。

> [!IMPORTANT]
> 這一段的所有結論都來自對真實資料庫的實測，不是讀碼推論。給 Agent 用的保護機制，「設定有被接受」與「規則有生效」是兩件事，中間需要一次會失敗的量測。

## 拒絕本身也要留下可查的紀錄

第三個切面是紀錄。dbcli 的寫入閘門把寫入分成兩層，與權限等級無關：一般寫入（`INSERT`、有 `WHERE` 或 `LIMIT` 的 `UPDATE` / `DELETE`）在無人值守時可以跑；第二層（無 `WHERE` 的 `UPDATE` / `DELETE`、`DROP`、`TRUNCATE`、解析不了的 SQL、一次多句、巢狀寫入、多表寫入）在無人值守時一律拒絕，**沒有任何旗標可以繞過**，退出碼 1 並附上機器可讀的 `reason=`（`no_where`、`ddl_destruction`、`unparseable`、`multi_table`、`nested_write`、`non_unique_where`、`multiple_statements`）。要放行只能把意圖寫進 SQL 本身（補 `WHERE 1=1`、加 `LIMIT`），而不是加一個旗標。

紀錄這一側的教訓比機制更有代表性。v5.1.0 修的是這件事：把 `salaries` 設進黑名單後跑 `SELECT * FROM a JOIN salaries s …`，拒絕是對的，而**那次拒絕的稽核列 `target` 是 `a`**。想用 `target` 查「有沒有人試圖碰受保護的表」，查不到；真正的表名只活在 `error` 的自由文字裡。原因是黑名單走 tokenizer，稽核的 `target` 走另一套單名推導，兩份解析給出兩個答案。

修法刻意不去動 `target`——它是下游拿來 filter 的欄位，改動會在沒人被告知的情況下改變既有查詢結果——而是新增 `metadata.blacklist_checked`，原樣保存黑名單比對過的每一個識別子。那份清單是刻意過度收集的：那句 JOIN 會回傳 `["a","salaries","s","id","s.id","a.id"]`，別名與關鍵字都在裡面。對黑名單而言這是對的，多一個識別子只會讓它多拒絕；對稽核而言，欄位名要誠實說明它是什麼，而不是再造一套對不起來的解析。

v5.0.0 更早修過同一類問題：`dbcli query "SELECT …"` 會寫一列稽核，而在 `dbcli>` 提示符打的同一句寫零列；一句帶 `WHERE` 的 `UPDATE` 走完全程、改掉了資料，同樣零列。較窄的方案（只記寫入與拒絕）被否決，理由是——一旦「沒有紀錄」有第二種解釋，它對任何一個入口都不再有意義。

## 這套設計沒有解決的部分

以下是 dbcli 自己記在決策紀錄與威脅模型裡的邊界，不是遺漏：

| 邊界                             | 影響                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 唯讀證明是 keyword-based         | SQL 以字串傳進函式（`query_to_xml('DELETE …')`、`dblink_exec`）或 volatile UDF 偵測不到                      |
| 命令字串不是自足的               | 連線可由 `DBCLI_CONNECTION` 決定，專案儲存以絕對路徑雜湊為鍵，同一串命令在另一份 checkout 可能指向不同資料庫 |
| Elasticsearch 在 dbcli 內是唯讀  | `insert` / `update` / `delete` 不支援                                                                        |
| Redis 與 MongoDB 沒有完整 schema | Redis 只有逐鍵資訊，MongoDB 是抽樣（預設 100 筆）                                                            |
| 執行環境限定 Bun ≥ 1.3.3         | 只有 `./agent-core` 這個 subpath 可在純 Node 匯入                                                            |

「命令字串不是自足的」這一項尤其值得注意：ADR-0004 把「invocation 就是審查單位，人可以重跑 Agent 跑過的東西」列為**尚未交付**的主張，而不是既有事實。一個宣稱自己可審查的工具，最該誠實的地方就是這裡。

## 最小可落地

如果你正要把資料庫接給 Agent，這五步不依賴 dbcli，換成任何工具都成立：

1. **先列路徑，不先列功能。** 把所有會走到資料庫連線的入口列出來——單次命令、互動 shell、儲存的查詢、匯出、健康檢查。保護機制的價值等於它覆蓋的路徑數。
2. **對每條路徑做一次會失敗的量測。** 建一張 probe 表、放一個假的敏感值，逐條路徑跑。讀碼結論可以列成待驗清單，不能當結論。
3. **讓對不上的設定大聲失敗。** 「設定被接受」不等於「規則生效」時，操作者手上就沒有任何證據。
4. **把授權梯度寫在你自己的 settings 檔裡。** 用子命令切（`dbcli schema *` 放行、`dbcli query` 詢問、`dbcli init` 拒絕），不要用參數值切——參數的安全性要由工具在執行前判斷。
5. **確認拒絕也會留下可查的紀錄，而且紀錄指向對的東西。** 一次成功的攔截，如果在稽核裡指向錯的表，等於沒有攔截紀錄。

給 Agent 開資料庫權限，真正需要決定的不是等級高低，而是誰擁有寫政策的詞彙、機制走到了幾條路徑、以及規則失效的時候你會不會知道。這三件事都可以量測，而且應該在接上去之前就量過一次。

## 來源

- [dbcli](https://github.com/CarlLee1983/dbcli)（v5.1.0，MIT）
- [ADR-0004：Database access stays a CLI surface](https://github.com/CarlLee1983/dbcli/blob/main/docs/adr/0004-database-access-stays-a-cli-surface.md)
- [ADR-0018：A blacklist rule that does not match fails loudly](https://github.com/CarlLee1983/dbcli/blob/main/docs/adr/0018-a-blacklist-rule-that-does-not-match-fails-loudly.md)
- [Claude Code：Configure permissions](https://code.claude.com/docs/en/permissions)
