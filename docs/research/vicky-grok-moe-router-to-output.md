# From Router to Output：Mixture of Experts（MoE）研究筆記

> 研究日期：2026-08-31（Asia/Taipei）
>
> 原文：[Vikas gupta（@vicky_grok）X 貼文](https://x.com/vicky_grok/status/2094249057267179839?s=12)
>
> 原文標題：**From Router to Output: Understanding Mixture of Experts (MoE)**；作者頁面顯示發布時間為 2026-08-31 10:20。

## 原文可用內容

X 頁面可讀到的首段主旨是：模型可以變大卻更快；理解 MoE 應從 router 如何把 token 分派給 experts，一路追到輸出。這是作者的教學性概括，不是對特定模型全部架構細節的證明。

原文中應特別視為未證實或過度概括的說法：

- 「GPT-4 是 MoE」及其 expert 數量／參數量：OpenAI 沒有公開 GPT-4 架構，不能由公開一手資料確認。
- 「experts 零 compute」：錯誤。未被選中的 expert 對該 token 不計算，但 router、被選中的 experts、共享層、通信／dispatch、組合輸出仍需計算。
- 「token dropping 必然造成 hallucination」：沒有一手來源支持必然因果；token dropping 是容量／負載策略，可能影響品質，但結果依模型、capacity factor、訓練與推論設定而異。
- 「Mixtral 等同 47B dense 智力」：參數總量、每 token active parameters 與能力不是等價單位。Mixtral 論文可支持其 46.7B total parameters 與約 12.9B active parameters 的架構描述，但不能推出等同某個 47B dense 模型的能力。

## 一手來源核對

1. [Shazeer et al., 2017：Outrageously Large Neural Networks](https://arxiv.org/abs/1701.06538)（2017-01-23）：提出 sparsely-gated MoE；trainable gating network 對每個輸入選擇稀疏的 experts，讓模型容量增加而不按總參數等比例增加每個輸入的計算。支持「router／conditional computation」基本概念；不支持「零 compute」。
2. [Fedus, Zoph, Shazeer, 2021：Switch Transformers](https://arxiv.org/abs/2101.03961)（2021-01-11）：說明 MoE 讓不同輸入選不同參數，形成 sparsely activated model；同時明確指出 complexity、communication cost、training instability 是採用障礙，並討論 capacity 與 token routing。支持「大容量、近似固定計算」的限定說法；不支持「更大必然更快／更準」。
3. [Jiang et al., 2024：Mixtral of Experts](https://arxiv.org/abs/2401.04088)（提交 2024-01-08）：Mixtral 8x7B 是 sparse MoE；每一層由 8 個 feed-forward experts 組成，每個 token 選 2 個 experts。論文報告模型總參數約 46.7B、每 token 使用約 12.9B parameters，並以 benchmark 比較能力與速度。支持「8×7B 不是每 token 啟用 56B」；不支持與 47B dense「智力等同」。
4. [Mistral AI：Mixtral of experts](https://mistral.ai/news/mixtral-of-experts/)（2023-12-11）：官方發布 Mixtral 8x7B，稱為 high-quality sparse MoE、Apache 2.0 open weights，並列出 context、benchmark 與 endpoint 資訊。其 benchmark 數字是 Mistral 的測試結果，不能直接泛化到所有 MoE。
5. [Mistral Docs：Mixtral 8x7B](https://docs.mistral.ai/models/mixtral-8x7b-0-1)（官方文件，查閱 2026-08-31）：確認 Mixtral 8x7B 型號與官方模型資料。可作為模型身份／文件交叉來源；詳細 router 計算仍以論文為準。
6. [xAI：Open Release of Grok-1](https://x.ai/news/grok-os)（2024-03-17）：xAI 稱 Grok-1 是從頭訓練的 314B parameter MoE model，並連結官方 repo。支持「Grok-1 是 MoE」及總參數量的官方說法；不支持 GPT-4 架構推測。
7. [xAI 官方 repo `model.py`](https://github.com/xai-org/grok-1/blob/main/model.py)（查閱 2026-08-31）：原始碼包含 `num_experts`、token index／probability、expert dispatch 與輸出組合；可直接核對 Grok-1 的 router／expert 實作，而非只依賴宣傳文字。

## 事實、推論與缺口

| 項目                                               | 判定                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| MoE 由 router 為輸入選擇部分 experts               | 一手論文支持，事實                                                              |
| 稀疏啟用可讓總容量增加而控制每 token 計算          | Shazeer／Switch 支持，但需承擔 routing、通信、負載平衡成本                      |
| Mixtral 8x7B 每 token 選 2/8 experts               | Mixtral 論文支持，事實                                                          |
| Mixtral 約 46.7B total、約 12.9B active parameters | Mixtral 論文支持，事實；active 不等於能力分數                                   |
| 模型變大卻更快                                     | 需指定 dense baseline、硬體、batch、sequence length 與 kernel；只能作條件性推論 |
| GPT-4 使用 MoE                                     | 未公開，無法驗證                                                                |
| 未選 expert 完全沒有 compute                       | 錯誤／過度簡化；稀疏路徑仍有 router、dispatch、selected experts 與 aggregation  |
| token dropping 必然導致 hallucination              | 未證實的因果外推                                                                |
| Mixtral 等同 47B dense 智力                        | 無此等價定義或一手證據，應避免                                                  |

## 給 blog 的安全引用句

「MoE 的關鍵不是把所有 experts 同時跑一遍，而是由 router 對每個 token 選擇稀疏路徑；因此可以提高模型的總參數容量，同時把每 token 的 active parameters 控制在較小範圍。不過，這不代表未選 expert 完全沒有成本，也不代表總參數量可以直接換算成模型能力。以 Mixtral 8x7B 為例，論文報告約 46.7B 總參數、每 token 約 12.9B active parameters；這是計算路徑的描述，不是『等同 47B dense 智力』的證明。」

原貼文的 GPT-4 架構、零 compute、必然 hallucination、以及 dense-equivalence 句子，應在文章中標註為未證實／過度概括，或刪除。
