---
title: "Prime Agent 改寫 Rust：先固定驗收行為，再擴大 Agent 平行度"
description: "Prime Agent 公開 Rust 重寫與差異測試流程。本文把啟動效能、行為一致性與執行權限拆開驗收，提供可執行的合成契約檢查，避免用 Agent 數量或啟動倍數代替重寫品質。"
publishDate: 2026-10-10T10:00:11+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 開源專案
  - 技術選型
series: AI Agent 工程化與工作流實戰
seriesOrder: 78
cover: ../../assets/covers/prime-agent-rust-rewrite-verification-contract.webp
coverAlt: "兩台內部結構不同的織機織出相同的藍黃圖樣，一把金屬檢驗梳跨過兩條織帶，象徵重寫後逐項核對可觀測行為。"
repositoryUrl: https://github.com/PrimeIntellect-ai/prime-agent
---

把同一個終端工具從 TypeScript 搬到 Rust，最難交接的往往是那些沒有寫進規格的行為：取消後是否還會呼叫工具、恢復 session 是否重送請求，以及看起來相同的畫面背後，模型究竟收到了什麼。

Prime Intellect 在 [2026 年 10 月 9 日的工程文章](https://www.primeintellect.ai/blog/prime-agent-rust)自述，透過超過 2,000 個 Agent 完成 Prime Agent 的 Rust 重寫。團隊把規劃、實作、審查、驗證分給不同角色，並比較終端畫面、模型請求與 daemon 協定；Windows 支援仍標示 beta。這份案例值得借用的是驗收設計，Agent 數量本身無法證明改寫正確。

同篇公開比較中的冷啟動可輸入時間約快 13 倍，量測使用 scripted model，排除了模型推論；這不能換算成解題速度。作者也提醒跨工具比較沒有共同 benchmark 標準。本文沒有安裝或重跑 Prime Agent benchmark，只執行下方自訂的合成契約檢查；產品數字仍屬廠商報告。

## 每個重寫任務都需要一份可拒收的輸出

我的建議是讓工作單先附上舊實作的觀測紀錄，再交給實作者。最小單位可以是「取消一個尚未執行的工具請求」，而非「重寫整個工具模組」。紀錄至少包含輸入事件、送往模型的內容、協定回覆，以及對外部狀態的改動。

以下是本文設計的交付清單，並非 Prime Agent 的 API 或內部規格：

- 規劃者指定起始狀態、輸入順序、預期結果與允許改變的欄位。舊版如果有已知錯誤，應另列預期修正，不能把 bug 一併凍結成標準。
- 實作者交付 commit 與重現命令，不自行核准新增的差異豁免。
- 審查者查漏掉的路徑，尤其是取消、重試、逾時與重啟之後的副作用。
- 驗證者從同一份不可變 fixture 執行新舊版本，把結果與產生它的 commit 一起保存。

角色分開仍可能共用錯誤假設。兩個 Agent 都相信錯的 fixture，不會因為模型不同就得到正確答案。因此，驗證清單要有來源：使用者契約、既有協定或已確認的 bug。這也延續了[程式碼審查驗收條件](/blog/reviewbench-ai-code-review-acceptance-gates/)的取捨：審查意見要能指向可重現的失敗。

## 畫面相同時，請求與副作用仍可能不同

若只做 TUI screenshot diff，候選版本可能畫出一樣的結果，卻多送一次模型請求，或在使用者拒絕之後仍寫入檔案。反過來，游標閃爍或耗時欄位不同，也不一定是功能回歸。比較之前必須定義哪些差異可忽略，而且範圍要窄。

下面是一段可直接以 Python 3 執行的教學範例。它只比較合成紀錄，假設紀錄已由可信的測試 harness 收集；它不會攔截真實工具，也不提供作業系統隔離。範例只容許 request 的頂層 `request_id` 改變，保留 model、messages、tools 與 tool_choice 等其餘欄位；對工具寫入則採完全相等比較。

```python
from copy import deepcopy


def same_behavior(old, new):
    def stable_request(request):
        return {k: v for k, v in request.items() if k != "request_id"}

    return (
        stable_request(old["request"]) == stable_request(new["request"])
        and old["writes"] == new["writes"]
        and old["approval"] == new["approval"]
    )


baseline = {
    "request": {
        "request_id": "old-1",
        "model": "fixture-model",
        "messages": [{"role": "user", "content": "inspect only"}],
        "tools": [{"name": "read_file"}],
        "tool_choice": "auto",
    },
    "writes": [],
    "approval": "denied",
}

same = deepcopy(baseline)
same["request"]["request_id"] = "new-1"
assert same_behavior(baseline, same)

changed_model = deepcopy(same)
changed_model["request"]["model"] = "other-model"
assert not same_behavior(baseline, changed_model)

extra_tool = deepcopy(same)
extra_tool["request"]["tools"].append({"name": "write_file"})
assert not same_behavior(baseline, extra_tool)

unexpected_write = deepcopy(same)
unexpected_write["writes"] = ["config.json"]
assert not same_behavior(baseline, unexpected_write)

changed_approval = deepcopy(same)
changed_approval["approval"] = "granted"
assert not same_behavior(baseline, changed_approval)
print("5 synthetic parity checks passed")
```

本次執行結果是 5 個 assertion 全數通過：一個可接受的 ID 差異，以及四個應拒收的變動。這只證明比較函式能識別這些 fixture，沒有證明任何產品通過驗收。缺欄位會直接出錯；若要接進 CI，還需把缺失紀錄列成明確的拒收原因。

下一層測試應涵蓋多次 request 的順序與次數、完整工具參數、重試後副作用、串流中斷、session 重播與協定版本不一致。模型輸出本身有變動時，先用 scripted response 固定 harness 行為，再另做真實模型任務評估。兩組結果要分開報告，否則模型變化容易掩蓋改寫造成的回歸。

## 行程隔離要另外核對權限

官方案例描述每個 session 有獨立 worker process，以縮小崩潰影響。工程驗收時，還要查它拿到了哪些檔案、網路與憑證權限。行程是否各自存在，無法單獨回答能否讀取同一個秘密檔案。

Rust 的 [`Send` 與 `Sync`](https://doc.rust-lang.org/nomicon/send-and-sync.html)處理跨執行緒移動與共享的型別安全；這些保證不等於工具呼叫已取得使用者授權。對會執行 shell、修改 repository 或呼叫外部 API 的 Agent，我會把下列條件獨立列入測試規格：

- 明確拒絕後，外部寫入次數必須為零。
- 重啟後不能沿用已失效的核准；執行前重新核對核准範圍與目標版本。
- 測試環境只提供測試資料與最小權限，不放正式憑證。
- 驗證者與實作者不得藉由共享可寫 fixture 讓測試悄悄跟著程式改變。

這裡的權限檢查是本文提出的採用條件，不是指稱 Prime Agent 已存在某個漏洞。需要進一步拆分工具執行邊界時，可接著看[本機 AI Agent 的執行邊界](/blog/local-ai-agent-execution-boundaries/)。

## 平行度的上限應由驗收佇列決定

一次送出一百個任務，卻只有一條慢速整合測試，會把瓶頸搬到最後。每個任務還可能重複編譯、使用模型並等待審查。若不計入失敗分支，報表很容易只呈現成功產出的速度。

評估自己的重寫流程時，可以按「通過驗收且合併的功能切片」記錄模型費用、運算時間、人工覆核時間與回退次數。分母使用驗收完成的切片，分子包含被丟棄的嘗試；這和[以完成任務計算子 Agent 成本](/blog/haiku55-subagent-accepted-task-cost/)使用相同的核算邊界。

**停止規則：候選版本若增加未核准副作用，或出現無法解釋的模型請求差異，就停止合併與效能最佳化。** 效能數字變好不能抵銷這兩種失敗。反之，若候選更慢但行為已驗證，團隊可以明確決定是否接受相容性進度，另開效能工作單。

下一步可以只選一條「拒絕工具 → 中斷 → 恢復 session」的流程，保存舊版紀錄，讓新版跑相同 fixture。當失敗能被穩定重現、責任能被定位，再增加第二條流程與平行任務。這比先決定要動用多少 Agent，更容易估出重寫的實際風險。
