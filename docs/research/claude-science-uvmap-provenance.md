# Claude Science UV map：補值資料來源與使用限制

- 主來源：https://www.anthropic.com/research/the-missing-map-of-the-sky
- 主來源發布日期：2026-10-08；查核日期：2026-10-09（Asia/Taipei）
- 專案說明：https://menard.pha.jhu.edu/uvmap/
- 技術草稿：https://menard.pha.jhu.edu/uvmap/docs/uvmap_manuscript.pdf
- 草稿資訊：Brice Ménard，Draft, October 2026，41 頁
- 對應文章：`src/content/blog/claude-science-uvmap-provenance.md`
- 系列：AI Agent 工程化與工作流實戰，77

## 去重與定位

研究基準 main `4f2b8828c6f00e48521221e72cd78756e13a18ca`，完整 blog、research 與 queue 查核未見相同來源或核心主題。Threat Signals 涉文字情報來源追溯；本文聚焦混合數值的來源權重、補值誤差、解析度與用途限制，因此新增並交叉連結。

## 來源重新讀取

已直接讀取 Anthropic 原文。JHU 專案頁與 PDF 直接 open 曾失敗，改由 Anthropic 原文中的正式專案連結進入後成功，再由專案頁的 paper link 成功讀取 41 頁草稿。沒有以二手報導補足核心技術內容。

來源支持的核心區分是：Claude Science 協調資料處理與研究流程；缺口由統計回歸樹 ensemble 估計，不是 LLM 或影像生成模型直接生成天文觀測。正文將 Anthropic 約 10% 敘述與 JHU 約 12–14% 典型誤差按各自上下文呈現，不合併為全圖精度保證。

技術草稿用於來源權重、空間 holdout 的具體 scatter、混合圖層與不確定性語義；專案頁用於有效解析度、禁止在補值區尋找新天體／作為獨立塵埃證據的限制，以及尚無人類同儕審查的狀態。1.7 角分標為 sampling，不概括成全圖 resolution。`SIGMA_SYS` 的相關性未被簡化成可逐像素獨立平方相加。

查核時 Downloads 區仍稱 FITS／HiPS 連結將補上。未把展示頁、PDF 可讀誤寫成資料與程式可完整重現。

## 原創契約與未執行工作

YAML 的 observed／translated／coarse_constrained／predicted 是本文自建資料契約分類，不冒充官方 FITS schema；42.0 與權重是合成示例。匯出 roundtrip、缺失／錯誤權重拒絕、用途政策正反例均為未執行的工程驗收建議，不是科學驗證。

未下載 FITS，未重建地圖、訓練模型、執行天文計算或複現文中數字。文章沒有新發現主張。Agent 審查漏掉 GALEX footprint 的敘述來自作者原文，不外推為一般多 Agent 成功率。對空間切分與下游資料平台的建議標明是工程推論。

## 交付與驗收

正式文章，featured false。無 Mermaid、SVG 架構圖與 Markdown 表格，封面使用原創視覺比喻而非科學地圖。格式、內容、build、部署及正式網址驗證交由發布流程，未預先宣稱通過。

封面已依 `oct9-cover-directions.md` 的驗收描述設定精確 alt；封面工作已檢查 1600 × 900 WebP 及 320 px 兩種卡片裁切，無意外文字／logo。這不等於文章整頁 UI 驗收。

## 精確來源定位

- JHU 專案頁第 3 節：小決策樹 ensemble、來源權重、argmax 摘要與融合；第 4 節：12–14% 與限制、同系統驗證／未經人類同儕審查；第 5 節：sampling 與 effective resolution；第 6 節：待提供 FITS／HiPS 連結。
- 技術草稿 PDF 第 1 頁（頁面索引 0）Abstract：90-feature boosted prediction、兩組 FUV／NUV scatter、距離增加的誤差；第 3 頁（頁面索引 2）Introduction 後半：預測形態的範圍與逐像素 provenance。沒有把早期 FIMS 全天補值工作抹去，也沒有下無條件「第一張 UV 全天圖」結論。
