# 系統設計每日實戰 03：共同交易與資料寫入責任

## 去重與範圍

2026-10-13（Asia/Taipei）讀最新 main `295cd6e43ff1da644b062c56dd2adf8257ef67b9` 的規格、schema、workflow、相關 skills、queue、research、blog、近期 commits 與 open PR（空）。系列只有 order-system-requirements-slo 與 order-system-capacity-budget 兩篇，沒有今日稿或進行中第 3 篇。

依來源 URL、作者、題名及 ownership、模組、資料邊界搜尋。既有 DDD 模組文章主談 import/API/CI 隔離；第一篇定義同筆交易成立契約，第二篇討論容量與 pool。本篇新收穫是資料寫入 ownership、transaction scope 實際連線及 transaction lifecycle owner。保留本地協作耦合，不聲稱各模組已是完全自治 context，不重寫舊篇。系列第 3 篇。

## 原文來源與段落對應

均於 2026-10-13 讀取完整原文，由獨立研究者核實。

- MySQL 8.4 §17.7.2.2：https://dev.mysql.com/doc/refman/8.4/en/innodb-autocommit-commit-rollback.html 。支援新 session 預設 autocommit、同 session 多敘述交易及 commit/rollback。對應同一實際連線，不能把相同 URL/pool 當交易共享。
- MySQL 8.4 §15.3.3：https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html 。START TRANSACTION 會隱式提交既有交易，MySQL 沒有真正巢狀交易；多種 DDL 隱式提交但非所有 DDL。對應禁止模組自行開始/提交共同交易及不混入 migration。
- Shopify，Kirsten Westeinde，2019-02-21：https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity 。公開 API 與 component data exclusive ownership；當時隔離仍進行中。僅作單體 ownership 案例，不代表本文交易設計等同 Shopify，也不聲稱百分百隔離。
- Martin Fowler，2014-01-15：https://martinfowler.com/bliki/BoundedContext.html 。模型、語言及模型關係邊界；不支持一表一context或獨立DB必要性。當前價目/成交快照分工為本文工程政策。

## 教學假設與未實測範圍

虛構單倉、單品項、未付款，沿用 201 前共同提交、同鍵不重複及主庫讀。每秒20次、0.08連線秒、平均1.6條來自前篇假設，不是效能結果。text fence 明示非可執行介面示意，未實作 MySQL 下單服務；失敗注入、錯誤連線mutation、快照、冪等併發與取消測試都是驗收計畫，沒有冒稱通過。價格只承諾讀到的值/版本，不承諾commit最新。框架savepoint語意不能直接等同MySQL巢狀交易。

## Cover Direction

前兩篇已實際看圖：第1篇透明玻璃量規/高斜角/玉綠琥珀/明亮日光；第2篇紙雕通道/正面透視/靛藍朱紅/柔光。本篇為同櫃分隔與共同橫桿的寫入責任隱喻，寫實木作靜物/斜側平視/胡桃木與黃銅陶土/低側光；媒材、構圖、色盤與光線均不同，只延續16:9比例。

正式內建 imagegen 一次原創生成。Prompt：original editorial 16:9 handcrafted walnut cabinet with three compartments containing cream order slip, terracotta inventory blocks and brass price weight; one shared wooden locking crossbar; low side-lit fine-art still life; no text, logos, UI, arrows, glass gates, conveyor belts or paper sculpture. 生成原PNG保留於雲端，成品轉為本地1600×900 WebP，另檢查320×180卡片。

## 驗收

獨立全文審閱確認 price policy、同一 session、MySQL implicit commit、來源歸因與取消練習正確；依審閱補上使用者範圍冪等鍵，以及缺貨無庫存副作用且正常提交終局結果。

Node24.19.0、pnpm12.1.0 frozen install，format、policy、check（含production build）及65項unit tests通過。build有629個Pagefind頁；本文出現在RSS、sitemap、首頁、文章列表及系列第3篇。系統全域pnpm11.25低於repo要求，僅於雲端臨時PATH使用12.1執行，未改repo工具鏈。

封面1600×900、152796bytes；完整圖與320×180卡片目視通過，無文字logo。SVG以實際元件抽出套tokens色彩，桌面960與288內容寬（320視窗兩側留白）深淺四版實際渲染目視，沒有切字與重疊。這是靜態圖解驗收，沒有冒稱整頁手機已驗。Astro dev在ready前退出；本地完整頁預覽不可用，未繞過限制。正式站可用雲端瀏覽器，推送後另核精確main部署與實頁、封面、清單、搜尋、系列。發布前不宣稱上線。
