# PostHog Jeeves 來源研究

- 查核日期：2026-09-30，台北約 12:10。
- 主來源：https://github.com/PostHog/jeeves
- 固定版本：f04ec5567301450dcaae0210dd54deeb4f647f87（master）。
- 去重：以 Jeeves、PostHog/jeeves 與 HN 49891290 搜尋 blog、research、queue，無既有 Jeeves 文。Jev 文論點是決策／生成責任分離；新文論點為自架推理決策服務的 Story 驗收，兩篇互鏈。
- 交付：新文納入 AI Agent 工程化與工作流實戰，第 40 篇。

## 事實與邊界

- README：Qwen3.5-9B、LoRA、pointer head；thinking 生成推理链後評分，不可說全程單次前向傳遞。
- Results：公開 JevBench 231 題 0.935；sealed judge 未納入。非 JevBench 比較不同題目，不能視為配對比較。
- Options：325 題 dev，完整 thinking accuracy 0.825／p90 17.1s；768 + 0.9 為 0.806／5.6s；不思考 0.775／約 0.3s。另 2962 題 0.804／0.840 與 overall 0.889 不能混用。皆為作者報告，本文未實跑 GPU。
- inference/api.py：choice confidence 正規化最高機率相對均勻基準，非正確概率；score 是級距索引期望值；noul 是 true 機率。
- inference/serve.py：預設 127.0.0.1；不將 quickstart 描述成生產服務保證。
- README：MIT repository；公開資料集各自授權。
- HN：2026-09-29T11:13:54Z 提交，快照 232 分／89 留言。不能將 HN 時間認定首發。
- TN1ck 的 M5 Pro 實驗為個人留言，不當作官方 CUDA 支援或 H100 效能。

## 可追溯來源

- https://github.com/PostHog/jeeves/blob/f04ec5567301450dcaae0210dd54deeb4f647f87/README.md
- https://github.com/PostHog/jeeves/blob/f04ec5567301450dcaae0210dd54deeb4f647f87/inference/api.py
- https://github.com/PostHog/jeeves/blob/f04ec5567301450dcaae0210dd54deeb4f647f87/inference/serve.py
- https://news.ycombinator.com/item?id=49891290
- https://hn.algolia.com/api/v1/items/49891290
- https://news.ycombinator.com/item?id=49891626
- https://news.ycombinator.com/item?id=49892563
- https://news.ycombinator.com/item?id=49893066
- https://github.com/fstandhartinger/jevbench/blob/main/docs/METHOD-v1.4.md

## last30days 覆蓋

引擎成功完成 115.5 秒。原始檔：/Users/carl/Documents/Last30Days/posthog-jeeves-raw-v3.md。近期直接相關證據為 GitHub、HN 與一支 YouTube 轉述；Reddit 與 Digg 多為 Jev 或無關主題，不作 Jeeves 社群共識。X 未啟用；jobs unreachable 不代表沒有討論。WebSearch supplements 已附於 raw 檔。

## 封面方向

採 built-in imagegen。提示：16:9 editorial cover, tactile layered paper-cut sculpture, burnt orange/terracotta/cream, asymmetric side view; story cards enter a decision booth and leave through three channels, one clear, one winding, one queued beside an hourglass; warm raking light, no text/logos/circuit boards/robots。相對 Jev 青色電路與最近 Cloudflare 白綠金屬封面，媒材、構圖、主色均有區別。
