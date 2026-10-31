# 匯出接單與執行額度研究

查核日期：2026-10-31，系統設計每日實戰第 20 篇。

## 去重與範圍

以 main a055cf512240cff956fe6e90a54ff6865963f4ba 為起點，讀取佇列、現有系列、研究與文章全文搜尋。既有系列 1–19，10 月 31 日尚無新文。最近一篇 export-snapshot 決定同份報表的資料版本，本篇決定同時接受與執行的工作量；retry-budget 處理對外重試額度，本篇是主庫非關鍵報表的接單與執行資源。內鏈三者及容量預算、接管。未採用未完成的全球多活或 Raft 佇列題，避免在未有讀者驗收下提高難度。

## 一手來源與主張

- https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/ 完整文章可讀，轉址到 AWS Builder Center，同名 David Yanacek 文。佇列可能累積不可恢復延遲；文內分別討論工作隔離、併發限制及向上游施加背壓。本篇不套用其 Amazon 訂單接受策略到可丟棄報表。
- https://sre.google/sre-book/handling-overload/ 官方全文，QPS 無法代表不同請求成本，拒絕本身也有成本，按 criticality 處理負載。文章只引用成本差異，停止門檻是教學設計。
- https://dev.mysql.com/doc/refman/8.4/en/kill.html 官方全文，KILL QUERY 保留 connection，KILL CONNECTION 同時終止 connection；中止旗標及清理時間說明支撐取消返回不等於資源立即釋放。

數字 12 個等待、2 個執行、30 秒執行期限、3 分鐘等待期限、7 天範圍、2 萬列、20 次下單／秒、500 ms／1%／三個一分鐘窗都是教學假設，非來源效能數據。沒有執行 DB 整合、壓測或取消測試，內文清楚標為測試計畫。2÷30 與 6 輪×30 的算式只在理想服務時間假設下成立，不構成 percentile SLO。

## 封面方向

最近快照篇：夾住紙張與琥珀鏡片，攝影式靜物、低視角、綠金色、柔光。
較早待辦年齡篇：紙卡與時鐘、紙材插畫、俯視、藍黃白、明亮。
本篇：黃銅閘口後兩條紅色處理軌道與獨立藍色通道、木材金屬建築模型、斜俯視、珊瑚紅與灰藍、清晰陰影。媒材／構圖／配色與上一張至少三項不同。原創正式 imagegen 生成，無字無商標，WebP 供網站。保留原生成母檔於工作區，不進部署。

## 驗收

本地 frozen install、format、content policy、astro check/build 與 117 tests 通過。原生 SVG 桌面深淺色離線渲染、封面全圖與 16:9／16:10 卡片已目視。正常本機預覽程序退出，瀏覽器 localhost 拒絕連線，故 320px 實頁及完整頁面深淺色尚未驗；沒有繞過限制。正式部署與 live 驗證另由發布收據記錄，不把此處當已上線。獨立技術審稿後已補原子領取、DB session／worker世代對應、取消不確定時停領與三分鐘過期邊界。Codex CLI 6.1 sol medium 啟動前因唯讀 app-server home 失敗，未產生文章；由本任務直接完成。Trail binary/cache 均不可用，使用完整文字檔查重，未聲稱執行 trail。
