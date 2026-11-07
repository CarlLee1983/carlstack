---
title: "AI 協作如何少犯同樣的錯：保存規則、驗證結果與失敗紀錄"
description: "以收藏功能與 SEO 文案為例，拆開任務範圍、長期規則、決策理由與驗證證據，說明何時該補測試、修正規則或保留人工判斷。"
publishDate: 2026-09-07T18:15:00+08:00
updatedDate: 2026-11-05T23:19:50Z
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
series: AI Agent 工程化與工作流實戰
seriesOrder: 15
cover: ../../assets/covers/ai-workflow-compounding-evidence-loop.png
coverAlt: "黃銅機械織機把任務卡、規則書與驗證紀錄接成一條繞回機器的藍色編織線。"
---

驗收收藏功能時，一句「測試通過」還少了幾件資訊。測的是哪個版本？重送收藏請求有沒有重複計數？未登入的人能不能呼叫 API？下一個 Agent 若只讀到完成摘要，就得重新查一遍。把這些結果連同當時的需求留下來，接手者才有辦法判斷哪些可以沿用。

[方格 Fango 的 AI 複利工作流文章](https://x.com/zhrichard196220/status/2096486309020029034?s=12)是這個題目的來源線索。2026-11-05 查核時無法讀取 X 原文，社群開發與 SEO 案例的原始敘述未能核對。下列保留這兩個題材作為設計示例，討論如何保存與重用工作紀錄，沒有可用來證明減錯幅度或效率提升的實測資料。

## 收藏與排行榜，先決定這次驗收到哪裡

「使用者可以收藏作品，每週有排行榜」已經包含幾個不同決定。收藏是否可取消、重送請求如何計數，可以直接列成行為。排行榜的週界、時區與同分排序，則需要產品負責人確認。讓 Agent 在實作途中補完這些選擇，事後很難分清哪些是需求、哪些只是它的猜測。

交接時可先用一份任務契約記錄已確定的部分。這是縮寫範例，指令是待接入專案的驗證入口，並非已執行的測試結果：

```yaml
goal: 使用者可收藏作品；每週依收藏數產生排行榜
in_scope:
  - 收藏與取消收藏
  - 每週排行榜查詢
out_of_scope:
  - 獎勵發放
  - 搜尋與推薦
constraints:
  - 重複收藏不得重複計數
acceptance:
  - 同一使用者重送收藏請求後，計數仍為 1
  - 未登入請求被後端拒絕
evidence:
  - test: pnpm test
  - review: linked pull request
```

這兩條 acceptance 只涵蓋重送請求與登入限制。取消收藏後如何影響當週計數、每週何時結算、同分如何處理，都還沒有定義。接手者應列出這些缺口，請負責人決定後再補驗收條件。也要確認 `pnpm test` 實際涵蓋了哪些行為，不能拿整包測試的成功訊息代替逐項核對。

產品負責人確認功能範圍與排除項目，開發者確認驗證方式，reviewer 對照差異與結果。這幾個角色可以是同一個人，決定的時間與依據仍要可追溯。

## 任務結束後，四種紀錄各有去處

收藏功能的排除項目，只對這次交付有效。repository 的命名方式可能適用很久。把兩者原封不動貼進每張 issue，後來的人就得自行判斷哪些仍有效。整理時可按用途分開，無須為每一類另建系統。

任務契約留在 issue 或工作單，記錄目標、不做的事與驗收條件。完成之後，它仍是那次交付的依據，不會自動成為下次任務的範圍。[GitHub 的 Issues 文件](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues)列出的用途包括計畫、討論與追蹤工作，也支援相依關係和 PR 連結。這些功能足以承接任務，跨任務規範則可以由 issue 連到 repository 裡的固定位置。

長期規則記錄一般工作方式，例如要先讀哪份規格、如何命名、修改哪個範圍要跑哪項檢查。維護者需要說清適用範圍，移除過期內容，避免同一條規則在幾個地方各自改版。

決策紀錄保存選擇的理由。例如排行榜採用哪個週界、曾排除哪些方案，以及什麼變化出現時需要重看。這能補上 diff 看不到的部分，也讓後來的 Agent 知道哪些問題已有決定、哪些仍可討論。

驗證證據則連回確切版本與實際結果。除了命令，還要留下執行環境、結果連結與未覆蓋的項目。`evidence` 欄位寫著 `pnpm test` 只是計畫，對應版本的執行紀錄才回答了有沒有跑、跑完發生什麼事。

## SEO 文案重複出錯，先找出該改哪一段規則

以工具介紹頁為例，AI 可能把檔案大小與數量限制寫成主賣點，團隊卻希望讀者先看到工具能解決什麼問題。這個分歧適合保存成編輯判斷，並附上修改前後的文案。它還需要適用範圍：介紹頁的開頭可以先講用途，規格、定價或使用限制頁仍要清楚交代參數。

第一次遇到這類問題，先把理由留在該任務的回饋中。若同型錯誤第二次出現，可以啟動一次回顧，檢查既有規則是否沒被找到、文字是否含糊，或兩次任務其實有不同目的。兩次只是便於開始回顧的建議，不是把經驗升為永久規則的硬門檻。

確認跨任務都適用後，再把「何時適用、怎麼處理、如何確認」放到執行時會讀到的位置。SEO 文案可能需要一個短 Skill，重複計數問題則較適合回歸測試。若目前只能靠編輯判斷，就明確保留人工 review，不把一句風格建議寫成自動驗收保證。

[能力採用門檻](/blog/agent-skill-installation-contract/)也採取相近的判斷方式。先找到反覆發生的工作缺口，再決定要增加哪個能力。已有規則只是入口不清楚時，改連結或閱讀順序，通常比再複製一份更容易維護。

## 失敗紀錄要能改變下一次交接

收藏功能被退回時，最有用的紀錄是錯誤發生在哪個交接點，以及下次要改什麼。可以從四種情況查起：

- 範圍偏離：記下漏做或多做的 acceptance，修正任務契約或 `out_of_scope`。
- 規則找不到：指出哪個既有入口沒被讀到，調整閱讀順序與連結。
- 驗證缺口：記下測試後才被 review 發現的錯誤，評估要補回歸測試還是人工檢查項目。
- 人工決策：標出 Agent 無法自行選擇的事項，指定負責人與停下詢問的條件。

例如收藏重送已通過測試，review 卻發現取消後計數錯誤，這次就同時暴露了驗收與測試缺口。把取消行為定義清楚、補上對應測試，再連回失敗版本，下一次才知道這條規則為何存在。若問題是排行榜週界尚未決定，新增測試也無法代替產品選擇。

回顧這些紀錄時，可以比較下一次同類任務是否少了一次重複說明、相同錯誤是否再發生，以及人工檢查花了多少時間。這些觀察用來判斷規則是否有幫助，不以新增文件數量評分。若規則沒被使用，先查原因，再決定縮短、合併或移除。

## 規則寫進檔案後，還要檢查執行環境

`AGENTS.md` 或 Skill 可以提醒 Agent 跑測試、遵守命名、部署前詢問。需要強制執行的限制，還得由測試、branch protection、權限、sandbox 或核准機制承接。這也是[可靠 Agent Harness](/blog/harness-engineering-for-reliable-agents/)區分 context、state、memory 與外部控制的原因。

下列 YAML 用來分類規則，兩條各有自己的項目。`kind` 是紀錄用的標籤，填入 `enforced-control` 不會建立部署限制：

```yaml
rules:
  - rule: 修改付款流程後執行整合測試
    kind: guidance
    verify: pnpm test:payments
  - rule: production 部署需人工核准
    kind: enforced-control
    verify: deployment approval log
```

第一條要確認專案確實有對應測試，並取得本次版本的執行結果。第二條則要查部署設定與核准紀錄。以 GitHub Actions 為例，job 必須引用受保護的 environment，才會受該環境的規則約束。required reviewers 是否可用也與方案、repository 可見性有關，還要檢查管理者繞過設定。[GitHub 環境部署文件](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment)說明了這些條件。

**查不到實際控制設定或本次驗證結果時，保留為待確認。** 把上一輪寫下的意圖轉述成「已符合」，會讓未經驗證的判斷繼續被沿用。

下次處理同類工作時，先找上一張 issue 裡第一個需要人工修正的地方，確認當時補的是需求、規則還是測試。只帶入仍適用的那一項，完成後再記錄它有沒有減少相同問題。這份前後對照，才足以支持是否繼續保留該規則的決定。

## 來源

- [方格 Fango：如何構築你的 AI 複利工作流系統](https://x.com/zhrichard196220/status/2096486309020029034?s=12)（既有來源記錄標示 2026-09-06，日期與原文內容於 2026-11-05 未能核實）
- [GitHub Docs：About issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues)（2026-11-05 查閱）
- [GitHub Docs：Managing environments for deployment](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment)（2026-11-05 查閱）
