# Haiku 5.5 subagent 驗收成本研究紀錄

查核日期：2026-10-08。文章：`src/content/blog/haiku55-subagent-accepted-task-cost.md`。寫作範圍限本文與本研究紀錄；封面、整體發布檢查與部署另行處理。

## 去重與選題邊界

在 `src/content/blog`、`docs/research`、`docs/article-queue.md` 搜尋原始與正規化 URL `https://www.anthropic.com/claude-haiku-5-5`、穩定模型 ID `claude-haiku-5-5`、`Haiku 5.5`、`Haiku55`，未找到既有來源。此 URL 無追蹤參數，正規化後相同。另以發布者 Anthropic 與首次驗收、重試成本、每個任務成本搜尋主題。

找到相關舊文：

- `gpt-6-1-sol-cost-per-accepted-task.md`：一般模型遷移與每個驗收任務成本。
- `cloudflare-user-insights-model-routing.md`：從平台節費候選到品質分流。
- `claude-agent-team-acceptance-boundaries.md`：多代理交接與驗收控制。

本篇新增範圍是 Haiku 的窄任務首次交付、prompt 計價門檻、effort 及被拒收案件的升級成本，並以額外覆核時間示範成本逆轉；未重寫通用模型評估介紹。正文連回三篇。系列採既有「AI Agent 工程化與工作流實戰」第 71 篇；同批新增文章的序號由整體發布工作協調。

## 一手來源

以下均已透過官方網頁讀取，未以搜尋摘要代替正文：

1. [Haiku 5.5 發布公告](https://www.anthropic.com/claude-haiku-5-5)：提供發布日期、定位、effort 與複雜 coding 的選型界線。完整讀取；正文只採用一個精簡事實段，不搬運 benchmark 分數、客戶引言、降價百分比、訂閱 credit 或發布頁圖表。
2. [模型 overview 與 pricing](https://platform.claude.com/docs/en/models/haiku-5-5/overview#pricing)：用於正文的標準雙級費率與快取期間對照。以總 prompt 長度選適用級距；無快取的邊界試算由作者自行計算。
3. [完整計價文件](https://platform.claude.com/docs/en/about-claude/pricing)：核對模型費率、prompt caching、Batch 與 long context 章節；正文只簡述折扣適用性與帳目分類。未將合作雲端平台、區域、工具等全部費率搬進文章。
4. [Haiku 遷移指南](https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide#recount-tokens)：核對重新計數需求；正文不承諾固定增加比例，也未提供可直接遷移的程式碼。
5. [Effort 文件](https://platform.claude.com/docs/en/build-with-claude/effort)：支持預設設定、較低 effort 的漏查風險與非嚴格預算的限制。未將建議變成實測結論。

採用簡短轉述、未逐字引用。每份來源衍生內容維持約 200 英文詞以內的資訊量，其餘為明確標示的原創計算、定義與測試設計。

## 原創分析與未驗證項目

- 首次通過與最終通過採不同指標，且只用既定獨立驗收判斷；主代理或人工補好的交付不得回填成 worker 首次成功。
- 1,000 件成本案例的輸出用量、80% 首次通過、升級費、人工秒數與工時價格都是假設，沒有執行 API 呼叫或效能實驗。
- 模型費用 US$15／US$60 與額外覆核後 US$65 是算術示例。兩路最終完成數相同、共同成本相同才可在例子中省略共同項目；正式實驗保留全部支出與放棄案件。
- 升級群組通常較難是待驗證的工程考量，正文要求以該群組實際支出計算，不假設等於全體平均。
- YAML 是團隊自訂契約，不是 SDK schema；權限控制、品質拒收、傳輸重試、安全拒絕與缺來源分開處理。
- 未宣稱任何 Haiku 5.5 路由已在 CarlStack 實測、節費或投入生產。沒有從供應方基準推導使用者工作流的勝率。

## 內容與檢查

已閱讀根目錄 AGENTS、內容指南、content schema、CarlStack copywriting 與 humanize-writing（中英文）規則，並參照上述同系列文章。正文使用既有 taxonomy、offset ISO 時間戳、`draft: false`、`featured: false` 與預定 WebP 封面；沒有 Markdown 表格或 Mermaid。

寫作完成後對本篇與研究紀錄執行 Prettier，並單獨呼叫文章 policy 檢查函式與重算數字。完整 build、封面驗證、stage、commit、部署與正式網址檢查由整體發布流程執行；本紀錄不提前宣稱其結果。

## 封面整合驗收

內建 imagegen 原創生成，原始 PNG 1536×1024，轉成本地 WebP。已檢視全尺寸及 320×180 卡片裁切，沒有非預期文字、logo 或浮水印。陶土模型攝影／俯視圓形構圖／粉藍與赤陶／明亮硬影；白篩網、下方小珠碗、右側大型珠盤可辨。封面四篇採不同媒材、構圖與主色，並與 Oct7 相鄰封面比對；未採用第三方圖片。
