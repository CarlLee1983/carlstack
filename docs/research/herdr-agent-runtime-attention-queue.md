# Herdr 與 Agent Runtime 的近期研究

- 研究日期：2026-09-08
- 研究範圍：2026-08-09 至 2026-09-08 的文章與公開社群討論；另以 2026-07 至 2026-08 的實測補足較早但具體的工作流經驗。

## 可安全引用的事實

| 主張                                                                                                                                                 | 來源                                                                                                                                                                                                                                                                  | 限制                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Herdr 是 terminal-native 的 agent runtime／multiplexer，提供 pane、workspace、detach／reattach、SSH remote attach 與 agent 狀態。                    | [Herdr 官方網站](https://herdr.dev/)、[官方 GitHub](https://github.com/herdrdev/herdr)                                                                                                                                                                                | 功能仍快速演進，不能視為長期不變的規格。   |
| Herdr 讓人從遠端主機 attach，對長時間 agent 與跨裝置操作特別有吸引力。                                                                               | [Baochun Li，2026-07-09](https://baochun.org/2026-07-09/)、[coles.codes，2026-08-02](https://www.coles.codes/posts/herdr-vs-cmux/)                                                                                                                                    | 兩者是個人實測，不是控制效能實驗。         |
| tmux、cmux、Herdr 的選擇主要由執行位置與平台決定：tmux 的成熟 server 工作流、cmux 的 macOS 原生 UI、Herdr 的跨平台 terminal-first agent 狀態與協作。 | [Petronella Technology，2026-08-30](https://petronellatech.com/blog/tmux-vs-cmux-vs-herdr-2026-terminal-multiplexer-comparison/)                                                                                                                                      | 文章含作者評估，本文只用作架構取捨的材料。 |
| Herdr 的 runtime 方向來自 pane identity、lifecycle state、PTY ownership、agent resume，但 state 仍可能來自 terminal screen 解讀。                    | [Goga Koreli，2026-08](https://gkoreli.com/oss-radar-04-the-agent-multiplexer-is-becoming-a-runtime)                                                                                                                                                                  | 不可將 `done` 寫成需求已驗收。             |
| 社群同時回報遠端接續、cross-agent interaction 的好處，以及 Windows／WSL 下重繪、捲動、hotkey 與 shell plugin 的問題。                                | [r/ClaudeCode，2026-07-28](https://www.reddit.com/r/ClaudeCode/comments/1v8lk76/herdr_cmux_tmux_are_they_really_that_helpful/)、[r/opencodeCLI，2026-08-14](https://www.reddit.com/r/opencodeCLI/comments/1voar29/been_trying_herdr_but_still_prefer_zellij_what_am/) | 個別使用者經驗，不可泛化成平台保證。       |

## 研究限制

last30days 引擎本次未取得可用的 Reddit、HN、GitHub、Digg、Techmeme 與 Polymarket 結果，因此不能聲稱這些平台沒有近月討論。本文的社群觀察只以可公開查核的 Reddit 討論與具日期的獨立實測為基礎。

## 文章角度

不要把 Herdr 寫成「更好的 tmux」。本文主張：當問題從開啟終端，變成辨識哪個 agent 正在等待人、跨裝置接續哪個 session、以及如何讓等待中的工作進入 review queue 時，才需要 agent-aware runtime。若只有兩三條本機工作線，先維持既有 tmux／Zellij 與 CI 即可。
