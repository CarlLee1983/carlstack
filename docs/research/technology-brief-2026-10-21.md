# 2026-10-21 科技快報文章查核

窗口：2026-10-20T02:00:00Z 至 2026-10-21T02:00:00Z。今日 evaluator 與每日系統設計是獨立任務，不列入三篇快報文章。

## 去重與範圍

以主來源原始及正規化 URL、穩定 ID、作者與標題詞搜尋 blog、research、article-queue。無 tsrs/typescript-rust-port/oxc-project/tsrs、Mozilla 2083449/eMudhra/CVE-2026-111943、TorchTPU/torch_tpu/SGLang-TorchTPU 重複文章。追蹤參數不影響來源身分，本次主來源無需移除參數。2083449 的識別 query 保留。

- tsrs：有 Copilot Rust runtime 舊文，但讀者問題不同；本篇處理 checker 診斷契約與影子採用，不重寫程序內嵌入效能。雙向內鏈。現有系列無編譯器採用主軸，獨立文章，不為一篇建立新系列。
- eMudhra：接續 TLS 驗證除錯，網路/API 系列 19；新增逐 runtime 修復證據與雙向內鏈，不重寫握手教程。
- TorchTPU：AI Agent 工程化系列 95，將 KV 容量帳本延伸到編譯 shape 與 KV 位置；雙向內鏈，不同於容量估算或 LMCache 安全事件。

## 來源與主張

### tsrs

- Cloudflare 2026-10-20 公告：https://blog.cloudflare.com/typescript-rust-port 。完整效能、使用、Rust/Wasm 與維護段落查核。最高 8x／約少 70% 記憶體比較 TypeScript 7.0、相同 type-check workers；7.1 beta 最高 2.5x 為另一上限，不相除。experimental，不是穩定完全相容。
- https://github.com/oxc-project/tsrs ：README；https://github.com/oxc-project/tsrs/blob/main/docs/COMPATIBILITY.md ；https://github.com/oxc-project/tsrs/blob/main/bench/README.md 。讀取時 main c4b7341b4ffad3a905982d75c12f8b76207e377f。核 noEmit、incremental false、pretty false、checker配置、median、RSS、診斷版本差異。相容文件對照 TypeScript b85298b6a81f/7.1-dev；100% 是目標，仍有 CLI/LSP gaps。未把正在變動的 README benchmark 當公告原始圖。
- 本文影子 CI 流程、fixture 與停止規則是作者建議；未安裝 tsrs 或宣稱實測。120秒算式為明示假設。

### eMudhra

- Mozilla 原始事件：https://bugzilla.mozilla.org/show_bug.cgi?id=2083449 。查核通報、獨立還原、撤銷、原因與交叉簽署討論。八張分六 TLS、二 code signing；10/17 通報，10/18 CA撤銷，不稱10/20首次發現。
- 研究者／事件整合頁：https://emudhra.we-have-a-problem.com/ ，2026-10-20。列瀏覽器撤銷傳遞與非瀏覽器差異、下游更新、測試hosts/離線鏈。不是 CA 官方公告；公開資料未知是否非瀏覽器濫用，不寫成已攻擊或絕無攻擊。
- Go官方：https://groups.google.com/g/golang-announce/c/66pojueaQek ，10/19，1.27.3/1.26.10，crypto/x509 Verify 過濾指定中繼鏈，CVE-2026-111943。重建既有binary是本文工程推論，實際驗證路徑仍要核對。
- https://github.com/certifi/python-certifi/releases/tag/2026.10.19 ；https://curl.se/docs/caextract.html ，核可用版本與10/20 bundle，未說單一更新可解全部runtime。
- curl 範例僅來源測試兩host，明示未替讀者執行、無token、不完整矩陣；DNS/timeout/proxy不能冒充拒絕證據。無私鑰還原或利用教學，無自動刪信任根指令。

### TorchTPU

- Google 2026-10-20：https://cloud.google.com/blog/topics/ai-infrastructure/torchtpu-is-now-open-source-run-native-pytorch-on-tpus ，完整讀取backend、eager/compile、serving、訓練／preview範圍；不套用特定案例吞吐或成本宣傳。
- https://github.com/google-pytorch/torch_tpu ：README 的 ATen、XLA cache、分散式與compile；不是serving API本身。
- https://www.lmsys.org/blog/2026-10-20-sglang-torchtpu/ ：完整機制/功能/可靠性/訓練段落。out-of-tree plugin，token-count prefill buckets、batch-size decode buckets、XLA、TPU Sync consumer-pull KV、resharding。Structured output/function calling experimental。未把 Miles preview 與planned ICI當正式交付；正文不延伸此訓練題。
- 本文bucketing取捨、冷暖測試、成本分母與停止規則為作者工程建議。沒有TPU硬體，未宣稱測試或價格優勢。

## 封面驗收

使用內建 imagegen 各生成一張原創16:9封面，原始PNG保留生成工作區，正式WebP存src/assets/covers。三張皆1672×941，全尺寸與400×225卡片已檢視，無文字/logo，alt依實際像素。

封面矩陣：

- tsrs：雙紙帶比較器與緊湊摺紙；紙雕媒材、近俯視斜構圖、冰藍紫朱紅、漫射日光。
- eMudhra：裂黃銅印章與不同容器檢查扣；粉彩炭筆、低角靜物、酒紅赭色象牙、側光。
- TorchTPU：三種陶瓷拱門及獨立玻璃珠通道；釉陶/玻璃雕塑、低等角非對稱、深藍青綠橘、輪廓光。

相鄰三張至少媒材、構圖、色彩及光線不同；與近文藍托盤、評估分隔器、綠紙帶門、機械壓模等封面有區別。沒有新增架構SVG/Mermaid。

## 執行與驗證

獨立 worktree carlstack-daily-oct21，基底 origin/main 54d191979b13472b11a9094f0464015a71fe4511。Node24.19.0/pnpm12.1.0。offline install 因缺 metadata 無法完成；正常 frozen install 通過 supply-chain policies，551 dependencies從既有store重用，lockfile未改。

正常 Astro dev 預覽嘗試：初次因telemetry config目錄不可用而退出；改用單次 ASTRO_TELEMETRY_DISABLED=1（不改repo設定）後，仍回報 Dev server process exited before becoming ready，localhost connection refused。未宣稱dev preview通過。依使用者例外繼續內容與發布gates，production artifact與正式頁另驗。Local Playwright預設browser binary缺，但/usr/bin/chromium可用，後續可用產物靜態預覽完成像素驗收。

最終內容、gate與部署結果在提交／正式驗證時記錄；未關閉任何內容或CI檢查。

最終本機 gates：6 篇 changed articles 的 content policy 通過；全 repo Prettier 通過；Astro check 219 檔、0 errors/warnings/hints；production build 完成 677 HTML，Pagefind 索引 675 pages/17,839 words；109 項測試全通過。第一次 aggregate check 因子腳本 PATH 指到 pnpm11 而停止，設定本次 shell PATH 為既有 pnpm12.1.0 後完整 check/test 通過，不變更repo工具版本。

補充預覽限制：嘗試以 production artifact、已安裝 Chromium 做desktop/320px截圖，但browser啟動被執行環境Unix socket限制拒絕（Operation not permitted），沒有繞過限制、沒有宣稱手機像素驗收通過。依使用者預覽例外繼續，正式頁使用受支援cloud browser另驗；本篇皆純文字／程式fence，無新增SVG。封面full/card像素驗收已通過。
