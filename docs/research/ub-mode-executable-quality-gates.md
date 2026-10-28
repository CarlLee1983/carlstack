# ub-mode 來源與發布查核

## 範圍與去重

2026-10-28 臺北時間，使用者指定 https://github.com/unclebob/ub-mode 整理撰文。這是指定文章，不占每日系統設計／科技快報篇數。最新 main fa954b97dc60652b2b3eec2e1b0abee258c7cb47；部署40438397034成功。完整 blog/research/queue 依原URL、ub-mode、unclebob、crapper、dryer、mutator搜尋，無既有同來源文章。open PR為零，remote branches無本題進行中工作。未變動他人分支。Trail executable/cache在本工作區不存在，因此直接檔案查核。

既文 poteto-agent-trust-investment 處理防線投資，agent-skill-adherence-effect-evals 處理技能評估，pstack-first-verifiable-workflow 處理首次操作；本篇聚焦 ub-mode 規則與 companion CLI 的可執行門檻差異，讀者動作不同。本文內鏈後兩篇，不重寫其核心。

完整解析全部文章 YAML（含 draft），AI Agent 工程化與工作流實戰最大序號101，因此新文102；發布前重新核對main避免並行碰撞。

## 來源版本與段落對應

全部讀官方全文與必要實作，不以搜尋摘要代替原文。研究員獨立核實，未安裝、執行任何上游程式。

- ub-mode 57a8bdd28e45ed41900ace0bafa2ff76dd9ed70f：README、SKILL全文及tree。只有兩份Markdown，無LICENSE。定位、三段工作節奏、TDD與架構原則、安裝方法及push/cleanup限制。來源 https://github.com/unclebob/ub-mode/tree/57a8bdd28e45ed41900ace0bafa2ff76dd9ed70f 。不複製全文，不將公開可讀寫成整套具開源授權。
- crapper 6fd92c4c9bcc56efb64a2f8743d5a2993bcfd42d：README、src/crapper/crap.py、cli.py、discover.py。公式與0–1 coverage、預設threshold None、判定max > threshold、語言集合。https://github.com/unclebob/crapper/blob/6fd92c4c9bcc56efb64a2f8743d5a2993bcfd42d/src/crapper/cli.py 。100% coverage / CC10算式是教學假設，非上游執行結果。
- dryer 66ff6d21a42c04afcad89c78a80066176d1294b0：README、src/dryer/cli.py、discover.py。Jaccard structural fingerprint、預設0.82及正常報告exit0、JS副檔名未列。https://github.com/unclebob/dryer/blob/66ff6d21a42c04afcad89c78a80066176d1294b0/src/dryer/cli.py 。它是候選工具，文章不把exit0稱成工具故障；要當CI gate須顯式門檻與審查／報告解析。
- mutator a5a0cb803b66e0cdb8bf471b3b08af701d424a41：README、engine.py、runner.py、workers.py。未覆蓋不進mutation分數分母，timeout／編譯失敗可能算killed。baseline實際專案執行、自訂字串shell=True、繼承環境、symlink隔離限制。https://github.com/unclebob/mutator/blob/a5a0cb803b66e0cdb8bf471b3b08af701d424a41/src/mutator/runner.py 。不聲稱實際惡意行為或已完成安全稽核。
- uml-viewer f65dafe93b3cb1b4e6bb02dbe41503ed05bd9ebf：README，只提呈現品質與元件資料，不提供安裝、agent高權限啟動指令或推論其可取代CI。

運費999／1000／1001、需求驗收／已知錯誤樣本、只管本次變更、保留例外與現有PHP工具鏈，均為原創工程採用建議。沒有品質提升百分比、本人親測或私有專案資料。文章集中明列未執行上游工具／模型實驗；來源靜態查核與本網站發布檢查分開。

## 美術

已目視鄰近 terra-routing-accepted-task-cost（攝影、藍托盤與黃印章、斜俯視）及 agent-skill-adherence-effect-evals（深藍橘、機械量具、正視）。新封面矩陣：說明冊與獨立檢查框／紙雕版畫／水平並置／橄欖綠與淡桃色／柔和偏移陰影。至少媒材、配色、物件關係有差異。

正式 imagegen 單次原創，1672×941，轉本地 WebP；原圖全尺寸及384×216卡片裁切均目視，無文字商標。代表規則與執行檢查分離的概念，不是工具截圖。全文以段落說明，無流程或架構圖，因此未引入SVG元件或Mermaid。

## 技術與視覺驗收

使用獨立雲端workspace，Node24.22.1、pnpm12.1.0。初次npx因預設npm cache路徑不存在而失敗，改合法/tmp cache後frozen install成功，未改依賴或鎖檔。

獨立來源覆核無阻擋問題，採納 mutation 定義引用 README/workers、相似度半開區間與明確 ub-mode 授權主詞。中文潤稿檢查無機械命中；數學 CC10 / coverage1 得 CRAP10 已以本地算式核算，不是上游工具實測。

本機預覽首次因 Astro 預設設定路徑不存在退出；改用合法暫存設定目錄後仍回報 dev server 在 ready 前退出。雲端瀏覽器連線拒絕，未繞限制。本機深淺色與320px實頁目視未完成；正式頁、封面與索引另在部署後核對。最後檔案format、content policy、check／production build、test與精確main部署結果，以工具日誌及發布交付紀錄為證，不把預覽限制寫成視覺通過。

最終內容候選已通過 check（Astro診斷與production build）、117項單元，Pagefind706頁。之後僅精確化兩個CLI來源行號與本紀錄，最後仍重新format／stage／policy／check／test，完整結果留在發布交付紀錄。
