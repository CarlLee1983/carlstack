---
title: "Cloudflare 的 KV cache 外洩：HTTP 200 驗不出請求隔離"
description: "拆解 Cloudflare 10 月 26 日披露的 GLM-5.3 跨請求資料曝露，說明 prefill/decode 分離後，容量檢查、拒絕傳遞與記憶體釋放如何共同構成租戶隔離。"
publishDate: 2026-10-27T10:11:03+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - LLM推理
  - 資安
  - 系統設計
series: AI Agent 工程化與工作流實戰
seriesOrder: 100
cover: ../../assets/covers/cloudflare-kv-cache-request-isolation.webp
coverAlt: 兩張分開的紙面，一張有鮭紅圓形印記，另一張殘留同形淡印，象徵前一個請求的資料意外進入下一個回覆。
---

Cloudflare 在 2026 年 10 月 26 日[公開調查報告](https://blog.cloudflare.com/kv-cache-exposure-remediation/)，確認 Workers AI 的 `@cf/zai-org/glm-5.3` 曾把其他客戶請求的資料帶進回覆。曝露期間是 8 月 27 日至 9 月 9 日，服務已於 9 月 9 日修復並恢復；這是修復後披露，並非 10 月 26 日才開始的事故。

依 Cloudflare 調查，共有 155 筆回覆受影響，對應的 prompt 都超過 681,280 tokens。公司表示其他 Workers AI 模型未受影響，排除研究者與自家測試後，也未發現蓄意利用證據。這不等於證明沒有攻擊，更不宜延伸成所有 SGLang 部署都曾外洩。

以下事故事實依公開報告整理，驗收方案則是工程建議，沒有在真實租戶或 GPU 叢集上實測。**HTTP 成功與文字可讀，不能作為租戶隔離通過的證據。**

## 超過容量的請求，竟然繼續生成

這個部署把工作拆成兩組 GPU：prefill 處理輸入、產生 KV cache，再透過 Mooncake 與 RDMA 傳到 decode 節點，由後者生成回覆。模型設定允許 1,048,576-token context，prefill 的 KV pool 卻只裝得下 681,280 tokens。

Cloudflare 上線前已知道容量差距，但長 context 測試收到了成功的 HTTP 狀態與沒有錯誤訊息的串流，因此以為引擎能處理。問題在於 SGLang 的拒絕路徑沒有跨節點完整傳遞。

超長請求被標記為待拒絕，prompt 也換成一個 token 的佔位內容，準備經過一般批次流程後回傳錯誤。然而，分離模式的接納佇列只問「請求是否結束」，待拒絕的請求仍被視為存活。prefill 於是傳出佔位內容的一頁 KV，並通知傳輸完成；decode 卻按原始長 prompt 預留的頁數繼續讀取。

只有第一頁被這次請求覆寫，其餘頁面仍可能存有前一個請求的資料。回應可以是 HTTP 200，也可以讀來連貫，只是連貫的內容不屬於這個使用者。這段機制與各階段判斷，可對照官方報告的 [Issue two: SGLang bug](https://blog.cloudflare.com/kv-cache-exposure-remediation/)。

對後端工程師而言，這和把「工作完成通知」誤認為「全部預期資料已驗證寫入」很接近。跨節點訊號必須攜帶並核對請求狀態與資料範圍；單靠一個完成旗標，收件端無法知道自己正在讀什麼。

## 容量補足，拒絕路徑仍要修

Cloudflare 同時改了設定與引擎。prefill pool 擴大到約 204 萬 tokens，使合法 context 能放得下；引擎則在分離模式的接納階段就處理待拒絕請求，保留原始錯誤，不再進入 bootstrap、配置或 KV 傳輸。

兩者處理不同風險。容量檢查能防止這次設定重演；拒絕路徑則保護下一次權重、量化、平行度或 CUDA graph 改變後，pool 大小再次變動的情況。官方建議分離部署的營運者升到 SGLang `v0.5.22` 以上；最初事故修補在 `v0.5.20`，後續修正在 `v0.5.21`、`v0.5.22`。[修補與部署建議](https://blog.cloudflare.com/kv-cache-exposure-remediation/)

我會把容量檢查設成發布條件：從每台 prefill、decode 引擎啟動後的實際日誌或指標取值，與允許的 context 比對。若不足，就降低 context 上限或重新配置後再驗收，不能僅依部署 YAML 宣告的數字判定。既有的 [KV cache 容量帳本](/blog/kv-cache-capacity-ledger/)用來判斷記憶體花在哪裡，這裡還要追問這些頁面現在屬於哪個請求。

## 客戶斷線，不代表遠端已停止寫入

官方同時說明另一類相關競態。decode 若在取消時立刻釋放頁面，prefill 已送出的 RDMA 寫入無法收回，晚到的資料可能落在下一個請求剛取得的頁面。這與本次「拒絕後仍接納」是不同失敗路徑，卻會破壞相同的隔離條件。

因此取消狀態與記憶體可回收狀態應分開。Cloudflare 的後續加固包括 prefill、decode 兩端的延後釋放、限制 Mooncake 傳輸批次，以及調整負載平衡器，避免客戶斷線立即引發傳輸中的取消。[後續加固說明](https://blog.cloudflare.com/kv-cache-exposure-remediation/)

[SGLang 同日公告](https://www.lmsys.org/blog/2026-10-26-cf-security)另外列出 NIXL、MORI 傳送失敗卻被誤認為已排空的修正 `#45973`，預定隨 `v0.5.23` 提供。因此 `v0.5.22+` 是 Cloudflare 的升級建議，不能解讀為所有傳輸後端的相關競態已一次修完。選版仍須核對使用的後端與補丁。

這裡有明確代價：多保留頁面會占住容量，等待傳輸排空也會延長清理時間。驗收應同時量延後釋放的數量、耗時與原因，區分收到排空確認和等到逾時。SGLang 特別提醒，逾時本身不證明寫入已停止，安全性仍取決於寫入在保留期間內排空。若只看可用 GPU 記憶體恢復得多快，反而可能獎勵過早釋放。

## 用合成租戶資料檢查輸出邊界

對自建推論服務，我建議在隔離測試環境安排兩個測試租戶，各自使用不同、無私人資料的 canary 標記。測試涵蓋正常長輸入、容量邊界、主動取消及傳輸失敗，檢查輸出有沒有出現另一個租戶的標記，並核對拒絕請求是否在 KV 傳輸前終止。這是測試設計，沒有執行上述故障注入。

canary 沒出現也不足以證明安全，還要檢查可獨立驗證的頁面所有權、生命週期與錯誤狀態。SGLang 曾評估傳輸長度比較，卻因兩邊數字來自同一套 prefill 計算而未採用；重複核對同源數字，無法補上獨立驗證。官方提供 KV checksum 與 canary 機制，但目前沒有涵蓋所有模型架構；開了旗標後，仍須確認日誌顯示請求確實受檢查。不要把「設定存在」寫成「保護已生效」。

**任何跨租戶標記、拒絕後仍生成，或傳輸未排空便重用頁面的情況，都應阻止擴大流量。** 下一次調整長 context 設定時，讓發布紀錄附上實際 pool 大小、拒絕結果與隔離測試證據。吞吐量報表可以接著看，這三項不能靠 HTTP 200 補交。
