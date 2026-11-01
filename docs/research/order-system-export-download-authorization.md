# 匯出下載重新授權查核

查核日期：2026-11-01（Asia/Taipei）。系統設計每日實戰第 21 篇。

## 去重與範圍

- 基底 main：`2e2eb616b079693997978ced02eb53d937d01b32`。核對最新文章、研究、article-queue、分支、open PR 與 main 部署。當日沒有本系列新文或未完成稿，沒有 open PR；基底 main 的部署成功。
- 系列原有 1–20。第 15 篇處理固定顧客所有權，第 19 篇固定匯出資料快照，第 20 篇限制等待／執行資源。本篇處理受理後權限改變與下載交付時點，新增收穫不同，正文互相連結。
- 搜尋正規化來源 URL、來源機構與「匯出／下載／撤權／presigned」主題。OWASP 與 S3 文件可能支援既有文章，沒有把同一官方文件誤當成只能使用一次的題材。本篇不重寫一般物件儲存介紹或 API 所有權教學。
- 佇列沒有本題，不新增已完成標記；只透過文章與本紀錄保留系列狀態。
- 已讀 AGENTS、content-guide、schema、部署 workflow、copywriting 與 humanize-writing 技能、diagram-guide。環境沒有 trail 指令與已建置的 cache，改以實際檔案查核。

## 一手來源與段落對應

1. https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#validate-the-permissions-on-every-request
   - 原文已讀。每次請求驗證權限、靜態資源存取控制、伺服器端檢查與安全拒絕。
   - 支持「資料快照固定，讀取資格仍會改變」與私有檔案入口；沒有聲稱 OWASP 要求所有系統都代理傳輸檔案。
2. https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html
   - 原文已讀。簽署者 IAM 憑證、bearer 性質、有效期內可重複使用、憑證提早失效、HTTP 請求開始時檢查到期、已開始下載可跨越到期時間。
   - 支持「短效簽名網址省傳輸，也留下有效期」。單改應用員工角色不會自動撤銷已簽網址，是明示的工程推論，前提為簽署憑證與儲存政策未改；未宣稱簽名網址完全無法撤銷。
3. https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.5
   - 原文 no-store 節已核對。支持符合規範的 HTTP 快取保存／重用限制，不把它寫成檔案召回機制。

## 教學契約與驗證邊界

- 虛構單體商店、自己的匯出才能下載、主庫即時授權、既有已授權串流可完成、完成後二十四小時有效、5 MiB 完整檔案上限、每天六十份與四條下載串流均為設計假設。
- 與第 20 篇保持最多兩萬列的連續設定；完整檔案限制獨立，任一上限超出就失敗，不交付截斷檔案。
- 估算重算：60 × 3 MiB = 180 MiB；4 × 1 MiB/s = 4 MiB/s；4 × 1,048,576 × 8 / 1,000,000 = 33.554432 Mbit/s，文中取約 33.6。讀入與對外流量分別計算，未計協定開銷。
- 沒有可執行業務程式碼、實際 S3 操作、資料庫整合或負載測試。六項整合情境與簽名網址案例是待執行驗收計畫。
- 獨立審查已檢查來源、撤權競態、估算、重複風險與 SVG 座標，修正前篇筆數引用。humanize-writing checker 已執行，機械提示為零，另人工檢查假設與不確定性。

## 原創封面與圖解

封面方向比較：

- 第 19 篇：金屬夾／鏡片；立體靜物；綠與琥珀；側向近景；斜射光。
- 第 20 篇：閘口與輸送帶；立體機械；珊瑚紅與藍；斜向全景；明亮工作室。
- 本篇：半透明屏板前的卡片與私有報表；紙雕與磨砂玻璃；紫與米白；正面分層；柔和漫射光。媒材、構圖、主色與光線均不同。

正式 imagegen 生成一張原創圖片，沒有使用第三方圖。提示重點是 wide landscape、central crop safe、folded ivory paper report behind translucent plum screen、lilac access card、paper collage、no text/logos/watermarks。實際畫面帶有紙雕手持卡片與左側花枝，alt 按實際主要資訊描述。

輸出為 `src/assets/covers/order-system-export-download-authorization.webp`，1672 × 941 px，172,976 bytes。全尺寸及 480 × 270 卡片裁切已目視，沒有可辨文字或商標，報表、屏板與卡片仍可辨。

原生 SVG 元件使用中性色 tokens、獨立桌面與直向窄版、title/desc 與前綴 ID。靜態座標檢查通過，不等同瀏覽器目視。

## 預覽限制

本機 `pnpm dev --host 0.0.0.0` 回報 dev server 在 ready 前退出；瀏覽器讀取預覽回報 ERR_CONNECTION_REFUSED。因此未完成本機文章桌機／320 px 與深淺色實頁目視，未關閉限制或修改站台設定。依發布授權，單純預覽限制不阻擋來源及其他必要檢查完成後發布。正式站核對另留發布收據，不能由這份紀錄推定已上線。
