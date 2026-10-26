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

## 2026-10-27 實質更新

使用者分享 https://x.com/addyosmani/status/2114604912520921136 後要求撰文；正規化移除追蹤參數 s，穩定 ID 2114604912520921136。以原始/正規化 URL、ID、Addy、原文標題與 slug 搜尋 blog/research/queue，確認同一主來源已在本篇，故更新既有 URL，不新增重複文章。main 基底 80406c8e7a8c7ab82ce5e6ae356bda053bd716c0。Trail CLI/cache 不存在，使用檔案完整搜尋。保留 publishDate 2026-10-18、系列89、既有封面與 alt；新增真實更新日。

本次全文重讀原文 https://claude.dev/blog/solving-code-review-at-anthropic/ （作者 Addy Osmani、Morgan Westlee Lunt、Qing Wang；發布2026-10-15），新增來源概念僅短述 CLAUDE.md/REVIEW.md 分工、可信作者較輕審批與敏感路徑額外要求。原文不是10/27新事件。未搬運原文整套流程/表格或圖表、未引述成效數字作普遍保證。

重新完整核對 https://code.claude.com/docs/en/code-review ：託管產品不build/run，Who controls a review指出REVIEW.md來自base/default branch而非PR改動版。新增段落明確區分此產品行為與自製skill，不推定自製工具自帶相同保障。https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue 仍支持原文latest target+queued changes以及merge_group事件說明。

新增退款review規則文字、低行數高影響案例與成對eval皆為原創工程建議，沒有聲稱已跑退款/供應商/LLM eval；不變更專案權限或安裝工具。新增規則示例是純文字，不是可執行程式。封面沿用同文已驗原創圖，無須重新生圖；本次沒有新圖解。正文保留既有標題anchors，repo無指向本頁段落anchor的內鏈。humanize checker已執行，冒號命中為具體欄位/引語/問題而保留，修正一處評論→留言。

最終驗收與正式部署另依本次執行結果記錄。正常預覽若因環境不可用，保留未目視限制，其他必要gates照常執行。

本次使用 Node 24.22.1、pnpm 12.1.0；frozen install 在明確獲准重試後成功，lockfile 未變、711 筆供應鏈政策通過。原始程序未回傳成功狀態，未將部分安裝日誌當成通過；offline 驗證因缺 metadata 失敗，也未停用檢查。Astro 設定目錄使用工作環境可寫的 XDG_CONFIG_HOME，不變更站台設定。

本次正常雲端 dev server 啟動回報「Dev server process exited before becoming ready」，瀏覽器連本機預覽為 ERR_CONNECTION_REFUSED；沒有繞過限制。本次更新的桌機／窄版、深／淺色本機實頁目視未完成，依既有預覽例外執行，其餘必要驗收照常。發布後仍需核對正式頁與既有圖片；原始封面不重製。
