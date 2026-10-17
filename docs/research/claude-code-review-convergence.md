# Claude Code 審查收斂：來源與發布查核

查核日期：2026-10-18（Asia/Taipei）。基底 main：44409301aff578fce91a429edda4aac3af8ffc9e。

## 去重與範圍

正規化來源：https://claude.dev/blog/solving-code-review-at-anthropic/

作者：Addy Osmani、Morgan Westlee Lunt、Qing Wang。事件／文章日期：2026-10-15。以 URL、slug、作者及 code-review／審查收斂搜尋 blog、research、queue，沒有同來源文章。Trail 未安裝且無可用 cache，使用完整搜尋。既有 HydraFusion 討論異質模型編排，本篇聚焦 finding 證據與審查終止條件，讀者收穫不同。未引用該舊文的未精確來源結論。

系列：AI Agent 工程化與工作流實戰 89。main 最高 88；與父任務協調使用正式連續 89。先前取消未發布稿若恢復，必須按屆時 main 重編；本次不接觸取消稿。

## 來源與段落

1. 原文全文已閱讀，精確章節 https://claude.dev/blog/solving-code-review-at-anthropic/#how-we-make-the-reviewer-better ：記載 more than fifty rounds、After three rounds、Diff-only re-review、No repeats of findings already posted。本文只簡述超過五十輪事件、收斂措施、人工批准邊界；不搬運整篇架構或圖表，不引用內部量化成果為普遍效果。
2. https://code.claude.com/docs/en/code-review — What a review can access：託管 reviewer 讀取 diff／周邊程式，不 build/run；本文「公開產品與流程差異」段。規格以查核日為準。
3. https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue — latest target + queued PR 組合、merge_group 事件；本文精確版本與整合驗證段。

退款 PR、finding 欄位、三輪交棒起始規則、小樣本驗證與錯誤退款補償討論均為原創教學案例／工程建議，明確非實測，沒有私有專案資訊。沒有可執行程式碼或聲稱已跑的壓測。

## 封面

相鄰封面檢視：ambition 是深藍橘色橋樑立體紙雕；license 是酒紅平面蓋章場景。本篇選森林綠／米色、俯視環形軌道、網版墨線插畫，差異在隱喻、構圖、配色、媒材。使用正式 image_gen 工具，原創圖，無文字／logo；1672×941 WebP，全尺寸與480×270卡片預覽已檢視。封面是象徵圖，不是精確控制流程，本文不另外加入冗餘流程圖。

Prompt: Original wide editorial illustration of an oval railway carrying blank paper tickets, a switch diverts one ticket toward an inspection desk; screenprint/ink, ivory, forest green, ochre; no text or logos.

## 驗收

鎖定依賴安裝使用 pnpm 12.1.0、Node 24.19.0（符合 >=22.13）。最後檔案須通過 format、content:policy、check（含 build）、test，並核對 RSS、Sitemap、Pagefind、系列。精確結果以本次執行紀錄及 main 部署為準。

原創封面全尺寸與卡片已目視。雲端 Chromium 正常啟動失敗：socket() failed: Operation not permitted；未停用 sandbox 或繞過限制。因此桌機／手機與深淺色實頁目視未完成，依使用者已授權的預覽例外發布；不把通用測試當本篇目視。
