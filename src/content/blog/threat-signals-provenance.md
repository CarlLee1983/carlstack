---
title: "Threat Signals 的工程啟示：抽取情報時，別切斷原文與決策的關係"
description: "Cloudflare 將 RSS 資安報告轉成私人威脅資料集。本文拆解來源追溯、受控標籤與 WAF 決策邊界，提出文件解析與知識庫工具可採用的資料契約及驗收案例。"
publishDate: 2026-09-30T11:31:18+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - 系統設計
  - 資訊安全
series: AI Agent 工程化與工作流實戰
seriesOrder: 38
cover: ../../assets/covers/threat-signals-provenance.png
coverAlt: "深藍檔案櫃前的半透明情報卡，以紅線連回一份原始研究報告，表示結構化資料必須保留可回查的來源。"
---

一篇資安報告提到某個 IP，不表示這個 IP 現在就該被封鎖。它可能是攻擊基礎設施，也可能是受害主機、研究者使用的測試位址，或已經換了用途的舊紀錄。把文章裡的字串抽出來很容易；讓下一位分析師知道它為什麼出現在資料庫裡，才是文件解析工具需要交付的能力。

Cloudflare 在 [2026 年 9 月 29 日推出 Threat Signals](https://blog.cloudflare.com/threat-signals/)，將選定的 RSS 報告轉成帳號私有的結構化威脅情報。對正在設計文件解析與知識庫工具的工程師，我認為最值得借用的設計是：每個抽取結果都應保留回查證據的路徑，執行決策則另外驗收。本文依發布公告與官方文件分析，沒有登入實測產品，也不把發布隔天的少量轉載當成成熟採用證據。

## 免費的是情報入口，阻擋能力要另外確認

依發布當日公告，所有 Cloudflare 帳號可透過 API 與 Dashboard 使用基本能力：選擇一個 RSS feed，建立最長保留 30 天的私人資料集，並調查其中的事件、指標與標籤。企業方案可擴充 feed 數量、保存選項、自訂 skills 與專有情報存取。這是截至 2026 年 9 月 30 日的方案快照，採用前仍應確認帳號實際權限。

情報可讀與規則可執行是兩個問題。[Threat Events 建立 WAF 規則的官方更新](https://developers.cloudflare.com/changelog/post/2026-06-08-create-waf-rules-from-threat-events/)描述了 saved view 轉成規則的能力；發布公告則將自訂威脅事件 WAF 規則列在企業方案擴充項目中。[Threat Signals API 文件](https://developers.cloudflare.com/api/resources/cloudforce_one/subresources/threat_signals/)也明列 Free plan 配額與預設 skills 限制。試用時應先驗證資料能否支援調查，再確認規則權限與觀察工具，不能從免費入口推導出完整自動防禦能力。

30 天保存上限也會影響知識庫設計。如果一項調查在兩個月後才被重開，你需要自己的保留政策與合法保存方式；不要假設上游私人資料集會永久替你保管調查證據。

## 把文章與指標做成可查詢的關係

公告描述的處理路徑包含 RSS 輪詢、Browser Run 取得可讀 Markdown、R2 保存文字，以及指標抽取與 skills 處理。結果形成私人 Threat Event，事件、指標、標籤和來源報告保持連結。這說明了產品的資料路徑，沒有證明它對任何文章都能正確判讀。

API 提供了更具體的觀察面：[文章指標查詢](https://developers.cloudflare.com/api/resources/cloudforce_one/subresources/threat_signals/subresources/indicators/methods/list/)可依 `article_id` 或 `feed_id` 篩選；[Threat Events 的指標模型](https://developers.cloudflare.com/api/resources/cloudforce_one/subresources/threat_events/)則列出 `sources`，包含來源系統、文章資源 ID 與標題。工程上應檢查這些關聯能否回到實際文章，而不只是顯示一個來源名稱。

以下是我建議給自建解析器的概念契約，並非 Cloudflare API 格式。位址與網域都是示例；沒有原文證據時，角色應維持 `unknown`。

```yaml
observation:
  type: ipv4
  raw_value: "192[.]0[.]2[.]10"
  normalized_value: "192.0.2.10"
  role: unknown
  source:
    document_id: report-001
    url: https://example.org/reports/sample
    fetched_at: "2026-09-30T03:00:00Z"
    snapshot_id: report-001-revision-1
    evidence_locator: paragraph-12
  extraction:
    skill_version: ioc-context-v1
    schema_version: "1"
  review:
    status: pending
    action: none
```

這個設計保留原始表示與正規化值，讓人能確認轉換是否改錯；文件快照與段落位置則讓人重建當時的判讀。來源 URL 只能找到頁面，不能保證頁面內容沒有變動。快照、抽取版本與審查狀態是本文提出的設計要求，不是宣稱 Threat Signals 已提供的欄位。

同一個指標可能由多篇報告提及。因此，去重應合併「同一個值」的索引，同時保留多筆觀察。不要用後來的文章覆寫先前的角色、時間與來源，否則一個查詢結果會把不同時期的敘述混成單一事實。

## Skills 的一致輸出，需要詞彙與版本約束

Cloudflare 的發布回顧提到兩項取捨：AI 標籤限定在帳號既有目錄中，並記錄標籤是自動套用還是由分析師加入。這讓使用者可以用熟悉的分類檢索，也能辨認哪些判讀仍需要人工確認。

套用到文件解析器時，我會把 skill 的責任縮小成具體轉換。例如「辨認指標在文章中的角色」，輸出 `attacker_infrastructure`、`victim`、`research_example` 或 `unknown`；無法判定就保留未知，不讓模型為了填滿欄位而猜答案。

這些列舉值是建議的自建分類。它們應由資料擁有者維護，搭配 schema 驗證與版本紀錄；人工更正也應留下來。下次更新 skill 時，才能測試它是否修正舊誤判，或又把已確認的受害主機改判成攻擊來源。提示詞版本與驗收方式可接著閱讀[用安全驗證約束 AI 開發](/blog/vibe-coding-security-verification/)。

## 可追溯不等於可信，更不等於可以封鎖

來源關聯解決的是「這個結果從哪裡來」，不能單獨回答「這個結果是否正確」或「封鎖是否划算」。原文可能有錯、情報可能過期，同一個位址也可能承載合法服務。保留來源讓錯誤可調查，不能讓錯誤自行消失。

[Cloudflare 的 WAF threat intelligence 文件](https://developers.cloudflare.com/waf/detections/threat-intelligence/)建議先以 Log action 測試，並結合 attack score 等其他訊號，再考慮阻擋。具體 action 與欄位仍受方案限制；若帳號沒有足夠觀察能力，就應先完成離線驗證。

對自建工作流，我建議採用以下停止規則：

1. 來源或證據位置不可回查，停止進入規則候選集。
2. 角色未知、報告互相矛盾或超出團隊設定的有效期，轉交審查。
3. 候選規則先觀察命中流量，檢查登入、付款、Webhook 與合作方整合等合法路徑。
4. 通過審查後才限縮範圍啟用，記錄負責人、到期日與撤回方式。

有來源但尚未驗證的指標，仍然只是候選情報。上述流程是工程建議；本文沒有提出實測誤判率，也沒有將其描述成 Cloudflare 的預設自動化行為。

## 用五份報告驗收，再擴大 feed 數量

試做解析與知識庫工具時，先準備五個小案例，比先接大量來源更有用：

- 一篇含明確攻擊指標的報告：檢查抽取值、角色與證據能否逐項對回原文。
- 一篇混有受害者與測試位址的報告：檢查它們是否被排除於阻擋候選之外。
- 同一篇報告的兩個版本：檢查重處理能否保留舊證據與更正紀錄。
- 兩篇對同一位址描述互相矛盾的報告：檢查系統是否保留衝突，而不是選一個順眼答案。
- 一篇夾帶要求模型改變任務的文字：檢查解析器是否仍只抽取資料，不把文件當成控制指令。

分別記錄抽取 precision、recall、證據可回查比例、角色誤判數與重處理差異。不要只計算摘要是否好讀；摘要可能流暢，資料關聯卻已經斷了。

下一步可以在 Dashboard 的 Application Security → Threat Intelligence → Threat Signals 選一個可信 RSS feed，逐筆核對結果；若做自建工具，就先以這五份文件驗收來源關聯與更正流程。等每一筆資料都能解釋清楚，再增加來源，最後才評估連接執行規則。

## 延伸閱讀

若資料含有模型補值，[Claude Science UV 星圖的來源與不確定性契約](/blog/claude-science-uvmap-provenance/)延伸討論如何將量測、估計與視覺檢查分開保存，避免展示圖抹去證據邊界。
