# 系統設計每日實戰 01：訂單契約與 SLO

- 研究／撰寫日期：2026-10-11（Asia/Taipei）。
- 文章：`src/content/blog/order-system-requirements-slo.mdx`。
- 來源型態：原創教學題目，無外部貼文 ID 或單一轉載主來源。
- 系列決策：新增「系統設計每日實戰」，第 1 篇；以可操作的設計決策、反例與練習逐日推進，與既有面試方法論、容量估算和可觀測性文章不同。

## 去重

以 main `4647d9a` 的 `src/content/blog`、`docs/research` 與 `docs/article-queue.md` 搜尋訂單、SLO、系列名稱、需求驗收與來源 URL。當日沒有本系列文章。Google SRE implementing-slos 已被 Argus 文章引用，但其主題為 Agent runtime，不是訂單契約；既有 PEDALS、容量估算、可觀測性文章在本文加入延伸連結。既有 queue 的多活／共識題未變動。

## 一手來源與用途

以下來源於 2026-10-11 查讀；Google Workbook 章節與 AWS 冪等文章完整閱讀，RFC 與 MySQL 查核相關完整章節。

- https://sre.google/workbook/implementing-slos/ ：使用者旅程、SLI specification 與 implementation、good/total 事件比例、視窗、目標批准與誤差預算治理。本文的教學次序與 99.5%／1,000 ms 為原創假設，不歸因 Google。
- https://sre.google/workbook/slo-document/ ：量測位置、資料品質與盲區的文件化。未套用其簡化的 non-5xx 成功定義。
- https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2 ：冪等是預期效果，而非回應 bytes 一致；POST 重試須由應用契約支援。
- https://www.rfc-editor.org/rfc/rfc9110.html#section-15.3.2 ：201 表示資源已建立，並不替應用保證資料庫交易。
- https://www.rfc-editor.org/rfc/rfc9110.html#section-15.3.3 ：202 表示處理未完成，可能不被執行；持久受理與狀態查詢是本文另外要求的契約。
- https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/ ：caller-provided identifier、原子記錄操作與效果、同鍵不同參數、晚到重試。本文 7 天回覆快取、去重索引暫不清除與 24 小時重試為假設，不是 AWS 通用門檻。
- https://dev.mysql.com/doc/refman/8.4/en/mysql-acid.html ：InnoDB ACID 邊界。
- https://dev.mysql.com/doc/refman/8.4/en/create-index.html ：唯一索引；應用鍵明定 NOT NULL。
- https://dev.mysql.com/doc/refman/8.4/en/commit.html ：交易／autocommit 與非交易表限制。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html ：deadlock 回滾交易；lock timeout 預設只回滾失敗 statement，應用需明確處理整筆 rollback。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html ：普通讀取不保護後續相關寫入；本文使用條件更新策略，不把先查再寫當作防線。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html#sysvar_innodb_flush_log_at_trx_commit ：持久性受提交刷盤與底層儲存影響，不承諾任意故障下不丟資料。

## 原創判斷與驗證界線

案例為虛構單倉、單品項、未付款訂單；所有容量、保留期與 SLO 數字為教學假設。模組化單體與非同步受理不是互斥分類；比較的是同步 commit-before-201 與 durable-admission-before-202 的承諾。庫存、冪等、價格不變量以獨立整合驗收管理，不能由統計 SLO 預算抵銷。

inline JavaScript 抽出為臨時 `.mjs`，以 Node.js v24.19.0 實際執行，輸出 `PASS: SLI 分母、終局回覆、延遲與空視窗反例`。正例 2/2、降級例 2/4、資格不明、錯誤契約、accepted 非終態與零流量斷言通過。這是固定測資計算測試；沒有啟動訂單 API／MySQL，沒有併發與壓測成果，也沒有代表作者的生產經驗。

## 原創封面

內建 imagegen 產生原創圖，轉為 1600 × 900 WebP。透明玻璃量規、琥珀包裹、玉綠帳本與計時儀，以高斜角、明亮日光呈現。已對比最近 Grok 木刻雙槽、Deno 油畫渡船、SMA1000 陶瓷證據盤的材質、構圖、配色與光線；新封面未重複三者的共同模板。完整圖與 320 × 180 卡片實際檢視，無非預期文字、logo 或浮水印。

原始生成方向：original editorial 16:9 optical tabletop still life, small amber glass parcel through clear acceptance gauges into jade-green glass ledger, separate unnumbered timer, pale celadon, high oblique diagonal composition, bright morning daylight, no text/logos/UI.

## 發布驗收

使用 pnpm 12.1.0 frozen-lockfile 安裝成功。最終文章及 SVG 的 format、`content:policy -- HEAD`、`check`（181 files，0 errors／warnings／hints，含 production build）與 65 項 test 全數通過。Production build 產出 619 個 Pagefind 索引頁，文章存在於首頁、文章列表、RSS、Sitemap、系列總覽與「系統設計每日實戰」第 1 篇。

原創 SVG 以實際元件抽出的桌面／手機版，套用 tokens.css 深淺色值，渲染為 960 px 與 288 px 內容寬（對應 320 px 視窗兩側留白），四張實際檢視無重疊或切字。這是靜態圖解驗收，不等同整頁瀏覽器驗收。雲端 Astro dev server 在就緒前退出，本地 URL 瀏覽器預覽不可用；未繞過 socket 或瀏覽器政策。正式部署後另檢查真頁、封面、清單、搜尋與系列；不把未完成的 live 驗收寫成已通過。

獨立審閱後修正 unknown eligibility 分子、同鍵內容衝突分類、缺貨重放、去重索引保留、duplicate-key rollback、成熟觀察批次與同步／非同步的比較維度。可執行 fixture 再跑通過，仍不代表訂單服務驗收。
