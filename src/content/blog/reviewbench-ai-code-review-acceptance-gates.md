---
title: "ReviewBench 把 AI 審查拆成兩筆帳：重大漏報與無效評論"
description: "從 GitHub 2026 年 10 月推出的 ReviewBench，核對 219 個 PR 的公開資料、grounded 與 augmented 指標及 LLM grader 限制，再把它轉成團隊可執行的 reviewer 驗收流程。"
publishDate: 2026-10-06T10:11:20+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 開源專案
series: AI Agent 工程化與工作流實戰
seriesOrder: 65
repositoryUrl: https://github.com/review-bench/ReviewBench
cover: ../../assets/covers/reviewbench-ai-code-review-acceptance-gates.png
coverAlt: "深藍與橘色版畫中，工程師提燈檢查石橋中央的裂縫，燈旁飛蛾象徵干擾訊號；畫面對照值得攔下的結構缺陷與消耗注意力的雜訊。"
---

一個 AI reviewer 留下十二則評論，八則被判定有用，能不能交給它擋住高風險 PR？還缺一個問題：它沒說出口的那些問題，有多嚴重？

GitHub 在 [2026 年 10 月 5 日公開 ReviewBench research preview](https://github.blog/ai-and-ml/github-copilot/reviewbench-an-open-benchmark-for-ai-code-review/)，把 AI code review 的評估拆成已知問題覆蓋率、評論有效率與新增發現。這個進展值得關注：團隊終於有一組公開 PR、標記與評分工具，可以檢查 reviewer 的取捨，而不只播放一段成功找 bug 的示範。

我的判斷是，選 reviewer 時應把重大漏報與無效評論分開驗收。前者決定它能接下多少風險，後者決定工程師是否還願意讀它的留言。總分只能輔助排序，無法替團隊決定哪一種失敗可以接受。

> [!NOTE]
> 本文核對公開文件、程式與資料 manifest，未執行 ReviewBench 樣本、reviewer container 或付費 judge，也沒有重現官方分數。後半段的數值案例及驗收設定是設計範例，並非實測結果。來源鎖定於 2026 年 10 月 6 日查得的 commit `ceb0794a3768da6ef4a56e5311dfb4afd29e5dee`。

## 219 個 PR 提供共同起點，代表性仍要回到自己的工作量

我逐項計算公開 [corpus manifest](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/corpus/manifest.json)，得到 219 個 PR、187 個不同 repository；語言欄位有 19 個具名類別，另有一筆 `unknown`。其中 TypeScript 68 筆、Python 41 筆。這是資料列核對，沒有下載或執行這些 PR 的程式。

GitHub 說明它參考了 1.039 億個 PR 的分布，但刻意提高較有審查內容的中大型變更占比。這項取樣設計、以及對真實工作量的代表性，是官方方法描述；不能從「219」這個數字直接推導出任何公司都適用。[發布說明](https://github.blog/ai-and-ml/github-copilot/reviewbench-an-open-benchmark-for-ai-code-review/)

例如，一個主要維護交易服務的團隊，可能特別在意重試後重複扣款、跨租戶資料洩漏、migration 與舊版應用不相容。公開語料涵蓋很多語言，依然可能缺少這個團隊最昂貴的錯誤。評估時應額外記錄自己的 PR 分布：改動大小、模組、是否跨服務、需要多少業務背景。比對這些欄位，才能知道公開成績有哪些可移植的部分。

我會把 ReviewBench 當成共同外部測試，再用內部案例回答採用問題。兩份結果並列保存，避免調到公開題庫進步，卻把自家最難的變更留在測試之外。

## Grounded precision 的分母，不是 reviewer 的全部評論

ReviewBench 的 golden set 同時保留已判定有效與無效的 finding。它先比對候選評論是否指向既有問題；尚未配對的評論，另交 classifier 判斷。依 [評分方法第 7 節](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/docs/METHODOLOGY.md#7-scoring)：

- **Grounded precision** 只算成功配對的候選評論，有效配對數除以配對總數；未配對評論不進分母
- Grounded recall 看已知有效問題被覆蓋多少，同一問題不因重複評論多算
- Augmented precision 把未配對評論的判定也納入，分母才是全部候選評論
- Augmented recall 把新判定有效的發現加進分子及分母，因此每個 reviewer 的分母可能不同

下面用一份自行設計的單一 PR 帳本，把差異算清楚。假設沒有重複評論或多對多配對：

```yaml
# 教學用數值，不是 ReviewBench 實測輸出
known_valid_issues: 12
known_critical_issues: 3
candidate_comments: 12
matched_valid_comments: 6
matched_invalid_comments: 2
unmatched_comments: 4
unmatched_judged_valid: 1
unmatched_judged_invalid: 3
covered_critical_issues: 1
```

這個 reviewer 的 grounded precision 是 `6 / 8 = 75%`。如果有人把它報成「十二則評論有四分之三值得處理」，就換錯分母了。納入未配對評論後，augmented precision 是 `7 / 12 ≈ 58.3%`。

已知問題的 grounded recall 是 `6 / 12 = 50%`；augmented recall 是 `7 / 13 ≈ 53.8%`。對部署決策更刺眼的數字則是重大問題只抓到 `1 / 3`。即使再增加幾則正確的低風險建議，也不會補回那兩個重大漏報。

因此，我會要求評估報告同時列出高風險切片的分子與分母、全部評論的有效率，以及未配對評論數。只提供一個 precision 百分比，連它把哪些留言排除都無法判斷，還不足以做採用決策。

## 96.6% 一致度不能推成「重大風險判斷準確率」

官方 [方法文件第 5.4 節](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/docs/METHODOLOGY.md#54-corpus-labeling)報告：TP/FP 判斷與人類標記的一致度是 96.6%；嚴重程度在三個等級中完全一致的比例為 62.9%，容許相差一級時則為 98.7%。這些都是官方稽核結果，本文沒有重新驗證。

這個區別直接影響 gate。假設團隊規定「所有重大權限漏洞都必須被抓到」，classifier 把重大判成中等，就可能改變 gate 的分母。評論是否有效、危害多大，是兩項需要分別校準的判斷。

另外，[公開 classifier prompt](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/scripts/classifier/prompts.ts)把正確、相關且具體的既有問題也視為可能的 TP；是否由這次 PR 引入另記為 scope。它也允許有具體專案慣例依據的低嚴重度命名建議成立。換句話說，官方「有用」的範圍，可能比你的合併阻擋規則寬。

我的驗收建議是把兩個欄位分開：`valid_finding` 回答評論有沒有根據，`blocks_merge` 回答這次變更是否必須處理。前者可以由校準過的 grader 協助，後者仍需團隊明確定義影響程度、PR 範圍與責任人。

對高風險案例，讓兩位熟悉模組的人先各自判定，再處理分歧；不要一開始就把模型答案放在旁邊。新增發現若足以改變採用決策，也應回到程式、觸發條件及反例人工複核。這樣留下的分歧，比一個漂亮的平均一致度更能改善本地驗收標準。

## Runner 跑完、judge 給分與正式榜單，是三種不同證據

公開工件已足以分辨這三個階段，實作時不該把它們混成「benchmark 通過」。

### Adapter 能否完成工作

[Agent contract](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/AGENT_CONTRACT.md)規定每個 PR 啟動全新 container，提供固定 base/head、diff 與 metadata，輸出帶檔案、行號及訊息的 JSON。空的 findings 可以是成功結果；缺檔、格式錯誤或 head 不一致則屬執行失敗。

[`try-agent.sh`](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/scripts/try-agent.sh)檢查上述執行與輸出條件，本身不評分。工程上應先把「有完成審查但沒找到問題」和「根本沒完成」分開，否則 timeout 很容易被誤記成乾淨的 PR。

### 評分結果能否互相比較

[Judging 文件](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/docs/JUDGING.md)提供獨立 CLI：讀入既有 findings，呼叫選定的 LLM 做 matching 與未配對評論分類，再寫出 aggregate 與逐項明細。它不替你產生 reviewer 輸出，且本地結果不能直接當正式榜單成績。

所以每次實驗至少保存 reviewer image digest、模型與 prompt 版本、資料 commit、judge 模型、評分設定，以及逐項 findings。模型升級後只比兩個平均數，很難區分是 reviewer 改善、grader 改變，還是樣本不同。

### 公開排名能否代表上線收益

[官方 README](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/README.md)區分 25 個 PR 的 test set 與 219 個 PR 的 full set，正式 final 會跑三輪。官方列出的目前榜單 judge 是 Claude Sonnet 5；這是 ReviewBench 的配置資訊，不是本文對模型能力的評價。

即使取得正式成績，團隊仍要觀察開發者花多少時間駁回無效評論、哪些重大問題在人類 review 才被發現、失敗與重試如何拖慢等待時間。這些才是從離線品質走到日常工作負擔的證據。

> [!CAUTION]
> 若要自行執行，先審查 runner、container 與網路設定，使用可丟棄環境及受限預算憑證。公開 PR 的程式、安裝腳本與說明文字都應視為不可信輸入。本文只有讀取公開檔案，沒有執行樣本；官方託管環境的隔離承諾，也不能自動套用到你的本機 Docker 設定。

## 自家驗收集要保留「沒有問題」與「不能靠 diff 猜到」的 PR

以下是我建議的起步流程，並非 ReviewBench 的官方門檻，也沒有宣稱特定樣本數足以得出統計結論。

### 用真實分布建立底盤，再增加高風險案例

從近期已完成 review 的 PR 按變更大小與模組抽樣，包含沒有確認缺陷的乾淨變更。若測試集每個 PR 都藏著 bug，reviewer 只要習慣性發出警告，就可能看起來很有產出。

另外保留曾造成事件的變更，恢復到修正前的 snapshot。交易重試、權限邊界、向後相容性等高風險案例可以刻意加重，但須另列切片，不要讓加重後的總分冒充自然流量上的成績。像「每類先收十個案例」只能用來發現缺口，不能拿小樣本上的零漏報宣稱風險已消失。

### 把輸入邊界與答案邊界寫進資料

每個案例都要記錄 reviewer 看得到哪些檔案、設計文件與測試。需要業務規則才能確認的問題，若規則沒有提供，就應標記 context 缺口；不能一面不給資訊，一面要求模型猜對。

修正提交、事後討論和人工答案要放在 evaluator 一側，避免混入 reviewer 的輸入。尤其使用歷史 PR 時，repository history 可能讓答案被間接讀到。這項設計必須檢查實際工具權限，不能只在 prompt 寫「請勿看答案」。

### 用分項停止規則代替加權平均補分

可以從下面這份概念設定討論責任。數值要由團隊預算與風險決定；它不是任何既有工具可直接讀取的設定檔。

```yaml
# 團隊驗收設計範例，非 ReviewBench schema
corpus_revision: internal-review-v1
release_gate:
  curated_critical_cases:
    allowed_new_misses_vs_baseline: 0
    adjudication: two_reviewers_then_owner
  human_review_minutes:
    rule: no_regression_vs_baseline
  invalid_comments_per_pr:
    rule: no_regression_vs_baseline
  incomplete_reviews:
    rule: report_separately_and_block_automatic_approval
report:
  - raw_counts_per_severity_and_module
  - unmatched_findings_and_human_adjudication
  - per_run_scores_and_failure_reasons
  - full_wall_clock_latency_including_retries
```

這裡的「重大案例不得新增漏報」只是對已收錄案例的回歸要求。baseline 本來就漏掉的問題，仍須保留為缺口；沒有進入測試集的風險更不在保證範圍內。若 critical 切片只有三筆，就直接寫 `1 / 3`，不要只秀小數點後兩位的百分比。

接著讓新 reviewer 先做 shadow review：輸出保留給評估，不自動批准合併。比較同一批 PR 的人類處理時間及重大漏報，確認收益後再決定它能在哪些模組發言、哪些 finding 能阻擋 CI。這是團隊自己的上線實驗，需要獨立於公開榜單保存。

## 下一個 PR，留下能被反駁的 finding

[既有的審查紀律文章](/blog/uncle-bob-agentic-discipline-code-review/)討論如何讓需求、測試與架構留下驗收依據；ReviewBench 把問題往前推了一步：連「負責審查的 agent」也需要被驗收。[理解債文章](/blog/answerme-vibe-coding-understanding-debt/)則提醒我們，能產生解說與能確認程式正確，仍有距離。

可以從一個最近的人類 review 案例開始：保存修正前 snapshot，寫出檔案位置、觸發條件、會破壞的行為與可檢查的反例，再把新舊 reviewer 的原始評論放在旁邊。若爭論卡在「這算不算重大」或「這次 PR 應不應該修」，先把判準記下來。

公開 benchmark 給了共同語料與工具。團隊要補上的，是哪些漏報不能接受，以及每則評論值得花掉多少人的注意力。

## 延伸閱讀

若輸入變成外部掃描器送來的漏洞報告，可接著閱讀 [OSS Scanner 的維護者分流契約](/blog/ossscanner-vulnerability-report-triage/)，把重現、重複報告與修補驗收分開記錄。

若審查對象是整套工具的語言重寫，可接著看 [Prime Agent Rust 重寫的行為驗收契約](/blog/prime-agent-rust-rewrite-verification-contract/)，把程式碼審查接到模型請求、協定與副作用的差異測試。
