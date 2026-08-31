# reverse-skill：原始碼研究筆記

> 研究日期：2026-08-31（Asia/Taipei）
>
> 分析版本：commit [`71acc8e`](https://github.com/zhaoxuya520/reverse-skill/commit/71acc8e3115f76bad7a914c36466c1086232288c)
>
> 範圍：路由、case 初始化、授權門禁、工具索引與自舉、Evidence 鏈、field journal，以及 macOS 上可執行的 Bash 測試。

## 結論

`reverse-skill` 不是單一逆向工具，也不是會自己完成安全研究的模型。它是一套 client-neutral 的 Agent 操作框架，用結構化路由把任務送進專門 Skill，再以 scope、工具能力、Evidence 與報告契約描述工作流程。

它最重要的設計不是收錄多少工具，而是把四件容易留在對話裡的資訊落成檔案：

1. 任務應走哪個 Skill；
2. 操作者宣告目標是否已授權、哪些行為在範圍內；
3. 操作產生了什麼證據，如何支持結論；
4. 哪些經驗可脫敏後回寫，供下一次任務檢索。

## 核心資料流

```text
task hint
  -> routing.json + master-route
  -> case-init / scope contract + optional guard
  -> PRIMARY SKILL.md
  -> tool-index / bootstrap manifest
  -> timeline + workitems + Evidence -> Finding -> Path
  -> report + anonymized field journal
```

README 也以同樣順序描述主路徑，並明確把 client adapter 與路由核心分開。[README：主流程](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/README.md#L52-L60)、[client-neutral integration](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/README.md#L243-L245)

## 原理核對

### 1. 路由是規則比對，不是另一輪 LLM 猜測

`skills/config/routing.json` 是路由 single source of truth。Bash router 將 task hint 轉成小寫後，用 regex `must`、`mustAll` 與 `exclude` 判斷規則；每個命中規則加一分，再依 `priority` 順序選出最高分 route。完全未命中時回退 R0 通用逆向。[master-route.sh：計分與選路](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/scripts/master-route.sh#L74-L120)

這讓相同 hint 可做 regression test，但 regex 只能判斷文字線索，無法取代對樣本、授權與實際環境的理解。

### 2. case 目錄是操作狀態，不只是報告資料夾

`case-init.sh` 會建立 `scope.md`、`timeline.md`、`workitems.md`、`evidence/`、`notes/` 與 `report/`。只有 `auth.status=granted`，且 network profile 與明確目標或 offline sample 符合條件時，才會寫出 `ready_for_act=true`；另行執行 `case-guard.sh` 時，`--force` 不能略過這些欄位檢查。[case-init.sh：ready 判斷](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/scripts/case-init.sh#L208-L215)、[case-guard.sh](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/scripts/case-guard.sh#L67-L126)

這不是外部授權驗證或工具攔截。`--auth-granted`／`--auth-status granted` 與 `evidence_of_auth` 都由 caller 提供，production scripts 也不會在每次工具呼叫前自動執行 guard；安全效果依賴 Agent／操作者遵守流程，或由 host 在外層強制呼叫 guard 與限制工具權限。[case-init.sh：授權欄位來源](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/scripts/case-init.sh#L129-L145)

`timeline.md` 採 append-only transition，`workitems.md` 保存覆蓋狀態；未改變的資料用 `carry_forward_refs` 指回權威檔案，不重複整份 context。[timeline 與 workitem 契約](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/ops/timeline-workitem.md)

### 3. Evidence、Finding、Path 分開處理觀察與結論

Evidence 記錄來源、hash、可重現命令與原始摘錄；Finding 必須引用 Evidence；Path 再把攻擊、呼叫或解題步驟串起來。`review_case.py --verify-hashes --strict` 可檢查 scope 欄位、引用關係與檔案 hash。[Evidence→Finding→Path 契約](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/ops/evidence-finding-path.md)

這套鏈路仍是 Markdown 欄位契約，不是防竄改資料庫；hash 只能檢查目前 artifact 是否符合目前紀錄的值。因為 artifact 與 Markdown hash 欄位都能一起被修改，它不能證明歷史未被竄改，也不能證明最初取得資料的方式或內容本身可信。

### 4. 工具偵測與工具安裝刻意分開

`refresh-tool-index.sh` 不安裝工具，但不只是讀 command、路徑與版本。它也會讀 Claude／Codex 的 MCP 設定、探測 manifest 登記的 localhost port，並對已開啟的本機 MCP endpoint 發送 `tools/list` HTTP POST，再產生 capability status。[refresh-tool-index.sh：基本索引](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/scripts/refresh-tool-index.sh#L1-L16)、[MCP 與 localhost 探測](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/scripts/refresh-tool-index.sh#L227-L344)

需要補工具時才讀 `bootstrap-manifest.json`。部分 capability 固定 release、套件版本、commit 或 SHA-256，例如 jadx、apktool、Frida 與 anything-analyzer；JEB Pro 則只提供合法授權安裝說明。[bootstrap manifest](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/scripts/bootstrap-manifest.json#L11-L176)

供應鏈 pin 不是全面 immutable：radare2 依 GitHub API 的動態 digest，ADB 使用 `winget-latest`。Bootstrap 也可能安裝套件、clone repository、啟動本機服務；只有明確指定 `--mcp-host` 才應寫入 Claude 或 Codex 設定，預設為 `none`。[bootstrap-reverse.sh：參數與路徑保護](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/scripts/bootstrap-reverse.sh#L1-L32)、[manifest 的動態項目](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/scripts/bootstrap-manifest.json#L177-L209)

### 5. 「自動進化」是 journal 回寫，不是模型訓練

任務後的 field journal 會保存脫敏 scope、執行鏈、最多三項 Evidence、Finding／Path 摘要、踩坑與可重用模式，再同步 `_index.md`。這是 repository 內的案例知識庫；下一次由 Agent 檢索與套用，不會改模型權重。[field journal template](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/field-journal/_template.md)

## 本機驗證

環境：macOS 26.5.1、Apple 內建 GNU Bash 3.2.57、Python 3.9.6。

```text
bash skills/scripts/test-routing.sh
TOTAL=173 PASS=173 FAIL=0
OVERALL: ALL PASS (173 routing cases + default-root regression)
```

`bash skills/scripts/test-bash-workflow.sh` 通過 case 建立與有效 scope gate 後，在第三項「拒絕不合法 network mode」fixture 設定階段失敗。原因是測試使用 GNU `sed -i` 語法，macOS 的 BSD `sed` 需要額外的 backup suffix；因此這次無法聲稱整套 Bash workflow test 在 macOS 通過。失敗發生在測試夾具改檔，不是在 `case-guard.sh` 的拒絕邏輯本身。[test-bash-workflow.sh](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/scripts/test-bash-workflow.sh#L29-L47)

## 適用邊界

- 適合：已有合法授權，需要讓多種 AI coding client 共用資安分析流程、工具索引與報告契約。
- 不適合：期待安裝後自動完成所有逆向、或把 regex routing 當成分析正確性的保證。
- 主要風險：第三方工具與 MCP 供應鏈、bootstrap 的環境副作用、公開 journal 的脫敏失誤，以及 offensive workflow 被用在未授權目標。
- 法律與操作邊界：專案明定只供合法研究、教育、CTF、自有或明確授權系統使用。[README disclaimer](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/README.md#L319-L323)
