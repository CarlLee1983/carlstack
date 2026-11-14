# Cloud SQL 的備援副本與增強備份查核

查核日期：2026-11-14（Asia/Taipei）。事件公告日期為 2026-11-13。對應文章 `cloud-sql-dr-enhanced-backups.md`。

## 去重與系列

已查 `src/content/blog`、`docs/research`、`docs/article-queue.md` 的 Cloud SQL、enhanced backups、DR replica 與原始 release notes URL，沒有同核心題材。複製延遲舊文處理讀取一致性，本篇處理 11/13 新開放相容性及切換後備份驗收，加入連結而不改舊文。現代資料庫與儲存引擎內核原最高序號 10，這篇使用 11。標題依使用者最新偏好直接描述題材，不將結論壓成口號。

## 一手資料與段落對應

- https://docs.cloud.google.com/sql/docs/postgres/release-notes#November_13_2026 ：已讀 11/13 完整條目。新增 enhanced backups 支援已有指定 DR replica 的 primary。開頭只宣告這項相容性，不說原本沒有備份或已自動替所有 instance 切換。
- https://docs.cloud.google.com/sql/docs/postgres/backup-recovery/manage-enhanced-backups ：已讀啟用、掛載計畫與 data source/PITR 查核段落。PITR `log_retention_days > 0`、不能直接掛 replica、plan 與 instance 同區域、覆寫原設定、可能重新啟動、延長保留不補歷史日誌。文章第一節及第二場演練引用。
- https://docs.cloud.google.com/sql/docs/postgres/use-advanced-disaster-recovery ：已讀 edition/replica 前提、switchover、replica failover、enhanced backup behavior 兩節。Enterprise Plus 限制；failover 可能複製落後遺失資料；新 primary active、operational backup/PITR uploading/schedule；降級後 paused；failback 恢復。文章第二節引用。未把文件上的備份耗時範圍當保證或實測。
- https://docs.cloud.google.com/sql/docs/postgres/backup-recovery/backup-options ：已讀 enhanced backups、cross-region、operational backups、DR replicas 與限制。CMEK 跨區還原仍依賴原區域、PITR 目標區域限制、operational backup fallback 沒有 vault 強制保留。文章第三節引用。
- https://docs.cloud.google.com/sql/docs/postgres/backup-recovery/backups ：讀 backup options 與用途，作交叉核對，不擴充新聞規模或聲稱新發明備份功能。

Google 文件本身有可疑 REST 範例（例如 triggerBackup 示範 GET、部分 resourceType 字串差異），文章不轉貼這些未驗證指令，也不補猜可用語法。採文件行為與工程演練建議，沒有執行 Cloud SQL、建立雲端資源、量測效能或證明還原成功。演練中的 A/B 訂單資料庫與錯誤更新是明示假設，不是站主私人環境。

## 封面與 Cover Direction

生成前檢視鄰近 `postgresql-november-update.webp`：紙雕版畫／正面置中／米白深藍橘／暖影。

本篇：備援伺服器與獨立資料圓盤盒／陶瓷與玻璃微縮靜物／斜向前後景／淡紫梅紫與琥珀／柔側光。媒材、構圖、主色至少三欄不同。

正式 imagegen 生成原創圖片，來源 `exec-42b2201f-0e5f-4f9f-a9f3-9c562d7ca64b.png`，本地 WebP `src/assets/covers/cloud-sql-dr-enhanced-backups.webp`，1672×941。全尺寸與 480×320 中央卡片裁切均已人工目視，兩座主體與獨立盒子可辨，無文字或 Logo。圖片是概念插畫，非真實架構配置圖。

提示：Create an original editorial technology blog cover, wide landscape 16:9. Topic: database disaster recovery replicas and separately retained backups. Three miniature ceramic architectural objects arranged diagonally in a quiet lavender studio: two upright ribbed server towers linked by a thin cable, with one slightly farther back, and a separate low translucent amber archival case holding stacked record discs in front. Sophisticated physical clay-and-glass still life, soft side lighting, pale violet and muted plum with small amber accent, generous negative space, no symbols of guaranteed security. Entire meaningful composition inside central 70 percent so card cropping stays readable. No text, no letters, no numbers, no logos, no watermark, no arrows or UI. Crisp magazine art, tangible materials, not paper collage, not a cyberpunk network.

## 驗收狀態

已跑 humanize-writing 繁中掃描並修正命中，人工讀標題、段落、來源/推論區分。沒有新圖解、可執行範例。未自行執行全站格式、技術 gate 或正式部署，交由父任務針對最後內容統一驗證。實頁目視仍待父任務處理，不把封面檔目視算成實頁檢查。
