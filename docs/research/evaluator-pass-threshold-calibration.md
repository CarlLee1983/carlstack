# 評估器判決門檻與校準：來源與發布紀錄

查核日期：2026-10-21。對應文章：`src/content/blog/evaluator-pass-threshold-calibration.md`。

## 去重與範圍

- 原始入口：`https://x.com/hamelhusain/status/2112588257104216294?s=46`。
- 正規化入口：`https://x.com/hamelhusain/status/2112588257104216294`；穩定 ID：`2112588257104216294`。
- 主來源：<https://hamel.dev/blog/posts/decision-model-evals/>，索引頁 <https://hamel.dev/blog/posts/decision-model-evals/index.html>。
- 在 `src/content/blog`、`docs/research`、`docs/article-queue.md` 搜尋原始／正規化 URL、穩定 ID、`decision-model-evals`、`How To Use Decision Models for Evals`、`Hamel`、`Antaripa`，未發現既有文章或佇列項目。
- 與既有 `claude-eval-hillclimb-validation-boundaries.md` 有關但不同：既有文處理應用 prompt 迭代與評分器隔離；新文處理固定 evaluator 的分數、判決門檻、錯放／誤擋與機率校準。加互相站內連結；舊文只增加延伸閱讀句，非實質更新，不改原始日期。
- 補查既有 `clef-jev-migration-routing-thresholds.md`：既有文處理 API 相容下的客服分類服務遷移與佇列容量；新文處理 evaluator 的二元失敗偵測、混淆矩陣、不可行門檻與校準。論點與交付不同，保留各自 URL 並加雙向延伸閱讀。舊文只增加連結句，不改日期。
- 納入「AI Agent 工程化與工作流實戰」，初始 main 的最大 order 為 93，新文 94；推送前再次核對。

## 主張與證據

- Hamel Husain、Antaripa Saha，2026-10-20：原始 100 筆租屋客服 trace，排除 2 筆內部 QA 後，98 筆用於效能計算；參考標籤為 61 筆已知失敗、37 筆未標記失敗。不是程式或 Story 驗收實驗。
- 註 9：候選訓練切分要求 precision 與 recall 各至少 80%；無可行點時圖表實驗使用 unconstrained F1 最優點。Perplexity 36/100、Liquid d1-ultra 29/100 切分不可行；驗證預測全部保留，不能推論平均結果保證雙 80%。原文給讀者的操作 prompt 則要求回報不可行、不放寬限制。
- <https://scikit-learn.org/stable/modules/classification_threshold.html>：預測分數與決策門檻不同層；應指定 `pos_label`；調門檻的資料不可與分類器擬合資料混用。
- <https://scikit-learn.org/stable/modules/calibration.html>：校準的對象是正類事件機率，不是 evaluator 整體正確率；校準需要獨立資料；Brier 分數同時反映多種因素，不能孤立歸因為校準改善。
- 本文未重現模型實驗，未呼叫付費分類／評分 API。100 筆混淆矩陣、工作流與 YAML 均明示為作者設計的示意。

## 算式驗證

- 門檻 0.50：TP 12、FN 8、FP 4、TN 76；precision 75%、recall 60%、accuracy 88%，PASS 84 筆，錯放 8 筆。
- 門檻 0.30：TP 18、FN 2、FP 12、TN 68；precision 60%、recall 90%，標記 30 筆，較前者增加 14 筆：多抓 6 筆失敗、多誤擋 8 筆正常。
- 兩組分配符合降低門檻後標記集合包含原集合；只是可成立示意，沒有實測分數或泛化保證。

## Cover Direction

- 最近發布的 `github-public-https-ci-auth`：紙雕通道與閘門、斜俯視、深綠／奶油白／金色、柔和側光。
- 最近同系列的 `agent-skill-adherence-effect-evals`：仿舊工業量具、正面近景、深藍／橘紅／黃銅、戲劇側光。
- 本篇：透明分類盤與可移動隔板、實物靜物攝影、正上方俯視、淡紫／陶橘／暖灰、均勻日光。相較兩篇分別改變媒材或質感、構圖、主色與光線。
- Built-in imagegen 生成；來源檔：`generated_images/exec-ee7fe35d-e42a-4173-b19a-42a5a3df47aa.png`，1672 × 941。轉 WebP 放入文章 assets，檢視原圖與 320 × 180 卡片，無文字／商標／浮水印。
- Prompt：transparent laboratory sorting tray viewed directly overhead; matte lavender and rusty-orange ceramic discs imperfectly mixed on both sides of a movable brass divider; one hand adjusts divider; restrained museum editorial still-life photography; frosted acrylic, matte ceramic, brass; wide 16:9, pale warm-gray negative space, diffuse daylight; no text, numbers, logos, computers, robots, charts or arrows.

## 驗證備註

- 此 fresh checkout 沒有 Trail CLI，也沒有 `.trail/cache/INDEX.md`；依 repository 指定的 cache 路徑確認不可用後，窄範圍讀取內容規範、相關文章與 schema，未安裝額外索引工具。
- 環境內建 pnpm 11.25 不符合 repo 要求；另安裝 pnpm 12.1.0 於 `/tmp/carlstack-pnpm12`，不改 package.json、lockfile 或 engine gate。

- Astro telemetry 預設設定目錄不可寫，透過 `XDG_CONFIG_HOME`／`XDG_CACHE_HOME` 指向 `/tmp` 的工作目錄恢復正常 check；未變更來源或放寬驗收。
- Shell Chromium 的 socket 受限；一次升權啟動在 runtime 建立唯讀 sessions 掛載時失敗。Cloud Browser 對本機 loopback 預覽亦為 connection refused，故本機整頁視覺驗證不可得；改以 build 產物檢查與發布後正式頁面檢視，封面本身已完成原尺寸與卡片尺寸視覺檢查。
