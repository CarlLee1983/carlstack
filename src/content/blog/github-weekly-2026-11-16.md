---
title: "GitHub 週榜前十：介面設計與代理開發工具"
description: "2026 年 11 月 16 日 GitHub Trending 週榜前十名，整理 Astryx、Plannotator、agent-browser 等專案的用途、近期版本與試用重點，分開記錄累積 stars 和本週新增 stars。"
publishDate: 2026-11-16T09:16:17+08:00
draft: false
featured: false
tags: [開源專案, AI Agent Workflow, 技術選型]
series: GitHub 熱門專案週報
seriesOrder: 3
cover: ../../assets/github-weekly-2026-11-16.webp
coverAlt: "2026 年 11 月 16 日 GitHub 週榜，淡紫色剪紙封面分兩欄列出前十名，左欄 1 至 5 名、右欄 6 至 10 名，各項附累積 stars 的 k 值。"
---

這週榜首是 Meta 的介面設計系統 Astryx。Plannotator 把計畫與程式碼審查放進瀏覽器，agent-browser 則讓代理操作網頁。三者分別處理介面元件、人的回饋和自動操作，適合放在同一個小型專案裡比較，但不必一次全部導入。

榜上也有帳號名稱搜尋、個人財務工具與物理模擬器。以下保留 GitHub 的原始排名，逐項說明用途與可開始研究的地方。Anthropic Skills 和 OpenMausBot 曾出現在[上期週榜](/blog/github-weekly-2026-11-09/)，這次著重查核現況與新增功能。

## 榜單與資料時間

[GitHub Trending 官方週榜](https://github.com/trending?since=weekly)於 **2026-11-16 08:59:49（Asia/Taipei）**擷取，選項為全語言、Spoken Language: Any、This week。官方頁面沒有標出精確起訖日，這裡不將它改稱自然週統計，也不依累積星數重排。

每項的兩種星數取自同一次榜單快照。封面顯示累積 stars，除以 1,000 後四捨五入到一位小數，例如 28,866 顯示為 28.9k。正文保留整數。專案文件與版本另於 11 月 16 日查核，release 日期統一採 UTC。

本次讀取官方 README、授權、相關文件和近期 Releases，沒有安裝十套專案或執行其效能、安全及模擬測試。以下試用情境是工程建議，版本功能依維護者公開說明整理。

## 1. meta/astryx：React 介面元件與設計工具

累積 28,866 stars；本週新增 13,501。

[Astryx](https://github.com/meta/astryx) 提供 React 元件、主題與 CLI。元件內部使用 StyleX，使用端可匯入預先建好的 CSS，再用 CSS variables 調整主題。CLI 能查元件 API、取得頁面範本，也能將元件原始碼取出自行修改，適合正在建立後台介面的 React 團隊。

它要求 React 19 以上，目前仍標示 Beta。11 月 14 日的 v0.7.16 增加日期、時間等欄位的錯誤顯示時機設定。這是實際表單會碰到的問題：使用者還沒打完日期，畫面是否就立即報錯？可以用一個日期欄位與送出按鈕，檢查輸入中、離開欄位、按 Enter 和修正錯誤的行為，再決定要不要替換既有元件。

程式採 MIT。CLI 的 `init` 會寫入專案的代理指引檔，使用前宜看清變更。來源：[README](https://github.com/meta/astryx/blob/main/README.md)、[Core 安裝與 CLI 文件](https://github.com/meta/astryx/blob/main/packages/core/README.md)、[v0.7.16](https://github.com/meta/astryx/releases/tag/v0.7.16)、[LICENSE](https://github.com/meta/astryx/blob/main/LICENSE)。

## 2. anthropics/skills：技能範例與評估流程

累積 195,367 stars；本週新增 6,077。

[Anthropic Skills](https://github.com/anthropics/skills) 收錄以 `SKILL.md`、腳本和參考資料組成的技能。適合已經有重複工作流程、想把操作步驟交給代理的開發者。延續上期，可進一步讀 `skill-creator`：它要求建立測試提示、比較結果、收集人工回饋，再修訂技能，另有觸發描述的改善流程。

可挑一個既有文件整理工作，保留相同輸入，比較有無技能時的漏項與輸出格式。只看一次成功案例，很難知道改善來自規則還是剛好抽到好結果。官方也明說公開範例與 Claude 產品實際使用的實作可能不同。

查核時沒有 GitHub release，試用宜記錄 commit。README 及四個文件技能的授權檔均標示 Apache-2.0；仍應按使用的子目錄核對。來源：[README](https://github.com/anthropics/skills/blob/main/README.md)、[skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)、[DOCX 授權](https://github.com/anthropics/skills/blob/main/skills/docx/LICENSE.txt)、[PDF 授權](https://github.com/anthropics/skills/blob/main/skills/pdf/LICENSE.txt)、[PPTX 授權](https://github.com/anthropics/skills/blob/main/skills/pptx/LICENSE.txt)、[XLSX 授權](https://github.com/anthropics/skills/blob/main/skills/xlsx/LICENSE.txt)、[Releases](https://github.com/anthropics/skills/releases)。

## 3. sherlock-project/sherlock：查找同名公開帳號

累積 112,485 stars；本週新增 10,412。

[Sherlock](https://github.com/sherlock-project/sherlock) 依使用者名稱查詢多個社群網站，適合檢查自己的公開帳號足跡，或研究跨網站結果判定。它找到的是符合名稱與網站判斷條件的頁面，同名帳號不能直接認定是同一個人。

值得研究的是誤判處理。官方已有容易誤報網站的排除機制，命令列也提醒忽略排除清單可能增加 false positives。可用自己管理的帳號和不存在的名稱測試，保存回應與人工核對結果，觀察登入頁、限流或地區差異會如何影響判斷。不要把帳號名稱搜尋用於騷擾或揭露他人私人資料。

最新列出的 release 是 9 月 8 日 v0.16.2，並非本週新版本。README 提醒部分第三方 Linux 套件有問題，需區分官方建議安裝方式與發行版套件。程式採 MIT。來源：[README](https://github.com/sherlock-project/sherlock/blob/master/README.md)、[網站驗證測試](https://github.com/sherlock-project/sherlock/blob/master/tests/test_validate_targets.py)、[v0.16.2](https://github.com/sherlock-project/sherlock/releases/tag/v0.16.2)、[LICENSE](https://github.com/sherlock-project/sherlock/blob/master/LICENSE)。

## 4. backnotprop/plannotator：在瀏覽器審查代理計畫

累積 11,839 stars；本週新增 1,719。

[Plannotator](https://github.com/backnotprop/plannotator) 把代理提出的計畫、程式碼差異與檔案放進可註解的介面，再把回饋送回代理。適合覺得純聊天難以指出修改位置的團隊。11 月 15 日的 v0.28.65 增加收回代理尚未收到的回覆，也調整 Tailscale 存取限制。

可以先選一個小型 PR，檢查註解是否能指到精確段落，以及代理修訂後是否保留原決策。遠端模式要另外確認網路設定：README 明寫 hook server 在 remote mode 監聽 `0.0.0.0` 且沒有登入驗證。版本說明中的 Tailscale 帳號限制，不宜延伸解讀成所有遠端入口都有認證。

程式可選 Apache-2.0 或 MIT。來源：[README](https://github.com/backnotprop/plannotator/blob/main/README.md)、[v0.28.65](https://github.com/backnotprop/plannotator/releases/tag/v0.28.65)、[Apache 授權](https://github.com/backnotprop/plannotator/blob/main/LICENSE-APACHE)、[MIT 授權](https://github.com/backnotprop/plannotator/blob/main/LICENSE-MIT)。

## 5. vercel-labs/agent-browser：代理的瀏覽器操作介面

累積 51,626 stars；本週新增 4,217。

[agent-browser](https://github.com/vercel-labs/agent-browser) 用 Rust CLI 與背景 daemon 控制瀏覽器。代理先讀取無障礙樹快照，取得元素參照，再點擊、輸入並重新確認畫面。適合研究代理如何完成網站操作，以及測試失敗時應回報什麼證據。

11 月 12 日的 v0.43.0 為無名稱或同名控制項補上 snapshot hints，並修正分頁關閉後仍等待逾時的問題。試用可做一個有兩顆同名按鈕的測試頁，再加入會關閉分頁的操作，確認工具能分辨目標並明確失敗。README 要求頁面導覽或 DOM 改變後重新取快照，舊參照不應持續沿用。

程式採 Apache-2.0。官方安全文件明寫網域、動作與輸出限制是選配，預設不限制這三項。使用正式帳號前，要依部署情境設定允許範圍。來源：[README](https://github.com/vercel-labs/agent-browser/blob/main/README.md)、[安全設定](https://agent-browser.dev/security)、[v0.43.0](https://github.com/vercel-labs/agent-browser/releases/tag/v0.43.0)、[LICENSE](https://github.com/vercel-labs/agent-browser/blob/main/LICENSE)。

## 6. ZhuLinsen/daily_stock_analysis：股票報告的資料整合

累積 72,508 stars；本週新增 4,548。

[Daily Stock Analysis](https://github.com/ZhuLinsen/daily_stock_analysis) 把多市場行情、新聞搜尋、LLM 分析與通知串成定時工作，適合研究資料源切換、排程及部分結果交付。11 月 9 日的 v3.34.0 調整研究報告合成階段的逾時額度，保留逾時階段、原因與已知 token 用量，也修正把 VIX 上漲算成股市利多的評分問題。

可研究資料品質處理。官方明說免費行情源會受限流與介面變動影響；模型和搜尋服務也可能收費。可先用固定的歷史資料，比對缺資料、逾時與正常三種報告，確認缺值沒有被模型補成事實。程式採 MIT；專案自述僅供學習研究，輸出不宜作為投資建議。

來源：[README](https://github.com/ZhuLinsen/daily_stock_analysis/blob/main/README.md)、[完整設定與資料源](https://github.com/ZhuLinsen/daily_stock_analysis/blob/main/docs/full-guide.md)、[v3.34.0](https://github.com/ZhuLinsen/daily_stock_analysis/releases/tag/v3.34.0)、[MIT](https://github.com/ZhuLinsen/daily_stock_analysis/blob/main/LICENSE)。

## 7. we-promise/sure：可自行部署的個人財務工具

累積 15,714 stars；本週新增 4,556。

[Sure](https://github.com/we-promise/sure) 是 Maybe Finance 停止維護後的社群分支，可用 Docker 自行部署，管理帳戶、交易與預算。對後端工程師而言，匯入去重、交易分類及備份還原，比儀表板樣式更值得研究。11 月 12 日的穩定版 v0.7.6-hotfix.1 回補 Rails、Rack 與 Nokogiri 更新；11 月 14 日另有 alpha，不能把它和穩定版混為一談。

試用可先匯入一批虛構交易，重複匯入並還原備份，確認餘額與分類一致。官方 Docker 文件提醒，升級既有站台不可隨意重建 `SECRET_KEY_BASE`，否則已加密資料可能無法解密；外部物件儲存中的附件需另外備份。程式採 AGPLv3，二次開發及對外提供服務前要看授權義務。

來源：[README](https://github.com/we-promise/sure/blob/main/README.md)、[Docker 與備份指南](https://github.com/we-promise/sure/blob/main/docs/hosting/docker.md)、[穩定版 v0.7.6-hotfix.1](https://github.com/we-promise/sure/releases/tag/v0.7.6-hotfix.1)、[v2026.11.14-alpha](https://github.com/we-promise/sure/releases/tag/v2026.11.14-alpha)、[AGPLv3](https://github.com/we-promise/sure/blob/main/LICENSE)。

## 8. milind-soni/OpenMausBot：代理工作的排程與交接

累積 23,411 stars；本週新增 5,463。

[OpenMausBot](https://github.com/milind-soni/OpenMausBot) 在聊天介面中管理不同模型的代理，核心結構已在[上期週榜](/blog/github-weekly-2026-11-09/)介紹。11 月 15 日的 v0.1.161 著重長時間工作：連續失敗的排程改為降低頻率，不再自動關閉；跳過或卡住的執行留下紀錄，代理交接也能帶檔案。

適合從一個會逾時、需要交接的測試任務，檢查排程歷史、產物與中斷行為。它的 MCP 介面刻意不提供批准權限、刪除資料、改憑證或控制電腦生命週期；不能因接上 MCP 就假定可遠端完成所有管理。核心採 Apache-2.0，但 `enterprise/` 另有授權，正式使用企業功能需要授權金鑰。

來源：[README](https://github.com/milind-soni/OpenMausBot/blob/main/README.md)、[MCP 介面](https://github.com/milind-soni/OpenMausBot/blob/main/docs/mcp-server.md)、[v0.1.161](https://github.com/milind-soni/OpenMausBot/releases/tag/v0.1.161)、[授權分界](https://github.com/milind-soni/OpenMausBot/blob/main/LICENSING.md)、[核心授權](https://github.com/milind-soni/OpenMausBot/blob/main/LICENSE)、[企業授權](https://github.com/milind-soni/OpenMausBot/blob/main/enterprise/LICENSE)。

## 9. google/elephant-goldfish-model：分開起草與審查設計文件

累積 19,772 stars；本週新增 5,060。

[Elephant-Goldfish Model](https://github.com/google/elephant-goldfish-model) 讓保留專案脈絡的代理起草規格，再由沒有先前對話的代理閱讀文件與引用材料，找出未寫明的假設。適合已有設計文件、想檢查文件是否足以交接的團隊；最後取捨與批准仍由人決定。11 月 6 日的 v0.1.1 加入 TRIZ reviewer 等調整，也明列部分介面為實驗支援。

審查隔離不能只看「另開代理」。目前文件區分不繼承對話與不載入主機指令檔，後者在部分環境尚未證實。試用時可把只有原對話才知道的條件刻意留在文件外，觀察審查者是否指出缺漏，再用測試驗證實作。程式採 Apache-2.0，並非 Google 正式支援產品。

來源：[README](https://github.com/google/elephant-goldfish-model/blob/main/README.md)、[環境支援與隔離限制](https://github.com/google/elephant-goldfish-model/blob/main/docs/harnesses.md#support-status--contributing-other-harnesses)、[v0.1.1](https://github.com/google/elephant-goldfish-model/releases/tag/v0.1.1)、[授權](https://github.com/google/elephant-goldfish-model/blob/main/LICENSE)。

## 10. google-deepmind/mujoco：機器人與接觸物理模擬

累積 18,073 stars；本週新增 1,922。

[MuJoCo](https://github.com/google-deepmind/mujoco) 模擬多關節物體與環境的接觸，提供 C API、Python 綁定與互動視覺化，適合機器人、控制與物理模擬研究。11 月 11 日的 4.0.1 修正 4.0.0 引入的稀疏 Cholesky 分解問題；官方說明其可能造成 Newton solver 收斂緩慢、加速度錯誤或發散。

工程研究可從同一模型在升級前後的軌跡與求解結果比較開始，不只確認畫面能跑。MuJoCo 的版本規則不是一般 SemVer，官方也不保證跨版本數值可重現，因此應固定版本、模型與實驗設定。程式採 Apache-2.0，`doc` 目錄的文件、圖片與影片另採 CC BY 4.0。

來源：[README](https://github.com/google-deepmind/mujoco/blob/main/README.md)、[版本規則](https://github.com/google-deepmind/mujoco/blob/main/VERSIONING.md)、[4.0.1](https://github.com/google-deepmind/mujoco/releases/tag/4.0.1)、[程式授權](https://github.com/google-deepmind/mujoco/blob/main/LICENSE)。

## 本週可以試哪一項

若正在做後台表單，我會從 Astryx 的日期欄位開始，確認錯誤提示與鍵盤操作是否符合需求。若困擾是代理改錯地方，就用 Plannotator 對一份小型 diff 留下註解，觀察回饋是否減少往返。兩項都能以既有工作判斷有沒有幫助，不必先重整整套開發流程。
