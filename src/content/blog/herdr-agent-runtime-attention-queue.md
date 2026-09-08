---
title: "Herdr 解決的不是終端分頁：當 Agent 開始等你時，才需要 Runtime"
description: "從 Herdr 的近期實測與社群回饋出發，判斷何時 agent-aware terminal runtime 能降低等待與交接成本，何時 tmux 或 Zellij 已經足夠。"
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

同時跑多個 Coding Agent 時，最先失控的通常不是 terminal 視窗，而是人類的等待佇列：哪個 agent 正在等核准？哪一個已經產出可以 review 的 diff？筆電闔上或 SSH 斷線後，哪個 session 還有可接手的工作？

[Herdr](https://herdr.dev/)把這些 session 放進 terminal-native 的 workspace、tab 與 pane，並提供 detach、reattach、remote attach 與 agent 狀態。它的價值不是比 tmux 多一個 sidebar，而是把「人必須回應的工作」從一堆相同的 shell 裡挑出來。不過狀態介面不是驗收系統：`done` 仍可能只代表 process 停止，沒有證明需求、測試與風險都已處理。[官方 GitHub](https://github.com/herdrdev/herdr)與 [Goga Koreli 的 August 2026 評析](https://gkoreli.com/oss-radar-04-the-agent-multiplexer-is-becoming-a-runtime)都支持這個區分。

## 先判斷瓶頸是不是等待，而不是畫面

近期的使用經驗有一個共識。遠端主機上長時間跑 agent、需要從 Mac 或手機 reconnect 的人，會把 `herdr --remote` 視為最重要的能力；[Baochun Li 在 2026-07-09 的實測](https://baochun.org/2026-07-09/)與 [coles.codes 在 2026-08-02 的比較](https://www.coles.codes/posts/herdr-vs-cmux/)都把它放在保留 Herdr 的首要理由。

但若工作只在單一電腦、同時只有兩三條工作線，這個升級未必有回報。r/ClaudeCode 與 r/opencodeCLI 的近期討論都有人選擇留在 tmux、Zellij 或 Ghostty：既有快捷鍵、穩定的 scrollback 與 shell plugin 已經能覆蓋需求；新增一層 TUI 反而可能帶來 rendering、捲動、hotkey 或 WSL 相容性的成本。這不是誰用錯工具，而是瓶頸還沒有從「我找得到 terminal」變成「我分不清誰正在等我」。

我的立場是：**只有當人類開始輪詢多個 agent 的狀態，或 session 中斷後需要重建工作脈絡，才應導入 agent-aware runtime。**否則，保留既有 terminal 與 CI 是更可靠的選擇。

## 使用者實際怎麼開始用 Herdr

最有代表性的採用路徑，不是把 Herdr 當成一個新的終端機，而是先把它放在既有終端與遠端主機之間。

[Baochun Li](https://baochun.org/2026-07-09/)在 2026-07 的經驗是先在 Ghostty 裡使用 Herdr，並用 space、tab、pane 對應三種不同層級：一個專案一個 space，較長的工作一個 tab，臨時 shell 才開 pane。這個映射看起來很普通，卻解決了傳統 multiplexer 最容易混亂的地方：所有分頁都只是「另一個 terminal」，回來後很難判斷它屬於哪一個工作。當 Agent session 有自己的 workspace 時，重新 attach 的人至少先看得到專案與任務，而不是一排沒有語意的 shell。

他真正保留 Herdr 的原因不是版面，而是把長任務留在辦公室的 Mac 或 server 上。離開桌面後，他從手機上的 SSH terminal 連回 Tailscale 位址，再進入同一個 Herdr session。這是很具體的使用模型：筆電不是 agent 的執行位置，只是 client；人在哪裡，就從哪裡接回工作。它適合需要跨裝置處理核准、看 log、補一個短指令的情境，但不表示手機適合做完整 code review。

[coles.codes](https://www.coles.codes/posts/herdr-vs-cmux/)的兩個月比較把這個工作方式說得更清楚：Herdr 的 pane 和 agent 仍留在 remote box，local client 以 `herdr --remote workbox` attach。作者並沒有因為 cmux 新增 SSH daemon 就立刻換回去，因為他要的是「agent 跑在哪裡，控制介面就跟到哪裡」。不過這也有邊界：需要 Kitty image protocol 的 browser plugin 不會透過 remote connection 工作；只畫文字的 reviewr 類 plugin 才比較適合遠端。先決定 agent 與資料留在哪台機器，再選 UI，會比先比較 theme 或 pane dragging 更實際。

## 一天的操作節奏不是一直看 pane

Herdr 最合理的使用方式是把主畫面當成 interrupt inbox，而不是監視牆。r/ClaudeCode 的使用者提到內建 skills 讓 cross-agent interaction 有明顯改善，原因不是同時看到更多輸出，而是 orchestrator 可以等待其他 session、在需要人或需要下一個 agent 時才浮出事件。

把一天拆成三個短動作就夠了：

1. **開始時建立工作邊界。**一個 repository 開一個 workspace；會改同一組檔案的任務先拆 worktree，否則共用 checkout。每個 agent 只拿到 task、驗收證據與停止條件，不要用 pane 名稱代替任務內容。
2. **執行中只處理例外。**agent 是 `working` 時不輪詢；`blocked` 時先讀它需要的輸入、權限或決策；顯示 `done` 時轉到 review queue。這能避免「每十分鐘切到每個 tab 看一眼」的習慣。
3. **收尾時只處理可交付物。**每個完成 session 都要留下 diff、測試輸出、已知風險與下一步。然後關閉或 detach，不把「以後可能會看」的 terminal 留成永久 backlog。

這套節奏刻意把 runtime 的角色限制在顯示與接續。真正的工作狀態仍應放在 issue、PR、task file 或 repository instructions。否則 Herdr server 重啟、主機維護或人員交接時，唯一的工作脈絡仍被困在某個 pane 的 scrollback。

> [!TIP]
> **先把「不用再主動巡邏哪個 Agent」當成導入指標。**如果 Herdr 只讓你更方便地同時盯著八個 pane，它只是更漂亮的 context switching；如果它讓你只在 blocked 或 needs-review 時介入，才是在節省注意力。

## Herdr、tmux 與 Zellij 各自解的是不同問題

| 需求                                             | 先選什麼               | 為什麼                                                                       |
| ------------------------------------------------ | ---------------------- | ---------------------------------------------------------------------------- |
| 保持 shell 在 SSH 斷線後繼續、腳本化管理 session | tmux                   | 成熟、普遍可用，適合 server 與既有操作習慣。                                 |
| 本機分 pane、keyboard-first 工作流已穩定         | Zellij 或既有 terminal | 不要為 agent 標籤替換可用的日常工作流。                                      |
| 多個 coding agent 會頻繁 blocked、done、要求核准 | Herdr                  | 狀態 sidebar 和 session 操作能減少輪詢。                                     |
| agent 在遠端 Linux 主機跑，需從多台裝置接手      | Herdr                  | 把 pane 與 agent 留在遠端主機，再以 remote client attach。                   |
| 需要 diff review、CI gate、權限控管              | repository 與平台控制  | terminal runtime 不應取代 review、CI、branch protection 或 approval policy。 |

這不是功能排行榜。tmux 與 Herdr 都能在 terminal 裡保存並重連工作，但 Herdr 額外賣的是 agent state 和協作介面；[Petronella Technology 在 2026-08-30 的比較](https://petronellatech.com/blog/tmux-vs-cmux-vs-herdr-2026-terminal-multiplexer-comparison/)也把它和 macOS-only 的 cmux、成熟 server 導向的 tmux 分開討論。選擇應從 session 位於哪裡、誰要接手、是否真的有多個等待事件開始，而不是從 star 數或 pane 數量開始。

## 把狀態列當成 review queue 的入口，不是完成宣告

Herdr 可以顯示 agent 是 `working`、`blocked`、`done` 或 `idle`。這些是操作狀態，適合決定下一眼看哪個 pane；它們不是產品狀態。

一個最小工作流只要補上兩個 runtime 不會替你提供的狀態：`needs-review` 與 `accepted`。前者要附上 diff、測試結果和已知風險，後者才表示 CI 與需要的人類核准已通過。本站的[多 Agent 工作台不是多開終端](/blog/multi-agent-workstation-control-plane/)更完整說明了為何 process state 與驗收 state 必須分開。

```yaml
task: 修正付款重試的 timeout regression
runtime_state: done
needs_review:
  evidence:
    - pnpm test -- payments/retry
    - regression test: timeout 後只能送出一次補償請求
  risk:
    - 尚未在 staging 驗證第三方 payment gateway
stop_when:
  - CI 失敗
  - 需要改動付款權限或正式環境設定
accepted_when:
  - required checks 通過
  - reviewer 核准風險與 rollout
```

這份契約的目的不是讓每個小修正變成流程專案，而是禁止 `done` 偷渡成「可以合併」。runtime 負責把等待的人找出來，repository 的測試與審查機制才決定能不能往下一步走。

## 使用者踩到的坑，比功能表更值得先測

近期討論沒有給出「Herdr 一定比較快」的結論，反而留下幾個值得在導入前驗證的限制。

第一個是 TUI 疊加。r/ClaudeCode 一位 Windows／WSL 使用者原本以虛擬桌面管理多個 terminal 與 VS Code instance；改用 Herdr 後，碰到 rendering、scrolling、hotkey 與 fish autosuggestion 偶爾失效。這不是小問題，因為 coding agent 本身已經是複雜 TUI，再加一層 multiplexer，外面還有 shell plugin，三者可能同時重畫同一個 screen buffer。若你的日常依賴 mouse selection、複雜 prompt、圖片協定或特殊 shell completion，先用實際 repository 跑一天，不要只看 demo。

第二個是完整 reboot 不等於 detach。社群回覆很精準地區分了兩件事：關閉 terminal client 或網路中斷時，background server 可以保留 PTY 與 shell；整台主機重開時，process 本身已經消失。Herdr 可以恢復 workspace 與提供 resume path，卻不能把未保存的 process 記憶體復活。對長任務而言，真正的復原策略仍是可重跑的 task、checkpoint、commit、log 與輸入資料，而不是期待 terminal session 永生。

第三個是人類注意力仍有上限。該討論裡有人說自己超過兩三個 session 就開始 context switching，也有人主張 orchestrator 能讓人管理更多 agent。兩者並不衝突：能並行執行的 session 數，可以遠大於能被人同時理解的 session 數。Herdr 的價值是把前者壓縮成後者的 exception queue，而不是要求人同時閱讀更多文字。

## 先用兩條工作線做一次可撤回的實驗

不要從十個 agent 開始。挑一個 repository、兩項低風險且不互相覆寫的任務，保留既有 CI，連續使用一週。

1. 每個 task 都寫一行 goal、一行 evidence 與一個 stop rule。
2. 只有兩個任務真的可能改到相同檔案時，才用 `git worktree` 分開 checkout。
3. agent 顯示 `done` 後，一律轉成 `needs-review`，而不是直接 merge。
4. 記錄三個數字：人類輪詢 session 的次數、等待 review 的時間、因為缺少脈絡而重做的次數。
5. 若這些數字沒有下降，就移除 Herdr，回到原本的 tmux 或 Zellij 工作流。

這是明確的停止規則。Herdr 的導入成本不是安裝一個 Rust binary，而是你是否真的改變了人類如何接收、排序與驗收 agent 的工作。若答案是否定的，最好的 agent runtime 就是不新增一個 runtime。

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

第一週只保留一個 implementation agent 和一個 review agent，不要為了填滿畫面再加 research、planner、QA 等角色。implementation 完成後，review agent 的輸入只拿 diff、任務契約與測試結果；它不應直接接管同一個工作樹修改程式。若需要遠端執行，再把整個 workspace 放到一台已設好 SSH key、更新與最小權限帳號的主機，從本機以 `herdr --remote` attach。

一週結束時，回頭回答三題：我少切了多少次 terminal？我有沒有更快發現真正需要核准的工作？主機或 session 中斷後，下一步是否仍能從 repository 找到？前兩題沒有改善、第三題又做不到，就不要把 Herdr 留在日常路徑。這比「我同時開了幾個 agent」更能判斷它是否真的適合你。

## 延伸閱讀

- [Herdr 官方網站](https://herdr.dev/)
- [Herdr 官方 GitHub](https://github.com/herdrdev/herdr)
- [coles.codes：herdr vs cmux, after two months on each](https://www.coles.codes/posts/herdr-vs-cmux/)
- [r/ClaudeCode：Herdr, cmux, tmux... are they really that helpful?](https://www.reddit.com/r/ClaudeCode/comments/1v8lk76/herdr_cmux_tmux_are_they_really_that_helpful/)
- [多 Agent 工作台不是多開終端：先設計注意力、隔離與權限](/blog/multi-agent-workstation-control-plane/)
