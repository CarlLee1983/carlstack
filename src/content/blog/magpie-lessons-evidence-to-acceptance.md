---
title: "Magpie 的錯題本：讓 Agent 復盤改變下一次驗收"
description: "查核 Magpie 的 LESSONS.md、code standards 與 PR #1339，拆解教訓升級、回退測試、未驗證項目和合併版本紀錄，並說明文件規則如何接上真正會阻擋錯誤的檢查。"
publishDate: 2026-10-13T16:38:53+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
series: AI Agent 工程化與工作流實戰
seriesOrder: 85
repositoryUrl: https://github.com/yetone/magpie
cover: ../../assets/covers/magpie-lessons-evidence-to-acceptance.webp
coverAlt: "深色版畫中的三份證據頁帶著紅色斷裂圓環，右側規則冊印上修復後的青綠圓環，象徵重複教訓被整理為驗收標準。"
---

Agent 修完一個 bug，下一個版本又收到相似回報。你把「先重現使用者的案例」寫進對話，它當下照做；換一個 session，同樣的提醒又得講一次。這次糾正沒有進入下一次工作的驗收條件。

@wquguru 在 [2026 年 10 月 12 日的貼文](https://x.com/wquguru/status/2109650264601117141)（台北時間）連到長文[〈yetone 的魔法：magpie 是怎么让 AI 自己维护项目的〉](https://x.com/i/article/2109642412037476352)。他分析 Magpie 的提交、發版與工程文件，將 `AGENTS.md` 比成路由表、`LESSONS.md` 比成錯題本。Magpie 是一個供不同 coding agent 共用的本地模型 gateway；我關心的是它如何保存返工經驗，讓審查能追問「這次真的驗過了嗎」。

以下查核固定在 [Magpie 提交 `41972b25`](https://github.com/yetone/magpie/tree/41972b25fce9769f6d13b9a1888218a62835fe33)，並對照原始 PR 評論。我沒有執行 Magpie、重跑它的測試或驗證供應商整合，也沒有重新計算所有返工，或查完外部 release repository 與私有設定。文中的測試結果都是維護者留下的紀錄，文件規定和實際執行會分開寫。原文的 commit、tag 與星數統計也不能直接換算成品質或生產力，因此不拿發版數當驗收結果。

## 路由文件負責指路，教訓要保留原因與證據

固定版本的 [`CLAUDE.md`](https://github.com/yetone/magpie/blob/41972b25fce9769f6d13b9a1888218a62835fe33/CLAUDE.md)只有兩個引用：`AGENTS.md` 和 `LESSONS.md`。[`AGENTS.md`](https://github.com/yetone/magpie/blob/41972b25fce9769f6d13b9a1888218a62835fe33/AGENTS.md)再把子系統設計、程式規範與社群 PR 審查指向各自的文件，要求改程式前讀取教訓。它在這個版本也包含 subscription 遷移的操作說明，不能概括成「完全沒有規則的純路由表」。

這種組織方式讓不同責任有可定位的入口。規範不必在每份 Agent 設定複製一遍；發現問題時，也比較容易知道應該更新哪一份文件。但引用寫在檔案裡，只能證明專案要求 Agent 讀取，不能證明每次執行都完整讀過並遵守。

[`LESSONS.md`](https://github.com/yetone/magpie/blob/41972b25fce9769f6d13b9a1888218a62835fe33/LESSONS.md)把一則教訓寫成規則、原因與提交／issue 證據。有些項目再附上修正提交或做對的案例。這比一句「不要再犯」多了查核路徑：下一位維護者能回到原始案例，確認規則是在處理哪種失敗。

拿它的重現要求為例，文件記錄 #834 曾反覆回來，每次只修截圖裡的一個 Agent。它因此要求重現報告者實際使用的 provider、plan、Agent 與 GUI、TUI 或 CLI。可以採用的判斷是，測試輸入與操作介面必須對準回報者的案例，不能用「看起來很像」的替代品宣布修好。

## Seen 3 次是升級訊號，不是品質保證

Magpie 的文件寫明，`Seen` 計算的是不同復盤日期；同一則教訓在三個或更多不同日期被觀察到，就移入 `docs/code-standards.md`。同一天複製三次，或同一個問題開了三個 issue，都不會自動滿額。

我會把它理解成維護者對重複模式的分流：一次案例先保存證據，多日再現表示需要變成每次 review 都檢查的條件。它提供的是升級時機，不能推導成「所有問題都先等三次」。一次資料損毀或權限錯誤，已可能需要立即處理。

固定版本的 `LESSONS.md` 在「Moved to the code standards」之後，仍記錄同類修復漏掉 sibling、只跑部分 suite，以及未實測的功能被發布。**移入規範，代表審查義務提高；不代表已建立自動阻擋。**

如果採用這套方法，每則升級教訓還要補一個具體落點：

```yaml
# 本文建議的紀錄格式，不是 Magpie 的設定檔。
lesson:
  rule: 修復要覆蓋同一原因的所有入口
  evidence: 待填原始 issue、返工與修正提交
  observed_days: [] # 分開記錄日期，避免同一天重複計數
  promoted_to: 待填規範章節
  enforcement: 待填測試、lint 或具體審查項目
  owner: 待填維護者
```

能判定的部分交給工具；需要產品脈絡的部分保留在 review。若只有 `promoted_to`，還要追問下一次什麼結果會真的讓工作停下來。

## 回退測試，驗的是測試有沒有抓到原本的錯

Magpie 的 [`code-standards.md`](https://github.com/yetone/magpie/blob/41972b25fce9769f6d13b9a1888218a62835fe33/docs/code-standards.md#acceptance-criteria)列了六項驗收：缺少修改時會失敗的測試、沙盒測試、build 與 suite、GUI 驗證、可行時的真實使用，以及 UI 規範。對修復尤其重要的是第一項：放回舊程式，新測試要因為目標行為錯誤而失敗；編譯錯誤或 skipped 都不算。

這個條件回答的是「新測試是否能辨認這個 bug」。只看到修改後的綠燈，可能是程式修好了，也可能是測試根本沒走到那條路。回退後的失敗輸出把兩者分開。

在 [PR #1339 的合併前評論](https://github.com/yetone/magpie/pull/1339#issuecomment-6063735313)，維護者記錄：把原本的 `dshCheck` 放回去，`TestDshStoreHoldingAGatewayCallerKey` 會失敗；恢復修改後則通過。評論另有 Break check：刻意讓 `gatewayTakes` 永遠為 true，同一測試會在另一項判斷失敗，確認它也能辨認不被 gateway 接受的 key。

讀者能從這份紀錄看出測試針對哪個行為、怎麼破壞、失敗在哪裡。Red check 證明原 bug 可被抓到；Break check 再探查相關保障，不等於兩次測試就覆蓋所有風險。

採用時，先在隔離環境對一個穩定的 bug fix 做回退。若失敗只來自環境缺依賴，先修環境；若恢復舊程式仍是綠燈，先查測試是否觀察到正確結果。不要把一次無關的紅燈當成回歸 coverage。

## Not run 要保留，交付範圍也要跟著收窄

同一則 #1339 評論記錄了 Linux Docker、macOS 測試與 Linux／Windows vet，也明寫沒有跑真實的 dsh desktop app。這讓讀者知道它驗證了什麼，以及哪些使用情境還沒有證據。

Magpie 規範的要求更進一步：如果真實檢查做不到，要說明；沒有試過的整合不能當成已可用的基礎繼續建置，也不能向使用者宣稱能用。

對自己的專案，我會把結果分成三句話：

```text
已驗證：操作、平台、輸入與對應提交。
未驗證：缺少什麼環境，以及尚未覆蓋的行為。
可交付：目前能承諾哪個範圍，剩餘驗證由誰接手。
```

真實 provider 驗證應使用獲授權的專用測試帳號與隔離環境，不能為了補綠燈而讀取使用者正在使用的憑證或改動 live config。自動測試使用真實格式的 fixture，也不表示每次都要連上第三方服務。固定版本的 `LESSONS.md` 正好另有一條教訓，要求測試不要載入真實第三方頁面；真實使用驗證與可重跑的離線回歸，各自處理不同問題。

## 驗收紀錄要同時寫 reviewed head 和 tested base

Magpie 規範要求維護者拉取 PR、整合到當前 `main` 後驗證，合併前在評論記錄 head 與檢查結果，並使用 `gh pr merge --match-head-commit` 指定已審過的 head。#1339 評論也記下它先整合到 `238f0d92`，之後 main 更新到 `8df15fd4`，再跑相關 package。

評論留下了整合驗證紀錄，沒有留下實際使用的 merge 命令。我能確認文件要求這個 flag，不能確認該 PR 合併時真的用了它。

[GitHub CLI 文件](https://cli.github.com/manual/gh_pr_merge)將 `--match-head-commit` 定義為合併所需的 PR head SHA。它可以避免 review 後 PR 被推入新修改卻照樣合併，但沒有單獨鎖住 base。若測試的是 head A 加上 main B，合併前 main 已移到 C，PR head 仍是 A，flag 依然可能符合。

因此，我建議驗收紀錄同時保存 reviewed head、tested base，以及實際測試的整合結果。base 更新影響驗證條件時，重新整合並跑相關檢查。多人頻繁合併時，也可以評估 [GitHub merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue)，讓 checks 對準最新 base 與前方排隊的變更。這是我的採用建議，並非宣稱 Magpie 已配置 queue。

## 發版要有完成的驗證，被取消不算通過

`LESSONS.md` 記錄早期推送過快，CI 反覆被下一次 push 取消，並指出有 Linux-only 測試跨多個版本失敗。後來的文件要求，tag 對應的提交，或包含它的後續提交，必須有完成且綠燈的 CI Test run；cancelled 不算 pass。除此之外，tag 要在 `origin/main` 的歷史上，發布物齊全，Latest 指向最高版本。

其中「後續提交也可」是原規範允許的條件。它並不等同於精確的 tagged tree 本身測過；後續提交可能已修掉 tag 裡的問題。如果你的發布契約要求「下載的版本就是驗過的版本」，就應將證據對準那個版本的實際原始碼與 artifact，而不是只檢查某個包含它的後續綠燈。

還要看這些要求由誰強制。查核版本的 [`test.yml`](https://github.com/yetone/magpie/blob/41972b25fce9769f6d13b9a1888218a62835fe33/.github/workflows/test.yml)設定 main 上已開始的 run 不因後續 push 取消。[`release.yml`](https://github.com/yetone/magpie/blob/41972b25fce9769f6d13b9a1888218a62835fe33/.github/workflows/release.yml)由 tag 或手動觸發，交給另一個 release repository 建置，再等待發布資產並鏡像回來。這個主 repository 的 release workflow 沒有直接檢查上述 Test 綠燈條件，外部 release repository 裡有沒有 gate 則看不到。

能確認的是：文件約定、CI 排程與發布檢查不是同一件事。把「打 tag 前要看 CI」寫進規範後，還要確認發布者是否必須交出相符證據，且缺證據時真的不能繼續。

## 下一次復盤，只升級一條能改變驗收的教訓

Magpie 在 [2026 年 10 月 6 日引入 `LESSONS.md` 的提交](https://github.com/yetone/magpie/commit/303819c583c68b80c41f41530fc5c9c78f4429b1)把復盤接到 Agent 的讀取入口。固定版本的 workflow 沒有 `schedule`，而文件描述每晚復盤；這只能說明公開 repository 沒呈現排程入口，無法推斷外部如何觸發，更不能只憑文件認定每天都成功執行。

這套規範也有社群貢獻。[PR #889](https://github.com/yetone/magpie/pull/889)與 [commit `926bcaa3`](https://github.com/yetone/magpie/commit/926bcaa37964bb3f3bfdfe99979fd29e7e6a4c23)將子系統文件與 review 經驗帶進專案，後者明確致謝 Junjie Zhou 在 Discord 提出的規則。共同標準來自實際審查累積，並非只靠維護者一次寫出的長提示。

下一次復盤可以先找一個已返工的 bug，留下原始回報、失敗原因、修正提交與一個做對的例子。再決定它應留在教訓、加入 review 清單，還是做成會失敗的測試。完成後，用下一個同類修改檢查這條規則是否真的改變驗收。

若要把能判定的模式做成共同工具，接著讀[多人共用 Agent 工作流，品質規則要做進 Repository](/blog/anti-slop-software-factory-repository-gates/)。Composio 案例從 lint 與快速 CI 談共同標準；Magpie 的錯題本則補上那些標準如何從返工證據長出來，以及為何升級之後仍要追蹤漏檢。
