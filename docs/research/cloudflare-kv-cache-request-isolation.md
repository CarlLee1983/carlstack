# Cloudflare KV cache 跨請求隔離：來源與發布紀錄

## 題目與去重

- 查核日期：2026-10-27（Asia/Taipei）。
- 主來源／正規化 URL：https://blog.cloudflare.com/kv-cache-exposure-remediation/
- 作者：Kevin Flansburg、Michelle Chen（Cloudflare）。
- 穩定識別：kv-cache-exposure-remediation；事件模型 @cf/zai-org/glm-5.3。
- 搜尋 src/content/blog、docs/research、docs/article-queue.md 的 URL、GLM-5.3、文章 slug，未有同一事故文章。
- 既有 kv-cache-capacity-ledger 談容量／頻寬／重複，本篇聚焦跨請求頁面所有權與失敗生命週期，讀者決策不同，正文加入內鏈。
- 系列 AI Agent 工程化與工作流實戰第 91 篇，與本批第 90、92 篇協調預留。
- trail binary/cache 不存在，使用 repo 原始檔查核；沒有修改規則檔。

## 原文與段落對應

正式 Cloudflare 公開頁透過正常雲端瀏覽器全文讀取。原文由研究代理保存至 /tmp/oct27-cloudflare-source.txt（24,195 bytes），本文作者完整讀取，不以搜尋摘要代替全文。

- 導言／Timeline → 披露 10 月 26 日；事故 8 月 27 日至 9 月 9 日；9 月 9 日 19:40 UTC 恢復。155 回覆，prompt >681,280 tokens；僅指定模型。無蓄意利用證據為廠商調查聲明，不能寫成已證無攻擊。
- What happened／Issue one／Issue two → advertised context 1,048,576 vs prefill pool 681,280；pending rejection 與 finished 狀態不一致；一 token placeholder 傳一頁，decode 仍讀原先預留頁，回 HTTP 200。
- Immediate remediation／Working with SGLang → pool 約 2.04M；admission 提前拒絕；v0.5.20 最初修補、v0.5.21/.22 後續，官方建議 v0.5.22+。沒有宣稱所有 SGLang 部署已遭利用。
- Background／Ongoing hardening → RDMA in-flight write 無法召回，頁面重用與生命週期；兩角色 deferred release、bounded Mooncake batches、load balancer 行為。
- What we recommend → 實際啟動 pool 值、模型支援差異、checksum/canary 檢查應以日誌確認。

輔助協同披露 URL https://www.lmsys.org/blog/2026-10-26-cf-security 透過正常雲端瀏覽器完整讀取，保存 /tmp/oct27-sglang-source.txt。web 工具對非 www URL 回不可讀，未嘗試繞過限制。SGLang 的 Timeline 列明 #45973 對 NIXL/MORI failed-send drain 的後續修正在 v0.5.23，正文補入，避免把 Cloudflare v0.5.22+ 建議寫成所有 race 全修完。SGLang 並強調 timeout expiry 不等於 positive drain signal，正文保留此安全限制。

## 工程推論與未測範圍

- 發布門檻、合成雙租戶 canary、容量／取消／失敗測試組合與停止規則為作者工程建議，非 Cloudflare 的實測結果。
- 無 GPU 推論壓測、無 exploit 執行、無真實租戶資料測試。
- 不引用 page-tags prototype <1% 結果，以免誤示其已普遍支援；原文說 GLM5.2 prototype 曾因可靠性停用。
- 正文沒有可執行程式碼或承諾測試通過。

## 待整合驗收

封面由主發布代理正式生圖、設定精確 alt 並記錄尺寸與裁切；本作者僅提供暫定 coverAlt，需依實圖更新。技術 gates、production build、部署與 live 驗證由主發布代理執行並補記，不以本研究筆記視為通過。

## 獨立來源審稿

研究代理 research_oct27_ai_tech 完整對照兩篇原文後通過事實審查；依其建議補入 SGLang 曾拒絕同源傳輸長度比較的限制，避免將 length compare 誤示為充分隔離驗證。humanize checker 唯一命中為原文節名 Issue two: SGLang bug 的冒號，屬受保護來源標題保留。

封面生成與全尺寸/卡片驗收、預覽環境限制記錄見 [本批素材紀錄](mcp-toolbox-storage-allowlist.md#最終素材及預覽紀錄)。
