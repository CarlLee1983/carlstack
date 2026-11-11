# AlphaProof Code 查核紀錄

- 查核日期：2026-11-11（Asia/Taipei）。
- 主來源：https://deepmind.google/blog/introducing-alphaproof-code/ （2026-11-10 公告）
- 論文全文：https://deepmind.google/documents/36/Formal_Verification_of_Signal_4.pdf
- 公開驗證文件：https://google-deepmind.github.io/code-verification/
- Signal 背景規格：https://signal.org/docs/specifications/pqxdh/ 、https://signal.org/docs/specifications/doubleratchet/
- 已讀論文與公開文件的實作對象、兩類證明、限制、規格審核及 comparator 章節。文章對應章節附來源。
- 去重：以 AlphaProof、主來源 URL、code-verification 搜尋 blog、research 與 queue，未見同來源文章。既有 `formal-verification-proof-scope.md` 聚焦 Anthropic / Theorem 與部署產物，這篇聚焦新研究的驗證範圍，內文連結既有分析。
- 未重跑 Lean、未重建研究執行檔、未測試 Signal App；金流段落為原創教學建議，沒有宣稱實證。
- 標題依使用者最新指示直接說內容，不依舊規範硬塞主張。已讀 humanize-writing 與 zh-tw 規則，檢查器命中的小標冒號是標籤用途；已移除「以下是」開場。

## 封面

- 內建 image_gen 生成，無第三方圖與 Logo。
- 新封面：鏤空紙板比對；紙藝；俯視；米白、青綠、陶土；明亮定向陰影。
- 既有相近文封面：透明方盒；3D 材質；斜角；淡紫；柔光。至少三個視覺維度不同。
- Prompt：Original wide 16:9 editorial paper-cut illustration of an ivory stepped stencil over dark teal paper sheets, a terracotta sheet with mismatched cutout beside it; top-down, cream background, tactile paper and directional shadows, centered composition, no text, digits, logos or watermarks.
- 本地封面：`src/assets/covers/alphaproof-code-verification-scope.webp`，1672 × 941，已目視全圖與 360 px 卡片尺寸，無錯誤文字，主要形狀可辨。
- 最終格式、內容 policy、check/build、test、正式站驗證由本批整合工作執行並回報；本紀錄不預先宣稱通過。

## 整合驗收

以 main `57194e239b7e3606c6e286c42b9822fdc607ecac` 為基線，open PR 為空，當日既有系統設計第 28 課不計入快報。已以 pnpm 12.1.0 執行 frozen-lockfile 安裝，lockfile 未更動。使用雲端獨立 checkout，僅提交文章、封面、必要查核與內鏈。`trail` 與 `.trail/cache` 不可用，改直接讀取規範並完整搜尋來源與主題。

本機預覽在 ready 前退出，localhost 無法連線；完整本機桌面／320 px 深淺色目視未完成，按使用者允許例外保留限制。封面全尺寸與 320 px 卡片已靜態目視，不等同頁面驗收。文章不含新 SVG 或可執行範例。
