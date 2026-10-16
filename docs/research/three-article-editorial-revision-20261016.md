# 三篇既有文章校訂紀錄

2026-10-16，基底 5923c18。依使用者要求改善主線、起承轉合與結論，保留三篇 slug、首次 publishDate、封面、系列編號。只更新內容與 updatedDate；不計新文章篇數。

## 編輯差異

- ambition-needs-verifiable-experiments：以付款永遠停在處理中、仍能通過狹窄測試的反例串起全文，刪除 20 件申訴與 200 ms 延遲岔題。付款案例仍為虛構，未實測。原研究紀錄 20261015 中的 200 ms／SRE 引用描述是初版歷史，本版不再採用。
- order-system-cancellation-release：以 A 取消、B 新預留、A 重試串起 reservation 狀態與同交易必要性。保留 SQL 設計片段、timeout/deadlock、影響列數、索引、授權、替代方案與待執行的整合測試。A/B 為訂單；圖中 A/B 為同單的請求，正文明示區別。
- youtube-like-product-system-design：保留十張原生圖解與完整生命週期，拆分 attempt fencing、bundle CAS、舊 session 保留三種不同責任。四 API 為節選；公開意圖與下架仍需 owner 授權和版本條件。案例數值未改，無轉碼／效能實測宣稱。

## 重新查核的一手來源

- Felix 原文 https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/ ：2026-10-13 發布，讀全文，四方向及外部驗證為作者主張；付款故事為本文延伸。
- Anthropic https://www.anthropic.com/engineering/building-effective-agents ：讀原文，採簡單方案優先原則，不將其舊產品名單當今日選型。
- MySQL 8.4 https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html 、https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html 、https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html 、https://dev.mysql.com/doc/refman/8.4/en/update.html ：核鎖定讀、預設 lock timeout 敘述回滾與 deadlock 整筆回滾、CHECK UNKNOWN、matched/changed 語義。
- S3 https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html 、https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html 、https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html ：核 part ledger、有序完成清單、HTTP 200 內嵌錯誤與 abort 競爭。
- AWS https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html 、https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html ：outbox 不消除重送，consumer 仍需去重。
- CloudFront https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-cookies.html 、https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/origin-shield.html 、https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html ：驗簽與政策後才供應快取內容、依請求時間驗期限、Origin Shield 為回源快取層、失效與刪除分開。

## 驗證範圍

三文均為設計與分析，沒有補寫不存在的站主經驗或實測。最終 repository gate、正式頁面與索引確認記錄於本次提交／發布交付；網站測試不等於本文描述的 MySQL 併發、金流或轉碼測試。

## 本機驗收與 CI 接續

- frozen install、Prettier、三篇 content policy 通過；Astro check 199 檔零錯誤、零警告；單元測試 68 項通過。
- 完整 check 的 build 階段兩次在 Vite 靜態 entrypoints 完成後遭環境終止（exit 137）；第二次已序列執行並降低 Node heap，結果相同。未將部分 build 視為成功；改由既有 PR CI 對精確 head 執行完整 check、build、Pagefind、測試與部署 dry-run，通過才合併。
- 本機 dev server 未能啟動，桌機／窄版的本次預覽目視尚未完成；未修改圖片或圖解。發布後另核對正式頁、封面、列表、搜尋與系列。
