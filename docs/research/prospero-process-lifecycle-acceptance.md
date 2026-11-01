# Prospero 程序生命週期驗收：來源與取捨

查核日期：2026-11-01（Asia/Taipei）。

## 選題與去重

- 主來源：Chris Wellons，2026-10-31，https://nullprogram.com/blog/2026/10/31/ 。原文已完整讀取。
- 專案穩定識別：skeeto/prospero。查核時公開 HEAD 為 `245ad548ff123318939f9b22c83d0474b931b565`。
- 以原始／正規化 URL、Prospero、作者與程序樹相關語詞查核 `src/content/blog`、`docs/research`、`docs/article-queue.md`，未見同一來源稿件。
- 與 `copilot-agent-runtime-rust-in-process` 的差異：既有文談 runtime 移植與程序內嵌成本，本篇談 shell 工具逾時後的存活、取消清理與遠端 host 退出。
- 與 `openai-dots-ongoing-work-control` 的差異：既有文談持續責任、委派任務與排程，本篇以 OS 程序與工具工作識別驗收。兩者已由新文連回。
- 納入「AI Agent 工程化與工作流實戰」第 108 篇，接續第 107 篇 Northflank。

## 段落證據

### 引言、逾時與清理

來源：https://nullprogram.com/blog/2026/10/31/

原文的 Never wait forever、No stray processes 段落描述 shell 同步逾時轉背景、定期取得控制、Plan mode 等待例外，以及整棵程序樹共同結束的設計主張。文章使用「作者主張／原文描述」，未聲稱已完成跨平台實測。資源少兩個數量級為作者自述，未當成本站效能結論。

### 操作範圍與退出

來源：https://github.com/skeeto/prospero/blob/245ad548ff123318939f9b22c83d0474b931b565/docs/usage.md

查核 GUI 關閉時的停止／保留背景選項、單命令 Stop 後 Agent 繼續，以及 headless 模式行為。讀取完整文件，正文只引用需要的行為，不將命令取消說成整個 session 結束。

來源：https://github.com/skeeto/prospero/blob/245ad548ff123318939f9b22c83d0474b931b565/docs/remote.md

讀取完整文件。遠端 attach 啟動的 host 可比 SSH 連線存活更久，GUI 可轉成背景 host。正文據此提出重新連線與明確退出分開驗收，未聲稱斷線即取消。

來源：https://github.com/skeeto/prospero/blob/245ad548ff123318939f9b22c83d0474b931b565/README.md

讀取完整文件。確認 C++、原生 GUI、單執行檔、headless 與本地／遠端模型供應者定位。未把 Community Edition 寫成內建全部遠端 engine 的 Professional Edition。

### 權限與設定

來源：https://nullprogram.com/blog/2026/10/31/

原文 The usual features 段落明說權限系統不能阻止惡意 Agent，應限制 harness 執行環境；Configuration 段落說 URL include 仍可把環境變數當作 API key 傳往設定端點。正文保留此限制，沒有宣稱產品沙盒可完整隔離。

## 自行提出的驗收與未驗範圍

Laravel／TypeScript 專案是虛構教學場景。啟動識別、心跳、父子程序、5 秒清理目標、隔離帳號與斷線後待確認狀態，均為工程建議而非來源宣稱的驗收結果。沒有執行 Prospero、呼叫模型、做 benchmark 或跨平台程序清理實驗。文章無可執行程式碼，沒有假稱測試通過。

不新增 SVG：生命週期差異以具體案例與驗收清單表達，無須另加流程圖。原創封面與正式站驗收由同批發布流程完成，圖片 alt 應依成品核對後更新。

## 發布前圖片與範圍

使用正式圖片工具生成原創封面，輸出 1600 × 900 WebP；已目視全尺寸、480 × 270 縮圖、16:10 及方形裁切，焦點仍可辨識，無文字或商標。封面 alt 依實際畫面填寫。三篇封面分別採紙雕帳目、戶外陶管模型、粉藍網版工作燈，主題物件、媒材與色彩有區別。沒有新增流程或架構圖。

雲端本機 dev 在 ready 前退出，Chrome localhost 回報連線拒絕，桌面／手機本機實頁視覺驗收未完成。依發布授權如實記錄，未調整環境保護、未跳過來源或技術檢查。正式站上線狀態另於部署後驗證。
