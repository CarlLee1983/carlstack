# 訂單修改 API 的空值處理查核

2026-11-13，系統設計每日實戰第30課。

## 去重與範圍

最新 main 67ace24726b896f59e066410e30f171c74b5fbb4，open PR 空，今日沒有本系列稿件。已核對文章、queue、research及系列1至29，按 null、JSON Merge Patch、欄位省略與來源URL查重。第16課談新增欄位與歷史未知值，第27課談同時編輯，第29課談ID精度；此次只處理修改請求的省略、清空、替換意圖。既有篇章以內鏈銜接，保留其發布時間。

已讀 AGENTS、content-guide、schema、部署workflow、architecture、diagram-guide及copywriting/humanize-writing繁體和敘事規則。Trail指令與cache不存在，使用直接檔案查閱。標題依使用者最新要求自然描述題材，取代舊指南主張式標題。沒有變更站台程式或設定。

## 來源

當日開啟原文查核，未以摘要代替全文：

- https://www.rfc-editor.org/rfc/rfc5789.txt 第2節：PATCH格式由media type決定，整組修改原子套用；不能由方法名稱推定null語意。
- https://www.rfc-editor.org/rfc/rfc7396.txt 第1、2節：物件成員null代表移除，省略保留，陣列整體替換；不適用所有含明確null的資料表示。
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn ：檢查own property，null與undefined也可存在。
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify ：物件中的undefined省略、null保留。

自訂application/json契約是教學設計，不冒稱符合Merge Patch。SQL NULL與JSON成員移除明確分開。未知欄位拒絕、完整驗證後回傳修改集合，不做任意mass assignment。

## 實測與估算

Node24.22.1已執行文章原始JS：省略保留、null清空、有效字串替換、另一欄不變、10種無效輸入拒絕、JSON序列化後undefined省略/null保留，以及原物件不變。667個「香」為2001 UTF-8 bytes，超過2000上限。沒有資料庫、HTTP、SDK或ORM整合測試。每秒20請求×8KiB=160KiB/s只算請求本文；兩欄各2000bytes與線上JSON跳脫大小區分。p95 300ms為假設目標，沒有壓測推論。

人工檢查標題、段落與程式說明；humanize檢查器提示性冒號已改直述。正文以三個JSON範例直接表達三種意圖，不新增流程圖。

## 圖片與視覺

最近封面為暖褐俯視紙卡攝影，新封面採靛藍背景、陶瓷雕塑、側視三板及冷光，媒材、構圖、主色及光線不同。正式image_gen生成原創圖片，轉1600×900 WebP，目視全尺寸與320×200卡片，三種狀態可辨識，無文字或商標，coverAlt對應實圖。

本機預覽首次因Astro telemetry設定目錄不存在退出；以官方telemetry disabled環境變數重試後仍在ready前退出。瀏覽器localhost:4321顯示ERR_CONNECTION_REFUSED，依使用者允許例外繼續，沒有另架伺服器或繞過限制。完整本機桌面、320px與深淺色頁面驗收未完成。

## 工具鏈

雲端獨立checkout，Node24.22.1，corepack pnpm12.1.0。pnpm install --frozen-lockfile通過，鎖檔未變。最終format、policy、check/build、test及精確main部署由本次執行與交付紀錄核實。
