---
title: "Claude Code 沒遵守 AGENTS.md？先確認檔案真的載入"
description: "Claude Code 2.1.277 至 2.1.280 的部分 session 會在關閉 telemetry 時略過 AGENTS.md。本文拆開版本與設定條件，提供載入檢查、升級與單一來源的替代做法。"
publishDate: 2026-09-25T00:07:33+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
cover: ../../assets/covers/claude-code-agents-md-loading-gate.png
coverAlt: "一張專案指令紙被霧面玻璃擋住，旁邊的開關象徵與本地讀檔無關卻影響載入的遠端條件。"
---

Agent 沒照規則做事時，我們很容易先改 prompt、重寫規則，或懷疑模型不聽話。但在動文字之前，還有一個更基本的問題：這次 session 究竟有沒有讀到規則檔？

[Przemek Szypowiak 在 2026 年 9 月 23 日的實測](https://blog.szypowi.cz/p/claude-code-reads-agents.md-only-when-telemetry-is-on/)指出：Claude Code 2.1.277 宣布支援 `AGENTS.md` 後，在他使用的 2.1.280 環境中，設定 `DISABLE_TELEMETRY=1` 或 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`，會讓原本應被讀取的本地 `AGENTS.md` 消失，且沒有警告。他用只含一個暗號的檔案與兩次 `claude -p` session 對照，並在 bundle 中找到受遠端功能旗標控制的載入路徑。這是作者的實測與逆向觀察，不等於所有版本、供應商與設定都會失敗。

截至 2026 年 9 月 25 日，[Anthropic 官方文件](https://code.claude.com/docs/en/memory#when-agentsmd-support-is-unavailable)已明確寫出範圍：**在 2.1.281 之前，關閉 telemetry 或使用 Amazon Bedrock 等部分 session 可能只讀 `CLAUDE.md`；這些版本應升級。** 原始 [GitHub issue #95690](https://github.com/anthropics/claude-code/issues/95690) 仍列為 open；issue 狀態不能推翻文件中的版本修正說明，也不能證明所有環境已無問題。

## 先排除預期行為，再查版本

`AGENTS.md` 沒進 context 不一定是這個 bug。Claude Code 的預設是「`CLAUDE.md` 或 `AGENTS.md` 擇一」：若工作目錄或上層已有 `CLAUDE.md`、`.claude/CLAUDE.md` 或 `CLAUDE.local.md`，它會優先讀這些檔案。`/config` 中若選了 `claude-md` 或 `managed-only`，也不會按預設讀 `AGENTS.md`。內建 `agents-md` plugin 被停用時，同樣無法直接載入。[Anthropic：AGENTS.md 載入規則](https://code.claude.com/docs/en/memory#agentsmd)

最短的排查順序如下：

1. 在同一個工作目錄執行 `claude --version`；低於 2.1.277 尚未支援直接讀取，2.1.277 至 2.1.280 要特別檢查受影響 session。
2. 檢查目前目錄與上層是否有上述 `CLAUDE.md` 檔案，再到 `/config` 看 Project instructions 設定。
3. 開新 session 執行 `/memory`，確認清單列出預期的 `AGENTS.md` 路徑。官方註明 2.1.280 之前 `/memory` 與 `/context` 即使已載入也可能不列出該檔，因此舊版不能單靠清單缺席下結論。[Anthropic：My AGENTS.md isn't loading](https://code.claude.com/docs/en/memory#my-agentsmd-isnt-loading)

這個順序先問「檔案是否進入 session」，再問「模型是否遵守內容」，可避免把載入故障誤當成 prompt 品質問題。

## 用最小 canary 分辨載入與遵從

如果版本或設定仍有疑問，可在**新建的空目錄**做隔離測試，避免其他專案指令混入。以下沿用原作者的測試概念；暗號只是載入訊號，不代表模型會遵守所有複雜規則。

```sh
mkdir /tmp/claude-agents-canary
cd /tmp/claude-agents-canary
printf 'The canary word is PERIWINKLE.\n' > AGENTS.md
claude -p 'What is the canary word from the project instructions? Answer NONE if you have none. Do not read files.'
```

固定 Claude Code 版本與目錄，只改要測的環境變數，並以新 session 重跑。原作者指出新設定的第一次 session 可能只取得旗標，第二次才反映結果；因此單次回答不足以判斷。這個測試仍只是黑箱觀察，若回答與預期不同，應連同版本、Project instructions、`/memory` 載入清單與環境條件一起記錄，不要只憑一句輸出推斷內部原因。[原作者的測試方法](https://blog.szypowi.cz/p/claude-code-reads-agents.md-only-when-telemetry-is-on/#how-i-tested-it)

## 修正時保留同一份規則

對 2.1.277 至 2.1.280 的受影響環境，先升到 2.1.281 或更新版本，再用 `/memory` 與 canary 驗證。若暫時不能升級、專案本來就有 `CLAUDE.md`，或刻意使用只讀 `CLAUDE.md` 的設定，可在與 `AGENTS.md` 同層的 `CLAUDE.md` 寫入：

```markdown
@AGENTS.md
```

這是 [Anthropic 官方文件建議的 import 方式](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools)。Claude Code 會沿 import 讀取原檔，規則只需維護一份。不要把 `AGENTS.md` 全文複製成第二份長期維護的 `CLAUDE.md`；兩份內容一旦分歧，下一次故障又會變成「規則是否過期」的問題。

我的判斷是：**專案指令的驗收要包含「載入證據」，不能只看檔案存在或模型最後是否照做。** 先在團隊實際使用的版本、供應商與隱私設定下驗證一次；接著才討論規則是否寫得清楚。關於規則內容如何刪減、分層與維護，可接著看本站的[〈AGENTS.md 不是越長越好〉](/blog/claude-code-self-driving-workflows/)。
