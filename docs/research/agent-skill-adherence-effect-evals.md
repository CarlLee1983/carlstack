# Agent skill：遵循與效果的配對評測

## 來源與去重

2026-10-20 Asia/Taipei，起始 main 837f92ceec31d17e2c77e44047c8dc638faa6039。指定來源與正規化 URL 均為 https://x.com/sermakarevich/status/2112198653469241856 ，stable ID 2112198653469241856；作者 Sergii Makarevych / sermakarevich；標題 How to write and test agent skills with evals。

blog/research/article-queue 按原始URL、stable ID、作者與 skill/eval/TDD/adherence/effect/等長/基線查無同來源。最接近 claude-eval-hillclimb-validation-boundaries 談評分器與資料隔離；pstack-first-verifiable-workflow 談工具首次導入。本文讀者收穫為把載入、遵循、結果拆開診斷，以配對三組比較決定一條規則是否值得保留，並內鏈前者。AI 系列現有最高92，新篇93，非每日系統設計系列。

已讀 AGENTS、content-guide、schema、workflow、copywriting、humanize-writing/zh-tw。trail command 與 cache INDEX 不存在，改直接搜尋。只變更本文、原創封面與本查核檔。

## 原文與一手查核

精確 X 頁面用正常雲端 Chrome 讀取完整 X Article，頁面顯示2026-10-19 23:06，未顯時區，正文只保留日期。原文提供方法與 Superpowers TDD 八組評測設計，未交該設計的執行結果。正文不稱作者證明TDD無效，不轉述百萬技能/普遍無效等未能普遍化論斷。

一手來源於2026-10-20讀取：

- https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals ：Next.js16作者eval，預設skill未呼叫56%，baseline/default skill均53%，明確觸發79%，always-on文件索引100%。本文只引前兩組作載入例子，不泛化為所有技能啟用率。
- https://arxiv.org/html/2608.23067v1 ：Signal or Noise，31公開skills、50 web projects、1000 ordered tasks、4模型。C2按byte長度±5%配對，不是同token；限制只測Playwright功能，非visual/UX/readability/review time。正文只用設計與限制，不列未重現的成本/下降數字。
- https://arxiv.org/abs/2602.12670v4 ：SkillsBench最新版v4，87 tasks/8 domains/18 model-harness，curated skills平均33.9%→50.5%，+16.6百分點。本文保留正面反例，不採原文舊版Haiku27.7/Opus22.0對比。

研究時排除的數字與誤讀：

- 原文反覆把307個選定失敗中的182效率退步寫成62.6%；https://arxiv.org/abs/2608.11888 原始分類為125 functional +182 efficiency=307，182/307×100=59.283%，約59.3%。是選定失敗案例，不是所有技能失敗率；正文不用此統計。
- Signal or Noise 的Pass@2變化1.3–4.2應為百分點，不能寫相對百分比；GPT-5.1區間[-3.4,+0.5]跨零，不能宣稱四模型都顯著下降。token最高+394%部分受baseline早停分母小影響。
- 原作者建議同token對照；本文將其標為方法設計，不假裝引用研究已嚴格如此控制，也明示無關文字仍有語意，非完美安慰劑。
- https://code.claude.com/docs/en/plugin-evals 目前官方有claude plugin eval、版本>=2.1.269、每case預設三次fresh isolated session。本文不做CLI教學、不執行付費模型，因此未將版本與命令加入正文。

## 本文設計與限制

折扣零下限為虛構案例。部分修復只處理範例數值，因此紅綠循環完成仍未泛化。adherence查事件順序與行為斷言；effect另看舊版replay/獨立案例/需求支持的錯誤變體。replay無法套舊介面不算抓bug。缺事件標無法判定；不拿退出碼或Agent自述替代證據。

三組固定模型版本、reasoning、權限工具、預算、提交依賴、驗收器，乾淨workspace/fresh session、交錯組別、多次repeat；超時列入報告。低遵循不自動怪文案，高遵循無效果也不立即斷言理念無效，排查ceiling/樣本/任務適配/驗收。選擇後的保留資料與grader議題連既有文，避免另複製一篇。

沒有安裝技能、呼叫模型或重現研究，沒有親測改善宣稱。未建立本地fixture，因正文是評測設計，不把簡單fixture執行混同Agent因果實驗。

## 封面

比較最近AI #92：暖色攝影、手持透明片、斜向室內構圖。新篇選深靛藍/朱紅/黃銅、screen-print紋理、正面雙量具靜物，媒材/構圖/配色均不同，保留16:9。

使用正式內建imagegen原創生成1672×941 PNG，轉1600×900 WebP quality88，320×180卡片。完整尺寸和卡片均目視：兩個量具、缺齒齒輪清楚，無文字標誌；不是數據圖、不把藝術量具當實際實驗裝置。正文無流程圖或Mermaid。

Prompt摘要：original editorial illustration, two independent measuring devices on a bench, small brass ratchet records procedural steps, dark-blue caliper inspects pale ceramic gear with a missing tooth; textured screen print, front-facing, midnight indigo/burnt vermilion/cream/brass, warm side light, crop-safe, no text/numbers/logos/robots/screens/arrows。

## 工程驗收

雲端隔離checkout，Node24.19.0、Corepack cache pnpm12.1.0；frozen-lockfile install成功。命令使用ASTRO_TELEMETRY_DISABLED=1 TELEMETRY_DISABLED=1 WRANGLER_SEND_METRICS=false WRANGLER_SEND_ERROR_REPORTS=false，未更動repo設定。

最終format/policy/check/test/production build及RSS/sitemap/Pagefind/series檢查以當次執行紀錄確認；正式部署待精確main SHA workflow與線上正文核對。

本地預覽：astro dev 曾回報 running，但127.0.0.1:4362實際連線拒絕，隨後astro dev status/stop均顯示No dev server is running。未以改UA/其他瀏覽器或權限繞行，桌機/320px深淺色實頁預覽未完成，依既有預覽例外續行，封面目視不等於實頁通過。
