---
title: "Go JSON v2 已穩定，換 import 前要比對線上資料契約"
description: "Go 1.27 的 encoding/json/v2 改變重複鍵、UTF-8、欄位匹配與空值預設。用輸入樣本、輸出快照與簽章位元組三組測試，區分編譯成功和 API 相容。"
publishDate: 2026-11-05T10:09:55+08:00
draft: false
featured: false
tags:
  - Go
  - API 設計
  - 軟體測試
  - 技術選型
series: "現代網路協定與 API 平台架構"
seriesOrder: 28
cover: ../../assets/covers/go-json-v2-wire-contract-migration.webp
coverAlt: "透明模具前並排放著青綠與琥珀色玻璃零件，不同凹凸形狀比喻資料交換前的相容性檢查。"
---

把 `encoding/json` 改成 `encoding/json/v2`，編譯器可能沒有意見，下游卻開始收到原本不存在的 `false` 欄位。這是資料契約變更，應該和工具鏈升級分開驗收。

Go 團隊在 [2026 年 11 月 4 日公告](https://go.dev/blog/jsonv2)，`encoding/json/v2` 與 `encoding/json/jsontext` 已在 Go 1.27 穩定提供。[Release notes](https://go.dev/doc/go1.27) 同時說明，舊 `encoding/json` 已由新實作支援，仍保留既有 marshal／unmarshal 語意，錯誤文字可能改變。繼續使用 v1 受到支援，不必把所有 import 一次替換。

以下行為依 11 月 5 日查閱的官方 API 文件整理。程式片段與測試案例是遷移設計，尚未實際執行，也沒有測量效能。

## 先保存原始輸入，才看得見解析器差異

只把舊程式解出的 struct 交給新程式重編碼，會漏掉輸入曾有重複鍵、大小寫差異或非法編碼。測試資料應保存原始 bytes，並標註入口、目的 Go 型別與預期接受或拒絕。正式流量取樣要去識別化，不能把憑證或個資直接放進 repository。

[Go 1.27 文件](https://go.dev/doc/go1.27) 確認 v2 預設拒絕重複成員名稱與非法 UTF-8。這兩類差異值得分開記錄：前者要找出哪個 producer 重複寫欄位，後者要追查字元編碼在哪裡損壞。把兩者統計成「新 decoder 錯誤率」，無法決定誰該修。

每個入口至少放入這些案例：

- `{"count":1,"count":2}`：驗收預期是拒絕，保留來源系統名稱，避免先轉 map 抹去重複資訊。
- 含非法 UTF-8 位元組的字串：用 bytes fixture 保存，避免編輯器自動替換字元。檢查失敗路徑沒有寫入業務資料。
- `{"Count":3}` 與 `{"count":3}`：對照同一個標記為 `json:"count"` 的欄位，驗證實際填入值，不能只檢查 `err == nil`。

第三項尤其容易漏。[v2 API](https://pkg.go.dev/encoding/json/v2#hdr-JSON_Representation_of_Go_structs) 預設精確區分大小寫，但未知欄位仍預設忽略。錯字可能變成零值而沒有錯誤。若入口採封閉 schema，可評估 `RejectUnknownMembers(true)`；若允許新舊客戶端並存，就要另外驗證必填欄位，避免隨手禁止所有擴充欄位。

## `null`、空集合與欄位缺席要各存一份快照

[官方遷移清單](https://pkg.go.dev/encoding/json#hdr-Migrating_to_v2) 列出兩個常見輸出變化：一般 nil slice／map 在 v2 變成空陣列／物件，`omitempty` 改按 JSON 空值判斷，因此 `false` 和 `0` 不再被它省略。`omitzero` 則依 Go 零值判斷。位元組 slice 另有字串表示，不要把一般集合案例直接套到 `[]byte`。

這段未執行的最小 fixture，刻意把三個變化放在同一個回應型別：

```go
type Reply struct {
    Ready bool              `json:"ready,omitempty"`
    Items []string          `json:"items"`
    Meta  map[string]string `json:"meta"`
}
// 分別交給 v1.Marshal 與 v2.Marshal，保存 Reply{} 的結果。
```

依文件推導，v1 的成員為 `items:null`、`meta:null`，v2 則有 `ready:false`、`items:[]`、`meta:{}`。這裡比較成員內容，不要求物件排列順序。

我的取捨是逐個 DTO 決定空值意義。若 `null` 表示「尚未載入」、`[]` 表示「查過但沒有結果」，直接採新預設會丟掉狀態。可以在該回應路徑明列 `FormatNilSliceAsNull(true)` 或 `FormatNilMapAsNull(true)`，並加上註解說明對應的客戶端需求。若契約要求零值欄位缺席，才把該欄位改為 `omitzero`，不要全站搜尋取代 tag。

驗收快照也要交給真正的 consumer。前端的預設值、事件處理器的分支，以及資料庫裡保存的舊 JSON，都可能區分缺席、`null` 和空集合。[站內的 API 合約測試文章](/blog/api-contract-testing-pact-fuzzing-mocking/)處理跨服務驗證，這次應把 codec 的邊界樣本補進既有合約案例。

## 自訂 marshaler 和讀取終點需要獨立測試

[遷移清單](https://pkg.go.dev/encoding/json#hdr-Migrating_to_v2) 還指出，v2 呼叫指標接收者的 `MarshalJSON` 不再受可取址性限制，map key 也可能呼叫 JSON 自訂方法。只測 `&value` 不夠，應把同一型別放進頂層值、struct 欄位、slice 與 map，保存各自輸出與錯誤。

對日期、金額或識別碼型別，測試要回答「哪個方法被呼叫」和「格式是否相同」。若同時新增 `MarshalJSONTo`，再比對舊方法的輸出，不要把實作改寫和預設值遷移混在一張難以定位的 diff。

讀取端則先確認協定允許幾個 JSON 值。[`UnmarshalRead`](https://pkg.go.dev/encoding/json/v2#UnmarshalRead) 要讀到 EOF，輸入須是單一 JSON 值；[`UnmarshalDecode`](https://pkg.go.dev/encoding/json/v2#UnmarshalDecode) 適合逐個讀取串流。

單一 HTTP body 的案例可放 `{"count":1} {"count":2}`，要求整份拒絕。真正的連續訊息串流則應驗證兩次成功讀值，接著正確處理結束。這是不同的應用契約。有限 body 還應測大小限制與讀取逾時，避免把等待 EOF 的行為接到不會結束的連線上。

## 穩定輸出還不足以決定簽章格式

v2 的 map 預設不保證順序。開啟 [`Deterministic(true)`](https://pkg.go.dev/encoding/json/v2#Deterministic) 後，原生 Go 型別的保證範圍是相同 binary 的不同執行實例，不涵蓋不同工具鏈或建置。自訂 marshaler 也要配合。

因此測試要先分用途。一般 API 回應可以比較語意，避免鍵順序造成無意義的快照失敗。簽章、內容雜湊與以原始 bytes 作索引的快取，則必須保存既有位元組並跨新舊版本驗證，不能只看解碼後相等。

[`jsontext.Value.Canonicalize`](https://pkg.go.dev/encoding/json/jsontext#Value.Canonicalize) 提供 RFC 8785 的 JCS 正規化，但數字按 IEEE 754 double precision 處理，超出可精確表示範圍會失去精度。訂單編號若是大整數，應先確認簽署雙方的表示規格，不能為了讓 snapshot 變綠就補一次 canonicalize。

## 差異報告要能回答「改誰」

雙跑只執行解析與編碼，不重送付款、通知或資料庫寫入。每筆結果附上樣本編號、舊結果、新結果、預期政策和負責修正的系統。這樣才能分清楚 producer 本來就在送模糊資料，還是 consumer 依賴一項合法但即將改變的表示。

接受集合也不必完全相等。決定拒絕重複欄位時，新的錯誤就是預期結果，測試應明列它。反過來，原本能讀取的正常回應若突然多出欄位，不能用「新版比較嚴格」帶過。它需要 consumer 測試或明確的版本變更安排。

保存的歷史 JSON 要另外選樣。線上流量可能已經沒有舊欄位拼法，資料庫備份或延遲訊息卻還有。拿一份舊事件經新 decoder 讀取，再交給真正的處理函式，核對產生的狀態。若只在新 producer 與新 consumer 之間 round trip，測不到這條恢復路徑。

## 一次遷移一個有 consumer 的入口

我會先挑一個低風險端點，固定工具鏈與 DTO，讓 v1、v2 對同一批去識別化資料各跑一次。報告分成拒絕差異、欄位值差異、輸出表示差異和位元組差異，每筆都附 fixture 與採用決定。刻意改成拒絕的輸入，也要確認業務副作用沒有先發生。

**任一仍在使用的 consumer 無法讀取新輸出，就暫停擴大遷移。**保留原 codec 路徑，修正或明列相容選項後重跑該案例。下一個 PR 應該包含一個端點的契約測試與可回復配置，再決定要不要換下一個 import。
