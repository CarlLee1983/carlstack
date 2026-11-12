---
title: "AWS Emulator 的本機測試範圍"
description: "AWS 推出官方 API 模擬器。以訂單附件流程說明如何查操作覆蓋、處理 501、隔離測試資料，以及哪些權限與整合測試仍需留在 AWS。"
publishDate: 2026-11-12T10:07:12+08:00
draft: false
featured: false
tags:
  - 開源專案
  - 系統設計
  - API 整合
cover: ../../assets/covers/aws-emulator-local-testing.webp
coverAlt: "薄荷綠玻璃製成的迷你資料中心放在工作桌上，後方隔著玻璃可見實體機房，呈現本機模擬與雲端環境的差別。"
repositoryUrl: https://github.com/aws/aws-emulator
---

[AWS 在 2026 年 11 月 11 日推出 AWS Emulator](https://aws.amazon.com/about-aws/whats-new/2026/11/aws-emulator-now-available/)，讓現有 AWS SDK 與 CLI 對本機端點發送請求。這很適合縮短開發時建立測試資源的等待，但是否能搬走某一組整合測試，還要逐一對照它實際使用的操作。

假設訂單服務會把附件寫入 S3，再把物件位置存進 DynamoDB。開發者要檢查的包括上傳成功、同名物件處理、資料寫入失敗後的清理，以及查詢不存在的訂單。模擬器若涵蓋這些行為，就能提供較容易重設的測試環境。部署角色是否有權讀取附件，則另留一組 AWS 測試。

以下依 11 月 12 日讀取的官方文件整理。訂單流程與驗收清單是教學設計，沒有執行 AWS Emulator、建立雲端資源或測量效能。

## API 名稱相同，還要比對操作結果

[官方專案](https://github.com/aws/aws-emulator)使用 AWS API model 建立通訊介面，實作以各服務的操作及記憶體狀態組成。README 指出 Linux 可安裝套件，macOS 與 Windows 走 Docker；Rust 測試也能使用行程內的 embedded 模式。

這些接入方式解決的是「請求送到哪裡」。對訂單附件流程，我會另外列出每一次 SDK 呼叫及預期結果，例如新增物件後是否可讀、條件寫入失敗時的錯誤，以及清理是否會刪掉其他測試的物件。只完成 bucket 或 table 建立，還不足以涵蓋應用的讀寫流程。

[AWS 的 fidelity 文件](https://docs.aws.amazon.com/emulator/latest/userguide/fidelity.html)說明，尚未實作的操作會回傳 HTTP 501 與 `NotImplemented`。目前控制面 API 的符合程度較高，資料面及基礎設施工具的支援依服務而異。發布分數是該版測試集合的通過比例，跨版本比較時也要確認測試集合是否改變。

因此 CI 遇到 501 時應留下明確失敗或列為尚未覆蓋，不能吞掉錯誤再把測試判綠。若這項操作是附件流程必要的一環，整條流程暫時留在雲端整合測試；單元測試仍可用自己控制的替身驗證錯誤處理。

## 測試清單按業務流程整理

官方提供[逐項查核流程](https://docs.aws.amazon.com/emulator/latest/userguide/check-project.html)：列出操作，對照 evaluation suite 的 manifest 與版本分數，未涵蓋的部分自行比較 AWS 與模擬器。

以附件服務為例，採用前可準備四組案例：

- 正常上傳：物件內容與訂單記錄相符。
- 重複請求：使用相同業務識別碼重送，不留下兩份互相矛盾的記錄。
- 部分失敗：物件已寫入、訂單記錄未寫入時，清理只處理該次操作的資源。
- 錯誤回應：不存在的物件或不合法輸入，應用能走到預期分支。

這是應用驗收建議，不代表上述流程已獲模擬器支援。每個案例都應記錄實際 SDK 版本、模擬器版本、呼叫操作及預期副作用，讓下次更新時能重跑同一組比較。

測試資料也要能從空白環境建立。依[使用指南](https://docs.aws.amazon.com/emulator/latest/userguide/what-is-service.html)，資源放在記憶體，停止後就消失。每個測試工作建立自己的實例，比依賴上一輪留下的 bucket 更容易追查問題。官方也要求同一實例採單一帳號與區域使用方式，並未把不同帳號、區域完整隔離。

## 權限測試仍在 AWS 執行

[安全文件](https://docs.aws.amazon.com/emulator/latest/userguide/security.html)明確排除 IAM、bucket policy、KMS key policy 等安全控制的驗證。模擬器接受請求，無法證明部署角色具有正確的最小權限。

對附件服務，我會把驗收拆成兩層。本機處理資料與錯誤分支；獨立測試帳號則檢查指定角色能否寫入允許的物件位置、不能讀取的物件是否確實遭拒，以及部署後完整流程能否完成。後者要用部署時的角色與政策執行，避免用管理員憑證測過便結案。

安全文件也要求使用測試資料、排除正式憑證，並讓端點保持私有。這些條件應寫進測試啟動流程。若 SDK 沒有取得預期的本機端點，測試應停止，避免意外走向雲端。能執行函式程式的模擬環境也不等於隔離沙盒，不能拿來執行不可信任程式。

## 固定版本與更新檢查

模擬器改善對 AWS 的符合程度後，原本依賴錯誤行為的測試可能開始失敗。[版本文件](https://docs.aws.amazon.com/emulator/latest/userguide/versioning.html)將這類 fidelity 修正列入 patch 更新，也提醒未被測試覆蓋的行為仍可能改變。官方只在最新版提供安全修補。

實務上可以記錄 CI 使用的確切版本，同時安排更新驗證。遇到結果改變，先比較相同請求在 AWS 的回應，再判斷要修應用預期、更新測試，或回報模擬器差異。永久鎖在舊版會累積安全與相容性風險。

從一條短流程開始比較就足夠，例如「建立附件、讀回內容、刪除附件」。把通過的案例搬到本機快速執行，權限與部署整合測試保留在 AWS。等實際覆蓋逐步確認，再擴大替換範圍。
