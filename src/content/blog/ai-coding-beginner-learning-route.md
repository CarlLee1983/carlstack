---
title: "AI Coding 入門：用三個可驗收專案學會交付"
description: "把 AI Coding 的學習順序收斂為三個可驗收專案：先看懂改動，再處理狀態，最後交付有資料與權限的產品；每一步都留下可以重跑的證據。"
updatedDate: 2026-11-05T23:45:34Z
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

第一次用 AI 做出網頁後，還要試著修改和維護它。第二次修改就可能暴露問題：一個按鈕改壞別頁、登入後讀到別人的資料，或部署完成卻不知道如何找錯與復原。

[原始 X Article 連結](https://x.com/snwiki238337/status/2096620007606399159)是這篇學習路線的主題來源。2026-11-05 查核時無法取得全文，因此不將舊版對原作者內容或 30／60／90 天進度的轉述當作已核實資料。以下三個專案與驗收清單是我的練習建議，沒有經過學習成效的對照研究，也沒有保證完成時程。Git、MDN 與安全文件用來核對技術做法，專案順序則是我的安排。

練習時，我會把限制範圍、讀懂變更、驗證行為與復原列入通過條件。這條路線以瀏覽器應用為例；做資料分析、手機 App 或嵌入式系統時，工具與驗收方式需要調整。

## 第一個專案：先看懂一個可撤回的改動

從靜態頁面或單位轉換器開始，先不加入登入、資料庫、付款或 Agent 自動化。目標是回答四個問題：程式從哪裡啟動、這次動了哪些檔案、畫面是否如預期，以及壞掉時如何回到已知可用版本。

每次交給 AI 一件小工作，要求它說明修改範圍，再看 diff，最後自己操作。[Git 官方教學](https://git-scm.com/docs/gittutorial)示範了檢視、暫存與提交的流程。特別留意：`git diff` 看未暫存變更，`git diff --cached` 看已暫存變更；只看其中一個，可能漏掉將要提交的內容。新檔則要配合 `git status` 與檔案內容一起檢查。

可以把任務說明寫成這樣：

```text
任務：替表單補上一個必填欄位提示
範圍：只可修改表單元件與其樣式
完成證據：列出變更；空白送出時顯示提示；填入後可正常送出
停止規則：找不到啟動方式或現有驗證位置時，先回報，不猜測重構
```

我建議在此階段就配合 [MDN Learn web development](https://developer.mozilla.org/en-US/docs/Learn_web_development)補 HTML、CSS、JavaScript 與開發工具基礎，不必等到第二個專案才學。每次改動至少解釋得出一段程式的用途，以及一個錯誤訊息代表什麼。

完成條件可以訂成：另一個人照 README 能啟動頁面、完成核心操作；你能指出變更並演練復原。先在練習分支操作，不要為了清理工作區直接丟棄尚未保存的內容。Git 的程式碼歷史也不是資料庫或使用者檔案的備份。

## 第二個專案：讓狀態與失敗都能被驗收

選待辦清單、讀書紀錄或預算計算器，使用合成資料。這一階段練習輸入、空狀態、成功與失敗；如果有非同步讀寫，再加入載入中與請求失敗。不要為了湊狀態，替純本機計算器加一個不存在的網路流程。

對每個功能寫可操作的驗收句：

- 新增項目：有效輸入送出後只新增一筆，輸入框清空；快速連按時也符合事先約定的行為。
- 空清單：顯示下一步提示。
- 壞輸入：拒絕空白或超出範圍的內容，說明原因，且不改動既有資料。
- 資料保存：如果宣稱重新整理後仍會保留，就實際重新整理檢查；如果只存記憶體，就明確告知限制。
- Bug 修正：先記錄穩定重現步驟，修改後重跑相同步驟，再檢查相鄰功能。

**停止規則：無法重現或沒有重跑驗證時，不把 AI 的「已修復」當成完成。**可以記錄「尚未確認」，再補診斷資料。

此時可把容易回歸的核心流程寫成自動測試。[Playwright 官方最佳實務](https://playwright.dev/docs/best-practices)建議檢查使用者可見行為，並讓測試隔離，避免彼此共用狀態造成連鎖失敗。可以先固定一條新增與拒絕錯誤輸入的流程，再逐步擴充，斷言以可見行為為主。

AI 生成測試後，也要確認斷言真的會抓到錯誤。在練習分支暫時破壞目標行為，觀察測試是否失敗，再恢復程式。這能檢查測試有沒有測到你關心的結果，但仍不能證明所有路徑都被涵蓋。

## 第三個專案：資料隔離要在伺服器端成立

最後才做帶登入與資料保存的小產品，例如帶帳號的待辦清單。先只交付一條流程：登入、建立、保存、查看、編輯或刪除，再處理錯誤。初期使用測試帳號與假資料，避免讓練習系統直接接觸客戶資料。

[OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)區分身分驗證與授權，並建議預設拒絕、逐次請求驗證權限，以及在正確的執行位置檢查。登入回答「你是誰」，授權決定「你可以對這筆資料做什麼」。把按鈕藏起來或不顯示別人的 ID，不足以保護資料。

以下用 YAML 記錄練習驗收清單，不能直接作為 CI 或平台設定執行：

```yaml
core_flow: 使用者只能讀寫自己的資料
checks:
  - 在自有測試環境建立 A 與 B 兩個帳號
  - 直接呼叫 API，嘗試讀取、修改與刪除另一帳號的資料
  - 確認請求遭拒，而且資料與其他副作用沒有改變
  - 檢查未登入請求同樣無法存取私人資料
secrets: 伺服器端秘密由受控環境提供；不進 repository 或前端產物
recovery: 記錄 log 位置、可用版本、資料備份與復原步驟
stop_when: 資料隔離或復原程序尚未確認，先不開放真實使用者
```

`.env.example` 只放變數名稱與無效的示例值；把秘密搬到環境變數也不代表安全，仍須確認建置工具沒有將它打包到瀏覽器端。程式碼 rollback 與資料復原要分別演練，尤其不能假設還原舊版程式就會撤回資料庫修改。

[OWASP Top 10](https://owasp.org/www-project-top-ten/)是風險認知入口，[Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)則可協助展開測試項目。這份練習清單只涵蓋基本資料隔離，完整安全稽核還需要更多檢查。加入檔案上傳、管理員、支付或真實個資後，需要按功能擴大安全檢查，必要時請有經驗的人審查。

## 用通過條件決定進度，不用天數保證成果

我不建議要求每位新手在前 30 天完成三種專案。能投入的時間、既有基礎與專案複雜度不同，固定天數容易變成功能競賽。可以把每週的檢查點訂得更小：

1. 能讀懂並撤回改動，再進入有狀態的工具。
2. 能重現錯誤、留下測試與說明限制，再加入登入和持久資料。
3. 能確認資料隔離並演練復原，再讓合適的試用者接觸系統。

過關後找一個真實的小問題，先訪談可能使用者，再把第一版限制在一個核心動作。觀察誰在哪一步卡住，每週選出有證據支持的問題修正。

相關的驗收觀念可延伸閱讀本站的 [AI Coding 工程基本功](/blog/agentic-coding-software-engineering-fundamentals/)與 [Coding Agent 回饋迴路](/blog/coding-agent-feedback-loop/)。

## 今天先完成一個可說明的小變更

挑一個練習專案，確認能啟動後，選一個低風險修改。先寫通過與失敗的例子，再請 AI 協助；看完變更、重跑驗收、確認沒有秘密或無關檔案，才保存這個版本。下一次接續時，你應能說清楚改了什麼、驗證了什麼，以及還不知道什麼。

### 參考資料

- [原始 X Article（本次未能讀取全文）](https://x.com/snwiki238337/status/2096620007606399159)
- [Git Tutorial](https://git-scm.com/docs/gittutorial)
- [MDN Learn web development](https://developer.mozilla.org/en-US/docs/Learn_web_development)
- [Playwright introduction](https://playwright.dev/docs/intro)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
