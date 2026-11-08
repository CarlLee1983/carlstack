# 訂單搜尋索引版本控制查核

日期：2026-11-08（Asia/Taipei）。系統設計每日實戰第 25 課。

## 選題與去重

起點 main 為 `86b2e3fc9a1866608c6f55fddb0111adf2c3eab7`，精確 commit 的部署 workflow `42386227198` 成功。已查遠端分支、近期 commit、open PR（空）、當日文章、draft、research 與 queue。系列原有 1–24 連續，沒有 11 月 8 日同系列稿或搜尋版本主題。

搜尋 `external_gte`、`version_type`、`gc_deletes`、搜尋索引與搜尋副本等關鍵字。既有 CDC 文章處理傳送架構，Conduit 文章處理 checkpoint 與同步結果，物流通知文章處理外部事件能否改變配送進度。本篇聚焦已由 MySQL 確定的訂單狀態，在搜尋副本中的版本接受規則與隱藏紀錄，已連結相關內容。多活與共識 queue 未變更。

讀取 AGENTS、content-guide、content schema、CI/deploy workflow、diagram-guide、carlstack-copywriting 與 humanize-writing（含 zh-tw、narrative-zh-tw）。Trail 執行檔與 `.trail/cache/INDEX.md` 不存在，改以 repository 檔案查核。僅新增文章、封面、原生圖解與本來源紀錄。

## 一手來源

以下官方文件於當日開啟查核，文章使用的行為限定於對應 API，沒有引用社群效能數字。

- https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-index ：固定 ID 完整寫入、external 只接受較大版本、external_gte 放寬相等版本、版本檢查與 refresh 分離。
- https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-delete ：刪除後版本紀錄僅暫時保留。
- https://www.elastic.co/docs/reference/elasticsearch/index-settings/index-modules ：`index.gc_deletes` 與預設 60 秒。
- https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-bulk ：整包回應與逐筆 items/error 不同，項目可帶 version 與 version_type。
- https://www.elastic.co/docs/manage-data/data-store/aliases ：alias filter 不適用依 ID 取得文件，不能代替應用授權。
- https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-reindex ：預設 internal 與目的端 external 的版本行為；來源缺漏不會由複製自動修復。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html ：交易內 FOR UPDATE 與鎖定存續。訂單、最新副本與 outbox 同交易是本案例的設計規格。

完整副本、單訂單遞增版本、普通文件 tombstone、首版不自動清理、MySQL 優先與 30 秒目標均是教學設計選擇，不歸因為 Elastic 通用建議。隱藏是搜尋顯示政策，不是取消、退款或個資抹除。

## 技術審閱與實際驗證

- 獨立審閱後修正同步目標：允許搜尋端版本大於或等於來源變更版本，不要求每個中間版本都曾出現。受控搜尋入口驗版本，一般搜尋驗隱藏，不能以 GET-by-ID 代替 refresh 驗收。
- 唯一鍵只防重複建立，另明定 payload 不可修改與禁止重複鍵 upsert。409 僅將符合固定索引、ID、外部版本契約的 version_conflict_engine_exception 視為已被涵蓋，不代表內容比對或搜尋可見性已完成。
- tombstone 範例明示 HTTP version 參數，避免把 JSON 的 search_version 誤當外部版本。全量重建必須帶入隱藏紀錄及原版本，新索引有獨立增量進度。
- 原樣抽出文內 Python 實際執行，亂序、重送、隱藏與同版不同內容斷言通過。另枚舉三事件的 6 種排列，各重播兩次，均保留最高版本 9 的隱藏紀錄。這是純模型驗證，沒有執行 MySQL／Elasticsearch 或負載測試。
- 40,000 KiB 約 39.06 MiB／日，七日約 273.44 MiB；300,000 KiB 約 292.97 MiB；18,000 ÷ (120−80) = 450 秒。文中皆明示假設且排除索引、日誌、備份等額外成本。
- 實際執行 humanize-writing checker，初稿兩項用語已改成「訊息」與「搜尋無法使用」。修訂後零機械命中，另人工審查結構、標題、術語首次說明、保留語氣、未執行範圍與來源。程式碼與數字經另行核對。

## 封面與圖解

內建 image_gen 生成原創封面。前篇是淡紫底俯視紙雕扇形，本篇改用直視單版畫、錯位藍色半透明紙片、朱紅鎮紙、暖白底與漫射光，在媒材、構圖、配色上區分。提示要求主體位於中央、無文字數字、商標、浮水印、箭頭或 UI。

最終保存 1600 × 900 WebP，實際檢視完整圖及 320 × 180 卡片裁切，主體清楚、無不預期文字。圖解使用原生 Astro/SVG，具 title、desc、viewBox、前綴 ID、設計 tokens 與深色選擇器。桌面 900 × 590，手機另排 288 × 692 對應 320 px 視窗內文寬，並實際渲染深淺色檢視，文字無重疊或切字。

## 預覽限制

在可寫的暫存設定目錄啟動 Astro dev，程序仍在 ready 前退出，訊息為 `Dev server process exited before becoming ready`。雲端瀏覽器開啟 localhost 回 `ERR_CONNECTION_REFUSED`。沒有繞過 socket 或瀏覽器限制。靜態 SVG 渲染與封面裁切已驗，但不當作完整頁面的本機桌面／手機、深淺色瀏覽器驗收。

安裝使用 pnpm 12.1.0 與 `--frozen-lockfile` 成功。最終 policy、check、test、production build、精確 commit 部署與正式站結果依實際執行另回報，不以此紀錄預先宣稱成功。
