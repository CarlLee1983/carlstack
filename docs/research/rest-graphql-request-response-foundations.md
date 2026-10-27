# REST / GraphQL 基礎篇查核

- 來源要求：2026-10-27（Asia/Taipei），使用者提供短片並要求新增基礎內容，後續明確擴為當日六篇基礎系列。本篇為「後端工程基礎圖解」第 1 篇，不計入每日系統設計新文。
- 原始分享：https://www.facebook.com/share/r/1PM1vKorBz/
- 正規來源：https://www.facebook.com/reel/2593394331167408
- 穩定 ID：2593394331167408；作者 Asad - Software Engineer；可見標題 How Rest api works and how it is different from graphql。
- 公開瀏覽器查核看到開始與約 9.93 秒畫面；未聲稱取得音軌逐字稿。GraphQL 一側選 user/name/posts/title，REST 一側額外含 followers，不能直接作同工作量效能比較。未複製影片畫面。
- 去重基準：main 80406c8（查核），整合基準更新至 897b7de。來源 URL／ID／作者未見於既有文章、研究及候選紀錄。三篇既有 API 選型／GraphQL 生產文屬進階層，不重寫其核心；新篇以一份相同資料的 HTTP 契約作入門。

## 主張與一手來源

- HTTP 方法、URL 資源、表示、狀態碼：https://httpwg.org/specs/rfc9110.html#GET 。教學 HTTP/1.1 片段省略完整連線細節，JSON 是格式不是傳輸協定。
- 欄位選擇：https://graphql.org/learn/queries/ 。同一姓名與兩篇文章標題，不納入影片額外 followers。
- schema 與 resolver：https://graphql.org/learn/execution/ 。resolver 取值不等於每欄一條 SQL。
- POST / query GET 與權限：https://graphql.org/learn/serving-over-http/ 、https://graphql.org/learn/authorization/ 。不把 query 欄位選擇當授權。
- 請求數、N+1、快取與限制：https://graphql.org/learn/performance/ 。REST 聚合是可選應用契約，不是所有 REST 必有 include。
- DataLoader：https://github.com/graphql/dataloader#batching 、https://github.com/graphql/dataloader#caching 。批次函式由開發者提供，每個 loader 有其快取，通常逐請求建立以隔離使用者。
- 舊文 APQ 窄修：https://www.apollographql.com/docs/apollo-server/performance/apq#using-get-requests-with-apq-on-a-cdn 。GET hash 要明確客戶端設定；query registry miss 不等於 CDN response miss。

所有技術來源均讀取官方原文，2026-10-27 查核。未做真實 API / SQL / 壓測；數字 80 ms 為明示教學假設，JSON／HTTP／GraphQL 為自創契約示例。

## 舊文一致性修正邊界

`api-architectural-styles-rest-rpc-graphql-webhook`、`grpc-vs-rest-vs-graphql-communication-boundaries`、`graphql-production-architecture-federation-dataloader` 保留 publishDate，新增 updatedDate。僅修正 POST-only、快取、APQ、resolver/SQL 與 DataLoader 機制及互連；不改 gRPC 效能數值、Federation 整體論述或無關圖形。

## 圖片與圖解

- 正式 imagegen 新建封面：`src/assets/covers/rest-graphql-request-response-foundations.webp`，1672 × 941，無借用影片畫格。
- 原始生成輸出：`generated_images/exec-0cde5c0c-7feb-42c1-b7d9-8c99b99903dc.png`（工作區，不提交）。
- 封面矩陣：既有 API 為暗色藍光 3D 樞紐、GraphQL 為暗色黃綠 3D 網路；新篇為暖白／陶橘／灰青、俯視紙雕信封與套袋、柔和日光。媒材、構圖、色盤及氣氛皆不同。
- 生成 prompt：original wide editorial tactile paper-cut cover; two cream envelopes carrying profile/document cards alongside one fitted sleeve holding same cards; ivory, terracotta, muted teal; top-down, soft daylight, crop-safe central subjects; no text, logos, watermark, dark hardware/network motifs.
- 已目視原尺寸及 400 × 225（16:9）與 400 × 250（16:10）中央卡片裁切，主體可辨，無文字／logo。
- 原生 `ApiRequestBoundaryDiagram.astro`：三種相同資料契約，分開 HTTP 與資料來源邊界。桌面 SVG，窄版 HTML 卡片；僅使用 --dg-* 主題 token。
- 全站檢查與正式部署證據由批次整合紀錄補入，不把未跑的檢查標成通過。

- API 圖解已以原生 SVG 與實際 token 色值離線轉繪，目視 900 × 570 深／淺色，文字與箭頭不重疊；這不是實頁或手機瀏覽器驗收。兩份 JSON 資料片段已用 Python json.loads 解析通過，未執行 HTTP 服務。
