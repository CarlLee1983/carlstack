# shadcn-admin 專案研究

檢視日期：2026-09-27。Repository：[`satnaing/shadcn-admin`](https://github.com/satnaing/shadcn-admin)。`main` 指向 commit [`e16c87f`](https://github.com/satnaing/shadcn-admin/commit/e16c87f213a5ba5e45964e9b67c792105ec74d26)，author/committer 日期為 2026-06-11。

## 專案定位與狀態

- README 將它描述為以 Shadcn UI 與 Vite 製作的管理後台 UI，主打響應式、無障礙、淺／深色主題、RTL、側欄、全域搜尋與 10 多個頁面；README 也說明這份程式主要是可重用 UI 集合，而非已接好產品服務的完整系統。[README](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/README.md)
- 截至檢視日，GitHub Repository API 回報 `is_template=true`、MIT 授權、建立於 2024-01-26、`pushed_at=2026-09-10`，並顯示 14,443 stars、2,236 forks、24 open issues。[Repository metadata API](https://api.github.com/repos/satnaing/shadcn-admin)
- `pushed_at` 是 repository 層級資訊；目前 `main` 的 HEAD commit 日期仍是 2026-06-11。不要把 repo push 時間解讀成該分支最近程式碼 commit 時間。
- Releases API 的最新正式 release 是 `v2.2.1`（2025-11-06）；`main` 在此之後仍有程式碼變更。README 稱不是 starter template，但 GitHub API 將 repository 標記為 template，採用者應分開理解 GitHub 的複製功能與專案是否已具備產品後端。[Latest release](https://api.github.com/repos/satnaing/shadcn-admin/releases/latest) · [CHANGELOG](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/CHANGELOG.md)

## 技術堆疊與程式結構

- Manifest 包含 React 19、TypeScript、Vite 8、Tailwind CSS 4、TanStack Router、TanStack Query、TanStack Table、Radix primitives、Zustand、Zod、Clerk 與 Vitest/Playwright。[package.json](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/package.json)
- Vite 設定 TanStack Router 的檔案式路由外掛與自動 code splitting；主入口建立 Router 和 QueryClient，並套上 theme、font、direction providers。[vite.config.ts](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/vite.config.ts) · [src/main.tsx](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/main.tsx)
- `src/routes/` 負責路由，`src/features/` 依 dashboard、tasks、users、chats、apps、auth、settings 等功能分組，`src/components/` 放共用版型、資料表和 UI 元件。[src/routes](https://github.com/satnaing/shadcn-admin/tree/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/routes) · [src/features](https://github.com/satnaing/shadcn-admin/tree/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/features) · [src/components](https://github.com/satnaing/shadcn-admin/tree/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/components)
- 使用者與 task 路由以 Zod 驗證 URL search state，包含頁碼、每頁筆數、狀態、角色／優先級與文字篩選；路由及資料表 UI 因此能示範可分享的篩選網址。[users route](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/routes/_authenticated/users/index.tsx) · [tasks route](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/routes/_authenticated/tasks/index.tsx)

## 功能範圍與資料／認證邊界

- 路由包含 dashboard、apps、chats、help center、tasks、users、settings（account、appearance、display、notifications）、登入／註冊／忘記密碼／OTP，以及錯誤頁；另有獨立的 Clerk 登入與 user management 範例。[src/routes](https://github.com/satnaing/shadcn-admin/tree/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/routes)
- task 與 user 列表資料由 Faker 產生並固定 seed；dashboard overview 使用 `Math.random()` 建立示範圖表資料。聊天也有本地 JSON fixture。[tasks fixture](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/features/tasks/data/tasks.ts) · [users fixture](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/features/users/data/users.ts) · [dashboard chart](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/features/dashboard/components/overview.tsx) · [chat fixture](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/features/chats/data/convo.json)
- 檢視的 `src/` 沒找到連接產品資料的 `fetch`、Axios request、`useQuery` 或 `useMutation` 呼叫；QueryClient 有全域錯誤與重試設定，但這不等於已有資料 API。這是對該 commit 原始碼的盤點，不代表專案無法整合 API。
- 一般登入表單等待後寫入 `mockUser` 與 `mock-access-token`；Zustand auth store 以 cookie 保存 token。Clerk 是可選的獨立 `/clerk` route group，透過 `VITE_CLERK_PUBLISHABLE_KEY` 開啟，README 也將它標成 partial auth。[sign-in form](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/features/auth/sign-in/components/user-auth-form.tsx) · [auth store](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/stores/auth-store.ts) · [Clerk route](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/src/routes/clerk/route.tsx) · [.env.example](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/.env.example)
- 推論：適合拿來研究或沿用前端版型、導航、表格／表單互動；接真實使用者前，資料持久化、服務 API、授權與後端安全控制仍需由採用者完成。

## shadcn 元件客製與升級

- README 列出一般修改的 `scroll-area`、`sonner`、`separator`，以及為 RTL 更新過的 `alert-dialog`、`calendar`、`command`、`dialog`、`dropdown-menu`、`select`、`table`、`sheet`、`sidebar`、`switch`；透過 shadcn CLI 更新這些元件時需要保留或人工合併客製內容。[README](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/README.md)
- shadcn/ui 官方文件說明它交付的是可修改的元件程式碼。官方於 2026-07 將新專案預設 primitive 改成 Base UI，但明確表示 Radix 仍受支援；shadcn-admin 檢視 commit 仍以 Radix 為基礎。新專案應把這個 primitive 選擇與元件升級一起評估。[shadcn/ui introduction](https://ui.shadcn.com/docs) · [Base UI default notice](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)

## 本機使用、品質命令與授權

- README 的啟動流程是 `pnpm install`、`pnpm run dev`。[README](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/README.md)
- `package.json` 提供 `build`（TypeScript project build 加 Vite build）、`lint`、`format:check`、`knip`、Vitest headless/browser/UI 測試；測試由 Vitest Browser 與 Playwright Chromium 執行。[package.json](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/package.json) · [vite.config.ts](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/vite.config.ts)
- 授權為 MIT。Contributing guide 建議新功能先經 issue/discussion 討論，並維持 ESLint、Prettier、TypeScript 慣例。[LICENSE](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/LICENSE) · [CONTRIBUTING](https://github.com/satnaing/shadcn-admin/blob/e16c87f213a5ba5e45964e9b67c792105ec74d26/.github/CONTRIBUTING.md)

## 研究限制

本次以 README、manifest、主要路由／feature／資料與 auth 檔案、commit/release metadata、官方 shadcn/ui 文件為一手資料；未安裝依賴、執行對方專案測試、檢查每一個 issue/PR、完整逐頁目視檢查或驗證部署中的 demo，也不是資安審計。上述限制不影響把 fixture 與 mock auth 標示為 demo 邊界，但不能據此推論其生產品質或安全性。
