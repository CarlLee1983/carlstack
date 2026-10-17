---
title: "Agent 加進來的套件，授權例外要交給另一個人"
description: "GitHub 開源授權合規功能正式推出。從 Agent 選套件到 PR 合併，拆開預查、依賴圖檢查與例外審核，避免讓修復檢查的人同時放寬政策。"
publishDate: 2026-10-17T14:21:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - 資訊安全
  - 軟體品質
cover: ../../assets/covers/github-license-policy-agent-dependencies.webp
coverAlt: "兩隻分別位於工作桌兩側的手，一邊遞送零件盤，另一邊持印章審核空白卡，象徵實作與授權例外審核分工。"
---

假設 Agent 為匯出功能加了一個套件，程式能跑，測試也過了。PR 卻被授權政策擋住。

接下來的一步，才決定這道檢查有沒有用。如果 Agent 能直接把套件加入例外清單，「修到綠燈」就可能包含修改團隊原本不允許的條件。功能完成了，政策也被一起改掉。

GitHub 在 [2026 年 10 月 16 日宣布開源授權合規功能正式推出](https://github.blog/changelog/2026-10-16-open-source-license-compliance-generally-available/)。適用範圍是 GitHub Enterprise Cloud，包含 data residency 環境，而且目標 repository 必須啟用 GitHub Code Security。公告同時加入供 coding agent 預查套件是否符合政策的 API 能力。

我會把這項功能接在兩個位置：Agent 選套件時提供回饋，PR 合併時執行獨立檢查。例外批准則留給指定審核者。本文依公開文件分析，未在企業帳號實測；以下工作流是導入建議，查核截至 2026 年 10 月 17 日。

## 預查能減少白做，不能替最後的依賴樹簽名

設想 Agent 正在兩個 CSV 套件之間選擇。若第一個不符合公司政策，選擇階段就收到結果，可以少做一輪安裝、改碼與重寫測試。這是預查最直接的價值。

但當時檢查的候選清單，不一定等於最後提交的依賴。安裝後可能解析出其他版本，也可能帶入間接依賴。Agent 後來再換一個套件，原本那次結果就更不能代表新內容。

GitHub 的[概念文件](https://docs.github.com/en/enterprise-cloud@latest/code-security/concepts/supply-chain-security/open-source-license-compliance)說明，PR 檢查比較 base 與 PR 分支的依賴變更，並使用 dependency graph 偵測到的直接及間接依賴資料。這提供了比「Agent 說自己查過」更適合放在合併入口的依據。

我的建議是讓 PR 保存兩種紀錄：

- 選型紀錄：為什麼需要這個套件、考慮過哪些替代方案、預查的是哪個套件版本。
- 合併檢查：對哪個 PR head 執行、當時採用什麼有效政策、有哪些偵測結果或缺項。

預查結果可以協助決策；合併依據必須對得上最後提交。兩者分開，才不會拿早上的候選清單替下午的新鎖檔背書。

## 例外是另一筆決策，不是修復步驟

遇到不符合政策的套件，工程師可以移除它、換一個套件，或提出例外申請。這三條路的責任不同。

更換套件仍在功能實作範圍內；允許例外則會改變團隊願意接受的條件。若把兩種權限都交給負責交付功能的 Agent，它就同時掌握了答題與改評分標準的能力。

[設定指南](https://docs.github.com/en/enterprise-cloud@latest/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/configure-license-policies)提供專門的 Enterprise Open-Source License Manager 角色。審核者批准時，可選套件、授權或套件模式，以及 repository 或 enterprise 範圍。這些範圍不該被一律當成「解除這個 PR 的錯誤」。

例如一個內部工具確有例外需求，團隊仍要回答：批准只適用這個 repository，還是所有企業專案？下一版套件是否沿用？誰負責重新檢視？這些是本文建議補在申請單的問題，不是已確認由產品強制要求的欄位。

**停止規則：為了讓功能 PR 通過而需要改政策時，實作流程停在申請例外，交由政策審核者決定。**

Agent 可以整理用途、替代方案與影響範圍，但不應自行批准自己提出的例外。

## Evaluate 模式也要放進真實分支規則裡測

導入時常會先選觀察模式，想看看哪些 PR 被標記，再決定何時正式阻擋。這是合理的試行方法，但不能只看一個設定名稱。

GitHub 概念文件指出，Evaluate 模式本身會產生 annotation、不因這項 ruleset 阻擋合併；若分支保護另外要求合併前解決評論，這些 annotation 仍受該保護條件影響。

所以「我們只開 Evaluate，不會影響開發」需要實際驗證。檢查運作在整組規則之中，其他保護條件可能改變最後的結果。

我會用測試 repository 保留一個明確不符合試行政策的依賴變更，觀察：

- Evaluate 下出現哪些提示，合併介面最後是否允許繼續。
- Active 下是否確實阻擋；移除該依賴後，阻擋是否解除。
- 核准 repository 範圍例外後，另一個未獲批准的 repository 是否仍維持原政策。

這些是建議驗收案例，本文未執行。測試紀錄要包含 ruleset、分支保護與實際結果，才能分清是哪一條規則在作用。

## 綠燈要能說明檢查範圍，未知不能悄悄變成允許

沒有 Enterprise Cloud 授權的團隊，可能已使用 [dependency-review-action](https://github.com/actions/dependency-review-action) 檢查 PR。它與新的企業政策功能不能直接視為同一套機制。

該 Action 的 README 明確寫出：無法偵測依賴授權時會通知，但不會讓 Action 失敗。這項限制屬於該 Action，不能據此推定新的企業合規功能也採相同行為。

對團隊自己的驗收而言，仍值得增加一個「授權資料無法辨識」的測試案例，確認實際工具如何呈現。若最後只保留一個綠燈，接手者看不出它代表所有依賴都已判定，還是有資料缺項但工作流照樣完成。

本文建議把缺項交給明確的人工處理路徑，並記下工具與政策範圍。這不表示未知套件必然違規；它表示目前證據不足以代替那次判斷。

同樣地，符合允許清單也不是完整法律結論。GitHub 設定指南提醒，介面的風險分類僅供參考，政策應與組織的法務人員確認。本文討論如何實作審核流程，不判定特定授權在個別商業用途下的法律效果。

## 先讓一個被擋住的 PR 有可走通的出口

本站先前的 [GitHub Actions 鎖檔文章](/blog/github-actions-lockfile-review-boundary/)處理「審過的版本與實際執行版本是否一致」。這篇再往另一個方向追問：團隊是否願意接受這份依賴，以及誰可以改變答案。

落地時不必立刻接滿所有 API。公告已說明可預查套件，但查核時所連結的 API 目錄沒有列出足以核對請求格式的完整端點，因此本文不提供猜測的呼叫範例。

第一步可以只選一個 repository，完成一次被阻擋的依賴 PR：讓實作者提出替代方案或例外理由，由指定審核者處理，再確認合併檢查對準最後的提交。

等這條路確實走得通，再把預查接進 Agent 的選型工具。這樣新增的自動化會減少往返，而不會順手把批准政策的權力也交出去。
