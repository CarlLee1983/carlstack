# 2026-10-25 科技快報文章查核

研究窗口為 2026-10-24T02:00:00Z 至 2026-10-25T02:00:00Z。週日依來源品質選一篇新文與一篇實質更新，不以每日系統設計第 15 篇充當新聞篇數。快報已先由主工作送出，文章隨後處理。

## 去重與系列

在 main 01a086dd2f8fa41ab30c2c9e1ba67cdf591f60d5，以原始 URL、正規化 URL、穩定 ID、專案名與核心題目搜尋 blog、research、article-queue 及當日提交。來源沒有需移除的追蹤 query；Mozilla 2083449 的識別 query 保留。

- eMudhra 已有 `emudhra-client-trust-runtime-remediation`，原發布時間 2026-10-21T02:12:10+00:00 保留。新增 CPython 10 月 24 日合併與公告，設定 updatedDate，不開重複 URL。
- Postiz 已有 2.25.1／CVE-2026-107761／PSA-2026-4QX1WG 的回應欄位文章。本次 2.25.3／CVE-2026-115933／PSA-2026-YT2HMH 的核心是請求內容取得簽署權限，與 DTO 回應權限不同，建立新文並連回舊文。順帶說明同版修正的 CVE-2026-115932／PSA-2026-E9AHFV，不另拆一篇。
- 新文納入「現代網路協定與 API 平台架構」第 21 篇，接在 VCO 第 20 篇之後。既有 eMudhra 第 19 篇不變。未發現與本次來源相同的排程／在製文章。
- AGENTS 要求的 trail CLI 與 cache 不存在，執行 `trail map`／`trail ask` 回報 command not found，改讀內容指南、schema、部署 workflow、相關技能與精確文章檔案。

## Postiz 來源與主張

1. 官方 release：https://github.com/gitroomhq/postiz-app/releases/tag/v2.25.3 。完整讀取，標示 10 月 24 日 14:16，明列兩份 PSA，要求立即升級。以此確認修補交付版本，不用 GHAD 的 Unknown 欄位推算版本範圍。
2. https://github.com/advisories/GHSA-9j6f-8rw3-93c4 。完整讀取，CVE-2026-115933，10 月 24 日發布。共用 secret、缺少用途標記、簽署請求內容及可讀回結果。GHAD 為 Unreviewed，套件 affected/patched Unknown，文章不引用其 CVSS 或發明受影響版本範圍。需要低權限，不寫成完全匿名。
3. 官方修補：https://github.com/gitroomhq/postiz-app/commit/a5affe6 。讀取完整 7 檔 diff。cookies 儲存 signJWT 改 fixedEncryption，inviteTeamMember 展開 body 改明確欄位，驗證器增加型別／必要欄位及互斥欄位檢查。沒有證據顯示全面改成分用途金鑰，文章明確區分後續設計建議。
4. https://github.com/advisories/GHSA-rmc2-p2gv-m88f 。完整讀取，CVE-2026-115932，同日 Unreviewed，套件版本欄位 Unknown。已註冊使用者透過未限制在 upload root 的媒體路徑觸發讀檔，預設開放自行註冊影響取得帳號的難度，不改寫成不需帳號。沒有提供在野利用證據。
5. release 連出的 https://gadvisory.org/advisories/PSA-2026-YT2HMH 與 https://gadvisory.org/advisories/PSA-2026-E9AHFV 經 web 開啟不可得，未宣稱讀完這兩份原文。官方 release、官方 diff 與 GHAD 的交叉證據足以支撐文中有限範圍。

未部署 Postiz、未重現漏洞、未處理正式 token。教學範例只測已驗簽 claims 的用途分流，六個 assert 以 Node v24.22.1 執行，輸出 `token purpose contract: PASS`。不稱為上游完整修補測試。HTTP 回歸、簽章／時效／issuer／audience 檢查、註冊設定與部署證據都是作者工程建議。

## CPython 更新來源

- 官方公告：https://mail.python.org/archives/list/security-announce@python.org/message/FNAJMZV6XQYLVPABNINDMF3VF66AYLW4/ 。完整讀取，10 月 24 日，CVE-2026-115557，ssl 已知受損憑證 denylist。
- https://github.com/python/cpython/pull/160042 與 https://github.com/python/cpython/pull/160042/files 。核對 10 月 24 日合併 main、SPKI SHA-256 摘要與交叉簽署同公鑰辨識。merge commit 7dd8b4736a1419750b94a388e6d158be15836fe6。
- https://github.com/python/cpython/issues/160040 。讀取設計與 backport 連結，3.11 至 3.15 的回補紀錄已可見，不稱全數待辦。設計說明啟用憑證驗證時檢查，不能延伸為允許 CERT_NONE。主文沒有宣稱穩定發行版或任何 distro 已交付。

此次只更新新 runtime 防線與交付責任，沒有將舊 eMudhra 事件重報為今日事故，也不擴張先前查核對利用情況的範圍。未執行 CPython 憑證回歸或讀者環境的連線測試。

## 寫作與封面

完整讀取 `.agents/skills/carlstack-copywriting/SKILL.md`、`humanize-writing/SKILL.md` 與 `references/zh-tw.md`。手動檢查標題、摘要、正文，再跑 checker 輔助，未將 checker 通過視為去 AI 味的完成證據。

實際修改包括新文標題先改為「請求欄位不能照單簽署」，經主工作全文審閱後再改為「限制簽署欄位與驗證用途」，開頭直接寫版本修補事實，移除「還需要回答一個問題」修辭；舊文把缺乏數值依據的「一半證據」改為未確認的實際信任資料。新增段落保留分支回補與交付版的差別，沒有把作者建議寫成上游實作。

先檢視相鄰的 Postiz 版畫、VCO 黃銅控制台與 OpenAI 藍色圍牆封面。新封面矩陣：用途檢查／紙與毛氈停格攝影／低角斜向三紙帶／薄荷綠與紫色／柔光。媒材、構圖與配色均與鄰圖區別。內建 image_gen 原創輸出，存為本地 1672×941 WebP；全尺寸與 360×203 卡片像素均已檢視，沒有文字、logo，alt 依實際畫面寫出橘色擋板與三角開口。圖像是封面意象，文章沒有新增技術流程圖。

封面 prompt：wide handcrafted stop-motion paper-and-fabric workshop; violet stamp, three cream paper strips and circle/triangle/rectangle apertures; middle strip blocked before triangle; pale mint/lavender/ivory, tiny burnt-orange accent, soft studio light; no text, logos, people, keys, gears or concentric walls。工具原始檔保留在 workspace generated_images，正式引用只有 src/assets 下 WebP。

## 驗證紀錄

- pnpm 12.1.0 `install --frozen-lockfile` 通過，711 筆 supply-chain policy、555 packages 由 store 重用。
- 變更前基準：format、Astro diagnostics（0 errors／0 warnings）、production build／RSS／sitemap／Pagefind（687 pages）與 117 tests 通過。基準通過不代替最終檔案檢查。
- 瀏覽器預覽阻擋：Chromium 預設 headless profile 無法建立；明確指定 /tmp profile 後出現 process_singleton 的 `socket() failed: Operation not permitted`。未取得頁面截圖，不宣稱桌面／320 px／深淺色視覺或搜尋 UI 互動已驗收。封面像素檢視可用且已完成。
- 主工作已全文審閱新文與更新 diff，研究工作再逐項核對來源與 7 檔修補 diff，無阻擋。依審閱調整標題與自家角色欄位的工程建議語境。
- 發布前檢查已通過 content policy（兩篇）、check（format、Astro、production build）與 117 tests。production Pagefind 688 pages，兩篇正文／canonical、RSS、sitemap、各自搜尋 fragment 與網路 API 系列頁均已靜態核對。標題與研究紀錄定稿後再對完全相同的 staged tree 重跑三道 gate 與最後 production build；commit、Actions 與正式頁證據由任務回報提供，不預填成功。
