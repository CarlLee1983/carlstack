# 訂單編號的 API 格式查核

日期：2026-11-12（Asia/Taipei），系統設計每日實戰第29課。

## 去重與範圍

起點 main：ed4ef38858fb2c5a07099b2e3a6a8f7bcc0eb6d5。已讀 AGENTS、content-guide、schema、部署 workflow、architecture、diagram-guide、copywriting、humanize-writing 繁體與敘事規則。Trail 指令及 cache 均不存在，改讀檔案。open PR 空、當日尚無本系列文章，系列1至28連續。queue 與 research 已查，沒有此題未完成稿件。

按 BIGINT、JSON、Number、MAX_SAFE_INTEGER、9007199254740993、來源 URL 與編號關鍵字查重。既有唯一ID文章處理生成方式；第27課一段提醒備註版本精度。此次聚焦訂單識別值的跨層序列化、固定型別及舊版契約遷移，不重寫編號生成，也不更換資料庫主鍵。內鏈至唯一ID、備註版本及明細授權。

## 一手來源

以下頁面於當日開啟讀取原文，沒有以搜尋摘要代替全文：

- https://www.rfc-editor.org/rfc/rfc8259#section-6 ：JSON number 語法、實作範圍與精度限制、安全整數互通範圍。
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER ：2^53-1及相鄰整數不可區分案例。
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json ：JSON.stringify 預設拒絕 BigInt，固定欄位序列化為字串的做法。
- https://dev.mysql.com/doc/refman/8.4/en/integer-types.html ：BIGINT UNSIGNED 的8-byte儲存與0至2^64-1範圍。
- https://github.com/sidorares/node-mysql2/blob/master/typings/mysql/lib/Connection.d.ts ：supportBigNumbers 與 bigNumberStrings 選項。來源是當日 master 文件，文章明示仍需核對專案鎖定版與實際 driver/ORM。

JSON 語法不等於 JavaScript Number 精確度。字串格式是教學系統的正值十進位契約，不套用到外部物流單號。不能由精度修正推定授權合格。沒有說所有超過上限整數都無法表示，也沒有說 BigInt 本身能修復既有失真。

## 實測與估算

Node.js v24.22.1 從文章抽取原始程式執行，輸出 PASS。五個有效 ID 包含安全上限、上限+1、上限+2及unsigned64上限，序列化後逐字相同、集合大小不變。13個無效輸入拒絕，包括數值型、null、空字串、零、前導零、負數、科學記號、小數、前置空白、換行、全形數字、混入字母與超上限。確認 JSON number 的9007199254740993變成9007199254740992、事後BigInt不會修復、JSON.stringify原生BigInt拋TypeError。

引號差額：100筆×2 bytes=200 bytes/回應；50回應/s=10,000 bytes/s≈9.8KiB/s。明標未壓縮、假設其他字數相同，不推導效能。MySQL、ORM、瀏覽器往返、效能未實測，正文集中揭露，後段列為讀者導入驗收。

標題採使用者要求的自然題材說明，覆蓋舊指南主張式標題要求。人工檢查小標、段落與台灣詞彙，humanize檢查器的一處提示性冒號已移除。

## 圖像與預覽

封面矩陣：前課是藍紫剪紙、正視時鐘；本課用暖褐桌面、俯視攝影靜物、三張米白壓紋卡和紅線，媒材／構圖／主色／光線不同。正式 image_gen 生成原創圖片，1600×900 WebP；已目視全尺寸與320×200卡片裁切，三張卡可辨識，無文字商標。封面僅為概念圖，不冒充資料流程驗證。

SVG 使用900×560桌面與288×650窄版、前綴ID、title/desc及--dg-* tokens。以實際SVG抽出靜態渲染，目視深淺色各兩版，文字未重疊或切斷。此為靜態圖驗收，不當成完整頁面視覺測試。

本機 pnpm dev 在 ready 前退出，雲端瀏覽器開localhost:4321回報ERR_CONNECTION_REFUSED。依使用者允許記錄限制後繼續，不另開伺服器繞過。完整本機桌面／320px頁面驗收未完成。

## 工具鏈與驗收

使用 Node24.22.1及官方corepack取得pnpm12.1.0，預設pnpm11.25不符合專案要求。pnpm install --frozen-lockfile 成功，鎖檔沒有改動。最終format、policy、check/build、test及正式部署結果由本次提交與交付紀錄核實。
