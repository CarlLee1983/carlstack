# GEO 文章：爬蟲政策與 Markdown 主張查核

- 查核日期：2026-10-05（Asia/Taipei）
- 更新文章：`src/content/blog/geo-vs-seo-five-gates-crawler-architecture.mdx`
- 基準 main：`e1d77e8b78ffd7a7e12dcfd2c8910bb29a9bc52a`
- 範圍：修正指定主張與重複的操作清單／結論；保留原始 publishDate、slug、cover、series 與圖解。不修改站台或安全設定。

## 官方來源與可支持的主張

1. [Bot Fight Mode — Rules](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/#rules)：普通 Bot Fight Mode 不在 Ruleset Engine，WAF custom rules／Page Rules 的 Skip、Bypass、Allow 不適用。文件另說明可從 Security Events 的 Service 欄位辨識該產品。不可把 SBFM 的例外能力套用到 BFM。
2. [Super Bot Fight Mode — Configure exceptions](https://developers.cloudflare.com/bots/get-started/super-bot-fight-mode/#configure-exceptions-to-super-bot-fight-mode)：WAF custom rule 的 Skip 可略過 SBFM 階段，請求仍經過其他安全檢查。文件概述段落有較籠統的限制敘述，本次以明確的例外與 Ruleset Engine 章節判斷能力。
3. [Managed robots.txt — Existing file](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/#existing-robotstxt-file)：來源端既有檔案回應 200 時，在前方加入託管內容。範例限制 GPTBot、ClaudeBot 等，未列出對 OAI-SearchBot／ChatGPT-User 的禁止規則。實際政策須讀正式合併回應，不能宣稱必然破壞自訂放行。
4. [Configure AI bot policies](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/)：目前文件區分 Search、Agent、Training，並提供全頁阻擋、廣告頁阻擋與 Allow 選項。原 legacy 開關名稱不能代表所有 crawler 的用途與實際處理結果。
5. [Manage AI crawlers](https://developers.cloudflare.com/ai-crawl-control/features/manage-ai-crawlers/)：可逐 crawler Allow／Block。失敗請求可能來自其他規則或回應錯誤；Free plan 的辨識以 UA 為基礎，不能把可偽造的 UA 當作可信來源驗證。
6. [OpenAI Crawlers](https://developers.openai.com/api/docs/bots)：OAI-SearchBot 用於搜尋；GPTBot 用於可能的模型訓練；ChatGPT-User 用於部分使用者觸發操作，不負責搜尋收錄，robots.txt 可能不適用。官方公布各自 IP 範圍。沒有官方資料支持「99% 讀取失敗來自邊緣阻擋」。
7. [Introducing Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/)（2026-02-12）：公布該篇文章 HTML 16,180 tokens、Markdown 3,150 tokens，約減少 80%；支援已啟用 zone 的 Accept: text/markdown 協商。這是單頁輸入量案例，不能外推所有頁面、整體 Agent 成本或引用率。

## 作者建議與未實測範圍

先對照 HTTP 狀態、edge events 與 origin logs 定位產品，再以必要公開路徑與已驗證來源縮小例外；普通 BFM 若確認誤擋，評估全域停用的防護取捨或改用支援例外的產品。保留其他防護。Markdown 的實際比例及引用成效須另測。

本次只查核官方文件，沒有修改或實測 CarlStack Cloudflare 安全設定，也沒有取得足以量化讀取失敗比例或引用提升的實驗資料。
