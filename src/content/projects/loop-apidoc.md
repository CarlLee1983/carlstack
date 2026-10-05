---
name: loop-apidoc
description: "為 Loop Engineering 建立以來源為依據的 API 文件產生管線。"
repositoryUrl: https://github.com/CarlLee1983/loop-apidoc
homepageUrl: https://carllee1983.github.io/loop-apidoc/
status: 開源
featured: true
cover: ../../assets/projects/loop-apidoc.webp
coverAlt: "紙雕拼貼風格的開放典籍，來源文件以細線連至中央結晶與結構化地圖"
tags:
  - API 整合
  - 文件工程
  - OpenAPI
---

把供應商的 PDF、HTML、Word、Markdown 或既有 OpenAPI 整理成 OpenAPI 3.1、繁中串接指南、來源追溯資料、驗證報告與離線審閱頁。適合需要讓整合文件的每項關鍵主張回到原始來源、並保留未知欄位的團隊；目前從[專案文件](https://github.com/CarlLee1983/loop-apidoc)的 agent 工作流開始。

可從公開的 [RSG transfer-wallet 範例](https://github.com/CarlLee1983/loop-apidoc/tree/main/benchmarks/rsg-game-transfer-wallet)核對一個最小片段：[會員建立端點的擷取檔](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/extraction/endpoints/ep00.json)將四個 body 參數對到[來源第 444–467 行](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/sanitized_sources/rsg-game-transfer-wallet.zh-TW.normalized.md#L444-L467)；通用標頭的來源另在[第 178–197 行](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/sanitized_sources/rsg-game-transfer-wallet.zh-TW.normalized.md#L178-L197)。擷取檔把未直接取得的 `request.schema` 留在 `missing`。

這份範例提供來源與擷取檔；repository 未保留當次完整生成目錄，[預期驗證條件](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/expected/validation.expect.json)不能當成執行結果。本站保留了[另一次 sanitized 重播的產物節錄](/examples/loop-apidoc-rsg-replay.json)，可對照 OpenAPI、provenance 與完整驗證報告；它不具 strict-local 發布資格，來源的 `3020` 也尚未進入擷取結果。判斷過程見[實戰文](/blog/loop-apidoc-source-unknowns-and-missed-facts/)。
