---
title: "Claude 寫出形式證明後，還要核對它證明的是哪個 binary"
description: "Anthropic 與 Theorem 將 OSS-Fuzz 入口轉成形式證明。分清研究規模、公開證明與部署產物，建立包含 binary、定理、機器模型及未涵蓋行為的驗收紀錄。"
publishDate: 2026-10-23T10:09:00+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - 軟體品質
  - 安全架構
series: AI Agent 工程化與工作流實戰
seriesOrder: 96
cover: ../../assets/covers/formal-verification-proof-scope.webp
coverAlt: "淡紫色透明方盒包圍白色分枝結構的一部分，左右仍有分枝伸在盒外，表達形式證明有明確涵蓋範圍。"
---

一個套件附上通過檢查的形式證明，部署團隊仍要回答：證明裡的執行檔，和現在要上線的產物是不是同一個？如果證明針對靜態 RISC-V binary，正式服務卻是動態連結的 x86 程式，兩者之間還有尚未驗證的差距。

Anthropic 在 [2026 年 10 月 22 日的研究公告](https://www.anthropic.com/research/formal-verification)中表示，與 Theorem 合作，讓 Claude 為 123 個開源程式庫的 239 個 OSS-Fuzz 入口產生約 1.8 億行 Rocq 證明。研究範圍包括小於 64 MB 的輸入，以及單執行緒、固定記憶體預算、Linux 上靜態連結 musl 的 RISC-V 執行模型。

這些是研究團隊公布的結果。我查閱公告與公開 repository，沒有重跑 Rocq、重建研究 binary，或驗證任何讀者的部署。下面的驗收紀錄是工程建議。

## 公開產物比研究總數更適合拿來決定第一個試點

[OSS Verify 公開 repository](https://github.com/theorem-labs/oss-verify-proofs)在查核時列出 25 個程式庫、60 個入口的證明。這是公開集合，和公告的研究總數有不同範圍。README 也明確區分「已寫出定理敘述」與「已有證明」，不能把待證項目的目錄數當成完成數。

對導入團隊而言，第一步應落在一個可取得的入口：找到對應定理、binary、建置來源與檢查方法。只有研究摘要、找不到產物時，就先列為研究候選，不把它加入正式安全保證。

這個區分也影響採購或內部提案。若提案說要重現公開結果，工作範圍要以公開檔案及其版本為準。研究團隊曾經完成更大的實驗，無法替手上缺少的證明檔案補上一個綠燈。

## 「沒有 sanitizer 錯誤」與「一定會結束」是兩個命題

公開 README 說明，證明針對指定 binary 與定理條件，比較 plain build 和 sanitizer build 的可觀測行為，並排除定理所定義的錯誤。它同時指出，發布集合中的證明沒有證明 `halts` 命題，因此不排除永不結束的執行。[定理與限制說明](https://github.com/theorem-labs/oss-verify-proofs#what-a-proof-does-not-say)

這讓服務端驗收有了具體分工。若讀取使用者提供的文件可能耗時過久，單次工作逾時、CPU／記憶體限額與取消機制仍要由執行環境處理。不能因為入口有形式證明，就刪除原本的資源限制。

同樣地，解碼後的資料是否符合業務要求，取決於定理寫了哪些性質。沒有被規格表達的錯誤，不能靠證明檢查器自動補齊。需要資料往返一致性，就檢查 harness 是否真的把這項性質寫進斷言，而非只確認程序沒有崩潰。

## 驗收紀錄要能指出哪一項改動會讓證據失效

我的導入方式會從一份範圍紀錄開始。以下是建議欄位，值都要從選定產物填入，不是官方工具的設定檔：

```yaml
# 團隊自訂的驗收紀錄範本，不能直接交給 proof checker 執行
artifact:
  upstream_commit: REQUIRED
  binary_sha256: REQUIRED
  build_recipe: REQUIRED
proof:
  statement_path: REQUIRED
  proof_revision: REQUIRED
  checker_version: REQUIRED
  allowed_assumptions: REQUIRED
scope:
  entry_point: REQUIRED
  machine_model_revision: REQUIRED
  input_and_memory_limits: REQUIRED
  termination_proved: UNKNOWN
production_gap:
  differences: []
  owner: REQUIRED
```

其中 `UNKNOWN` 代表沒有建立該保證，不能自動轉成 `true`。`production_gap.differences` 也不能因為沒人填就視為沒有差異；審查者要實際比對架構、連結方式、編譯選項、呼叫端和資源條件。

我會設定一條停止規則：**binary 身分、定理或機器模型有一項對不上，就停止沿用那份證明作為本次發布的保證。** 團隊可以繼續測試與調查，但紀錄必須顯示證據尚未接上新產物。

這和[供應鏈發布來源驗收](/blog/litellm-signed-release-provenance/)承接的是兩種問題。來源紀錄回答「產物從哪裡來」，形式證明回答「在指定模型和前提下，產物符合哪個命題」。部署放行需要把兩份紀錄指向同一個產物。

## Agent 能修補程式，修補本身就需要獨立審查

研究公告允許 Claude 在證明過程中修補缺陷，再對新程式產生規格與證明。公告也承認，若把程式改成什麼都不做，可能讓命題變得容易證明，因此另外記錄與稽核 patch。[研究的修補與 reward hacking 討論](https://www.anthropic.com/research/formal-verification)

對團隊試點，我會把 patch 的行為差異交給另一份驗收。至少確認合法輸入仍得到原本要求的結果，錯誤處理沒有被改成無條件成功，重要功能也沒有被移除。通過新定理，只代表新程式符合新命題，不代表產品需求保持不變。

這裡可以接上[Agent 的驗證能力與程式庫可驗證性](/blog/poteto-agent-trust-investment/)，但試點的完成條件要更具體：選定一個已公開入口，留下產物雜湊、命題、檢查結果與部署差異。差異還沒解釋完，就保留既有測試、fuzzing 和隔離限制，不把「有形式證明」當成整個程式庫的免檢標籤。
