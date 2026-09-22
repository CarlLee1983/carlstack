# 老姚〈Jev應用圖譜｜60個公開案例，9類應用場景〉來源研究

- 原始來源：[Jev 應用圖譜（老姚）](https://doc.laoyao.cn/j61zgy)
- 穩定內容 ID：`j61zgy`
- 整理作者／發布者：老姚（laoyao.cn）／Jev Case Atlas
- 資料截取時間：2026-09-20；圖譜發布時間：2026-09-21
- 研究與更新時間：2026-09-22（Asia/Taipei）

## 去重與交付決定

- 原始 URL `https://doc.laoyao.cn/j61zgy`、正規化 URL 與穩定 ID `j61zgy` 在 `src/content/blog`、`docs/research`、`docs/article-queue.md` 均無歷史命中。
- 主題與本站已發布的旗艦文章〈[Agent 工作流不要再用 Chatbot 猜路由：從 TypeSafe AI Jev 看 System 1 決策模型的工程轉向](../../src/content/blog/jev-system-one-decision-model.mdx)〉直接重疊。該文原先僅收錄 TypeSafe 官方論文、LangChain harness 及 20 個社群展示點子；本篇圖譜則補足了迄今最完整的 60 個公開案例全景、9 大工程領域分類、三階證據邊界（官方示例 vs 開發者專案 vs 作者實驗）以及 4 條 GEO 與資料審校的落地遷移線。
- 依照 CarlStack 內容指南與去重規則：「同一來源或主題已有文章時，更新既有文章與 `updatedDate`，不要建立重複 URL。主來源 URL 必須保留在正式文章中。」因此將圖譜的系統化分類與證據邊界整合入既有文章，更新 `updatedDate`，不建立重複 URL。

## 原文可確認的結構與主張

1. **規模與統計口徑**：
   - 整理 60 條 Jev 公開應用記錄，對應 59 個去重原始出處（Doom 與 Wikiracing 共用一篇 TypeSafe 發布文章）。
   - 來源分佈：官方一手資料 27 條（TypeSafe AI、Vercel、LangChain，含 20 條教學/範例、4 條工作流評測、3 條展示）、開發者開源專案 30 條（GitHub repo 與說明）、作者實驗 3 條（Every / Mike Taylor 寫作質檢、Maxim Saplin 西洋棋 80 局、WindTunnel / WebMCP 網頁基準測試）。
2. **9 大應用場景模組**：
   - 01 · GEO 與營銷（2 條：Notra 品牌提及判定 JEV-41、ReplyNodes 官網表達診斷 JEV-56）
   - 02 · 知識檢索與證據（9 條：Rerank、長文定位、同名實體對齊、RAG 證據前置篩選、引用支撐度審校、Wikisprint 導航、搜尋前後篩選、Neo4j 圖譜走訪、Paper Trellis 論文引用驗證）
   - 03 · 文檔與數據工程（9 條：GDPR 多維度平行判定、Markdown 結構整理、抽取後逐欄校驗、日期結構化、候選片段消歧義、層級分類樹走訪、酒評特徵萃取入 CatBoost、SQLite/SQL 擴充、Parquet/JSONL 訓練資料過濾）
   - 04 · 業務分流與風控（7 條：車險理賠分流、SIC 行業分類階梯降級、SOC 安全警報分流、發票/採購單/合同四方核對、客服退款承諾履約查核、Vercel 工單分流、LangGraph 郵件發票路由）
   - 05 · Agent 編排與安全（9 條：金融分析函式選擇、Hermes 多技能目錄走訪、輸入輸出 Guardrail、客服 Agent 軌跡合規審計、LangChain AutoMode 工具阻斷、Hono 語義請求分流、Tripwire 生成內容攔截、ProgressGate 卡死/無效探索偵測、Jev Router 依難度選模型階距）
   - 06 · 瀏覽器與設備自動化（7 條：智慧家居指令映射、browser-use DOM 動作選擇、droidrun Android 點擊與輸入、awlevin 桌面 OCR 動作、kitze Unclutter 網頁干擾元素隱藏、HA-Jev 家居狀態信號化、RomanSlack MuJoCo 無人機避障）
   - 07 · 開發與維運（7 條：Every CLI 函數語義檢索、Clean Code Review 程式碼審查檢查項、Commit Miner 安全變更線索挖掘、JevLogs 大量記錄分級、Jev Triage GitHub Issue/PR 分流、Jev Resilience HTTP 200 業務錯誤識別、Jev Commit 提交說明與 diff 真實性核對）
   - 08 · 內容與媒體審核（7 條：邊界內容審核穩定度測試、Jev Skip 字幕贊助片段標記、Human Compiler 寫作標準四維檢查、Jevmeter 逐句訪談表達審查、Jev Audio Beeper 時間戳髒話消音、Discord 防詐防垃圾機器人、Every 21 項 AI 味模式檢查）
   - 09 · 交互與能力評測（3 條：Doom 動作循環、LLM Chess 合法棋步選擇、WindTunnel / WebMCP 網頁工具基準測試）
3. **三步解耦模型**：
   - `01 · 輸入材料（Context：文本、狀態、問題與候選集合）`
   - `02 · Jev 判斷（Engine：單次平行計算，輸出強型別標量與經校準的機率）`
   - `03 · 推進流程（Action：由外部程式執行狀態變更或校驗，遇不確定性則轉人工或降級）`
4. **證據邊界（Evidence Boundaries）**：
   - 官方身份無法直接證明生產部署或商業收益；
   - 開發者專案多含 mock、dry-run、錄製重放或單一 DOM 繫結，API 調用與穩定性需個別驗證；
   - 作者實驗自報數字不等於獨立客觀復現；
   - 模型輸出永不具備授權屬性，不可直接跳過業務權限與安全審計。

## 可安全採用的外部事實與限制

| 事實或模組                                | 一手來源與案例                                                                                           | 寫作限制                                                                    |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 60 個公開案例分為 9 大場景與 3 類來源口徑 | [老姚 Jev 應用圖譜](https://doc.laoyao.cn/j61zgy)（基於 2026-09-20 前的公開 GitHub、官方文檔與社群展示） | 必須明確指出「公開記錄 ≠ 成熟生產部署」，區分官方示範、開源原型與作者實驗。 |
| GEO 品牌提及與實體對齊                    | `usenotra/notra`（JEV-41）與 TypeSafe 實體對齊 cookbook（JEV-09）                                        | 提及識別僅為判斷依據，線上啟用比例未知，不可等同於全自動公關或 SEO 排名。   |
| 引用支持度與信源審校                      | `MarissaFamularo/citation-verifier`（JEV-55）與 TypeSafe 引用查核（JEV-11）                              | 僅取摘要時支持度較弱，且文本存在性檢驗需由一般程式碼獨立完成。              |
| 官網表達與寫作模式質檢                    | `replynodes/jev-web-analyzer`（JEV-56）與 Every / Mike Taylor 37 篇文章（JEV-58）                        | 評分反映規則匹配度，不能視為真實訪客轉化率或 AI 生成的直接鐵證。            |

## 文章更新的工程判斷

1. **升級案例全景**：將原先「20 個展示不要一次搬進產品」章節，擴展為「從 20 個點子到 60 個公開案例：9 類場景的工程實況與邊界」，並以老姚的 60 案圖譜為權威架構梳理。
2. **引入三階證據邊界矩陣**：加入官方示例（27 條）、開發者原型（30 條）、作者實驗（3 條）的驗證矩陣，讓讀者看清「代碼能跑」與「生產可用」之間的巨大鴻溝。
3. **萃取 4 條高價值業務遷移路徑與先測指標**：
   - 品牌提及與實體歸一（先測指標：提及識別精確率、召回率、同名誤合併率）
   - 信源檢索與引用支撐度（先測指標：相關性、錯引檢出率、有效證據誤刪率）
   - 商業意圖與問句特徵（先測指標：標籤一致性、歧義率、與線索價值的關聯）
   - 官網表達與內容質檢（先測指標：人工評審一致性、漏檢率、返工率）
4. **保留主來源 URL**：在內文與延伸閱讀加入 `https://doc.laoyao.cn/j61zgy`，確保 repository 與正式發布文章可精確追溯。
