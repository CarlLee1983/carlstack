# 系統設計每日實戰 15：訂單明細物件層授權

## 去重與範圍

2026-10-25 Asia/Taipei，獨立 checkout 起點 main 95e4e4e1c61c79498dbd50c83502b98119c49a61。已讀 AGENTS、content-guide、schema、兩份 workflow、testing、carlstack-copywriting、完整 humanize-writing SKILL、zh-tw 及 narrative-zh-tw。Trail 不在 PATH，cache 不存在，使用查檔 fallback。

協作審稿全文讀完既有 1–14 課及兩份 system-design backlog。blog、research、queue、all refs 與近5次部署未發現 Oct25 第15課或同題未完成稿。queue 的多活及Raft屬另一條高階研究線。舊文第4、5、8、12、13課附帶提及授權，沒有展開顧客明細的物件層授權契約，正式文章內鏈第4、8、13課。維持原難度，沒有自動升級進度。

起稿前已向 parent 提出大綱與一手來源計畫，確認只處理可信 principal、本人範圍查詢、輸出與快取路徑，不新增微服務、多租戶、分享或客服政策。parent 全文與來源複審通過後才進入正式發布。

## 一手來源查核

查核日期 2026-10-25，使用原始完整官方頁面，非搜尋摘要。OWASP 兩篇全文已讀，Laravel 讀 Introduction、Policy、執行入口及狀態碼段落，RFC 讀快取回應指令原文。

- https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/ ：每個接受物件 ID 的操作都應檢查該物件的動作權限；UUID 也可能成為越權請求的 ID。沒有把單純比較 session user ID 與任意 request ID 當成解法，案例核對的是訂單所有人。
- https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html ：Identifier complexity、Verifying access controls、Mitigation。複雜 ID 為額外保護，拿到有效連結仍要拒絕；兩帳號交換物件作驗收。
- https://laravel.com/framework/docs/13.x/authorization ：實際從 laravel.com/docs/13.x/authorization 轉址後讀取。登入驗證與資源授權不同；Policy 組織模型規則。denyAsNotFound() 可映射404，但仍需註冊／執行授權，沒有宣稱自動保護路由。
- https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.5 ：no-store 限制符合規範的私有及共享 HTTP 快取；不代表消除隱私風險，未把它擴張為 Redis、應用 log 或既存快取清除機制。

SQL 是明標未執行的設計片段，不宣稱 MySQL 或 HTTP 整合已通過。100req/s、平均5ms連線持有、0.5條平均占用、4KiB與400KiB/s、p95 200ms均為假設，非量測與pool設定建議。

## 人工編輯

標題採直接說明明細API與本人範圍，沒有沿用『再…也…』對比模板。人工改寫 description、開頭、三處鋪梗冒號與DTO段落，修正兩處『返回』及估算中的『等待時間』為平均連線持有時間。checker 只作輔助，剩餘『偵測異常』是正常台灣用法。沒有加作者親歷、未跑的測試結果或口頭禪。

## 原創封面

目視最近第13課水彩黃銅壓機（米白靛藍赭黃、斜向俯視）及第14課白瓷階梯（紫橘白、斜向3D）。新圖採紙雕、正面平面雙資料夾、森林綠與珊瑚色背景、側光，媒材／構圖／色系不同。

正式 built-in image_gen 原創。1672×941 PNG 轉 WebP，保存 src/assets/covers/order-system-detail-authorization.webp。原圖 ../generated_images/exec-c5fc9610-4a3e-4ee4-938b-c8143dde3b0c.png。完整圖及320×180卡片均已目視，無文字或logo，主體清楚。alt 依實際紙雕手、圓卡、圓／方開口描述。無需圖解，未增加 SVG 或前端元件。

Prompt：original 16:9 editorial cut-paper collage, two dark-teal folders with matching circular and nonmatching square apertures, a cream order slip with coral circle, frontal composition, pale salmon background, tactile layered shadows, no text/logos/arrows/UI.

## 驗收紀錄

Node24.22.1；使用隔離npm cache取得pnpm12.1.0，pnpm install --frozen-lockfile成功，未改engine或lockfile。

正常嘗試 Astro dev，ready前退出：Dev server process exited before becoming ready。Playwright啟動系統Chromium失敗：process_singleton socket() failed: Operation not permitted。未改專案設定或另行繞過限制。實頁桌面／320px及深淺色預覽未完成，依已授權環境預覽例外繼續；封面完整與卡片像素驗收已完成。

正式false與實際台北時間設定後，重新format／stage並跑content:policy、check、test及最終production build，結果由交付訊息與部署紀錄提供。只有完成部署與正式站內容核對後才能稱已上線。
