---
title: "多人共用 Agent 工作流，品質規則要做進 Repository"
description: "從 Composio 的 anti-slop software factory 經驗，拆解功能共置、端到端型別、可判定的 lint 與快速 CI，並釐清重複程式、React hooks 禁令和 Bugbot 各自適用的邊界。"
publishDate: 2026-10-13T16:10:00+08:00
updatedDate: 2026-10-13T16:38:53+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
series: AI Agent 工程化與工作流實戰
seriesOrder: 84
cover: ../../assets/covers/anti-slop-software-factory-repository-gates.webp
coverAlt: "白色工業檢驗台上的精密量規檢查輸送帶零件，歪斜零件進入側邊退件盤，對齊零件通過綠色指示燈旁，象徵 repository 的品質檢查。"
---

同一份程式庫裡，工程師、產品經理與行銷人員各自帶著 Agent 修改功能。第一個人做出一個繞路，第二個人的 Agent 搜尋到它，當作範例再做一個。幾週後，審查者必須先辨認哪種寫法才是團隊真正想維護的，再判斷這次功能有沒有做對。

Sarah 在 [2026 年 10 月 13 日的貼文](https://x.com/sarahfim/status/2109736893198016898)（台北時間）連到她的長文 [How to build an anti-slop software factory for teams of 30+](https://x.com/i/article/2108633271882145792)。她自述負責 Composio 的產品工程，dashboard 已有近 50 位跨工程、產品與行銷的貢獻者。她的核心判斷是：團隊共用的工廠在 repository 裡；個人的 Agent、模型與操作習慣可以不同，但交付物必須接受同一套檢查。

她稱問題為 slop compounds：欠缺約束的程式會成為下一輪生成的材料。這是她對累積現象的描述，原文沒有提供能證明「指數成長」的量測。以下把她的做法拆成可採用的工程選擇，補上官方文件能確認的能力與限制；採用順序與停止條件是本文的建議。

## 功能共置，讓搜尋範圍接近修改範圍

Sarah 把共置排在第一項：一條 route 使用的元件、helper 與測試放在附近，減少 Agent 為理解一個功能而打開整個程式庫的機會。她甚至禁止 `lib` 與 `utils` 目錄，避免所有尚未命名的責任往同一處堆。

這個經驗值得採用的部分是責任位置清楚。假設要改「取消訂閱」畫面，Agent 應該能在該功能附近找到提示文案、操作邏輯與失敗案例。若測試在另一個根目錄、文案在全域常數、狀態轉換又藏在共用 helper，修改者需要先重建一張依賴圖，才知道變更範圍。

[Next.js 的專案結構文件](https://nextjs.org/docs/app/getting-started/project-structure)允許在 App Router 中共置檔案；route 由 `page` 或 `route` 檔案公開，`_` 前綴的 private folder 可以明確排除路由。這提供組織方式，並沒有替團隊判定功能邊界，也不會自動阻止跨功能 import。

我會先拿最近一個 PR 檢查三件事：

- 修改一個使用者行為時，實作與測試能否在同一個功能範圍找到？
- 共用模組的名字是否說得出它負責的契約，而非只寫 `utils`？
- 若某個 import 不被允許，工具是否會回報失敗，還是得靠 reviewer 記得？

把資料夾搬近只是起點。若 feature A 仍能任意讀取 feature B 的內部檔案，目錄看起來整齊，耦合依然存在。需要維護的邊界要落到 import 規則或公開介面上。

## 型別要指出變更影響，輸入仍要在執行期驗證

原文推薦 tRPC 與 OpenAPI，理由是 schema 變更時，希望工具指出哪些呼叫端也需要修改。對 Agent 而言，這種具體 diagnostic 比「記得同步前端」更容易執行。

但這裡有兩條不同的工作線。[tRPC 的 quickstart](https://trpc.io/docs/quickstart)把 procedure 型別提供給 client，同時另設 input parser 驗證收到的值。編譯期型別協助更新已知呼叫者；執行期驗證處理真正進來的資料。HTTP 請求可能來自舊版 client、其他語言或直接構造的請求，不受當前 TypeScript 編譯結果保護。

OpenAPI 描述本身也不能保證編譯器一定報錯。團隊還需要選定產生 client 或型別的工具，確保產物與 schema 同步，並在 CI 檢查契約漂移。採用驗證器後，才有相應的執行期拒絕行為。

因此，驗收不要只寫「有型別」。可以選一個欄位改名，確認呼叫端在檢查時失敗；再送一筆不合法的輸入，確認服務在預定邊界拒絕。兩次檢查證明的是不同能力。若只有前者，還不能把外部資料當成已驗證。

## 可以重複呈現邏輯，不能複製必須一起改的政策

Sarah 最有爭議的建議是接受 duplication。她認為局部 helper 或確認視窗可以各自保留，讓每個功能掌握自己的 UX；button 與樣式 token 等全域 primitive 則仍應共用，並由 lint 強制。

我會用「變更時是否必須一致」決定能不能重複。兩個確認視窗目前長得一樣，但一個取消排程、另一個刪除草稿，日後文案和操作節奏可能分開，局部實作有合理性。若兩個 helper 判斷的是同一項訂閱權益，政策更新卻只改一份，就會讓相同使用者在不同頁面得到不同答案。

共享的成本是耦合；重複的成本是漂移。生成程式碼變便宜，沒有讓這兩種維護成本消失。對每個想抽出或複製的模組，先回答：

```text
這兩份程式是否代表同一個必須一致的決策？
未來其中一份改變，另一份是否必須在同一次變更更新？
若答案是「必須」，共同契約由哪個模組與測試擁有？
若答案是「不必」，局部差異是否已在功能測試中表達？
```

這是採用 duplication 的條件，不能從原文推導成「Agent 能重寫，所以共用模組都不值得」。全域 primitive 之外，產品政策也可能需要單一來源。

## 能明確判定的錯誤，才值得變成 lint

Sarah 說 dashboard 有 38 條自訂 lint 規則，將 theme、primitive 與目錄慣例做成檢查。這個數量是作者自述，沒有公開規則清單可供本文逐條核對。數量本身也不代表品質；真正有用的是哪種反覆糾正已經能自動判定。

[ESLint 的 custom rules 文件](https://eslint.org/docs/latest/extend/custom-rules)提供回報位置、訊息、建議與修復等能力。團隊可以把「這個 import 不合法」寫成規則，並在錯誤訊息指出允許的替代入口。檢查若同時在本機與 CI 執行，不論貢獻者帶哪一種 Agent，都能收到同一份回饋。

我會把這種規則的完成條件寫成：

```yaml
# 概念範例，需接入專案實際的 lint 設定與 CI。
rule:
  id: feature-public-import-only
  scope: feature 之間的 import
  reject: 從另一個 feature 的內部檔案匯入
  allow: 從該 feature 的公開入口匯入
  feedback: 指出違規位置與可用入口
  verification: 保留一個必須失敗與一個必須通過的案例
  enforcement: 本機檢查與合併必要的 CI check 使用同一規則
```

反過來，「這段程式看起來不夠優雅」通常還沒有穩定的判定條件。硬寫成 lint，可能只是把審美爭論轉成大量例外。先找出可描述的錯誤模式與合法路徑；已有規則能處理時，沿用既有規則。

**停止規則：規則若只能攔下壞範例，卻無法保留合法案例或解釋替代路徑，先別升為合併門檻。** 規則自己的測試與誤報也需要維護。

## 禁用 hooks 是團隊政策，不能當成 React 定律

原文提到，團隊對 `useState` 和 `useEffect` 採取預設禁用、需要註解理由才能例外的做法，鼓勵優先使用 repository 已有的 Query、Form 與 URL state 工具。

這個政策對資料密集的 dashboard 有可理解的動機：遠端查詢、表單狀態與 URL 狀態已有擁有者，再加一份 local state，容易讓同步責任分裂。但直接抄一條「不能用 hooks」的規則，會把簡單的互動也推進不必要的依賴。

[React 官方的 You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)建議在 render 時計算衍生資料，避免為它額外建立 state 與 Effect；同時保留 Effect 與外部系統同步的用途。這與全面禁止不同。純局部互動也可能合理使用 `useState`。

比較可採用的審查問題是「這個狀態由誰擁有」。遠端資料回到 Query 的管理範圍；表單回到表單模型；需要可分享、可還原的篩選條件放到 URL；其餘局部互動再評估 local state。若用 Effect 同步兩份應該只有一個來源的 state，先移除多餘的一份。

原文也把 skills 視為容易過期、可能被忽略的指示。我同意能確定判定的約束應該有可執行檢查，但 skill 仍能教人怎麼啟動環境、查驗證據與處理失敗。操作流程與品質門檻可以互相配合；一份長文件不能替代 CI，一條 lint 也教不完整的除錯方法。

## Bugbot 補判斷，測試保護行為

Sarah 的排列是先建 end-to-end 測試，再使用 bugbot。她自述試用 Meticulous 重播 staging 與 preview 的 session，並用 MCPJam 測試 MCP server；這些是她報告的使用經驗，本文沒有測量工具的覆蓋率或效果。

對採用者來說，應先列出哪些行為必須被保護。若「取消訂閱」的驗收只看按鈕消失，卻沒檢查操作失敗時的提示或重新整理後的結果，畫面比對通過仍可能漏掉功能問題。測試要觀察與目標有關的結果，不只確認頁面能開。

Bugbot 可以補上跨檔邏輯與難以固定判定的問題，但不能把每則評論都當成已確認的 bug。[Cursor 現行文件](https://cursor.com/docs/bugbot)支援以 `.cursor/BUGBOT.md` 提供專案規則；原文簡稱 `BUGBOT.md`，實際採用時應依文件放在正確位置。規則文件提供審查脈絡，本身不等於不可略過的合併門檻。

收到一則有用的評論後，先重現它。若找到可穩定判定的模式，將它交給測試或 lint；若它仍需要產品脈絡，就留給審查者做判斷。這能讓下一次 review 少處理一個已知問題，而不是讓同一個 bugbot 每次重新猜一次。

站內的 [ReviewBench 文章](/blog/reviewbench-ai-code-review-acceptance-gates/)進一步討論 review 評估與驗收的差別；若問題是 Agent 如何自己跑出可重現證據，接著讀 [Agent 要能並行，先把工作變成可驗收結果](/blog/agent-work-requires-verifiable-codebase/)。

## CI 的等待時間，也是修改一次的成本

原文最後談快速 CI。當產品或行銷貢獻者主要靠 preview deployment 看結果，build 與 checks 就是他們取得回饋的路徑。Sarah 自述改用 Blacksmith 後，部分 checks 縮短 50%，部分超過 70%；沒有公開基準條件，不能直接當成其他團隊的預期收益。

我會先量測「從提交到第一次可採取行動的回饋」，拆出排隊、安裝、靜態檢查、測試與 preview 就緒的時間。同時記錄返工次數及實際審查時間。快但反覆失敗的 pipeline，未必比稍慢且結果穩定的 pipeline 省人力。

改善順序可以先檢查是否有重複工作、快取能否正確命中，以及哪些獨立 checks 可以並行。快速的確定性檢查應盡早回報，完整的必要 gates 仍要在合併前完成。不能為了縮短數字而省略檢查，或沿用修改前的通過結果。

## 下一個 PR，先消掉一種需要人重複提醒的錯誤

原文在基礎規則之後才介紹內部 cloud agent Zen。Sarah 自述它自二月以來合併超過 1,300 個 PR，九月為 245 個。這是自動化量級的線索，缺少任務組成、返工與缺陷資料，不能換算成生產力倍數。

本文會先選一條最近反覆出現的 review 留言：找出它的責任位置、合法寫法與失敗案例，把能判定的部分接進工具。再讓一位使用不同 Agent 的貢獻者完成同類修改，確認他不需要讀到原本的聊天，也能收到相同診斷並修正。

記錄這次規則攔住什麼、誤報什麼，以及審查者還需要補哪項判斷。若規則只讓大家多寫一行關閉檢查的註解，就回頭修規則的範圍。當同一種錯誤已不必在每個 PR 重講，團隊才有證據知道這次投入改善了共同工作環境。

若要追問共同規則如何從返工長出來，接著讀 [Magpie 的錯題本：讓 Agent 復盤改變下一次驗收](/blog/magpie-lessons-evidence-to-acceptance/)。它把教訓升級、回退測試與合併版本紀錄放在一起，也保留規則升級後仍漏做驗收的證據。
