# Siemens DLL 側載事件：來源與驗收

查核：2026-10-20，Asia/Taipei。時間窗 10/19 02:00 至 10/20 02:00 UTC；新聞增量是 10/19 官方確認實際利用，不是首次揭露或首次修復。

## 去重與編輯範圍

基於 main e60f451c5c9207f5576d92db9a6929666495d105，全文搜尋 src/content/blog、docs/research、docs/article-queue.md 的 CVE-2026-110936、SSA-580366、Siemens、Romulus、ClickFix，沒有同源文章。此篇為獨立端點安全事件，未硬接現有 API 或 AI 教學系列。以站內 SubQuery 套件載入事件作延伸閱讀。沒有改動其他文章或佇列。

## 親讀來源

- https://productcert.siemens.com/productcert/html/ssa-580366.html ：V1.2，全版本低於4.0.9.8受影響，4.0.9.8+修復，自動更新；10/15首次公告、10/17修復資訊、10/19利用說明。CVSS v4 8.4，AV:L/AC:L/AT:N/PR:H/UI:N；v3.1 6.7。不可改寫為遠端無權限零互動RCE。
- https://cert-portal.siemens.com/news/2026/10/19/active-exploitation-of-cve-2026-110936-in-siemens-software-center/ ：Romulus ClickFix，真實未修改3.5.8.7程式搭惡意DLL，在官方以外通路散布。官方表示目前所知沒有系統、產品、更新通道遭入侵。偵測應看路徑、父程序與行為，合法EXE hash不能排除此活動。沒有下載或執行樣本。
- https://learn.microsoft.com/en-us/windows/win32/dlls/dynamic-link-library-security ：DLL搜尋路徑、完整路徑、LoadLibraryEx搜尋旗標、SetDefaultDllDirectories與相容性驗證。
- https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/get-authenticodesignature?view=powershell-7.5 ：Get-AuthenticodeSignature取得指定檔案的Authenticode資訊，僅Windows。

## 推論與未測界線

更新受管理安裝與調查可疑副本分開、交接路徑與父程序、用自有無害DLL驗收完整載入路徑及缺件失敗，均為本文工程建議，沒有宣稱是Siemens修補的內部實作。資產已更新但另一目錄出現副本為明標假設。未實跑Windows、未取得惡意樣本、未查真實端點。來源事實採精簡轉述，其餘為原創工程建議。

## 封面與版面

正式 imagegen 原創 1672×941，WebP。最近兩篇為橘黑機械版畫與淡紫紙雕鑰匙；本篇改為橄欖綠/白/紅的不透明水彩風海島燈塔與黑色稜鏡，隱喻、媒材、景深構圖與色盤有區別。全尺寸與384×216卡片目視通過，無文字或商標，封面為概念隱喻。本文用短段落與編號測試計畫，不增加重複資訊的架構圖或表格。

Prompt: Use case: stylized-concept. Create an original wide 16:9 editorial cover for a software engineering article about a genuine signed executable loading an untrusted neighboring DLL. Visual metaphor: a pristine white porcelain lighthouse with a small embossed circular seal on its body, untouched, on a dark olive rocky island. A separate black glass prism placed beside the lighthouse intercepts its beam and casts an unexpected sharp crimson shadow; clearly two separate objects. Art medium: expressive gouache painting with matte brushed textures, wide cinematic landscape composition, main objects in central two thirds, olive green and chalk white palette with restrained crimson accent, overcast daylight. Sophisticated restrained magazine illustration, readable at thumbnail size. No words, letters, numerals, logos, watermarks, UI, code, hooded hackers, locks, keys, gears, or arrows. Do not portray a vendor or real incident scene. Cover metaphor is trust in an object not automatically extending to an adjacent component.

## 工程驗收

自有雲端隔離checkout，Node24.19.0、pnpm12.1.0。frozen-lockfile install通過，未修改lockfile或工具鏈設定。Trail CLI與cache不存在，採全文檢索。optional telemetry僅單次指令環境變數關閉。最終gate與部署結果以執行紀錄為準，不把來源查核當測試。

本次預覽實測：Astro dev 在 ready 前退出，localhost:4362 拒絕連線，未完成桌機／320px／深淺色實頁預覽。依使用者允許的預覽例外續行，封面全尺寸與卡片另已目視。此限制不替代內容policy、check、test、production build或正式站核對。

日期差異：SSA歷程10/17寫Added remediation，新聞說4.0.9.8已修復且10/15發公告；不把公告修改日推論為實際修正版發布日，正文僅保留10/15首發及10/19利用更新。
