# @poteto 四層工程投入：來源與驗收

## 選題與去重

- 原始穩定 ID：2111133080526495985；正規 URL：https://x.com/poteto/status/2111133080526495985；作者 Lauren Tan（@poteto）。
- 2026-10-18（Asia/Taipei）以雲端 Chrome 正常開啟，完整主貼正文可讀。頁面日期為「上午12:32 · 2026年10月17日」，未顯示時區，不自行轉換。附圖開啟要求登入，未繼續；不聲稱讀完討論串或掌握即時互動。
- 已比對來源 ID、URL、作者、四層主題、pstack 與既有文章。`agent-work-requires-verifiable-codebase` 有相關核心；使用者本次明確指定另寫一篇，因此保留舊文。新文聚焦反覆 review 糾錯如何選擇結構／檢查的投資位置，舊文處理並行工作與交付證據，正文互相區分並內鏈。
- main 基準 e73aeb8；既有 AI 系列最高89，新篇90。未接續或重試已取消的舊草稿。
- `trail map` 未安裝，無快取索引，採檔案與文字搜尋。

## 事實與段落對應

1. 開頭與四層：原貼直接提出 codebase improvements、static analysis、prose、human review 的 inverse pyramid；本文間接引述，沒有重製全文。原貼把 tests、CI、TLA+ 放在第二層；正文明確區分其技術性質，沒有宣稱量化效果。
2. 第一層：虛構多租戶匯出案例為作者設計推演。TypeScript discriminated unions：https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions 。型別不能證明執行期授權。
3. 第二層：跨租戶 fixture、移除條件的反例測試皆為建議，未替真實服務實跑。Required checks 的範圍與 bypass 限制：https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging 。
4. 第三層：原貼直接連 https://github.com/cursor/plugins/tree/main/pstack 。官方 https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md 說明 launch/doctor/drive/evidence/cleanup 與 feature map；未執行 pstack，未宣稱節省 token 或提升速度。官方 main 是可變來源，未假稱固定 SHA。
5. 最後兩節：需求、權限與風險取捨是本文工程建議，不冒充原貼研究結果。沒有讀取私人 Slack、聊天紀錄或依原貼操作指令存取其他資料。

補充讀取官方 skills：principle-encode-lessons-in-structure、principle-type-system-discipline、principle-test-behavior-not-implementation；路徑皆在上述 pstack/skills 下。用來核對反覆糾錯轉結構、外部資料邊界解析及可觀察行為，不冒充本站實測。

## 封面與圖解

- 原創生成：四層陶瓷分流結構，攝影式材質、正面階層構圖、冷白鈷藍色，與上一篇水彩鐵道封面的媒材／構圖／色盤不同。
- 正式圖片工具輸出1672×941，轉為1600×900 WebP；全尺寸及600×400卡片裁切已目視，主體完整，無文字或品牌；alt按實際畫面描述。
- 原生 SVG `AgentTrustInvestmentDiagram.astro`，四層定性寬度，無量化暗示；桌面與窄版HTML分開，深淺色使用全站token。

## 驗收

- 來源與全文人工審閱完成，法規措辭改為組織政策或適用規範。
- pnpm install --frozen-lockfile 完成。最後內容與技術檢查結果以提交前工作記錄為準。

- 雲端 Astro dev 在設定可寫入的暫存設定目錄後仍回報 Dev server process exited before becoming ready；雲端 Chrome 本機網址 connection refused。桌機／窄版／深淺色實頁目視未完成，依使用者預覽例外繼續其他必要驗收，不宣稱通過。圖解程式碼檢查確認雙版面與全站深淺色 token，封面目視另已完成。
