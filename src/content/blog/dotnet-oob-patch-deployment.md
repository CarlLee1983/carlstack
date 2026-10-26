---
title: ".NET 10 月緊急更新補回漏掉的修補，驗收要追到執行中的版本"
description: "Microsoft 10 月 25 日補發 .NET 安全更新。依部署型態區分主機 runtime、self-contained 產物與容器，把公告版本轉成可核對的正式執行證據。"
publishDate: 2026-10-26T10:04:45+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - CI/CD
  - 系統設計
cover: ../../assets/covers/dotnet-oob-patch-deployment.webp
coverAlt: "紅色吊燈已裝上發亮的藍色燈泡，旁邊紙箱仍放著另一顆藍色燈泡，後方吊燈的灰色燈泡沒有亮起。"
---

假設團隊在 10 月 13 日做過 .NET 安全更新，工單也已結案。到了 10 月 25 日，Microsoft 卻在新的公告中說明，先前版本沒有完整交付兩項已公告漏洞的修補。原本的「已更新」紀錄，現在需要重新對照實際套件。

[10 月 25 日的 OOB 公告](https://devblogs.microsoft.com/dotnet/dotnet-october-2026-oob-security-updates/)提供 .NET 8.0.33、9.0.22、10.0.14 與 .NET 11 RC3。除了 Brotli 與 Linux tarball ownership 問題，也補回 CVE-2026-70197 與 CVE-2026-102870 的修補。這是既有漏洞修補交付的更正，不應再用 10 月 13 日更新完成的紀錄直接結案。

這次我會把修補驗收拆成三個可追溯的對象：官方列出的套件、部署出去的產物、正在處理流量的程序。它們必須能對得起來。開發機或 CI runner 的 SDK 更新，只完成其中一段。

我查閱官方公告及部署文件，沒有安裝這批 .NET 更新或重現漏洞。以下 rollout 與驗收安排是工程建議。查閱的來源沒有提供已遭實際利用的證據，不能把記憶體破壞風險寫成已發生攻擊。

## 先把套件範圍和觸發路徑對起來

CVE-2026-70197 的[修訂公告](https://github.com/dotnet/announcements/issues/493)描述 Windows 上的特定用法。同一個 `SocketAsyncEventArgs` 在 IPv4 與 IPv6 datagram socket 之間重用，可能保留太小的原生位址緩衝區，讓 `ReceiveFromAsync` 發生越界寫入。官方評為 High、CVSS 8.1。

這項公告的 Windows runtime pack 修補目標為 8.0.33、9.0.22、10.0.14，以及 11.0.0-rc.3.26522.148。.NET 8 清單同時包含 CoreCLR 與 Mono 的 Windows 套件。版本盤點應依公告列出的 package、架構及分支逐項比對，不把所有作業系統、所有 socket 使用方式寫成相同條件。

對一個使用 HTTP API 的後端，沒有直接呼叫上述 API 還不能完成盤點。依賴函式庫可能封裝了網路操作，所以先從產物裡的 runtime pack 確認修補需求，再檢查可到達的程式路徑，安排回歸測試的優先順序。**沒有找到觸發呼叫點，不應用來取代已知受影響套件的更新。**

Brotli 則要看資料在哪裡被解壓。[CVE-2026-111497 公告](https://github.com/dotnet/announcements/issues/494)列出 ASP.NET Core request decompression、HttpClient 自動 response decompression，以及直接使用 Brotli API 的情況。前兩者不是預設啟用；.NET Framework 不在這項漏洞範圍內。可以從 middleware 註冊、HttpClient handler 設定和直接 API 呼叫開始找，但套件相依也要列入。

Linux tarball 的檔案擁有者問題有不同的修復對象，另見[安裝目錄與封存檔 ownership 的處理](/blog/linux-dotnet-tarball-ownership/)。這裡只追執行環境的更新，不把所有問題都當成重啟一次服務就能修好。

## 同一台主機，可能有三條更新路徑

假設一個訂單服務用 framework-dependent 方式發布，旁邊的物流 worker 是 self-contained，兩者又各有一份容器部署。這是教學情境，不是某家公司的實測紀錄。值班工程師在主機執行 `dotnet --list-runtimes`，看見新 runtime，不代表另外兩種產物也跟著變更。

[.NET 發布文件](https://learn.microsoft.com/en-us/dotnet/core/deploying/)區分了 runtime 隨主機提供或隨應用一起交付的模式。這次更新可依下列三種部署方式安排，額外的 NativeAOT 與獨立套件還要分開核對。

### Framework-dependent：確認服務載入哪份 runtime

更新服務所需分支的 runtime，然後重啟應用。核對要在實際服務環境進行，包含啟動命令、架構與安裝位置。互動式 shell 查到的 `dotnet` 路徑，可能和服務帳號或 apphost 的搜尋路徑不同。

驗收紀錄除了保留安裝版本，也要有新程序啟動時間與執行環境證據。若服務本來有啟動日誌，就在受控日誌中核對載入的 runtime 資訊與產物識別。不要為了取得這份資料，臨時新增公開的診斷端點。

### Self-contained：重建後重新發布整份產物

這類產物帶著自己的 runtime。主機多裝一份新版，不會改寫已發布目錄中的檔案。使用已更新的 SDK 與 runtime pack 重建，確認 publish 輸出，再部署到服務使用的路徑並重新啟動。

保留建置輸入、實際解析的 runtime pack 版本和產物摘要。若 pipeline 重用了先前 publish 目錄，或發布步驟只複製應用 DLL，可能留下舊 runtime。驗收時要看最後交付的完整目錄，不只看 build job 顯示綠色。

### 容器：核對正在執行的 image digest

更新基底 image 並重建、推送、重新部署。若 Dockerfile 直接複製 self-contained 輸出，還要先重建那份輸出；只換 runtime 基底可能根本沒有改到應用實際使用的 runtime。

記錄新 image digest，逐一核對仍接流量的 replica。滾動更新過程中，新舊副本會短暫共存；有一個新 pod 成功，不足以證明全部已替換。完成條件包含舊 digest 不再承接流量，以及新的程序通過業務檢查。

NativeAOT 也要另外查。[Brotli 公告](https://github.com/dotnet/announcements/issues/494)把相關 NativeAOT 套件列入範圍；使用這些套件編成的執行檔，應以修補過的工具鏈與套件重建、重新部署，不能只更新主機 shared runtime。

Blazor WebAssembly debugger 的 [CVE-2026-102870 公告](https://github.com/dotnet/announcements/issues/492)則要求更新獨立的 `Microsoft.AspNetCore.Components.WebAssembly.Server` 或 `DevServer` 套件參照，依分支使用 10.0.14 或 11.0.0-rc.3.26522.148，再重啟 debugger 與開發環境。問題涉及在除錯時評估含攻擊者可控應用資料的運算式，不能把正式 Web 服務重啟當成開發機已完成這項修補。

## 把修補工單寫成能重新核對的紀錄

公告會修訂，部署也可能回滾。只存一句「已升級到最新版」，過幾天就無法回答當時到底更新了什麼。我會在每個部署單位保存以下資料，不把不同模式合成一列：

- 服務與部署目標：作業系統、架構、環境、責任人。
- 修補依據：CVE、官方公告 URL、查核時間及該套件修補版本。
- 建置與部署：commit、runtime pack、發布模式、產物摘要或 image digest。
- 執行證據：新程序啟動時間、正在執行的產物識別、仍存活的舊副本數。
- 驗收與回復：實際測過的路徑、未測項目，以及可用的回復版本。

這些欄位是修補流程的設計建議，不是 Microsoft 公告要求的固定格式。面對 10 月 25 日這類更正，找到受影響套件後，就能沿紀錄追到哪些部署單位還在跑它。

## 回歸測試跟著資料路徑走

新版本啟動成功後，先做平常的健康檢查與核心交易，再補上這次影響的路徑。例如服務若接收 Brotli 請求，就在隔離測試環境檢查合法壓縮內容、損壞內容、逾時與大小限制。若 HttpClient 會解壓供應商回覆，就核對解壓失敗時的例外處理與重試是否仍受控。這些測試能驗證應用相容性，不能單獨證明漏洞已不存在。

對使用 Windows datagram 的服務，確認測試包含實際採用的 socket 生命週期與 IPv4／IPv6 組合，並核對 runtime pack 已更新。不要在正式環境用攻擊樣本充當驗收。

若更新後業務失敗，先停止擴大 rollout。回滾到已知受影響版本會恢復暴露，應和暫時停用受影響功能、隔離流量等方案一起評估，不將「回滾成功」當成安全事件結案。可回復的產物與已修補的產物，必須分開標示。

今天可以先挑一個正式服務，沿著公告、建置產物、執行程序各查一次。三處都能指出相符的版本與識別，才把那個部署單位標為已修補；其餘留在工單中繼續追，不讓一張開發機的版本截圖替整個系統結案。
