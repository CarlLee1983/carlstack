---
title: "工程招募要把技能證據和地位訊號分開"
description: "從凡勃倫、布迪厄與一篇談文化資本的長文出發，檢視履歷上的身分訊號如何影響評價，並提出以職務任務、工作樣本和共同評分規準蒐集工程能力證據的做法。"
publishDate: 2026-09-27T14:32:00+08:00
updatedDate: 2026-11-05T23:45:34Z
draft: false
featured: false
tags:
  - 面試指南
  - 職涯發展
  - 架構方法論
series: 構架師・人性卷
seriesOrder: 3
cover: ../../assets/covers/engineering-hiring-status-signals.png
coverAlt: "空曠的大廳裡，一架鋼琴位於地面中央，樓梯與敞開的側門延伸至遠處，呈現地位標記、通道與離場之間的距離。"
---

假設面試官和候選人聊起同一場音樂會，談話變得順暢，評語也從「能完成題目」變成「很有潛力」。這時值得追問：新增的好感來自哪一項工作證據？若換一個沒有相同生活經驗的人，團隊還會給出同樣的評價嗎？

本文的起點是 @dashen_wang「構架師・人性卷 03」的[原始貼文](https://x.com/dashen_wang/status/2104037472036434393)與[X 長文](https://x.com/i/article/2104037020360404992)。既有文章以酒店鋼琴、文化資本與階梯作為討論線索；本次修訂無法重新讀取 X 全文，因此不把其中的場景當成已核實事件，也不沿用未能重核的逐字引文。工程招募可以獨立回答一個更具體的問題：履歷、談吐與工作樣本，各自能證明什麼？

## 文化資本能解釋評價，但不能代替能力證據

凡勃倫在《有閒階級論》第四章分析消費如何展示經濟地位；布迪厄則把文化資本分成具身、物化與制度化形式，分別涉及長期習得的傾向與能力、文化物件，以及資格制度承認的成果。[凡勃倫原著](https://www.gutenberg.org/files/833/833-h/833-h.htm)；[布迪厄〈資本的形式〉](https://web.stanford.edu/~eckert/Courses/ParisPapers/Bourdieu1986.pdf)

用這些概念檢視招募時，不必先否定鋼琴、學位或表達能力的價值。技能可以真實存在，取得技能的機會也可能分配不均。需要分開判斷的是：候選人呈現了什麼，以及那項證據與職務有什麼關係。例如，能清楚說明事故影響是工作要求；和面試官喜歡相同音樂，則不能直接推導出事故處理能力。

Kyla Thomas 在 2018 年發表的履歷稽核研究，於美國四個城市比較履歷中的文化品味訊號。對申請面客工作的女性，標示較高社會階級文化品味的履歷獲得較高回覆率；對男性及非面客職位，沒有觀察到系統性的回覆差異。研究涵蓋客服、銷售、行政與文書職缺，使用音樂、運動及飲食興趣作為訊號，並未測試軟體工程能力。[Thomas 的研究](https://sociologicalscience.com/download/vol-5/september/SocSci_v5_562to595.pdf)

這項結果支持的是特定招募情境中的文化訊號效應。回覆率不是錄取率，更不是入職後績效；沒有系統性差異也不等於證明那些職位完全沒有偏見。對工程團隊而言，合理的應用是檢查評語有沒有混入與任務無關的熟悉感，而不是拿這項研究替某家公司或整個產業下結論。

## 工作樣本提供資訊，公平性仍須另行檢查

Roth、Bobko 與 McFarland 在 2005 年的統合分析中，報告工作樣本與工作績效測量間的觀察平均相關為 .26；校正績效測量信度後為 .33。作者也指出，部分早期綜述存在方法問題，工作樣本的效度可能沒有過去估計得那麼高。[統合分析](https://doi.org/10.1111/j.1744-6570.2005.00714.x)

這兩個數字不能讀成「26% 或 33% 的候選人會被正確錄取」。它們是研究樣本中的相關估計，不能直接當作工程面試的預測值，也沒有證明任何一份帶回家作業都公平。團隊仍要決定題目測什麼、候選人能用多少時間、工具是否一致，以及評分者如何處理不完整的答案。

以下是本文提出的流程建議，並非前述論文驗證過的一套工程面試制度。

### 先寫出一項真的會發生的工作

以維護 API 的職缺為例，提供一個小型服務、必要文件和可重現的重複請求案例。請候選人定位問題、提出修正，並解釋如何驗證不會重複產生副作用。不要要求接觸公司正式系統、提供前雇主程式碼，或替公司完成可直接投入營運的免費工作。

題目範圍必須符合職級。若只是測試新人的除錯與驗證能力，就提供所需領域知識；若職務真的需要處理分散式一致性，才把併發、失敗重試與資料持久化列入預先公布的要求。不能出題時寫「簡單修正」，評分時卻用未揭露的架構需求扣分。

### 把時間與工具條件一併公開

下面是一份可調整的題目契約範例，時間配置是設計示例，不是研究得出的最佳值：

- 時間：安排 60 分鐘，包含閱讀、實作與說明；先由現任工程師試做，再調整範圍。
- 環境：提供可啟動的專案、固定版本與測試指令，不把自備高階電腦或付費工具列為隱含要求。
- 工具：明訂文件查詢、搜尋及 AI 協助的使用規則。若允許 AI，提供一致的存取條件，並要求候選人說明及驗證採用的修改。
- 調整：事先提供合理調整的聯絡方式；可用相同能力目標的替代形式處理無法配合原安排的情況，記錄調整而不把它當作扣分理由。
- 延伸：不要求超時補完。若流程需要較長試作，另行約定範圍與報酬，避免把可支配的閒暇當成投入程度。

### 用可觀察行為寫評分規準

評分表可以只保留四個面向，每一項都必須附上作答中的證據：

- 需求理解：能否說明何謂同一次操作，以及重複請求會造成什麼後果？若自行加入假設，有沒有明確說出？
- 修正正確性：改動是否符合已公布的需求？如果併發屬於題目範圍，是否處理兩個請求同時進入的情況？
- 驗證方式：是否先重現問題，再以測試或其他可重複的方法驗證修正？有沒有檢查修正可能破壞的原有行為？
- 取捨說明：能否交代方案限制、未完成部分與下一個驗證步驟？不用口音、說話速度或與面試官相似的表達風格代替這項判斷。

面試官先各自記錄，再討論分歧。評語寫「新增重送測試，但未處理題目要求的併發案例」，比「不夠資深」更容易複核。履歷可以提供待查證線索，但學校、前公司名氣、作品平台或嗜好不應自動換成這四項的分數。

**若評分理由無法連回已公布的職務要求與具體作答證據，先補問或重評，不以該理由決定淘汰。** 這是一條流程停止規則，不能保證消除所有偏見，但能讓團隊檢查自己究竟依據什麼做決定。

## 入職後的資料也不能直接證明面試有效

定期回看樣本題與工作表現很有用，但只看錄取者會漏掉被拒絕的人；入職後績效還可能受任務分配、帶領方式和主管評分影響。不要把少數成功任用的故事，寫成題目已經具有預測效度。

團隊可以先做較小的檢查：評分者對同一份答案是否經常分歧？題目是否因環境故障而失去有效作答時間？某個評分面向在實際工作中是否根本用不到？若發現問題，先修改題目或評分說明，保留版本與修改理由，避免拿不同版本的結果直接排名。這些是流程品質檢查，與正式驗證預測效度是不同的工作。

文化資本理論本身也不宜被縮成「背景決定一切」。Tzanakis 的教育研究回顧對布迪厄特定社會再製機制的實證支持提出質疑；這是該回顧的判斷，不代表文化或家庭背景完全不影響教育。它也提醒讀者，理論解釋、量測方式與實際情境必須分開處理。[Tzanakis 的回顧](https://www.educatejournal.org/index.php/educate/article/view/251)

相關延伸閱讀包括 Cheng Yong Tan 的〈Conceptual diversity, moderators, and theoretical issues in quantitative studies of cultural capital theory〉。此處保留[原 DOI](https://doi.org/10.1080/00131911.2017.1288085)，並依[作者所屬大學的出版清單](https://web26.edu.hku.hk/faculty-academics/tancy)更正題名；本文不以未取得的全文補充效果大小或因果結論。

下一次發布工程職缺前，先挑一項日常任務，寫出題目、時間與工具條件，以及四項可觀察的評分證據。請兩位面試官試評同一份答案，修正說不清楚的分歧，再交給候選人。這比先討論誰「看起來像我們團隊的人」更能讓評價接受檢查。

這是「構架師・人性卷」第 3 篇；可回讀[第 1 篇：工程團隊要把培養設計成工作，不要設計成人情債](/blog/engineering-mentorship-boundaries/)與[第 2 篇：拆解衝動不是架構理由](/blog/dismantle-with-a-recovery-path/)。

## 參考資料

- [Thorstein Veblen, _The Theory of the Leisure Class_](https://www.gutenberg.org/files/833/833-h/833-h.htm)
- [Pierre Bourdieu, “The Forms of Capital” (1986)](https://web.stanford.edu/~eckert/Courses/ParisPapers/Bourdieu1986.pdf)
- [Kyla Thomas, “The Labor Market Value of Taste: An Experimental Study of Class Bias in U.S. Employment” (2018)](https://sociologicalscience.com/download/vol-5/september/SocSci_v5_562to595.pdf)
- [Philip L. Roth, Philip Bobko & Lynn A. McFarland, “A Meta-Analysis of Work Sample Test Validity: Updating and Integrating Some Classic Literature” (2005)](https://doi.org/10.1111/j.1744-6570.2005.00714.x)
- [Michael Tzanakis, “Bourdieu’s Social Reproduction Thesis and The Role of Cultural Capital in Educational Attainment: A Critical Review of Key Empirical Studies” (2011)](https://www.educatejournal.org/index.php/educate/article/view/251)
- [Cheng Yong Tan, “Conceptual diversity, moderators, and theoretical issues in quantitative studies of cultural capital theory” (2017), _Educational Review_, 69(5), 600–619](https://doi.org/10.1080/00131911.2017.1288085)
