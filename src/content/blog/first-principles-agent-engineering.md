---
title: "能用 CI 與 Hook 鎖死的規則，絕不留在 Prompt 裡：從第一性原理談 AI 工程邊界"
description: "從亞里斯多德形式因到 Nancy Leveson 系統控制論，剖析為什麼「在 Prompt 裡千叮嚀萬囑咐」是軟體工程的幻覺，並示範如何以靜態防線、沙盒與動態控制迴圈重塑 AI Agent 工作區。"
publishDate: 2026-09-29T14:48:00+08:00
draft: false
featured: false
tags:
  - "AI 工程化"
  - "AI Agent Workflow"
  - "系統設計"
  - "軟體品質"
  - "架構方法論"
series: "哲學視角下的系統分析與軟體設計"
seriesOrder: 8
cover: "../../assets/covers/first-principles-agent-engineering.jpg"
coverAlt: "金屬幾何核心立於嵌入電路契約的黑曜石底座，外部雜亂的文字煙霧被四周厚實的鋼化防護玻璃與機械鎖扣嚴密阻隔。"
---

在 AI 輔助開發的日常中，許多工程師的 Prompt 越來越像一本寫滿無奈的《員工守則》：

> 「請務必遵守 TypeScript strict 規範；不要修改 `src/legacy` 目錄下的任何檔案；每次改動後必須跑測試；產出 commit message 時不要使用任何 emoji；請絕對不要刪除既有的資料庫 migration……」

當 Agent 再次無視這些叮嚀，把未經格式化的程式碼直接 push、順手改了歷史 migration 時，開發者常見的直覺反應通常是：**把 Prompt 寫得更長、字氣加重，甚至加上三個驚嘆號。**

這種直覺正是當前 Agent 工程化最大的反模式。

社群近一個月在 AI 工作區工程（AI Workspace Engineering）與系統安全討論中重新聚焦「第一性原理」（First Principles）。其核心結論犀利而冷酷：**如果一項約束能被程式碼、Linter、Git Hook、權限系統或 CI 強制執行，就絕不該把它留在不可靠的模型 Prompt 裡。**

## 亞里斯多德形式因與 Nancy Leveson 的控制迴圈

什麼是軟體系統的第一性原理？

在亞里斯多德的《形而上學》（_Metaphysics_, V.2, 1013a）中，第一原理（First Principle / _archē_）被定義為事物最根本、不可再化約的起點或原因。在古典因果四因說中，**質料因（Material Cause）**是構成事物的原始質料，而**形式因（Formal Cause）**則是賦予事物結構、邊界與法則的原型。[《形而上學》V.2，Ross 英譯本](https://classics.mit.edu/Aristotle/metaphysics.5.v.html)

將此鏡頭移至現代軟體系統：LLM 本質上是具備機率性與高熵特質的**認知質料**。它擅長模式匹配、文字變換與探索性推理，但物理上無法提供確定性的狀態保證。如果工程師試圖用「文字建議」去充當系統的「形式邊界」，就等於期待水流自己維持立方體的形狀，而拒絕搭建水槽。

更進一步，麻省理工學院系統安全專家 Nancy Leveson 在經典著作《_Engineering a Safer World_》中顛覆了傳統組件可靠性理論。她指出：**安全（Safety）與可靠性並非系統元件的原生屬性，而是一種由整個系統的動態控制結構（Hierarchical Safety Control Structure）所維持的湧現特質（Emergent Property）。**當系統缺乏能夠即時偵測偏差、強制施加限制的反饋控制迴圈時，事故必然會在組件各自正常運作的表象下發生。[《Engineering a Safer World》，第 2 章與第 4 章](https://mitpress.mit.edu/9780262533690/engineering-a-safer-world/)

這兩套思想交匯於現代 AI 系統工程，推導出一條極窄且不可妥協的工程邊界：

> [!IMPORTANT]
> **Prompt 負責提供探索與任務的「意圖上下文」，而 Harness、作業系統與 CI 負責鎖死「物理世界的形式因」。**可靠的 Agent 系統不是「教導出來的乖學生」，而是「受限於反饋控制迴圈的受控狀態機」。

## 三層約束模型：從易碎的文字轉向鋼鐵護欄

要讓 AI 工作區具備第一性原理的穩固性，我們必須將所有對 Agent 的要求，依照執行邊界的物理特性嚴格拆分為三層：

### 1. 物理隔離層（作業系統與檔案權限）

禁止 Agent 碰觸敏感目錄，不應是 Prompt 裡的一句「請繞開」，而應直接依賴作業系統層級的檔案權限或唯讀掛載。

- **邊界機制**：使用容器（Docker / Podman）、Linux chroot、沙盒（Seatbelt / bubblewrap）或檔案權限 `chmod -R a-w src/legacy`。
- **失效行為**：一旦 Agent 嘗試寫入，作業系統層級立即回傳 `EACCES: permission denied`，截斷任何幻覺可能。

### 2. 靜態門禁層（本機 Hook 與型別系統）

格式規範、命名風格、程式碼壞味道與型別完整性，是靜態分析器（Static Analyzers）的絕對領域，絕不浪費 Prompt 的 Context Window 與模型的注意力。

- **邊界機制**：Git `pre-commit` Hook、Biome / ESLint、`tsc --noEmit`、Git commit-msg 檢查腳本。
- **失敗代價**：在本地階段即時阻擋（Fail-Fast），Agent 收到精確的錯誤行號與 Linter 輸出，形成封閉的「修改—編譯失敗—修正」自癒迴圈。

### 3. 動態控制迴圈（CI 流水線與金鑰隔離）

涉及外部世界副作用（例如部署、刪除雲端資源、推送至生產分支）的行為，必須導入 Leveson 的控制理論，由獨立的評估者（Evaluator）把關。

- **邊界機制**：GitHub Actions PR Gate、無 Secrets 的執行環境、限制存取路徑的假物件（In-Memory Fake）、需人工審批的權限閘門。
- **驗收準則**：Agent 永遠不能核准自己的 Pull Request，變更只有在全套回歸測試通過時才能被 Merge。

## 最小實踐範例：從口頭警告到 Hook 執法

以「禁止直接修改資料庫遷移歷史」為例，看看這兩種工程範式的巨大落差。

### 脆弱的 Prompt 模式（反模式）

```markdown
# AGENTS.md (脆弱的防線)

重要提醒：

1. 資料庫 migration 位於 `prisma/migrations`，請千萬不要修改既有的 migration 檔案！
2. 如果需要更動 schema，請一定要建立新的 migration。
3. 違者將導致生產環境資料庫 checksum 不合，造成嚴重停機！
```

當任務情境變得複雜、Token 達到數萬時，模型隨時可能遺忘這段規定，或者為了讓當前測試通過而直接去修改舊 migration。

### 第一性原理的 Git Hook 防線（推薦實踐）

我們在 `.git/hooks/pre-commit`（或透過 Husky / Lefthook）建立明確的檔案狀態檢查：

```bash
#!/usr/bin/env bash
set -euo pipefail

# 檢查是否有任何既有的 migration 檔案被修改或刪除
MODIFIED_MIGRATIONS=$(git diff --cached --name-status | grep -E '^[MD]\s+prisma/migrations/' || true)

if [ -n "$MODIFIED_MIGRATIONS" ]; then
  echo "❌ [Security Gate Error]: 檢測到既有 migration 被修改或刪除！"
  echo "$MODIFIED_MIGRATIONS"
  echo "依據架構規範：歷史 migration 具備不可變性。請建立新的 migration 檔案，禁止變更歷史。"
  exit 1
fi
```

當 Agent 試圖修改舊 migration 並執行 `git commit` 時，Git 直接報錯中斷。錯誤訊息不是模糊的人格化建議，而是不可跨越的系統錯誤。Agent 自然會讀取 stderr，放棄修改舊檔，轉而正確建立新 migration。

## 邊界清單：什麼該留在哪裡？

在日常開發中，可用下列檢核清單審視專案的 `AGENTS.md` 或 System Prompt，將規則逐步「下沉」：

- **必須下沉至 Tool / Hook / CI 的規則**：
  - 語法與格式（Prettier、Biome、Linter）
  - 型別安全與公開介面相容性（TypeScript、Rust Compiler）
  - 目錄與敏感檔案存取限制（沙盒權限、唯讀掛載）
  - 分支保護與變更核准（Branch Protection Rules、CODEOWNERS）
  - 測試覆蓋率與不變量檢查（Unit Tests、Mutation Tests）
- **才能留在 Prompt / Task Contract 的內容**：
  - 商業需求的取捨優先級（例如：優先考量讀取效能而非即時一致性）
  - 探索方向與架構風格指導（例如：採用 Functional Core, Imperative Shell 結構）
  - 具體任務的驗收條件與成功定義（Acceptance Criteria）
  - 未被代碼形式化的領域背景與隱性知識（Domain Context）

## 結論：讓模型專注於推理，讓系統守住秩序

當我們要求 AI 模型去擔保程式碼的格式、不可變性與安全邊界時，我們實際上是在犯下「工具錯配」的哲學謬誤——用最昂貴且機率性的神經網路，去執行最廉價且決定性的布林邏輯。

第一性原理提醒我們：**不要在沙灘上雕刻法典，然後祈禱浪花不會將它抹平。**

把沙灘圍上堤防，把邊界鑄進鋼筋。當你的 Git Hook、Compiler 與 CI 能夠毫不留情地拒絕一切不合格產物時，你的 AI Agent 才能卸下多餘的恐懼與冗長的防禦性 Prompt，真正釋放出強大的創造與推理潛能。
