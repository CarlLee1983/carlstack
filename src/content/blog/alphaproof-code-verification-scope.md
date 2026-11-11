---
title: "AlphaProof Code 的驗證範圍"
description: "Google DeepMind 用 AlphaProof Code 驗證 libsignal 的機器碼。對照原論文，釐清兩種安全證明、量子攻擊限制，以及這些結果與 Signal App 的差別。"
publishDate: 2026-11-11T10:03:26+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - 軟體品質
  - 安全架構
series: AI Agent 工程化與工作流實戰
seriesOrder: 114
cover: ../../assets/covers/alphaproof-code-verification-scope.webp
coverAlt: "米白色鏤空紙板疊在深青色紙張上，右側陶土色紙板呈現不同形狀的切口，表達規格比對與驗證範圍。"
---

Google DeepMind 在 [2026 年 11 月 10 日公布 AlphaProof Code](https://deepmind.google/blog/introducing-alphaproof-code/)，用 AI agent 協助撰寫規格與形式證明，驗證 Signal 協定實作的安全性。這項成果值得讀原論文，因為「驗證 Signal」包含幾個不同問題：驗證哪份程式、允許攻擊者做什麼，以及哪項安全性質成立。

查核日期為 11 月 11 日。下文依官方公告、技術論文及公開驗證文件整理，沒有重跑 Lean 證明，也沒有測試 Signal App。導入建議另以虛構的金流服務說明。

## 驗證對象是 libsignal 編成的 CLI

論文使用 libsignal v0.105.4 與 SPQR，透過命令列測試程式包裝，再編成 AArch64 Linux 執行檔。證明連接協定的安全性質與這份機器碼，範圍涵蓋 PQXDH 握手及 Triple Ratchet 的指定行為。這不是 Signal 手機或桌面 App 的整體安全認證。[論文 §3、§4、Table 1](https://deepmind.google/documents/36/Formal_Verification_of_Signal_4.pdf)

要理解這個範圍，可以先區分握手與後續傳訊。[Signal 的 PQXDH 規格](https://signal.org/docs/specifications/pqxdh/)處理雙方建立共享秘密，即使接收者當時離線也能開始；[Double Ratchet 規格](https://signal.org/docs/specifications/doubleratchet/)則說明如何逐則更新訊息金鑰，降低金鑰外洩對過去或未來訊息的影響。App 還有裝置管理、資料儲存與使用者操作等行為，不能一併算進協定實作的證明。

對整合加密功能的團隊，這份研究可以作為評估 libsignal 的證據。要把某個性質寫進自家產品的安全承諾，仍要核對使用版本、呼叫方式與執行環境是否符合定理條件。站內的[形式證明與部署產物核對](/blog/formal-verification-proof-scope/)已有版本與 binary 紀錄範本。

## 兩種證明回答不同問題

公開驗證文件分別列出 symbolic 與 computational 結果。閱讀時要連同各自的限制看，不能把兩邊最強的保證拼成一句「全面安全」。[公開文件 §5.1、§5.2](https://google-deepmind.github.io/code-verification/)

### Symbolic：在抽象密碼模型下推導安全性

這類模型將密碼運算視為符合指定規則的抽象操作。研究涵蓋前向保密、入侵後安全性及握手相關性質，但實作層的場景限制包括固定雙方角色、預先確認身分金鑰等條件。它不涵蓋側通道，也沒有證明 SPQR 提供的量子攻擊後恢復能力。

前向保密關心「現在的秘密外洩，是否危及過去訊息」。入侵後安全性則關心系統後續取得新秘密後，能否恢復保護。後者成立需要滿足具體的攻擊與金鑰更新條件，不能解讀為遭入侵的裝置會自動變安全。

### Computational：給出攻擊成功機率的界限

這部分針對傳統攻擊者，將攻擊成功機率與底層密碼假設連結。它有不同的限制，例如不涵蓋多裝置狀態，且機率界限在某些大規模情境下會失去實用保證。因此，文件中的「量子」結果要回到 symbolic 證明的指定項目確認，不能套用到全部定理。[公開文件 §5.1.6、§5.2.5](https://google-deepmind.github.io/code-verification/)

## Lean 檢查證明，人仍要審查規格

AlphaProof Code 的規格由人審核，agent 產生的證明交給 Lean 檢查。論文另外使用 comparator，比對待證命題及它依賴的定義是否符合保留的核准版本。這能防止證明過程偷偷改弱規格，例如把難處理的輸入從前提排除。[論文 §2.1、§2.4](https://deepmind.google/documents/36/Formal_Verification_of_Signal_4.pdf)

規格、機器模型及外部函式契約仍屬信任基礎。**證明通過，表示指定命題在指定假設下成立。** 若命題漏掉產品真正關心的失敗方式，檢查器不會替團隊補上需求。

## 金流服務可以如何採用這種做法

這個虛構案例用來說明導入方式，尚未實作或驗證。

假設團隊想驗證「同一筆付款不會扣款兩次」。規格若預先假設所有請求都有不同的識別碼，就完全避開了重送問題。即使這個命題能證明，也沒有回答網路逾時後重試的風險。

較合適的試點是一個邊界小、輸入輸出清楚的函式，例如付款狀態轉移。團隊可以先記錄以下問題：

- 同一付款識別碼收到重複成功通知，狀態與金額如何變化？
- 通知順序顛倒時，已成功的付款能否被較舊事件改回處理中？
- 資料庫寫入失敗與外部金流成功，是否已被放進模型？

前兩題可能適合從純函式與有限狀態開始。第三題牽涉外部服務與持久化，若只驗證記憶體中的函式，就應另列整合測試、故障注入與對帳程序。這樣比較容易看出每份證據能回答什麼。

若系統仍頻繁改需求，先做 property-based testing 與狀態轉移測試通常較容易維護。形式驗證適合用在規格已能精確寫出、錯誤代價高，而且團隊願意維護證明的範圍。兩種方法可以保留同一組業務性質，依模組風險採用不同強度的檢查。

下一次審查「已形式驗證」的套件時，挑一項你準備對外承諾的性質，找到對應定理與假設。若找不到，就把它留在待驗證清單，不寫進產品保證。
