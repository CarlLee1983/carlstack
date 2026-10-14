# 2026-10-14 快報文章查核

窗口 2026-10-13 02:00–2026-10-14 02:00 UTC；來源查核 02:00–02:12 UTC。發布復原檢查 03:20 UTC 起。基線 bed9331b55b86020316c62d08a3d8eb921da67f0。

## 去重與處理

搜尋 blog、research、queue 的 Scion/redesigning-source-control/CVE-2026-104935/Connect Secure 未命中相同來源；兩篇新增。Scion 在 AI Agent 工程化與工作流實戰順延第86篇，前85為Magpie。Gemini搜尋命中原文，沿既有slug及原publishDate更新、series41保留。没有計入同日系統設計實戰。

## 原始資料與判斷

Scion全文 https://www.anthropic.com/engineering/redesigning-source-control ，10/13僅日期。公司自述內部遷移、每日三萬次變更、server-side模式及非通用Git替代。正文其餘為原創工程建議；500jobs×2GB、10/6分鐘均假設，未實測Scion/CI。Git https://git-scm.com/docs/partial-clone 與 https://git-scm.com/docs/git-sparse-checkout 全文支持物件/工作樹區別。內鏈品質門檻/執行收據已有稿。

Gemini全文 https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/ 及 https://blog.google/innovation-and-ai/technology/safety-security/gemini-4-model-safety-security/ ，10/13。採有日期公告的1M unified input-output，未把1M輸出另加輸入；限時價格/11月30日優惠期限精確。2%為廠商coding評測而非普遍發生率。原文無充分來源支持CodeMender快照/回滾/部分評測，明示更正並刪除；保留工程建議但不冒稱產品功能。未實跑模型。US$0.90/1.80教學算式，不含重試工具成本。

Ivanti完整來源在正文，NCSC公告、Ivanti CNA CVE JSON、CISA官方GitHubKEV feed交叉驗證。CVE 15:31UTC公開、KEV19:10UTC更新均在窗口。CWE290驗證繞過，任意命令執行是影響；CISA ADP active及KEV支持實攻。ransomwareUnknown，未推斷勒索。JSON列舉缺25.1.1.2但NCSC明列，正文揭露差異。主站CISA403/原廠portal無全文，未繞拒絕。沒有實際升級/漏洞實測/鑑識；維運清單是原創建議。

## 封面及驗收

正式imagegen各一次，PNG1672×941轉WebP；Ivanti淺綠紙雕三門、Scion橘黑版畫分流，媒材/構圖/配色均不同。全尺寸與320×180卡片已目視，無文字標誌，alt按實圖。沿用Gemini舊圖，無新架構圖。

初次依賴結果輪詢被取消，獲使用者許可後精確重試回Unknownprocess；環境已更換、資料遺失。由已讀查核稿重新寫回，從保留工具回傳還原原生成圖片，沒有重生圖片。依賴重新安裝及最終檢查於下節記錄。

## 本機預覽限制

2026-10-14 03:26 UTC，正常 `pnpm dev --host 0.0.0.0 --port 4321` 回報 Dev server process exited before becoming ready，localhost 無法連線。因此未完成本機桌面／窄版／深淺色實頁目視；按使用者授權，不以此預覽限制阻擋發布，正式站仍須獨立驗證。沒有停用測試或修改站台設定。

## 驗收紀錄

Node24.19.0 / pnpm12.1.0；frozen install 通過。format、3篇 changed content policy、65/65 單元測試通過。check 的 Astro186檔診斷為零錯誤／警告／提示；production build641頁、1787圖片、Pagefind639頁完成，三篇文章/RSS/sitemap及AI系列輸出均已檢查。初次 check 因巢狀pnpm取到預裝11.25.0失敗，改用本次程序PATH上的corepack shim後重跑成功；未改repo工具鏈或略過gate。最終本文紀錄格式化後再跑完整check與test，結果以執行紀錄為準。正式部署與正式頁驗收另行進行，這些本機結果不等於上線。
