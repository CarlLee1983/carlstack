# Git 2.56 Release 核心變更與 Monorepo 擴展深度研究

- 原始來源：[Highlights from Git 2.56 - The GitHub Blog](https://github.blog/open-source/git/highlights-from-git-2-56/)
- 作者：Elijah Newren（GitHub Staff Software Engineer，merge-ort 設計與實作者，git-filter-repo 作者）
- 發布時間：2026-09-28 17:23 UTC
- 研究日期：2026-09-29（Asia/Taipei）
- 目標發布文章：`src/content/blog/git-2-56-monorepo-merge-base-scaling.mdx`

## 去重與既有文章關聯

- 檢查現有代碼庫：`src/content/blog` 與 `docs/article-queue.md` 中無 `git-2-56` 相關文章。
- 現有唯一深入涉及 Git 拓撲遍歷與 Commit-Graph 的文章為 [`src/content/blog/pinterest-git-clone-optimization-commit-graph.mdx`](file:///Users/carl/Dev/Carl/CarlStack/src/content/blog/pinterest-git-clone-optimization-commit-graph.mdx)（探討 Pinterest 透過 `fetch.writeCommitGraph = true` 解決物件協商拓撲遍歷 CPU 100% 瓶頸）。
- 本文將建立站內雙向引用：從 Pinterest 的拓撲協商瓶頸延伸至 Git 2.56 如何在底層演算打破邊界（Paint-down 染色停止條件、Path-walk repack 突破、`git add --resolved` 防禦機制）。

## 一手資料查核與核心技術突破

### 1. 雙向染色提前終止演算法（Exclusive Paint-Down Early Stopping）

- **歷史問題**：在龐大 Monorepo 或分支生命週期長的專案中，計算 `git merge-base`（包含三向合併、three-dot diff `A...B`、PR 差異與 mergeability 檢查）需要從兩端回溯歷史尋找最佳共同祖先。即使找到了候選 merge base，若存在交錯合併（criss-cross merge），Git 必須繼續回溯以確認是否有多個獨立 merge base。過去的終止條件不夠嚴謹，導致 Git 會一路遍歷早已為共同祖先的長尾歷史。
- **Git 2.56 機制**：追蹤佇列中「僅被單側獨佔染色（painted exclusively by each side）」的 Commit 數量。一旦其中一側的獨佔候選佇列耗盡，拓撲上便不可能再誕生任何新的交會點（meeting point），此時演算法可安全且精準地直接退出，保證返回所有 merge base 同時杜絕無效遍歷。
- **基準實測數據**：
  - Linux Kernel：預設 v2 commit-graph 下，`git merge-base --all v4.8 v4.9` 遍歷步數從 167,441 步驟降至 3,887 步，耗時從 0.29 秒縮減至 0.01 秒。
  - 大型生產級 Monorepo 實測：遍歷時間從 0.68 秒降至 0.01 秒，多數場景提速 70 倍，平均提速約 20 倍。

### 2. Path-Walk Repack 伺服器端瓶頸突破（Bitmap 與 Delta Island 解鎖）

- **背景**：傳統 `git repack` 依據檔名雜湊（name hash）聚類計算 delta 壓縮；而 `--path-walk` 依照樹目錄結構遍歷相同路徑的不同版本，往往能取得驚人的壓縮比（例如在 Microsoft Fluent UI 倉庫實測中，pack 體積從 558.5 MB 驟降至 164.4 MB，節省約 71% 儲存空間）。
- **歷史阻礙**：過去 path-walk 無法生成可達性點陣圖（reachability bitmaps，大型伺服器高效回應物件枚舉的核心），且不支援 delta islands（多租戶或分支隔離防護，防止權限物件 cross-delta）。
- **Git 2.56 突破**：
  - 支援為 path-walk repack 選取 Commit 生成點陣圖。後續 `git pack-objects` 可優先重用點陣圖快速回應，僅在必要時退回 path walk。
  - 支援 delta islands 簿記：在選取 delta base 前，將 island 成員資格完整沿 Commit 與 Tree 傳播，在享受極致壓縮的同時確保隔離安全。

### 3. `git add --resolved`：防禦型衝突暫存機制

- **痛點**：工程師在解決 merge 衝突時，傳統習慣使用 `git add -u` 或手動挑選。但 `git add -u` 會不小心暫存工作區內其他尚未要提交的修改；更致命的是，若漏看未清理乾淨的衝突標記（`<<<<<<<`、`=======`、`>>>>>>>`），`git add -u` 仍會盲目將標記寫入 index。
- **Git 2.56 機制**：
  - 僅針對 index 中處於未合併狀態（unmerged status）的路徑生效。
  - **原子級衝突標記掃描（All-or-nothing check）**：在暫存任何檔案前，自動掃描所有未合併文字檔是否存在殘留衝突標記。只要任何一個檔案發現標記，立即報錯中斷，且 index 完全不變。
  - 完美隔離未衝突檔案的本機變更（如 `notes.txt` 不會被意外 staged）。

### 4. 其它核心現代化特徵

- **`git history drop <commit>`**：`git history` 實驗指令系列（2.54 的 reword/split，2.55 的 fixup），直接丟棄指定 Commit 並將子孫 Commit 平滑重播於其父節點，衝突或覆寫本機變更時安全中斷。
- **`git refs` 統一工具箱**：將分散於 `git update-ref`、`git symbolic-ref` 等底層 plumbing 命令收斂為 `git refs create|update|delete|rename`，支援 CAS（Compare-And-Swap）樂觀鎖保護。
- **`git branch --delete-merged 'origin/*' 'topic-*' --dry-run`**：支援批次清理已合併的主題分支，自帶 worktree 鎖定檢查與保護設定。
- **部分複製（Partial Clone）手動減重**：`git repack -a --filter=blob:limit=1m --drop-filtered`，允許開發者手動拋棄本地快取的歷史大 blob，回歸 promisor remote 按需拉取。
- **非線性歷史追蹤修復**：`git log --follow` 為每個 parent 獨立記錄路徑，解決過去全域單一路徑導致子樹合併或錯序時的追蹤斷裂問題。
- **內部 O(N²) 階梯消除（Scaling Cliffs Removal）**：Reftable 寫入鎖定後避免多餘 reload（檔案 stat 複雜度由 O(N) 降為 O(1)）；載入新 packfile 移除前置線性掃描（消除導致 prompt 卡頓 4.5 秒的 O(N²) 迴圈）；Chromium 50 萬索引項下特定的 `git diff` 從 8 分鐘縮減至 0.07 秒。
