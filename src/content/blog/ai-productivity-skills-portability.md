---
title: "25 個 AI Skills 真的能跨 Claude、ChatGPT 與 Gemini 使用嗎？"
description: "拆解一份 25 個生產力 Skills 清單，釐清 Markdown Prompt、Agent Skill 與跨平台可攜性的差別，並整理把高頻任務做成可驗證 Skill 的最小方法。"
publishDate: 2026-09-01
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
  - 軟體品質
---

一份整理了 25 個用途的 AI Skills 清單，很容易讓人產生一個直覺：把這些 `.md` 檔收藏起來，就能在 Claude、ChatGPT 與 Gemini 之間共用一套生產力外掛。

這個方向只對了一半。

[@nicos_ai 的原文](https://x.com/nicos_ai/status/2053870934965043354?s=12)把 25 個用途分成學習、工作、研究、內容與程式五類，並主張 Markdown 格式可以複製到不同模型使用。作為題目清單，它很完整；但若要變成能被 Agent 自動發現、按需載入、存取參考資料，甚至執行腳本的 Skill，還缺少格式、宿主與驗證三個邊界。

## 先看這 25 個用途在解決什麼

原文的價值不是提供 25 個魔法 Prompt，而是快速盤點哪些重複工作值得被標準化。以下分類依 2026 年 9 月 1 日可見的 X Article 正文整理。

| 分類           | 數量 | 涵蓋用途                                                                         |
| -------------- | ---: | -------------------------------------------------------------------------------- |
| 學習           |    7 | 結構化筆記、考試準備、學習路線、概念解釋、學術寫作、Flashcards、讀書計畫         |
| 工作生產力     |    4 | 專業 Email、會議紀錄、履歷與 LinkedIn、簡報規劃                                  |
| 研究與分析     |    4 | 研究綜整、來源驗證、知識結構化、競品分析                                         |
| 影音與視覺內容 |    3 | 影片腳本、開場 Hook、流程圖                                                      |
| 程式與自動化   |    7 | 程式文件、單元測試、除錯、Regex、Conventional Commits、Code Review、工作流自動化 |

問題是，這些名稱描述的是「任務類型」，不是完成任務所需的完整契約。例如「來源驗證」至少還要定義可接受來源、時效判斷、交叉比對方式、證據不足時的處理與輸出格式；「產生單元測試」則要知道語言、框架、現有測試模式、執行命令與允許修改的範圍。

沒有這些邊界，Skill 只是被取了名字的 Prompt。

## `.md` 不等於 Agent Skill

Markdown 只是文字載體。把一段指令存成 `.md`，再手動貼進任何聊天工具，通常都能當成普通 Prompt 使用；但它不會因此自動取得以下能力：

- 讓宿主依任務內容判斷何時載入；
- 只在需要時讀取完整指令，避免每次佔用 context；
- 一併提供 templates、references、assets 或 scripts；
- 宣告環境、套件、網路或工具需求；
- 受宿主的權限與核准流程控制。

[Agent Skills 開放規格](https://agentskills.io/specification)定義的最小單位是一個目錄，其中必須有 `SKILL.md`。檔案開頭要有 YAML frontmatter，至少包含 `name` 與 `description`；腳本、參考文件與資產則是選配。Anthropic 也已將原先源自 Claude 的 Agent Skills 發布為[跨平台開放標準](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)，所以更精確的說法不是「`.md` 是 Claude 的標準」，而是「符合規格的 Skill 可以被支援 Agent Skills 的宿主重用」。

規格採用 progressive disclosure：Agent 啟動時先看到名稱與描述，判斷任務匹配後才載入完整 `SKILL.md`，需要時再讀其他檔案。這也是 `description` 必須同時說清楚「做什麼」與「何時使用」的原因；它不只是介紹文案，而是路由的一部分。

## 三個平台的「支援」不是同一件事

截至 2026 年 9 月，三個生態系都能使用 Agent Skills，但支援範圍要看產品表面，不能只看模型名稱。

| 宿主                | 原生 Skill 能力                                                                                                                                                        | 不能直接推論的事                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Claude／Claude Code | Agent Skills 的原始實作，支援 `SKILL.md`、參考檔與腳本                                                                                                                 | 任何第三方 Skill 都安全，或所有執行環境都有相同工具                     |
| ChatGPT／Codex      | [OpenAI 官方文件](https://learn.chatgpt.com/docs/build-skills)說明 ChatGPT 與 Codex 以開放 Agent Skills 標準載入工作流；獨立 Skills 與 Plugin 內 Skills 的可用表面不同 | 把本機目錄丟進任意 ChatGPT 對話，就會自動安裝或執行                     |
| Gemini CLI          | [Google 官方文件](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/skills.md)支援 Agent Skills，並掃描 `.gemini/skills/` 與互通用的 `.agents/skills/`    | 一般 Gemini 網頁聊天會自動發現本機 Skill，或 `.md` 會變成 slash command |

Gemini CLI 的持續指令 `GEMINI.md`、Agent Skill 的 `SKILL.md` 與 [`.toml` custom commands](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/custom-commands.md) 是三種不同機制；OpenAI 也區分獨立 Skill 與透過 Plugin 發佈的 Skill。由此可見，模型能理解 Markdown，不代表宿主已完成 discovery、activation、resource access 與 permission handling。

真正的跨平台可攜性應拆成五層：

| 層次                             | 可攜性 | 原因                                       |
| -------------------------------- | ------ | ------------------------------------------ |
| Markdown 工作指令                | 高     | 多數模型都能理解文字規則與輸出格式         |
| `name`、`description`、目錄結構  | 高     | 支援 Agent Skills 開放規格的宿主可共同辨識 |
| references、templates、assets    | 中高   | 檔案可搬移，但路徑、格式與讀取能力仍要測試 |
| Python、Bash、JavaScript scripts | 中低   | 依賴作業系統、runtime、套件與 sandbox 權限 |
| MCP、連接器、核准與發佈方式      | 低     | 工具名稱、帳號權限與安裝表面由宿主決定     |

因此，同一份 Skill 最容易共用的是「任務程序與交付格式」；最難共用的是「如何取得資料、執行程式與產生外部副作用」。

## 25 個用途不必全部做成 Skill

建立 Skill 也有維護成本。先問四個問題：

1. 這個任務是否會重複出現？
2. 每次是否遵循相近的輸入、判斷與輸出？
3. 好壞能否用固定標準檢查？
4. 是否真的需要 references、templates、scripts 或工具？

若只有第一題成立，一段普通 Prompt 或範本通常就夠了。原清單中的「解釋一個複雜概念」、「建立 Regex」或「產生 Hook」常是低頻、輸入差異很大的單次任務，不必急著安裝成 Skill。

相反地，「會議紀錄」、「研究綜整」、「來源驗證」、「競品分析」與「Code Review」較適合 Skill：它們會重複發生，有固定檢查面，也常依賴團隊自己的格式、來源政策或程式規範。

## 從一個最小 Skill 開始

以會議紀錄為例，第一版只需要一個檔案，不必先加 script、資料庫或會議平台連接器：

```text
meeting-notes/
└── SKILL.md
```

```markdown
---
name: meeting-notes
description: 將逐字稿或散亂會議筆記整理為決策、行動項目與待確認問題；收到會議素材並要求整理或追蹤時使用。
---

根據使用者提供的會議素材整理結果。

1. 只記錄素材中有證據的決策與行動。
2. 不要自行推測負責人或期限；缺少時標記「待確認」。
3. 輸出「決策」、「行動項目」、「待確認問題」三節。
4. 每個行動項目包含工作、負責人、期限；未知欄位保留待確認。
```

這份 Skill 的可攜部分是輸入邊界、禁止推測與輸出格式。等實際需求證明需要固定公司範本，再加入 `assets/`；需要從逐字稿 API 取資料時，再接工具。不要在第一版預先建立五層目錄。

## 收藏之前，先做五個測試

不論 Skill 來自社群、公司內部或自己撰寫，至少用以下案例驗證：

| 測試     | 要觀察的行為                                 |
| -------- | -------------------------------------------- |
| 正常觸發 | 符合用途的任務能載入 Skill，輸出符合格式     |
| 不該觸發 | 相似但不同的任務不會誤用 Skill               |
| 缺少輸入 | 不捏造資料，能指出缺少什麼                   |
| 邊界案例 | 空內容、衝突資訊與超出範圍時有明確 fallback  |
| 跨宿主   | 在目標宿主各跑一次，記錄工具、路徑與格式差異 |

若 Skill 含 scripts 或外部連線，還要先審查程式、依賴、檔案讀寫與網路目的地。Anthropic 的[安全說明](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills#security-considerations-when-using-skills)也明確提醒，惡意 Skill 可能造成資料外洩或非預期操作；「只是 Markdown」不是信任理由。

最後再比較一次沒有 Skill 的 baseline。使用相同輸入，記錄格式通過率、事實或來源錯誤、人工修訂次數與完成時間。如果結果沒有更穩定，只是 Prompt 被搬進另一個目錄，就不值得多一項維護負擔。

## 結語：可攜的是工作契約，不是檔案副檔名

這 25 個用途適合當作流程盤點表：先找出真正高頻、規則穩定、能被驗收的工作，再把其中少數做成 Skill。

一份可靠 Skill 的核心不是 `.md`，而是清楚的觸發條件、輸入邊界、工作步驟、交付格式與失敗處理。開放規格讓這份工作契約有機會跨 Claude、ChatGPT／Codex 與 Gemini CLI 重用；宿主相關的工具、權限、腳本與安裝方式，仍要逐一驗證。

與其一次收藏 25 份未測試的指令，不如先把最常重複的一個任務做成最小 Skill，跑過五個案例，再決定下一個是否值得存在。
