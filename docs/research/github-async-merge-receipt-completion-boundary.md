# GitHub async merge：受理與完成邊界查核

查核日期：2026-10-02（Asia/Taipei）；基準 main 0ad5271176a49a27e107891fd60da86ca53dadbd。

## 去重與來源

- 查 src/content/blog、docs/research、docs/article-queue.md 的原始／正規 URL、async-merge-api-generally-available、merge-async、GitHub 與非同步合併。未有本次來源或 async merge 專文；既有 grok-bot-engineering-control-plane 談保護分支，claude-code-self-driving-workflows 談過期指令，本篇處理新 API 的操作狀態與合併 Bot 對帳。連回 Webhook 交付邊界文章。
- 主來源：https://github.blog/changelog/2026-10-01-github-async-merge-api-generally-available/ 。穩定 ID 2026-10-01-github-async-merge-api-generally-available；2026-10-01；發布者 GitHub（無個別署名）。核對 GA 與 individual/stacked/queue 支援。
- 一手 API：https://docs.github.com/en/rest/pulls/pulls?apiVersion=2026-03-10 。保留有語義版本 query。核對 PUT merge-async、GET merge-async/{uuid}、202 UUID、409 既有工作、200 merged/enqueued、基本狀態檢查、head SHA、merge_action、bypass_rules、24 小時保留與 Contents write 權限。
- 核心差異：enqueued 為入列請求終態，不會隨後續 PR 合併轉 merged；需查實際 PR。GET /merge 204 為已合併、404 尚未合併，亦須辨識存取錯誤。
- 沒有建立或合併測試 PR，未調整權限。概念 JSON、核准版本綁定、網路逾時對帳、有限輪詢、部署驗收與停止規則均為作者建議。無延遲或成功率自測。
- 現代網路協定與 API 平台架構最高 order 11，本篇接續 12。

## 封面矩陣與視覺驗收

- Pi Durable：雙閘門／黏土／斜俯視／陶土鼠尾草／陰天漫射。
- Clef：校準鏡片／刺繡／正面／紫青亞麻／均勻棚光。
- 本篇：收據與等待票券、完成積木／紙與霧面壓克力／俯視組裝／琥珀鈷藍桃色／斜射日光；與兩篇在媒材、色盤及光線不同。
- 原創 imagegen 提示：asynchronous merge receipt differing from completed merge; three amber tickets on zigzag conveyor, separate finished cobalt interlocking block beyond gate, blank translucent receipt token; tactile paper/acrylic, pale peach, sharp sunlight; no text, logos or watermark。
- 資產 src/assets/covers/github-async-merge-receipt-completion-boundary.png，1672×941。完整封面與索引卡片、1440／320px 深淺色、程式碼及正文均以隔離 Chrome 驗收，QA 證據留任務 workspace。
