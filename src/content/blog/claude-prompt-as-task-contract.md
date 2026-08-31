---
title: "Prompt 寫不好，通常不是模型的問題：先把需求變成任務契約"
description: "從 Anthropic 互動式提示工程教材出發，整理 Messages API、清楚指令、角色與驗收條件，建立可測試的 Prompt 任務契約。"
publishDate: 2026-08-31
draft: true
featured: false
tags:
  - AI 工程化
  - 系統設計
  - 軟體品質
series: Claude Prompt Engineering 實戰
seriesOrder: 1
cover: ../../assets/covers/claude-prompt-task-contract.png
coverAlt: "散亂的紙片與紅線沿箭頭收束成一份整齊封存的任務卷宗"
repositoryUrl: https://github.com/anthropics/prompt-eng-interactive-tutorial
---

模型答非所問時，我們常先增加一句「請仔細思考」，再換角色、調 temperature，最後把 Prompt 寫成一整頁。問題有時不在模型能力，而是任務從未被定義成可以完成、也可以驗收的工作。

Anthropic 的 [Prompt Engineering Interactive Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) 從 Messages API、清楚指令與角色設定開始，這個順序很合理：在討論進階技巧前，先確定模型收到的到底是不是完整任務。

不過，repository 仍以 Claude 3 Haiku、Sonnet 與 Opus 為背景。本文保留可沿用的提示設計原則，API 行為則以現行 [Messages API](https://platform.claude.com/docs/en/api/messages/create) 文件為準。

## API 格式正確，不代表任務完整

Messages API 的輸入由 `role` 與 `content` 組成，可用多組 `user`／`assistant` message 表示對話歷史。System prompt 不是一個 `system` role，而是 request 最上層的 `system` 參數。

以下只是結構示意，不是可直接執行的完整 request：

```json
{
  "model": "<current-model-id>",
  "max_tokens": 1000,
  "system": "你是負責分類客服信件的助手。",
  "messages": [
    {
      "role": "user",
      "content": "請分類以下信件：退款一直沒有入帳。"
    }
  ]
}
```

這段格式合法，但「分類」仍然沒有定義：有哪些類別？只能選一個嗎？不確定時怎麼辦？輸出是自然語言還是機器要解析的欄位？

API schema 解決傳輸格式，Prompt 必須解決任務邊界。

## 清楚直接，是把隱含條件寫出來

Anthropic 的現行 [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) 仍把清楚、直接與具體放在核心位置。這不等於把 Prompt 寫得很長，而是只補上會改變答案的條件。

以客服分類為例，最低限度需要：

- 任務：把每封信分到一個類別；
- 類別：`billing`、`technical`、`account`、`other`；
- 判定規則：退款、扣款與發票都屬於 `billing`；
- 例外：證據不足時使用 `other`，不要自行新增類別；
- 輸出：只回傳類別代碼。

「請專業地分類」沒有增加可驗收資訊；明確列出類別與例外才有。

## 角色是上下文，不是能力外掛

原教程第三章示範「你是邏輯分析助手」如何改變回答方式。角色設定確實能固定語氣、觀點與領域背景，但不能取代任務規則。

比較有用的角色會交代責任與讀者：

```text
你是 SaaS 產品的第一線客服分類助手。
你的輸出會直接進入工單路由系統，因此只能使用既有類別代碼。
```

相較之下，「你是世界頂尖客服專家」只有形容詞，沒有新增決策依據。若模型不知道退款該去哪個 queue，角色再厲害也只能猜。

## 把 Prompt 寫成任務契約

一份可工作的 Prompt，通常能回答五個問題：

1. 要完成什麼可觀察的結果？
2. 可以根據哪些輸入做判斷？
3. 有哪些規則與禁止事項？
4. 資訊不足或超出範圍時怎麼處理？
5. 下游系統如何判斷輸出有效？

可以先從這個最小模板開始：

```text
<role>
你是［責任與使用情境］。
</role>

<task>
根據［輸入］完成［可觀察結果］。
</task>

<rules>
- ［必要規則］
- 不要［禁止事項］
- 資訊不足時［明確 fallback］
</rules>

<output>
［欄位、格式或長度限制］
</output>
```

這不是每個 Prompt 都必須填滿的制式表單。若一句話已經足以定義任務，就停在一句話；只有當測試暴露歧義時，才補上缺少的邊界。

## 驗證 Prompt，而不是挑一個漂亮回答

單一示範成功不能證明 Prompt 穩定。最低限度準備一組小型測試案例：

| 案例           | 要觀察的行為          |
| -------------- | --------------------- |
| 正常輸入       | 選到正確類別          |
| 模糊輸入       | 使用定義好的 fallback |
| 超出範圍       | 不自行發明新類別      |
| 指令夾在資料中 | 仍遵守原始任務邊界    |
| 空白或缺欄位   | 回傳可處理的錯誤結果  |

固定模型版本與推論設定後重跑這組案例，記錄通過率與失敗樣本。Prompt engineering 才會從「這句話感覺比較好」變成可比較的工程變更。

## 結語：先修契約，再修措辭

好的 Prompt 不需要像咒語。它只需要讓模型知道自己的責任、可用資訊、邊界與完成格式，並讓外部測試有辦法判斷結果。

下一篇會處理另一個常見問題：任務已經說清楚，但指令、範例與使用者資料全擠在同一段文字裡。這時需要的不是更多形容詞，而是可維護的 Prompt template。
