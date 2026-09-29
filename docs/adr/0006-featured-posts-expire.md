# 0006 首頁精選改為有期限的人工策展加自動補位

- 狀態：accepted
- 日期：2026-09-29

## 脈絡

首頁「精選文章」原本是 `featured: true` 的文章取發布日最新 3 篇。`docs/content-guide.md` 規定新文一律 `featured: false`，並要求「每季回顧輪替」，但沒有任何機制執行輪替。結果 211 篇文章中只有 4 篇標記精選，首頁精選長期凍結。

## 決定

1. `featured: true` 必須同時設定 `featuredUntil`（`src/content.config.ts` 的 `superRefine` 強制），到期日當天仍有效，過期後首頁自動略過。
2. 未過期精選不足 3 篇時，以最近更新（`updatedDate ?? publishDate`）且不在最新文章區的文章補位。選取邏輯是 `src/utils/content.ts` 的純函式 `selectFeaturedPosts`，時間由呼叫端注入。
3. `.github/workflows/deploy.yml` 每週一 UTC 00:00 排程重建，讓到期在沒有發文的週次也會生效。

## 理由

「哪篇值得當標竿」是編輯判斷，無法用規則或流量可靠表達，所以保留人工旗標；缺的是讓判斷自動過期的機制。把季度輪替從文件建議變成 build 時的規則，比依賴人記得回頭改更可靠。

未採用的方案：純規則評分（篇幅、系列、更新時間）會偏好長文，無法表達作者立場這類品質條件；依 Cloudflare Web Analytics 流量排序會讓 build 依賴外部 API 與 secret，違背 ADR 0001 的可重現靜態輸出。

代價：補位文章不一定符合 content-guide 的精選四原則，精選區的標語因此是「盡量」而非保證；排程重建每週多一次部署。靜態輸出下到期精度是「下一次 build」，最多延遲一週。

**Falsified if:** `src/pages/index.astro` 不再透過 `selectFeaturedPosts` 取精選，或 `src/content.config.ts` 允許 `featured: true` 而不設 `featuredUntil`，或 `.github/workflows/deploy.yml` 移除 `schedule`。
