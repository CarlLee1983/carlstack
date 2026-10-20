# 系統設計第二批修訂：容量與冪等收據

查核日期：2026-10-20。基準 main：`26415b97cc2809516d50e679968994622bd4e33e`。

僅修訂 `order-system-capacity-budget.mdx`（#2）與 `order-system-idempotency-receipt.mdx`（#4）。保留標題、URL、publishDate、封面、系列順序與既有來源。updatedDate 留待整合發布時填入。第 1、3、10 篇維持已發布版本。

## 改動與保留

### #2 容量

原稿的數值、單位與假設區分已完整，沒有重寫算式或另造壓測結果。這次把「每秒 20 次為什麼仍會排隊」作為閱讀線索：

- 用 12,000 次嘗試／9,600 個鍵的核對，指出隨機新鍵不能冒充重送。
- 將 pool 申請、拿到與實際歸還三個時間點分開，說明等 pool 與持有連線等鎖的差異。
- 讓每副本 8 條連線的設定接受程序加總及滾動部署檢查，保留 40／8／4／28 的原預算。
- 保留互斥鎖 80 ms 對應理想上界 12.5 次／秒的反例，補明完整 UPDATE 耗時可能含取得鎖前等待，不可把它直接當持鎖時間。
- 展開 90 天磁碟占用的代入算式；全部原數字重算一致。
- 壓測每輪重設庫存與收據基準，避免上一輪耗盡庫存後，下一輪只剩快速缺貨而誤判改善。

### #4 冪等收據

保留原來同一交易、固定業務操作鍵、缺貨結果重放、COMMIT 未知與保留期核心。改寫集中在運行順序：

- 為案例的 `(customer_id, idempotency_key)` 唯一約束給出示意名稱 `uq_order_operation`，讓 duplicate-key 的分類能指向明確對象。
- 展開 A 插入未提交、B 阻塞在同鍵 INSERT、A 提交後 B 回滾再讀，以及 A 回滾後 B 重新取得資格的分支。
- 明示此兩連線順序不保證所有並發都無 deadlock；多等待者需整筆有界重試。
- 把 REPEATABLE READ 的舊快照測試獨立出來，避免混進其他鎖交錯。
- 分開測 HTTP 回覆遺失與 DB COMMIT 確認遺失；兩者都不能換新鍵重做，但可觀察到的提交證據不同。

所有新場景與測試仍明示為虛構／待執行，未新增年資、公司、正式事故或效能成績。

## 一手來源核對

- [Karl Sigman, Notes on Little’s Law](https://www.columbia.edu/~ks20/stochastic-I/stochastic-I-LL.pdf)：核對系統邊界、時間平均、到達率及平均停留時間；不以 p99 代平均，也不以公式保證 worker/pool 上限。
- [k6 Open and closed models](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/)：closed model 在回應變慢時降低到達率；原稿 coordinated omission 說法保留。
- [k6 Constant arrival rate](https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/constant-arrival-rate/)：rate 是每 timeUnit 啟動的 iteration 數，須有可用 VU；iteration 不等於 HTTP 請求數。
- [k6 Dropped iterations](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/dropped-iterations/)：arrival-rate executor 無空閒 VU 時會丟掉未送出 iteration，原因可來自配置不足或 SUT 變慢；不能只歸因測試器，也不能加入服務端已接收分母。
- [MySQL Connection Interfaces](https://dev.mysql.com/doc/refman/8.4/en/connection-interfaces.html) 與 [Memory Use](https://dev.mysql.com/doc/refman/8.4/en/memory-use.html)：連線上限與每連線資源仍有成本。保留「平均被借用數」和「實際開啟總數」差異。
- [MySQL Locks Set by Different Statements](https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html)：UPDATE 的鎖與索引掃描範圍、INSERT 的 duplicate-key shared lock、三 session 範例的 deadlock。兩連線解說限定沒有其他競爭者、逾時或死結，不推成一般必然順序。
- [MySQL Consistent Nonlocking Reads](https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html)：REPEATABLE READ 沿用首個一致性讀快照；普通 SELECT 與 DML／唯一檢查不能混為同一可見性。選擇 rollback 後主庫新 autocommit 查詢，是本案例策略。
- [MySQL Error Handling](https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html)：本輪沿用首批已重新核對的原文；deadlock 整筆 rollback、lock timeout 預設僅敘述 rollback 的差異不變。
- [AWS Idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)：沿用首批核對的 caller token、原子保存與 semantic equivalence。10 萬／天、512 bytes、7 天與 24 小時仍為本例假設，不歸於 AWS。
- [AWS Load Shedding](https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/)：本輪重新打開原始連結，現轉到 AWS Builder Center 的同名文章；保留原文穩定來源 URL，不將卸載解讀為把容量拒絕排除 SLI。

沒有發現需要變更原算式或核心技術結論的錯誤。本次新增說明主要防止兩種誤讀：把等待 UPDATE 的時間全部當持鎖時間，以及把「A 回滾後 B 可競爭」當成所有交錯都保證立即成功。

## 本地驗證

2026-10-20 以 Python 重算原容量數值：

- 每日長期資料：112.3046875 MiB。
- 90 天長期資料：9.870529174804688 GiB。
- 365 天長期資料：40.030479431152344 GiB。
- 7 天快取：341.796875 MiB。
- 90 天資料加快取乘 3：30.612945556640625 GiB。
- 365 天資料加快取乘 3：121.0927963256836 GiB。

與正文保留的四捨五入值一致。這只是算術核對，不是 MySQL 儲存量測。

兩篇 Prettier、stage 後 content policy、git diff --check 通過。沒有執行 MySQL 併發測試、k6、金流 API 或壓測。SVG 元件未改；完整 check/test/build 與桌面／320 px 畫面驗收仍由發布整合執行，不能用本地窄檢查代替。

## 發布整合

兩篇全文審讀通過後，整合於 main `26415b97cc2809516d50e679968994622bd4e33e`。updatedDate 設為本輪修訂時間 `2026-10-20T11:52:00+08:00`，其餘發布識別欄位保留。

同一雲端工作區的 Astro dev 已回報 `Dev server process exited before becoming ready`，localhost:4367 連線拒絕；未繞過限制。桌面／320 px 深淺色實頁預覽依既有例外未完成。圖解與封面未改，完整安裝、格式、policy、check、test、獨立 build 與正式索引仍須以本輪最終產物驗證。
