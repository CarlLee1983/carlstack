---
title: "Google Skills 遷移：按帳戶確認時程，逐項驗收指令與檔案"
description: "核對 Gems 轉 Skills 的帳戶差異、Workspace 延後推出與不互通限制；將遷移拆成指令、知識檔案、工具及自動化流程的驗收。"
publishDate: 2026-10-01T12:25:00+08:00
updatedDate: 2026-11-05T19:16:00+00:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 系統設計
  - 技術選型
series: AI Agent 工程化與工作流實戰
seriesOrder: 46
cover: ../../assets/covers/google-skills-markdown-gems-migration.jpg
coverAlt: "模組化半透明卡片刻印著 Markdown 結構，透過精細的定位銷整齊堆疊滑入發光的統一控制主機，呈現多個 SKILL.md 在單一對話介面中動態組合的架構。"
---

把 Gem 的指令複製成 Skill，並不代表原本的工作流程已完成遷移。團隊還要確認帳戶類型、知識檔案、可用工具、分享權限，以及自動化是否仍引用舊步驟。

Google 的 [2026 年 9 月 30 日公告](https://workspaceupdates.googleblog.com/2026/09/skills-gemini-app-workspace.html)將 Skills 定義為可在對話中重用、組合的指令，採 Markdown 原生的 `SKILL.md` 格式。相較於另外開啟 Gem，可在同一提示中使用多組指令，是值得評估的工作方式；但不應由此推論任何格式欄位都能跨平台執行，或權限會隨檔案一起移轉。

本文於 2026 年 11 月 5 日查核。先前把預定日期寫成確定停用日，並把產品不互通解釋成「物理級硬隔離」，都需要更正。

## 先區分帳戶，再安排截止日期

### 個人 Google 帳戶

依目前的 [Gemini Apps 遷移說明](https://support.google.com/gemini/answer/18560919?hl=en)，18 歲以上個人帳戶的 Gems 預定在 2026 年 11 月 17 日轉為唯讀，不能再使用、編輯或新增；12 月 17 日移除。未滿 18 歲的時程另行公布。

這與企業帳戶的「移到 Settings 後仍可使用」不同，不能共用一張未標帳戶類型的時間表。個人使用者應在移除前備份仍需要的檔案，不能只等系統自動處理。

### Workspace 商務、企業與教育帳戶

[Workspace 管理員指南](https://knowledge.workspace.google.com/admin/generative-ai/gemini-app/about-the-transition-to-skills)保留兩個最早停用門檻：商務與企業不早於 2027 年 3 月 1 日，教育不早於 6 月 1 日。到停用階段，Gems 無法建立、編輯或使用，既有 Ask a Gem 流程停止，剩餘 Gems 轉為 Gemini app 的草稿 Skills。非營利帳戶的月份資訊可參照上述 Gemini Apps 說明。

**「不早於」不是保證當天完成切換。** 專案可以用這些日期倒推內部驗收時間，但真正切換前仍須確認管理員公告與帳戶介面。

## Workspace 推出時程已延後

9 月公告原列 Workspace 從 10 月 5 日開始推出。Google 在 [10 月 13 日更新](https://workspaceupdates.googleblog.com/2026/10/an-update-on-launch-of-skills-in-gemini-app-and-workspace.html)改為 Workspace 延後，待確認後再提供新時程；Gemini app 則從 10 月 13 日分批推出，當時預計 11 月中旬完成。

截至本文查核，這份更新仍標示 Workspace rollout 延後。因此「公告有功能」「帳戶已出現功能」「既有工作流驗證通過」必須分開記錄。不要只看舊日期，就刪除仍在使用的 Gem 或替換正式流程。

## 不同步是產品限制，不能推定底層安全架構

官方公告明確說明，Gemini app 與 Workspace 的 Skills 目前不會自動同步，跨兩端使用需要分別建立。公告未把原因定義為實體儲存隔離，也沒有證明所有 Gemini app 都是消費者帳戶。工作或學校帳戶同樣可能使用 Gemini app。

我的建議是把指令檔視為待審查的輸入，而非存取授權。即使檔案寫著「讀取 Drive 中的財務資料」，也不表示平台會授予權限。跨帳戶複製前，應先確認文件能否分享、接收端是否屬於同一組織，以及資料政策是否允許；不要為了保持版本一致就自動把企業資料同步到個人帳戶。

## 遷移時逐項驗收，避免只看指令文字

目前 Gemini Apps 文件列出檔案總量 100 MB 的限制，超限自動遷移可能移除較大的檔案，部分類型不支援；某些 Gems 工具也尚未在 Skills 提供。可攜格式不等於功能完全相同，實際清單應以[當期說明](https://support.google.com/gemini/answer/18560919?hl=en)為準。

以下是本文建議的遷移檢查清單：

1. **指令**：保留原始內容，另建 Skill 測試。用同一輸入比較輸出格式、禁止事項與需求遺漏，不以語氣相似當作通過。
2. **檔案**：建立名稱、大小與必要用途清單，逐項比對移入結果。遇到不支援格式時先保留原件，再選擇允許的轉檔方式。
3. **工具**：列出流程真正依賴的工具，確認新入口能完成相同動作。不能因為指令成功匯入，就假定研究、圖像或其他功能同樣可用。
4. **自動化**：盤點 Ask a Gem 的輸入、輸出與下游依賴，先在測試流程驗證替代步驟。官方已停止讓新流程加入該步驟，既有流程的退場也必須納入計畫。
5. **多技能組合**：測試兩組指令互相衝突的情境，例如一組要求精簡、另一組要求逐項揭露。將處理原則寫清楚，不把同時載入誤認為必然一致。
6. **回退與負責人**：記錄每份 Skill 的擁有者、測試日期、帳戶與平台。尚未通過驗收的流程保留替代操作方式，避免在截止日前才發現資料缺漏。

先選一個低風險、高頻率的 Gem，完成上述驗收，再擴大遷移。原文的 [Google Blog 首頁](https://blog.google/)保留作為新聞入口，實際日期與功能限制請使用本文的直接來源。
