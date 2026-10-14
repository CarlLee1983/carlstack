# 系統設計每日實戰 04：同交易收據與未知提交

## 查重與范围

2026-10-14 查讀 main 4b6ce5a72d8309ad36d9bf1aadb5b6773936bd41、AGENTS、content-guide、content schema、部署 workflow、copywriting 與 humanize skills、article-queue、blog 與 research。當日未有本系列新文。沿用系列第 4 篇。

第一篇 order-system-requirements-slo 已提出冪等契約與保留期，第三篇 order-system-write-ownership 刻意保留 findOrClaimOperation 的唯一鍵競爭實作缺口。本篇只深入操作收據和業務效果共同提交、duplicate-key 與 COMMIT 回覆遺失後恢復。既有 Shopify/Stripe 金流文章談遠端副作用，不重寫其支付系統主題；正文連到金流閱讀路徑並說明邊界不同。

## 一手來源與段落對應

獨立來源查核於 2026-10-14 完成，閱讀官方全文；非搜尋摘要。AWS 網頁及 9 頁 PDF 全文、MySQL 以下相關完整章節。

- https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/ ：caller-provided identifier、同鍵不同參數、記錄 token 與 mutation 原子完成、語意等價回覆與保留期。對應意圖識別、收據契約、共同交易；不是本文欄位或 7 天/24 小時數字的來源。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html ：deadlock 整筆回滾；lock timeout 預設 statement rollback；duplicate-key 也通常只回滾 statement。本文明確整筆 rollback 是應用政策。對應錯誤分支。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html ：INSERT record lock、重複鍵 shared lock 與死結可能。對應唯一約束仲裁，不聲稱第二請求必定立即 1062。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html ：REPEATABLE READ 一致性讀沿用快照。canonical 當次 503，以官方同頁 ?ff=nopfpls 讀完整內容，正文保留 canonical。對應回滾後新的主庫 autocommit 讀取。

COMMIT 斷線未知、主庫第一次查不到仍可能尚在完成、同鍵重試繼續由唯一索引仲裁，是基於上述原子性與故障模型的本篇工程推導，不冒稱 MySQL 錯誤文件直接描述所有網路故障。單主庫耐久性及故障切換仍需另外驗收。

## 假設、審閱與未實測

虛構單倉、單品項、單幣別、尚未付款；日 10 萬新操作、512 bytes/份、51.2 MB/日、18.688 GB/年為十進位粗估。7 天回覆快取、24 小時自動重試、去重索引首版不刪沿用第 1 篇。

沒有實作 MySQL 服務、沒有執行併發或效能測試。text fence 為流程規格，所有資料庫驗收項目是待實作計畫。獨立全文審閱後補上指定操作收據唯一索引的 duplicate 過濾、fingerprint 不包含當前價格，以及 owner rollback、RR 舊快照反例。認證、授權、鍵值大小寫也有明示。

## Cover Direction 與圖解

實際看過相鄰第2篇紙雕/正面通道/靛藍紅/明亮柔光、第3篇寫實木櫃/側平視/胡桃木黃銅/低側光。第4篇選陶瓷收據與半透明青綠箱/斜俯視/珊瑚色/漫射光，僅共用16:9；媒材、構圖、色盤均改變。

正式內建 imagegen，一次生成。Prompt：original editorial wide 16:9 cover; one ivory ceramic receipt tile with circular mark in translucent pale teal glass vault; two paper ribbons, one torn to imply lost response; matte coral tabletop; three-quarter overhead; tactile clay/glass sculpture; no text, numbers, logos, wood cabinet or conveyor. 原 PNG 1672×941，Sharp 轉本地1600×900 WebP。完整圖及320×180卡片均目視，主體清楚、無文字logo。圖像是隱喻，不是運作教學證據。

原生 OrderReceiptDiagram.astro 使用 token、前綴ID、title/desc、桌面960與窄版288直向編排。實際抽出 SVG 套相同主題色彩後渲染四版目視，文字無切割或重疊；窄版代表320視窗內兩側留白。這是圖解靜態驗收，不冒稱完整頁手機驗收。

## 工程驗收紀錄

環境為助手雲端；可見Mac離線且沒有saved coding environment，未使用使用者電腦。Node24.19.0，pnpm12.1.0 frozen install 成功。全域pnpm11.25不使用，透過臨時npm cache取得所需版本，未改repo工具鏈。

Astro dev 因 uv_interface_addresses 系統錯誤退出，本機完整頁預覽未完成；使用者已允許此限制不阻擋其他驗收完備的發布。發布前仍須全部內容、型別、測試與production build通過；正式站發布後另驗文章、封面、列表、搜尋與系列。資料庫與效能測試不在本文實測成果中。

前篇只新增必要的續篇內鏈，保留原 publishDate；沒有以單純導覽連結更新 updatedDate 或置頂舊文。

初次完整 check（186 個 Astro 檔案零診斷，含 production build）與65項測試通過；production 生成1775張圖片。加入前篇導覽內鏈後，對最後檔案重新執行 format、stage、content policy、check/build 與test，發布只使用該最終通過版本。SVG四版與封面另經獨立目視複核通過。建置僅以本次程序 CPU affinity 1 核與768 MiB heap控制尖峰，未修改repo腳本或檢查。
