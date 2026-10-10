# Grok Bot 週額度與成本護欄：來源及發布查核

查核日：2026-10-10。文章來源：[鐵柱 AGI（@cgnot996）X 長文](https://x.com/cgnot996/status/2108504325609984233)，原題〈Grok Bot 额度超长续航保姆级新手指南（直接发给 Bot！）〉，頁面日期 2026-10-09。

## 去重與範圍

在最新 main `780519fa959d55b847545a977f9ff391631fba03` 的獨立 worktree，先讀 AGENTS、content-guide、content schema、diagram-guide、部署 workflow 及 copywriting／humanize-writing 規範。搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md` 的原始 URL、去掉 s 追蹤參數後 URL、穩定 ID 2108504325609984233、作者 cgnot996 與標題／週額度／成本關鍵字，沒有同來源文章。

既有 Guides 三部曲與 control-plane 處理架構、艦隊與責任；agent-loop-cost-ledger 處理單輪 context 與 cache。本文新增的讀者收穫是跨週額度與外部費用的任務分帳、喚醒前的事件閘門、執行前預留與驗收。採新 URL `grok-bot-budget-wake-delegation-guardrails`、AI Agent 系列 79。加入成本帳本文末反向延伸連結，不改其原始日期；沒有修改任何既有 Grok 封面。

## 來源與主張對照

研究已以正常雲端瀏覽器閱讀指定 X 公開全文，未登入或繞過限制。原文十二方向包括多模態摘要、上下文管理、放慢排程、Webhook 觸發、減少群聊、復用 Bot、CLI 委派、搜尋輸出節制、小樣本驗證、限制重試、按量費用設定與耗盡前交接。本文不逐條翻譯、不重製原文長段落。

- [Cursor plans](https://cursor.com/help/grok-bot/plans)：週用量重置；on-demand 由 Cursor 計費；訂閱權益不疊加；月上限不會中斷執行中工作。避免宣稱固定 token 包數、精確硬停或較高訂閱額度的特定合併算法。
- [Cursor routines](https://cursor.com/help/grok-bot/routines)：每次執行耗用量，Test 也真實執行；高頻排程／Slack 可能耗盡週用量；Webhook 200 是接受並開始執行，不是完成。
- [Cursor models](https://cursor.com/help/grok-bot/models)：無模型選單，不揭露逐請求底層模型。外部路由需另算成本與傳輸。
- [官方論壇支援回覆](https://forum.cursor.com/t/grok-bot-context-window-size-and-token-accumulation-logic-in-pro/171540)：9 月 14、22 日回覆提到歷史重讀、cached tokens、接近上限自動摘要、複製不帶舊記憶。不把歷史 token 全部當成未快取原價。
- [Cursor teams](https://cursor.com/docs/grok-bot/teams)：同帳戶 Bots 共用電腦、檔案與登入。chmod 600 不等於 Bot 隔離。
- [OpenRouter limits](https://openrouter.ai/docs/api_reference/limits)與[free variants](https://openrouter.ai/docs/guides/routing/model-variants/free)：免費模型有帳戶相關的速率與每日限制。正文不固化易變的限制數字。
- [ModelScope limits](https://modelscope.cn/docs/model-service/API-Inference/limits)：動態限流，單併發正常使用目標；不適合高併發／SLA 線上任務。原文「適合生圖」僅是作者判斷，不是模型支援範圍。
- [ModelScope CLI README](https://github.com/RongleCat/tiezhu-modelscope-api-inference)：媒體輸入經 Uguu 暫存取得 HTTPS URL。本文揭露額外資料接收者；沒有安裝、執行或上傳媒體。

未採用的未獨立核實主張：X 搜尋 30/min、1000/day、不扣 Bot 額度；作者個案的 70%→6%、3 小時 3%、圖片 11%；群聊相互喚醒比例、每步 token 數；額度耗盡後仍一定可進電腦；休眠期間 cron 生命週期。分享卡上的喜歡／回覆數不當即時證據。

## 工程示例

SVG、事件接收層、預算帳本與 JavaScript 都明標本文自建建議，非 Grok Bot 內建設定。JS 只做單一程序派工算術，無網路、無模型，5 個合成 admission assertions 已實際執行通過。本文揭露缺少原子鎖、持久化、崩潰恢復與預留釋放，要求正式版本處理整數溢位及遠端取消。不能把合成測試解讀為產品節省率或完整預算系統。

## 封面方向與驗收

生成前實際檢視 Oct10 三封面卡片比較圖。Deno 是厚塗港口全景／橄欖梅紫；Prime 是俯視纖維織機／鈷藍芥末；SonicWall 是低角度陶瓷檢體／淡紫酒紅。

本文矩陣：雙資源池與機械閘門隱喻；粗刻 linocut 印刷；不對稱正面雙儲槽；深森林綠、銅橘與奶油色；平面克制的油墨質感。媒材、構圖與色盤均與近鄰不同，共同錨點只留 16:9、無文字。

使用內建 imagegen 原創生成，沒有 CLI fallback。完整提示：

```text
Use case: stylized-concept. Asset type: original editorial engineering article cover, landscape 16:9, no text. Illustrate controlled expenditure as a beautiful hand-cut linocut print: two separate tall reservoirs of small copper-orange circular tokens, each connected to its own simple mechanical sluice gate, on a dark forest-green ground. One channel lets exactly one small group of tokens through toward a small ivory collection bowl; the other gate is closed and visibly holds back its separate reserve. Two distinct resource pools, an explicit gate, and deliberate limited release, not a claim of free or unlimited energy. Strong asymmetrical front-facing composition, the reservoirs staggered diagonally, wide generous negative space, all vital objects in the central 75 percent to survive card crop. Thick carved ink contours and visible rough block-print grain, warm terracotta and cream on deep forest green, flat graphic print rather than 3D photography, calm and measured mood. No numbers, words, letters, logos, watermarks, robots, computers, circuit imagery, UI, neon. Make all silhouettes clear at 320 pixel article card size. Full bleed.
```

最終路徑 `src/assets/covers/grok-bot-budget-wake-delegation-guardrails.webp`，1600 × 900；已檢視生成全圖、WebP 全圖及 320 × 180／320 × 200 卡片裁切。兩個資源池與開閉閘門可辨，無文字、logo、浮水印；儲槽頂端在畫外，未影響雙池與限流隱喻。coverAlt 按實圖描述，不是實際產品畫面。

## 預覽限制與圖解檢視

已嘗試 pnpm dev：程序在 ready 前退出；正常雲端瀏覽器首次連線回 ERR_CONNECTION_REFUSED，後續選取失敗頁也受瀏覽器 URL policy 擋下。沒有更換路徑或改 UA 繞過限制。未宣稱本地文章整頁、互動、水平捲軸或主題切換通過 UI 驗收。

圖解已按原生 SVG 與 token 規範製作桌面／直向兩版。在離線圖像渲染中代入既有淺深色 token，分別檢視 960 px 桌面與 280 px 內容寬（對應 320 px 視窗留邊）成品；這只驗證圖解排版與顏色，不冒充整頁瀏覽器測試。CSS 使用 48rem 雙版切換、中性色 token，無自訂強調色、無 Mermaid。

## 發布 gates

pnpm 12.1.0 frozen install、format、stage 後 content policy 已通過。2026-10-10 的完整 pnpm check（Prettier、Astro diagnostics、production build、Pagefind）及 65 項測試通過；既有 redis 語言標記警告與 Pagefind zh-hant stemming 提示未改動。

本紀錄補寫後仍須再跑最後一輪 gate 與 production build，檢查文章、RSS、sitemap、Pagefind、series、內鏈及封面產物；提交推送與精確 commit 部署由發布流程驗證。沒有以研究或合成測試代替整站 gate。
