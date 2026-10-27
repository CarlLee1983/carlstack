# 設計模式與物件協作基礎篇：來源與驗收

- 完成日期：2026-10-27 Asia/Taipei；系列「後端工程基礎圖解」第 7 篇，使用者追加的基礎知識整理，不占每日系統設計計數。
- 原始分享：https://www.facebook.com/share/r/1FbEtcBrxR/?mibextid=wwXIfr
- 正規化穩定來源：https://www.facebook.com/reel/2058002915601683
- 作者：Kelvorn。影片畫面標題 `15 Design Patterns Every Engineer Should Know`。
- 使用者原話：「這也要整理，也是基礎知識」。已授權當日寫完相關基礎內容，既有 CarlStack 完成來源與技術驗收直接發布授權適用。
- 來源核實：同工作父代理的 inspect_kelvorn 讀取公開頁面與展開說明，截圖與文字的 3×5 名單一致。未登入、未繞過限制；未確認原始發布日期或逐字音軌，因此本文不引用日期、觀看數、熱門程度或口播。
- 已核實 15 項：Singleton、Factory Method、Builder、Adapter、Decorator、Facade、Proxy、Composite、Observer、Strategy、Command、Iterator、State、Template Method、Chain of Responsibility。
- 去重：原始 share code、canonical ID、Kelvorn、Factory Method 查 src/content/blog、docs/research、docs/article-queue.md 無既有發布文章。ByteByteGo catalog 的候選不是發布稿。本篇只涵蓋物件建立、介面組合與責任協作，不重寫 Saga、queue、circuit breaker 等分散式模式文章。
- Repo 的 trail CLI 不存在，.trail/cache/INDEX.md 亦不存在；依具名路徑讀取 AGENTS、content-guide、diagram-guide、schema、deploy workflow 及 writing skills。未變更工具或規則檔。

## 原文與主張對應

2026-10-27 開啟下列原文頁，非只使用搜尋摘要。GoF 原作的公開 HTML 由 MIT CSAIL 個人頁保存，文章連結明稱「原書／原始意圖」，不誤稱 MIT 官方教學。主書資訊另由出版商核實：
https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610

- 三分類、模式只在需要其彈性時使用，Singleton/Builder/Proxy/Strategy/Command 簡短原始意圖：https://people.csail.mit.edu/addy/pattern/chap1.htm
- Factory Method 子類別延後決定具體建立物件：https://people.csail.mit.edu/addy/pattern/pat3c.htm
- Adapter 轉換呼叫端期待介面，直接讀原作者出版商公開節錄：https://www.informit.com/articles/article.aspx?p=1398600
- Decorator 相同介面包裝加責任：https://people.csail.mit.edu/addy/pattern/pat4d.htm
- Facade 簡化子系統入口：https://people.csail.mit.edu/addy/pattern/pat4e.htm
- Composite 樹狀組合與共同操作：https://people.csail.mit.edu/addy/pattern/pat4c.htm
- Observer 一對多依賴與註冊關係：https://people.csail.mit.edu/addy/pattern/pat5g.htm
- Iterator 封裝走訪：https://people.csail.mit.edu/addy/pattern/pat5d.htm
- State 狀態導致行為差異：https://people.csail.mit.edu/addy/pattern/pat5h.htm
- Template Method 固定骨架、子類別覆寫步驟：https://people.csail.mit.edu/addy/pattern/pat5j.htm
- Chain of Responsibility 接收者鏈與無人處理可能性，直接讀原作者出版商節錄：https://www.informit.com/articles/article.aspx?p=1398601
- 排序介面類比：https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html 。只援引比較規則與排序操作分工，不宣稱 Java API 是本文 TypeScript 實作。
- Node listener 同步依註冊順序呼叫：https://nodejs.org/docs/latest-v22.x/api/events.html#asynchronous-vs-synchronous 。用具體 EventEmitter 行為說明 Observer 並非自動非同步；不把此行為當所有 Observer 必然規格。
- TS 語言 decorators 與 GoF 模式層次不同：https://www.typescriptlang.org/docs/handbook/decorators.html 。該頁有 legacy/stage 2 註記，本文只引用宣告修飾機制，不給編譯設定或混淆新版/舊版差異。

部分 GoF frame URLs 開啟零正文；改讀可取得的同章 HTML。Builder/Singleton/Proxy/Strategy/Command 個別 HTML 工具無法取得，使用已讀完整導論的意圖段，不假稱讀到個別完整章。無直接摘抄、圖表複製或原書程式碼。所有收藏站例子、成本、選擇、練習與測試是原創教學推導；未將外部原文摘要冒充完整書籍內容。

## 程式驗證

- 正文唯一 `ts` fence 完整抽出成 `/tmp/design-patterns-foundations-example.ts`，執行 `node /tmp/design-patterns-foundations-example.ts`，Node v24.22.1，exit 0。
- 4 個原文內建 `node:assert/strict` 斷言全部通過；未額外插入測試後假稱原文自帶。涵蓋 newest [3,2,1]、shortest [2,3,1]（含 tie-break）、原陣列順序不變、空陣列。
- 使用 Node 原生 TypeScript stripping 執行，未聲稱獨立 tsc 檢查、資料庫整合、供應商連線、壓測或效能提升。
- 另一個 text fence 為明示介面示意，非未測可執行片段。秒數意義是教學假設，明示不可把影片長度當閱讀時間。
- humanize checker 最終 15 個命中皆為模式列表標籤冒號（checker 遮蔽 code label 後辨識為提示性冒號），已人工判讀為規範允許的鍵值標籤，非提示性鋪陳；使用 code label，使多項定義不濫用粗體。

## 圖與美術

- 原創 `src/components/ObjectCollaborationDiagram.astro`：960×600 viewBox 原生 SVG，三獨立全幅 row card；手機 HTML 直向卡片，48rem 互斥切換。前綴 title/desc/marker、dg token、無硬編中性色、無 Mermaid。
- 以本工作已有 sharp 靜態 SVG rasterizer 替入 tokens，輸出 `/tmp/ObjectCollaborationDiagram-light.png`、`-dark.png`，已目視桌面淺／深色文本、留白與箭頭。這不是完整 Astro 網頁目視；320px 實頁與跨元件布局由整合者做可用檢查。
- 封面矩陣先檢視六篇小樣。第 6 篇為陶橘黏土印刷機、側面構圖、暖灰背景；本篇為刻版印刷感、木製模組接合、斜向散置、深紫奶油與淡紫色，媒材/構圖/色盤均不同。
- 正式 built-in imagegen 單次生成；原檔 `/workspace/scratch/d935b46a4408/generated_images/exec-5a8da901-650b-4179-a32d-a7304755f80d.png` 保留。轉 WebP quality 88 到 `src/assets/covers/design-patterns-object-collaboration-foundations.webp`，1536×1024，154892 bytes。
- 全尺寸、1.91:1、16:9、16:10 置中裁切已目視：替換插片、轉接兩種形體與一對多吊飾清楚，無文字/logo。coverAlt 根據實際成品，不把概念雕塑當真實物件機制。
- Prompt：original editorial screen-print/linocut slightly grainy illustration, off-white modular wooden socket accepting interchangeable striped insert, stepped connector joining different-shaped blocks, branching mobile with three pieces, deep aubergine cream dusty lavender muted ochre palette, airy diagonal central crop-safe composition, landscape 1536×1024, no text/numbers/logos/UI/watermark.
- 完整 repo format/policy/check/test/build、production artifact、部署與正式 URL 驗證均交同批唯一整合者，不在作者紀錄冒稱通過。
