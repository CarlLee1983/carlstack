---
title: "shadcn-admin 有完整後台畫面，資料與權限仍要自己接"
description: "拆解 satnaing/shadcn-admin 的 React 路由、表格與表單範例，區分可沿用的前端介面和仍待實作的 API、持久化與授權邊界。"
publishDate: 2026-09-27T13:29:15+08:00
draft: false
featured: false
tags:
  - 開源專案
  - TypeScript
  - 技術選型
  - 軟體工程
cover: ../../assets/covers/shadcn-admin-ui-template-boundaries.png
coverAlt: "淺色管理後台介面下方有銅色與深藍色管線連往資料模組，其中數個接頭懸空，呈現 UI 已成形但服務尚未接通。"
repositoryUrl: https://github.com/satnaing/shadcn-admin
---

把管理後台做得像產品，最花時間的常是列表、篩選、表單、側欄和不同螢幕尺寸。satnaing 的 [shadcn-admin](https://github.com/satnaing/shadcn-admin) 把這些介面集中在一個 React 專案裡；打開 demo，很容易把「頁面已經完整」看成「後台已經可以接手營運」。

這兩者隔著資料與權限。本文依據 2026 年 9 月 27 日檢視的 `main` commit [`e16c87f`](https://github.com/satnaing/shadcn-admin/commit/e16c87f213a5ba5e45964e9b67c792105ec74d26)、README、原始碼與當前 shadcn/ui 文件，說明哪些部分可以拿來當前端起點，哪些仍是使用者要交付的產品工作。這是程式碼盤點，不是安全審計或逐頁視覺驗收。

## 它交付的是一套可操作的 UI 範例

README 列出淺色與深色主題、響應式版面、RTL 支援、側欄、全域搜尋，以及十多個頁面。[`src/routes/`](https://github.com/satnaing/shadcn-admin/tree/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/routes) 把 dashboard、apps、chats、help center、tasks、users、settings 和錯誤頁串成可導覽的介面；登入、註冊、忘記密碼與 OTP 也有各自頁面。[README](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/README.md)

它最有用的地方不是首頁上的幾張統計卡，而是已經整理好的頁面互動。Tasks 與 Users 有資料表、篩選、分頁、列操作和批次操作；對應 route 用 Zod 驗證 URL 上的頁碼、每頁筆數、狀態、優先級或角色條件。使用者能把篩選後的網址留下或分享，這比只存在元件 state 裡的表格狀態更接近真實後台工作流。[Tasks route](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/routes/_authenticated/tasks/index.tsx) · [Users route](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/routes/_authenticated/users/index.tsx)

路由以 TanStack Router 的檔案式結構組織；Vite 外掛負責產生 route tree，並開啟自動 code splitting。[專案 Vite 設定](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/vite.config.ts) 採用的模式符合 TanStack 對檔案式路由的說明：路由檔案呈現 URL 階層，工具再從目錄產生路由設定。[TanStack Router 文件](https://tanstack.com/router/latest/docs/routing/file-based-routing)

## shadcn 元件是專案裡的程式碼

shadcn/ui 的做法是把元件原始碼交給使用者維護，讓專案可以直接改元件實作；它不只是安裝一個黑盒 UI 套件。[shadcn/ui 官方介紹](https://ui.shadcn.com/docs) 因此，shadcn-admin 的 [`src/components/ui/`](https://github.com/satnaing/shadcn-admin/tree/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/components/ui) 是它設計系統的一部分。

README 特別列出三個一般修改過的元件，以及為 RTL 調整過的十個元件；像 sidebar、table、dialog、select 都在名單內。README 也提醒，透過 shadcn CLI 更新這些元件時要手動合併，否則可能覆蓋原有調整。[README 的元件清單](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/README.md)

這會改變維護方式：元件自由度提高，更新責任也跟著留在專案。另一個時間差值得留意：shadcn/ui 在 2026 年 7 月把新專案的預設基礎 primitive 改成 Base UI，但 Radix 仍受支援；檢視的 shadcn-admin commit 仍使用 Radix。[官方公告](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default) 若沿用這份程式碼，不必為了新預設立刻遷移，但要先決定團隊希望維護哪一套元件基礎。

## 介面有資料形狀，卻沒有產品資料服務

Task 與 User 清單由 Faker 產生並固定 seed，dashboard 圖表則使用 `Math.random()` 建立示範數值。這些資料很適合把表格、篩選、空間配置和列操作填滿；它們不會替採用者連上資料庫或商務 API。[task fixtures](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/features/tasks/data/tasks.ts) · [user fixtures](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/features/users/data/users.ts) · [dashboard chart](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/features/dashboard/components/overview.tsx)

專案入口確實建立了 TanStack Query 的 `QueryClient`，但在這個 commit 的 `src/` 裡，我沒有找到對產品資料發出的 `fetch`、Axios request、`useQuery` 或 `useMutation`。因此，不能把「依賴清單中有資料查詢工具」等同於「頁面已經有可替換的 API 層」。這是我對該份原始碼的盤點；採用者仍可以在自己的 feature boundary 接上服務。[主入口](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/main.tsx) · [package.json](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/package.json)

登入也要分清楚。一般登入表單等候兩秒後就寫入 `mockUser` 和 `mock-access-token`，Zustand store 把 token 放進 cookie；這條路徑是展示登入後版面的模擬流程。[登入表單](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/features/auth/sign-in/components/user-auth-form.tsx) · [Auth store](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/stores/auth-store.ts) 另外的 `/clerk` 路由群組才包裝 Clerk 的 Sign In／Sign Up 元件，而且需要自行設定 `VITE_CLERK_PUBLISHABLE_KEY`；README 將這項整合標示為 partial auth。[Clerk route](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/routes/clerk/route.tsx) · [環境變數範例](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/.env.example)

我的判斷是：shadcn-admin 能替產品團隊縮短「把常見後台介面排出來」的時間，不能替團隊決定誰能看什麼資料、按下操作後要改哪筆資料，或如何在失敗時回復。授權必須在每個受保護的請求重新驗證，不能只靠前端角色欄位或隱藏按鈕；[OWASP 授權指南](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)也明確建議對每次請求檢查權限。

## 把一條資料路徑接通，再估算重用價值

如果要採用，先挑 Users 或 Tasks 做一條垂直切片，而不是先把所有頁面搬進產品：

- **資料來源**：找出列表、篩選、詳情、建立、編輯和刪除使用的 fixture；為每個動作定義 API 請求與回應型別。
- **狀態邊界**：把搜尋、排序、分頁等適合分享的狀態留在 URL；把伺服器資料與待提交表單狀態分開，並補上載入、空結果、錯誤和重試畫面。
- **授權邊界**：用不同角色對同一資源做允許與拒絕測試，且在 API 端重複檢查權限。前端只負責顯示操作，不是安全防線。
- **持久化驗收**：新增或修改一筆資料後重新整理頁面，再以另一個帳號讀取；結果仍符合權限和資料規則才算接通。

這樣可以保留專案已經完成的導覽與互動，又能讓團隊看到整合成本落在哪裡。若第一條路徑必須大幅重寫元件或資料表狀態，先記下原因，再評估沿用完整頁面、只取元件，或只參考它的版面模式。

## 採用前先看清楚版本落差

截至 2026 年 9 月 27 日，GitHub 的 latest release 是 `v2.2.1`，發布於 2025 年 11 月 6 日；目前 `main` 指向 2026 年 6 月 11 日的 commit。也就是說，正式 release 標籤和目前分支原始碼不是同一個時間點。README 一方面說這不是 starter template，另一方面 GitHub Repository API 將它標記為 template；這個標記代表 repository 可作為複製範本，不能單獨證明它已接好產品服務或具備生產環境的認證與授權。[latest release](https://api.github.com/repos/satnaing/shadcn-admin/releases/latest) · [main commit](https://github.com/satnaing/shadcn-admin/commit/e16c87f213a5ba5e45964e9b67c792105ec74d26) · [Repository metadata](https://api.github.com/repos/satnaing/shadcn-admin)

本機啟動很直接：

```bash
git clone https://github.com/satnaing/shadcn-admin.git
cd shadcn-admin
pnpm install
pnpm dev
```

若只要快速做出後台介面原型，它能提供可操作的頁面、表格和 RTL 範例；若要把它變成營運中的產品，先完成一個「API 讀寫、重新整理後資料仍一致、不同角色權限正確」的 Users 或 Tasks 流程，再決定整套版型是否值得保留。啟動畫面只是第一個驗收點，真正的後台從資料與權限開始。

### 參考資料

- [shadcn-admin README](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/README.md)、[package.json](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/package.json)、[CHANGELOG](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/CHANGELOG.md)
- [shadcn-admin main commit](https://github.com/satnaing/shadcn-admin/commit/e16c87f213a5ba5e45964e9b67c792105ec74d26)、[GitHub Repository API](https://api.github.com/repos/satnaing/shadcn-admin)、[latest release API](https://api.github.com/repos/satnaing/shadcn-admin/releases/latest)
- [Tasks route and data](https://github.com/satnaing/shadcn-admin/tree/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/features/tasks)、[Users route and data](https://github.com/satnaing/shadcn-admin/tree/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/features/users)、[dashboard chart](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/features/dashboard/components/overview.tsx)
- [Auth store](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/stores/auth-store.ts)、[Clerk route](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/routes/clerk/route.tsx)
- [shadcn/ui introduction](https://ui.shadcn.com/docs)、[2026-07 Base UI announcement](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)、[TanStack Router file-based routing](https://tanstack.com/router/latest/docs/routing/file-based-routing)、[OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
