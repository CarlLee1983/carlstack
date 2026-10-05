# Matt Pocock × Lauren Tan（poteto）訪談深度逐字查核

- 原始訪談 URL：https://www.youtube.com/watch?v=MN9dGgmLyso
- 主持人：Matt Pocock
- 受訪者：Lauren Tan（@poteto，Cursor / pstack / Grok Bot 作者，前 Meta React 團隊）
- 訪談主題：LIVE: Poteto (creator of pstack) on shipping 1,000's of PR's a month at SpaceX / Cursor
- 訪談時長：1 小時 05 分 34 秒
- 查核日期：2026-10-05（Asia/Taipei）
- 對應更新文章：`src/content/blog/agent-work-requires-verifiable-codebase.md`（updatedDate: 2026-10-05T10:35:00+08:00）

## 去重與既有文章關係

- 本訪談最初由社群（如 Michael Guo @Michaelzsguo）於 2026-10-02 發布摘要，文章曾進行初步補充；但先前研究標註「未取得可逐字核對的完整訪談稿」。
- 本次研究透過 `yt-dlp` 完整下載並清洗原訪談英文字幕逐字稿（共 3,410 行對話片段），進行了全鏈路深度研讀。
- 本篇補充並深化了先前未完整展開的三大工程核心機制：
  1. **品管抽樣 vs 阻斷式審查（Sampling vs. Blocking Review）**：如何以統計抽樣取代逐行 Review，並藉由軟體工程的高度程式化可驗收性（將大部分變更視為雙向門 Two-way doors）突破 PR 吞吐量瓶頸。
  2. **黑燈工廠（Dark Factory）的真實樣貌**：澄清其與 Karpathy「忘記程式碼存在」之 Vibe Coding 的本質差別。自治必須依賴高強度 Fuzzing 驗證 Agent 與剛性環境邊界。
  3. **技能的本質（Process Materialized into Words）**：技能不是實作程式碼的固定樣版，而是可被壓縮、重組與下沉為 Lint 規則的思考步驟。

## 核心時間軸與一手對話要點

1. `[00:00:00 - 00:06:00]` **起源與血肉代理（Meat Proxy）**：
   - Lauren 離開 Meta 後因 burnout 開發 side project（GitHub `poteto/noodle`），探索如何萃取自己的工作流給 Agent。
   - 加入 Cursor 後負責 Agents Window（內部代號 Glass），手動分析 Flame Graph 與 Heap Snapshot 成為交付瓶頸，意識到自己只是「肉身代理」。
2. `[00:11:00 - 00:15:00]` **米其林廚房隱喻（Michelin Kitchen）**：
   - 劃掉「軟體工廠」，改用米其林廚房：強調工藝與最終品質。總主廚負責動線、備料規範、出餐標準與培訓，即使端上桌的料理非主廚親手炒，責任仍在主廚。
3. `[00:16:00 - 00:25:00]` **可重跑驗證（Verification as the Anchor）**：
   - 驗證技能是攀登信任階梯的唯一鑰匙。
   - 將重複動作封裝為 Deterministic CLI，減少上下文膨脹並避免 Agent 每次隨機發明腳本。
4. `[00:33:00 - 00:45:00]` **2,500 PR 的雙迴圈運作（Outer vs Inner Loop）**：
   - 外迴圈（Grok Bot）：連接 Slack / X / Sentry，進行外部問題分流。
   - 緩衝區（Buffer / Chief of Staff）：不對每個 Bug 立即派工，先記錄聚類，找出根本原因後再交由內迴圈（Cursor Projects / Coordinator Agent）處理。
5. `[00:49:00 - 00:55:00]` **抽樣審查與夜間黑燈工廠**：
   - 阻斷式逐行審查在規模化時必死；人類改當品管主管進行抽樣，每發現壞味道便新增 Lint / 型別守衛。
   - 夜間 Autopilot 啟動驗證 Agent，進行真實執行與隨機操作 Fuzzing，修復直到通過後自動合入。
6. `[00:59:00 - 01:05:00]` **技能本質論**：
   - 技能是語言化、物質化的工作流程；歷史對話與糾正是專案提煉技能與規則的最佳素材。
