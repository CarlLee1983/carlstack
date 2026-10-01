# Claude eval 與 hillclimb 查核紀錄

- 查核日期：2026-10-01
- 主來源：https://claude.dev/blog/automating-eval-design-and-hillclimbing/
- 作者／日期：Lance Martin，2026-09-28
- 去重：先搜尋原始 URL、slug、hillclimb 與 eval design；未找到同來源。與成本控制及 benchmark 效度文章論點不同，正文加入站內連結。
- 正式文章：`src/content/blog/claude-eval-hillclimb-validation-boundaries.md`
- 系列：AI Agent 工程化與工作流實戰，第 50 篇，接續 order 49。

## 證據與限制

主文用於確認命令與發布背景。官方 [hillclimb 指南](https://github.com/anthropics/skills/blob/main/skills/claude-api/shared/evals/eval-hillclimb.md)確認資料切分、可修改範圍、逐輪紀錄與失敗分類。[評估指南](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)確認 grader 校準與能力／回歸測試的區分。

三份切分是官方大型資料集選項，本文另提出正式採用時的建議；不能寫成所有 eval 的預設。小資料集要保留探索性標示。群組切分、客服範例與 YAML 是本文建議，並非工具內建設定。未執行 skill 或重現 benchmark，未使用官方案例數字作通用收益承諾。

獨立審閱發現成本目標與 accuracy 選版規則不一致；已改成在品質底線內選最低成本，delta review 通過。

## 封面方向與生成紀錄

鄰近 Pi 封面：象牙白、復古面板、中央放射導線。本文：隔離山形隱喻、cyanotype 印刷、非對稱雙山、靛藍與銅色、冷色側光。媒材、構圖與主色皆不同。

使用內建 imagegen，儲存於 `src/assets/covers/claude-eval-hillclimb-validation-boundaries.png`，1672 × 941。已檢視完整圖與頁面縮圖，無文字或標誌。

最終 prompt：

> Use case: stylized-concept. Asset: landscape 16:9 editorial blog cover about trustworthy AI evaluation and hillclimbing. A tactile cyanotype blueprint artwork on deep indigo paper: two distinct mountain contour profiles, one visible path marked by tiny copper waypoints ascending, the other behind a translucent frosted rectangular screen representing unseen validation terrain. Sparse asymmetric composition, wide quiet space, crisp etched contours, restrained copper accents, raking cool light. No text, numbers, logos, UI, watermarks. Fine art print rather than a dashboard.
