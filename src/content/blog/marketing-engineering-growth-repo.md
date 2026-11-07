---
title: "用 Growth Repo 保存客戶資料、行銷實驗與核准紀錄"
description: "以一個 landing page 訊息測試，說明 Growth Repo 如何保存來源、實驗版本與核准紀錄，並分開客戶資料存取權限、草稿工作與發布決定。"
publishDate: 2026-09-01T16:05:56+08:00
updatedDate: 2026-11-05T23:19:50Z
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
cover: ../../assets/covers/marketing-engineering-growth-repo.png
coverAlt: "深色工作台上的半透明客戶訊號卡片，經由金色連線匯入右下方的黑色資料夾盒；藍色回饋線與琥珀色核准章構成可追溯的行銷迴路。"
---

行銷團隊要測試 landing page 的主標時，CRM、銷售通話與客服工單可能各留下一部分理由。誰提過這個問題、屬於哪個客群、上次是否測過相近訊息，都要重新找。Growth Repo 可以保存這些來源與決策，讓下一次實驗接著已有紀錄往下做。

這個題目的原始線索是 The Startup Ideas Podcast 的 [X 討論](https://x.com/startupideaspod/status/2094505890980540534)，既有來源記錄以 Marketing Engineer 與 Growth OS／growth repo 描述這種工作構想。2026-11-05 查核時無法取得貼文正文，因此不採用其中可能涉及的薪資、成效或工具組合預測。以下是一套可試行的行銷工作流建議，landing page 與兩個客服工單都是示例，沒有實際客戶資料或實驗結果。

## 客戶原始資料留在有存取管理的系統

Growth Repo 需要讓人找到某項判斷的依據。銷售通話可留在原本的通話系統，工單留在客服平台，repo 記錄獲准使用的摘要、來源識別與日期。只需要知道某類客群對報價流程有疑慮時，通常用不到聯絡人姓名、電子郵件或整段逐字稿。

Git 適合保存檔案版本與變更脈絡。[Git repository layout](https://git-scm.com/docs/gitrepository-layout)說明了工作樹、物件與 refs 等結構。選用 Git 前，仍要決定哪些資料適合進入可複製的版本歷史。刪掉目前檔案中的資料，無法一併移除舊 commit、既有 clone 或 fork 裡的副本，清除外洩內容需要另外處理。[GitHub 的敏感資料移除文件](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)列出了這些限制。

因此第一版可以採取較小的資料範圍：使用僅對獲准成員開放的 repo，保存經確認可供團隊與指定 AI 服務使用的去識別摘要、來源連結、實驗設定與核准紀錄。受限的錄音、逐字稿、個別客戶聯絡資訊與存取憑證留在原系統。來源連結與摘要也要檢查，工單標題、網址參數或少量線索的組合仍可能透露身分。

資料負責人要能回答誰可讀取、可交給哪個服務處理、使用目的與保存多久。repo 成員、Agent 執行身分、外部 AI 服務的接收範圍各有自己的設定，不能從「團隊看得到」推定其他服務也獲准接收。若來源連結已失效或接手者沒有權限，就先補授權或請資料負責人提供適用摘要，避免由 Agent 猜補內容。

## 五份檔案，分開保存訊號與決定

第一版可沿用五份文字檔。它們的分工比目錄名稱重要，團隊也可以在已有文件系統中實作。下列結構裡的引文與摘要，都限於前一節確認過的使用範圍：

```text
growth/
├── customer-truth.md     # 引文、來源連結、日期、受影響的客群
├── positioning.md        # 已驗證與待驗證的訊息，不是 slogan 清單
├── experiments.md        # 假設、版本、owner、指標與判定日期
├── agent-jobs.md         # 每個 agent 的讀取範圍、產出與禁止事項
└── weekly-review.md      # 本週結果、反例、下一個決定與連結
```

`customer-truth.md` 放可追溯的客戶訊號。每筆要能回到訪談、工單、成交失敗原因或獲准使用的分析，也要保留樣本範圍。檔名裡的 truth 不代表幾則意見已能概括整個市場。尚無來源的想法可另標為待驗證假設。

`positioning.md` 保存團隊目前採用的訊息，以及各自的適用客群和依據。`experiments.md` 則記下正在測什麼、用哪個版本、由誰負責、怎麼判讀。兩者分開，才能看出一句文案何時只是候選，何時有了足夠依據可以採用。

`agent-jobs.md` 說明 Agent 在這個流程中可以做哪些工作。`weekly-review.md` 記錄回顧後做出的決定，連回實驗與反例。回顧檔以摘要和連結為主，避免把同一批客戶資料再複製一次。

## 一次 landing page 測試，要先約定怎麼判讀

可以從本週銷售異議選一個候選訊息，例如「報價後無人跟進」。Agent 先整理符合資料使用範圍的摘要，提出一個主標版本，由行銷負責人判斷是否值得測試。這個切片保留了原先「用客戶訊號選下一步行動」的想法，也讓發布範圍可被檢查。

以下是工作說明範例。兩週是安排回顧的時間，不保證屆時已有足夠樣本：

```yaml
input:
  sources: 本週銷售通話摘要與客服工單
  required_evidence: 每個主張都附來源連結與日期
decision:
  hypothesis: "是否應把『報價後無人跟進』放入頁面主標？"
  human_gate: 行銷 owner 核准訊息與發布範圍
output:
  artifact: 一個頁面文案版本與測試計畫
  success_metric: 目標客群的合格 demo 申請率
review:
  date: 兩週後
  write_back: experiments.md 與 positioning.md
```

開始前，負責人還要補上目標客群、合格 demo 的定義、申請率的分母、比較版本與判定條件。來源流量若差很多，兩個版本的申請數就難以直接比較。若要把差異歸因於主標，測試設計也得處理分流、其他頁面變動與樣本不足等問題。

Agent 的交付物是文案草稿與測試計畫。人工核准需要連到確切版本，記下核准人、日期、受眾與發布位置。核准後若主標或受眾改了，就重新確認受影響的部分。這樣回顧結果時，才知道實際上線的內容是否就是原先核准的版本。

寄出數與生成篇數可用來記工作量。這個實驗選的是合格 demo 申請率，因為負責人要判斷的是候選訊息是否帶來適合的潛在客戶，而非 Agent 產出了多少文字。

## Agent 可以整理草稿，發布權限另外配置

四個問題足以把 `agent-jobs.md` 寫得具體：

- 資料：可以讀哪些系統、檔案與欄位？來源缺失時要向誰確認？
- 工作：要交付摘要、候選假設、文案草稿，還是已核准版本的比對結果？
- 權限：哪些外部操作需要核准，哪個身分能執行，核准紀錄在哪裡？
- 評估：用什麼資料判斷假設，何時回顧，證據不足時怎麼處理？

[Claude Code overview](https://docs.anthropic.com/en/docs/claude-code/overview)列出的能力包括讀取 codebase、修改檔案與執行命令。[OpenAI 的 Codex 介紹](https://openai.com/codex/)也描述了 coding agent、雲端工作與工具整合。具體能存取的檔案與服務，取決於執行環境、帳號及設定。這些產品能力不能替團隊決定客戶資料可否傳送、文案可否發布。

以這個 landing page 流程來說，整理草稿的 Agent 不需要發信、改價或操作正式網站的憑證。若之後要串接發布，應由具權限的服務檢查版本與核准狀態，再執行變更。把 `human_gate` 寫進 YAML，只是在描述流程，還需要有人或外部系統實際執行這個限制。

OpenAI 於 2026-05-08 發布的 [Running Codex safely at OpenAI](https://openai.com/index/running-codex-safely/)說明其內部如何搭配 sandbox、核准政策、網路限制與紀錄管理。這可作為控制設計的參考，各團隊仍須檢查自己環境中已啟用的設定，不能直接把該部署方式當成所有 Codex 使用情境的預設。

跨次執行也需要交接。Anthropic 在 2025-11-26 的 [長時間 Agent 工程文章](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)中，用進度檔與 Git 歷史協助下一個 coding session 接手。把這個做法用到 Growth Repo，值得保留的是來源版本、已做的工作與尚待決定的項目。行銷成效則要由實驗資料另行判斷。

## 兩個工單支持的是候選訊息

假設「客戶想要即時回覆」只來自兩個客服工單，`customer-truth.md` 應保留這兩個樣本的日期與客群，並把即時回覆列為候選訊息。這時還不能直接改成「目標市場最在意即時回覆」，更不能把它當作產品已承諾提供的服務。

到回顧日期，先對照實際上線版本、受眾與成功判定，再整理結果。沒有更多合格申請，可能是訊息沒有幫助，也可能是流量太少、追蹤有缺口，或測試期間改了其他條件。回寫時可以明確記錄「在這個受眾、版本與觀察期間，現有結果未支持原假設」，接著說明證據不足在哪裡、要停止還是補做。這比直接宣判訊息不成立，更能指引下一次選擇。

每次回顧至少要找得到原始訊號、實驗版本與判定理由。若條件足以判讀，更新 `positioning.md` 的適用範圍，或把原假設降級、刪除。若條件不足，保留待確認狀態，指定補資料的人與下一次檢視時間。無論結果如何，都在 `weekly-review.md` 連回這次決定，讓後來的人不必靠文案措辭猜成效。

## 第一個月，只跑完一個可負責的流程

第一個月可先選一條已有來源、由單一負責人核准、兩週後能開始回顧的流程。競品監看、內容製作、外寄自動化與成長 dashboard 都可以等這次測試有了可判讀的紀錄後，再決定是否增加。

[AI Business Partner 的工作流分工](/blog/ai-business-partner-workflow-ownership/)也關心誰處理決定與例外。在 Growth Repo 裡，最小的開始方式是把下一次 landing page 測試記完整：一筆獲准使用的來源、一個候選主標、負責人核准的版本，以及約定好的回顧日期。等回顧能說清楚保留或放棄它的理由，再增加第二個資料來源或第二個 Agent。

## 參考資料

- [The Startup Ideas Podcast：The Marketing Engineer Clearly Explained](https://x.com/startupideaspod/status/2094505890980540534)（2026-11-05 未能取得正文）
- [Git：repository layout](https://git-scm.com/docs/gitrepository-layout)（文件頁標示最後修訂版本 2.49.0，2026-11-05 查閱）
- [GitHub：Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)（2026-11-05 查閱）
- [Anthropic：Claude Code overview](https://docs.anthropic.com/en/docs/claude-code/overview)（2026-11-05 查閱，連結轉至 Claude Code 官方文件）
- [Anthropic：Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)（2025-11-26 發布，2026-11-05 查閱）
- [OpenAI：Codex](https://openai.com/codex/)（2026-11-05 查閱）
- [OpenAI：Running Codex safely](https://openai.com/index/running-codex-safely/)（2026-05-08 發布，2026-11-05 查閱）
