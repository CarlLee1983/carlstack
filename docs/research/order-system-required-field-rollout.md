# 系統設計每日實戰 16：新必填欄位與歷史未知值

## 去重及範圍

2026-10-26 Asia/Taipei，獨立 checkout main 60dd7c0。讀過 AGENTS、content-guide、schema、workflow、testing、diagram-guide、copywriting、humanize-writing 與 zh-tw/narrative-zh-tw。Trail CLI/cache 均不存在，按檔案 fallback 搜尋。當日 blog/research、可見 refs/commit 無新課；1–15 課連續。queue 的多活與共識屬另一條研究線，不強行提高難度。新增欄位共存、未知與顧客明確選擇的差異尚未成為既有核心題目，引用第4、13、15課而不改其正文。

主決策是保留歷史 unknown 與新結帳契約必填，不以全表 NOT NULL 為終點。起初 delivery_note 題材經父對話挑戰後換為配送偏好，承認 default 在省略本就有既定意思時合理，避免稻草人。checkout_version 是成立契約，不隨有來源回填變成2。所有物流支援皆為案例假設，沒有實際供應商或使用者私人專案資料。

## 一手來源（2026-10-26）

已由技術審閱及作者開啟原始官方文件，逐段核對，不把搜尋摘要當全文。

- https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl-operations.html ：Column Operations 的 ADD COLUMN、instant 限制與多欄位範例。明寫 ALGORITHM=INSTANT 不支援即失敗，不保證正式表 eligible。未把 MODIFY NOT NULL 當 instant；本文不需要該操作。
- https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl-performance.html ：Online DDL and Metadata Locks，長交易可令排他 metadata lock 等待，等待中的排他鎖亦會阻擋後續交易。
- https://dev.mysql.com/doc/refman/8.4/en/alter-table.html ：instant 不支援 LOCK=NONE，只允許 default lock；SQL 未搭配 NONE。
- https://dev.mysql.com/doc/refman/8.4/en/data-type-defaults.html ：欄位省略與預設值；nullable implicit DEFAULT NULL；業務語意是作者設計判斷。
- https://dev.mysql.com/doc/refman/8.4/en/working-with-null.html ：NULL 不等於空字串，使用 IS NULL 而非 = NULL。

SQL 是未執行的設計片段，沒有宣稱 MySQL、migration、物流或壓測成功。100萬筆、500筆/批、100ms交易、400ms休息、2000批/1000秒/16.7分鐘及300ms p95門檻均為教學假設，算式人工核對。

## 圖像與編輯

最近兩課封面：14課紫色瓷製階梯、15課深綠紙雕資料夾與珊瑚底。新圖採網版印刷、俯視木盤、淺藍/赭黃/鈷藍、平面均勻光；媒材、構圖、色系皆有差異。正式 built-in image_gen 生成1672×941 PNG，轉 WebP；完整與320×180卡片實際目視清楚，沒有文字或logo。原始來源 ../generated_images/exec-41ffc8b1-3eb6-4529-bfd1-292b72605f6a.png。

Prompt 要點：16:9 editorial screenprint, overhead oak tray, blank cream slips separated by brass divider from one sun-marked slip, warm ivory/cobalt/mustard/pale-blue, no text/logos/arrows/UI. 保存 src/assets/covers/order-system-required-field-rollout.webp，alt 依實圖。

原生 SVG 使用三階段寬列卡、960×600，窄版獨立 HTML 直排；全色走 dg tokens，沒有寫死中性顏色。圖只說部署先後，不重述全文。

父對話已全文審閱，修正版本1回填呈現與假設演練措辭。humanize checker 的術語標籤冒號為有意義欄位定義；已移除敘述型提示冒號與『以下是』。

## 驗收

Node24.22.1，隔離 npm cache 取得 pnpm12.1.0，frozen install 成功，未改 engine 或 lockfile。初次 Astro dev/check 因 telemetry 設定目錄不可寫而退出。僅以 ASTRO_TELEMETRY_DISABLED=1 關閉可選遙測後重跑，不修改專案；dev 仍報 Dev server process exited before becoming ready。Playwright 系統 Chromium 啟動被 socket Operation not permitted 阻擋，未繞過限制。桌機/320px與深淺色實頁預覽未驗，依已授權預覽例外繼續。封面像素已目視，不能代替實頁。後續技術 gates 記於交付；未把 DB 測試列為已通過。
