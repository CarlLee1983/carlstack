---
title: "模型變強後，Harness 該先刪什麼：保留外部狀態與可驗收證據"
description: "把模型升級當成一次 Harness 消融測試：刪除只補模型弱點的固定流程，保留外部狀態、權限與獨立驗收，並用四組對照量出真正收益。"
publishDate: 2026-09-07T11:39:17+08:00
updatedDate: 2026-09-07T22:00:32+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
  - 軟體品質
cover: ../../assets/covers/harness-pruning-after-model-upgrade.png
coverAlt: "中央 AI 核心前的金色閘門移除纏繞的檢查清單與迴路，右側只保留事件帳本、權限保管庫與綠色驗證信標。"
series: AI Agent 工程化與工作流實戰
seriesOrder: 11
---

模型能力升級時，最容易做錯兩件事：把既有 Harness 原封不動地帶到新模型，或反過來以為 Harness 已經沒有必要。兩者都把不同責任混成一團。

[@teach_fireworks 的原始 X Article](https://x.com/teach_fireworks/status/2096235572331520200)提出一個更有用的檢查：以前為了讓模型不漏步驟而加上的規劃、角色接力、摘要與重複複核，現在是否仍改善結果？這不是要刪掉保護，而是要分清楚哪些步驟只是在補舊模型的能力缺口，哪些仍在處理模型無法從 context 推理出的外部事實。

我的立場是：**每次換模型，都應把 Harness 視為可被推翻的假說；但外部狀態、權限與驗收不能靠模型變強來省略。**

## 先把「被取代」拆成三種情況

OpenAI 表示，GPT-6 Astra 在 Codex 可跨 context window 保存筆記，並搜尋先前未被寫入筆記的訊息與工具輸出；這會直接降低「定期摘要、下一輪再塞回 prompt」的必要性。[GPT-6 Astra 發布說明](https://openai.com/index/gpt-6-astra/)同時也提醒，這是平台提供的歷史保存與檢索能力，不是對業務真實狀態的保證。

因此，看到某一層功能「被模型吃掉」時，先判斷它屬於哪一類：

| 情況     | 代表什麼                                      | 應做的事                                   |
| -------- | --------------------------------------------- | ------------------------------------------ |
| 能力消失 | 新模型已能連續完成原先需強制拆解的推理        | 移除固定角色接力、無證據的反思與格式化摘要 |
| 實作遷移 | 通用 session、歷史檢索或 sandbox 改由平台管理 | 刪除重複實作，保留平台之外的資料與操作契約 |
| 責任保留 | 系統仍必須知道外部世界是否真的發生了某件事    | 維持狀態查詢、權限 gate、驗收與復原設計    |

第一類是刪減機會；第二類是買或整合的決策；第三類則不能用「模型更會思考」來跳過。

## 優先刪除沒有新增證據的步驟

固定式多 Agent 編排常把同一份材料交給 planner、implementer、reviewer，再要求最後一個角色總結。模型較弱時，這能降低漏步驟的機率；模型能讀懂呼叫鏈、修改實作並補上測試後，它也可能只增加交接損失：原始錯誤被濃縮成「提升健壯性」，真正的邊界條件反而消失。

這不等於所有平行工作都該取消。平行的收益必須來自獨立的工作與證據，例如把互不相依的模組交給不同工作者，或讓相容性檢查和效能測試各自讀取不同資料。若只是為同一段推理換三個身分，先假設它沒有收益，直到量測證明相反。

OpenAI 的模型指引也點出這個轉折：Astra 對 `AGENTS.md` 與 skill 指令更敏感，含糊或互相衝突的規則可能讓工作提早停止；小任務也可能因過度測試而變慢。[Model guidance](https://developers.openai.com/api/docs/guides/latest-model) 所以「每次都完整規劃、全面檢查、再反思三遍」不該再被當成保險。規則更容易被遵守後，規則本身的成本與品質會直接放大。

保留專案特有的限制：哪些模組不得直接相依、何種寫入需要核准、改動什麼範圍必須跑哪些檢查。把「請仔細思考」這類沒有可觀測結果的指令，放進第一批刪減實驗。

## 記憶能被平台接管，真相不能

平台的歷史搜尋解決的是「模型能否再找到曾經看過的內容」；它不解決「找到的內容現在是否仍然成立」。一份舊設計文件與今天的 production 設定衝突時，模型無法只靠長 context 判斷哪一份是權威；客戶資料能否被取回，也仍由存取權限決定。

Anthropic 將 session、harness 與 sandbox 分離：session 是可持久讀回的事件日誌，harness 負責組裝 context 與路由工具，sandbox 則是執行環境。這樣做的重點不是一定要自建三個服務，而是讓 session 或容器故障時，事件與權限邊界不會一起消失。[Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents)

對多數團隊，最小且仍有價值的記憶層是：

```yaml
record:
  source: 可回查的原始文件、操作回應或測試輸出
  freshness: 最後驗證時間與失效條件
  authority: 衝突時哪個系統為準
  access: 哪個使用者或任務可讀
  status: 已確認、待確認或僅為暫時假設
```

它不需要先做一套「萬用 Agent memory」產品。只要資料能被追溯、辨認新舊、按權限取用，就已經保留了平台通用搜尋無法替你決定的部分。需要補完整的 context、state 與 memory 邊界時，可接續閱讀[可靠 Agent 的七個 Harness 控制面](/blog/harness-engineering-for-reliable-agents/)。

## 超時後的真實狀態，不能由推理補回

假設 Agent 呼叫 API 建立文件，伺服器實際上已成功寫入，但回應在傳回途中逾時。重送可能產生兩份文件；直接宣告成功則可能掩蓋請求根本未抵達伺服器的情況。context 再長也無法從 timeout 推導出服務端事實。

這是 Harness 最不該刪的責任。每個有副作用的操作至少應有下列其中一個依據：

- 同一個業務動作重試時使用相同 idempotency key；
- 可依 operation ID 或資源條件讀回權威狀態；
- 兩者皆無時，明確標為 `unknown` 並停止盲目重試。

同樣的邊界也適用於進程中斷、兩個 Agent 修改同一筆資料、外部寫入已完成但本地尚未紀錄，以及預算耗盡。模型記得「剛才看過什麼」，不等於系統知道「外部世界剛才發生了什麼」。

權限也屬於這一層。Anthropic 的 managed-agent 設計特意讓 sandbox 觸及不到憑證，改由資源綁定的權限或 sandbox 外的 vault 代理工具呼叫；這是結構性隔離，不能用 prompt 取代。[Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents) 同理，預算、最長執行時間與取消機制都必須由程式強制，而不只是請模型自律。

## 把文本複核換成獨立驗收

讓模型重看自己的答案三次，有時會抓到漏項，但沒有新增證據時，也可能只讓答案更像「已檢查」。更高價值的 review 是讓驗收依據獨立於執行者的敘述：

| 變更          | 完成證據                                 |
| ------------- | ---------------------------------------- |
| 修正 API 驗證 | 能重現原錯誤的測試，且新增斷言拒絕壞輸入 |
| 資料遷移      | 記錄數、業務不變量與可回復方式           |
| 生成網頁      | 實際操作、渲染檢查與目標 viewport 截圖   |
| 寫入外部系統  | 讀回目標物件，確認識別碼與預期欄位       |

OpenAI 對 agent-first repository 的經驗也把人放在優先級、驗收條件與結果驗證的位置；能做到端到端交付，是因為 testing、validation、review、recovery 被寫進 repository 與工具，不是因為 Agent 自我宣告完成。[Harness engineering](https://openai.com/index/harness-engineering/)

驗收不必一律昂貴。一個文字修正不需要自動跑完整端對端測試；涉及付款或權限的變更則不能只做語法檢查。Harness 應依改動範圍與風險選擇驗證器，通過後停止；沒有新改動或新證據，就不要再安排同一類 review。

## 用四組對照決定能刪多少

目前沒有公開資料能回答「新模型能取代百分之多少 Harness」。最小做法不是辯論，而是用同一批任務做消融測試：

| 模型   | Harness  | 用途                               |
| ------ | -------- | ---------------------------------- |
| 舊模型 | 舊流程   | 基線                               |
| 舊模型 | 精簡流程 | 看流程本身是否只是負擔             |
| 新模型 | 舊流程   | 分離模型升級的收益                 |
| 新模型 | 精簡流程 | 檢查刪減後是否仍維持或提高交付品質 |

每組都固定工具、預算、任務與驗收條件，至少記錄最終驗收通過率、人工接手時間、有效任務總成本，以及最慢任務卡住的位置。測試集要刻意留下不順利情況：超時、相互矛盾的資料、需求中途變更、部分工具結果，以及外部寫入後中斷。

> [!WARNING]
> 權限、production 保護與不可逆寫入不能直接拿真實業務做刪減實驗。先在隔離環境驗證，保護機制的失敗成本不能被「少跑幾輪」的效率收益抵銷。

從自己最捨不得刪的那層開始：它當初對應的失敗現在還能重現嗎？去掉後，新模型究竟在哪一個驗收點變差？若答案只能是「流程看起來比較完整」，它就值得先被關掉測試。模型升級後，最好的 Harness 不是變得更厚，而是每一層都能說明自己守住了哪一個外部事實。

## 來源

- [使用者提供的原始 X Article：GPT-6 Astra 之後，哪些 Harness 還值得做？](https://x.com/teach_fireworks/status/2096235572331520200)
- [SONIA：GPT-6 Astra、Codex 與模型路由原始貼文](https://x.com/S0N_IA/status/2096673944548065591)
- [OpenAI：GPT-6 Astra](https://openai.com/index/gpt-6-astra/)
- [OpenAI：Model guidance](https://developers.openai.com/api/docs/guides/latest-model)
- [OpenAI：Harness engineering](https://openai.com/index/harness-engineering/)
- [Anthropic：Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents)
