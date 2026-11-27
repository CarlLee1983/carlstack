---
title: "Gemma 4 微調後怎麼驗收與上線"
description: "分清 SFT、偏好最佳化和可驗證獎勵各自解決的問題，再用同一套案例檢查 adapter、合併權重與部署用的量化產物。"
publishDate: 2026-11-27T11:14:26+08:00
draft: false
featured: false
tags: [AI 工程化, Gemma, 模型評估]
series: Gemma 4 微調實戰
seriesOrder: 3
cover: ../../assets/gemma-4-tuning-evaluation-deployment.webp
coverAlt: "白色方片沿著綠色輸送帶經過兩道檢查框，末端有一盞綠燈。"
---

退貨助理開始會追問購買日期，但有時一次問了四個欄位，或走到要退款時仍靠猜。兩類錯誤不能放在同一個「喜歡／不喜歡」分數裡。使用者覺得回覆簡潔和退款決策正確是不同的事。服務是否可用，還得看最後實際部署的模型，而不是只看訓練筆記本裡的 checkpoint。

## 人能穩定比較的偏好，才做成配對

如果兩段答案都符合政策，但一段能更精準地追問缺少的欄位，可以在同一個 prompt 下標出 preferred 和 rejected。SFT 已提供「正確答法」的示範；這一步再告訴模型，在兩個可能答法裡更希望看到哪一個。[Gemma 的 DPO 指南](https://gemma.ai/tuning/preference-alignment/)以偏好配對和凍結的參考模型做最佳化，不需要另訓一個 reward model，也不是讓模型在訓練中自己採樣再領獎勵。

參考模型要對得上這次要比較的起點。若關掉目前 adapter 得到的是原始底模，而我們原本要參照的是 SFT 後的模型，基準就錯了。Google 的 LoRA 範例建議把前一階段的 SFT adapter 合併，再加新的 DPO adapter。實作前把參考版本寫在訓練紀錄裡，別只用一個同名模型目錄。

## 能用資料或程式驗證的結果，另做一組

若目標是案件路由正確，可以讓驗證器在合成訂單上檢查輸出。若已超過期限且無例外條款時，不得回傳可直接退款；缺購買日期時，要回傳需要補問；只有 JSON 合法但分類錯，判定仍不通過。[Gemma 的 GRPO 指南](https://gemma.ai/tuning/reinforcement-learning/)示範替同一個 prompt 產生一組回覆，再對回覆打分。這種方法值得考慮的前提，是獎勵能反映真實要的結果，而且產生多個候選的成本可承擔。

把關單規則只交給模型並不必要。正式退款仍由原有業務系統檢查授權、金額與政策；這裡訓練的是建議或分流，不是付款權限。評估時另外留沒參與調參的案例，例如看似符合期限、其實缺購買證據的訂單。若模型多拿分只是因為格式對，先改評分器，不用增加訓練輪數來掩蓋錯誤。

## 評估最後要載入的那份產物

保留原始 `-it`、訓練後的 adapter、要上線的合併或量化版本，使用相同測試資料與推論設定逐一比較。每份產物記下底模、adapter、tokenizer、聊天模板、轉檔工具版本和測試集版本。這樣即使某次 export 改了結束標記，也能分辨是模型回答退步，還是服務輸出切在錯誤的位置。

[官方匯出指南](https://gemma.ai/tuning/export/)分別介紹 vLLM 載入相容的 SafeTensors／adapter、llama.cpp 或 Ollama 的 GGUF，以及適用模型的 LiteRT-LM。訓練時用 QLoRA 不代表已完成這些部署格式的轉換；[QAT](https://gemma.ai/tuning/scaling/)則是讓訓練過程模擬量化誤差，也需要重新驗收。先在真正的部署引擎比較正確率、既有能力與資源使用，再做少量流量驗證，保留上一版可立即切回。這裡沒有做訓練、部署或效能實測。

要採用這個流程，可從[單卡微調的資料與記憶體](/blog/gemma-4-lora-training-data-vram/)保留的一個 checkpoint 開始。先比較未改、微調、部署候選三份產物在同一組案例的差異，再決定下一步是補資料、調訓練，還是修正部署設定。
