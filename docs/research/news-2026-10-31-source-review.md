# 2026-10-31 科技文章查核

## 範圍與去重

基準 main 664cbff7798e420d87f3dc0f8b2d6a0159579a39。完整檔案搜尋 src/content/blog、docs/research、docs/article-queue.md，查原始 URL、Cursor 公告 slug、2.1.312/2.1.313、Phorion、Northflank、sanstun。未有同核心題材。10/31 既有 export-admission 是獨立每日系列，不重寫。OpenAI training signal 與既有 GEO 文有重疊，本次未另發。

讀 AGENTS、content-guide、schema、deploy、copywriting、humanize-writing/SKILL、zh-tw、narrative-zh-tw。Trail CLI 與 cache 不存在，使用完整檔案搜尋。系列完整 frontmatter 含 draft 查最大編號：AI Agent 原105，新106/107；網路原24，新25。未改全站設定或排序。

## 來源與主張

- https://cursor.com/blog/claude-code-extension-security-notice 全文讀取。公告10/29，10/30 11:30 PT更新affected versions及IOCs。來源/版本/平台條件：Cursor Marketplace Anthropic.claude-code 2.1.312/2.1.313 macOS/Windows；不泛稱Anthropic官方發行遭入侵。移除extension不足；不把單一grep陰性當完整清查。未執行修復腳本/惡意程式，也不推定使用者受影響。
- https://phorion.io/blog/offical-claude-code-vsx-compromise/ 全文讀取，10/30發表、31更新。取module-load執行與macOS持久化/SSH判斷不同結果；不轉貼植入碼，不把樣本平台邏輯擴張成Linux發行受影響。
- https://status.northflank.com/ 全文讀取至31日01:04UTC。10/30 23:38使用者回報AI key unauthorized use，發行端撤銷/替代/更新secrets及workloads；31日01:04全部客戶audit logs啟用。仍investigating，非事件已解決。
- https://www.wiz.io/blog/black-october-for-ai-developer-platforms 全文讀取。只取觀察到的低頻驗證再大量使用；未把多平台同歸單一漏洞/攻擊者，不重製敏感樣本或估算帳單。
- https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html 官方全文：rotation同時更新secret與database/service。用於說明儲存端/發行端，不宣稱Northflank使用AWS Secrets Manager。
- https://www.firezone.dev/blog/introducing-sanstun 全文讀取，10/31。sans-IO含time/randomness，Interface::receive入口與crate-private訊息型別、外部buffer responsibility、bookkeeping/crypto分離。無效能數字轉述或親測主張。
- https://github.com/firezone/sanstun 公開README/檔案目錄讀取；docs.rs本輪工具無法讀取，未作來源。後端retry/webhook類比是作者工程建議，測試案例未執行。未編譯sanstun或跑benchmark。

## 原創封面方向

最近AWS certificate封面為綠色復古立體證書閘門；三張新圖各異。

- Cursor：紅色模組/桌下常駐線，側剖攝影模型，米白黑紅，硬側光。
- Northflank：折斷舊鑰匙/新鑰匙與服務房屋，俯視紙拼貼，赭黃青綠，日光。
- sanstun：獨立時鐘/透明狀態艙/平行資料通道，等角玻璃金屬，深藍紫，冷光。

正式imagegen一圖一prompt，三次成功。1600×900 WebP quality88原創本地封面；全圖和320px 16:9/16:10卡片檢視。無第三方圖片。正文為結構化應變/設計討論，沒有新增流程圖或Mermaid。

## 驗收界線

所有文章中的操作清單與測試順序是工程建議，不是已對讀者主機/服務執行。必要repo驗收與部署收據另記，不把網站tests當資安處置或sanstun效能實驗。
