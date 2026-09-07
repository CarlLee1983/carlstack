---
title: "AI Coding 入門不是做出網頁：用三個可驗收專案學會交付"
description: "把 AI Coding 的學習順序收斂為三個可驗收專案：先看懂改動，再處理狀態，最後交付有資料與權限的產品；每一步都留下可以重跑的證據。"
publishDate: 2026-09-07T09:34:34+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
cover: ../../assets/covers/ai-coding-beginner-learning-route.png
coverAlt: "暖白色紙張上的藍色路徑依序連接空白網頁、驗證節點與燈塔，旁有紅色停止標記。"
---

第一次用 AI 做出網頁，最容易得到錯誤的回饋：畫面出現了，就以為自己已經學會開發。真正困難的部分通常在第二次修改之後：一個按鈕改壞別頁、登入後讀到別人的資料，或部署完成卻不知道如何找錯與回復。

南晚的[原始 X Article](https://x.com/snwiki238337/status/2096620007606399159)給初學者的路線，涵蓋需求、程式、測試、安全、發布與維護。它最值得保留的不是工具清單，而是順序：AI 可以協助每一步，人仍要定義範圍、讀懂變更，並驗證結果。

我的立場是：**AI Coding 的入門門檻不是「能生成程式」，而是能拿出一個可重跑的交付證據。**先完成三個刻意受限的專案，比直接做「下一個 Notion」更快學到這件事。

## 第一個專案：只學會看見改動

從一個靜態頁面或單位轉換器開始。這一階段不需要登入、資料庫、付款或 Agent 自動化；目標是回答四個問題：程式從哪裡啟動、這次動了哪些檔案、畫面是否如預期，以及壞掉時如何回到上一版。

每次只交給 AI 一件小工作，先要求它說明預計修改的檔案，再看 diff，最後自己在瀏覽器操作一次。Git 的 `status`、`diff` 與 commit 不是進階儀式，而是讓人能核對與撤回變更的最小基礎；[Git 官方教學](https://git-scm.com/docs/gittutorial)正是從這條工作流開始。

```text
任務：替表單補上一個必填欄位提示
範圍：只可修改表單元件與其樣式
完成證據：列出 diff；空白送出時顯示提示；填入後可正常送出
停止規則：若找不到啟動方式或現有驗證位置，先回報，不要猜測重構
```

這個契約比「幫我把表單做好」短，卻多了可檢查的結果。完成標準也很直白：另一個人不用聽你解釋，能完成頁面的核心操作。

## 第二個專案：讓「能跑」接受反例

第二個專案選有狀態的小工具，例如待辦清單、讀書紀錄或預算計算器。它必須處理輸入、空狀態、載入中、成功與失敗，才會迫使你區分畫面看起來正常，和產品行為正確的差別。

這時再補 HTML、CSS、JavaScript 與瀏覽器 DevTools 的基礎。MDN 的[Learn web development](https://developer.mozilla.org/en-US/docs/Learn_web_development)以這些瀏覽器與網頁基礎為主線；不必先上完所有課，但要能看懂變數、函式、條件與 console 錯誤大致在說什麼。

對每個功能寫一條可操作的驗收句，而不是讓 AI 自評：

| 功能     | 可驗收的證據                             |
| -------- | ---------------------------------------- |
| 新增項目 | 送出後清單多一列，輸入框清空             |
| 空清單   | 顯示下一步提示，不是空白畫面             |
| 壞輸入   | 不新增資料，且說明原因                   |
| 修正 Bug | 先有穩定重現步驟，修正後同樣步驟不再失敗 |

> [!IMPORTANT]
> **AI 說「已修復」不是證據。**同一組重現步驟、測試或畫面操作必須在修改後通過，才算完成。

這也是開始寫自動測試的好時機，但不用為了「有測試」而把每個 CSS 顏色寫成斷言。先固定一條最容易回歸的核心流程；[Playwright 的官方文件](https://playwright.dev/docs/intro)提供了從瀏覽器端驗證這類流程的起點。

## 第三個專案：只交付一條有資料的完整流程

最後才做帶登入與資料保存的小產品，例如客戶需求收集器或帶帳號的待辦清單。刻意把範圍限成一條流程：登入 → 建立資料 → 保存 → 查看 → 編輯或刪除 → 處理錯誤。

這裡最不能省略的是區分 authentication 與 authorization。登入只能回答「你是誰」；授權還要保證使用者 A 無法改一個 URL、ID 或請求參數就讀到使用者 B 的資料。OWASP 將這類存取控制失敗列為 Web 應用的重要風險，並在[Top 10](https://owasp.org/www-project-top-ten/)與[Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)提供對應檢查面。

發布前先跑最小 gate，而不是等功能堆滿再做安全掃描：

```yaml
core_flow: 使用者只能讀寫自己的資料
manual_check: 用兩個帳號交叉嘗試讀取與修改對方資料
secrets: 真實金鑰不進 repository；以部署平台受控的 secret store 提供，repository 只留 .env.example
recovery: 寫下看 log 的位置、最近可用版本與 rollback 步驟
stop_when: 無法確認資料隔離或無法復原，先不發布
```

若有檔案上傳、管理後台、支付或真實個資，這個 gate 要再擴大；不要把練習專案的「看起來可用」直接升級成可承受真實使用者的系統。

## 30、60、90 天不該是功能數量競賽

原文的 30／60／90 天安排可以改成三個可觀察的成果：前 30 天完成上面三種小專案；第 31 至 60 天，只找一個真實問題，訪談幾位可能使用者後把第一版限為一個核心動作與三個以內頁面；第 61 至 90 天讓真實使用者試用，記錄卡住點，再每週修一兩個最影響結果的問題。

衡量方式不是新增了多少頁，而是能否回答：誰在什麼步驟失敗、你根據哪個證據改了什麼、以及出錯後怎麼回復。這也和本站談過的 [AI 能生成程式碼後，工程基本功決定你怎麼驗收](/blog/agentic-coding-software-engineering-fundamentals/)與 [Coding Agent 不是自動駕駛](/blog/coding-agent-feedback-loop/)一致：模型可以執行，交付仍需要範圍、外部驗證與人保留的決策。

## 今天就開始：建立一個可撤回的小變更

不要先收藏十種工具。挑一個最小專案，請 AI 找出入口與三個低風險修改，只選一個；看完 diff 後用瀏覽器驗收，通過才 commit。當你能把「它生成了」換成「我限制了範圍、看過變更、重跑過證據，也知道怎麼回復」，才真正跨過 AI Coding 的入門線。

### 參考資料

- [使用者提供的原始 X Article：AI Coding 新手學習路線](https://x.com/snwiki238337/status/2096620007606399159)
- [Git Tutorial](https://git-scm.com/docs/gittutorial)
- [MDN Learn web development](https://developer.mozilla.org/en-US/docs/Learn_web_development)
- [Playwright introduction](https://playwright.dev/docs/intro)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
