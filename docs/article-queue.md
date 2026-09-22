# 待整理文章佇列

只放還沒寫成正式草稿的題目，依處理順序由上往下排列。

## ⏳ 排隊中

### 系統設計（System Design）專題候選庫

> 詳細來源分類與完整大綱規劃請見 [docs/research/system-design-resources-backlog.md](docs/research/system-design-resources-backlog.md)

- [ ] **[待完善撰文] 生產級 ML 系統架構：特徵存儲（Feature Store）與線上即時推理管線**
- [ ] **[待完善撰文] 全球多活架構（Multi-Region Active-Active）：跨洲資料同步與衝突消解**
- [ ] **[待完善撰文] 分散式共識深度拆解：Raft 與 Multi-Paxos 演進及常見工程陷阱**

---

### 系列：Agent 時代的代碼庫設計哲學（Codebase Design for AI Agents）

> 深入探討 Matt Pocock 與開源社群將 pre-AI 架構實踐（Deep Modules、Seams、Adapters、DDD、Vertical Slices）轉譯為 AI Agent 工程防線的完整系列。

- [x] **第 1 篇（已發布）：** [當 Vibe Coding 撞上軟體熵增：為什麼 Matt Pocock 重申 Deep Modules 與 DDD 才是 AI 時代的護城河？](file:///Users/carl/Dev/Carl/CarlStack/src/content/blog/deep-modules-vibe-coding-architecture.mdx)（心智模型、架構即 Prompt、軟體熵增防禦）
- [x] **第 2 篇（已發布）：** [別讓 Agent 偽造世界：如何用 Seam 與 In-Memory Fake 終結 AI 的 Mock 地獄？](file:///Users/carl/Dev/Carl/CarlStack/src/content/blog/seams-adapters-fake-testing.mdx)（Michael Feathers 接縫哲學、Replace-don't-layer、雙 Adapter 準則、In-Memory Fake 取代脆性 Mock）
- [x] **第 3 篇（已發布）：** [消滅 Agent 的語義漂移：從 CONTEXT.md 到防禦型規格工作流](file:///Users/carl/Dev/Carl/CarlStack/src/content/blog/domain-modeling-context-spec.mdx)（DDD 通用語言、純度控制、Sharpen Fuzzy Language 追問防線、輕量化 ADR 準則）
- [x] **第 4 篇（已發布）：** [給 Agent 一把手術刀：垂直切片架構（Vertical Slices）與小表面積測試](file:///Users/carl/Dev/Carl/CarlStack/src/content/blog/vertical-slices-tracer-bullets.mdx)（打破三層架構跳檔困局、單一完整功能路徑、Interface as Test Surface、無副作用純淨介面）
- [ ] **第 5 篇（排隊中）：** 《防止專案變成大泥球：設計 Agent 的「淺模組審查」與架構除熵迴圈》（自動化 Deletion Test、模組加深工作流、架構師從寫程式轉為架構邊界審查者）

---

#### 參考來源庫

- `donnemartin/system-design-primer`
- `ByteByteGoHq/system-design-101`
- `karanpratapsingh/system-design`
- `ashishps1/awesome-system-design-resources`
- `binhnguyennus/awesome-scalability`
- `madd86/awesome-system-design`
- `checkcheckzz/system-design-interview`
- `chiphuyen/machine-learning-systems-design`
- `systemdesign42/system-design-academy`
- `mattpocock/skills` (codebase-design, domain-modeling, ddd-dci-module-builder)
