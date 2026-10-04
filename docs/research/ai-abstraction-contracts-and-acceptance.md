# 抽象能力與可驗收契約

## 編輯決策

本文原始材料為作者提供的五項文章重點：保留重要差異、錯誤模型的放大、可驗收契約、PraxisBound 收斂至 Warrant、用小實作與獨立案例回饋規格。先完成文章稿，再經作者明確要求發布。

於 main `9a018852ea60ce163cec1943af63bbc1fa270ef3` 搜尋主來源 URL、穩定 ID `2106425743479546343`、抽象能力、PraxisBound 與 Warrant，檢查 blog、research 和 article queue。既有深模組文章聚焦模組收斂決策、lint 入口與成本判準；domain-modeling-context-spec 聚焦詞彙文件、語意銳化與 ADR；驗證工作流文章聚焦環境、證據與交付權限。

本篇為作者的獨立論述：需求定義本身如何出錯、工程師如何建立可驗收契約並以獨立業務案例推翻規格。付款情境保留作者要求，但不用程式碼或 lint 教學重述深模組篇。新篇與深模組篇加入雙向相關閱讀；不改既有篇的發布日期與更新排序。納入 AI Agent 工程化與工作流實戰第 60 篇，既有第 34 號重複不是本次範圍。

## 已核對來源

- https://github.com/mattpocock/skills
- https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md
- https://github.com/CarlLee1983/Warrant/blob/main/README.zh-TW.md
- https://x.com/mattpocockuk/status/2106425743479546343
- https://carlstack.gravito.dev/blog/deep-modules-vibe-coding-architecture/
- https://carlstack.gravito.dev/blog/agent-work-requires-verifiable-codebase/

查核日期為 2026-10-04，台北時間。此次 X 直接讀取為 403，因此不新增引言或歸因；保留討論起點並明示未直接核對正文。既有研究檔記載前次直接查核，但本篇不據此聲稱此次讀取成功。兩篇既有文章已讀公開全文，並以 checkout 交叉確認。

Matt domain-modeling 的追問、情境壓力測試與程式對照由目前文件支持。Warrant 的三段 Story、規則與驗證定位由目前 README 支持。付款情境為作者觀點的示例；並非支付系統實作、親測或效能結果。規則不能替代技術強制，驗收不能只依據相同誤解生成的測試。

## 發布驗收範圍

只變更新文章、原創本地封面、本研究紀錄，以及深模組文末的相關閱讀。依內容規範執行 frozen install、format、content policy、check、test、最終 production build 與輸出索引檢查，再驗證精確提交的正式部署。未將圖片當成系統流程圖；正文無新技術圖。

## 封面與預覽

原創 imagegen 封面為 1672 × 941 WebP，175,932 bytes。以單一紫色框架、人的校準動作，以及完整、破裂、未定形三種物件，表達契約與重要差異。已檢查全尺寸與 320 px 卡片，並與深模組、Uber MCP、OpenWA 相鄰封面比較；無文字或 logo，構圖、媒材與色盤具有區別。

本機 Astro 預覽嘗試由正常雲端瀏覽器開啟，回覆 `ERR_BLOCKED_BY_CLIENT`，未繞過限制。文章本機桌面／320 px 深淺色 UI 未驗收；這不等同內容、build 或正式站驗收失敗，分開回報。
