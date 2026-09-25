---
title: "讓 Agent 寫遊戲，先把回饋迴路做短"
description: "從 Three.js + TypeScript 的瀏覽器堆疊出發，建立遊戲 Agent 的型別檢查、玩法測試與瀏覽器驗收流程，再用同一個原型比較候選框架。"
publishDate: 2026-09-26T01:11:59+08:00
draft: false
featured: false
tags:
  - AI 工程化
  - AI Agent Workflow
  - 軟體品質
  - 遊戲開發
cover: ../../assets/covers/agent-game-development-feedback-loop.png
coverAlt: "抽象程式模組進入瀏覽器視窗中的低多邊形遊戲場景，再沿著發光環路回到勾選標誌，呈現開發與驗收的回饋循環。"
series: AI Agent 工程化與工作流實戰
seriesOrder: 26
---

周尔复在 [X 上提出一個遊戲開發假說](https://x.com/cholf5/status/2103288041242816559)：Three.js、MonoGame 與 LÖVE 都偏向程式碼優先的開發方式，而 Three.js 還能接上 Web、TypeScript、React、npm 與瀏覽器自動化，因此適合 Agent 參與。他引用了 [Three.js 官方帳號分享的 Voxel Musou 示範](https://x.com/threejs/status/2103137148925104412)。

這個方向值得試，但示範只能證明瀏覽器能呈現 Three.js 遊戲畫面，無法證明它由 Agent 或 TypeScript 製作，也沒有比較不同框架的開發時間。對工程團隊更有用的問題是：**Agent 改完一段程式後，多久能確認玩家看見的行為真的正確？**

## 三種工具不在同一個抽象層

Three.js 官方把自己定位為讓網頁 3D 更容易使用的 library，文件從 renderer、scene、camera 與 canvas 帶出最小畫面。[Three.js Fundamentals](https://threejs.org/manual/pages/fundamentals.html) 因此它天然貼近瀏覽器的模組、頁面與 WebGL 執行環境。

MonoGame 官方稱自己為 .NET framework，沒有內建製作遊戲的圖形介面，並把 code-first、跨平台與整合 .NET 工具列為特點。[MonoGame 入門文件](https://docs.monogame.net/articles/tutorials/building_2d_games/02_getting_started/) LÖVE 則是以 Lua 開發 2D 遊戲的 framework，目標平台包含桌面與行動系統。[LÖVE 官方 repository](https://github.com/love2d/love)

所以，三者都能讓開發者直接面對程式碼，並不表示它們提供相同的渲染能力、編輯工具或發布路徑。我的推論是：選型要先看遊戲要跑在哪裡、團隊熟悉哪種語言，以及哪一種執行結果最容易被重複驗證。只看 Agent 能不能產生程式碼，會漏掉後半段工作。

## Agent 友善度來自可以讀回的結果

瀏覽器技術棧的一個實際優勢，是改動可以很快回到正在執行的頁面。但「能打開頁面」還不是驗收。遊戲的驗收至少要能回答三件事：

- 程式結構有沒有壞掉：TypeScript 的型別檢查可捕捉部分資料形狀與呼叫方式錯誤；它無法證明碰撞、相機或遊戲規則正確。[TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- 玩法結果有沒有照規則改變：把移動、傷害、得分等規則留在可直接測試的模組，使用固定的亂數種子與遊戲時間，讓同一輸入能重現同一結果。
- 瀏覽器裡的互動有沒有接通：Playwright Test 能啟動瀏覽器、操作頁面、執行 assertions，並保存 screenshot 或 trace 作為失敗證據。[Playwright Introduction](https://playwright.dev/docs/intro)、[Screenshots](https://playwright.dev/docs/screenshots)

這些工具提供的是檢查手段，團隊仍要定義預期結果。Playwright 能送出按鍵並擷取畫面，但若沒有 assertion 或穩定的視覺基準，截圖只是一份可供人工檢查的產物，不能自動判定關卡是否好玩、光線是否合理或碰撞是否公平。

## 先驗收一個玩家看得見的互動

不要讓 Agent 一次生成完整遊戲。先拿一個小玩法建立完整的交付路徑，例如讓角色移動一格：

1. 固定地圖、亂數種子與初始位置，避免每次測試都遇到不同狀態。
2. 用單元測試確認輸入方向會改變正確的座標，碰到牆時位置不變。
3. 用瀏覽器測試載入場景、送出鍵盤輸入，再檢查畫面中的座標或可讀取的遊戲狀態確實更新。
4. 保留瀏覽器截圖與 trace；由人檢查鏡頭、遮擋、碰撞回饋與畫面是否容易理解。

這裡把程式測試與視覺判斷分開，是因為兩者回答不同問題。型別檢查和單元測試適合快速排除結構與規則錯誤；瀏覽器自動化確認輸入到畫面的路徑接通；畫面品質和手感仍需實際檢視。若要做 screenshot comparison，先固定時間、種子、視窗尺寸、字型與素材版本，否則畫面差異可能只是渲染環境不同。

任務也要寫清楚完成證據：要改哪些模組、用哪個命令建置、操作後要看到什麼狀態，以及失敗時要交回什麼紀錄。這和[把 Agent 工作變成可驗收結果](/blog/agent-work-requires-verifiable-codebase/)及[用 Harness 控制 Agent 的執行邊界](/blog/harness-engineering-for-reliable-agents/)是同一個原則，只是驗收物從 API 回應多了畫面和輸入。

## 用相同原型做自己的選型實驗

Three.js + TypeScript 很適合先試瀏覽器 3D 原型：同一份程式能進入瀏覽器，開發者也能沿用 Web 的模組和測試工具。React 可以負責遊戲外的選單或設定介面；它的存在本身不會讓 3D 場景更容易驗收。npm 套件數量也不是品質指標，仍要檢查相依套件、更新狀態與瀏覽器相容性。

如果目標是 Lua 2D 遊戲，LÖVE 的 API 和執行環境可能更貼近需求；如果團隊已有 .NET 工作流，MonoGame 讓遊戲程式接入一般 C# 工具與專案結構。[MonoGame 官方文件](https://docs.monogame.net/articles/tutorials/building_2d_games/02_getting_started/)並未宣稱它適合或不適合 Agent，選擇仍要由實際交付路徑驗證。

要比較候選技術，讓每一個都完成同一個小原型：場景載入、一種玩家輸入、一條碰撞規則和一個成功條件。記錄首次可執行畫面的時間、首次可靠驗收互動的時間、Agent 交付後的人工修正量，以及連續重跑時測試是否穩定。這是一個團隊內的選型實驗，不是已發表的框架效能排名。

今天就挑一個最小的玩家行為，寫下輸入、預期狀態變化與可讀回的驗收證據，再讓 Agent 只完成這段路徑。若能從程式改動一路追到可重現的玩家行為，這個技術棧才真正縮短了遊戲開發的回饋迴路。

### 參考資料

- [周尔复的 X 原文](https://x.com/cholf5/status/2103288041242816559)
- [Three.js 分享的 Voxel Musou 示範](https://x.com/threejs/status/2103137148925104412)與[遊戲頁面](https://voxel-musou.vercel.app/)
- [Three.js Fundamentals](https://threejs.org/manual/pages/fundamentals.html)
- [TypeScript Handbook：Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [Playwright Introduction](https://playwright.dev/docs/intro)、[Screenshots](https://playwright.dev/docs/screenshots)
- [MonoGame 入門文件](https://docs.monogame.net/articles/tutorials/building_2d_games/02_getting_started/)
- [LÖVE 官方 repository](https://github.com/love2d/love)
