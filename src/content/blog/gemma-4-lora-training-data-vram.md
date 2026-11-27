---
title: "Gemma 4 單卡微調的資料與記憶體"
description: "用一個客服分流資料集，說明怎麼核對對話模板與訓練遮罩，並估算 LoRA、QLoRA 和全量微調的記憶體。"
publishDate: 2026-11-27T11:14:26+08:00
draft: false
featured: false
tags: [AI 工程化, Gemma, 模型微調]
series: Gemma 4 微調實戰
seriesOrder: 2
cover: ../../assets/gemma-4-lora-training-data-vram.webp
coverAlt: "深紫色背景前放著一個由銅色、透明與深灰材料疊成的扁托盤。"
---

退貨助理仍然會把缺少購買日期的案件直接分流。[上一篇](/blog/gemma-4-tuning-or-rag/)已把這個失敗和文件檢索分開。現在要做的實驗很小：同一個 Gemma 4 指令版 checkpoint，加上一個 adapter，看看模型是否更常在正確的時機追問。第一輪先檢查資料怎麼進到 loss，以及最長的訓練樣本能不能塞進顯示卡。

## 先挑幾筆資料，確認模型在學哪一段

每筆資料至少要看出使用者給了什麼、客服規則要求什麼、期望模型回哪一句。對話格式交給所用 checkpoint 的 tokenizer／processor 和聊天模板。訓練端展開幾筆序列，核對角色、轉折、結束標記與遮罩。長對話要另外印出截斷後的結果，避免問題還在，助理的目標答案卻早被切掉。

[Google 的資料格式指南](https://gemma.ai/tuning/datasets-formatting/)示範 completion-only loss。提示詞仍參與前向運算，模型讀得到上下文，但提示詞上的 token 不當作要預測的目標。助理回答以及對應結束標記才算入目標。若是工具呼叫資料，工具回傳是上下文，不應當成助理自己要生成的答案。不要只看訓練參數名稱；取出一筆實際 batch，逐段確認哪些 labels 被忽略、哪些參與 loss。

資料切分也要按案件或文件版本做，別讓同一筆案件的改寫同時進到訓練與驗證。先留一個完全不給調參流程看的測試集合，再從其餘資料切驗證集。[Gemma 的建議](https://gemma.ai/tuning/best-practices/)用驗證 loss 幫忙看過擬合，但交付仍應比較同一批問題上正確追問的比例與既有能力有沒有退步。

## 先把權重、訓練狀態和活化值分開估

[LoRA／QLoRA 指南](https://gemma.ai/tuning/qlora/)與 [QLoRA 論文](https://arxiv.org/abs/2305.14314)說明的重點是：底模凍結，只更新低秩 adapter。QLoRA 另把底模的部分權重以 4-bit 形式載入；adapter 和運算不會因此全部變成 4-bit。LoRA 有多少參數，取決於 rank 與目標模組，不是固定比例。

以 12B 全量微調為例，假設 BF16 權重與梯度各 2 bytes、8-bit optimizer 狀態合計粗抓 2 bytes，第一筆帳是 `12B × 6 bytes ≈ 72 GB`（十進位），還沒加活化值、工作緩衝和配置額外成本。[官方總覽](https://gemma.ai/tuning/#3-gpu-memory)在 2,048 tokens 列出 12B QLoRA 約 11 GB、全量約 80 GB。這是官方參考量級，並非同一張卡的本地實測或容量保證。序列長度、microbatch、gradient checkpointing、資料型態和套件版本變動都要重新量測。MoE 的 active parameters 影響每次運算量，但不能直接用這個數字估全部權重的駐留量。

這一輪是純文字。若後續要讀退貨單照片或錄音，應改用對應的 [Gemma 視覺](https://gemma.ai/tuning/vision-qlora/)或[語音](https://gemma.ai/tuning/audio-qlora/)方案，核對 checkpoint 是否支援、如何處理非文字 token 與多模態 batch 的峰值。

開跑前先用預定長度的代表性短批次做完整 forward、backward 與 optimizer step，再用較長的樣本核對峰值，並確認標籤還在。若記憶體只是偶爾超出，先檢視序列長度分布、降低 microbatch 或開啟 checkpointing；用梯度累積維持有效 batch 之前，也要核對累積設定。這篇未執行 GPU 訓練或壓測。下一步是保留第一個可重現的 adapter，進到[評估與部署](/blog/gemma-4-tuning-evaluation-deployment/)。
