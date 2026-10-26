---
title: "Linux .NET tarball 修補：解壓後，誰能改寫 runtime？"
description: "CVE-2026-114148 涉及 Linux 壓縮檔的擁有者資訊。從安裝來源、解壓身分與實際檔案權限，判斷修補範圍，並用乾淨目錄替換受影響安裝。"
publishDate: 2026-10-26T10:04:50+08:00
draft: false
featured: false
tags:
  - 資訊安全
  - Linux
  - CI/CD
cover: ../../assets/covers/linux-dotnet-tarball-ownership.webp
coverAlt: "黑色版畫風格的木箱裝著金屬方塊，青綠繩索綁著空白標籤，箱旁放著一把鑰匙。"
---

runtime 檔案來自可信網站，解壓縮也成功，服務能正常啟動，安裝仍可能留下錯誤權限。假設共用安裝目錄裡的檔案被還原成某個一般帳號所有，該帳號就可能改寫之後會被高權限服務載入的內容。這是安裝流程需要驗收的另一件事。

Microsoft 在 [10 月 25 日公布 CVE-2026-114148](https://github.com/dotnet/aspnetcore/security/advisories/GHSA-r6pf-x897-gm86)，指出部分 Linux .NET tarball 的擁有者資訊可能造成本機提權。條件包含安裝時保留數字擁有者，以及本機低權限帳號可修改相關檔案或目錄。查閱資料沒有提供已遭實際利用的證據。

處理這件事時，我會把「下載了哪個版本」和「安裝後誰能改寫它」放在同一份變更紀錄。後者不能由版本號推算。以下依 2026 年 10 月 26 日讀取的官方公告及 GNU tar 文件整理，沒有重現漏洞、修改正式主機權限或測試任何使用者環境。

## tar 會攜帶擁有者，主機卻有自己的帳號

[GNU tar 文件](https://www.gnu.org/software/tar/manual/tar.html#Attributes)說明，archive 保存數字 UID／GID，也可記錄名稱。還原時可能以名稱查找本機帳號，或使用 archive 內的數字；`--numeric-owner` 則要求忽略名稱、採數字。以 superuser 解壓時，預設會嘗試保留 archive 的擁有者。

這種行為適合某些備份還原工作，軟體配送卻需要另作決定。建置機上的 UID 可能屬於建置帳號，到了正式機器，同一數字可能對應完全不同的人。把上游身分照搬進安裝目錄，等於讓打包環境參與決定本機的寫入權限。

用一個教學情境說明：管理員在共用工具目錄解壓 runtime，留下了一組一般帳號可寫的檔案。隔天排程以更高權限啟動應用程式，使用的正是這份 runtime。攻擊者不需要改服務啟動設定，只要能改它會讀取的內容，就已經跨過原本預期的管理邊界。這段是機制說明，不是已確認事故紀錄。

## 盤點要找 archive 類型，不能只找 .NET 版本

[官方受影響清單](https://github.com/dotnet/aspnetcore/security/advisories/GHSA-r6pf-x897-gm86#affected-products)區分兩條路徑：Microsoft 發布的 .NET 8／9 ASP.NET Core runtime、composite runtime 與 targeting-pack Linux tarball，修補版分別為 8.0.33、9.0.22；source-build 則另有 .NET 8 至 11 的分支版本表。對 .NET 10／11，這項問題限 source-build。其他 Microsoft 發布的 .NET 8／9 runtime／SDK tarball 不在前一類範圍。

因此，我會從安裝紀錄找檔名、來源 URL、架構和解壓步驟。主機用套件管理器安裝、CI 消費 source-build archive、Dockerfile 自行下載 ASP.NET Core tarball，是三種不同的調查入口。沒有紀錄時，先把來源列為待確認，不因版本接近就判定整批 Linux 主機都受影響。

單純還原 NuGet 套件不會引入這項 tarball 擁有者缺陷。source-build 輸入也不能直接當成已部署的正式 runtime；應追查它產生的套件或映像是否承襲問題。這些界線都來自同一份公告，實際分支請對照完整表格，不拿 runtime 版號替代 source-build SDK 版號。

## checksum 和權限，各自回答不同問題

[Microsoft 手動安裝文件](https://learn.microsoft.com/en-us/dotnet/core/install/linux-scripted-manual#verify-downloaded-binaries)提供比對下載檔與官方 checksum 的步驟。這可以確認拿到的位元組是否符合發布者提供的檔案，卻不會替部署環境決定可信的擁有者。

我的驗收會分成兩份證據。一份記錄 archive 的正式來源、版本與 digest；另一份記錄解壓後的 owner、group、寫入權限及服務使用的絕對路徑。下載檔正確、但安裝目錄由應用帳號控制，仍要停下來處理。只看最末端的二進位檔也不夠，上層可寫目錄可能讓檔案被替換。

安裝帳號與執行帳號分開，會讓責任清楚一些。執行服務的帳號通常只需要讀取與執行 runtime；它若同時能改 runtime，下次載入的內容就不再由部署程序單獨控制。這是對共用或高權限安裝的設計建議，個人開發目錄應按自己的信任範圍另定規則。

## 用新目錄替換，別把舊樹原封不動搬過去

這次[官方修復程序](https://github.com/dotnet/aspnetcore/security/advisories/GHSA-r6pf-x897-gm86#how-do-i-fix-the-issue)要求以修補發行物建立乾淨安裝，不能只下載新 archive 或覆蓋原目錄。source-build 工作區也要重新建立，再檢查下游產物。

我會先安排服務切換窗口，準備受控的新空目錄，核對 patched archive 後解壓。Microsoft 的[一般手動安裝範例](https://learn.microsoft.com/en-us/dotnet/core/install/linux-scripted-manual#manual-install)已使用 `--no-same-owner`；[GNU tar 選項文件](https://www.gnu.org/s/tar/manual/html_node/Option-Summary.html)則說明它不還原 archive 的 owner，`--no-same-permissions` 讓解壓權限受使用者 umask 約束。兩者的作用不同，不能把不保留 owner 當成所有權限都已驗好。

切換前，列出 Web 服務、背景 worker、排程和建置工作各自使用的位置。切換後逐一重啟、跑既有健康檢查，再核對實際選到的安裝路徑。管理員終端機的 `dotnet` 指向新目錄，不能替另一個帳號的排程作證。

容器要修改 Dockerfile 或建置步驟，產生新映像，再建立替換容器。如果只在某個執行中的容器內修權限，重建它時仍可能回到舊狀態。若發現疑似遭改寫的檔案，先保留證據並走事件處理程序，不把那份樹複製到「乾淨」目錄充當回滾方案。

一般更新與程序重啟的安排，可接著看[.NET OOB 修補部署驗收](/blog/dotnet-oob-patch-deployment/)。這裡多查的是檔案由誰控制。

下一次檢查安裝腳本，可以先挑一個會把 tarball 解進共用目錄的工作。把下載來源、解壓身分、目錄 owner，以及實際消費該目錄的服務寫在一起；只要其中一項還靠猜測，就還沒準備好讓這份安裝成為高權限程序的依賴。
