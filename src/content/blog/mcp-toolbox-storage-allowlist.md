---
title: MCP Toolbox 升級後，仍要設定檔案路徑與 Bucket 的 allowlist
description: CVE-2026-93328 揭露 cloud-storage 工具的檔案存取風險。從官方修補的預設允許行為，拆解版本、明確 allowlist 與執行身分如何共同決定工具能碰到哪些資料。
publishDate: 2026-10-27T10:11:03+08:00
updatedDate: 2026-11-05T22:50:00Z
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - API 整合
series: AI Agent 工程化與工作流實戰
seriesOrder: 99
cover: ../../assets/covers/mcp-toolbox-storage-allowlist.webp
coverAlt: 深藍色布面工作墊上的兩個獨立金屬框，分別圈住檔案卡與儲存容器，表達本地路徑及雲端目的地需要各自限制。
---

一個替 Agent 上傳檔案的工具，同時握有兩種能力：讀取主機上的路徑，以及把資料送往雲端 Bucket。只限制其中一端，另一端仍可能超出任務所需。

Google Cloud 在 2026 年 10 月 26 日公開的 [CVE-2026-93328](https://github.com/CVEProject/cvelistV5/blob/main/cves/2026/93xxx/CVE-2026-93328.json)，影響 MCP Toolbox for Databases 的 `cloud-storage` source，版本範圍為 `1.2.0 ≤ version < 1.5.0`，CVSS 4.0 評分 9.3、Critical。官方描述指出，未認證遠端攻擊者可透過工具呼叫參數，將主機檔案傳往外部 Google Cloud Storage Bucket，或覆寫本地檔案。這份通報描述的是漏洞能力，沒有提供實際入侵事件的證據。

這次公開通報要求升級至 1.5.0 或更新版本，也要求設定存取邊界。兩件事必須一起驗收。

11 月 5 日重新核對 CVE 紀錄、PR 與固定修訂的原始碼，並在本地解析下方 YAML、檢查設定政策的正反例。沒有啟動 Toolbox、連接 GCS 或執行漏洞重現，後面的上傳與拒絕案例是部署驗收計畫。

## 修補加入了開關，沒有替部署選好範圍

相關 [PR #3454](https://github.com/googleapis/mcp-toolbox/pull/3454) 在 6 月 18 日已合併。10 月 26 日是 CVE 公開日期，修補較早就已合併。

[修補中的文件與程式碼](https://github.com/googleapis/mcp-toolbox/pull/3454/files)加入兩個欄位：`allowedLocalRoots` 限制本地目錄，`allowedBuckets` 限制 GCS Bucket 名稱。文件對預設值寫得很清楚，省略前者允許所有路徑，省略後者允許所有 Bucket；實作在清單長度為零時也不套用這項 allowlist。因此空陣列不代表拒絕全部。

這裡的「允許所有」指該項 allowlist 不限制範圍。路徑仍先經過共用的格式檢查，實際存取也受作業系統權限與 GCP IAM 限制。但若工具行程本來就有廣泛權限，僅更換 binary 並不能證明業務資料已被隔離。

**結案條件應是「新版支援限制，而且實際部署已套用非空的明確範圍」。** 版本掃描可以證明第一半，證明不了第二半。

[PR 最後修訂的實作](https://github.com/googleapis/mcp-toolbox/blob/41a17ae669b767bd521ab8db63b6cbcfe986f304/internal/sources/cloudstorage/cloudstorage.go)還有一個範圍差異：`ListBuckets()` 依專案列出 Bucket，沒有套用 `allowedBuckets` 過濾。這份清單約束有呼叫驗證函式的操作，不能拿來保證所有 Bucket 名稱與中繼資料都不可見。若任務只需要上傳，就只提供必要工具，並另外收斂 IAM 的列舉權限。這裡核對的是該修訂，後續版本仍要查實際實作。

## 用匯出報表的任務縮小兩端權限

假設一個虛構的訂單服務每天產生去識別化報表，Agent 只負責把完成檔案傳到指定 Bucket。它不需要讀取應用程式設定，也不需要任意選擇上傳目的地。

最小方案是在報表產生端與 Toolbox 之間設一個專用交換目錄。該目錄只放這項任務的輸入輸出，不混入其他租戶檔案、備份或憑證；Bucket 清單也只列出獲准的實際名稱。專案名稱本身不應被當作這兩份 allowlist 的替代品。

下列 source 設定採用修補文件的欄位，路徑及資源名稱均為教學假設：

```yaml
kind: source
name: order-export-storage
type: cloud-storage
project: example-orders-project
allowedBuckets:
  - example-orders-redacted-export
allowedLocalRoots:
  - /srv/order-export-exchange
```

`allowedBuckets` 比對完整 Bucket 名稱，不是 `gs://` URL，也不是 glob 規則。`allowedLocalRoots` 按文件填絕對目錄，並使用 Toolbox 行程所在環境看見的路徑；容器內的掛載位置可能與主機路徑不同。這段只定義 source，仍須由部署設定選擇要公開的工具及呼叫權限。

若任務需要處理不同客戶，將所有客戶目錄塞進同一份清單，會讓這個工具實例取得所有列入範圍。我會先評估按信任範圍拆開工具實例及執行身分。這兩份清單是 source 層級設定，不會自動隨呼叫者切換租戶範圍。

這比一個共用實例多了設定與維運成本，但拒絕與稽核的對象更清楚。資料不敏感、呼叫者相同且資源完全共用時，單一實例仍可以是合理方案；是否共用，應由資料與身分邊界決定。

## Allowlist 還要與執行身分取交集

公告同時建議使用非特權作業系統帳號與最小 IAM 權限。這兩層有不同工作：本地帳號限制行程能讀寫什麼，雲端身分限制它能對哪些資源執行哪些操作，Toolbox 設定再縮小工具介面接受的範圍。

因此，將 `allowedLocalRoots` 設成根目錄，即使欄位不是空的，也沒有達成隔離。將 Bucket 列滿所有資源，同樣只完成語法，沒有完成權限設計。若業務只要上傳，就應另外核對雲端身分是否仍有不必要的讀取、刪除或管理權限；實際授權需依所用工具操作及服務文件決定，不能在沒有驗證時承諾某個角色一定足夠。

工具的可達性也要納入清查：誰能連到服務、誰能呼叫該 source，以及代理層是否確實執行預期驗證。MCP 工具描述告訴模型如何使用功能，並不替部署建立使用者授權規則。這與站內 [Agent 工具目的地憑證的邊界](/blog/splunk-mcp-destination-credential-boundary/)處理相近問題，能力與憑證都必須綁定實際獲准的資源。

## 驗收要檢查拒絕原因與實際設定

驗證環境應使用合成報表與專用測試 Bucket，不把生產憑證或真實客戶檔案當測試材料。

先確認一個合法案例：交換目錄中的測試檔可以到達允許的測試 Bucket，內容及預期結果一致。接著分開測試兩個拒絕案例：合法目錄搭配清單外的測試 Bucket，以及合法 Bucket 搭配交換目錄外、同樣由測試者建立的無敏感測試檔。兩者都應在產生非預期副作用前被拒絕。記錄拒絕來自哪一層：若只看到 GCS IAM 拒絕或檔案不存在，還沒有證明 Toolbox 的 allowlist 生效。另以無敏感測試資料檢查下載目的地，因為這次風險也包括本地寫入。

路徑案例除了目錄外檔案，也應包含名稱相近的鄰接目錄與正規化後越界的路徑。交換目錄的寫入者、符號連結與掛載方式要另行審查；字串路徑限制不能代替作業系統的檔案隔離。

還要檢查最終部署載入的設定，而非只看 Git 中的 YAML。環境模板漏傳欄位、把值渲染成空清單、更新服務卻仍掛載舊設定，都可能讓審查過的意圖沒有進入執行環境。保存版本、實際設定摘要、執行身分與正反案例結果，才能在下一次發布時比較。

若目前無法完成這些驗收，較保守的處置是暫停不必要的 `cloud-storage` 能力或限制服務可達範圍，待升級及權限驗證完成再恢復。這是降低曝露的工程建議，不取代官方修補。

今天可以做的第一步，是找出每個啟用 `cloud-storage` 的 Toolbox 實例，問出兩個具體答案：它允許哪幾個本地目錄，又允許哪幾個 Bucket？「已升級」之外，還需要能拿出實際範圍與拒絕結果。
