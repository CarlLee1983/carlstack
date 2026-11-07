# 部分退款金額設計查核

日期：2026-11-07（Asia/Taipei）。系統設計每日實戰第 24 課。

## 選題與去重

- 起點 main 為 e9f0d5d9160504ae1f2a975c43fbfe24c01611f0；精確 commit 的部署 workflow 42176634276 為 success。讀取遠端所有分支、近期 commit 與 10 份 open PR，沒有同日同系列稿或待續作分支。
- 系列現有 1–23 連續。搜尋 blog、research 與 queue 的部分退款、折扣分攤、discount allocation、largest remainder，沒有已發同題。第 12 課明示尚未加入折扣，第 6 課只處理全額退款；本篇延伸成交快照的逐件金額與部分退款責任，不重寫既有 worker 接手協定。
- 讀取 AGENTS、content-guide、content schema、CI/deploy workflow、diagram-guide、carlstack-copywriting 與 humanize-writing（zh-tw 及 narrative-zh-tw）。Trail 執行檔與 .trail/cache/INDEX.md 不存在，使用 repository 檔案查核。標題遵循最新明確方向，直接說明主題，不塞結論或難懂術語。
- queue 兩項多活與共識題沒有變更。沒有新側欄對話；在獨立 checkout 完成。

## 一手來源與適用範圍

- https://docs.stripe.com/api/refunds/create ：多次部分退款、退款額為正整數最小單位，總額不得超過未退金額。供應商不決定商品折扣如何分攤。
- https://docs.stripe.com/currencies ：付款金額使用 minor unit，零位小數及特殊幣別有額外規則；TWD 的付款與 payout 精度不同。本篇只用兩位小數的 TWD 付款例，不把它推廣成所有供應商。
- https://dev.mysql.com/doc/refman/8.4/en/precision-math.html ：精確值運算、DECIMAL、溢位與 SQL mode；文章另外要求應用中間乘積檢查。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html ：交易內 FOR UPDATE、鎖持續至提交／回滾。訂單鎖只控制本地入口，無法排除金流後台競爭。
- https://docs.stripe.com/api/idempotent_requests ：API v1 相同鍵保存結果與參數比對、至少 24 小時後可能清除。文章未宣稱永久遠端去重。
- https://docs.stripe.com/refunds#handle-failed-refunds ：退款狀態須核對，不把建立待辦或取得物件當成已退款。

上述文件於當日實際開啟閱讀。分攤演算法、退貨不追討滿額優惠、單一付款與逐件保存均是虛構案例的設計選擇，未歸因於 Stripe 或 MySQL。

## 人工審閱與算法驗證

- 文章採固定購買單位識別；同價商品同餘數按 ID 排序，實付在成交時保存，不依退貨次序重算。
- 原樣抽出文章 Python 執行，範例及練習通過。另窮舉 1–4 件、單價 0–4、所有合法折扣，共 6,640 組，並檢查所有輸入排列：折扣合計、逐件上下限與重排不變均通過。這是純函式檢查，沒有執行資料庫或金流測試。
- 獨立審稿沒有阻擋問題；依建議補上逐件實付等式、處理中商品不得再配對，以及本地鎖無法排除後台外部退款。站外操作或付款狀態不明時暫停新退款，核對後再恢復。
- humanize-writing checker 初稿有一個提示性冒號，已改為直接陳述。修改後零機械命中，另人工檢查結構、術語首次解釋、數字、語氣與未執行範圍。零命中不當作人工審閱替代。
- 日流量與每筆 160 bytes 都明標估算。SQL 交易區塊為概念規格，五項故障驗收是待實作計畫，不宣稱通過。

## 原創封面與原生圖解

- 使用內建 image_gen 正式圖片工具，沒有 CLI fallback。前篇為黃銅圓槽微距攝影、低斜角、暖側光。本篇為淡紫底紙雕拼片、俯視、靛藍／珊瑚／黃綠、柔和日光，在媒材、構圖、配色與光線區分。
- 提示重點：三塊不等大厚紙扇形組成圓，各自保留較淺同色的小紙片；最小扇形略移出，小紙片仍跟著它。是固定分攤的藝術比喻，不是數據比例圖。禁止文字、數字、商標、水印、箭頭與 UI。
- 最終 1600 × 900 WebP，335,390 bytes。全尺寸與 320 × 180 縮圖均實際目視，三塊及小片清楚、無文字或商標。
- Astro 原生 SVG 使用 title、desc、viewBox、前綴 ID、設計 tokens 與深色選擇器。桌面 880 × 550 寬列排列，窄版用語意 HTML 卡片，48rem 切換，數字與正文一致。

最終預覽、gate、精確 commit 與正式站驗收依實際結果另記，不以本研究檔宣稱已上線。

## 本機預覽限制

初次 dev 因預設設定目錄不存在失敗；改用 workspace 外的允許暫存設定目錄後，Astro dev 仍在 ready 前退出，回報 Dev server process exited before becoming ready。雲端瀏覽器兩次開啟 localhost 都為 ERR_CONNECTION_REFUSED。未繞過環境限制，依任務明示預覽例外繼續其餘檢查；不能聲稱本機桌面／320 px、深淺色實頁驗收通過。
