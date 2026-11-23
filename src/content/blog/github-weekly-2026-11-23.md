---
title: "GitHub 週榜前十：設計、程式碼審查與瀏覽器工具"
description: "整理 2026 年 11 月 23 日 GitHub Trending 週榜前十：從 Plannotator 的命令卡、Stitch 的設計交接，到 Chrome DevTools MCP 的瀏覽器驗收。"
publishDate: 2026-11-23T09:04:26+08:00
draft: false
featured: false
tags: [開源專案, AI Agent Workflow, 技術選型]
series: GitHub 熱門專案週報
seriesOrder: 4
cover: ../../assets/github-weekly-2026-11-23.webp
coverAlt: "深藍網點海報，左欄列 Plannotator、Stitch Skills、Modern Web Guidance、Open Code Review、Last30Days，右欄列 Chrome DevTools MCP、Trading Skills、AG-UI、Astryx、HermesEnabler；每項附排名及約略累積星數。"
---

這週前三名是 Plannotator、Stitch Skills 和 Modern Web Guidance。手上的程式還在規劃時，Plannotator 可以逐段留意見；設計稿要交給前端時，可以看 Stitch；寫到瀏覽器相容性，再用 Modern Web Guidance 查支援範圍。這三個工具解決的問題不同，選一個正卡住的步驟試就夠了。

## 榜單與資料時間

[GitHub Trending 官方週榜](https://github.com/trending?since=weekly)於 2026 年 11 月 23 日 08:59:08（Asia/Taipei）擷取。使用 This week、全程式語言及不限介面所列的 Spoken Language。按官方順序取前十；GitHub 沒有在榜單標出精確統計起訖，因此這不是以台北週一為界的統計。

正文的累積 stars 與本週新增 stars 都取自同一份榜單。另用 GitHub Repository API 核對十筆 repo ID 與累積數；Modern Web Guidance 查 API 時顯示 10,208，正文保留榜單當時的 10,207，其餘九筆相符。封面為累積 stars 的一位小數 k 值。版本以下採 UTC；整理依專案公開文件，未安裝或實測這十套工具。

## 1. backnotprop/plannotator

累積 14,429 stars，本週新增 2,815。

[Plannotator](https://github.com/backnotprop/plannotator) 這週排在第一。[上週](/blog/github-weekly-2026-11-16/)介紹的是在瀏覽器註解計畫和變更；11 月 22 日的 [v0.29.2](https://github.com/backnotprop/plannotator/releases/tag/v0.29.2) 加入命令卡。依維護者說明，卡片會顯示命令和執行位置，由使用者按下 Run，並以該電腦的登入環境執行。適合已經要審核代理操作的人。若命令來自代理，我會先看工作目錄及參數，再用沒有憑證的測試專案試一次。按鈕本身不提供隔離，也不代表所有遠端入口都有驗證。

來源：[README 與遠端說明](https://github.com/backnotprop/plannotator/blob/main/README.md#remote--ssh--devcontainer)、[Apache-2.0](https://github.com/backnotprop/plannotator/blob/main/LICENSE-APACHE) 或 [MIT](https://github.com/backnotprop/plannotator/blob/main/LICENSE-MIT)。

## 2. google-labs-code/stitch-skills

累積 11,922 stars，本週新增 2,683。

[Stitch Skills](https://github.com/google-labs-code/stitch-skills) 提供和 Stitch MCP 一起使用的技能。前端團隊可以從程式產生設計版本，或把 Stitch 畫面轉成 React 元件。5 月 18 日 [v1.0](https://github.com/google-labs-code/stitch-skills/releases/tag/v1.0) 把技能分成設計、建置和工具三組；這是已核對的版本，不是本週才推出。

可以拿一張沒有客戶資料的設定頁，核對產出的按鈕、顏色、焦點及錯誤狀態有沒有沿用原設計。這些技能需要配置 Stitch MCP，執行上傳類技能會涉及送資料到 Stitch；先確認素材與程式範圍。來源：[README](https://github.com/google-labs-code/stitch-skills/blob/main/README.md)、[Stitch MCP 設定](https://stitch.withgoogle.com/docs/mcp/setup/)、[Apache-2.0](https://github.com/google-labs-code/stitch-skills/blob/main/LICENSE)。

## 3. GoogleChrome/modern-web-guidance-src

累積 10,207 stars，本週新增 3,575。

[Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance-src) 將 Web 平台指南及 Baseline 相容性資訊整理成代理可查的資料，適合要替舊前端找替代作法的團隊。查到的 [audit-data release](https://github.com/GoogleChrome/modern-web-guidance-src/releases/tag/audit-data) 是 10 月 14 日發布的稽核快照，不當作 CLI 新版本。

比起全面更新網站，我會先挑一個 CSS 改動，對照實際支援的瀏覽器版本，在新版、最低支援版各查一次呈現和備援。CLI 找得到指南，並不代表團隊的舊裝置能採用該功能。來源：[README 的專案設定](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/README.md#project-configuration-mwgrc)、[Chrome 指南](https://developer.chrome.com/docs/modern-web-guidance)、[程式 Apache-2.0](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/LICENSE)；指南內容依 README 標示 CC BY 4.0。

## 4. alibaba/open-code-review

累積 55,418 stars，本週新增 3,700。

[Open Code Review](https://github.com/alibaba/open-code-review) 用固定流程挑出待檢查的變更與規則，再交模型產出行級意見。專案另支援委派給原本的開發代理執行審查。11 月 22 日 [v1.14.1](https://github.com/alibaba/open-code-review/releases/tag/v1.14.1) 在原生及委派模式加入行為和影響描述。適合要讓 PR 回饋更一致的團隊。

先拿一份已有人工審查結果的小 PR，比較漏報、誤報和行號是否對得上，不立即把模型結果當合併門檻。若使用託管模型，還要核對會送出的程式片段。來源：[README 與執行模式](https://github.com/alibaba/open-code-review/blob/main/README.md#documentation)、[Apache-2.0](https://github.com/alibaba/open-code-review/blob/main/LICENSE)。

## 5. mvanhorn/last30days-skill

累積 72,720 stars，本週新增 4,731。

[Last30Days](https://github.com/mvanhorn/last30days-skill) 從多個社群與公開網路來源收集近期討論，再依主題彙整。11 月 22 日 [v4.6.0](https://github.com/mvanhorn/last30days-skill/releases/tag/v4.6.0) 調整了 TikTok 與 Instagram 留言抓取，將查詢用在最後保留的貼文。適合找線索，例如找出大家遇到的升級問題，再逐一讀發行說明。

來源能否使用取決於環境與 API。社群互動也不等於官方證實。試用時可記錄唯一來源數，以及哪些平台這輪沒有回資料。README 另外說明，配置外部重排服務會傳送搜尋主題和抓到的片段。來源：[README 資料處理](https://github.com/mvanhorn/last30days-skill/blob/main/README.md#data-handling)、[MIT](https://github.com/mvanhorn/last30days-skill/blob/main/LICENSE)。

## 6. ChromeDevTools/chrome-devtools-mcp

累積 58,843 stars，本週新增 2,268。

[Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) 讓開發代理使用 Chrome DevTools 檢查頁面、網路和效能。11 月 11 日的 [1.13.0](https://github.com/ChromeDevTools/chrome-devtools-mcp/releases/tag/chrome-devtools-mcp-v1.13.0) 加入 logpoint 和限定在個別頁面的網路替身，適合重現自己站台在 API 失敗時的畫面。

例如在測試站替換一條資料請求，驗證目前分頁的錯誤畫面與重試，並確認另一個分頁仍使用原本的回應。工具能讀到連線瀏覽器的內容，測試宜用沒有私人帳號的獨立瀏覽器設定。來源：[README 的瀏覽器與資料限制](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/README.md#disclaimers)、[Apache-2.0](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/LICENSE)。

## 7. tradermonty/claude-trading-skills

累積 7,792 stars，本週新增 2,616。

[Claude Trading Skills](https://github.com/tradermonty/claude-trading-skills) 收錄市場摘要、選股篩選器與研究工作流程。這次查核 [GitHub Releases](https://github.com/tradermonty/claude-trading-skills/releases) 未列正式版本，因此只按 README 與 [CHANGELOG](https://github.com/tradermonty/claude-trading-skills/blob/main/CHANGELOG.md) 區分已公開原始碼和未發行紀錄。部分技能需要第三方行情來源和 API 配額。

要研究這組工具，可以固定一份歷史資料、估值日期及來源，測缺值、無法取價和拆股後的輸出。不要讓無法估算的欄位默默變成零。本週點評僅關於資料品質，不是投資建議。來源：[README 的成本及資料來源](https://github.com/tradermonty/claude-trading-skills/blob/main/README.md#what-this-actually-costs)、[MIT](https://github.com/tradermonty/claude-trading-skills/blob/main/LICENSE)。

## 8. ag-ui-protocol/ag-ui

累積 21,195 stars，本週新增 3,620。

[AG-UI](https://github.com/ag-ui-protocol/ag-ui) 定義代理和前端之間傳遞執行狀態、文字片段、工具呼叫及共用狀態的事件，適合想把聊天介面與代理執行端分開的團隊。11 月 21 日的 [release](https://github.com/ag-ui-protocol/ag-ui/releases/tag/release%2F2026-11-21) 為 LangGraph 整合調整執行設定及續跑條件；變更範圍在該整合，不能外推到每個 SDK。

可以只接一個有進度和錯誤的流程，故意從中間斷線，重連後確認畫面不會重複顯示工具結果。協定定義事件，應用仍須決定如何保存或重建狀態。來源：[事件文件](https://docs.ag-ui.com/concepts/events)、[README](https://github.com/ag-ui-protocol/ag-ui/blob/main/README.md)、[MIT](https://github.com/ag-ui-protocol/ag-ui/blob/main/LICENSE)。

## 9. meta/astryx

累積 32,234 stars，本週新增 3,626。

[Astryx](https://github.com/meta/astryx) 再度上榜。React 19 的導入前提與 StyleX 的使用方式見[上週介紹](/blog/github-weekly-2026-11-16/)。本週可看 11 月 20 日 [v0.7.17](https://github.com/meta/astryx/releases/tag/v0.7.17) 的行動介面改動。維護者指出輸入框在手機鍵盤開啟時會保持可見，鍵盤收起後復原捲動位置。

做表單的人可挑一個接近頁尾的輸入欄位，測開鍵盤、送出驗證失敗、關閉鍵盤，再用 Tab 操作一次。這比用產出畫面比對像素，更容易看出新版是否適合既有表單。專案仍標示 Beta。來源：[README](https://github.com/meta/astryx/blob/main/README.md)、[MIT](https://github.com/meta/astryx/blob/main/LICENSE)。

## 10. pookjw/HermesEnabler

累積 2,403 stars，本週新增 461。

[HermesEnabler](https://github.com/pookjw/HermesEnabler) 是改動 Apple Watch 錶面可用性的非官方工具，可作為研究平台相容性限制的案例。11 月 19 日 [1.6.3](https://github.com/pookjw/HermesEnabler/releases/tag/1.6.3) 增列 watchOS 27.2 beta 2；維護者明說不要與 27.3 beta 2 混淆，README 也不支援 watchOS 26。這種組建版本限制比型號或大版本更能解釋為什麼公開示範不一定能重現。

工具修改裝置設定，README 要求刪除程式前先還原備份。建議只從版本紀錄理解相容性，不把它導入日常使用的手錶。來源：[README 注意事項](https://github.com/pookjw/HermesEnabler/blob/main/README.md#cautions)、[MIT](https://github.com/pookjw/HermesEnabler/blob/main/LICENSE)。

## 這週可以先試哪一個

如果手上正修一個前端問題，我會先用 Chrome DevTools MCP 在測試專案重現 API 失敗，看畫面能不能說清楚錯在哪、重試之後有沒有恢復。若難處在於代理反覆漏掉審查意見，則拿同一份小 PR 做 Plannotator 的前後對照，核對修改後能否追到每則意見。兩個實驗都可以先做一次，再決定要不要放進日常工作流。
