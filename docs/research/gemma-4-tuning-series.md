# Gemma 4 微調實戰：來源與查核

以 [Gemma 4 Fine-tuning overview](https://gemma.ai/tuning/) 為總入口，2026-11-27（台北）開啟官方原文。查重包含主 URL、Gemma 4、LoRA／QLoRA、偏好微調、文章佇列及研究。全系列採同一虛構客服情境，不公開私有資料、未跑模型訓練或推論效能測試。

1. 是否需要微調：總覽、[continued pre-training](https://gemma.ai/tuning/continued-pretraining/)。RAG、SFT 與原始語料訓練處理不同錯誤；不把官方 replay 配比當保證。
2. 資料與 VRAM：[dataset formatting](https://gemma.ai/tuning/datasets-formatting/)、[LoRA／QLoRA](https://gemma.ai/tuning/qlora/)、[best practices](https://gemma.ai/tuning/best-practices/)、[QLoRA 論文](https://arxiv.org/abs/2305.14314)。12B 約 11／80 GB 是官方 2,048 tokens 參考；72 GB 是粗估權重、梯度及 optimizer，不含活化值。
3. 評估與部署：[DPO](https://gemma.ai/tuning/preference-alignment/)、[GRPO](https://gemma.ai/tuning/reinforcement-learning/)、[匯出](https://gemma.ai/tuning/export/)及[擴展與 QAT](https://gemma.ai/tuning/scaling/)。排除將配對、可驗證獎勵和上線授權混為一談。部署比較方法與停止規則為工程建議，不是模型基準。
