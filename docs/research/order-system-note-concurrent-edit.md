# 訂單備註的同時編輯查核

日期：2026-11-10（Asia/Taipei）。系統設計每日實戰第 27 課。

## 選題與去重

起點 main 為 `2f1b55f5db91c1c8e28a54b36473f514ac4b251a`，相同 commit 的 Cloudflare 部署 `42568776492` 成功。已查遠端分支、近期 commit、open PR（空）、當日文章、四份無關 Prompt 草稿、research 與 queue。每日實戰第 1 至 26 課連續，沒有今日相關稿件或未完成分支。

搜尋 If-Match、ETag、樂觀併發、lost update 等字詞後，確認第 13 課已使用 expected_revision 防止舊頁改址，但主軸是履約凍結與快照。第 26 課處理成功操作紀錄的共同提交，庫存鎖策略篇則是熱點扣減。本篇專講人工編輯期間的舊版覆寫與衝突恢復，明示延續第 13 課，不宣稱首次介紹版本控制。站內連結包含第 13、26 與操作收據篇。沒有因日期推定讀者已完成練習，也未採用 queue 的多活／共識題。

已讀取 AGENTS、content-guide、content schema、site config、CI/deploy workflow、architecture、diagram-guide、carlstack-copywriting、humanize-writing 及繁體／敘事參考。Trail 執行檔與 cache 未提供，依實際檔案查核。沒有修改共用架構邊界。

## 來源與技術界線

當日查核的一手公開文件：

- https://dev.mysql.com/doc/refman/8.4/en/update.html ：UPDATE 條件、實際變更列數、原值不算變更。每次接受儲存同步遞增 revision 是本案例的設計選擇。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html ：UPDATE 仍取得寫鎖，唯一鍵查找與範圍查找的鎖定範圍不同。沒有宣稱樂觀控制無鎖。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html ：deadlock 整筆交易回滾，預設 lock wait timeout 可能只回滾 statement。文章要求應用清理整筆交易再依政策有限重試。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html ：REPEATABLE READ 的普通讀取沿用既有快照。衝突恢復另開主庫讀取，只描述查詢當時的狀態。
- https://dev.mysql.com/doc/refman/8.4/en/integer-types.html ：BIGINT 占 8 bytes。
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER ：JavaScript 安全整數上限與精度問題。版本用十進位字串是介面建議。
- https://www.rfc-editor.org/rfc/rfc9110.html#name-if-match ：HTTP 條件請求有自己的比較與失敗規則。文章選 JSON expected_revision 與自訂 409，未混稱 If-Match 的標準回應。
- https://docs.python.org/3/library/sqlite3.html#how-to-use-the-connection-context-manager ：連線 context manager 提交／回滾已開啟交易，不負責關閉連線。

技術審查確認 SQL 只改備註及其版本，可信 tenant 由登入上下文取得，每次驗客服角色。內部備註不影響出貨／付款，版本只涵蓋備註；若改作出貨指令，必須另加入履約條件。零列不一律歸因版本衝突，結果不明不冒充失敗，重試保留原 expected_revision。所有寫入入口都必須遵守相同協定。

## 寫作與模型驗證

- SQLite 程式從文章原樣抽出執行，得到 `PASS: stale edit, tenant scope, same text, rollback`。測到共用舊版本的先後送出、租戶條件、同內容儲存遞增與回滾，沒有執行 MySQL 併發、角色驗證、瀏覽器 UI、網路故障或負載實驗。
- 100 萬列 × 8 bytes 約 7.63 MiB。20 次／秒 × 2,000 bytes 約 39.1 KiB/s。10,000 次／日 × 假設 1% 衝突約 100 次／日。所有流量、資料量、衝突率與 300 ms 驗收目標明標假設。
- humanize-writing 已執行並人工審讀。將「當前」改為自然台灣用語，最後兩項 checker 提示均為來源標題冒號，判斷為合法標籤而保留。另人工核對標題、段落結構、術語、重複警語、程式與來源，沒有為清零破壞語意。
- 練習與參考思路分開：乙讀過版本 13，即使丙先提交 14，也只能帶 13 送出並再次處理衝突。

## 封面與圖解

封面矩陣：第 25 課為正視單版畫、青藍紙片與朱紅鎮紙；第 26 課為陶瓷胡桃木靜物攝影、斜俯視、苔綠與象牙白。本篇採不透明水粉插畫、低角度雙對角線、杏橙底與酒紅／芥黃鉛筆，媒材、構圖、主色皆有區別。

正式 image_gen 原創封面提示為共用備註本、兩支不同方向的鉛筆、一支畫下新線，另一支在紅色直立標籤前停住。無文字、商標或浮水印。保存本地 1600 × 900 WebP，實際檢視原始圖、最終全尺寸圖與 320 × 180 與列表實際比例 320 × 200 卡片裁切，主體及停筆關係仍可辨識。

原生 SVG 有前綴 ID、title／desc、viewBox、站台 tokens 與正確深色選擇器。桌面為 900 × 590，手機重新排列為 288 × 660，對應 320 px 視窗內文寬度。從元件抽出實際文字、幾何與 CSS，解析兩套色彩後靜態渲染四張圖，逐一檢視無文字重疊、切字與低可讀性。主要文字／卡片最低對比為淺色約 6.60、深色約 8.60。圖文內容另經技術審查，沒有自動合併或編輯期間持鎖的暗示。

## 預覽限制

預設 pnpm 11.25.0 不符合 repository engines，改用官方 npm registry 的 pnpm 12.1.0，`install --frozen-lockfile` 成功，未修改 lockfile 或放寬 engines。使用 Node 24.22.1，符合 repository 要求。

Astro dev 在 ready 前退出，訊息為 `Dev server process exited before becoming ready`，雲端瀏覽器開 localhost 得到 `ERR_CONNECTION_REFUSED`。已依允許的預覽例外記錄，沒有改用其他伺服器繞過環境限制。封面與圖解靜態渲染不是完整本機頁面預覽，正式發布仍須完成 policy、check、test、production build 與正式站驗收。
