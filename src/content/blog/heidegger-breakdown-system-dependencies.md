---
title: "從海德格的器具分析看系統故障：追查上傳流程的依賴與復原責任"
description: "從《存在與時間》的器具關係與使用中斷出發，拆解檔案掃描流程的隱藏依賴，並將發現轉成狀態契約、復原責任與回歸測試。"
publishDate: 2026-09-26T13:25:00+08:00
updatedDate: 2026-11-05T23:45:34Z
draft: false
featured: false
tags:
  - "系統設計"
  - "系統思考"
  - "架構方法論"
cover: "../../assets/covers/heidegger-breakdown-system-dependencies.png"
coverAlt: "銀色夾具的接點斷開後，青綠細線牽引至後方幾件器具，顯示中斷使原本隱形的依賴關係浮現。"
series: "哲學視角下的系統分析與軟體設計"
seriesOrder: 2
---

上一篇[〈系統邊界不是地圖外框：模型會先決定誰看得見〉](/blog/system-boundary-critique-who-counts/)追問系統分析把誰納入、哪些後果算進成果。接著看執行流程：一段工作順利完成時，哪些程式、資料與人員關係退到背景？中斷發生後，又有哪些依賴才浮現？

假設使用者上傳一份文件，畫面立刻顯示「完成」。檔案已寫入物件儲存，資料庫狀態卻還是 `scanning`；掃描事件排進佇列，但背景工作者沒有回報。使用者認為上傳好了，下載端點仍拒絕提供檔案，客服只看到「處理中」，工程師則得沿著佇列、掃描器與狀態紀錄追查。

這個假設情境有一個設計問題：「完成」把保存、掃描與可供下載壓成同一個詞。中斷讓這些原本被畫面隱藏的依賴浮現。

2026 年 11 月 5 日核對了 Stanford Encyclopedia of Philosophy 的現行條目與 2014 年存檔。書目連結用於辨認英譯本，沒有取得該版全文逐頁校勘。下方上傳流程是工程設計範例，並非海德格的分類，也沒有在實際儲存、佇列或掃描服務中部署驗證。

## 器具的意義來自它接續的工作

海德格在《存在與時間》§15、§16 討論我們如何在實際活動中遇見器具。在敲釘子的活動中，錘子透過釘子、木料與正在進行的工作取得意義。分析對象包括這些「用來做什麼」的關係。[《存在與時間》Macquarrie 與 Robinson 英譯本](https://books.google.com/books?id=cbnVzwEACAAJ)；[Stanford Encyclopedia of Philosophy 對器具關聯脈絡的整理](https://plato.stanford.edu/entries/heidegger/)

海德格把器具這種在使用中派得上用場的存在方式稱為上手性（Zuhandenheit，常譯為 readiness-to-hand）。熟練使用時，人通常專注於手邊工作，工具不必先成為被觀察、量測的獨立物件。器具壞掉後，人也未必立刻轉入純粹理論觀察，仍可能在工作脈絡中嘗試修復。[Stanford Encyclopedia of Philosophy：Martin Heidegger](https://plato.stanford.edu/entries/heidegger/)；[2014 年版對修復活動的說明](https://plato.stanford.edu/archives/win2014/entries/heidegger/)

把這個觀察用在軟體，可以從使用者「取得可供使用的檔案」這項工作出發。物件儲存、狀態資料表、佇列與掃描工作者各自正常，還不足以證明整段流程能完成。系統分析若只列元件，很容易忘記它們如何共同完成一件事；若只畫成功路徑，也可能把非同步處理和人工接手藏在一個「完成」狀態後面。

## 中斷會讓三種依賴問題變得醒目

在《存在與時間》§16，海德格分析器具不可用、必要器具缺席，或現有事物妨礙手邊工作時，原先熟悉的關聯如何顯露。2014 年 SEP 條目將它們整理為損壞、缺席與妨礙工作的器具，屬於使用受阻時的經驗描述。[《存在與時間》§16](https://books.google.com/books?id=cbnVzwEACAAJ)；[Stanford Encyclopedia of Philosophy：較早版本對 §16 的說明](https://plato.stanford.edu/archives/win2014/entries/heidegger/)

把它們當成需求工作坊的提問，可以得到三個不同方向：

- 有東西，但現在不能用。 掃描器逾時或儲存服務拒絕寫入時，哪些後續操作必須停下？系統要保留哪個狀態，才能讓重試不被誤認成成功？
- 工作需要的東西不在。 檔案已寫入，但掃描事件沒有送達或工作者沒有接手時，誰能看出這條關係斷了？使用者與客服各自看見什麼？
- 某個流程擋在工作前面。 檔案進入人工審查後，如果沒有明確負責人或逾時規則，安全檢查就可能成為無人收尾的等待狀態。這未必是錯誤政策，卻必須有可見的責任與下一步。

這些問題不會自動指出應該拆服務、換佇列或增加重試。它們先幫分析者辨認：中斷的是哪一段工作、缺少哪個關係、以及誰要讓流程恢復。

## 從上傳流程寫出狀態與復原契約

「已收到檔案」只承諾已保存一份可識別的物件版本。這個範例讓所有新檔先留在非公開的隔離區，再由伺服器依掃描結果與存取權限放行。OWASP 的[檔案上傳指南](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)建議分層驗證、限制儲存位置與權限。掃描只是其中一層，通過也不能保證檔案絕對安全。

可以把處理狀態定義為：

- `received`：物件版本已保存，掃描工作尚未確認建立。
- `scanning`：掃描已排程或執行中，仍不可下載。
- `available`：這個物件版本符合目前的放行規則，符合存取權限的請求才可下載。
- `rejected`：這個版本被拒絕提供，重送成功事件不會使它復活。
- `review_required`：自動處理無法完成，等待指定人員處理，仍不可下載。

保存物件與建立掃描工作通常涉及不同系統。需要處理「物件已寫入、事件未送出」的中斷，例如用持久化工作紀錄配合 outbox 重送，再以對帳程序找出孤立物件。不能只在記憶體裡呼叫一次佇列 API 就把它標為已排程。

### 下載條件要綁定掃過的內容

若使用者覆寫同一路徑，舊版本的掃描成功事件可能晚到。只檢查 `upload_id` 和 `available` 會讓新內容套用舊結果。掃描工作和下載讀取都要綁定不可變物件版本，並核對掃描政策版本、目前狀態和請求者權限。

以下 Python 是純條件示意。輸入須由伺服器從可信紀錄取得，不能接受用戶端自行宣稱的 `authorized` 或掃描結果：

```python
def can_download(*, state, authorized, object_version,
                 scanned_version, scan_result, policy_version,
                 scanned_policy_version):
    return (
        state == "available"
        and authorized is True
        and object_version is not None
        and object_version == scanned_version
        and scan_result == "clean"
        and policy_version is not None
        and policy_version == scanned_policy_version
    )
```

這個函式沒有實作身分驗證、事件驗證、儲存交易或撤銷機制。呼叫端還要確保檢查後讀取的就是相同物件版本，避免在檢查與使用之間換檔。若採簽章下載 URL，應綁定版本並限制效期；已發出的 URL 能否立即撤銷取決於儲存與代理設計，不能把更新資料庫狀態當成已完成撤銷。

### 重送、逾時與人工接手要各自有結果

1. 掃描逾時只能維持等待、重試或轉交審查。**逾時、沒有結果或進入人工審查，都不能當作掃描通過。**
2. 更新狀態時比對物件版本、工作識別碼與目前版本號，以條件式更新或交易拒絕過期事件。
3. 同一結果的重送保持狀態冪等。狀態更新和待發通知可寫在同一交易的 outbox；送信端仍需去重，不能因此宣稱跨系統通知只會送達一次。
4. 重試耗盡要留下最後錯誤、接手人、處理期限與下一個動作。人工接手可以拒絕或重新觸發掃描，任何例外放行都須另有授權與稽核流程。

原有兩項驗收條件可以保留，再補上晚到結果與越權請求：

```gherkin
Given 檔案仍在等待掃描
When 使用者要求下載
Then 系統不提供檔案，並顯示目前的處理狀態

Given 掃描器暫時無法回應
When 系統重試掃描
Then 檔案保持不可下載，直到收到目前物件版本與政策的可驗證乾淨結果，並符合其他下載條件

Given 目前物件版本是 v2，且 v2 尚未通過目前政策的掃描
When 收到 v1 的掃描成功事件
Then v2 仍不可下載，且記錄過期結果

Given 物件版本已通過掃描
When 沒有存取權限的使用者要求下載
Then 系統拒絕請求
```

觀測資料沿著工作串接，至少記錄 `upload_id`、物件版本、掃描工作識別碼、政策版本、狀態轉換時間與重試次數。值班人員才能分辨是事件遺失、掃描逾時，還是舊結果遭拒，並在不記錄檔案內容的前提下追查。

## 在需求階段先做一次中斷走查

不必等正式事故才運用這個視角。下一場需求或架構工作坊，可以挑一條重要的成功流程，再逐步走查：

1. 說清楚使用者要完成的工作，以及系統回報「完成」時承諾了什麼。
2. 列出支撐這段工作的器具與關係，包含資料、背景工作、外部服務和人工角色。
3. 暫停或移除一項必要依賴，觀察哪個狀態先變得不明確、哪位使用者先承受影響。
4. 寫下可恢復的狀態、責任人、重試或人工接手機制，以及能證明流程恢復的測試。

走查時把使用者的工作、系統元件與人工接手一起列入，才能看見完整依賴。若流程中斷時沒有人知道它停在哪裡、誰該接手，系統模型就還少了一段重要的依賴。

## 故障提供線索，不會替你決定架構

海德格的器具分析不是可靠度工程方法，也不會告訴團隊要不要使用微服務。一次中斷可能來自部署失誤、外部供應商或罕見資料，未必代表模組邊界錯誤；追蹤資料還應搭配受影響者的經驗。這個哲學視角提供的是觀察入口，架構改動仍要由重現證據、失敗代價、團隊責任與維護成本來決定。

下次設計一條含有背景工作或外部服務的流程時，先挑一個最重要的依賴做中斷走查。把「成功」拆成可驗證的狀態，寫明誰能看見失敗、誰負責恢復，並補上舊事件晚到的回歸測試。

若已經找出哪些依賴在中斷時浮現，接著可以讀[事故調查別讓警報替你下定義：用杜威探究法更新故障假設](/blog/dewey-inquiry-incident-diagnosis/)，學習如何在調查過程中形成並修正問題陳述。

## 延伸閱讀

- [Martin Heidegger：Being and Time，§§15、§16，John Macquarrie 與 Edward Robinson 譯](https://books.google.com/books?id=cbnVzwEACAAJ)
- [Stanford Encyclopedia of Philosophy：Martin Heidegger](https://plato.stanford.edu/entries/heidegger/)
- [Stanford Encyclopedia of Philosophy：Martin Heidegger，§16 的早期版本](https://plato.stanford.edu/archives/win2014/entries/heidegger/)

- [OWASP：File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
