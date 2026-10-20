---
title: "Xcode 升級後測試全綠，CodeQL 仍可能沒有完成掃描"
description: "GitHub 說明 macOS 27、Xcode 27 與 Swift 6.4 的 CodeQL 相容限制。從 runner 版本、traced extraction 到掃描結果驗收，拆開保留舊工具鏈與 build-mode: none 的適用範圍。"
publishDate: 2026-10-20T10:05:00+08:00
draft: false
featured: false
tags:
  - DevOps 與 CI/CD
  - 資訊安全
  - 軟體品質
cover: ../../assets/covers/codeql-macos-xcode-toolchain-compatibility.webp
coverAlt: "輸送帶上的零件通過綠燈測試架，旁邊的銅色檢查鏡卻與驅動齒輪脫開，象徵建置通過仍須另行確認安全掃描完成。"
---

假設團隊把 macOS runner 換成新版，Xcode 也一起更新。App 編譯成功，單元測試全部通過，於是這張升級工單準備結案。稍後有人打開安全掃描頁面，才發現 CodeQL 最近一次成功分析仍停在升級前。

這是本文用來拆解問題的假設情境，並非實測事故。編譯器能把程式建起來，不保證安全工具也能從這次建置取得分析資料。GitHub 在 [2026 年 10 月 19 日的 CodeQL 公告](https://github.blog/changelog/2026-10-19-codeql-changes-for-macos-27-xcode-27-and-swift-6-4/)列出 macOS 27、Xcode 27 與 Swift 6.4 的支援限制，受影響的範圍還包含多種非 Swift 語言。

我會把升級驗收拆成兩筆證據：應用程式建置與測試的結果，以及同一份程式碼的 CodeQL 分析結果。本文依官方文件整理，查核截至 2026 年 10 月 20 日；未在新平台實跑 CodeQL，以下操作是排查與遷移建議。

## Xcode 27 裝上去，影響不只 Swift

公告把原因指向部分系統執行檔與函式庫不再包含 CodeQL 建置追蹤所依賴的 Intel（x86_64）程式碼。處理工單時，要把四個條件分開記：

- 安裝 Xcode 27 的環境：C/C++、C#、Go、Java、Kotlin、Swift 的 traced extraction 無法使用。
- macOS 27：上述語言的 traced extraction 可能無法使用。官方在這一項保留「可能」，不能自行改寫成所有情況必定失敗。
- Swift 6.4：任何平台都不受支援。換作業系統不能繞過這一條。
- Intel Mac：官方預定在 2026 年 12 月中旬棄用支援。這是另一條遷移時程，不是前面限制的生效日期。

因此，只看到 repo 寫 Java，就判定不受 Apple 工具鏈影響，會漏掉「Java 的分析跑在什麼機器、用什麼抽取方式」這一層。反過來，也不能把公告解讀成所有平台、所有語言的 CodeQL 都壞了。

尤其公告寫的是「安裝 Xcode 27」。僅把目前選用的 Xcode 切回 26，還不足以據此宣告相容；候選 runner 的已安裝工具清單也要查。

## 從掃描 job 往回查，找出最後一次有結果的組合

遇到這種升級後才出現的落差，我會先留下最後一次成功掃描的 run，再對照失敗 run 的環境。要比的是掃描 job 自己使用的 runner，不能拿另一個測試 job 的版本代替。

在 macOS 掃描 job 加入以下唯讀診斷片段，可以留下基本環境資訊。這不是完整 workflow，本文未執行：

```bash
sw_vers
uname -m
xcode-select -p
xcodebuild -version
xcrun swift --version
```

這幾行能看到 OS、架構與目前選用的工具鏈，但列不出所有已安裝 Xcode。GitHub-hosted runner 還要看該次 run 的映像資訊；self-hosted runner 則要核對機器的安裝清單。連同 CodeQL 版本、分析語言、build mode、commit SHA 一起放回升級工單，下一次排查才有東西可比。

接著打開 CodeQL job 的步驟紀錄：初始化、受追蹤的建置／抽取、分析、結果上傳，各自走到哪一步？如果分析沒有執行、被跳過，或上傳沒有完成，測試 job 的綠勾不能補上那份結果。

這也和 [Actions 鎖檔的範圍](/blog/github-actions-lockfile-review-boundary/)不同。鎖住 action 的程式版本，不會一併把 runner 裡的作業系統、Xcode 與 SDK 全部凍結。環境升級仍須單獨驗收。

## 保留可掃描的舊組合，但別假設它能建新程式

對 Swift 或其他使用 traced build 的語言，公告的建議是固定在 macOS 26 或更早、Xcode 26 或更早；使用 Actions 時，同時固定 runner image 與工具鏈，避開對 latest 的依賴。

我會從已經產出過有效分析的組合開始，在候選環境對相同 commit 重跑。這裡刻意不貼一份看似可以通用的 runner YAML：不同託管映像與自架機器的標籤、架構、已裝版本不一樣，抄到不存在或不符條件的 label，只會把相容問題換成排隊或建置失敗。

假設新功能已經用到 Swift 6.4 或新 SDK，舊環境連這份程式都建不起來，保留舊 runner 仍無法完成掃描。這時工單應列出哪些 target 無法分析，以及誰負責處理這段缺口；不能拿舊 commit 的成功結果替新 commit 背書。若團隊要讓新版功能測試與相容環境的安全掃描分開跑，也必須確認兩邊處理的是同一份程式，且安全 job 確實涵蓋預期 target。

**停止條件：候選環境無法完成預期程式的分析，就不能把「安全掃描相容」勾成完成。** 不需要為了結案移除安全檢查或把失敗忽略掉。

## build-mode: none 能避開追蹤，也會改變分析內容

本次公告提出的替代選項是 C/C++、C# 與 Java 的 `build-mode: none`。它們能不靠追蹤建置建立分析資料庫，但切換前要確認原本靠建置提供了什麼。

例如 Java 專案在建置時產生一批程式，再與手寫程式一起分析。改成 none 後，執行成功並不代表那批建置產物仍在分析範圍內。[編譯型語言指南](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/manage-your-configuration/codeql-for-compiled-languages#use-none-build-mode-for-codeql)也提醒，依賴資訊推斷與建置生成程式可能影響分析準確度。

Java 和 Kotlin 混用時更容易誤判。即使設定中的語言名稱是 `java-kotlin`，none 也不會因此分析 Kotlin；文件明確指出會略過 Kotlin 並提出警告。Go、Kotlin、Swift 不能套用這次的 none 替代方案。

[各語言的建置文件](https://docs.github.com/en/code-security/reference/code-scanning/codeql/build-options-for-compiled-languages)進一步列出差異：C/C++ 的巨集與外部標頭會影響推斷；C# 要能還原依賴，原始碼編譯問題也會影響分析。none 的意思是免除完整建置需求，不代表依賴、平台條件都不必準備。

我的建議是保留原本成功 run 的分析檔案清單，試跑 none 後逐項比對重要目錄、語言與生成程式的處理方式。若差異包含驗證、授權或輸入處理相關程式，就需要由維護者確認影響；「工作流改綠了」不足以接受這個取捨。

## 驗收要看新結果，還要看掃到了哪裡

GitHub 的 [Tool status 操作文件](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/manage-your-configuration/use-the-tools-status-page-for-code-scanning)提供查看工具健康狀態與分析資訊的入口。排查預設分支時，可以從 repository 的 Code scanning 頁進入 Tool status，確認最近掃描時間、設定與錯誤，再核對該次 Actions run。

這個頁面也有邊界：[官方概念文件](https://docs.github.com/en/code-security/concepts/code-scanning/tool-status-page)說明，Tool status 只呈現預設分支；檔案只要有部分程式碼被處理，就可能被列為已掃描。編譯時才生成的檔案也不會出現在這份檔案統計裡。因此，PR 分支要追對應 run 與 commit；檔案覆蓋率很高，也不能直接解讀成所有路徑都完整分析。

升級工單結案前，我會要求留下：

- 候選環境的 OS、架構、Xcode、Swift 與 CodeQL 版本，及其安裝／選用紀錄。
- 對應 commit 的 CodeQL run，證明預期語言完成抽取、分析與結果上傳。
- 與舊組合相比的分析檔案差異，以及每項缺漏的處理結果。
- 若更換 build mode，對生成程式、依賴與 Kotlin 等語言範圍的明確確認。

今天可以先做一個小動作：打開最近一次 runner 升級的 PR，把同一 commit 的 CodeQL run 連結補上，並核對最後成功分析時間。如果找不到這筆結果，這張升級單就還有一項需要完成的驗收。
