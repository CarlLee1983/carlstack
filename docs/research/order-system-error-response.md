# 訂單 API 的錯誤回應查核

2026-11-14，系統設計每日實戰第 31 課。

## 範圍與去重

核對 main 92369498fe7b31cf5b71fda48a97544708d4d4e4、open PR（無）、queue、research 及系列 1–30。以 RFC9457、problem+json、錯誤回應及來源網址查重，沒有相同核心文章。第 4 課談冪等、第 15 課談授權，本文內鏈銜接但不重寫規則。11/14 尚無本系列稿件。

已讀 AGENTS、content-guide、schema、部署 workflow、copywriting、humanize-writing 與繁體規則；Trail 命令與快取不可用，直接查閱檔案。標題遵循使用者要求直接說明題材，不採結論拼接標題。獨立 checkout，沒有修改其他人的工作。

## 來源與段落

當日開啟官方 HTML 及下載 TXT 原文查閱，非搜尋摘要。

- https://www.rfc-editor.org/rfc/rfc9457.html#section-3.1 ：共用格式段落；type 主識別值、title/detail 人類可讀、status 與 HTTP 同值、instance 可為不可解析 URI。
- https://www.rfc-editor.org/rfc/rfc9457.html#section-3.2 ：擴充欄位段落；忽略不認得的擴充，errors 具體結構為案例契約。
- https://www.rfc-editor.org/rfc/rfc9457.html#section-4 ：既有格式、類型文件與遷移；既有格式可繼續使用，不強迫遷移。
- https://www.rfc-editor.org/rfc/rfc9457.html#section-5 ：公開診斷資訊風險、狀態碼不一致。
- https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.10 ：409 與資源當前狀態衝突。
- https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.21 ：422 的型別、語法正確但指令無法處理條件。

3 種錯誤分類、2 KiB 上限、p95 300ms 與客戶端動作都是虛構案例設計，不是標準強制規則。本文 HTTP 為契約示意，不是可執行服務；沒有 HTTP/資料庫/前端整合測試或壓測。100×2%×2 KiB=4 KiB/s；2×86400×1 KiB=172800 KiB=168.75 MiB，均為教學假設。

## 編輯與圖片

人工中文及技術審查完成。移除提示性冒號；將機械檢查器誤判的「錯誤代碼」改為錯誤識別值，未改成錯誤程式碼。未知錯誤不預設自動重試，公開錯誤先經授權，與前課一致。

最近第30課為靛藍陶瓷雕塑、冷光及三塊板；本篇為米白紙雕攝影、暖光、前後景紙卡與閉合資料盒，媒材、構圖、主色與光線均不同。正式 image_gen 生成原創封面，輸出 1600×900 WebP。人工看過全尺寸與320×200裁切，主體完整、無文字標誌，alt 對應實圖。本文沒有額外圖解，HTTP 範例已能呈現契約。

## 驗收

Node24.22.1、pnpm12.1.0。鎖定安裝通過。最終格式、內容政策、型別、測試及建置結果與部署依本次執行紀錄核實。正式上線必須核對精確 main commit，不以 PR check 代替。

本機預覽以 ASTRO_TELEMETRY_DISABLED=1 啟動仍於 ready 前退出（Dev server process exited before becoming ready），localhost 回應不可連線。依授權不另架伺服器繞過限制；本機桌面/窄版與深淺色實頁目視未完成。封面兩種尺寸的本地目視已完成，發布後另核對正式頁面。
