# Go JSON v2 線上資料契約遷移查核

查核日：2026-11-05 Asia/Taipei。文章：`src/content/blog/go-json-v2-wire-contract-migration.md`。

## 去重與定位

在 main `eed6f5843ad40ac754a21860f76c059981182e04` 的 `src/content/blog`、`docs/research` 與文章佇列，搜尋主來源 URL、jsonv2、encoding/json/v2 及序列化、omitempty、MarshalJSON 等詞，未見同一來源或相同論點文章。Trail 未安裝且沒有 cache，使用限定範圍文字搜尋。

相近的 API 合約測試、Avro schema 演進和 MINA 分支遷移文章，各處理不同契約層次。本篇聚焦 Go codec 預設值改變，連結既有合約測試文章。系列為「現代網路協定與 API 平台架構」第 28 篇，配置時檢查正式與草稿文章。

## 一手來源

- https://go.dev/blog/jsonv2 ：2026-11-04 公告 v2／jsontext 在 Go 1.27 穩定提供。
- https://go.dev/doc/go1.27 ：v1 改由新實作支援但保留既有語意，錯誤文字可能變化；v2 拒絕重複名稱與非法 UTF-8。未使用實驗期已移除的 format／unknown tags。
- https://pkg.go.dev/encoding/json#hdr-Migrating_to_v2 ：nil 集合、omitempty／omitzero、指標接收者可取址性和 map key 自訂方法的遷移差異。
- https://pkg.go.dev/encoding/json/v2 ：精確大小寫匹配與預設忽略未知欄位；UnmarshalRead 單值／EOF、UnmarshalDecode 串流；Deterministic 僅保證相同 binary，自訂 marshaler 仍須配合。
- https://pkg.go.dev/encoding/json/jsontext#Value.Canonicalize ：RFC 8785 JCS 與 double precision 限制。

## 原創案例與限制

原始 bytes fixture、Reply{} 型別、consumer 驗證、拒絕輸入不得先發生業務副作用，以及分開比較語意和簽章 bytes，均為本文的工程建議。Go 範例未執行，結果依文件推導；沒有產品效能量測或完整涵蓋所有遷移差異的主張。正文已明示限制。

原創封面採玻璃模具與凹凸零件的攝影式靜物，青綠／琥珀色、冷灰背景，對應交換資料前核對形狀。與同批核心修補的木刻水道封面在媒材、構圖、色盤均不同；全尺寸與 320×200 卡片已檢視。網站使用 1600×900 WebP。

## 發布驗收

已依內容指南、schema 與繁中寫作規範檢查；獨立來源審稿通過。技術檢查與部署結果以本次 main commit 的 CI 及發布收據為準。未將編譯、案例或正式環境修補宣稱為已實測。
