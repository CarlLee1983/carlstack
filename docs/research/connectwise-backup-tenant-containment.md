# ConnectWise Cloud Backup：租戶調查與備份空窗

查核日期：2026-10-18（Asia/Taipei）。事件狀態截點：官方公告 2026-10-18 01:00 UTC。

## 去重與範圍

在 main f86cee5 的 src/content/blog、docs/research、docs/article-queue.md 全文以 ConnectWise、SkyKick、Cloud Backup、company/trust/advisories 查詢無命中；GitHub code search 亦無結果，但完整本地查核是主要證據。open PR 查詢為零。今日系統設計第8篇、poteto AI90、Claude AI89及Felix既文更新已完成，不計本新聞工作；取消的10/16批次不讀取、不重試。本文獨立資安與SaaS整合議題，與既有系列無適切連續教學順序，因此不硬加series。

## 來源及段落對應

1. https://www.connectwise.com/company/trust/advisories
   已讀官方實際公告全文，非搜尋摘要。首發10/16 17:47UTC；本次採10/18 01:00UTC更新。支援導言的已確認應用程式身分未授權存取、10/17 07:00UTC停七身分、既有token可能仍有效、封存/還原狀態與租戶可視性界限。沒有宣稱CVE、特定客戶遭入侵或資料外洩。來源頁另有較舊更新/FAQ，衝突時不把舊狀態當最新。原始曝露機制仍在調查。此文不搬運完整公告、七個ID清單或長操作流程。
2. https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/disable-user-sign-in-portal
   已讀實際文件。支援「已停用」章：single-tenant service principal accountEnabled和app registration不是同一範圍。沒有將停用新token核發宣稱成即時撤銷所有已發token。
3. https://learn.microsoft.com/en-us/security/operations/incident-response-playbook-compromised-malicious-app
   已讀實際文件。支援credential、application/service principal、設定、角色、consent須分別調查；containment需衡量營運影響。本文未複製或執行文件中的Graph/PowerShell變更範例。該文件的個別原始程式範例不視為本文實測保證。
4. https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity
   調研時讀取，用以避免宣稱使用者Conditional Access能直接保護第三方多租戶應用；最終正文沒有展開此支線，未引用為額外主要主張。

## 原創分析與不確定性

開頭群組交接及多一組credential都是明標虛構情境。每個控制只關閉對應工作項、讀取調查與有權處置角色分工、查詢範圍/缺口交接、營運與安全雙線工作，是本文工程建議，不是已實作產品功能或親測結果。32小時僅為週六02:00至週日10:00的教學時間差，不推論資料已遺失，也不宣稱實際RPO/RTO或客戶資料量。沒有操作任何租戶、讀取客戶日誌、變更憑證或存取權。

## 封面

正式imagegen原創，1672×941，WebP。鄰近poteto封面為灰藍色立體分層漏斗；Claude review為沙黃色俯視環狀軌道。本篇使用銅版蝕刻水彩、酒紅與羊皮紙色、斜向走廊景深、罩住的黃銅鑰匙和半開側門，隱喻/媒材/色盤/構圖有區別。全尺寸與384×216卡片裁切已目視；無文字或商標。封面僅概念隱喻，非事件實景或供應商架構。

正式prompt：Original editorial illustration for an engineering article about a cloud-backup provider disabling compromised application identities while customers still need to inspect their own access paths. Wide 16:9 cover, no text, no logos. A refined copperplate etching with subtle watercolor, burgundy and pale parchment palette: a large brass master key rests sealed under a clear glass bell in the foreground, beyond it several small architectural doorways stretch into the distance, one side doorway still slightly ajar. The metaphor is that isolating one key does not prove every room is secure. Dramatic side lighting, clean magazine composition, strong focal point, generous negative space, not a dashboard, not neon cyberspace, no hooded hacker. All details should remain readable as a small card thumbnail.

## 工程環境與驗收

自有雲端獨立工作區。環境清單沒有saved coding environments，Mac離線且使用者指定雲端，未使用Mac。Node24.19.0符合>=22.13，透過暫存Corepack wrapper使用repo指定pnpm12.1.0，未改工具鏈設定。frozen-lockfile install完成。Trail CLI及索引不存在，採直接讀規則、schema、workflow及全文查重。本文採段落敘事不新增圖解，避免用流程圖重複文字。

最終技術、預覽與正式站驗收結果由後續執行補記；不把資料查核當成技術測試。

預覽限制：Astro dev首次因預設config目錄不存在失敗；改用本工作暫存XDG_CONFIG_HOME後仍於ready前退出。自有雲端Chrome開localhost:4348回ERR_CONNECTION_REFUSED，未完成桌面/窄版/深淺色實頁預覽，依使用者預覽例外續行。封面全尺寸與卡片已獨立目視。

## 2026-10-19 實質更新

保留原始 publishDate、slug、封面，僅更新當前事件截點及新增調查線索。最新 main c31dca7 已核對，open PR 為零。原文及研究檔皆命中同來源，故不建立重複文章。

來源查核由同工作研究員透過 web.open/find 讀取官方全文後交接。本編輯者的 shell 直讀頁面回 Site Unavailable，沒有改身分重試，也不聲稱透過 shell 成功讀取。

- Trust Center 同一精確 URL：最後更新 2026-10-19 01:15 UTC。Cloud Backup、SaaS Security、Cloud Management 仍暫停，無確定恢復時間，受影響應用程式需保持停用至正式恢復指示。與前版的持續隔離狀態相符。
- 2026-10-18 18:45 UTC Additional IP Indicators：144.172.64[.]99 與 .60 為 NEW，.128 為先前清單。來源是 partner/customer 環境下游安全監測，供 Microsoft 365 authentication/audit log 查核，不等於確認入侵、外洩或新增受害者。
- https://www.connectwise.com/contentassets/10777cd3364d440c86ed5270a94a5f24/connectwise-cloud-backup-technical-investigation-and-remediation-guide-1.pdf ：已核官方 10/18 版共 15 頁，所有事件時間 UTC。印刷頁 3–4（零起算 2–3）支持新增段落：自 10/13 至今，若有紀錄擴至 10/1；各 App ID 的 service-principal 活動不能限於公布 IP；分成功/失敗、查後續活動；IP 命中不單獨證明 compromise/exfiltration。
- 官方 status 頁下一更新時間與 Trust Center 不一致，正文省略此不確定資訊，不猜測恢復時間。

未操作真實租戶或執行指南指令。技術門檻與正式站驗證待本次最終檔案完成後執行。

本次工程紀錄：雲端獨立工作區 / Node 24.19.0 / pnpm 12.1.0，frozen-lockfile install 通過。Astro dev 在 ready 前退出，localhost:4359 無法連線，未完成桌機／320px／深淺色實頁預覽；依使用者預覽例外續行。沒有繞過環境限制。最終格式、內容 policy、check/build、test、正式部署與索引核對以本次提交的執行結果為準。
