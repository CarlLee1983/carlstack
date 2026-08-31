---
title: "如何降低 AI 幻覺：先找證據，再判斷資訊是否足夠"
description: "把『不知道』、直接引文、資訊充分性檢查與 citations 組成可驗證的回答流程，並用反例測試避免把流暢回答誤當事實。"
publishDate: 2026-08-31
draft: true
featured: false
tags:
  - AI 工程化
  - 系統設計
  - 軟體品質
series: Claude Prompt Engineering 實戰
seriesOrder: 3
cover: ../../assets/covers/reduce-ai-hallucinations.png
coverAlt: "昏暗研究桌上以放大鏡與燈光檢查一份文件，旁邊放著驗證標記"
repositoryUrl: https://github.com/anthropics/prompt-eng-interactive-tutorial
---

模型最危險的輸出不一定荒謬。更常見的是一段語氣篤定、格式完整，甚至附帶合理數字的回答，但來源根本沒有提供足夠證據。

Anthropic 互動式教程第八章提出兩個方向：允許 Claude 回答不知道，以及要求它在回答前先找證據。這些原則現在仍然成立，但不能只把 Prompt 加上「不要幻覺」就當成可靠性機制。

## 流暢度不是信心，更不是證據

語言模型的工作是產生符合上下文的輸出。當問題預設某件事有答案，例如「史上最重的河馬是誰」，模型可能會為了完成任務而補出一個看似合理的名稱。

第一個修正不是要求它更有自信，而是提供合法的退出條件：

```text
只根據提供的資料回答。
如果資料沒有直接支持答案，請回答「資訊不足」，並說明缺少什麼證據。
不要用常識或猜測補齊缺口。
```

Anthropic 的現行 [Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) 指南同樣建議允許模型承認不知道。官方也明確提醒：這些方法只能降低幻覺，不能完全消除。

## 先抽取證據，再回答問題

長文件裡最容易出現「差一點相關」的干擾資訊。文件可能提供 2022 年訂閱數，使用者卻問 2020 年某一天；如果流程直接要求數字，模型可能把最接近的資料填進答案。

把任務拆成三個可檢查階段會更穩定：

1. 找出直接相關的原文與來源位置；
2. 判斷引文是否足以回答精確問題；
3. 只有證據充分時才形成答案。

```text
<question>
［使用者問題］
</question>

<documents>
［附有來源 ID 的文件］
</documents>

請依序輸出：
1. evidence：直接支持答案的引文與 source_id；若沒有則為空陣列。
2. sufficiency："sufficient" 或 "insufficient"。
3. answer：只根據 evidence 回答；insufficient 時說明缺少的資料。
```

這裡不要求模型公開完整思考過程。系統真正需要留下的是可稽核的證據、充分性判斷與最終答案。

## 能用原生 citations，就不要自己解析引文

若應用透過 Messages API 提供文件，Anthropic 的 [Citations](https://platform.claude.com/docs/en/build-with-claude/citations) 功能可讓回應帶回結構化引文與有效的文件位置。相較於要求模型自行拼接頁碼或字元範圍，原生 citations 更適合需要機器解析與回查來源的產品。

這裡有一個必須先決定的 API 邊界：原生 citations 不能與 `output_config.format` structured outputs 放在同一個 request，否則 API 會回傳 `400`。需要 citation blocks 時，就在應用層驗證文字與引文；需要嚴格 JSON schema 時，則自行定義 `source_id`、引文等欄位並驗證，不要同時開啟 citations。[官方相容性說明](https://platform.claude.com/docs/en/build-with-claude/citations#citations-and-structured-outputs)

即使使用 citations，系統仍要檢查：

- 引文是否真的支持該句結論；
- 是否把部分期間的數據外推成另一個期間；
- 多個來源是否互相衝突；
- 回答是否超出提供文件的範圍。

「有引用」只證明模型附上來源，不自動證明推論正確。

## 不要把 scratchpad 當成單一解方

原教程的長文件範例同時要求模型擷取引文，並判斷引文是否具有足夠細節。這兩個變更一起改善了回答，但因此無法單獨證明「加入 scratchpad」就是關鍵原因。

Repository 的 [Issue #48](https://github.com/anthropics/prompt-eng-interactive-tutorial/issues/48) 也指出這個混合變因：真正有效的部分可能是資訊充分性檢查，而不是把內容放進特定 tag。

工程上不需要爭論哪句提示比較神奇。把兩個責任拆開測：一組只做證據擷取，一組只做充分性判斷，再比較各自錯誤率，才能知道系統真正依賴什麼。

## 用四類測試驗證可靠性

降低幻覺不能只測「文件裡剛好有答案」的案例。至少要包含：

| 測試類型       | 預期行為                       |
| -------------- | ------------------------------ |
| 明確有答案     | 引用正確段落並回答             |
| 完全沒有答案   | 回答資訊不足，不補猜           |
| 有相似干擾資訊 | 不把錯誤年份、人物或單位當答案 |
| 來源互相衝突   | 揭露衝突，不任選一個來源       |

評估時分開記錄 citation correctness、answer correctness 與 abstention accuracy。只看整體「回答像不像」會把最重要的錯誤藏起來。

## 高風險情境需要模型之外的控制

醫療、法律、財務或會直接修改資料的流程，不應讓一段 Prompt 成為唯一防線。較安全的邊界包括：

- 限制可使用的資料來源；
- 對數字、日期與識別碼做程式驗證；
- 低信心或證據衝突時轉人工；
- 保存來源、模型版本、Prompt 版本與輸出 trace；
- 定期用固定 evaluation set 做 regression test。

Prompt 可以要求模型謹慎，系統必須決定錯誤是否有機會造成真實損害。

## 結語：讓答案可以被反駁

可靠回答的重點不是聽起來篤定，而是讀者能沿著 evidence 回到來源，並在來源不足時看到清楚的拒答。

下一篇會進一步處理：當單一 Prompt 同時要搜尋、計算、審查與修訂時，可靠性問題已不只是措辭，而是工作流程設計。
