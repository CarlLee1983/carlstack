---
title: "Vibe Coding 上線前，別問「安全嗎」：交出七項可重跑的證據"
description: "把公開網站的安全驗收收斂成七項可重跑結果：帳號隔離、後端授權、併發計費、付款冪等、資源上限、憑證輪換與覆蓋缺口。它們不能取代安全審計，但能阻止「功能能跑」被誤當成可以上線。"
publishDate: 2026-09-07T17:30:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 資訊安全
  - 軟體品質
series: AI Agent 工程化與工作流實戰
seriesOrder: 14
cover: ../../assets/covers/vibe-coding-security-verification.png
coverAlt: "透明服務裝置的資料夾、付款硬幣與用量計三條輸入路徑各自通過檢查閘門，其中一條未授權路徑被阻擋。"
---

一個網站能登入、按鈕能點、付款 sandbox 能走完，證明的是使用者照著你預想的路徑操作時功能可用。公開上線後，別人會改 URL 裡的 ID、同時送十次請求、重送付款通知，或直接略過前端呼叫後端。這時候最危險的不是程式報錯，而是它安靜地交出別人的資料、額度或預算。

蘇樂的〈[Vibe Coding安全保姆级教程｜不懂安全也能完成验收](https://x.com/ai_suxiaole/status/2096581535776526664)〉把這個落差整理成給非安全背景讀者的上線前檢查。我的主張更窄：**不要要求 Agent 或開發者回答「安全嗎」；要求他們交出七項可以重跑、也可能失敗的結果。**

這不是完整安全審計，也不是叫你在 production 測試攻擊。它是一個停止規則：任何一項沒有環境、版本、步驟、實際結果與證據位置，就標為「未驗證」，而不是寫成「沒問題」。

## 先把「誰不該得到什麼」寫成不變量

安全工具能讀程式，卻不知道你的免費方案是否可跑 AI 任務，也不知道一筆付款究竟能買幾次使用權。這些不是掃描器能從程式碼推導的規格；先由產品 owner 確認，再交給開發者與 Agent 驗證。

```yaml
security_invariants:
  - 使用者只能讀寫自己的資源，除非有明確分享關係
  - 免費使用者不能執行付費功能
  - 餘額不足時不能建立付費任務
  - 每個任務與每筆付款最多各生效一次
  - 一般使用者不能把自己升級為管理員
```

這份清單不是「安全設定檔」的替代品；它只是把要驗證的商業規則從模糊的「不要有漏洞」變成可被推翻的句子。若一條規則沒有 owner 或答案，先標為待定義，不能讓 Agent 自行猜測後再宣布通過。

## 七項驗收不是功能清單，而是失敗案例

| 驗收結果     | 最小測試                                 | 什麼結果才算通過                       |
| ------------ | ---------------------------------------- | -------------------------------------- |
| 帳號隔離     | 用測試帳號 B 對帳號 A 的資源做讀、改、刪 | 後端拒絕，不能只靠頁面隱藏按鈕         |
| 後端判斷     | 改送來的價格、角色、資源 ID 或額度       | 價格、角色與歸屬由伺服器重新決定       |
| 併發計費     | 餘額只夠一次時，同時送出多個任務         | 最多一個任務建立、一次扣費             |
| 付款通知     | 重送、亂序或竄改 webhook                 | 合法事件只入帳一次；不相符事件遭拒     |
| 資源與成本   | 對註冊、上傳與 AI 呼叫超過預設上限       | 被限制、排隊或拒絕，且可觀察到原因     |
| 憑證生命週期 | 搜尋可讀程式碼、建置產物與日誌           | 不輸出祕密；已外洩的舊憑證已撤銷與輪換 |
| 覆蓋缺口     | 列出看不到的雲端、平台與 production 設定 | 明確標為未驗證，附上該由誰檢查         |

第一列特別容易被正常流程測試漏掉。OWASP 明確區分 authentication（確認你是誰）和 authorization（確認你是否可做這個動作）；已登入的人不會因此取得每個資源的權限。它建議每一個 request 進行授權檢查，並指出前端控制只能改善體驗，不能作為最終安全控制。[OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

因此，「B 看不到 A 的按鈕」不是證據；「B 對 A 的真實資源 ID 發出請求，後端拒絕」才是。需要 BOLA、Mass Assignment 或 JWT 的防禦實作時，再回到本站的 [API 安全防禦實戰](/blog/api-security-owasp-top-10-defenses/)；這裡只關心你是否留下了實際結果。

## 把正常重試當成安全案例，而不是例外

許多計費錯誤沒有惡意 payload。使用者連按兩次、手機重連或支付服務重送事件，都能讓「先檢查餘額、稍後才扣款」的流程重複生效。

以「只剩一份額度」為測試資料：同時送 10 個請求，驗收不該是「API 沒有 500」，而是任務數與扣費紀錄都等於 1。這個測試會迫使實作處理原子性、唯一約束或冪等鍵；具體手段依資料庫與任務系統而定，本文不假裝有一個通用實作。

付款通知也一樣。Stripe 說明 webhook event 可能至少傳送一次，處理端需驗證簽章並能安全面對重複事件。[Stripe Webhooks](https://docs.stripe.com/webhooks) 所以驗收紀錄至少要包含 event ID、對應訂單、處理前後狀態，以及重送後為何沒有第二筆入帳。只看第一次 sandbox 付款成功，無法證明這條不變量。

## 掃描通過，不等於平台設定已被檢查

AI 很適合協助列出入口、搜尋祕密、產生測試與找出可疑路徑；但它無法讀到的資料庫 RLS、物件儲存公開性、production 金鑰、雲端預算與低代碼設定，不能被輸出中的自信語氣補上。

把這些地方放進一張覆蓋表：

| 系統面           | 本次可取得的證據                     | 尚未驗證時的 owner   |
| ---------------- | ------------------------------------ | -------------------- |
| 程式碼與測試環境 | commit、測試帳號、測試輸出           | 開發者               |
| 資料庫與檔案儲存 | policy 匯出、私有檔案讀取測試        | 資料／平台管理者     |
| 支付與成本上限   | webhook 測試、限額設定截圖或設定紀錄 | 金流／雲端帳務 owner |
| production 祕密  | 祕密管理系統的輪換與存取紀錄         | 基礎設施 owner       |

這不是把截圖收集得越多越安全；目的是讓「我沒有權限看這裡」變成可交接的工作，而不是空白。OWASP 的祕密管理指引把存取控制、輪換與稽核都列為祕密的生命週期責任。[OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

> [!WARNING]
> 動態驗證只能在本機或明確獲准的測試環境進行。不要用真實使用者資料、正式付款端點或會產生真實費用的 AI 呼叫來「驗證安全」。

## 交付一份會說「不知道」的報告

最後的報告不用很長，但七個項目都要有同一種結構：不變量、環境與版本、重現步驟、實際結果、證據位置、覆蓋狀態。修復後重新跑原本會失敗的步驟，也測一次合法使用者的正常流程；否則只知道門被鎖上，不知道正確使用者是否還能進去。

這和 [AI 能生成程式碼後，工程基本功決定你怎麼驗收](/blog/agentic-coding-software-engineering-fundamentals/) 的原則相同：生成速度不構成證據。安全場景更嚴格，因為「沒有發現」至少有兩種意思——真的沒有問題，或這次沒有看到問題發生的地方。

下一個要上線的產品，不必先做全面滲透測試。先建立兩個一般測試帳號，挑一個付費或高成本入口，跑完帳號隔離、併發扣費與重送通知三個失敗案例；同時列出一個你尚未驗證的平台設定及它的 owner。拿不到這四份結果，就先不要把「功能能跑」換成「可以上線」。

## 來源

- [蘇樂：Vibe Coding安全保姆级教程｜不懂安全也能完成验收](https://x.com/ai_suxiaole/status/2096581535776526664)（2026-09-06）
- [OWASP：Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP：Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [OWASP：API4:2023 Unrestricted Resource Consumption](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/)
- [Stripe：Webhooks](https://docs.stripe.com/webhooks)
