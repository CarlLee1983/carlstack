# Deepagents 0.7.22 skill tools 查核

- 查核日期：2026-10-06，文章系列 AI Agent 工程化與工作流實戰 66，由整合者分配
- 文章：`src/content/blog/deepagents-skill-tools-runtime-boundaries.md`
- 主張：按需揭露須連同對話壓縮後撤銷、執行前重算與跨身分隔離驗收；不把 skill 已讀當成授權或全文理解
- 範圍：原始碼與官方測試閱讀；未安裝、未執行 upstream 程式、未連 MCP、未量 token／延遲／cache

## 去重與差異

在 blog、research、article queue 搜尋完整來源 URL、deepagents、6552、0.7.22、include_tools，無同源文章。另讀 Uber MCP Gateway controlled rollout 與 pstack first verifiable workflow：前者處理工具發布控制，後者處理安裝及修復驗收；本篇新增單一對話內 skill read → schema disclosure → execution gate → compaction withdrawal 的具體 SDK 契約。新文已有指向兩篇的內鏈；反向連結與 queue 僅交整合者處理。

## 一手來源與核對

1. Release：<https://github.com/langchain-ai/deepagents/releases/tag/deepagents==0.7.22>
   - 頁面標示 05 Oct 14:07；tag commit 短 SHA dcba425
   - 功能 commit 92cd8e7，PR #6552
   - 同版另修覆寫文字 stale encoding，本篇不展開
2. PR：<https://github.com/langchain-ai/deepagents/pull/6552>
   - 10/2 merged，release 為10/5；兩者不混寫
   - tools 設在 SkillsMiddleware；resolver 支援一個名稱映射 MCP 工具群與 Runtime context 選工具
   - OpenAI 路徑說明最低 langchain-openai 1.6.5；tag測試依賴已提高，正文分開說明
3. 固定版本 middleware：<https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/deepagents/middleware/skills.py>
   - GitHub contents blob SHA 32b51db758461cce0bfeabed5cc855d11b1c22a9
   - SkillToolResolver：已讀取群組在每次 model call 與 tool execution 前解析
   - 同一 resolver 被多個 thread 使用；cache 要依 runtime context 隔離
   - `_skill_tools_disclosed` 每次模型呼叫寫入，即使空集合
   - `_with_disclosed_skill_tool` 若 resolver 不再回傳對應名稱，保持 request 未綁 tool，交 tool node 回 invalid
   - `wrap_tool_call` 若 request.tool 已存在，不由本 gate 阻擋
   - 手動 composition 放 summarization/routing 之後、prompt caching 前
4. 固定版本 helper：<https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/deepagents/middleware/_skill_tools.py>
   - blob SHA 76bfaea11af71ef1759f5f5ae8f1198e8a42f15e
   - `_find_skill_reads` 配對 read_file call 與非 error ToolMessage；任意 offset/limit、後續截短皆算
   - `_classify` 已註冊同名工具優先；agent deferred tools 可被提早揭露但不 gated
   - inline provider selection 使用型別、模型前綴與 Responses API flag，其他路徑 bind tools
   - helper 內 private functions 只用來說明查核位置，未推薦讀者依賴 private API
5. 官方測試：<https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/tests/unit_tests/middleware/test_skill_tools.py>
   - 讀取前、同回合讀取與呼叫、compaction、checkpoint record、部分讀取、deferred 與同名工具的行為都有測試
6. Resolver測試：<https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/tests/unit_tests/middleware/test_skill_tool_resolver.py>
   - 工具群、最後一個／多個讀取 anchor、resolver 不再回工具、model/tool time Runtime、async入口、例外傳播皆有測試
   - 跨 tenant cache驗收為本文建議，不假稱已被官方生產驗證
7. 依賴：<https://github.com/langchain-ai/deepagents/blob/deepagents==0.7.22/libs/deepagents/pyproject.toml>
   - version 0.7.22，Python >=3.11,<4
   - test dependency langchain-openai >=1.6.7,<2

## 作者設計與停止規則

- 使用唯讀 issue group做第一輪，不把部分讀取等於全文理解
- 骨架中的 policy、tools_for_identity 為應用介面，未聲稱SDK API；明標不可直接執行
- 可信身分由應用 authentication注入，不來自模型自填prompt
- schema cache與動態政策決策分離，實際執行端繼續驗證資源授權
- 六案例除了schema清單還查 tool execution count
- 已開始副作用與遠端取消不在 skill gate撤銷保證內
- 跨身分沿用或未揭露工具仍執行，停止擴大接入

## 封面方向與驗收

比較基準（生成前已實際看圖）：

- pstack：工具治具、厚塗／立體工作桌、俯視橫向、鈷藍橘、硬光
- Uber MCP：陶瓷水道與閘門、立體模型、正面層疊、粉紫與青綠、夕陽
- 本篇：skill手冊開單一工具抽屜、層疊紙雕、俯斜對角與留白、奶油白森林綠、柔和日光
- 同批 SubQuery整合者說明：紫底瓷器黏土斜線傳輸帶，本篇媒材、配色、題材均不同

Built-in imagegen 生成，未使用 CLI。完整prompt：

> Use case: stylized-concept. Asset type: original editorial cover for a Traditional Chinese engineering article on reading a skill to reveal only its associated tools. Wide landscape 16:9, no words or logos. A finely crafted layered paper-cut sculpture on a warm cream background: a large open folded instruction booklet in the foreground unfurls one forest-green paper ribbon that pulls open a single drawer in a tall botanical-green archival cabinet; three simple paper tool silhouettes are visible in that one drawer, while all other drawers stay closed. Restrained editorial art, tactile torn-edge paper fibers, overhead oblique composition, clean generous negative space, gentle daylight side shadows, cream and deep forest green with a tiny saffron detail. Clear single focal point readable at thumbnail size. No metallic machinery, no ceramic, no computer screens, no interface elements, no text, no numerals, no watermarks.

- 原始 PNG：`/workspace/scratch/d935b46a4408/generated_images/exec-83779ebd-f651-4ed1-88b0-6639dbd18314.png`
- 本地發布資產：`src/assets/covers/deepagents-skill-tools-runtime-boundaries.webp`
- 尺寸 1672×941；Pillow 僅轉 WebP品質88與縮圖，不修改生成內容
- 已用view_image看完整圖與320×180卡片縮圖（`/tmp/deepagents-cover-card.png`）：手冊、連結紙帶、唯一開啟抽屜仍清楚；無字、logo、水印
- coverAlt依實際圖像描述；不把抽屜當作後端授權的證據
- 無正文流程圖，故無新增SVG／Mermaid

## 交付檢查

作者檢查 frontmatter欄位、相對cover存在、系列66、draft false、featured false、主來源保留、無Markdown table／Mermaid、無未標示可執行性片段。Format、schema、content policy、check、test、build與production視覺驗收由整合者最終執行；本工作未宣稱已通過。
