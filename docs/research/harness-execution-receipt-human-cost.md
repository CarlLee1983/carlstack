# CIFAR-10 Harness 執行收據：來源與去重

查核日期：2026-10-12，台北。文章檔案：`src/content/blog/harness-execution-receipt-human-cost.md`。內容已完成，發布者整合封面與最終驗收。

## 來源識別與時間

- 原始網址：https://notesbylex.com/building-an-agent-harness-from-scratch
- 來源 HTML 的 `og:url`、Atom stable ID 對應網址：https://notesbylex.com/building-an-agent-harness-from-scratch.html
- 標題：Building an agent harness from scratch to pass Ian Goodfellow's intelligence test
- 作者：Lex Toumbourou
- Atom：https://notesbylex.com/feeds/all.atom.xml
- Stable ID：`tag:notesbylex.com,2026-10-11:/building-an-agent-harness-from-scratch.html`
- Atom published：2026-10-11T13:50:00+10:00，換算 UTC 03:50、台北 11:50。
- Atom updated：2026-10-11T18:40:00+10:00，換算 UTC 08:40、台北 16:40。
- `.html` 版本在 web fetch 曾失敗，無副檔名版本可讀；另以 curl 取得 HTML 與 Atom，自主閱讀全文與相關程式，未依賴二手摘要。

## 去重與新增價值

基線 `b3ab3e4886f591f4252ad1a617786c9de0506229`。先搜尋 blog、research、article-queue 的原始網址、正規化網址、notesbylex、lextoumbourou、Building an Agent、CIFAR、execution receipt、執行收據，沒有同來源。

相近文章必須承認並連結：

- `harness-engineering-for-reliable-agents.mdx` 已有七控制面及 change receipt，不能再寫泛用收據介紹。
- `decisions-api-routing-calibration-authorization.md` 已談分類／授權界線，本文不重述 API 類型與校準教程。
- `grok-bot-budget-wake-delegation-guardrails.mdx` 已談預算、成本與交付證據，本文不重寫成本公式與派工控制。
- `coding-agent-session-to-task-handoff.md` 已有跨 session 五欄交接；本文聚焦單次訓練產物驗收。
- `haiku55-subagent-accepted-task-cost.md` 已有人工、重試與最終驗收成本；本文不再提供合成價格比較。

決定另立窄題：公開 CIFAR-10 範例提供能逐行查核的新事實，包括每 epoch 看 test、覆寫 checkpoint、公開產物未含權重、成本計數器未涵蓋 Decisions。讀者得到的是權重與評估綁定、介入種類、未知費用的可貼 YAML 與獨立判定，無法只從舊文的一般 change receipt 得到。正文已連向三篇主要舊文；請發布者在該三篇適當位置反向連到新文，尤其 Harness 文「每次執行留一張 change receipt」之後。

## 固定版本一手證據

### Harness

https://github.com/lextoumbourou/notes/blob/4e43198d8f599dc45eb043b8dfe0c82ecfbbf60a/code/agent-harness/harness.py

最後變更 commit：`4e43198d8f599dc45eb043b8dfe0c82ecfbbf60a`，2026-10-11T04:25:54Z。API path commit 查詢與 raw 檔案核對，454 行（GitHub 顯示 374 loc），含註解小於 500 行。

- 四工具為 `read_file`、`write_file`、`search_replace`、`bash`。file helper 的 workspace 限制不等於 bash 限制。
- 第 244–283 行：`classify_tool_call` 直接 `client.decisions.create`，沒有更新 `model.cost`；read_file 略過分類，異常轉 ask。
- 第 283–291 行：`ask_user` 非 TTY／EOF 拒絕。
- 第 334–373 行：`ResponsesModel` 預設 gpt-6-luna，cost 為 Responses input/output token 乘設定單價；不能當供應商已對帳總費用。
- 第 411–435 行：逐輪檢查 max_cost；未再展開成本上限 overshoot 分析，避免離題。
- 原文五案例各四輪相符只是作者小型示範，未寫成安全 benchmark；classifier 不能視為 sandbox。
- 原文 Docker Sandbox、microVM、host proxy 與 placeholder 等細節僅用於理解，不在正文擴寫未必要的架構介紹。
- 原文 `output_items` 與 compaction 保持 call/result 配對的內容未轉成另一篇泛用 API 教程。

### 訓練程式與結果

共同 commit：`5139d7906894cbb9b0fd1df704ed1562d3e56071`，2026-10-11T08:40:48Z，訊息 Link first CIFAR-10 training artifacts。以各檔案 GitHub commits API 核對，並下載固定 commit raw 內容閱讀。

- 程式：https://github.com/lextoumbourou/notes/blob/5139d7906894cbb9b0fd1df704ed1562d3e56071/code/agent-harness/cifar10-first-run/train.py
- 結果：https://github.com/lextoumbourou/notes/blob/5139d7906894cbb9b0fd1df704ed1562d3e56071/code/agent-harness/cifar10-first-run/results.json
- 目錄：https://github.com/lextoumbourou/notes/tree/5139d7906894cbb9b0fd1df704ed1562d3e56071/code/agent-harness/cifar10-first-run

結果記 seed 42、epochs 12、device cpu、heldout_test_images 10000、test_correct 8141、test_accuracy 0.8141、best_epoch_test_accuracy 0.8141。原文另報 50,000 訓練影像、六個 convolutional layer、random initialization；正文沒有需要而省略這些細節。

train.py 第 24–25 行分開 train/test loader；第 28–39 行每個 epoch 訓練後在 no_grad 下跑 test loader，印 test_acc，無條件覆寫同名 checkpoint。因此最後保留 epoch 12，不能誤述為依 best score 選 checkpoint；也不能由此推論作者曾依 test 調參。可見程式沒有使用 test loader 做梯度更新，完整調參歷史則未公開驗證。

GitHub Contents API 在此 commit 列出的目錄只有 `train.py`（3445 bytes）與 `results.json`（1901 bytes）；未包含 `cifar10_model.pt`。這個結論限於指定公開目錄與版本，不宣稱作者沒有在本機產生權重。

## 原文自述與成本範圍

原文 Testing it 章節報告 saved 三檔、最後嘗試約 US$0.0085 model tokens，並自述人工放行資料網域、提示更快下載。重現命令列出 `www.cs.toronto.edu,cave.cs.toronto.edu`。正文僅簡述兩種介入，未虛構分鐘數、完整嘗試次數、總帳單或獨立成功率。

The finished harness 章節明確說 web search 另計，未在 `model.cost`。Decisions 未進此計數器是本文讀程式得到的推論，正文提供固定行號佐證，沒有推導實際分類費用。

## 原創契約與檢查範圍

YAML、三種獨立狀態、checkpoint 重載流程與停止規則均為本文建議，不是來源內建功能。YAML 以 null、false、unknown 起始，不能當作已完成紀錄。`human.events=[]` 只有 `log_complete=true` 後才可能支持無人工介入；有未處理核准則不得宣稱工作完成。`previous_attempt_ids` 用於保留失敗／重試歸因並防止成本重複計算。

不安裝 harness、不執行來源程式、不下載資料集或不可信模型權重、不呼叫模型，不宣稱端到端親測。正式發布者需補封面、核對 publishDate、切換 draft 並跑全套 gate。

## 系列與封面交接

撰寫時 AI Agent 工程化與工作流實戰最大 `seriesOrder` 為 79，本篇採 80。封面路徑 `src/assets/covers/harness-execution-receipt-human-cost.webp` 由發布者製作，已收到生成驗像結果；coverAlt 已依水彩摺頁冊、紫色礦石、雙拼貼及空口袋的實際構圖更新。

## 本次已做檢查

- 僅格式化本文章與本 research；直接執行 repository 已安裝的 Prettier，兩檔 `--check` 通過。原先 `pnpm exec` 因本機 pnpm 11.25.0 與 repository 要求 12.1.0 不合而未能啟動，沒有修改 engines 或安裝套件來繞過。
- 使用 PyYAML 解析 frontmatter 與正文 YAML，確認 draft=true、featured=false、seriesOrder=80，以及未知值／false 預設未被字串化；通過。
- 正文全部站內 blog 連結對應檔案存在；通過。
- `git diff --check` 未報錯；新檔尚未 stage，完整內容 policy 與 build 交由發布者集中執行。
- 沒有 stage、commit 或更動其他文章。發布者已通知三篇主要舊文反向連結完成。

整合補記：三篇舊文已加入反向連結，只加相關閱讀不改舊文日期。內建 imagegen 原創水彩摺頁冊／前斜角／薰衣草鼠尾草米杏／柔日光封面，1672×941 WebP；全尺寸與360×225中央裁切已看，無文字或logo，與同日玻璃／版畫封面不同。正常dev在ready前退出，未完成整頁互動preview，不繞過限制；本文無SVG圖解。
