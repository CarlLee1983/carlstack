# clice 1.0 查核紀錄

- 查核日：2026-11-16（Asia/Taipei）。main 起點 014d61a5489baab4040f329e9af91abff4554492。
- 主來源：https://ykiko.me/en/articles/2105384023094834022/；正規化保留穩定 ID 2105384023094834022。作者 ykiko。全文由官方頁 HTTP 200 讀取，搜尋工具無法開啟時未使用摘要代替。
- 作者頁 JSON-LD datePublished：2026-11-15T10:04:18-05:00，即 15:04:18 UTC。
- https://github.com/clice-io/clice/releases/tag/v1.0.0，GitHub API published_at=2026-11-15T14:57:28Z，prerelease=false。兩者皆在 11/15 02:00 至 11/16 02:00 UTC 窗口。
- 以 clice、作者、穩定 ID 搜尋 src/content/blog、docs/research、docs/article-queue.md 無重複。今日系統設計與 GitHub 週報分開計數。
- 獨立工具選型文章，不強行加入既有系統設計或 AI 系列。

## 段落與來源

- 首段、設定遷移：正式 release 原文與 API；明確標示舊設定會阻止專案服務。
- 多行程：https://docs.clice.io/clice/design/multi-process 。主行程保留狀態、worker 分工、崩潰工作暫停與重送。未宣稱完整不中斷，也未轉述作者的比較效能為本站測試。
- 快取：https://github.com/clice-io/clice#language-server 。PCH、PCM 跨 session 磁碟重用。
- 模組：https://docs.clice.io/clice/features/modules 。介面存檔後傳遞；header units 不支援。
- 多視窗索引：https://docs.clice.io/clice/guide/config-guide 。一個 writer，第二個等待仍取不到鎖則不服務該專案。
- CLI：https://docs.clice.io/clice/cli/query 。stale 與 --fresh 處理。未執行 clice、未做效能比較；導入清單為工程建議。

## 美術與內容

- 鄰近封面 github-ai-scan-rest-api 是紙材／米色海軍藍／平面分支。新封面改為陶瓷玻璃／冷灰藍珊瑚／中央弧形工作艙／柔光，至少三項區分。
- 原創內建 imagegen 生成，16:9，全圖、1:1 與 4:3 裁切已目視，無文字或商標。輸出 WebP 1600×900。
- humanize-writing SKILL 與繁中參考已讀；check_zh 提示一處說明性冒號，人工確認非懸念模板。標題依使用者最新要求直述內容，優先於舊指南的主張式標題。
- 無正文圖解或可執行程式碼，未聲稱示例測試通過。

## 驗收

本機預覽在 ready 前退出（Dev server process exited before becoming ready），未完成桌機／手機深淺色實頁目視。未繞過此限制。封面全圖與卡片裁切已目視。最後 policy、check、test 與正式部署另核對執行結果。
