# Mistral Large 4 服務用途與授權查核

查核日期：2026-10-30。文章：`src/content/blog/mistral-large4-service-license-boundary.md`。

## 去重與取捨

- 基準 main：`f0452c6f918e4d51ce1eabfc5ba64bd1de283156`。
- 在完整本地 checkout 的 `src/content/blog`、`docs/research`、`docs/article-queue.md` 搜尋原始與正規化 URL、`mistral-large-4`、`Mistral Large 4`、`Mistral Ecosystem`、`Model-as-a-Service`、`MaaS`，沒有既有同來源稿件。
- 作者／主題詞 `Mistral` 命中 Mixtral 舊架構來源；`moe-router-memory-tradeoffs.md` 已涵蓋活躍參數與記憶體的差別，因此新稿只內鏈，不重寫架構教學。
- `lfm3-local-model-task-boundary.md` 聚焦本地小模型任務、拒答與外送界線。新稿聚焦經營主體、內部／對外服務分類與改版重審，讀者收穫不同。
- `github-license-policy-agent-dependencies.md` 聚焦程式依賴授權例外批准，並未涵蓋模型 MaaS 條款。
- 系列包含 draft 的實檔檢查：AI Agent 工程化與工作流實戰最高 104。本稿暫用 105，發布整合者仍需在最後 main 查重。
- `.trail/cache/INDEX.md` 與 trail 指令均不可用，採完整實檔搜尋回退。

## 來源與段落對應

1. [Mistral，Introducing Mistral Large 4](https://mistral.ai/news/mistral-large-4/)，2026-10-06。原文明示 public preview、當月稍後公開權重。支援開頭事件日期，沒有把 10 月 29 日寫成模型首次出現。
2. [Hugging Face，Welcome Le Chonk](https://huggingface.co/blog/mistral-large4)，2026-10-29，作者包含 merve、Alvaro Bartolome 等。支援權重發布時間與兩種官方 checkpoint。與新 Mistral 公告的 benchmark 數字不同，本稿不拼接數字、不寫排名。
3. [Mistral，Large 4 open weights](https://mistral.ai/news/mistral-large-4-oss/)，本次權重公告。支援新版可下載、自管、modified MIT／MaaS 條件及發布時 API 報價（每百萬 token：輸入 USD 0.70、cached input USD 0.07、輸出 USD 2.10）。報價標明時間，沒有當作完整部署成本。公告效能為供應商聲明，稿件未用其 benchmark 當親測。
4. [模型卡](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B)。支援約 1T 總參數、49B active／含 embedding 與 output 52B，以及推論選項。稿件沒有把活躍參數當 GPU 容量，也沒有提供未驗證啟動指令。
5. [LICENSE 原文](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE)。web 工具讀取 blob/raw 回 internal error，不是存取拒絕；以正常 urllib 讀同一公開原始檔 `https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/raw/main/LICENSE` HTTP 成功，完整原文已讀。取得內容 SHA-256：`d242ebedb53ffd7e26c220e3305665ca47e4e5267fa62ff4cdeb3953b8353c78`。
   - 第 1 條保留著作權與許可聲明。
   - 第 2 條包含 Licensee 或 affiliates 經營 MaaS，要求任何商用前另約；沒有窄化成只有這個 API 收費時才需要。
   - MaaS 定義：第三方推論／後訓練存取，對 inputs、parameters 或 training data 有 meaningful control；有 embedded features/harnesses 與 mere relay 排除。
   - 第 3 條 internal use 與官方 Mistral products 豁免。稿件保留其範圍，沒有以「加一層 UI」推定自動豁免。
   - 這是原文轉述與工程審查建議，不判定使用者或虛構企業是否符合個別條款，不提供法律保證。

## 原創判斷與未驗證範圍

虛構物流 SaaS 的內部摘要、固定產品按鈕、通用推論 API 是教學情境，不是站主專案。用途紀錄欄位、授權重審觸發、採購先後、合法資料測試集、每個被接受摘要的總成本與雙路驗收均為工程建議。

沒有下載權重、執行推論、壓測、測量硬體或重跑官方 benchmark。沒有承諾哪個方案比較便宜。用途審查與技術驗收分開，不把測試成功當作授權允許。

## 交接驗收

正文與來源已完成內容查核；繁中機械檢查 `check_zh.py` 無命中。新稿暫為 draft，publishDate 由發布整合者在實際完成時填入，封面／coverAlt 亦由整合者加入。尚未對此稿執行完整 format、content policy、check、test、build、視覺及正式頁驗收，不稱已發布。

## 原創封面

近鄰LFM3為藍色陶瓷分揀器桌面攝影感；本篇為俯視庭院與外部服務亭、gouache筆觸、深鈷藍/赭金/象牙色、晚間環境光。與本批AWS炭黑綠印刷顆粒近景亦不同。原創image_gen prompt：internal circular courtyard with ivory geometric model, separate public ochre pavilion, blank permit document, overhead gouache, cobalt/ochre/ivory, no text/logo。原圖exec-07ad8b9d-4486-45fe-80e3-fc32ba759b00.png，WebP1672×941；全尺寸與480×270卡片均已目視主體完整。

補充目視：依 ArticleCard.astro 的16:9與16:10兩種比例檢查480px縮圖，主體可辨。production靜態預覽亦因雲端Chrome無法連線本機localhost而Connection refused，未完成本機實頁桌面/窄版/深淺色目視；不繞限制，正式頁另採正常Chrome檢查。
