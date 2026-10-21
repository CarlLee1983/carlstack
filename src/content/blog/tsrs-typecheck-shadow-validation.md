---
title: "tsrs 型別檢查快到值得試，但 CI 先保留 TypeScript 裁判"
description: "Cloudflare 與 VoidZero 推出 TypeScript Rust 移植 tsrs。拆開最高 8 倍的比較條件、7.1 beta 的基線變動與相容缺口，設計不撤掉既有型別閘門的影子驗證。"
publishDate: 2026-10-21T02:12:10+00:00
draft: false
featured: false
tags:
  - TypeScript
  - Rust
  - 技術選型
  - 開源專案
cover: ../../assets/covers/tsrs-typecheck-shadow-validation.webp
coverAlt: "兩條帶有圓形與三角形孔洞的紫色紙帶，經過朱紅色雙鏡比較器，其中一條摺成緊湊風琴狀，呈現移植後仍需逐項比對行為的概念。"
repositoryUrl: https://github.com/oxc-project/tsrs
---

如果大型專案每次型別檢查都要等很久，tsrs 已經值得放進實驗環境；但我會保留原本的 TypeScript 檢查，讓新工具先跑一條不具放行權的影子路徑。速度是採用的理由，診斷是否守住原有契約才決定它何時能接手。

Cloudflare 在 [2026 年 10 月 20 日公告](https://blog.cloudflare.com/typescript-rust-port)，與 VoidZero、Owner.com 的 Max Schwenk 推進 TypeScript 的 Rust 移植 tsrs，並在 Oxc 專案內孵化。公告把 npm 版本稱為 experimental，強調追隨 TypeScript 的語言設計，而非另立語言分支。對工程團隊來說，它現在可以拿來測，還不到把 `tsc` 全面換掉的時候。

## 最高 8 倍先記在基線旁邊

官方公告的早期數字是：相同 type-check worker 數量下，相較 TypeScript 7.0，tsrs 最高快 8 倍、記憶體約少 70%；同一篇也指出 TypeScript 7.1 beta 本身最高快 2.5 倍。[公告的效能與記憶體段落](https://blog.cloudflare.com/typescript-rust-port)

這兩組數字不能拿來相除，再宣布 tsrs 對 7.1 一定快 3.2 倍。各個「最高」未必來自同一專案、同一工作負載，基線版本也正在改善。若團隊仍使用較舊的 TypeScript，實驗應至少留兩條對照：升級官方版本，以及改用 tsrs。否則會把本來只需升級就能拿到的收益，全部記在移植工具上。

我會在評估工單寫下這幾個欄位，不只貼一張倍數圖：

- 工作負載：指定 repository commit、lockfile、生成型別與完整 `tsconfig`。
- 版本：既有正式 TypeScript、待評估官方版本、tsrs 的精確版本；相容性比較另記對應的 upstream commit。
- 資源：CPU 型號、可用核心、記憶體限制，以及兩邊的 checker 數。
- 指標：每次完整型別檢查耗時、peak RSS、退出碼與診斷差異。

這些是我建議的實驗欄位，我沒有在 CarlStack 專案上量出 tsrs 的加速數字。

## 這張成績單量的是完整型別檢查

專案的 [benchmark 方法](https://github.com/oxc-project/tsrs/blob/main/bench/README.md)把主要計時指令設為 `-p <project> --noEmit --incremental false --pretty false`。它關掉輸出與增量重用，記錄 wall time、peak RSS，重複執行後取中位數。相同 checker 數的模式也和各自預設模式分開呈現。預設配置可能使用不同執行緒數，兩種圖要分開解讀。

因此，這個主要 benchmark 回答不了「每天編輯一行，IDE 要等多久」或「整個 production build 會快多少」。型別檢查之外還有打包、轉譯、測試、資產處理。若那些才佔大部分時間，替換 checker 的端到端收益會縮小。

例如某條 CI 跑 120 秒，其中型別檢查 30 秒。即使假設這一段真的縮成四分之一，總時間也只是 `90 + 30 / 4 = 97.5` 秒，約少 18.75%。這是我用來估算投資上限的假設例子，數字不是 tsrs 的實測結果。團隊可以先把自己的時間拆出來，決定是否值得承擔新的工具維護成本。

對本機開發，則另測初次檢查、保留快取的重跑、修改公開型別後的重查，以及 IDE 操作。完整檢查與互動延遲分開驗收，才能知道收益落在哪個工作流。

## 相容性要綁住版本，也要比較診斷內容

[tsrs README](https://github.com/oxc-project/tsrs)以 100% conformance 為目標，計畫對 TypeScript 7.1 發布穩定版。這還是目標，現在不能說已完全相容。[相容性文件](https://github.com/oxc-project/tsrs/blob/main/docs/COMPATIBILITY.md)把對照基準明確綁在一個 TypeScript 7.1-dev commit，並列出尚未支援或有缺口的能力，例如 `--init`、`--showConfig`、語言伺服器的自動型別取得，以及部分 content mapper 的語言伺服器支援。CLI 能檢查某種檔案，不代表編輯器整合也已具備同等能力。

對採用者，最危險的假陽性是「兩邊都退出成功，所以相容」。如果測試輸入全是合法程式，漏報錯誤的新 checker 也能拿到漂亮結果。我會在影子驗證另外放一小組刻意出錯的 fixture：

1. 跨套件修改一個公開型別，確認 consumer 會被指出。
2. 引入專案常用的泛型約束違反，確認原本被攔下的錯誤仍被攔下。
3. 檢查 `.d.ts`、路徑解析與 framework 生成型別所經過的邊界。
4. 若準備接手 project references 或語言伺服器，另列專用案例，不以 `--noEmit` 的通過代替。

診斷比對至少要存檔案、位置、錯誤碼和訊息。只比錯誤總數，會漏掉「一處少報、另一處多報」。若對照的 TypeScript 版本不同，先用 tsrs 所移植的 upstream 版本重查，把版本差異和移植缺陷分開。文件也揭露了診斷順序與平行執行相關的差異。要做正規化可以，但原始輸出要留著，還沒解釋的差異也不能排序掉就宣告結案。[README 的 conformance 說明](https://github.com/oxc-project/tsrs)

## 先跑影子路徑，PR 放行仍交給原本的 TypeScript

下面是我建議的漸進採用流程，不是專案保證的遷移路徑，我也沒有在你的 repository 跑過：

### 第一階段：固定實驗輸入

從一個乾淨 commit 建立獨立工作目錄，完成 lockfile 安裝及專案原本的型別生成。tsrs 版本要固定，安裝變更留在實驗分支。不要用未固定版本的臨時下載指令改寫正式 CI。對照執行使用相同輸入，完整檢查與增量檢查分組記錄。

### 第二階段：影子路徑保存差異

原本的 TypeScript job 繼續決定 PR 是否放行。影子 job 執行 tsrs，保存輸出與資源數字，並標出它自己的成功、失敗或崩潰。影子失敗可以暫時不擋產品交付，但不能被包裝成成功。負責人必須能從報告找到未解釋差異。

### 第三階段：限定接手範圍

若完整 `--noEmit` 檢查已經有足夠證據，可以只評估接手這一項，宣告檔輸出、watch 與編輯器仍維持原方案。接手條件要在看結果之前寫下，例如團隊自訂「代表性正常與錯誤案例無未解釋差異，並且 CI 省下的時間達到預先設定的門檻」，這類門檻是團隊的風險決策，不是官方相容保證。

**出現漏報型別錯誤、無法解釋的診斷差異或不可重現的崩潰，就停止擴大接手範圍。**保留一條可恢復原工具的配置，並把最小重現案例回報上游。不要為了維持快的數字，把難測的套件移除。

## Wasm 版本能進瀏覽器，sandbox 條件另外看

Cloudflare 將 Rust 的 Wasm 記憶體互動與受限環境列為移植動機之一。這讓瀏覽器內工具鏈值得探索，但沒有替每個 sandbox 的啟動時間、資源限制與隔離政策背書。[官方公告的 Why Rust](https://blog.cloudflare.com/typescript-rust-port)

這和站內的 [Copilot Runtime 移植分析](/blog/copilot-agent-runtime-rust-in-process/)是不同問題。那篇處理 SDK 的 Node 子程序成本，tsrs 的採用核心是同一份程式能否保住型別診斷契約。兩個專案都改用 Rust，收益和驗收還是要分開算。

下一步可以很小：選一個最常等待型別檢查的套件，保存目前正式工具的時間與診斷，再讓固定版本的 tsrs 跑同一份輸入。第一張報告要同時列出省下的時間和所有差異。差異還沒解釋完之前，CI 的裁判權留在原本的 TypeScript。
