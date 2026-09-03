# 測試與驗證

三道 gate，全部綠燈才能 commit：

| 指令                            | 內容                                                                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                    | `prettier --check` → `astro check`（TypeScript strict + Astro 模板）→ `astro build`（含 content schema 驗證）                |
| `pnpm test`                     | `node --experimental-strip-types --test tests/*.test.ts`                                                                     |
| `pnpm content:policy -- <base>` | 比對 `<base>` 至工作目錄的文章 diff，擋下 Mermaid fence（[ADR 0004](adr/0004-native-svg-over-mermaid.md)）與無法渲染的 LaTeX |

CI（`.github/workflows/ci.yml`）在 pull request 執行前兩者；`deploy.yml` 在 `main` 更新後先驗證再部署。內容 policy 不在 CI 而在本地 commit 前執行，因為它需要 diff base。

## 測試檔對應的規則

測試守的是[邊界](architecture.md#邊界清單)，不是覆蓋率數字。改動左欄的規則就要更新右欄的測試。

| 規則                                                 | 測試                                  |
| ---------------------------------------------------- | ------------------------------------- |
| 發布日倒序、draft 過濾、taxonomy 正規化、系列排序    | `tests/content.test.ts`               |
| `/blog/` 分頁 URL 形狀與邊界處理                     | `tests/pagination.test.ts`            |
| canonical 與預設分享圖由 `SITE_URL` 產生、文章可覆寫 | `tests/seo.test.ts`                   |
| 部署拒絕 placeholder `SITE_URL`                      | `tests/site-url.test.ts`              |
| 新改文章禁用 Mermaid                                 | `tests/content-policy.test.ts`        |
| h2–h4 錨點連結，重複執行不疊加                       | `tests/rehype-heading-anchor.test.ts` |
| 表格包進水平捲動容器，不重複包裝                     | `tests/rehype-table-scroll.test.ts`   |
| callout 標記轉 `aside`                               | `tests/remark-callout.test.ts`        |
| 目錄只收 h2／h3，h3 掛在前一個 h2 底下               | `tests/toc.test.ts`                   |

## 慣例

測試對象是 `src/utils/` 的純函式與 remark／rehype 外掛，不是 Astro 元件——邏輯放在純函式裡、元件只負責渲染，是讓這件事成立的前提（見 [`docs/architecture.md`](architecture.md) 的邊界清單）。

排序與過濾函式一律驗證「不修改傳入陣列」；外掛一律驗證冪等（重複執行不疊加）與「沒有目標節點時不動樹」。新增同類函式時比照。

## 沒有自動化的部分

視覺回歸沒有自動測試。圖解與版面改動要人工在桌面與 320 px 視窗、淺色與深色四種組合各看一次，見 [`docs/diagram-guide.md`](diagram-guide.md) 的驗收段落。E2E 目前也沒有；`/search/` 需要 `pnpm preview` 手動驗證，因為 Pagefind 索引只在 production build 產生。
