---
title: "Google Skills 取代 Gems：從孤島助理走向 SKILL.md 堆疊與企業遷移時程"
description: "Google 宣布以模組化 Skills 取代 Gems，採 SKILL.md 開放規範。拆解同一對話疊加多組技能的運作機制、Workspace 與 Gemini App 資料邊界隔離原因，以及 2027 企業停用時程的遷移策略。"
publishDate: 2026-10-01T12:25:00+08:00
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

自自訂 GPTs 與各家自訂助理興起以來，企業與開發者最常遭遇的架構痛點，就是「**孤島式助理（Siloed Assistants）**」：每一次需要不同領域的專業指令時，使用者必須開啟一個全新的獨立視窗；原本對話中建立的上下文、資料與歷史推論瞬間歸零，無法在不同能力之間無縫流轉。

[Google 於 2026 年 9 月 30 日發布公告，正式推出具備可重用、可組合特性的 **Skills** 機制，並確立了全面取代既有自訂助理 **Gems** 的完整生命週期規劃](https://blog.google/)。

我的判斷是：**Skills 取代 Gems 不僅僅是一次產品功能的改名，而是 AI 交互架構從「封裝成單一靜態 Agent 外殼」，轉向「以標準化文檔（`SKILL.md`）動態組合上下文插件」的典範轉移。然而，Workspace 企業端與 Gemini App 消費者端現存的資料隔離邊界，是導入團隊在短期內必須正視的維護成本。**

## 遷移時間表：商務企業版 2027 年 3 月退場

Google 公布的分階段遷移與 Sunset 時程涵蓋未來半年至兩年的關鍵節點：

- **2026 年 9 月 30 日（即刻生效）**：
  正式公布 Skills 架構。Workspace Studio 流程中即日起**凍結新建**包含「Ask a Gem」步驟的自動化工作流（既有 Flow 暫時仍可執行）。
- **2026 年 10 月 5 日**：
  Skills 開始分批向 **Google Workspace** 商業與企業用戶推送（預計 11 月中旬完成全量部署），覆蓋 Gmail、Docs、Slides、Drive 與 Chat 的側邊欄與對話工具。
- **2026 年 10 月 13 日**：
  Skills 開始向 **Gemini App**（消費者版 gemini.google.com）分批推出。
- **2026 年 11 月 17 日**：
  個人帳戶的 Gems 管理入口移至 Gemini App 的「設定（Settings）」面板中，維持可編輯直至最終棄用。
- **2027 年 3 月 1 日（企業版退役門檻）**：
  **商務、企業版與非營利組織**客戶完全停用 Gems。Gems 將無法建立或執行；未手動遷移的既有 Gems 將由系統自動轉換為草稿狀態的 Skills（Draft Skills）。
- **2027 年 6 月 1 日**：
  **教育版客戶**完全停用 Gems，進入自動轉為 Draft Skills 的 Sunset 流程。

## 核心機制拆解：SKILL.md 規範與多技能堆疊（Skill Stacking）

與過去閉源且黑盒的 Gems 相比，全新的 Skills 全面擁抱開放的 **`SKILL.md`** 規範（與當前 Agentic 開發生態廣泛使用的標準格式相容）：

### 1. 文檔即規格（Skills-as-Code）

每個 Skill 由結構化的 Markdown 檔案定義：

- **YAML Frontmatter**：包含 `name`（技能名稱）、`description`（技能語義描述，供模型自動路由判定）、觸發意圖與存取權限。
- **Instruction Body**：定義具體的行為規範、邊界條件（Guardrails）、少樣本範例（Few-shot Examples）以及相關聯的知識庫檔案。
- **協同編輯**：在 Google Docs 內建「Skill Builder」，團隊能像編輯普通文件一樣對指令進行版本控制、審閱與權限共享。

### 2. 同一對話內的多重堆疊（Skill Stacking）

過去使用 Gems 時，你無法讓一個專門做「品牌口吻校正」的 Gem 和一個負責「財務資料稽核」的 Gem 協同工作。
Skills 採用了行內模組化設計：

- **快捷召喚**：在對話框中輸入 `/` 即可喚出 Skills 清單（例如 `/brand-voice`、`/security-audit`）。
- **推論期動態注入（Dynamic Context Injection）**：在單一 Prompt 內可同時指定多個 Skills。例如輸入：`請審閱這份 API 遷移規劃 /architecture-review /compliance-check`。系統會在執行期將兩個 Skill 定義的約束規則同時動態注入到 Context Window 中，實現跨領域的複合推理。

## 雙軌分立的現實：為什麼 Workspace 與 Gemini App 不互通？

目前許多使用者最困惑的現象是：在 `gemini.google.com` 建立的 Skill，無法在 Workspace（如 Google Docs）中調用，反之亦然。這並非單純的工程延遲，而是背後嚴密的資安架構邊界所致：

- **企業租戶資料隔離（Enterprise Trust Boundary）**：
  Workspace 運行於嚴格的 Enterprise Tenant 隔離邊界內，承諾不使用客戶資料訓練基礎模型，具備 SOC2、ISO 認證與組織管理員（Admin Console）審計控制。Gemini App 消費端則遵循通用帳戶協議。為了杜絕企業機密意外跨界流出，兩者的存取控制與儲存層實施了物理級硬隔離。
- **Workspace Graph 權限與 RBAC 差異**：
  Workspace 內的 Skills 深度整合了企業的內部圖譜（可直接穿透讀取受權限保護的 Drive 檔案、內部郵件與行事曆）；個人版 Gemini App 缺乏企業級的身份驗證上下文與組織級別的權限委派。

## 企業與個人的遷移實務建議

面對即將到來的 Sunset 時程，建議團隊採取以下三步因應：

1. **盤點 Workspace Studio 自動化工作流**：
   檢查現有自動化 Flow 中是否包含「Ask a Gem」步驟。由於新步驟已被凍結，應及早將其邏輯重構為 `SKILL.md`，並改為呼叫共用 Skill 的新版提示步驟。
2. **提早將 Gems 指令「代碼化」**：
   不要等待 2027 年 3 月系統自動轉為「Draft Skills」。建議將高頻使用的 Gems 核心 Prompt 與參考資料手動備份，整理為符合標準的 `SKILL.md`，納入 Git 或 Google Docs 統一維護。
3. **短期內維持雙邊維護策略**：
   若團隊成員同時在個人工作區與企業 Workspace 協同，建議建立跨儲存庫的同步腳本，將單一來源的 `SKILL.md` 分別發布至兩端，避免邏輯版本分歧。

從閉門造車的獨立聊天外殼，到開放可攜的 `SKILL.md` 規格，Skills 的到來宣告了 Prompt 資產正式邁向模組化與版本化的成熟工程階段。
