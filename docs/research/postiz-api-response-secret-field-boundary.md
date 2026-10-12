# Postiz 回應欄位邊界

## 來源與去重

- 主來源與正規化 URL：https://gadvisory.org/advisories/PSA-2026-4QX1WG 。穩定 ID：PSA-2026-4QX1WG、CVE-2026-107761；Postiz、GitroomHQ、Gilad Resisi、Enno Gelhaus。
- 2026-10-12 在 main b3ab3e4886f591f4252ad1a617786c9de0506229 搜尋 blog、research、queue 的 Postiz、CVE、PSA、來源 URL，無同源文章。GenOffice 談共享目錄檔案權限；本篇處理已認證且同租戶 API 的回應欄位權限，讀者收益不同，正文加入站內連結。
- 系列評估：API 平台系列以架構教學為主，本篇為獨立修補案例，不硬套系列。

## 一手查核

2026-10-12 以正常 curl 讀完整 GAdvisory HTML（web reader 回不可讀），解析排除 script/style；GitHub connector 核對 patch 和 pin commit 原始碼。

1. 公告日期 2026-10-11；時間線發現 10/1、developed and verified 10/8、release/publication 10/11。affected 表只有 ≥0 → Fixed in 2.25.1，沒有精確引入版，不斷言所有歷史版本均有漏洞。
2. CVSS v4 5.3 Medium；同組織有效 session/API key/OAuth token，沒有匿名或跨租戶暴露。公開 channel delete 回傳 integration row 含平台 access/refresh token；GET /user/organizations 對每位成員回組織 API key，原應 admin 可見。未提在野利用或要求全員無差別輪替。
3. https://github.com/gitroomhq/postiz-app/releases/tag/v2.25.1 ：10/11 release，官方建議立即升級。
4. https://github.com/gitroomhq/postiz-app/commit/8ad0df3df0f21299b8640568358c1b68c6464e4f ：2 檔修補。deleteChannel 新增 select id；getOrgs 保留 !users[0].disabled 過濾，新增 id/name/users/subscription map。這次 diff 沒有新增測試，不宣稱官方已覆蓋回歸。
5. https://github.com/gitroomhq/postiz-app/blob/8ad0df3df0f21299b8640568358c1b68c6464e4f/libraries/nestjs-libraries/src/database/prisma/integrations/integration.repository.ts#L766-L781 ：where id/organizationId，data deletedAt。只能確定軟刪除，不能因此主張外部平台憑證已撤銷。

本文未啟動 Postiz、沒有重現攻擊、沒有處理任何真實憑證。合成 DTO 測試採假資料，使用 Node 24.19.0 執行，輸出 response field contract: PASS；包含 exact key 白名單與兩個拒絕完整 row 的反例。這是原創教學契約，不是上游修補完整驗收。調查／輪替流程為本文工程建議。

## Cover Direction

已看最近正式封面：Rollup 木紙軌道／斜角環形／靛藍珊瑚／側光；GenOffice 毛氈櫃／正面靜物／鼠尾草與鮭紅／日光。

本篇採輸出欄位篩選意象／網版版畫／俯視平面／酒紅赭黃淡藍／平面高對比。內建 imagegen 原創生成，封面 1672×941 WebP；全尺寸與 360×225 中央卡片裁切已看，沒有文字 logo。兩把鑰匙留在輸入側、空白收據輸出，alt 描述此關係。

## 驗證紀錄

獨立技術 reviewer 核對公告、release、patch與固定commit原始碼，判內容可發布；繁簡混字已修。合成測試另獨立重跑 PASS。使用官方 registry 的 pnpm 12.1.0 完成 frozen-lockfile 安裝，lockfile 未變；預設 11.25.0 不符 engines，未降低要求。Astro命令使用 ASTRO_TELEMETRY_DISABLED=1，不改站台設定。正常 `pnpm dev --host 0.0.0.0` 在 ready 前退出，localhost:4321 連線拒絕；未繞過安全限制或宣稱整頁互動預覽通過。正文無新增 SVG 圖解。
