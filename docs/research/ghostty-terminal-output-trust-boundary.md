# Ghostty 1.4 終端信任邊界查核

- 查核日：2026-10-28，Asia/Taipei。
- 交付：`src/content/blog/ghostty-terminal-output-trust-boundary.md`。
- 新進展：Ghostty 1.4.0 於 2026-10-27 發布並公開十項 GHSA；文章選三種不同互動條件，沒有把其他七項的影響一概套用。
- 去重：以 Ghostty、三個完整 GHSA ID、發布說明 URL 搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md`，未找到既有同來源或同核心文章。Trail executable 及 cache 不在環境，依實際檔案搜尋。
- 系列：全量 YAML frontmatter（包含引號與 draft）核對 AI Agent 工程化與工作流實戰最高 102；本批協調分配 103。

## 一手全文與段落對應

1. https://ghostty.org/docs/install/release-notes/1-4-0
   - 原文明列 October 27, 2026 發布；Security 區十項公告，作者說 CVE 尚未分配。
   - 用於導言與事件日期。沒有重述效能數字或宣稱親測。
2. https://github.com/ghostty-org/ghostty/security/advisories/GHSA-mhff-mv4q-fp63
   - Mitchell Hashimoto（GitHub `mitchellh`）2026-10-27 公開；Moderate，受影響 `<=1.3.1`、修補 `1.4.0`，No known CVE。
   - Kitty graphics 處理的驗證與資源管理缺陷；需顯示惡意輸出，處理前無提示。
   - Read/unlink 限 Unix-like 特定條件，byte-prefix 暫存目錄判斷與 TOCTOU 需保留條件，不能寫成無條件任意檔案讀刪。
   - 官方沒有實用 workaround，除了避免可傳送這些圖形序列的不可信程式。正文據此不聲稱關閉超連結能解決圖形問題。
3. https://github.com/ghostty-org/ghostty/security/advisories/GHSA-cw69-wm67-5pv8
   - 2026-10-27 公開；Moderate、CVSS 3.1 6.3、`<=1.3.1` → `1.4.0`、No known CVE。
   - macOS；需攻擊者控制輸出並誘使 Cmd-click，還需惡意檔案／危險 URL handler 等條件；渲染本身不開目標。
   - 修補安全開啟政策、目標顯示清理，新增 `link-osc8`。舊版不能只以設定關閉 OSC 8。滑過預覽也不可靠。
4. https://github.com/ghostty-org/ghostty/security/advisories/GHSA-4hwh-wx3w-3fqg
   - 2026-10-27 公開；Moderate、CVSS 3.1 5.0、`<=1.3.1` → `1.4.0`、No known CVE。
   - 需複製貼上，且目標程式未用 bracketed paste；預設互動式 Bash/Zsh/Fish 不受這個特定問題影響，不外推其他入口。
   - 修補 CR/newline 一併檢查，沒有舊版設定 workaround。libghostty-vt 亦受影響，本文範圍以 Ghostty 應用程式為主。

## 工程建議與證據邊界

- 診斷日誌與 Agent 輸出案例均是虛構工作流程，不是本站作者公司或使用者事故。
- 轉義呈現、隔離環境、實際行程版本與資料來源清查是工程建議，沒有冒稱官方提供完整落地方案。
- 容器 stdout 由主機終端解析的說明，針對此明示資料流，不聲稱容器本身有缺陷。
- 未安裝 Ghostty、未跑 exploit／payload、未做滲透測試、未測效能；驗收清單尚未實際執行。
- 三份公告未提供實際攻擊證據；不能從「未提供」推論從未被利用。
- 正式圖片由整合者生成與驗收，最終 coverAlt 需對準實圖。此工作僅編輯文章與此記錄，未寫入其他檔案、未提交或發布。

## 整合美術驗收

正式imagegen原創封面1672×941，轉WebP；三張全尺寸與768×432卡片裁切已目視，無文字商標，圖說依實圖修正。Ghostty玻璃青紅深底，Octopus平面紫金雙路，LFM3淺藍白色陶瓷攝影，媒材/構圖/主色不同。文章沒有流程圖或架構圖，不使用Mermaid，也無需新增SVG元件。

雲端本機預覽於2026-10-28嘗試，Astro回Dev server process exited before becoming ready，browser連線拒絕；未改安全設定或繞限制。全尺寸與卡片封面目視完成，但320px／深淺色實頁目視未完成。三文章無可執行樣本或新增SVG。最後檔案frozen install使用Node24.22.1/pnpm12.1.0；預設pnpm11引擎拒絕後改官方corepack下載指定12.1.0，未更改lockfile。
