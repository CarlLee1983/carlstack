# LiveReview 自動核准：查核與既有文更新

- 查核日期：2026-11-08，Asia/Taipei。
- 主來源：[Hexmos 公告，2026-11-07](https://journal.hexmos.com/introducing-livereview/)。保留原 URL，沒有穩定 ID 或識別用 query 被移除。
- 更新文章：`src/content/blog/reviewbench-ai-code-review-acceptance-gates.md`。既有 URL 不變。
- LiveReview 原始碼固定於 `4f04fa36199a4f748e13f2a61c7190b1178a0f71`。只讀公開程式與文件，未啟動服務、執行模型或宣稱重現成效。

## 去重與編輯決定

在最新 main `38c50957fb186528f59a12e4a8fcf825403ab7bb` 的 blog、research、queue，以原始 URL、introducing-livereview、LiveReview、git-lrc、Hexmos、RADAR、Diff Risk Score、自動核准及 AI code review 搜尋。Trail 命令與 `.trail/cache` 均不可用，改用範圍限定的完整文字搜尋。沒有同來源文章；已有 ReviewBench 驗收、AI review 停止規則、理解債與 Anti-slop gate 文章。

本次不新增工具介紹文章。LiveReview 的實作補出了既有 ReviewBench 文章尚未處理的採用問題：reviewer 從產生 finding 變成自動核准時，如何驗收冷啟動、結果標記與時間隔離。保留 AI Agent 工程化與工作流實戰 seriesOrder 65；無新系列號，沿用可表達漏報／雜訊的原封面。標題縮為「ReviewBench：AI 審查的驗收門檻」，更新 description 與 updatedDate，原發布時間不變。

## 一手證據與結論

- [custom funnel](https://github.com/HexmosTech/LiveReview/blob/4f04fa36199a4f748e13f2a61c7190b1178a0f71/internal/policyengine/engine.go#L142-L214)：eligibility、static、risk、LLM 任一失敗會阻擋；正文限定 custom，沒有聲稱 always_approve 也跑相同流程。
- [model.go](https://github.com/HexmosTech/LiveReview/blob/4f04fa36199a4f748e13f2a61c7190b1178a0f71/internal/riskscore/model.go)：logistic model 從手設 prior 起步；batch 與 online update 對照實際程式，未把 seed 寫成已取得客戶事故訓練證據。
- [calibration.go](https://github.com/HexmosTech/LiveReview/blob/4f04fa36199a4f748e13f2a61c7190b1178a0f71/internal/riskscore/calibration.go#L15-L100)：歷史 scores 少於 10 筆時 cutoff=0.5。10 是 score 樣本而非帶 outcome 標籤的訓練樣本。P20 是分數排序的門檻，不是事故機率或最終核准比例。
- [calibration SQL](https://github.com/HexmosTech/LiveReview/blob/4f04fa36199a4f748e13f2a61c7190b1178a0f71/internal/api/auto_approve_insights_handlers.go#L275-L320)：review_outcomes join review_policy_log 的 final 階段，排除 source=test。false_approve_rate 是 approvedBad / approvedWithOutcome；並非全部已核准 PR 分母。SQL 沒有取 latest final 或 distinct PR，正文精確稱「final 階段的政策決策紀錄」，並建議依版本去重。
- [Simulate](https://github.com/HexmosTech/LiveReview/blob/4f04fa36199a4f748e13f2a61c7190b1178a0f71/internal/api/auto_approve_policy_handlers.go#L321-L448) 與 [riskStage](https://github.com/HexmosTech/LiveReview/blob/4f04fa36199a4f748e13f2a61c7190b1178a0f71/internal/policyengine/engine.go#L310-L346)：近期 completed review 在 draft policy dry-run 下重算，使用目前 ScoreFor 與近期 score distribution；適合比較政策，但不等於歷史時間點的預測回測。
- [RADAR v2](https://arxiv.org/html/2605.30208v2)，尤其第 6 節：1/50 PI 與1/3 revert 比較經篩選 RADAR diffs 和非 RADAR diffs。非隨機、低至中等複雜度與 Meta 專有基礎設施限制，不能推成 LiveReview 效果。
- [LiveReview FAQ](https://hexmos.com/livereview/docs/faq/) 的「How well does LiveReview’s RADAR-based risk scoring perform」在查核時把類似數字列入自家成效。未找到獨立 LiveReview 生產比較樣本／方法支持；正文保留這項缺證結論。公告 30–50% 自動核准比例只稱廠商主張，不採「全球第一」。

100 個核准 PR、10 個回報、1 個回滾的例子為原創教學數值；明確假設每 PR 一決策一 outcome，1/10=10%，其餘90未知。時間切分、觀察期限、回報覆蓋率與 shadow review 是作者的採用建議，不歸為廠商實測。

## 人工審稿

已讀 content guide、schema、carlstack-copywriting、humanize-writing 與繁中規則。逐段檢查事實與建議分開、來源 anchor、分母、冷啟動及時間洩漏界線。獨立審稿核實所有 code anchors，並將「最後的政策決策」修正為「final 階段的政策決策紀錄」，避免暗示 SQL 會取 latest。繁中 checker 的「評論」命中為 code review 評述術語，非社群留言；冒號命中用於具體欄位／做法，非空泛揭曉句。修正新增範圍破折號與舊文「以下是」開場。

## 驗收

- Corepack 在獨立可寫入 /tmp 目錄取得 pnpm 12.1.0；frozen install 通過，沒有改 packageManager、engines 或 lockfile。
- 初輪完整 format、policy、check（Astro 0 errors／0 warnings／0 hints，含 production build）、test 117/117 通過；Pagefind 建立770頁索引。產物核對新標題、LiveReview段落、canonical、原發布與更新日期、封面、首頁／文章列表、RSS、Sitemap、系列及含新增內容的Pagefind fragment 均通過。
- 預覽限制：Astro dev 在準備完成前退出，瀏覽器及本機 HTTP 皆連線拒絕，因此未宣稱深淺色／320 px 視覺預覽通過。封面原檔已重新檢視，沒有新增 SVG 或改動版型。
- 初輪 check 曾因子程序找到系統 pnpm 11.25.0、Astro 預設設定目錄不可寫而停止；改用官方 pnpm 12.1.0 native 的獨立 PATH 與可寫入的 XDG_CONFIG_HOME 後完整重跑通過，沒有關閉 gate 或修改專案設定。
- 接續 main 的 OpenSSH 更新 `918810bd4239c536f93d0055cda19636e533d1b7`，保持該兩檔不變；整合後再跑最終 gate。部署精確 SHA、工作流及正式站驗收另於完成紀錄回報。
