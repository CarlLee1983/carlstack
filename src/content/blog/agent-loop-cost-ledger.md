---
title: "Coding Agent 的成本要逐輪記帳：先縮減重複上下文，再決定模型升級"
description: "Google Cloud Tech 用六個回合示範 coding agent 的成本來源；本文區分示意試算與實測，整理可逐輪驗證的快取、工具輸出與模型路由方法。"
publishDate: 2026-09-23T09:22:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
cover: ../../assets/covers/agent-loop-cost-ledger.png
coverAlt: "珊瑚紅紙帶穿過裁切、壓縮與快取裝置，最後成為少量紙片與一枚銅幣，象徵逐輪控制 Agent 成本。"
series: AI Agent 工程化與工作流實戰
seriesOrder: 22
---

Coding agent 跑完一個 Pull Request，帳單上看到的是總額；真正能修改的，卻是每輪讀入多少上下文、回傳多少工具輸出，以及何時呼叫較貴的模型。只盯每百萬 token 的單價，很容易漏掉同一份內容在多輪對話中反覆計費。

[Google Cloud Tech 於 2026 年 9 月 22 日發布的〈Loop Engineering for Sub-Dime Agents〉](https://x.com/GoogleCloudTech/status/2102176810029183478)以 ORM regression 的六個回合做示意：工具 schema、讀檔、測試錯誤、prompt 快取、格式修正與 PR diff。貼文把未治理流程算成 81,000 個累計 token、1.530 美元；優化後算成 12,050 個累計 token、0.042 美元。**這是依文中假設價格組成的情境試算，不是跨模型、跨專案可保證的實測節省率。**

## 把每一輪拆成可歸因的帳

先記錄每輪輸入、輸出與快取 token，再依當次實際模型價格計算：

```text
單輪模型費用 = 未快取輸入 token × 輸入單價
             + 命中快取輸入 token × 快取單價
             + 輸出 token × 輸出單價
任務總成本 = 各輪模型費用 + 工具與基礎設施費用
```

Google Cloud 的[快取文件](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/context-cache/context-cache-overview)說明，回應 metadata 的 `cachedContentTokenCount` 可以觀察命中數；目前該服務的 implicit caching 對命中 token 提供 90% 折扣，explicit caching 另有儲存成本。這與原文試算採用的「75% prompt cache discount」是不同假設；重算自己的任務時，必須使用當前供應商、模型與快取方式的價格，不能把兩者混用。

記帳還要附任務版本、驗收是否通過、人工返工時間與端到端延遲。否則把一個必要的檢查刪掉，帳面上會更便宜，交付成本卻可能更高。

## 先處理每輪重複支付的上下文

原文最有用的提醒是：成本累積不只發生在模型回答，還發生在每次重新送出的工具描述與觀測結果。[Google Cloud 的 Python 參考實作](https://github.com/GoogleCloudPlatform/devrel-demos/tree/main/agents/coding-harness-opt)展示了三個可分開測的邊界：

### 穩定前綴與快取

把不變的指令與 repository 約定放在前段，將本輪請求和工具結果放在後段；不要在前綴插入時間戳、計數器或 commit hash。兩輪相同任務先比較快取 metadata，確認第二輪真的命中，再計算折扣。參考實作的 `CacheInvariantPromptBuilder` 只組裝 `cached_prefix` 與動態 turns；能否命中仍由實際 API 呼叫驗證，不是類別名稱的保證。

### 語法骨架與定點讀取

初次定位檔案時先讀 class、函式簽名和型別；需要修改時再讀目標行。參考實作的 `ASTAwareFileReader` 用 Python `ast` 產生骨架，也提供行範圍讀取。這適合導覽，不能拿刪去函式 body 的版本當作正確性審查依據；錯誤可能正藏在被省掉的實作裡。

### 延後工具 schema，投影工具結果

多個 MCP server 若在第一輪全部展開 schema，未使用的工具也會佔據上下文。參考實作的 `DynamicMCPRegistry` 將流程拆成 `search_tools`、`describe_tools`、`execute_tool`，並允許只回傳指定欄位。應量測的是「發現與描述工具」的額外呼叫加起來，是否仍少於原本的 schema 與回應成本；欄位投影也要保留錯誤碼、資源 ID 與後續驗收所需的證據。

## 便宜模型先跑，升級條件要對上程式碼

原文建議把例行編輯、測試和機械性 diff 交給 workhorse model，架構拆解或反覆失敗才升到 frontier model。這是路由策略，不是「低價模型總能完成」的承諾。至少要固定同一批任務與 gate，比較通過率、返工、延遲和總費用；高風險變更仍需獨立驗收。

這裡有一個具體的版本差異：X 長文將同一檔案的 gate 連續失敗超過 3 次列為升級條件；[參考程式 `GovernedTierRouter`](https://github.com/GoogleCloudPlatform/devrel-demos/blob/main/agents/coding-harness-opt/harness_opt.py)則在失敗達 2 次時升級，並在花費達預算 85% 或升級次數用盡時強制回到 workhorse。若將程式碼直接搬進自己的流程，兩個閾值都要依任務風險重訂；預算將盡時不能靠降級掩蓋尚未通過的驗收，應停止並明確回報未完成狀態。

同樣地，範例的 `reverse_compact` 會把較舊工具輸出縮成首行加上 `status: completed`。這只能當內容壓縮示例；若原始輸出是 timeout、部分成功或等待批准，不能一律寫成 completed。先保存可回查的原始事件與結果狀態，再決定哪些文字可從模型上下文移走。

## 從一個 Pull Request 建立成本基線

挑一個有固定測試、能重跑的日常修補任務，逐輪記錄模型、輸入／輸出／快取 token、工具輸出大小、gate 結果與總耗時。下一次只改一個邊界，例如先把測試輸出縮成 assertion 與相關 stack frame；重跑同一任務，確認通過率與錯誤定位能力沒有下降，再比較總費用。若結果不穩定，就增加任務樣本，不用一張示意表替自己的系統背書。

想釐清 Harness 的責任邊界，可接著讀[可靠 Agent 的七個 Harness 控制面](/blog/harness-engineering-for-reliable-agents/)；若要評估升級模型後哪些步驟可刪，則看[Harness 消融測試](/blog/harness-pruning-after-model-upgrade/)。今天先留下第一份逐輪成本與驗收紀錄，下一個優化才有可以對照的基線。

## 來源

- [Google Cloud Tech：Loop Engineering for Sub-Dime Agents（原始 X 長文）](https://x.com/GoogleCloudTech/status/2102176810029183478)
- [GoogleCloudPlatform：coding-harness-opt 參考實作與測試](https://github.com/GoogleCloudPlatform/devrel-demos/tree/main/agents/coding-harness-opt)
- [Google Cloud：Context caching overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/context-cache/context-cache-overview)
