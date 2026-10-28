---
title: "ub-mode 把工程紀律寫成 skill，品質門檻還得接進 CI"
description: "拆解 Uncle Bob 的 ub-mode：TDD、小步驗證與三個品質工具各自負責什麼，為何 CRAP 10、重複度 0.8 和 mutation 結果不能直接當成自動放行條件，並用運費修改示範採用方式。"
publishDate: 2026-10-28T07:55:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
series: AI Agent 工程化與工作流實戰
seriesOrder: 102
cover: ../../assets/covers/ub-mode-executable-quality-gates.webp
coverAlt: "攤開的圖形說明冊放在橄欖綠檢查框旁，一塊橘色零件等待量測，呈現規則文件與實際檢查分開的概念。"
repositoryUrl: https://github.com/unclebob/ub-mode
---

把「測試先行、消除重複、降低複雜度」交給 Agent，很容易得到一份工整的完成報告。哪一個命令會在條件不符時真的失敗？誰確認報告對應最後那份程式？

[unclebob/ub-mode](https://github.com/unclebob/ub-mode)值得從這裡讀。它將一組工程習慣整理成 agent skill，並點名配套的複雜度、重複程式與 mutation testing 工具。採用時，Agent 按小步驟做事，可量測的條件則接到專案的驗收流程。

這次於 2026-10-28（臺北時間）查閱 ub-mode 的 README、SKILL.md 與配套工具文件、相關實作。沒有安裝這套 skill、執行三個品質工具或進行模型效能實驗。下方運費案例是設計示例，數字只用來解釋邊界，不是實測成效。

## 一份工作規則，三個需要另外準備的工具

查核版本的 [ub-mode](https://github.com/unclebob/ub-mode/tree/57a8bdd28e45ed41900ace0bafa2ff76dd9ed70f)只有 README.md 與 SKILL.md。README 說明它精簡自部分 poteto-mode／pstack 原則，並把工作分成先完成行為、再整理品質、持續遵守交付習慣。

讀 [SKILL.md](https://github.com/unclebob/ub-mode/blob/57a8bdd28e45ed41900ace0bafa2ff76dd9ed70f/SKILL.md)，最可直接採用的是小步驗證：先看見測試因預期原因失敗，再做最小修改；重構前固定行為，改完重新證明。架構部分則關注領域資料、輸入邊界、冪等與共享狀態。它也允許在無法寫出誠實測試時，不硬塞一個沒有判斷力的測試。

這種整理適合有既存測試、但每次委派仍要重講開發順序的團隊。例如修正 API 的輸入驗證時，先固定錯誤回應，再調整邊界解析，最後檢查重複與複雜度，較容易知道每一步要交什麼。它也把日誌與小份提交納入同一套工作習慣，方便接手的人追查修改理由。

相較於需要先建立完整多階段工作流的導入方式，這份精簡 skill 比較容易用一個修復任務試行。若團隊缺的是需求定義、環境啟動或部署驗收，則要補上那些程序，不能期待這兩份 Markdown 提供整套專案管理。

這些要求仍需要專案提供測試入口、環境與完成條件。單獨複製 Markdown，不會替專案加入 coverage collector、安裝工具或設定 CI。

README 列出的三個品質工具各有責任：

- [crapper](https://github.com/unclebob/crapper)結合函式複雜度與測試覆蓋率，產生 CRAP 指標。
- [dryer](https://github.com/unclebob/dryer)比較正規化後的結構，列出值得審查的重複候選。
- [mutator](https://github.com/unclebob/mutator)修改程式形成變異，再觀察測試能否攔下。

README 另列 [uml-viewer](https://github.com/unclebob/uml-viewer)呈現元件與品質資料。視覺化適合找問題位置，是否阻擋合併仍由專案的檢查契約決定。

## CRAP 低於 10，與工具收到 threshold 10 是兩件事

crapper 的 [README](https://github.com/unclebob/crapper/blob/6fd92c4c9bcc56efb64a2f8743d5a2993bcfd42d/README.md)列出公式：

`CRAP = CC² × (1 − coverage)³ + CC`

CC 是循環複雜度，coverage 在公式中用 0 到 1 表示。假設某函式 CC 為 10，即使覆蓋率是 100%，CRAP 仍等於 10。因此，若採用 ub-mode 的嚴格「低於 10」，只補測試不一定能過，還可能需要調整結構。

另外，查核版本的 crapper CLI 沒有預設 threshold；設定 `--threshold 10` 時，實作以「大於 10」判定失敗，等於 10 仍會通過。這個邊界很適合拿來驗證整合。規則寫 `< 10`，CI 卻接受 `10`，兩邊就沒有對齊。判斷應以[實際 CLI](https://github.com/unclebob/crapper/blob/6fd92c4c9bcc56efb64a2f8743d5a2993bcfd42d/src/crapper/cli.py#L294-L304)為準，不能只看參數名稱。

我的採用建議是先限定變更範圍，讓現有程式留下基線，再決定新增或改動的函式要遵守什麼門檻。若一上來要求整個舊專案清零，這次運費修改很快就會膨脹成無關重構。例外要記下原因、範圍與後續處理人，不能由執行中的 Agent 自行放寬。

低分也不保證需求正確。把一個錯誤計算拆成幾個小函式，指標可能改善，運費仍然算錯。需求驗收必須留在另一組測試裡。

## dryer 的 0.8 是相似度，不是「八成程式都重複」

ub-mode 要求消除分數達 0.8 的重複；[dryer 文件](https://github.com/unclebob/dryer/blob/66ff6d21a42c04afcad89c78a80066176d1294b0/README.md)則把分數定義為結構指紋集合的 Jaccard 相似度，預設回報門檻為 0.82。它不是重複行數百分比，也不是整個專案有多少重複。

這裡有兩個整合問題。第一，沿用預設值會漏掉 skill 想處理的 `0.8 ≤ 分數 < 0.82` 區間。第二，查核版本的 [CLI](https://github.com/unclebob/dryer/blob/66ff6d21a42c04afcad89c78a80066176d1294b0/src/dryer/cli.py#L309-L316) 找到候選後仍正常回傳 0；它的工作是產生報告，沒有因此自動使 CI 失敗。若團隊要阻擋未處理候選，就得另外定義報告解析與審查狀態，而不是只把命令放進 workflow。

是否合併兩段相似程式，則要看它們是不是同一個業務決定。一般商品運費與活動補貼可能暫時有相似算式，未來卻由不同規則改動。硬抽成帶滿旗標的共用函式，可能讓一次活動改價同時影響日常訂單。

可執行的審查問題是：「這兩段應該一起改嗎？」答案是肯定，才抽出共同決定；只是今天長得像，就留下理由。把相似度當成需要解釋的訊號，比要求 Agent 不惜代價消除每一對候選更容易維持業務邊界。

## mutation testing 要辨識缺口，也要控制執行環境

測試跑過一行程式，和測試能抓到那行的錯誤，提供不同證據。假設免運門檻是訂單滿 1,000 元，測試只有 800 元與 1,200 元。把判斷 `>= 1000` 改成 `> 1000`，這兩個案例仍可能通過。加入剛好 1,000 元，才會碰到這個邊界。

這是 mutation testing 能幫忙找出的測試缺口。看到 survivor 後，仍要核對變異是否真的改變需求可觀察的結果、測試是否被執行，以及是否存在等價變異。不能為了讓每一個 survivor 消失，加入依賴內部寫法的脆弱斷言。

[mutator](https://github.com/unclebob/mutator/blob/a5a0cb803b66e0cdb8bf471b3b08af701d424a41/README.md)需要專案的測試命令，且會執行程式。查核的 [runner 實作](https://github.com/unclebob/mutator/blob/a5a0cb803b66e0cdb8bf471b3b08af701d424a41/src/mutator/runner.py)會以 shell 執行自訂字串命令，繼承環境；部分工作目錄內容透過 symlink 指向專案，baseline 也會在原專案執行。**測試工作目錄不能直接當成安全沙箱。**

讀報告時還要留意分母。這版 mutator 的分數以 killed 除以 killed 加 survived 計算，uncovered 不在分母；timeout 與變異造成的編譯失敗也可能算 killed。100% 分數因此不能取代逐項檢查。這些是 [README](https://github.com/unclebob/mutator/blob/a5a0cb803b66e0cdb8bf471b3b08af701d424a41/README.md)與 [workers 實作](https://github.com/unclebob/mutator/blob/a5a0cb803b66e0cdb8bf471b3b08af701d424a41/src/mutator/workers.py)的現行定義，要先了解統計涵蓋什麼，再拿來訂門檻。

因此第一次接入應使用可重建的工作區、測試資料與必要的最小權限，不放正式服務憑證。先確認原始測試本來就通過，再看 mutation 結果。原始測試已經失敗時，後續紅燈無法證明它抓到新注入的缺陷。差分重跑還會保留未變函式的 killed 結果；只改測試或相依程式時，要依驗收範圍決定是否以 `--mutate-all` 完整重跑，避免把舊結果當成新證據。

## 在 TypeScript 與 Laravel 專案，採用範圍不同

三個工具 README 都列出 Clojure、Java、Go、TypeScript、Rust 與 Python，沒有列 PHP。實作的副檔名集合也不完全相同：查核時 crapper、mutator 有 JavaScript 類副檔名，[dryer 的集合](https://github.com/unclebob/dryer/blob/66ff6d21a42c04afcad89c78a80066176d1294b0/src/dryer/discover.py)則沒有 `.js`、`.jsx`、`.mjs`、`.cjs`。TypeScript 專案混放 JS 時，應核對實際掃描清單，別從「支援 TypeScript」推成所有檔案都已分析。

對 Laravel 專案，可以採用小步 TDD、邊界驗證、行為測試等原則，繼續使用既有 PHP 工具鏈。若要換上這些 companion tools，必須先證明它們能處理實際程式與 coverage 格式。空報告、未支援檔案或缺覆蓋資料，都應標成未完成，而不是零缺陷。

安裝方面，ub-mode README 的方式是將 SKILL.md 放入 agent 的 skills 目錄，再以 `/ub-mode` 呼叫。實際目錄、發現機制與呼叫方式要依使用中的 agent 版本確認。可先要求 agent 回報讀到的 skill 路徑與固定版本，再執行一個小任務；「目錄裡有檔案」不等於本次真的載入。

ub-mode 查核版本未附 LICENSE，因此這篇只分析內容並連回原始檔，不把它當作已授予任意再散布權的範本包。複製、修改或對外分發前，應釐清適用的授權條件。

## 用一張運費需求驗收採用結果

假設任務是新增「滿 1,000 元免運」，且其他運費規則不變。我會把第一次試用限縮成下面這張工作單。這是專案採用建議，不是 ub-mode 自帶的指令介面：

1. 固定起始 commit 與工具版本，記下可修改檔案。測試資料只涵蓋虛構訂單。
2. 先保留 999、1,000、1,001 元三個驗收案例，以及原本的運費行為。確認新測試在舊實作上因預期差異失敗。
3. 完成最小修改，再跑完整相關測試。需要重構時分成獨立步驟，每步確認同樣行為。
4. 產生品質報告，核對掃描檔案、coverage 來源及最後 commit。針對複雜度、重複候選與 survivor 寫出處置，不只貼總分。
5. 用已知不合格樣本檢查 gate，例如 CRAP 剛好 10、相似度落在 `0.8 ≤ 分數 < 0.82`，以及缺少邊界測試的變異。驗證的是工具整合是否按團隊規則拒絕，不是在正式程式留下缺陷。

交付紀錄可以保持簡單：修改前後 commit、實際執行命令、退出碼、報告位置、未驗證項目，以及需要人決定的例外。若工具沒有跑起來，就保留未完成狀態。

原 skill 最後包含推送 main line 與清理 worktree 的工作習慣。採用時仍應服從專案既有分支、審查與權限規則；載入 skill 不構成推送主分支或刪除他人未提交工作的授權。

## 下一步是選一個會被攔下的反例

如果專案已有 TDD 規範與 CI，不必再疊一份完整指令才開始。選一個目前靠 reviewer 反覆提醒的問題，從 ub-mode 取出對應原則，接到現有驗收，再故意提供一次不合格輸入。能否被攔住、報告是否說得清楚，比指令檔多了幾條要求更值得記錄。

已有 pstack 的讀者可以接著看[第一個可重跑的修復](/blog/pstack-first-verifiable-workflow/)；要判斷新增 skill 到底有沒有收益，則看[遵循流程與修復品質的分開評估](/blog/agent-skill-adherence-effect-evals/)。這次試用完成後，留下那個可以重跑的反例，再決定是否擴大採用。
