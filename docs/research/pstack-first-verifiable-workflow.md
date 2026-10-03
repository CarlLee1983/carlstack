# pstack 導入實務：來源與驗收研究

查核：2026-10-03。本文只讀原始檔與文件，未安裝或執行 pstack／skills CLI，沒有生產力或成功率實測。

## 去重與新文理由

先搜尋 src/content/blog、docs/research、docs/article-queue.md 中的 pstack、cursor/plugins、backnotprop/pstack、作者與既有來源 ID。

- agent-work-requires-verifiable-codebase：訪談、可驗收環境、糾正落點與交付權限。
- plan-with-code-prototype-over-plan-mode：0.15.5 時點的原型、型別草圖與規劃。
- 新文 pstack-first-verifiable-workflow：依 2026-10-03 後續要求，以 Cursor 官方版為主，整理安裝、模型規則／新對話啟用、專案工具前提、第一個 local-only bug fix 與驗收紀錄。mirror 僅留版本差異備註，不列安裝操作。讀者下一步與前兩篇不同，建立新 URL 並互相連結。

## 版本與一手來源

- Cursor upstream：[README](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/README.md)，commit 23e4138daa01c42d4969f7a5465f82704e64f798（2026-10-03T04:37:34Z），[manifest](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/.cursor-plugin/plugin.json) 0.15.6。
- Standalone mirror：[README](https://github.com/backnotprop/pstack/blob/157aae39a733135e93d8b5b19ff62c6a84b0ad56/README.md)、[MIRROR.md](https://github.com/backnotprop/pstack/blob/157aae39a733135e93d8b5b19ff62c6a84b0ad56/MIRROR.md)，commit 157aae39a733135e93d8b5b19ff62c6a84b0ad56（2026-09-14T15:57:09Z），[manifest](https://github.com/backnotprop/pstack/blob/157aae39a733135e93d8b5b19ff62c6a84b0ad56/.cursor-plugin/plugin.json) 0.15.2。它是有 harness-neutral 改寫的獨立 mirror，不是 redirect 或即時完全同步副本。
- [skills CLI manifest](https://github.com/vercel-labs/skills/blob/18f96ea131dab3b0fcc9b27cf7c6f6cbb6174680/package.json)：查核版本 1.7.0，Node engines >=22.20.0；正式文只要求依當次 engines 查核，不稱作 pstack 通用最低版本。

## 採用的重要事實

- Cursor README 提供對話命令 /add-plugin pstack，然後 /setup-pstack，開新 session 載入模型規則，再以 /poteto-mode 啟動任務。
- mirror README 提供終端 npx skills add backnotprop/pstack。npx 會執行外部安裝器；不稱作純靜態檢視或 pstack executable。
- setup 上游寫 ~/.cursor/rules/pstack-models.mdc；mirror 的非 Cursor 分支寫 ~/.agents/pstack-models.md。reasoning budget 是推理強度，不是硬性金額上限。模型標識需由實際宿主驗證。
- poteto-mode 為入口，playbook 為參考流程，skill 與 principles 另有依賴。安裝 Markdown 不提供缺少的工具、模型、憑證或子代理能力。
- control-cli／control-ui 隨 cursor-team-kit，不在 pstack bundle。
- [bug-fix](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/skills/poteto-mode/playbooks/bug-fix.md)：先 runtime repro、確認機制、設計實作，再回相同操作面驗收；cheap local path 存在才採 regression-first。預設後段可包含 PR，所以示例明確限制 local-only。
- [create-verification-skill](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/skills/create-verification-skill/SKILL.md)：從 repository 找啟動、就緒、操作、證據與隔離；Launch/Doctor/Drive/Evidence/Cleanup 完整跑一次一個功能，清理後證據仍存；不能把 broken checkout 當正常基底。
- [maintain-verification-skill](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/skills/maintain-verification-skill/SKILL.md)：source 與 live 覆蓋，改動只限驗證技能目錄，產品回歸回報而非順手修改。
- 官方 0.15.6 poteto-mode Autonomy 對可回復外部動作相當寬鬆；正式文引用官方版本，並提出宿主工具權限限制建議。不把 prompt 當成權限防線。

## 作者建議與未做之事

CLI 取消／重啟案例、local-only 任務模板、adoption_record YAML 與先做第二個相似任務，均為採用建議與假設示例。沒有替 Carl 的專案發現此 bug，也沒有安裝 pstack、啟動模型 panel 或宣稱效益。

未重複前文的 PR 產量／訪談／overnight 敘事；未列跨版本通用技能總數或模型預設；沒有附未核對的 SHA 安裝語法。

## 封面方向

相鄰封面分別為白底陶瓷環攝影、深色織布機攝影、黃光炭筆線稿。新封面採鈷藍／朱紅的俯視 gouache／screenprint 工具桌，中央單件治具、左側替換頭、右側驗收樣本；媒材、構圖、主色與光影均與相鄰作品不同。原創生成，無文字品牌。已檢視原尺寸 1672×941 與 360px 卡片。
