---
title: "Herdr 如何整理等待核准、審查與接手的 Agent 工作"
description: "釐清 Herdr TUI 的狀態回報、遠端接續與重啟限制，搭配獨立工作樹和版本綁定的審查證據，評估是否能減少人工巡查。"
updatedDate: 2026-11-05T23:17:00Z
publishDate: 2026-09-08T10:00:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 開源專案
series: AI Agent 工程化與工作流實戰
seriesOrder: 18
cover: ../../assets/covers/herdr-agent-runtime-attention-queue.png
coverAlt: "三條青藍色任務軌道匯向金屬審核台，中央人形操作員站在琥珀色核准閘門前，右上方遠端伺服器以青藍連線接回工作流。"
---

同時跑多個 Coding Agent 時，人類的等待佇列很容易混亂：哪個 agent 正在等核准？哪一個已經產出可以 review 的 diff？筆電闔上或 SSH 斷線後，哪個 session 還有可接手的工作？

[Herdr](https://herdr.dev/)目前分為 App 與 [TUI](https://herdr.dev/tui/)；這裡討論的是 TUI 的 workspace、tab、pane 與遠端 session。查核基準為 2026-11-05 的官方文件與 [GitHub](https://github.com/herdrdev/herdr) master `ee5bfb5`，使用者文章則保留各自的發表時間，沒有把個人經驗視為效能測試。[Goga Koreli 的 August 2026 評析](https://gkoreli.com/oss-radar-04-the-agent-multiplexer-is-becoming-a-runtime)提供的是當時的產品觀察。

TUI 能把等待輸入的 session 顯示出來，但 sidebar 的 `done` 只是一個待查看的完成提示，會保留到使用者查看；它不表示 process 已終止，也不代表 diff 已通過審查。把這三件事分開，才知道該接手、重啟，還是送交 review。

## 先判斷瓶頸是不是等待，而不是畫面

兩篇第一人稱文章描述了相近的需求。遠端主機上長時間跑 agent、需要從 Mac 或手機 reconnect 的人，會把 `herdr --remote` 視為最重要的能力；[Baochun Li 在 2026-07-09 的實測](https://baochun.org/2026-07-09/)與 [coles.codes 在 2026-08-02 的比較](https://www.coles.codes/posts/herdr-vs-cmux/)都把它放在保留 Herdr 的首要理由。

但若工作只在單一電腦、同時只有兩三條工作線，這個升級未必有回報。[r/ClaudeCode 這串討論](https://www.reddit.com/r/ClaudeCode/comments/1v8lk76/herdr_cmux_tmux_are_they_really_that_helpful/)中，有使用者偏好既有的 terminal 工作流：既有快捷鍵、穩定的 scrollback 與 shell plugin 已經能覆蓋需求；新增一層 TUI 反而可能帶來 rendering、捲動、hotkey 或 WSL 相容性的成本。導入前要先分清需求：是找不到 terminal，還是分不清誰正在等你？

我的立場是：**只有當人類開始輪詢多個 agent 的狀態，或 session 中斷後需要重建工作脈絡，才應導入 agent-aware runtime。**否則，保留既有 terminal 與 CI 是更可靠的選擇。

## 使用者實際怎麼開始用 Herdr

Baochun Li 與 coles.codes 都把 Herdr 放在既有終端與遠端主機之間。

[Baochun Li](https://baochun.org/2026-07-09/)在 2026-07 的經驗是先在 Ghostty 裡使用 Herdr，並用 space、tab、pane 對應三種不同層級：一個專案一個 space，較長的工作一個 tab，臨時 shell 才開 pane。這個映射看起來很普通，卻解決了傳統 multiplexer 最容易混亂的地方：所有分頁都只是「另一個 terminal」，回來後很難判斷它屬於哪一個工作。當 Agent session 有自己的 workspace 時，重新 attach 的人至少先看得到專案與任務，而不是一排沒有語意的 shell。

他保留 Herdr 的主要理由，是能把長任務留在辦公室的 Mac 或 server 上。離開桌面後，他從手機上的 SSH terminal 連回 Tailscale 位址，再進入同一個 Herdr session。這是很具體的使用模型：筆電不是 agent 的執行位置，只是 client；人在哪裡，就從哪裡接回工作。它適合需要跨裝置處理核准、看 log、補一個短指令的情境，但不表示手機適合做完整 code review。

[coles.codes](https://www.coles.codes/posts/herdr-vs-cmux/)的兩個月比較把這個工作方式說得更清楚：Herdr 的 pane 和 agent 仍留在 remote box，local client 以 `herdr --remote workbox` attach。作者並沒有因為 cmux 新增 SSH daemon 就立刻換回去，因為他要的是「agent 跑在哪裡，控制介面就跟到哪裡」。作者也記錄了當時的限制：需要 Kitty image protocol 的 browser plugin 無法透過他的 remote connection 工作，純文字的 reviewr 類 plugin 較適合該配置。這是 8 月文章的環境觀察，導入時仍要用目前的 plugin、終端與連線版本重測。先決定 agent 與資料留在哪台機器，再選 UI，會比先比較 theme 或 pane dragging 更實際。

## 一天的操作節奏不是一直看 pane

我會把主畫面當成待處理事件清單。r/ClaudeCode 討論中有人認為內建 skills 改善了 cross-agent interaction；這類回饋適合拿來設計試用情境，成效仍要看自己少做了多少次人工巡查。

把一天拆成三個短動作就夠了：

1. **開始時建立工作邊界。**一個 repository 開一個 workspace；平行寫入的任務各用獨立 worktree。即使改不同檔案，共用 checkout 仍共用 index、HEAD 與可能被覆寫的建置產物；若不拆開，就必須序列化 Git 操作與其他寫入。每個 agent 只拿到 task、驗收證據與停止條件，不要用 pane 名稱代替任務內容。
2. **執行中只處理例外。**agent 是 `working` 時不逐一切換 pane，但仍保留逾時與錯誤告警；`blocked` 時先讀它需要的輸入、權限或決策；顯示 `done` 時查看交付證據，齊備後轉到 review queue。這能避免「每十分鐘切到每個 tab 看一眼」的習慣。
3. **收尾時只處理可交付物。**每個完成 session 都要留下 diff、測試輸出、已知風險與下一步。然後關閉或 detach，不把「以後可能會看」的 terminal 留成永久 backlog。

這套節奏刻意把 runtime 的角色限制在顯示與接續。真正的工作狀態仍應放在 issue、PR、task file 或 repository instructions。否則 Herdr server 重啟、主機維護或人員交接時，唯一的工作脈絡仍被困在某個 pane 的 scrollback。

> [!TIP]
> **先把「不用再主動巡邏哪個 Agent」當成導入指標。**如果 Herdr 只讓你更方便地同時盯著八個 pane，它只是更漂亮的 context switching；如果它讓你只在 blocked 或 needs-review 時介入，才是在節省注意力。

## Herdr、tmux 與 Zellij 各自解的是不同問題

- 只需要 SSH 斷線後保留 shell、腳本化管理 session，tmux 通常已足夠。
- 本機分 pane 與快捷鍵已經順手，可以保留 Zellij 或既有 terminal。
- 多個 agent 經常等待輸入、核准或查看結果，Herdr TUI 的 sidebar 才有明確用途。
- agent 要留在遠端主機、從多台裝置接手時，先測 remote attach，再決定是否搬移日常工作。
- diff review、CI gate 與權限仍由 repository 和平台負責。

[Petronella Technology 在 2026-08-29 的比較](https://petronellatech.com/blog/tmux-vs-cmux-vs-herdr-2026-terminal-multiplexer-comparison/)可以作為當時產品定位的參考，其中 macOS-only 應限於所比較的 cmux App，不能延伸成整個 cmux 生態的限制。Herdr 的[目前遠端文件](https://herdr.dev/tui/docs/persistence-remote/)也列有 Windows x64 host 支援，不能把遠端主機一概寫成 Linux。

## 把狀態列當成 review queue 的入口，不是完成宣告

[官方 agents 文件](https://herdr.dev/tui/docs/agents/)將原生語意狀態定義為 `idle`、`working`、`blocked`。整合有回報狀態時採用該回報，否則對支援的 agent 讀取畫面；resume 整合不等於 state report，安裝 integration 也不保證狀態來自原生回報。畫面推測與原生回報的可靠度不能混在一起。sidebar 的 `done` 提示也要和這組語意狀態分開記錄。

自行整合時，[add-herdr-support 文件](https://herdr.dev/tui/docs/add-herdr-support/)建議回報時帶上可選的 `--seq`；若提供，同一 source 的序號在跨 session 與 agent 重啟後也必須持續遞增，以免舊事件覆蓋新狀態。resume command 支援需 Herdr ≥ 0.9.2，release 應在 agent 實際退出時送出。若狀態卡住，先確認整合版本、事件順序與 process 是否存活，不要把重送完成訊號當成修復。

一個最小工作流只要補上兩個 runtime 不會替你提供的狀態：`needs-review` 與 `accepted`。前者要附上 diff、測試結果和已知風險，後者才表示 CI 與需要的人類核准已通過。本站的[多 Agent 工作台不是多開終端](/blog/multi-agent-workstation-control-plane/)更完整說明了為何 process state 與驗收 state 必須分開。

這份任務契約模板尚待填寫，不能當成已跑過的測試紀錄。`pending`、空的 commit 與 log 都必須換成實際證據，才能進入 `needs-review`。

```yaml
task: 修正付款重試的 timeout regression
review_state: pending
runtime_observation:
  source: native-report # 或 screen-detection
  semantic_state: idle
  sidebar_done: false
versions:
  herdr: null
  agent: null
  test_runtime: null
revision:
  base_commit: null
  head_commit: null
checks:
  - command: pnpm test -- payments/retry
    expected: timeout 後只能送出一次補償請求
    status: pending
    exit_code: null
    log: null
risk:
  - 尚未在 staging 驗證第三方 payment gateway
stop_when:
  - CI 失敗
  - 需要改動付款權限或正式環境設定
accepted_when:
  - 同一 head_commit 的 required checks 通過
  - reviewer 核准該版本的風險與 rollout
```

head 改變後，舊測試只能證明舊版本；重新執行受影響的 checks 並更新紀錄。測試失敗就保留 log、回到修改階段，不能因 sidebar 顯示 `done` 跳過。

這份契約用來阻止 `done` 偷渡成「可以合併」。runtime 負責把等待的人找出來，repository 的測試與審查機制才決定能不能往下一步走。

## 使用者踩到的坑，比功能表更值得先測

近期討論沒有給出「Herdr 一定比較快」的結論，反而留下幾個值得在導入前驗證的限制。

第一個是 TUI 疊加。r/ClaudeCode 一位 Windows／WSL 使用者原本以虛擬桌面管理多個 terminal 與 VS Code instance；改用 Herdr 後，碰到 rendering、scrolling、hotkey 與 fish autosuggestion 偶爾失效。這是該使用者的環境回報，沒有證明所有 Windows／WSL 配置都有同樣問題。coding agent、multiplexer 與 shell plugin 疊在一起時，需要一起測試。若你的日常依賴 mouse selection、複雜 prompt、圖片協定或特殊 shell completion，先用實際 repository 跑一天，不要只看 demo。

第二個是完整 reboot 不等於 detach。[session-state 文件](https://herdr.dev/tui/docs/session-state/)區分了 client detach、server 存活與主機重啟：detach 可以保留背景 process，一般 server 停止再啟動或主機重啟後，原 process 不會保留。snapshot 恢復的是 layout 等 session 設定，agent 的原生 conversation resume 也不等於恢復記憶體。terminal history 因可能包含 secrets，預設不保存。官方另提供實驗性的 `--handoff`，可在支援的 server 更新或替換流程中嘗試移交仍存活的 pane；這是 best-effort 的 live handoff，不是主機斷電或完整 reboot 後的復原保證。

復原順序要能在沒有 scrollback 時成立：從 task file 找回目標，核對最後 commit 與尚未提交的差異，再用 agent 支援的 resume 或重新執行工作。付款、部署這類有副作用的步驟，先確認前次是否已生效。遠端版本號不同本身不會觸發重啟；缺少必要相容能力時，停止 server 需另外確認，預設回答為 No。若同意停止而沒有成功的 live handoff，pane process 會終止。缺少相容 binary 時，互動模式會提示安裝或更新，非互動模式則直接失敗。即使 live handoff 成功，進行中的 API 請求、wait 與訂閱仍可能中斷，重連後須先確認前次動作是否生效。更新前先保存工作、記錄 client/server 版本，再安排可中斷的時段。

第三個是人類注意力仍有上限。該討論裡有人說自己超過兩三個 session 就開始 context switching，也有人主張 orchestrator 能讓人管理更多 agent。兩者並不衝突：能並行執行的 session 數，可以遠大於能被人同時理解的 session 數。Herdr 的價值是把前者壓縮成後者的 exception queue，而不是要求人同時閱讀更多文字。

## 先用兩條工作線做一次可撤回的實驗

不要從十個 agent 開始。挑一個 repository、兩項低風險且不互相覆寫的任務，保留既有 CI，連續使用一週。

1. 每個 task 都寫一行 goal、一行 evidence 與一個 stop rule。
2. 平行寫入者使用獨立 `git worktree`，各自配置測試輸出與服務 port；共用 checkout 時就採單一寫入者。
3. agent 提交同一版本的 diff 與測試證據後，才轉成 `needs-review`；`done` 只提醒你查看結果。
4. 記錄三個數字：人類輪詢 session 的次數、等待 review 的時間、因為缺少脈絡而重做的次數。
5. 若這些數字沒有下降，就移除 Herdr，回到原本的 tmux 或 Zellij 工作流。

試用期間也記錄安裝、升級與復原花掉的時間。若省下的巡查時間不足以抵銷維護成本，就回到既有工具。

## 一週試用的具體配置

若你想照別人的經驗試用，而不是一次換掉整個 terminal setup，可以用這個保守版本：

```text
workspace: payments-service
├── tab: implementation
│   ├── pane: agent - retry timeout regression
│   └── pane: test - focused regression suite
├── tab: review
│   ├── pane: agent - independent diff review
│   └── pane: shell - git diff, logs, manual checks
└── tab: operations
    └── pane: server - local dev server or remote log tail
```

第一週只保留一個 implementation agent 和一個 review agent，不要為了填滿畫面再加 research、planner、QA 等角色。implementation 完成後，review agent 在另一個 checkout 檢查固定 commit，搭配相同 base/head 的 diff、任務契約與測試結果；需要修改就退回 implementation，避免審查途中內容繼續變動。若需要遠端執行，再把整個 workspace 放到一台已設好 SSH key、更新與最小權限帳號的主機，從本機以 `herdr --remote` attach。

一週結束時，回頭回答三題：我少切了多少次 terminal？我有沒有更快發現真正需要核准的工作？主機或 session 中斷後，下一步是否仍能從 repository 找到？前兩題沒有改善、第三題又做不到，就不要把 Herdr 留在日常路徑。這比「我同時開了幾個 agent」更能判斷它是否真的適合你。

## 延伸閱讀

- [Herdr 官方網站](https://herdr.dev/)
- [Herdr 官方 GitHub](https://github.com/herdrdev/herdr)
- [coles.codes：herdr vs cmux, after two months on each](https://www.coles.codes/posts/herdr-vs-cmux/)
- [r/ClaudeCode：Herdr, cmux, tmux... are they really that helpful?](https://www.reddit.com/r/ClaudeCode/comments/1v8lk76/herdr_cmux_tmux_are_they_really_that_helpful/)
- [多 Agent 工作台不是多開終端：先設計注意力、隔離與權限](/blog/multi-agent-workstation-control-plane/)

- [Git worktree：獨立 HEAD、index 與共享 repository 資料](https://git-scm.com/docs/git-worktree)
