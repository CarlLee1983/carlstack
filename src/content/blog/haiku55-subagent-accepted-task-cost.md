---
title: "Haiku 5.5 的 subagent 成本，要算到首次驗收與升級重跑"
description: "Haiku 5.5 帶來低價與可調 effort，但 subagent 是否省錢還取決於首次驗收率、100k 計價門檻與交接負擔。用一個可重算的成本案例，設計含升級、人工覆核與停止條件的窄任務實驗。"
publishDate: 2026-10-08T10:09:27+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 技術選型
series: AI Agent 工程化與工作流實戰
seriesOrder: 71
cover: ../../assets/covers/haiku55-subagent-accepted-task-cost.webp
coverAlt: "淡藍背景上的白陶篩網承接赤陶色大小珠，通過的小珠落入下方碗中，大型不規則珠留在右側陶盤，呈現驗收後分流。"
---

把「從測試日誌找出失敗案例」交給便宜的 subagent，主代理可以繼續讀程式。但如果回報漏了兩個案例，主代理得重新讀整份日誌，再決定要不要重跑。第一個 API 請求確實便宜，交接後的工作卻還沒結束。

Anthropic 在 [2026 年 10 月 7 日的 Haiku 5.5 公告](https://www.anthropic.com/claude-haiku-5-5)中，將 `claude-haiku-5-5` 定位於大量、範圍較窄的工作，並首次為 Haiku 級模型加入可調 effort；複雜 agentic coding 仍建議使用 Sonnet 5.5 或 Opus 5.5。公告的效能與客戶案例屬於供應方資料，本文沒有重跑那些評測。

我的判斷是：Haiku 5.5 適合拿來測試哪些交接能便宜地完成。評估單位要包含子任務第一次交付、拒收後的處理，以及主代理與人的覆核時間。以下價格查核截至 2026 年 10 月 8 日；成本案例與測試設計均為本文提出，尚未執行模型實測。

## 100k 門檻會改變同一個子任務的帳單

[官方模型價格](https://platform.claude.com/docs/en/models/haiku-5-5/overview#pricing)依 prompt 長度分級。以下都是美元／百萬 token，採標準、非 Batch 費率：

- Prompt 不超過 100,000 tokens：輸入 US$0.10、輸出 US$0.50；快取讀取 US$0.01。
- Prompt 超過 100,000 tokens：輸入 US$0.50、輸出 US$2.50；快取讀取 US$0.05。
- 五分鐘快取寫入依兩級分別為 US$0.125／US$0.625；一小時寫入為 US$0.20／US$1。

門檻依整個 prompt 判定；超過後，請求使用高一級費率，不能只替超出的那幾個 token 加價。為了看清差異，假設沒有快取、輸出固定 2,000 tokens，僅計模型 token 費用：

```text
100,000 輸入：100,000 × 0.10 / 1,000,000
             + 2,000 × 0.50 / 1,000,000 = US$0.011

100,001 輸入：100,001 × 0.50 / 1,000,000
             + 2,000 × 2.50 / 1,000,000 = US$0.0550005
```

這是價目表的算術例子，輸出不會因為我們希望固定就自行維持相同長度。它指出一個可檢查的設計問題：只需要一份測試日誌的 worker，是否被附上整段主代理對話與不相關檔案？若有，縮小交接資料可能比多試幾個 prompt 更值得先做；刪掉資訊後仍要重跑完整驗收。

[計價文件](https://platform.claude.com/docs/en/about-claude/pricing#batch-processing)另列 Batch 的輸入／輸出半價，並允許與 prompt caching 計價搭配；Batch 是非同步處理，不能拿來估即時往返的費用。本文試算不含這些折扣，也未加入工具費或區域加價。上線記帳時應依實際 usage 分開算一般輸入、快取寫入與讀取，避免把同一批 token 重複計入。

沿用 Haiku 4.5 的 token 數也會失準。[遷移指南](https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide#recount-tokens)要求使用新模型重新計數：tokenizer 已更換，相同文字的 token 數會增加。接近 100k 的工作尤其應重新估算，不能直接把舊用量乘上新單價。

## 首次驗收率要和最終交付率分開看

在這個實驗裡，**首次驗收通過**指 worker 第一次交付的產物，未經修補、換模型或人工修改，就通過既定檢查。一次交付可以包含多個工具回合；「首次」不是只准呼叫一次 API。

以日誌抽取為例，輸入是一份固定版本的測試輸出，產物是失敗案例 ID、原始錯誤片段與行號。驗收器要確認案例集合完整、片段能對回輸入、沒有把略過的測試當成失敗。JSON 可以解析只解決格式問題，無法證明沒有漏項。

假設 100 個任務中有 80 個第一次通過，另 20 個升級後也完成，報告應同時顯示首次通過 80%、最終通過 100%。只列後者，會看不見升級路由替便宜模型做了多少工作。反過來，主動回報「無法判定」有時是正確行為；這類任務不算首次完成，但應和捏造答案分開記錄。

主代理也需要固定的收件規則。缺行號、來源版本不同或案例數對不上，就把這份交付標記為拒收，保留錯誤原因；不讓主代理在整合摘要時順手修好，最後又把它記成 worker 的成功。這份契約可接上[Claude Agent 團隊的交接與驗收設計](/blog/claude-agent-team-acceptance-boundaries/)。

## 每件多看六秒，就可能用完省下的模型費

下面用 1,000 個相同類型的窄任務算一次。全部是假設條件，並非 Haiku、Sonnet 或 Opus 的實測結果：

- 直接走既有大型模型路由，每件的全部模型費用假設為 US$0.06。
- Haiku 每件使用 20,000 個非快取輸入、2,000 個計費輸出 tokens，按短 prompt 費率算 US$0.003。
- Haiku 首次通過率假設為 80%；其餘 200 件升級，每件額外模型費假設仍為 US$0.06。
- 兩條路由最終都完成這 1,000 件；共同的基本驗收費用相同，暫時省略。

直接使用既有路由花 US$60。Haiku 先跑再升級，模型費為 `1,000 × 0.003 + 200 × 0.06 = US$15`，看起來省了 US$45。

假設便宜路由平均每件增加六秒人工覆核，這一批就多出 100 分鐘。若內部工時以每分鐘 US$0.50 估算，新增人工成本為 US$50，合計 US$65，已超過原路由的 US$60。這個工時價格也是示例，團隊可以換成自己的數字，或直接並列分鐘數。

算式還有兩個保守前提：升級案件的模型成本沒有因難度而增加，也沒有新增主代理判讀、重複工具或其他重試費用。實際拒收的往往是較難案件，因此應使用「被升級那批任務」的實際帳單，不能永遠套用全部任務的平均值。

正式比較時，分子要收齊整批成本：

```text
每個最終驗收任務成本
=（所有模型呼叫 + 工具與執行費 + 人工覆核與修正費）
  ÷ 最終通過驗收的任務數
```

失敗、拒收、重試與最後放棄的支出都留在分子。最終通過數為零時標示未達標，不產生單位成本。再把首次通過率放在旁邊，才能辨認節省來自 worker 本身，還是大量依賴後段補救。這延伸了[每個驗收任務成本的模型選型方法](/blog/gpt-6-1-sol-cost-per-accepted-task/)，這次把交接與升級單獨拆帳。

## effort 比較要保留漏查的代價

[官方 effort 文件](https://platform.claude.com/docs/en/build-with-claude/effort)列出 Haiku 5.5 預設為 `medium`，並提醒長 Agent prompt 在 `low` 下更可能略過搜尋或檢查、提早停止。Effort 是行為調節，並非嚴格的 token 預算。

因此，第一輪可以比較既有路由、Haiku `medium` 與 Haiku `low`，但要讓它們收到同一批日誌、使用相同工具與驗收器。先處理 API 相容性，確認三條路都能正確讀取輸入與輸出，再開始計分；介面錯誤要獨立記錄。

若 `low` 少花 token 卻多漏掉巢狀錯誤，問題會出現在首次通過率與升級率。若 `medium` 多推理一些，省下人工查漏時間，它仍可能有較低的任務總成本。這些都是待驗證假說，不能從 effort 名稱直接得到結論。

我會先選擇唯讀、有答案可對照的抽取工作。開放式除錯、多檔案修補與需要外部寫入的工作繼續走原流程，等窄任務的帳目與驗收穩定後，再設計各自的實驗。用途接近，不代表可以共用同一個品質門檻。

## 先把一次失敗的去向寫清楚

以下 YAML 是應用端的實驗契約示意，不是 Anthropic SDK 設定，也不會自行限制工具或執行權限：

```yaml
experiment: test-log-extraction-v1
candidate_model: claude-haiku-5-5
candidate_efforts: [medium, low]
input: immutable_test_log
output_fields: [case_id, error_excerpt, line_range]
acceptance:
  exact_failed_case_set: required
  excerpt_matches_source: required
  unsupported_case: reject
routing:
  first_quality_rejection: approved_baseline
  baseline_rejection: human_review
  missing_source: stop_and_report
measurement:
  - first_attempt_acceptance
  - final_acceptance
  - all_attempts_cost
  - added_parent_and_human_review_time
  - end_to_end_latency_p95
```

第一次品質拒收就升級，是這輪實驗刻意選的政策，好讓帳目容易解釋；它不是所有系統的最佳重試次數。逾時、限流等傳輸問題另設有上限的重試政策，並照樣計入成本。缺失的來源要補齊，安全拒絕與權限不足則停止處理，不透過換模型繞過。

任務集保留常見案例，也納入截斷日誌、重複案例 ID、Unicode、只有警告，以及根本沒有失敗的輸入。調整 prompt 與路由只用開發集，最後再看未參與調整的保留集；按任務、prompt 長度與 effort 分開報告，避免常見短輸入掩蓋長輸入退步。

樣本數要足以觀察團隊在意的錯誤，少量全過只能支持繼續測試。人工覆核時隱藏模型名稱，並抽查「已通過」的輸出，檢查驗收器是否漏判。若所有候選都漏掉同一種巢狀錯誤，先修驗收器，否則成本報表只會替共同盲點算出漂亮的單價。

**停止規則：出現無來源結果被驗收器接受、發生越權操作，或最終品質與覆核工時超出事先設定的容忍值，就停止擴大候選流量。** 數值由任務風險決定，實驗開始前記下；不能看到節省比例後才放寬。

需要接入線上路由時，可延伸閱讀 [Cloudflare 模型分流的品質驗收](/blog/cloudflare-user-insights-model-routing/)。第一步仍很小：挑一種固定交付格式的 subagent 工作，保存一批可重跑輸入，讓 `medium` 與 `low` 各跑一次相同實驗。把首次驗收、升級費用與多花的覆核分鐘數放在同一張報告，再決定這條便宜路由值不值得留下。
