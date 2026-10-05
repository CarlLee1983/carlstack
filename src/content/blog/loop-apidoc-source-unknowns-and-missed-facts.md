---
title: "API 文件缺的欄位要留白；來源寫了的 3020 卻不能漏掉"
description: "用 loop-apidoc 的 RSG 範例對照供應商來源、擷取 JSON、OpenAPI 與驗證報告：哪些資訊必須保留未知，哪些遺漏即使驗證通過也要攔下。"
publishDate: 2026-10-05T18:05:00+08:00
draft: false
featured: false
tags:
  - API 整合
  - 開源專案
repositoryUrl: https://github.com/CarlLee1983/loop-apidoc
cover: ../../assets/covers/loop-apidoc-source-unknowns.png
coverAlt: "暖色檔案桌上的來源紙條通往透明契約頁；末端一格刻意留白，旁邊停著紅色查核筆。"
---

供應商文件沒給成功回應的欄位時，文件產生器不能靠慣例補一個看似合理的 schema。但還有另一種更難發現的錯：來源明明寫了，擷取結果卻漏掉。兩者在產物裡都像「沒有資料」，處理方式完全不同。

我用自己維護的 [loop-apidoc](https://github.com/CarlLee1983/loop-apidoc) 和公開的 [RSG transfer-wallet 範例](https://github.com/CarlLee1983/loop-apidoc/tree/main/benchmarks/rsg-game-transfer-wallet)重查這條界線。這篇只討論來源到契約的證據鏈；工具的用途與入口見 [loop-apidoc 專案介紹](/projects/)。

## 先固定來源版本，才談產物是否忠實

範例的 [紀錄](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/notes.md)說明：2026 年 8 月 17 日擷取 [RSG 官方整合轉帳錢包文件](https://docs.rsg-games.com/transfer/zh-tw/#api)的 1.28.0 HTML，再正規化成 Markdown。公開 repository 保留的是[行號對齊的 sanitized 來源](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/sanitized_sources/rsg-game-transfer-wallet.zh-TW.normalized.md)、擷取檔與預期條件；原始 HTML 和當次完整生成目錄沒有提交。`sanitized-fixture.json` 也明列 `strict_local_eligible: false`。因此我能重播並檢查這份公開 fixture，不能把它說成原始快照的完整驗收。

2026 年 10 月 5 日再看官方頁時，版本已是 1.30.0。它可以幫忙核對目前文件，不能倒過來充當 1.28.0 當日輸入。以下的逐欄對照以 repository 的 sanitized 1.28.0 fixture 為準。

## 同一個端點，把已知與未知分開記

[來源第 444–467 行](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/sanitized_sources/rsg-game-transfer-wallet.zh-TW.normalized.md#L444-L467)列出 `WithBalance/Player/CreatePlayer` 的 `SystemCode`、`WebId`、`UserId`、`Currency` 四個必要參數，卻沒有在該段給出完整的回應欄位結構。[擷取檔 `ep00.json`](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/extraction/endpoints/ep00.json)保留這個差異；下列是縮寫，不是完整檔案：

```json
{
  "path": "/WithBalance/Player/CreatePlayer",
  "source": "rsg-game-transfer-wallet.zh-TW.normalized.md lines 444-467",
  "request": { "schema": null },
  "responses": [{ "status": "default", "schema": null }],
  "missing": ["request.schema", "responses[0].schema"]
}
```

組裝階段可以把**來源明列的四個參數**轉成 OpenAPI request body 欄位；這是有依據的結構化轉換，不表示來源曾給出完整 request schema。這次隔離重播的 `openapi.yaml` 對該端點產生四個必要欄位，但 `default` 回應只有空白 description，沒有猜出成功回應的 schema。來源未提供、轉換得到與仍未知的資訊，不能混成同一種「已完成」。

## PASS 與來源完整性是兩道檢查

我在 2026 年 10 月 5 日，用 repository 的 [sanitized fixture 測試](https://github.com/CarlLee1983/loop-apidoc/blob/main/tests/test_sanitized_benchmarks.py)和同一條 `run_assemble_pipeline` 路徑重播。測試 `1 passed`；隔離產物包含 `openapi.yaml`、`provenance.json`、`validation/report.json` 與 Core 對照檔。[本站保留的產物節錄](/examples/loop-apidoc-rsg-replay.json)包含 CreatePlayer 的 OpenAPI 欄位、兩種 provenance 對照、完整 validation report 與 Core comparison，讀者可直接核對。這次報告有 23 筆 `REQUIRED_INFO_MISSING` warning 和 1 筆 `SOURCE_FACTS_UNSCANNED` warning，沒有 validation error；OpenAPI 可生成，Core 對照的 33 筆 material claims 都得到支持。這些是**本次 sanitized fixture 的觀察**，不是 [預期驗證檔](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/expected/validation.expect.json)所宣告的歷史執行結果，也不具 strict-local 發布資格。

預期檔另外列了一筆 `SOURCE_UNVERIFIED`：它對應[範例紀錄中保留的舊版傾印來源](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/notes.md)。本次 sanitized 重播只帶入可公開的單一來源檔，因此實際報告沒有這筆 warning；兩份數字不應混用。

重播的 `provenance.json` 把 `paths./WithBalance/Player/CreatePlayer.post` 指回來源第 444–467 行，把已擷取的 `errors.3018` 指回第 1369–1408 行。驗證報告也把沒範例、沒可用 schema 的地方留下 warning。但「已有的主張可追來源」沒有證明「來源中的每個應收事實都被擷取」。後者需要拿來源清單反向對照產物。

## `3020` 是漏擷取，不是未知

這次反向對照找到一個具體差異：[sanitized 來源的 8-1 錯誤碼表](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/sanitized_sources/rsg-game-transfer-wallet.zh-TW.normalized.md#L1369-L1397)列出 `3020 Deny deposit and withdraw for player.`，該表共有 16 個具體錯誤碼。[擷取 inventory](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/extraction/inventory.json)與本次重播的 OpenAPI `ErrorCode` enum 卻只有 15 碼，止於 `3018`。[範例紀錄](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/notes.md)和[預期最小契約](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/expected/minimum.json)也仍寫 15。

這不是應該補一個 placeholder 的情況。來源已經提供 `3020`，所以必須回頭修擷取與預期契約，或提出能對上這份 fixture 的明確範圍理由。

**在差異釐清前，不能把「8-1 錯誤碼已完整保留」當成發布主張。**

即使結構驗證與 fixture parity 都通過，這條停止規則仍成立。

讀者可以在 [loop-apidoc repository](https://github.com/CarlLee1983/loop-apidoc) 重跑定向測試，再分別搜尋 sanitized 來源和 inventory 的 `3020`：

```bash
uv run pytest 'tests/test_sanitized_benchmarks.py::test_sanitized_fixture_proves_fixture_backed_exact_evidence_parity[rsg-game-transfer-wallet]' -q
rg -n '3020' benchmarks/rsg-game-transfer-wallet/sanitized_sources/rsg-game-transfer-wallet.zh-TW.normalized.md
rg -n '"code": "3020"' benchmarks/rsg-game-transfer-wallet/extraction/inventory.json
```

最後一行目前找不到項目，會以 `rg` 的無匹配退出碼結束。這個步驟只證明公開 fixture 與擷取檔的差異；它不會重建未提交的歷史 run。要交付自己的 API 文件，請把「來源未寫」留下待問清單，把「來源有寫但產物沒有」列為擷取缺陷，並在驗證通過後再做一次來源到產物的反向盤點。
