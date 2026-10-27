# 快取副本生命週期：來源與驗收

- 狀態：正文與原創圖片完成，交整合者跑最終 gates / 預覽 / 部署驗證。
- 查核時間：2026-10-27T07:56:00+08:00。
- 新文：`cache-copy-lifecycle-foundations.mdx`，後端工程基礎圖解 4。
- 使用者要求基礎知識例子擴充為今日完整內容；使用虛構公開文章收藏站，沒有私人專案資料。
- 已讀最新 AGENTS.md、content-guide、content.config.ts、copywriting/humanize skills、diagram-guide。trail CLI 與 cache index 不可用，改以路徑 / grep 核對正文。

## 去重與新讀者收穫

已讀 `order-system-cache-read-contract.mdx` 與既有 cache-aside pattern 文。新文只教原本/副本、key、hit/miss、fill、TTL 的基本心智模型。並行失效只指出限制並內鏈，不重寫讀己寫、版本與強一致方案。既有淘汰策略文章另連結，未重寫演算法。

## 段落對照與原文

| 段落        | 一手來源                                                                  | 查核事實                                                |
| ----------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| 命中/未命中 | https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside | miss 讀來源再填快取；不保證一致性，更新來源後使快取失效 |
| TTL 指令    | https://redis.io/docs/latest/commands/set/                                | SET EX 同時設定值與秒數期限                             |
| TTL 回傳    | https://redis.io/docs/latest/commands/ttl/                                | 剩餘秒數，-1 無期限，-2 不存在                          |
| 過期        | https://redis.io/docs/latest/commands/expire/                             | timeout 與 key 生命週期；非資料庫同步服務               |

全文原文已透過 web open 讀取，未用搜尋摘要代替。所有流量/秒數為教學假設；指令只是語意示意，未聲稱執行或壓測。快取命中率算式為推導，不是效能承諾。刪除失敗/舊讀回填為所述應用程式流程的失敗分析。

## 圖片與圖解

正式內建 imagegen，無參照第三方圖。提示：dark navy glass sculpture, solid pale document plus translucent cyan duplicate and hourglass, compact central composition, cold side light, no text/logo. 圖像用途為原本/副本/保存時間隱喻，不是系統拓樸。與前篇木刻索引封面在 medium / composition / palette / lighting 有差異。

`src/assets/covers/cache-copy-lifecycle-foundations.webp`：1536×1024，100430 bytes，quality 86。已目視原始全尺寸及中心 16:9、16:10 裁切：主體原本、副本、沙漏均完整；沒有文字、商標或假畫面，alt 與內容相符。原始 PNG 與裁切只在 /tmp/foundation-cache-queue 作驗收，不提交。

原生 SVG：`CacheCopyReadDiagram.astro`、`CacheCopyExpiryDiagram.astro`。各有唯一 title/desc、全 --dg-* 中性色、無固定寬高、獨立窄版 HTML 卡片、48rem 切換。實頁桌面/手機/深淺色目視交由整合者；此處未冒稱已完成。
