# MCP Toolbox cloud-storage allowlist 查核

查核日期：2026-10-27。以 CVE-2026-93328、toolbox、cloud-storage、PR3454 及來源正規化 URL 搜尋 blog/research/queue，無既有核心文。新文聚焦升版後仍需明確設定資源邊界，與 Splunk 憑證目的地文章互補，不複寫其憑證綁定問題。全量核對既有 AI Agent 系列最大98，本批設定99/100/101；首次部署後的系列驗收發現原先90/91/92重複，已在本次修正，不更動舊文。

## 主張與來源

- Google Cloud CNA 原始記錄：https://github.com/CVEProject/cvelistV5/blob/main/cves/2026/93xxx/CVE-2026-93328.json 。全文已讀，公布2026-10-26T14:24:09.012Z，更新16:46:45.879Z；影響1.2.0至小於1.5.0，CVSS4 9.3 Critical，cloud-storage未認證遠端參數造成主機檔案外傳/覆寫。支援開頭及修補段。未據此宣稱已遭利用；NOT_DEFINED不是證明無攻擊。
- 修補 PR：https://github.com/googleapis/mcp-toolbox/pull/3454 。6月18日已合併，與10月26日揭露區分。
- 完整diff（文件、Go程式與單元測試）：https://github.com/googleapis/mcp-toolbox/pull/3454/files 。文件明示省略allowedBuckets/allowedLocalRoots為全部允許；len==0程式分支同樣放行；absolute paths。支援預設與設定片段，不宣稱自行執行上游測試。
- 最小OS/IAM權限直接出自CNA solutions。按信任範圍分實例、部署渲染與負面測試則是作者工程建議，虛構報表情境非站主經歷。沒有漏洞利用範例或生產環境測試。

## 封面方向與驗收

已視看最近 order-system-restore-reopen（紫玻璃屏風）、ai-code-review-needs-a-stop-rule（綠色庭園軌道水彩）、linux-dotnet-tarball-ownership（黑白木刻箱）。本批三張共同16:9，媒材、構圖、主色各異：

- MCP：兩端限制；織物及金屬靜物；俯視雙獨立框；海軍藍/銀/象牙；柔和日光。
- Cloudflare：殘留資料被帶入下一個工作空間；雙獨立書頁的壓印轉印；抽象石版畫；鮭紅/炭黑/奶油；高對比平面。
- Terra：可回復草稿與不可逆送出分離；陶瓷托盤/待蓋印紙卡與未觸動印章；斜側簡約靜物；淺灰/赭黃/湖藍；清冷晨光。

使用正式內建 imagegen 各自生成，最終 prompt 與實際像素/全尺寸/卡片驗收在完成後補記。沒有新架構圖，此題以具體設定及正反測試敘述已足以理解，不額外堆疊方塊。

## 最終素材及預覽紀錄

三張封面由內建 imagegen 生成，原始1672×941 PNG，sharp轉為1600×900 WebP；逐張檢視全尺寸與320×180卡片，主體完整可辨、無意外文字商標，各篇coverAlt依成品更新。MCP prompt: original horizontal editorial top-down still life on navy linen, two separate brushed silver boundary frames containing ivory file cards and a closed storage vessel, soft daylight, no text/logos/UI/arrows. CF prompt: abstract lithographic print, separate charcoal and cream sheets, salmon circular impression with faint residual ghost, no text/UI. Terra prompt: lake-blue ceramic tray with blank draft cards, untouched ochre stamp outside, pale gray tabletop, cool daylight, no text/UI. 三圖最大同時生成2張，無重試。

2026-10-27 02:11 UTC 正常執行 pnpm dev --host 0.0.0.0，Astro回報 Dev server process exited before becoming ready，exit1；cloud browser localhost4321回報ERR_CONNECTION_REFUSED。未改設定繞過。本次本機實頁桌面/320px/深淺色目視未完成，依使用者授權不阻擋發布；封面獨立像素及裁切目視已完成。正式站驗證仍須在部署後執行。

獨立來源審查已通過；現行官方範例 https://github.com/googleapis/mcp-toolbox/blob/main/docs/en/integrations/cloud-storage/source.md 再確認 kind/name/type/project 及兩份清單格式。正文不宣稱路徑allowlist取代OS隔離或能排除所有檔案系統競態。
