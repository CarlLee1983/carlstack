# 系統設計既有文章首批修訂查核

查核日期：2026-10-20。基準：main `f57c7b50a78276f282faef03acdaa32910af2e94`。

範圍：全文讀取系統設計每日實戰第 1–9 篇；這批僅改第 1、3 篇。第 10 篇另行處理。沿用既有 URL、publishDate、cover 與 seriesOrder，updatedDate 由發布整合時填入。

## 逐篇診斷與排序

- #1 需求／SLO：優先。原文規則完整，但開場與收尾偏需求報告。修訂用「201 已送出，預留才失敗」說明回覆位置，再用缺貨重放、未決請求分母和 202 取捨推進。保留合成驗收、全部核心目標與保留期限。
- #2 容量：後續候選。數值、單位、平均與尾延遲邊界已相當具體；後續可減少重複的假設聲明，把 pool 排隊與熱門 SKU 對照測試集中。
- #3 ownership：優先。原文抽象分工先行，具體的雙連線漏回滾藏在中段。修訂以連線 A rollback 無法撤銷 B commit 起頭，交代交易 context 傳遞與資料寫入入口的不同責任，加入暫停／恢復與故意寫壞 adapter 的驗收。
- #4 冪等：已有具體逾時開頭；後續可把兩條連線在 unique INSERT 上等待、提交與回滾的順序展開，無須整篇重造。
- #5 取消：目前最接近目標風格，A 取消、B 預留、A 再取消的數量推演清楚。先保留。
- #6 晚到付款：事故和狀態分離已清楚；後續可拆開驗簽收件、付款去重和退款待辦提交的運行時序，縮短模板式收尾。
- #7 待辦索引：查詢、索引與分布具體；後續可加強 EXPLAIN ANALYZE 下層節點如何判讀，仍不得捏造實測計畫或延遲。
- #8 快取：已有逆序回應與舊值回填的好反例；可壓縮抽象契約句，保留 revision 與跨裝置界線。
- #9 重試：需在後續把單一派送程序的送出瞬間、重啟與 SDK 隱式重試測試寫明。這批未更動其部署假設，也未將 job attempt 誤當全域外呼額度保護。

以上只是後續排序，不代表已啟動更多文章修訂。

## 第 1 篇的一手查核

- [RFC 9110 §15.3.2–15.3.3](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.3.2)：201 表示請求已完成且建立資源；202 只受理、尚未完成，最後可能不執行。訂單／快照／預留共同提交是本例額外契約。
- [Google SRE Workbook: Implementing SLOs](https://sre.google/workbook/implementing-slos/)：重讀章節全文。支持 good/total events、SLI specification 與 implementation 的區別、量測位置盲區、關係人批准與錯誤預算政策。99.5%、28 天、1,000 ms、停止非必要發布均保留為案例假設／提案，非來源指定值。
- [AWS: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)：核對客戶端操作識別、ACID 記錄、semantic equivalence、晚到重試及參數不符章節。來源明說保存期限依服務而異；7 天、24 小時及去重索引不自動刪除仍是本例政策。
- [InnoDB ACID](https://dev.mysql.com/doc/refman/8.4/en/mysql-acid.html)：原子性與耐久性依賴不同機制，不能把有 transaction 寫成任何故障下零資料損失。
- [CREATE INDEX / Unique Indexes](https://dev.mysql.com/doc/refman/8.4/en/create-index.html)：唯一索引拒絕重複值，但允許 nullable 欄位出現多個 NULL；原稿非空唯一鍵條件保留。
- [InnoDB Error Handling](https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html)：deadlock 回滾整筆，lock timeout 預設只回滾敘述；本例額外採應用邊界整筆回滾與有界重試。
- [innodb_flush_log_at_trx_commit](https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html#sysvar_innodb_flush_log_at_trx_commit)：核對提交刷盤、sync_binlog 與硬體 caveat，保留 RPO／RTO 與故障切換未驗證界線。

技術釐清：原稿「不變量不能拿錯誤預算抵銷」方向保留，但改成明確的發布政策：正確性錯誤仍應記入可靠性報表，剩餘預算不能授權放行已知重複預留。避免讀者誤解為資料正確性事件不用算 SLI。

## 第 3 篇的一手查核

- [MySQL autocommit, Commit, and Rollback](https://dev.mysql.com/doc/refman/8.4/en/innodb-autocommit-commit-rollback.html)：同一 session 管理多敘述交易；不同連線獨立提交，因此共同 pool 並不保證共同 rollback。
- [MySQL Implicit Commit](https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html)：重新 START TRANSACTION 會隱式提交目前交易，不能直接當成巢狀交易；DDL 也需避開業務交易。
- [Shopify: Deconstructing the Monolith](https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity)，2019-02-21，全文重讀：公開 API、資料 ownership 與 Wedge 是其漸進模組化做法，原文明說完整隔離仍在進行。沒有推論為「每張表一個服務」或「搬檔案就完成隔離」。
- [Martin Fowler: Bounded Context](https://martinfowler.com/bliki/BoundedContext.html)，2014-01-15，全文重讀：模型語言、同名概念差異與關係；目前價目／成交快照是本例應用，不是原文指定的 schema。

無新增作者年資、任職公司、親身事故或壓測成績。雙連線事故和所有測試交錯均明示為虛構案例／待執行計畫。scope callback 必須等待非同步操作的說明是介面契約，沒有聲稱某個未具名框架已自動提供。

## 本地驗證

- 2026-10-20：抽取第 1 篇原有 Node.js 合成驗收，執行通過。僅驗 SLI fixture 計算，未啟動 HTTP／MySQL。
- 兩篇使用 repository 既有 Prettier 直接格式化，通過。
- 目標檔案 stage 後執行 `node scripts/validate-content-policy.mjs HEAD`，通過兩篇。
- 未變更 SVG 元件與封面。未執行 MySQL、真實外部 API 或壓測。
- 此工作區的系統 pnpm 為 11.25.0，repository 要求 12.1.0，直接 pnpm exec 遭 engine 拒絕；改用既有 node_modules 的 Prettier CLI 執行窄範圍格式化。發布前仍須由整合工作區跑完整 check／test／build 與畫面驗收，不以窄範圍檢查代替。

## 發布整合

兩篇全文已審，整合於第 10 篇修訂後的 main `0aed896af4803b01143095cfa4b4124f3b491eea`。保留 URL、publishDate、cover 與原系列順序，updatedDate 設為本輪修訂時間 `2026-10-20T11:38:00+08:00`。整合工作區再次抽取並執行第 1 篇 SLI 合成檢查，通過；仍未執行 HTTP、MySQL 或負載測試。

同一雲端工作區的 Astro dev 在 port 4367 回報 `Dev server process exited before becoming ready`，localhost 連線拒絕。深淺色桌面／320 px 實頁預覽依既有例外未完成；未繞過限制。保留原圖解與封面，最終內容 policy、check、test、build 與發布索引另以本輪完整整合產物驗證。
