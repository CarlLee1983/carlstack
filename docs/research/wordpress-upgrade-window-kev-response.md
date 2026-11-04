# WordPress 升級窗口漏洞：11 月 3 日 KEV 新進展

- 查核時間：2026-11-04，Asia/Taipei。
- 目標文章：`src/content/blog/wordpress-upgrade-window-kev-response.md`。
- 穩定識別值：CVE-2026-119977。
- 去重：fresh main `eb74f70` 的文章、研究及佇列未見此 CVE。這次新進展為 11 月 3 日 KEV 收錄，不把 10 月 28 日修補改稱新發布。
- 系列：主機與 Linux 維運，既有 1–3，接續 4。

## 精確來源與段落對應

1. CISA 官方 KEV JSON：
   https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json
   已讀全文相關紀錄。版號 2026.11.03；dateReleased 2026-11-03T20:00:24.8741Z；CVE dateAdded 2026-11-03；dueDate 2026-11-06；forensicTriage Yes；knownRansomwareCampaignUse Unknown。
   支持開頭、查核說明與「KEV 改變排程」段。收錄代表已知遭利用，不表示特定網站已入侵，也沒有提供全球攻擊規模。
2. WordPress 官方 7.1.4 公告，2026-10-28：
   https://wordpress.org/news/2026/10/wordpress-7-1-4/
   已讀原文。確認升級窗口 RCE 修補與舊分支回補政策；官方稱只有最近版本積極支援。
   支持「版本盤點」與「升級窗口」段。原文列多項問題，本篇只處理指定 CVE，不將其他 XSS 描述混入。
3. Wordfence 漏洞紀錄，公開 2026-10-28、最後更新 2026-10-31：
   https://www.wordfence.com/threat-intel/vulnerabilities/wordpress-core/wordpress-core-470-713-unauthenticated-upgrade-window-staged-installer-remote-code-execution
   已讀原文與完整影響／修補分支清單。CVSS 3.1 8.1 High，AC:H。條件是完整套件核心升級期間的可預測、web-accessible staging paths。
   正文僅舉 7.1.4、7.0.8、6.9.11、6.8.12 修補範例並連完整清單，沒有聲稱所有小於 7.1.4 都受影響。未引用動態24小時攻擊計數，避免把供應商樣本視為全球規模。

## 來源限制

下列 CISA 指令頁各首次開啟回 403 Forbidden，未重試或改途徑繞過。沒有用搜尋摘要代替全文，也不轉述完整法律義務、適用對象或鑑識步驟。正文保留可讀 KEV 的欄位事實，並將一般維運建議明確與官方細則分開。

- https://www.cisa.gov/news-events/directives/bod-26-04-prioritizing-security-updates-based-risk
- https://www.cisa.gov/news-events/directives/bod-26-04-implementation-guidance-prioritizing-security-updates-based-risk

## 工程建議與未實測

雙站版本例子為教學假設。入口控制、備份／回復、版本節點盤點、回歸、日誌保存與一般異常檢查，均為作者防禦性設計建議，不宣稱官方推薦的漏洞替代修補，也不視為特定攻擊指標。未執行漏洞利用、正式站更新、鑑識或效能測試。沒有提供利用程式、攻擊請求或暫存路徑細節。

## 素材與驗收

原創封面、全尺寸／卡片目視、format/content policy/check/test/build 與正式部署驗收由整合工作補記。文章不得在缺圖或必要驗收未通過時發布。沒有正文圖解，無 SVG 驗收項目。

## 整合驗收紀錄

2026-11-04：正式生圖工具產生原創封面，輸出本地 1600×900 WebP。逐張檢查全尺寸及400×225卡片，無文字、Logo或浮水印；替換實際coverAlt。三篇分別使用米白綠色紙黏土檢查站、紫黃網頁網印插畫、深灰金屬伺服器攝影概念，媒材、構圖及色盤均區隔。完整技術gates與正式部署驗證另於交付紀錄確認。

本地預覽限制：pnpm dev --host 0.0.0.0 回報 Dev server process exited before becoming ready；雲端瀏覽器 localhost:4321 為 ERR_CONNECTION_REFUSED。未完成本地桌機/手機深淺色實頁目視，依使用者授權不因此阻擋發布；不宣稱Safari beta功能或WordPress/APM案例實測。
