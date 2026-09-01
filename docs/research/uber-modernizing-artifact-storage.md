# Uber artifact storage 現代化：來源查核筆記

> 主來源：<https://www.uber.com/gb/en/blog/modernizing-artifact-storage/>（2026-05-28）
>
> 研究日期：2026-09-01

## 可用事實

| 主張                                                                                                                                     | 一手來源                                                                                                                           | 寫作界線                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 舊平台在兩個資料中心各有五節點叢集，複寫因子為 3，並以非同步複寫與 cron 補償複寫缺口。                                                   | [Uber：Legacy architecture](https://www.uber.com/gb/en/blog/modernizing-artifact-storage/#challenges-of-the-legacy-architecture)   | 這是 Uber 的舊系統，不能推論所有自管 artifact repository 都會有相同風險。                                                                        |
| Uber 改採跨區域的 SaaS artifact 平台，以雲端 blob store 取代節點本機磁碟；每月 artifact download 超過 5 PB。                             | [Uber：Architecture](https://www.uber.com/gb/en/blog/modernizing-artifact-storage/#architecture)                                   | SaaS 供應商、成本單價與完整延遲分布未公開。                                                                                                      |
| 為降低重複下載造成的 egress，proxy 記錄 URL、checksum 與 last-modified，並以 `If-None-Match`／`If-Modified-Since` 對 origin 做每次驗證。 | [Uber：Introducing a Proxy Layer](https://www.uber.com/gb/en/blog/modernizing-artifact-storage/#introducing-a-proxy-layer)         | 這是 purpose-built validation proxy，不等同於一般 TTL cache。                                                                                    |
| origin 回 `304 Not Modified` 時 proxy 從快取提供 bytes；回 `200 OK` 時串流給 client，並非同步更新快取。                                  | [Uber：How It Works](https://www.uber.com/gb/en/blog/modernizing-artifact-storage/#how-it-works)                                   | HTTP 條件請求的通用語意見 [RFC 9110 §13](https://www.rfc-editor.org/rfc/rfc9110.html#name-conditional-requests)；Uber 具體實作仍只適用於其情境。 |
| cache 或 MySQL 失效時可切為 passthrough，主張把故障降級成較高成本／延遲而非犧牲正確性；partial download 必須驗證完才寫入 cache。         | [Uber：Failure Modes and Mitigations](https://www.uber.com/gb/en/blog/modernizing-artifact-storage/#failure-modes-and-mitigations) | 這不代表 origin 故障時仍能保證可用性。                                                                                                           |
| Uber 公布 egress 減少逾 99%、proxy layer 整體可靠度 99.99%，但數字為該團隊的生產觀察。                                                   | [Uber：Results and Impact](https://www.uber.com/gb/en/blog/modernizing-artifact-storage/#results-and-impact)                       | 不能將數字寫成一般團隊可複製的成果。                                                                                                             |

## 可交叉核對的通用限制

[Google Cloud Storage 的一致性文件](https://docs.cloud.google.com/storage/docs/consistency)明確提醒，允許被快取的公開物件可能在 cache lifetime 內提供舊版本；這支持「TTL 與正確性需求要分開設計」，但不代表 Uber 使用 Google Cloud Storage 或該文件描述其 SaaS 平台。

## 不應寫進成文的推論

- Uber 並未公開採用哪一個 SaaS artifact 平台、其 MySQL schema、完整 failover 實作或實際成本。
- Range request、node-local hot cache、request coalescing 與 backpressure 是原文列出的後續方向，不可描述為既有功能。
- 這個 proxy 並非所有專案的預設解；若 artifact URL 不可變、流量小或既有 CDN 已滿足需求，TTL／immutable cache 會是更簡單的選擇。
