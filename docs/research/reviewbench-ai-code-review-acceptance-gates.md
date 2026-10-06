# ReviewBench：來源核對與編輯紀錄

- 核對日期：2026-10-06，Asia/Taipei
- 正式文章：`src/content/blog/reviewbench-ai-code-review-acceptance-gates.md`
- 主來源：[GitHub Blog，2026-10-05](https://github.blog/ai-and-ml/github-copilot/reviewbench-an-open-benchmark-for-ai-code-review/)
- 一手 repository：[review-bench/ReviewBench](https://github.com/review-bench/ReviewBench)
- 本次固定 commit：`ceb0794a3768da6ef4a56e5311dfb4afd29e5dee`（commit committer time 2026-10-05T15:59:22Z）
- 研究方式：公開文件、原始碼及 JSON 靜態閱讀；未安裝 ReviewBench dependencies、未執行樣本、container、classifier 或付費模型。

## 去重與差異化

研究前搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md` 的 ReviewBench、review-bench、主來源標題與 code review／ground truth 詞彙。未找到同一來源或相同驗收成果文章。相關既有文章為 `uncle-bob-agentic-discipline-code-review`、`answerme-vibe-coding-understanding-debt`；已在新文章加入站內連結。前者談開發審查紀律，後者談理解負債；本篇聚焦 2026-10-05 新發布基準的分母、grader 邊界與 reviewer 採用門檻。

系列與整合協調：AI Agent 工程化與工作流實戰，seriesOrder 65；Deepagents 分配 66。未修改舊文反向連結、queue、共用設定；交由整合驗收。

## 可重現的資料列核對

從固定 commit 讀取 `corpus/manifest.json`，僅使用 Python 標準 JSON 解析並計數，不執行資料內容：

```python
import json
from collections import Counter
rows = json.load(open("manifest.json"))
print(len(rows))
print(len({row["repo"] for row in rows}))
print(Counter(row["language"] for row in rows))
```

結果：219 PR、187 repository。language 欄位共 20 種值，其中 19 個具名類別及 1 個 `unknown`（一筆）。TypeScript 68、Python 41、C# 25、Go 19、JavaScript 15、Rust 11、Java 7、Shell 7、PHP 7、Kotlin 4、Jupyter Notebook 3、Swift 2、C++ 2、HCL 2、C/Dart/PowerShell/Ruby/Go Template/unknown 各 1。正文沿用官方 19 languages 概念時補上 unknown，避免宣稱資料全部成功分類。

資料來源：[固定 manifest](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/corpus/manifest.json)

## 事實、官方自報及作者推論

### GitHub 發布說明

已確認 2026-10-05 日期、research preview、103.9M PR 分布研究與對 PR 大小刻意加權。103.9M＝1.039 億，不是 10.39 億。正文不把代表性宣稱當獨立驗證，不重述官方 production A/B 數字，避免讓讀者以為已證明跨團隊收益。

### 指標與 grader

[Methodology 第 7 節](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/docs/METHODOLOGY.md#7-scoring)確認 grounded precision 只看 matched，unmatched 排除；grounded recall 算被覆蓋 golden TP。Augmented precision 納入全部候選；augmented recall 分母含各 reviewer 自己新找到的 TP，不宜單獨拿來排名。

方法第 5.4 節的 96.6% TP/FP 一致度、62.9% exact severity、98.7% within one level 均為官方自報；並非本次重做 audit。本文不將 96.6% 解讀成所有軸、所有 reviewer 或 production 錯誤率。

[Classifier prompt](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/scripts/classifier/prompts.ts)確認 true/relevant/non-trivial、scope 與 TP/FP 分開、pre-existing 可成立、具專案一致性依據的命名建議可能是 low TP。程式 `CLASSIFIER_VERSION = "3.0.0"`，檔頭註解仍寫 2.0.0；正文不引用這個容易誤解的版本號，而固定 commit。

原創計算範例：12 known TP，candidate 12，matched TP6/FP2，unmatched TP1/FP3。Grounded precision 6/8、recall 6/12；augmented precision7/12、recall7/13。假設沒有重複與多對多 matching；critical 覆蓋1/3獨立列出。全為示範，無實測宣稱。

### Runner、judge 與榜單

- [AGENT_CONTRACT](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/AGENT_CONTRACT.md)：per-PR fresh container、固定 snapshot、JSON、空 findings 可成功、錯 head/PR fail
- [try-agent.sh](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/scripts/try-agent.sh)：靜態閱讀確認本地 runner 不評分；腳本有 checkout/clean/docker 等操作，本次沒有執行
- [JUDGING](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/docs/JUDGING.md)：judge 載既有 finding、matching/classification 都需模型，輸出 metrics/detail；本地結果不當正式榜單
- [README](https://github.com/review-bench/ReviewBench/blob/ceb0794a3768da6ef4a56e5311dfb4afd29e5dee/README.md)：25 test、219 full、final 三輪、官方目前 judge 設定 Claude Sonnet 5。引用僅限配置事實，不另對模型狀態作推論

對團隊的乾淨 PR、模組切片、critical 回歸停止規則、答案隔離、shadow review、人類審查分鐘建議，全部是文章作者工程建議，不歸因為 GitHub 已驗證的結果。

## Cover Direction 與驗收

先檢視鄰近 AnswerMe demo、支付到對帳、SQLite restore、feature store 封面：多為寫實桌面、奶油白/綠色、紙張或玻璃工件。新封面矩陣：

- 視覺隱喻：橋樑重大裂縫與燈邊飛蛾，對照漏報與注意力雜訊
- 媒材：手刻版畫墨紋
- 構圖：戶外低角度石橋橫跨畫面，左下工程師提燈
- 主色：午夜深藍、焦橘、象牙白
- 光線：黃昏逆光與小面積提燈

相鄰封面在媒材、構圖、色盤至少三項不同。與同日 SubQuery 的紫底瓷器、Deepagents 的奶油白森林綠紙雕亦不同。

使用內建 imagegen；原始生成檔保留在生成目錄，正式複製至 `src/assets/covers/reviewbench-ai-code-review-acceptance-gates.png`。1536×1024。已檢視全尺寸及 320×180 裁切卡片：石橋、主要裂縫、工程師與燈仍可辨识，無文字、商標、水印；提供資訊性 coverAlt。圖片為原創象徵插畫，不是假裝真實事故照片。本篇不用 SVG／Mermaid。

生成 prompt：

> Use case: stylized-concept. Asset type: original editorial cover for an engineering article about evaluating AI code reviewers, false alarms versus missed critical faults. Wide 3:2 landscape illustration, no lettering. Primary scene: a monumental weathered stone arch bridge over a dark river, viewed from low angle at dusk; an engineer's amber inspection lantern illuminates one deep structural crack underneath the central arch, while tiny pale moths swirl harmlessly around the lamp. The contrast communicates a serious hidden defect versus distracting harmless signals, not a literal UI or diagram. Style/medium: sophisticated hand-carved two-color linocut print with expressive ink grain and rough cream-paper edges. Strong simple silhouette readable at small card size. Palette: midnight navy, warm burnt orange and ivory, no purple, no neon. Asymmetric composition with bridge dominant, lamp small but clear, ample sky. No words, letters, numbers, logos, brands, watermarks, dashboards, robots, clay, porcelain, isometric conveyor belts. Save an original local image artifact suitable for the repository.

## 驗收狀態

- 已讀 AGENTS、content guide、schema、CarlStack copywriting、humanize-writing 與繁中規則
- 完整文章、公開一手来源、固定 commit、原創封面與 alt 已備妥；draft false、featured false
- 未動 git index、未 commit/push；本 worker 不宣稱部署
- 定向 `pnpm exec prettier` 初次遭本機 pnpm 11.19.0 不符 engines >=12.1.0 擋下；改用既有 local prettier 執行檔檢查，不修改 engines 或 policy
- 全站 content policy、check、test、production build、RSS/sitemap/series 及部署交由整合 worker 執行並記錄
