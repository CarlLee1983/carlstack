# .NET OOB 修補交付驗收，2026-10-26

## 範圍與去重

Fresh main 11d58e84fae86d2da323a08ece77b6dc2095c10d；Asia/Taipei今日只有系統設計16課，不計daily news。blog/research/queue 搜尋CVE-2026-70197、CVE-2026-114148、dotnet、.NET及公告493未見相同事件核心文章。近期Postiz、eMudhra、PHP等各有不同根因，不更新不相關文章。新文聚焦公告修訂如何重新驗收deployment，Linux archive ownership另篇處理安裝資料語意，互連而不重複全文。既有系列主要為API、資料庫、AI、每日設計等，本篇獨立維運分析，不為填號硬套系列。

讀過AGENTS、content-guide、schema、deployment workflow、copywriting、humanize-writing及zh-tw/narrative references。Trail CLI與cache不可用，直接按明示路徑和完整搜尋fallback。未變更站台程式/設定。

## 一手來源

- https://devblogs.microsoft.com/dotnet/dotnet-october-2026-oob-security-updates/ ，2026-10-25。完整OOB release：8.0.33、9.0.22、10.0.14、11RC3；Brotli/ownership及兩個原10月13修補不完整。Brotli路徑有request/response decompression（非預設）與直接API，Framework不受此Brotli問題。FDD重啟、SCD重建、container重建部署等原廠建議。此來源摘要限必要事實，不全面翻譯。
- https://github.com/dotnet/announcements/issues/493 ，2026-10-25修訂，初版10月13。Windows重用SocketAsyncEventArgs跨IPv4/IPv6 datagram，ReceiveFromAsync越界寫；High8.1。受影響分支8/9/10及11preview，Windows8同含CoreCLR/Mono；修補版本依正文。
- https://learn.microsoft.com/en-us/dotnet/core/deploying/ ，全文查讀2026-10-26。framework-dependent與self-contained定義、安裝搜尋/DOTNET_ROOT、SCD不隨主機patch更新；single-file可以FDD或SCD，未以外觀判斷部署型態。
- https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-decompression?view=aspnetcore-10.0
- https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclienthandler.automaticdecompression?view=net-10.0

無已利用證據，不把可利用或RCE分類寫成實際攻擊。未安裝.NET、未重現漏洞、未測runtime/rollout，驗收路徑為作者工程建議。主機/容器/SCD教學案例明示虛構。

## 封面

近鄰Postiz為薄荷毛氈/俯視印章/粉彩，VeloCloud為黃銅儀表/正面/黑金。新封面採gouache cut-paper/斜向燈與包裹/紅藍米白/日光，媒材構圖色系差異，非AI dashboard。正式image_gen生成1672x941，原檔../generated_images/exec-ffb05208-ba17-4a61-b835-30332fb96d98.png，sharp轉WebP。full與320x180卡片已實際目視，無文字logo。alt依實圖。無必要流程圖，以分段因果說明更新差異。

## 驗收紀錄

Node24.22.1；預設pnpm11.25 engine拒絕，使用已存在官方pnpm12.1.0工具，不改engines/lockfile，frozen install成功。其他最終gates在發布前執行，不能提前稱通過。

Parent全文review後補充：開頭標假設團隊；Brotli直接鏈494，NativeAOT重建；Blazor獨立Server/DevServer更新與除錯器重啟依492，不能僅更新shared runtime。已讀兩份完整官方公告：

- https://github.com/dotnet/announcements/issues/494
- https://github.com/dotnet/announcements/issues/492

本機 ASTRO_TELEMETRY_DISABLED=1 pnpm dev --host 0.0.0.0 報 Dev server process exited before becoming ready；未繞過，桌機/320px深淺色本機實頁未驗，使用已授權預覽例外。封面目視不能替代實頁，正式線上另驗。
