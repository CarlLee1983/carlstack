# 多實例部署的回源額度交接查核

查核日期：2026-11-06（Asia/Taipei）。系統設計每日實戰第 23 篇。

## 去重與選題

- 最新 main 起點為 `202aa41f8f8adf0682cc7c0b0ed4ed4feb40ea58`，對應 Cloudflare workflow `42131645406` 已成功。核對分支、open PR、commit、當日文章、docs/article-queue.md、docs/research 與完整系列，沒有 11 月 6 日同系列文章或未完成同題稿。
- 系列已有連續 1–22。第 22 篇提出多程序固定分配作為下一步，第 20 篇涵蓋單 worker 停舊再開新。本篇新增可驗證的四槽登記、程序啟動身分、不可逆退休、資料庫收尾與窗口退出的交接流程，沒有另寫一次一般限流介紹。
- 沒有變更全球多活與共識候選佇列，也不把科技快報計入每日實戰。第 22 篇只補一條延伸內鏈，正文與既有圖解不改。
- 已讀 AGENTS、content-guide、content.config、CI/deploy workflow、copywriting、humanize-writing、diagram-guide。Trail 指令與圖快取不可用，直接核對 repository 檔案。

## 一手資料與主張邊界

1. https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
   - 查核 rollout 注記與 Terminating Pods 說明。終止中的 Pod 仍消耗資源，總資源使用可能超出 replicas + maxSurge。
   - 此文件不提供四槽演算法，本文設計不歸因於 Kubernetes。
2. https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#forced-pod-termination
   - 查核 readiness、graceful termination 與 forced deletion。API 強制刪除不等待 kubelet 確認底層程序已終止。
   - Pod 名稱與 Pod UID 不能識別同 Pod 內的每次程序重啟。文章另要求新啟動 ID，不把可見 Pod 狀態當成 SQL 停止證據。
3. https://dev.mysql.com/doc/refman/8.4/en/kill.html
   - MySQL 8.4 KILL QUERY 保留連線；KILL 設定 kill flag，指令回傳不等待終止確認，清理另需時間。
   - 不建議直接拿歷史數字連線 ID 取消工作，必須重新核對歸屬。本文沒有實際執行任何 KILL。

## 教學假設與獨立審閱

- 新的容量情境只涵蓋可降級清單回源。下單、明細、匯出與控制操作另有預留且受限的額度，不宣稱保留第 22 篇的 20/30/10 或 4/4/2 分類保證。
- 候選預算 60 次／秒、10 在途。四槽各 15 次與 2 在途，合計 60 與 8；三個正常程序為 45 與 6。兩個未分配在途名額不能當溢出例外。
- 同一槽位的登記只允許一個程序啟動 ID。由單一權威登記原子更新，指派不因租約過期自動重用。一般程序重啟不能拿舊指派重設計數。
- 退休入口與派送入口共用同步邊界，退休不可逆。舊持有者不會再派送、遠端操作確認結束後，再由控制程序等待完整一秒。控制程序重啟重新等待，避免跨機器比較單調時鐘。
- 獨立技術審閱指出兩項已修正問題：練習改成 0.0–0.2 秒分批執行十五次、同時不超過兩個；未知 A 只阻止第一槽重用，B/C 仍可安全交還各自槽位。
- 練習數值：可靠證據於 2.0 秒齊備，最早 3.0 秒交接。錯誤新增第五個持有者為 75 次／秒與 10 在途。只等一秒不能解決仍可恢復的舊程序。
- 正文六項故障演練是待執行規格。沒有宣稱部署協定、資料庫容量、驅動取消或服務 SLO 已整合測試通過。
- humanize-writing checker 的兩個冒號提示是具體問題與檢查欄位，人工複核後保留。

## 封面方向與圖解

- 前篇：戶外水道、gouache、斜俯視、粉白與石油藍、冷晨光。本篇：黃銅四槽與三個已占用黑色圓柱、微距攝影、低斜角、琥珀與深藍、暖側光。在媒材、構圖、配色與光線上區分。
- 原創生成提示：四個獨立圓槽，三個已占用、一個空槽，備用圓柱在底座外，對應固定配額與持有者，不畫成實際產品。禁止文字、商標、箭頭、電線、水道、紙卡與輸送帶。
- 生成原圖 1672 × 941，轉為本地 1600 × 900 WebP。全圖與 320 × 180 縮圖目視，四槽、三個持有者、外部備用圓柱可辨，未見文字商標。
- 原生 Astro SVG 元件含桌面及窄版直向 SVG、獨立前綴 ID、title/desc、48rem 切換、中性色 tokens。另以點陣輸出核對文字與幾何，不能替代瀏覽器實頁驗收。

## 預覽限制

Astro dev 回報本機位址，但本機 HTTP 連線失敗，未取得可用實頁；Chromium 實際啟動因環境 socket 權限限制而中止（Operation not permitted），未繞過限制。桌面／320 px、深淺色的瀏覽器實頁目視未完成，不能聲稱已通過。依這次每日發布任務明示的預覽例外，如實記錄後不以此阻擋發布。其餘格式、內容政策、check、test、最終 build 與正式網站驗證仍須完成。

實際 gate 結果與精確 commit 部署驗證另留發布收據。本研究紀錄不是上線成功的證明。
