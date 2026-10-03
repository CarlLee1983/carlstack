---
title: "在 Cursor 導入 pstack，第一關是可重跑的修復"
description: "以 pstack 官方 Cursor plugin 0.15.6 原始檔為主，整理安裝、模型設定、新對話啟用、專案驗證技能，以及第一個本機 bug-fix 的驗收清單。從能載入技能，走到可重跑的修復證據。"
publishDate: 2026-10-03T20:18:16+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
  - 開源專案
cover: ../../assets/covers/pstack-first-verifiable-workflow.webp
coverAlt: "鈷藍色工作桌上，左側工具盒放著三個可替換頭，中央測試治具壓住小型樣本，右側留下帶勾痕的成品，表達從安裝工具走到驗證單一成果。"
repositoryUrl: https://github.com/cursor/plugins/tree/main/pstack
series: AI Agent 工程化與工作流實戰
seriesOrder: 57
---

pstack 的第一個導入成果，可以很小：修好一個能穩定重現的 bug，交出另一個人照著做也看得到的前後差異。這比裝完一批技能、讓 Agent 宣告準備好了，更能判斷這套工作流是否適合你的專案。

Lauren Tan（poteto）維護的 [pstack](https://github.com/cursor/plugins/tree/main/pstack) 把程式調查、設計、實作、review 與執行期驗證組成一套技能工作流。它的預設入口 `/poteto-mode` 會依任務選擇 playbook，再於需要時載入其他技能。讀者不必背完技能目錄，但需要知道它會用什麼模型、能操作什麼工具，以及這次允許做到哪裡。

這篇以 Cursor 官方 plugin 為主，把導入拆成安裝與模型設定、專案環境檢查、第一個小任務。前兩篇 CarlStack 已分別談過[可驗收的程式庫](/blog/agent-work-requires-verifiable-codebase/)與[用原型、型別草圖規劃](/blog/plan-with-code-prototype-over-plan-mode/)，這裡不再重述訪談，也不以 PR 產量推估效益。

> [!NOTE]
> 本文是截至 2026-10-03 的原始檔研究與採用建議，沒有安裝或實跑 pstack，也沒有測量成功率。本文主要引用 Cursor upstream `23e4138`，其 manifest 為 0.15.6；這是查核的原始檔版本，不表示安裝命令會鎖定同一份快照。

## 在 Cursor 安裝後，模型規則要由新對話載入

先在 Cursor 打開要工作的 repository。以下入口來自 [pstack 官方 README](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/README.md)，都在 Agent 對話中使用，不能拿去當 shell 指令執行。

### 安裝 plugin，再設定實際可用的模型

安裝入口是：

```text
/add-plugin pstack
```

安裝完成後執行：

```text
/setup-pstack
```

官方[設定技能](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/skills/setup-pstack/SKILL.md)會檢查可用模型，讓你選擇 reasoning budget 與各角色的模型配置，確認後寫入使用者層的 `~/.cursor/rules/pstack-models.mdc`。

這裡的 reasoning budget 是推理強度配置，並非硬性的金額上限；費用限制仍要由所用服務另行管理。第一輪應檢查角色映射與 panel 大小，而非照抄文章裡的模型名稱。來源中的預設模型會變，可用模型也受當前 Cursor 環境影響。

### 開新對話，帶著有範圍的任務啟用

設定完成後開新對話，讓新 session 載入模型規則，再以 `/poteto-mode` 加上任務開始工作。設定技能明確把新 chat 列為啟用步驟；停在原對話裡看見設定檔存在，還不能當成新模型配置已生效。

第一輪可以請 Agent 列出它載入的設定、技能來源，以及為這個任務選擇的 playbook。採用紀錄也應留下實際取得的 plugin 版本；`/add-plugin pstack` 這條官方入口本身沒有鎖定本文 commit。

`poteto-mode` 的[官方說明](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/README.md#just-use-poteto-mode)稱它為 sticky mode：啟用後會跨回合持續適用，需要時載入流程，也可明確要求退出。每次換工作範圍，仍應重新說明這次的修改與交付權限。

> [!NOTE]
> [backnotprop/pstack](https://github.com/backnotprop/pstack/blob/157aae39a733135e93d8b5b19ff62c6a84b0ad56/README.md) 是為其他 harness 做過改寫的獨立 mirror，查核 manifest 為 0.15.2，與本文官方 0.15.6 快照不同。本文只走 Cursor plugin 路線，不混用 mirror 的安裝指令或非 Cursor 設定路徑。

## pstack 的結構決定你要檢查哪一層

pstack 常被簡稱成一個 skill，但從[官方目錄與入口說明](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/README.md#usage)來看，導入時有幾個不同層次。

### 入口與 playbook 負責安排工作

`/poteto-mode` 依任務選擇 bug fix、feature、investigation 等 playbook。playbook 是入口技能載入的參考流程檔，不等於另一個獨立安裝的 skill。第一輪可以請 Agent 說出它選了哪個流程、讀了哪個檔案，檢查任務是否被誤判。

例如「查明為什麼取消後還有事件」與「修好取消行為」的修改權限不同。前者適合只讀調查；後者才包含實作與回歸驗證。若一開始就選錯流程，後面再完整的 checklist 也可能做錯事。

### 專項技能提供調查、設計與交叉檢查

`/how` 追程式如何運作，`/why` 追設計背景；跨函式邊界的設計可交給 `/architect`。`/arena` 比較平行方案，`/swarm` 拆分工作，`/interrogate` 從不同模型角度檢查 diff。這些職責來自官方 README，實際使用哪些仍取決於所選流程與 harness 能力。

多模型配置增加的是檢查角度，也會增加呼叫量。第一個任務沒有必要為了展示功能就開最大 panel。若設定中有當前 harness 不認識的模型名稱，應先修正映射或回報缺口，不能把預設字串當成模型已成功使用的證據。

### 專案驗證技能補上實際操作入口

pstack 帶有建立與維護驗證技能的流程，但應用程式怎麼啟動、登入、操作與清理，仍要從你的 repository 找答案。官方 README 明列，`control-cli` 與 `control-ui` 在另一個 `cursor-team-kit` plugin，沒有隨 pstack 一起出貨。

因此導入前的環境檢查可以很具體：

- Agent 能否讀取目標程式庫，並執行它原本的測試命令？
- 若任務涉及 UI、CLI 或服務，有沒有真實可用的操作入口與就緒判斷？
- 測試帳號、資料與實例能否隔離，避免操作到別人的工作或正式資料？
- 畫面、trace、log 或輸出檔案放在哪裡，清理後還能不能讀到？
- 需要的子代理與模型分工是否受支援，失敗時是否會明確回報？

這些是本文建議的採用檢查。**停止規則：缺少任務所需的操作或觀測能力時，先交出缺口清單，不把技能安裝完成寫成環境驗收通過。**

## 第一個任務要小到能比較修復前後

第一個任務適合選不碰正式資料、不需要部署的本機缺陷。下面以「本機 CLI 取消後仍繼續輸出事件」為假設案例；指令、檔名與證據路徑必須換成專案實際存在的內容。這段是任務模板，並非已執行的實驗：

```text
/poteto-mode
修復本機 CLI 在取消後仍輸出事件的問題。

範圍：只處理取消與事件訂閱生命週期，不重構其他模組。
重現：先從 repo 找到啟動與取消方式，實際重現並記錄輸出。
預期：取消完成後不再收到事件，重新啟動仍能正常接收。
驗證：修復後重跑同一入口，保留前後輸出與相關回歸測試。
權限：只修改本機工作樹；不要 push、開 PR、merge 或部署。
停止：無法重現、缺測試資料或需要擴大範圍時，回報證據與缺口。
交付：原因、最小 diff、執行過的命令、證據位置、尚未驗證的部分。
```

模板刻意把「取消後安靜」與「重新啟動仍有事件」一起列入驗收。只把訂閱永久停掉，也能讓錯誤訊息消失，卻破壞下一次使用。預期行為必須能排除這類假修復。

官方 [bug-fix playbook](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/skills/poteto-mode/playbooks/bug-fix.md)要求從實際重現開始，縮小原因、確認機制，再設計與實作。修復後回到同一操作面重跑，不能只從程式碼看起來合理就結案。

這對使用者的要求是檢查兩份證據能否比較：同一個操作、相同前置條件、明確標記的前後提交。第一次看到錯誤輸出，第二次卻只交一份 unrelated unit test，還不足以證明原問題已修好。

pstack 的 [`tdd`](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/skills/tdd/SKILL.md)把便宜、可本機執行的 bug regression 路徑放在優先位置。若這條路存在，就先讓測試失敗，再修復；不應為了形式上的 test-first，把第一個小任務擴成重建整套昂貴測試環境。採用哪個替代驗證與它留下的缺口，都要寫在交付裡。

## 沒有驗證入口時，先交付能跑的專案技能

若應用程式本身能正常建置、啟動，但缺少 Agent 可重跑的操作與取證流程，可以使用 [`/create-verification-skill`](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/skills/create-verification-skill/SKILL.md)。若 checkout 本身已壞到不能啟動，應先修復或精確回報阻礙，不能對著壞掉的基底生成一份假定能跑的說明。在 Cursor 路線，產物放在專案的 `.cursor/skills/verify-<app>/SKILL.md`，將啟動、環境診斷、操作、取證與清理串起來，並列出 feature map。

導入者可以沿這五個動詞驗收，而不必把技能全文當成可信規格：

1. Launch：啟動指定的應用程式實例，知道何時算 ready
2. Doctor：確認依賴與環境符合這次操作的前提
3. Drive：經由真實入口操作至少一個已列出的功能
4. Evidence：保留能支持結果的畫面、輸出、trace 或狀態
5. Cleanup：清理自己建立的資源，並確認證據仍可讀

原始技能要求生成後實際跑過自己的指令。只有 `SKILL.md` 檔案存在，仍不足以證明這條路能用。第一次一個功能跑通，也只證明那一條路；其餘功能要在交付中清楚列為尚未覆蓋。

之後應用程式改了，再用 [`/maintain-verification-skill`](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/skills/maintain-verification-skill/SKILL.md)核對 feature map 與實際行為。這個流程的修改範圍限於驗證技能自己的目錄；發現產品回歸時應回報，不能順手改產品讓驗證看起來恢復正常。

第一次導入若最後只完成一份跑得通的驗證技能，也有明確價值：下一個修復任務不必重新猜啟動方式。把這份成果與功能修復分開驗收，進度才不會被一個含糊的「完成」遮住。

## 自主工作規則必須配上工具權限

pstack 有很強的作者偏好。以官方 0.15.6 的 [`poteto-mode` Autonomy 段落](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/skills/poteto-mode/SKILL.md)為例，它把 team chat、ticket 更新與啟動 eval 等可回復外部動作納入可主動執行的範圍。這提醒導入者：skill 會影響行為，閱讀它的權限假設和閱讀安裝指令一樣重要。

本文的採用建議是把第一輪限制在本機工作樹，同時在宿主 Agent 的工具、憑證與審批設定上限制外部寫入。提示詞裡的「不要 push」能表達意圖，但不能代替 sandbox、最小權限 token 或 repository 的保護規則。

等本機流程穩定，再逐項開放 PR、合併與部署。官方 [Verify and ship](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/docs/guide/06-verify-and-ship.md)也區分 babysit 與 shipping：前者把工作推進到 merge-ready，後者才處理獨立驗證與落地。本文的第一個任務明確排除這些動作。

pstack 採 [MIT License](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/LICENSE)；若把實質內容複製進團隊的技能套件，應保留授權與版權聲明。授權允許使用與改作，不提供操作安全保證。

另一個容易漏掉的導入成本是技能名稱衝突。若你原本已有 `tdd`、`teach` 或其他同名技能，應檢查當次載入的來源與優先順序。本文不建議為了「集滿技能」把多套同名流程一起打開；一個任務採用哪份規則，要能說得清楚。

## 用一份驗收紀錄決定是否擴大導入

第一輪結束後，請 Agent 交付下列紀錄。這是本文建議的驗收格式，空欄代表待補證據，不能以「看起來正常」代填。

```yaml
adoption_record:
  source_repo: "https://github.com/cursor/plugins/tree/main/pstack"
  source_commit: "填入實際採用的 commit"
  loaded_skill: "填入本次載入的 SKILL.md 路徑"
  selected_playbook: "bug-fix"
  tested_revision: "填入最後被驗證的提交或工作樹識別"
  before_evidence: "填入修復前重現紀錄"
  after_evidence: "填入相同入口的修復後紀錄"
  regression_checks: []
  unverified: []
  cleanup_verified: false
  delivery_scope: "local-only"
```

採用判斷可以直接落在這份紀錄上。來源與載入路徑能對上，代表裝的是預期規則；前後證據能比較，代表原問題有被驗收；缺口與清理狀態有明載，下一個人才能接手。若哪一項還缺，下一步就是補那個缺口。

讓同一套流程在第二個相似任務上重跑一次。它能否少掉重新解釋環境的成本，交付是否仍然可檢查，會比技能數量更有助於決定下一次要開多少並行工作。

### 參考資料與版本

- [Cursor upstream pstack README](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/README.md)、[plugin manifest 0.15.6](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/.cursor-plugin/plugin.json)，查核日 2026-10-03
- [Standalone mirror README](https://github.com/backnotprop/pstack/blob/157aae39a733135e93d8b5b19ff62c6a84b0ad56/README.md)、[plugin manifest 0.15.2](https://github.com/backnotprop/pstack/blob/157aae39a733135e93d8b5b19ff62c6a84b0ad56/.cursor-plugin/plugin.json)，查核日 2026-10-03；這是當時讀取的 manifest 版本，不稱為跨平台最新 release
- [官方 poteto-mode 入口](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/skills/poteto-mode/SKILL.md)、[bug-fix playbook](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/skills/poteto-mode/playbooks/bug-fix.md)
- [建立驗證技能](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/skills/create-verification-skill/SKILL.md)、[維護驗證技能](https://github.com/cursor/plugins/blob/23e4138daa01c42d4969f7a5465f82704e64f798/pstack/skills/maintain-verification-skill/SKILL.md)
