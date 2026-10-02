---
title: "Clef 相容 Jev API，既有分流門檻仍需重新驗收"
description: "Cloudflare 發布 Clef 與 Clef-flash，提供 Jev 相容決策介面與開放權重。以客服分流遷移為例，檢查輸入截斷、機率門檻、人工佇列容量及圖片擴充，避免把 API 相容當成決策行為相同。"
publishDate: 2026-10-02T12:03:15+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 技術選型
series: AI Agent 工程化與工作流實戰
seriesOrder: 53
cover: ../../assets/covers/clef-jev-migration-routing-thresholds.png
coverAlt: "紫色與青色鏡片可裝入同一座光學框架，卻在校準布樣上留下不同色帶，表達介面可替換仍需要重新校準判斷。"
---

客服分流服務換了模型，JSON 仍能解析，帳務與技術問題卻開始以不同的比例進入人工佇列。這種變更很容易被「API 相容」遮住：程式接得上，原本的放行門檻未必還有相同效果。

Cloudflare 在 2026 年 10 月 1 日的[發布公告](https://blog.cloudflare.com/clef-decision-models/)推出 Clef 與 Clef-flash，提供 Workers AI 託管推論，並宣稱相容 Jev API。Clef 的[官方模型卡](https://huggingface.co/Cloudflare/clef)標示 Apache-2.0 授權，讓團隊也能下載權重評估。本文查閱公告、模型卡與 API 文件，沒有呼叫付費推論，也沒有本機 GPU 實測。

站內〈[Jev 的決策模型與執行邊界](/blog/jev-system-one-decision-model/)〉已介紹有限答案；〈[Jeeves 自架判斷服務](/blog/jeeves-self-hosted-decision-service/)〉則談推理模式與尾端延遲。本篇處理的是替換既有服務：哪些契約能沿用，哪些分流行為必須重新量測？

## 相容的介面，要用同一份輸入驗證

[Clef 模型卡](https://huggingface.co/Cloudflare/clef#jev--systemone-api)描述的 SystemOne 介面接收 `state` 與具名的 `questions`，回傳對應答案。`choice` 包含選項與機率分布，`noul` 是 true 的機率，`score` 是有序級距的期望值。這些欄位讓現有 adapter 有可對照的契約，但不能推出兩個模型會給同一張工單相同機率。

假設既有服務只判斷應送往哪個團隊，遷移的第一輪就保留同一段文字、同一組問題與同一份選項說明。下面是本文設計的請求 body，依[Workers AI 文件](https://developers.cloudflare.com/workers-ai/models/clef/)的欄位整理；未執行，也不附虛構回應。

```json
{
  "model": "clef",
  "state": "結帳頁顯示錯誤，但信用卡已有一筆扣款。我需要確認訂單與退款。",
  "questions": {
    "team": {
      "type": "choice",
      "instructions": "依目前工單內容選擇第一個處理團隊；跨團隊或資料不足時送人工。",
      "criteria": {
        "billing": "付款、發票與退款，且不涉及尚未確認的技術故障",
        "technical": "功能錯誤、服務中斷與設定問題",
        "human": "跨團隊、資訊不足，或無法依規則決定"
      }
    }
  }
}
```

若正式服務原本沒有 `human` 選項，不要在第一輪比較時順便加入。改選項已經改了任務；應先凍結原契約做配對比較，再單獨評估新增人工出口。否則結果變好了，也分不清是模型改變還是問題改寫。

接入檢查至少要抓到缺失問題 ID、未知選項、非有限機率值，以及答案與請求不對應。模型名稱也要保留在紀錄中，讓同一批工單能追溯到供應商、模型與 schema 版本。這些是本文建議的 adapter 驗收，並非宣稱已替 Clef 跑完測試。

## 較大的 context，仍要核對送進去的是哪一段

[Workers AI 的 Clef 文件](https://developers.cloudflare.com/workers-ai/models/clef/#parameters)標示 65,536-token context，並提醒長文字 state 會被截斷以符合上限。這會影響遷移結果：兩個供應商接收相同文字，不代表最後評分時都看到了相同內容。

工單最末一句若是「已確認扣款只是預授權」，被截掉後就可能改變分流。我的建議是由應用先建構固定輸入：工單 ID、最近訊息、必要訂單事實與可用證據，並保存送出的內容版本。若預算不足，要依規則縮減或送人工；不要讓分類服務默默決定哪段業務事實消失。

Clef 也提供圖片能力，但託管 API 的[圖片參數](https://developers.cloudflare.com/workers-ai/models/clef/#parameters)有格式、大小與數量限制，且不接受遠端 URL。模型卡另列本地圖片與影片用法，不能將本地介面描述直接當成 Workers AI 的傳輸格式。

因此，文字替換與多模態擴充應分兩次驗收。第一輪只比較既有文字工作；第二輪才加入帳單截圖，檢查圖片是否載入、內容是否足以判讀，以及缺圖時會不會錯誤放行。開放權重提供另一條部署路線，並未替團隊完成 GPU 容量、服務存取與資料保存政策。

## 公開 benchmark 提供候選，門檻要對自己的佇列負責

Cloudflare 的[公告](https://blog.cloudflare.com/clef-decision-models/)與[模型卡 Results](https://huggingface.co/Cloudflare/clef#results)公開多組比較。模型卡將 Decision Index 結果標為內部執行；其中 BANKING77 的 Clef／Clef-flash macro-F1 為 94.2／90.9，CLINC150+OOS 則為 97.4／66.8。這是廠商自測數據，本文沒有獨立重跑；同樣叫決策模型，兩個版本在不同任務上也有不同落差。

我不會用某一列最高分，直接決定客服流量切到哪個版本。遷移需要量的是現有規則的實際效果。若系統採用「最高選項機率超過某門檻就自動分流」，同一門檻在新模型上可能放行更多工單，也可能讓人工佇列突然增加；兩種結果都需要成本紀錄。

我的評估方式是對同一份去識別工單同時取得舊模型、Clef 與 Clef-flash 的結果，只記錄候選分流，不改寫正式案件。人工標記應包含付款／故障交疊、資料不足、繁體中文與混合語言，並將同一客戶事件的變體放在同一分組，避免相似案例跨入開發與保留集。

在開發集選門檻，凍結後才評估保留集。除了團隊分類正確率，還要記錄自動採用的錯誤比例、轉人工比例，以及應送人工卻被自動分流的案例。高機率區間的實際正確率，也必須由這份資料估計，不能從欄位名稱推定已經校準。

延遲則從應用送出到拿到完整結果計算，包含網路、排隊與重試。測量時固定併發與輸入分布；同時檢查人工佇列能否承受新門檻。模型快了幾毫秒，卻讓客服多等一天，工作流沒有獲得改善。

## 微調服務的可得性，和自助平台的承諾要分開

Cloudflare 的[微調說明](https://blog.cloudflare.com/clef-decision-models/)先提供 FDE 團隊協助調整，再將這些經驗用於未來的自助平台。不能把今天的公告寫成所有使用者已能自助完成資料擷取、訓練與重新部署。

對已經能用通用模型分流的團隊，我會先保留供應商切換開關、凍結 schema 與門檻設定，建立 shadow 比較，再決定是否需要微調。若要提供訓練資料，資料用途、保存與授權也要另行確認；本文未上傳任何工單。

**停止規則：新版本的錯誤自動分流超過預定容許值，或人工佇列超過可處理容量，就保留原路徑。** 逾時、輸入不完整與契約錯誤要有明確的人工出口；不能把失敗回應當成「沒有問題」。

下一次替換決策服務，拿同一批工單、同一份 schema 與既有門檻跑一次影子比較。列出改變分流的案例，讓客服負責人確認哪些改變可接受，再決定調門檻、換模型或加入圖片。
