---
title: "共享 CI 不只需要配額：用奧斯特羅姆追問誰能改規則"
description: "以共享 CI runner 的尖峰壅塞為例，借用奧斯特羅姆對共同資源治理的研究，設計可參與、可監測、可申訴的容量規則與驗收條件。"
publishDate: 2026-09-26T21:56:15+08:00
draft: false
featured: false
tags:
  - "系統設計"
  - "系統思考"
  - "架構方法論"
series: "哲學視角下的系統分析與軟體設計"
seriesOrder: 5
cover: "../../assets/covers/ostrom-common-pool-shared-infrastructure.png"
coverAlt: "明亮的共享工作坊裡，多個工作區都通往中央共用機台，呈現不同團隊如何共同使用與維護有限的 CI 容量。"
---

## 一條配額擋不住排隊爭議

假設六個團隊共用一組 CI runner。週五下午，映像建置佔滿工作槽，安全修補的測試等了四十分鐘。平台組把每個專案的並行上限設為四個，等待卻未消失：有人把工作拆成多個專案，有人質疑緊急修補為何和例行建置同順位。配額限制了單一入口的用量，卻沒有回答誰能定義例外、修改上限，或處理對規則的異議。

runner 的運算時間會被競爭使用，尖峰時一個工作的占用會延後別人的工作。本文因此把這個**可壅塞的共享容量**當成共同資源治理的工程類比；若容量充裕、使用互不影響，就不必套用這套分析。

## 奧斯特羅姆研究的是長期運作的制度

奧斯特羅姆在《[Governing the Commons](https://www.cambridge.org/core/books/governing-the-commons/7AB7AE11BADA84409C34815CC288CD79)》（1990）第三章（頁 58–102，原則摘要見頁 90），從灌溉、漁業等自然資源案例，整理長期存續的共同資源制度常見條件：界定資源與使用者、讓使用規則符合在地條件、由受影響者參與改規則、監測、按情節漸進處理違規、提供低成本爭議處理；較大系統還需要多層治理。這是對觀察到的制度特徵的整理，不是軟體平台的配置範本。

[Cox、Arnold 與 Villamayor-Tomas 對 112 項研究的統合分析](https://www.lincolninst.edu/publications/working-papers/design-principles-are-not-blue-prints-are-they-robust)（2009）認為這些原則有經驗支持，同時強調效果取決於群體、制度與原則間的交互作用，應作機率性理解。把它們搬到 CI，仍須用本地資料檢查成效。

## 把分配規則寫成可修改的政策

工程推論是：排程器只負責執行分配；治理政策還要說明規則的來源與修訂途徑。平台組可以先公布一份由各使用團隊審議的政策，至少包含：

- **邊界與責任：** 哪些 repository 可用哪一組 runner、誰負擔擴容成本、誰維護平台；用穩定的 owner 身分把多個 repository 歸到同一團隊，並將它們的占用合併計入配額。新 repository 要先登記 owner，無法歸屬的工作不進共享佇列。
- **在地使用規則：** 對例行建置、合併前測試與安全修補分別設定並行上限、優先級及最長執行時間；以實際工作時長和尖峰等待分布檢查上限，而非平均分配數字。
- **修改與可見性：** 各團隊指定代表，變更優先級前公開提案、受影響團隊、試行期限和回退條件；儀表板按團隊呈現等待、占用、取消與例外使用紀錄。
- **違規與爭議：** 首次繞過上限先通知並協助修正，反覆發生才暫停例外權限；爭議交由非單一受益團隊的指定負責人，在約定期限內裁定並留理由。

如果多個產品群共用同一機房，團隊可決定自身工作排序，跨群容量保留與擴容則由共同代表處理；平台需承認前者在授權範圍內修改規則的權限。這是多層治理的候選設計，不代表每個 CI 系統都需要委員會。

## 用排隊結果和申訴結果一起驗收

先以兩週尖峰資料定基線，再試行一個月。至少檢查四件事：安全修補的排隊時間是否落在團隊約定的目標內；例行建置是否被優先級長期餓死；每次例外是否能追到申請人、核准理由和到期時間；同一團隊把工作拆到兩個 repository 後，總占用是否仍受團隊配額限制，未登記 owner 的工作是否無法進入共享佇列。另做一次桌面演練：某團隊質疑優先級時，能否找到申訴入口、裁定人、期限與回復舊規則的方法。若等待改善卻讓爭議無處處理，或用量仍可透過拆分身分規避，治理設計仍未通過。

這個視角不能決定 runner 要買多少、排程演算法選哪種，或安全修補應占多少比例；那些選擇仍要看負載、風險、預算與實測。它能提醒我們：配額是規則的執行結果，規則本身也需要被看見、修訂與質疑。下一次調整共享 runner 上限前，先把誰受影響、誰能改、如何申訴寫進政策，再用尖峰資料檢查。

系列前篇：[例外處理要先決定誰負責](/blog/aristotle-practical-wisdom-automation-boundaries/)。接著可讀：[基準測試需要情境判斷](/blog/cartwright-benchmark-validity/)與[局部知識如何影響控制權](/blog/hayek-local-knowledge-control/)。

## 延伸閱讀

- [Elinor Ostrom, _Governing the Commons_ (1990), ch. 3, pp. 58–102，尤其 p. 90](https://www.cambridge.org/core/books/governing-the-commons/7AB7AE11BADA84409C34815CC288CD79)
- [Michael Cox, Gwen Arnold, Sergio Villamayor-Tomas, “Design Principles Are Not Blue Prints, but Are They Robust? A Meta-Analysis of 112 Studies” (2009)](https://www.lincolninst.edu/publications/working-papers/design-principles-are-not-blue-prints-are-they-robust)
