---
title: "OpenAI dots 把任務變成持續責任，驗收也得包含停止工作"
description: "整理 OpenAI dots 的首日發布與官方文件，拆解常駐 Agent、唯讀主動研究、委派任務與核准邊界，提供可直接試用的責任契約與停止驗收流程。"
publishDate: 2026-09-30T09:41:03+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 技術選型
series: AI Agent 工程化與工作流實戰
seriesOrder: 36
cover: ../../assets/covers/openai-dots-ongoing-work-control.png
coverAlt: "深藍背景中，暖色光球與三個獨立玻璃容器代表常駐代理及分開管理的任務，前方開關象徵明確的控制邊界。"
---

2026 年 9 月 29 日，OpenAI [發布 dots](https://openai.com/index/introducing-dots/)，把個人 Agent 定位成能持續跟進工作的助手：由 GPT-6 Astra 驅動，有自己的雲端電腦，能使用連接的工具，也會隨互動累積工作脈絡。對工程師而言，值得研究的是我們如何把一次請求交成一項持續責任，以及日後如何確認它真的停下來。

本文整理截至 9 月 30 日的一手文件與發布初期討論。最近 30 天的搜尋窗口，對 dots 本身實際只有發布首日的觀察；目前不足以判斷長期可靠性。以下的產品行為以官方文件為準，試用契約與驗收方法則是我的工程建議，並非 OpenAI 公布的服務保證。

## 先確認你能在哪裡使用 dots

截至 9 月 30 日，官方 [Meet dots](https://learn.chatgpt.com/docs/dots#access) 列出的資格是：Pro 100、200、500 的成年使用者，且不在歐洲經濟區、英國與瑞士；Business Premium 與 Enterprise 則全球逐步推出。Enterprise 預設關閉，需由管理員啟用。符合方案也可能尚未看見入口，不能把逐步推出理解成所有帳號已可使用。

建立 dot 要用桌面 app 或桌面瀏覽器；建立後，行動 app 仍需支援更新，mobile web 不支援。與 dot 的對話不計入 ChatGPT 用量，但它建立或管理的 Work、Codex 任務仍計入各產品限額。這會影響試用評估：記錄它委派了哪些工作，以及那些工作實際消耗的額度，才能衡量持續協作的成本。

## 持續責任需要比聊天請求更完整的交付條件

一般聊天任務可以是「整理這份 bug 清單」。dots 的使用方式進一步變成「持續追蹤這個來源，有新的 bug 時整理、調查並準備修改」。官方[入門文件](https://learn.chatgpt.com/docs/dots/getting-started)說明，它可以追蹤多項責任，也能把工作委派給 ChatGPT Work 或 Codex；使用者可以繼續對話、補充資訊和改變方向。

這讓需求描述需要包含四件事：看哪些來源、產出什麼、何時通知、哪些動作需要另一個決定。少了其中一項，Agent 即使一直執行，也可能只是在持續製造不需要的輸出。

例如，先讓它追蹤測試專案的 bug 回報，產出附來源的摘要與修改建議。把「已整理」、「已測試」、「等待審查」分成不同結果，避免把完成一輪工作當成問題已解決。這也延續本站[長時間 Agent 的靜默失敗](/blog/long-horizon-agent-silent-failures/)討論：背景程序還活著，不能替任務成果背書。

## 主動研究與已授權任務，要分開理解

OpenAI 將主動尋找有用資訊的背景工作稱為 proactive research。[Tasks and memory](https://learn.chatgpt.com/docs/dots/tasks-and-memory)明確區分兩條路徑：主動研究使用有權讀取的資訊、留下私人筆記；已交付的週期任務則可能包含使用者授權的動作。

**唯讀限制適用於 proactive research，不能推成所有背景工作都唯讀。** 主動研究本身不能發送訊息、修改連接的 app，或控制瀏覽器與電腦；後續行動仍受到權限與核准要求約束。另一方面，排程任務可以執行你已授權的工作，其排程和權限另行管理。

這個區分會改變導入方式。你可以先驗證它能否從指定來源找到值得處理的變化，再決定是否交付寫入任務。不要用「它有在背景跑」判斷它目前能做什麼；要查這次工作屬於主動研究、已指派任務，還是固定排程。

同一份文件也提醒，連接 Slack 不會自動建立事件監控任務。服務是否支援事件追蹤、監控哪個事件、何時通知，都需要明確確認。固定時間的工作則應確認已儲存的時區與結束日期。

## Custom rules 不能取代 app 權限

官方[控制文件](https://learn.chatgpt.com/docs/dots/controls)描述，可能影響帳號或分享資訊的行動會先經過自動審查，依指令、權限、自訂規則和內建安全要求，判斷能否執行、需要核准，或必須交由使用者親自處理。要求草擬回覆，並不包含寄出的授權。

Custom rules 提供額外的行動邊界，但不會授予 app 或電腦存取權，也不能覆寫內建安全要求。因此，「連接了 app」、「規則允許寄信」、「這次收件人與內容符合授權」是三個需要分別確認的問題。規則本身也是 Agent 嘗試遵守的指令，官方並未把它描述成不可能出錯的保證。

我的建議是先把對外動作縮小到可檢視的範圍：指定來源、指定產物、指定收件人，再決定是否給持續授權。對客戶訊息、公開發布或刪除資料，先保留審查步驟；等紀錄能回答「為何要做、準備送去哪裡、用了哪些資料」，再評估更寬的授權。

與本站 [Meta Muse 的執行邊界](/blog/meta-muse-agent-permission-boundaries/)相比，dots 這次值得補上的問題是時間：一次允許哪些動作之外，還要決定這份責任維持多久、何時失效，以及停止時是否仍有其他工作存活。

## 一個 Pause 按鈕，不能代表整項責任已撤回

OpenAI 的控制文件將停止操作分開：Pause 停止 dot 當前的主工作；委派出去的任務要在 Activity 中逐一停止；未來的週期執行則要到 Scheduled 停用或刪除。停止工作不會撤回已完成的外部變更。

這是導入常駐 Agent 時應實測的行為。若你交付的是「每天整理回報，必要時調查」，停用時就得同時檢查主工作、委派任務與未來排程。只看對話畫面不再更新，無法證明整項責任已停止。

以下是一份可貼入對話的試用指令；它是責任描述範例，並非產品 API 或機器可強制執行的設定：

```text
未來七天，協助我追蹤測試專案的 bug 回報。
來源：只使用我指定的測試文件與測試頻道。
產出：附來源連結的摘要、重現步驟與修改建議。
動作：先整理與草擬；修改 repository 前先向我提出範圍。
禁止：寄出訊息、刪除資料、合併 PR 或部署。
通知：每天 09:00 Asia/Taipei；需要我決策時可提前通知。
請先確認來源可用、排程已儲存，以及你理解的授權範圍。
第七天結束後，列出仍在執行的委派任務與未取消的排程，讓我逐項檢查。
```

最後一句刻意要求列出剩餘工作。這是驗收設計，不是對自然語言規則的盲目信任。實際停用時仍要打開 Activity 和 Scheduled，確認產品狀態與回報一致。

## 跨頻道記憶增加便利，也增加資料流向的檢查需求

官方 Tasks and memory 文件區分目前對話脈絡、相關 ChatGPT memory 與 dot 自己的筆記。dot 的筆記不是完整逐字稿；更改 ChatGPT saved memory 設定，也不一定改變已留下的 dot 筆記。

ChatGPT、Slack 與 Teams 可以連到同一個 dot，但各自的可見對話仍然分開。私下告訴它的資訊可能影響另一個頻道的工作，卻不因此取得對另一群人揭露的許可。對團隊來說，測試重點是它在使用資訊時，能否維持來源與收件對象的界線。

本機與雲端也要分開驗證。入門文件說明，本機連接需要電腦在線且 ChatGPT app 開啟；連接訊息管道，不會自動授予其他 app 或電腦的存取權。第一次試用不必把全部資料源都接上，先選足以完成任務的一組來源，更容易定位漏讀與過度讀取。

## 首日討論只能提出問題，還不能證明可靠性

在 [r/OpenAI 的發布討論](https://www.reddit.com/r/OpenAI/comments/1wtfsn4/openai_launches_dots_longrunning_agents/)裡，u/Sad_Piglet_4710 留下「bro posted in less than a min.」，研究擷取時獲得 248 次贊同；另一位 u/yeahidoubtit 則問「How is that even any different than passing it as a codex goal/task?」，獲得 118 次贊同。前者捕捉發布瞬間的熱鬧，後者提出值得測試的問題：如果最後仍是 Codex 執行，dots 額外提供的協調是否真的減少人工交接？

[Futurepedia 的首日實測](https://www.youtube.com/watch?v=V_1Vn2WfpEY)展示了主動建議與草稿，但作者說明取得提前試用；單一示範仍不能代表所有帳號或長期表現。發布初期的社群反應同時包含興趣、方案疑問與使用情境的懷疑。這些聲音能幫我們挑驗收題目，卻不能取代長期實測，也不能用整場 DevDay 的不滿推論 dots 的任務成功率。

尤其是「always-on」這種承諾，真正值得測量的是一週之後的結果：它找到多少有效變化、產出多少可用工作、需要多少次更正，以及撤回責任後是否還有殘留任務。少花時間重複交代，只是收益的一半；查核和修正的時間也要算進去。

## 先用七天確認責任能交付，也能收回

選一個測試資料來源，給 dots 七天期限，只允許整理與草擬。每天檢查來源是否正確、產物是否可用、通知是否符合條件。最後暫停主工作、停止委派任務並取消排程，確認三種狀態各自的結果。

下一步再決定是否擴大來源與行動權限。這份文章提出的驗收標準是：交付工作時能說清楚範圍，執行時能看見證據，收回責任時能查出剩餘工作。先證明這三件事，再把更重要的流程交給常駐 Agent。

這些持續責任一旦累積，也會影響更換平台的成本；關於使用者與主要助理之間的默契如何形成，我在[〈AI 的下一場競爭，是成為你不想更換的助理〉](/blog/ai-agent-primary-assistant-switching-costs/)另談競爭與遷移的個人預測。

## 一手資料

- [ChatGPT Learn：Meet dots](https://learn.chatgpt.com/docs/dots)，2026-09-30 查閱。
- [OpenAI：Introducing dots](https://openai.com/index/introducing-dots/)，2026-09-29 發布。
- [ChatGPT Learn：Get started with your dot](https://learn.chatgpt.com/docs/dots/getting-started)，2026-09-30 查閱。
- [ChatGPT Learn：Tasks and memory](https://learn.chatgpt.com/docs/dots/tasks-and-memory)，2026-09-30 查閱。
- [ChatGPT Learn：Control your dot](https://learn.chatgpt.com/docs/dots/controls)，2026-09-30 查閱。
