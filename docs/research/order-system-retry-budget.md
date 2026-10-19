# 系統設計每日實戰 09：退款外呼預算

## 去重與範圍

2026-10-19 Asia/Taipei；最新main 5c7d6a3d3eaa2028a6d98bc7610c16be88e50e67。系列1–8完整，無第9篇或本系列未完稿。open PR空、remote分支只有既有其他稿與修正。搜尋blog/research/queue的重試預算、背壓、AWS原URL/轉址URL、Google overload及Stripe idempotent_requests；第4篇重試為本地交易冪等，第6篇付款晚到提Stripe冪等，與本篇共用外呼速率/在途/積壓決策不同，內鏈不另改舊文。未觸碰取消Oct16新聞稿。

已讀AGENTS、content-guide、schema、部署workflow、diagram-guide、copywriting與humanize-writing及zh-tw規則。Trail命令與cache皆缺失，改檔案搜尋。單一文章4檔：正文、封面、圖解、查核紀錄。使用者授權本系列查核後直接發布main。

## 一手原文與段落對應

2026-10-19讀取原文：

- https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/ 轉址 https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter ：重試加重過載、各層重試放大、退避與jitter、timeout副作用可能已發生。本文僅必要摘要，保留主來源網址。
- https://sre.google/sre-book/handling-overload/ ：QPS不完整代表成本，客戶端發送節流。本文不照抄Google adaptive公式，5calls/s為自行教學假設。
- https://docs.stripe.com/api/idempotent_requests ：API v1保存開始執行後首回應含500、相同key/參數、至少24h後可能清除、清除後重用新請求。正文限定v1，不誤套v2或虛構供應商；不宣稱24h後必定刪除。

事故事例、所有數字、單派送程序、兩組公平取件、人工責任與驗收都是工程設計建議，非作者親測或官方產品配置。未執行MySQL、Redis、供應商或壓測，不提供假通過結果。

## 工程邊界

每秒5次平滑啟動（200ms間隔）與本地在途10不同單位；timeout3s只限制本地等待、不保證遠端取消。部署不重疊、重啟保守等待、無閒置token累積。第二派送程序前需另協調全域額度。三次自動退款嘗試/15min轉人工是假設，核對也有限次/間隔且占總額度；未完成案件不可刪。SDK重試計入或由派送器接管。結果未知保留同識別值核對，不換key；已受理責任保留。限速≠結案率，240/(5−2)=80s、240/(2.5−2)=480s、練習600/(10/2−3)=300s均為簡化未實測估算。

## 封面與圖解

已看#7苔綠紙藝正面卡匣與#8藍印章杏橙拓印。新封面用金屬閘門/紅玻璃球、寫實微縮靜物、斜視長透視、銀黑酒紅黃銅、側光，至少三欄與鄰篇不同，只延續16:9。

正式imagegen原創PNG1672×941，轉WebP1600×900；全尺寸及320×180卡片已目視，無字/標誌，alt符合。Prompt：original editorial still-life of brushed metal sluice gate on black slate, burgundy glass spheres waiting upstream and few passing narrow brass gate, photographic miniature low three-quarter, side light, silver charcoal burgundy brass, 16:9 crop safe, no text/logos/UI/arrows/watermark. 原圖保留，非第三方素材。

RefundRetryBudgetDiagram為原生SVG960×560與窄版HTML卡片，title/desc、dg tokens、48rem互斥、無Mermaid/中性色硬碼。圖解說明教學假設與本地timeout邊界。

## 驗收

雲端Mac離線、saved coding environments空，本雲端獨立/tmp工作區。Node24.19.0與Corepack隔離cache pnpm12.1.0，frozen-lockfile安裝通過。執行命令指定ASTRO_TELEMETRY_DISABLED=1、TELEMETRY_DISABLED=1、WRANGLER_SEND_METRICS=false、WRANGLER_SEND_ERROR_REPORTS=false，未改站台配置。完整稿經獨立審讀，修正付款晚到內鏈文字與保守重啟說明。

最後檔案的format/policy/check/build/test與產物索引核對，由本次執行紀錄確認。實頁目視限制與正式發布證據在完成驗收後補記；本文不將尚未執行的工作宣稱已通過。

本次pnpm dev回報Dev server process exited before becoming ready；雲端Chrome預覽ERR_CONNECTION_REFUSED，curl亦無server listening。未繞過限制。桌面/320px與深淺色實頁預覽未完成，依使用者預覽例外不阻擋；封面全尺寸與卡片已目視，不能替代實頁驗收。
