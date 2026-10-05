---
title: "我為什麼做 AnswerMe：把 Vibe Coding 累積的理解債放回工作流程"
description: "從用 show me 生成本地暫存 HTML 的習慣，談我為何把理解債整理成 AnswerMe skill，以及來源依據、交付格式與解說驗證各自要負責什麼。"
publishDate: 2026-10-05T08:49:08+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 開源專案
  - 軟體品質
series: AI Agent 工程化與工作流實戰
seriesOrder: 61
repositoryUrl: https://github.com/CarlLee1983/AnswerMe
cover: ../../assets/covers/answerme-vibe-coding-understanding-debt.webp
coverAlt: "糾結的深色線團延伸成串連珊瑚色踏石的清楚路徑，一隻手用放大鏡檢查接點，末端仍留有未解的線頭，象徵沿來源補齊理解而不掩蓋未知。"
---

一直使用 vibe coding，我逐漸累積了一種債：程式已經往前走，自己的理解卻沒有一起跟上。

AI 可以完成實作、整理 diff、補上測試，再告訴我做了哪些事。但讀完交付摘要，和能夠判斷這份成果，仍然有一段距離。我可能知道它加了快取，卻還說不清楚快取何時失效；知道它調整了錯誤處理，卻不知道哪個分支會改變使用者看到的結果。

這些是理解落差可能出現的情境。我把這類落差叫作「理解債」：暫時借用了 AI 推進工作的能力，卻還沒有補上自己接手與判斷所需的理解。

[AnswerMe](https://github.com/CarlLee1983/AnswerMe) 就是從這個需求長出來的。我想把「幫我看懂」變成工作流程中可以重複使用的一步，讓自己知道哪些已經有依據，哪些還需要回頭查。

## 從 show me 開始

在做 AnswerMe 之前，我會用「show me」請 agent 生成本地暫存 HTML，協助理解眼前的問題。

這個做法很直接。當一段說明需要在腦中同時保留幾個角色、不同路徑與成立條件，我希望能把它攤開來看。請求從哪裡進來、誰呼叫誰、在哪裡分支，都可以放進同一個閱讀畫面；若改變參數確實有助理解，再加入互動。

本地暫存 HTML 也讓解說可以很輕。它只需要服務當下這個問題，不必為了讀懂一段流程，另外維護一個網站。

但「做成 HTML」仍只交代了形式。它沒有說明應該先讀哪些來源、哪些條件不能省略，也沒有保證我看完就能做判斷。我想留下的，是從理解問題、查找依據到完成解說的做法。這也是我把需求整理成 skill 的原因。

## 程式往前走之後 人還要能接手

理解債容易在下一次修改時浮現。功能可以正常展示，卻不代表我知道它在例外情況下如何運作。等需求改變，原本略過的前提就可能變成新的風險。

我不認為委派實作之後，還必須把每一行程式重新手寫一遍。但人至少要理解會影響決定的部分：這次行為改變在哪裡、依賴什麼條件，以及現有證據能支持多大的結論。

因此，AnswerMe 把問題分成概念學習與成果審視。前者協助理解陌生概念或 repo；後者對照方案、diff、受影響流程與測試紀錄，看懂一次工作改變了什麼。[技能規則](https://github.com/CarlLee1983/AnswerMe/blob/a256d0afb5dffc12e02e19a44e206d57824be437/skills/answer-me/SKILL.md)

例如，探索陌生 repo 時，我需要沿著一條代表性的請求流程，追到實際負責的程式。只列出 controller、service、repository 的目錄，仍然沒有說明一次請求究竟怎麼完成。

這也延續了我在〈[AI 越會寫程式，我們越需要學會抽象](/blog/ai-abstraction-contracts-and-acceptance/)〉的看法：留下足以判斷的關係與條件，未必需要增加更多層。解說也應如此，先找出我卡住的地方，再決定需要多少內容。

## 解說要能帶我回到來源

讓 AI 解釋自己的成果，有一個必須注意的問題：它可能把同一個誤解寫進程式、測試與說明。三份產物彼此一致，仍不足以證明前提正確。

所以我在 AnswerMe 裡要求，關鍵主張附近要有可追溯的依據，包括原文、程式位置或測試紀錄。來源事實、推論、示意資料與實際觀測值要分清楚；讀不到來源，就保留缺口。[技能規則](https://github.com/CarlLee1983/AnswerMe/blob/a256d0afb5dffc12e02e19a44e206d57824be437/skills/answer-me/SKILL.md)

「有測試」也需要拆開看。測試檔存在、測試曾經執行，以及測試通過，是三件不同的事。即使某個案例通過，也只能支持它實際涵蓋的行為，不能順手擴張成整個系統都驗證完成。

這些要求讓解說保留回查的入口。當我看到「這條路徑會回傳 404」，應該能找到對應的處理位置；當我看到「這個限制尚未確認」，也知道下一步要補什麼材料。文字可以簡短，會改變判斷的條件必須留下。

## 格式跟著理解問題走

AnswerMe 保留 HTML、Markdown 與直接對話三種選擇。未指定格式時先詢問；已指定就沿用，單一事實查詢則直接簡短回答。[技能規則](https://github.com/CarlLee1983/AnswerMe/blob/a256d0afb5dffc12e02e19a44e206d57824be437/skills/answer-me/SKILL.md)

HTML 適合把流程、圖解與來源放在一起閱讀。需要觀察條件改變時，才加入控制項。例如用一個明確標示假設的快取延遲模型，調整命中率，看平均延遲如何改變；這仍是解說模型，不能冒充正式系統的量測。

Markdown 適合需要持續編輯、保留差異與版本管理的內容。若問題可以在幾段對話中講清楚，就留在對話裡。我不希望每次追問都變成另一個需要整理的檔案。

選擇 HTML 時，則交付能保存、直接開啟的實際檔案。它的閱讀與互動不依賴 CDN、本機伺服器或執行期網路請求。[README](https://github.com/CarlLee1983/AnswerMe/blob/a256d0afb5dffc12e02e19a44e206d57824be437/README.md) 這保留了過去暫存 HTML 的輕量用途，也避免日後重看時，先得重新準備一套執行環境。

## 漂亮的頁面仍然可能講錯

圖表、動畫與整齊的版面，很容易讓說明看起來完整。但箭頭畫得順，不代表因果關係已經查證；滑桿會動，也不代表模型適用於真實系統。

因此，AnswerMe 要求檢查主張與來源是否一致，並在離線或封鎖網路請求的條件下實際檢查 HTML。若有互動，要操作主要控制項，確認結果與說明一致。只能做靜態檢查時，就清楚說明限制。[技能規則](https://github.com/CarlLee1983/AnswerMe/blob/a256d0afb5dffc12e02e19a44e206d57824be437/skills/answer-me/SKILL.md)

目前 repo 也特別區分：歷史 HTML 範例通過瀏覽器檢查，只能證明那些保存的成果仍符合檢查條件。要評估目前的 skill，仍需用原始材料重新產生答案，再核對語意與成果。[演練說明](https://github.com/CarlLee1983/AnswerMe/blob/a256d0afb5dffc12e02e19a44e206d57824be437/tests/answer-me/README.md)

我在〈[把人能否理解，寫進 Agent 的交付條件](/blog/karpathy-agent-output-human-understanding/)〉談過解說的驗收方式。AnswerMe 把這些要求整理進可重用的技能，但 skill 文件本身不會自動保證 agent 每次都遵守。每次交付仍要看它讀了什麼、做了哪些檢查，以及留下哪些未確認項目。

## 把理解補到能做下一個判斷

AnswerMe 不打算替代完整 code review，也沒有把修改程式納入預設範圍。它聚焦在解說與關鍵證據核對，幫助我判斷接下來要繼續、追問，還是回頭驗證。[技能規則](https://github.com/CarlLee1983/AnswerMe/blob/a256d0afb5dffc12e02e19a44e206d57824be437/skills/answer-me/SKILL.md)

我也不想用「文件產生了」當成理解債已經還清的證據。值得檢查的是，看完之後，我能否說明這次變更的條件，遇到另一個情境時，知道該去哪裡查、還缺什麼證據。

從 show me 的本地暫存 HTML，到現在的 AnswerMe，我想保留下來的就是這個習慣：享受 AI 推進實作的速度，也為自己的理解留下一個可以停下來、查證與補齊的位置。

下一次 agent 交付後，可以先挑一個自己仍說不清楚的問題：「這一步失敗，會影響哪裡？」請它沿著實際流程解釋，附上來源，再回頭核對。若還是不懂，就縮小問題、換一個例子，而不是繼續增加整份文件的篇幅。

## 來源與查核範圍

- [AnswerMe repository](https://github.com/CarlLee1983/AnswerMe)：本文的專案與動機。
- [AnswerMe 技能規則](https://github.com/CarlLee1983/AnswerMe/blob/a256d0afb5dffc12e02e19a44e206d57824be437/skills/answer-me/SKILL.md)：核對本文的能力、交付條件與驗證界線。
- [AnswerMe README](https://github.com/CarlLee1983/AnswerMe/blob/a256d0afb5dffc12e02e19a44e206d57824be437/README.md)：核對本文的能力、交付條件與驗證界線。
- [AnswerMe 演練說明](https://github.com/CarlLee1983/AnswerMe/blob/a256d0afb5dffc12e02e19a44e206d57824be437/tests/answer-me/README.md)：核對本文的能力、交付條件與驗證界線。

資料查核日期：2026-10-05。本文的快取、錯誤處理與延遲模型為解說情境，不是親測成效或正式系統的量測結果。
