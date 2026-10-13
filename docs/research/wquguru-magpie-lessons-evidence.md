# Magpie 的教訓、驗收與發布：來源查核

- 查核日期：2026-10-13，Asia/Taipei。
- 主來源：https://x.com/wquguru/status/2109650264601117141
- Tweet ID：2109650264601117141。
- 長文：https://x.com/i/article/2109642412037476352
- Article ID：2109642412037476352。
- 原標題：yetone 的魔法：magpie 是怎么让 AI 自己维护项目的。
- 取得方式：X web 直接讀取失敗，以 https://api.fxtwitter.com/status/2109650264601117141 取得 code 200；使用 article.content.blocks 與 entityMap，保留穩定 ID。
- 貼文時間：2026-10-12T14:19:53Z，台北 10/12 22:19:53。
- GitHub 查核固定 SHA：41972b25fce9769f6d13b9a1888218a62835fe33。
- 正式文章：src/content/blog/magpie-lessons-evidence-to-acceptance.md。

## 去重與系列

研究前搜尋 tweet ID 與作者；取得長文後搜尋 article ID、magpie、yetone、LESSONS.md 與錯題本，沒有既有文章。與 anti-slop-software-factory-repository-gates.md 主題相關但收穫不同：前者論共享工具約束，本文論返工證據如何改變驗收。建立雙向連結；AI Agent 工程化與工作流實戰使用 order 85，接續 order 84。

## 一手證據

以 authenticated gh REST 讀取上述固定 SHA 的 CLAUDE.md、AGENTS.md、LESSONS.md、docs/code-standards.md、.github/workflows/release.yml；scout 另讀 test.yml 和 workflow 列表。

- CLAUDE.md 兩個引用得到確認；當前 AGENTS.md 除路由也有 subscription migration 說明，故不沿用「純路由表、沒有規則」的絕對描述。
- LESSONS.md 規定 Seen 計不同日期，至少三個日期移入 code standards。Moved 章節繼續記載升級後漏做驗收的情形，故升級不是工具保證。
- LESSONS.md 的 nightly review 是專案自述；公開 workflow 無 schedule 不能否定外部排程，也不能證明每天成功執行。
- code-standards.md 六項 acceptance 確認；真實整合不可行時須列明 Not run，未實測不得宣稱可用。本文建議專用測試帳號，不照抄複製 live credentials 的做法。
- 發布規範允許 tagged commit 或包含它的後續 commit 的 Test 綠燈；cancelled 不算。後續綠燈不是 exact tagged tree 驗證，文章明確區分。
- test.yml 不取消 main 的已啟動 run。主 repository release.yml 沒有直接 Test 綠燈檢查，會 dispatch 到 magpie-releases 並等待至少16個資產；外部 repository 與私有設定未完整查核，不能稱整個系統不存在 gate。
- 原文 commit、tag、星數與 OpenClaw 比較不重算、不當品質證據；版本減少不能直接歸因錯題本。

## PR 與提交

- PR1339：https://github.com/yetone/magpie/pull/1339#issuecomment-6063735313 。gh 取得評論：reviewed9bfed616，整合main238f0d92→8df15fd4；Red恢復dshCheck舊程式失敗，Break令gatewayTakes永真亦失敗；LinuxDocker nonroot、macOS與vet有紀錄，Not run realdshdesktop。這是維護者紀錄，本文不重跑。
- PR1339評論沒有實際 merge command；不能宣稱此PR已使用 --match-head-commit，只能確認 code standards 要求該命令。
- https://cli.github.com/manual/gh_pr_merge ：flag檢查PR head，沒有獨立鎖base。採用建議記錄head、base與整合結果。
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue ：queue驗證最新base與前方變更；本文未稱Magpie已配置。
- LESSONS首次引入：https://github.com/yetone/magpie/commit/303819c583c68b80c41f41530fc5c9c78f4429b1 。直接ghREST：author2026-10-05T19:10:21Z、committer19:10:24Z（台北10/6 03:10）。scout connector曾回傳不同時間17:37:48Z，採直接gh metadata，文章只寫日期。
- PR889：https://github.com/yetone/magpie/pull/889 ，社群login junjiezhou1122；提交926bcaa37964bb3f3bfdfe99979fd29e7e6a4c23明確致謝Junjie Zhou onDiscord。Git author仍是yetone，文章不混淆致謝與提交作者。

## 封面矩陣與提示

近期封面為白色工業量規的寫實攝影；本文採錯題證據轉入規則冊、手工版畫、俯視弧形文件布局、炭黑／紅／青綠、沉靜檔案室氣氛，在媒材、構圖、主色與光線上區隔。

內建 imagegen 最終提示：16:9、炭黑背景、三份小證據頁各有紅色斷裂圓環，右側規則冊印修復後青綠完整圓環，金屬書籤串起來源與規則；linocut／screenprint 墨紋，非寫實攝影，無文字、數字、品牌、交叉圖樣或角色。正式封面存於 src/assets/covers/magpie-lessons-evidence-to-acceptance.webp。
