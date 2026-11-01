# Apache MINA 停維分支遷移查核

查核日期：2026-11-01（Asia/Taipei）。對應文章：`apache-mina-retired-branch-migration`。

## 去重與系列

正式稿、研究紀錄與 article queue 依 MINA、CVE-2026-118636、JavaNativeMessageDecoder、原始公告網址、停維分支遷移主題查找，未見同源稿。既有安全文章著重其他元件修補、憑證與執行邊界，本篇的獨立讀者收穫是沒有同分支修補版時的入口隔離與跨分支驗收。納入「現代網路協定與 API 平台架構」第 26 篇，接續現有第 25 篇；並連至安全基礎導讀。

## 已讀原文與段落對應

- Apache 作者 Emmanuel Lécharny 於 oss-security 發送的通報全文，2026-10-31 08:01:38 UTC：<https://www.openwall.com/lists/oss-security/2026/10/31/3>。支持開頭的 CVE、Critical、CVSS 3.1 9.8、類別與 ObjectInputStream.readObject() 路徑、無 class filter、不可信對端及 gadget-chain RCE 條件。原信確認 3.0 分支 inactive、不計畫發布修補，建議最新 2.2.X。
- Apache CNA 的 CVE JSON 全文：<https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/118xxx/CVE-2026-118636.json>。發布時間 2026-10-31T20:17:11.191Z，與原信發布時間分開。支持版本原始寫法與嚴重度，包含 unsupported-when-assigned 標記。紀錄的 version=3.0.0、lessThanOrEqual=3.0.0-M2 具排序歧義，文章原樣歸因，不自行推導數值區間或宣稱其他版本均受影響。
- Apache MINA 官方 2.2 下載頁全文：<https://mina.apache.org/downloads-mina_2_2.html>。查核時列 2.2.10 stable；版本編號說明指出 major 變更有 API 不相容。文章稱其為當時最新遷移目標參考，沒有說它是 3.0 的原地修補版。
- Apache MINA 官方首頁 warning 與 release 段落：<https://mina.apache.org/mina-project/>。支持 2.2.7 以前與 2.2.8 起部分 Java 序列化物件流不能互讀、保存資料受影響。正文明確分開既有相容性警告與本次新 CVE，沒有推定為 3.0 至 2.2 的已知確切失敗結果。

## 事實、建議與未知

- 沒有把嚴重度或可利用條件寫成實際入侵證據。已讀公告與 CNA 未提供已遭實際利用的證據。
- 物流 TCP 轉接服務是明標教學情境，沒有借用私人部署或捏造事件規模。
- 暫停入口、評估 HTTPS 替代通道、限制來源、保留例外到期條件、混版與歷史訊息驗收、部署後核對產物，均為工程建議，非 Apache 已替每個應用驗證的處方。
- 未執行 MINA、漏洞利用、gadget chain 搜尋、相容性測試或遷移。沒有可執行攻擊程式碼，也沒有聲稱任一建議已在實際業務系統通過。
- 官方初次嘗試的舊式 security.html／downloads.html 路徑不存在；後續由官網導覽取得上列可讀精確頁面，不引用失敗頁面。

## 內容檢查

已讀目前 main 的 AGENTS、content guide、schema、copywriting 與 humanize-writing 規範。執行中文 checker；保留解釋具體 decoder 行為的冒號，以及「服務異常」的一般中文用法（非程式 exception）。修正一處冗長冒號，站內連結已對照實際檔名。封面、格式、內容 policy、型別／測試／建置及正式部署由發布流程完成後另行核實，不在此先稱通過。

## 發布前圖片與範圍

使用正式圖片工具生成原創封面，輸出 1600 × 900 WebP；已目視全尺寸、480 × 270 縮圖、16:10 及方形裁切，焦點仍可辨識，無文字或商標。封面 alt 依實際畫面填寫。三篇封面分別採紙雕帳目、戶外陶管模型、粉藍網版工作燈，主題物件、媒材與色彩有區別。沒有新增流程或架構圖。

雲端本機 dev 在 ready 前退出，Chrome localhost 回報連線拒絕，桌面／手機本機實頁視覺驗收未完成。依發布授權如實記錄，未調整環境保護、未跳過來源或技術檢查。正式站上線狀態另於部署後驗證。
