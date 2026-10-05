# loop-apidoc：供應商文件缺口與來源證據

研究日期：2026-10-05。用途：支撐 [CarlStack 實戰文](../../src/content/blog/loop-apidoc-source-unknowns-and-missed-facts.md)的來源查核；不是產品驗收報告。

## 去重與題目邊界

- 同一 RSG／loop-apidoc 案例已寫入 `src/content/blog/loop-apidoc-source-unknowns-and-missed-facts.md`，對應題目已從 `docs/article-queue.md` 移除；後續有新證據時更新該文，不另建相同題目。
- 此案例能說明「文件有寫的事實如何追到來源，以及沒寫的資訊如何保留為缺口」。不能據此宣稱所有供應商事實已完整擷取，或已符合 `strict-local` 驗收。

## 一手來源與版本

- 供應商主來源：[RSG 整合轉帳錢包 API](https://docs.rsg-games.com/transfer/zh-tw/#api)。2026-10-05 檢視時頁面顯示 **1.30.0**；3-2 節列出 `Msg=` DES-CBC 加密請求體與三個 `X-API-*` 標頭，4-4 節列出加密後的 JSON 回應 envelope，8-1 節列出錯誤碼。這個即時頁面不能冒充 benchmark 擷取當日的原始輸入。
- Benchmark 的 [notes.md](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/notes.md) 記錄 2026-08-17 重新擷取的 **1.28.0** HTML、正規化流程、原始快照 SHA-256、範圍與執行敘述。[sanitized-fixture.json](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/sanitized-fixture.json) 記錄原快照身分、保留行範圍與 sanitized 檔 SHA-256，且明定 `strict_local_eligible: false`。原始 `raw/`、`sources/` 為 gitignored，不在公開 repository；可重播的是 [sanitized 來源](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/sanitized_sources/rsg-game-transfer-wallet.zh-TW.normalized.md)，不是原始來源鏈的完整本機驗收。
- [expected/minimum.json](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/expected/minimum.json) 是**預期契約**：12 operations／paths、1 security scheme、15 error codes、核心建立會員／存入／取出／查交易結果，以及 examples、provenance、crypto。[expected/validation.expect.json](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/expected/validation.expect.json) 是**預期驗證結果**，記載 PASS 與可接受警告；不能把這兩個宣告檔當成實際產物。
- `notes.md` 的 Run Log／Result 寫「Assemble: PASS」「OpenAPI 3.1 valid」「11 warnings, no errors」。這是 repository 內的**執行紀錄主張**。當次 `output/20260716T072005.471369Z/` 與 1.28.0 完整 run artifact 並未提交，因此不能由該紀錄直接檢閱當次 `openapi.yaml`、`provenance.json` 或 validation report。`notes.md` 另記較舊 1.27.0 單行傾印來源未受引用，及重新綁定 1.28.0 時 17 個引用區間移位。

## 可檢閱的 claim → source → artifact 鏈

1. 官方頁 3-2 節的 `X-API-Signature` 與 DES-CBC 資訊，在 [sanitized 來源](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/sanitized_sources/rsg-game-transfer-wallet.zh-TW.normalized.md) 第 178–197 行保留。[extraction/integration.json](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/extraction/integration.json) 把 DES encryption／decryption 與 MD5 signature 分別建模，並在 `evidence[]` 記來源檔、行區間、fragment digest、claim path；未記載的 `verify.method` 保留 `null`，callbacks／field conditions／test cases 寫進 `missing`。
2. [extraction/inventory.json](https://github.com/CarlLee1983/loop-apidoc/blob/main/benchmarks/rsg-game-transfer-wallet/extraction/inventory.json) 的 `security_schemes` 與 endpoints 也有逐主張 `evidence[]`；例如 `POST /WithBalance/Player/Deposit` 指向來源第 469–506 行，通用標頭指向第 178–197 行。其 error code 項目將應用錯誤碼的 `http_status` 留 `null`；`3014` 的適用端點另指向 Deposit／Withdraw 的行區間，避免把應用層代碼當成 HTTP status。
3. [架構文件](https://github.com/CarlLee1983/loop-apidoc/blob/main/docs/ARCHITECTURE.md)「生成」與「錯誤碼」段落說明 `generate_outputs` 輸出 `openapi.yaml`、`api-guide.zh-TW.md`、`review.html`、`provenance.json`，而 OpenAPI 的 `components.schemas.ErrorCode` 以 enum 與 `x-loop-error-code-map` 保留代碼意義、適用範圍與 source 引用。[設計決策](https://github.com/CarlLee1983/loop-apidoc/blob/main/docs/DESIGN_DECISIONS.md) 的來源證據段落要求 exact fragment／digest 驗證，缺少來源支持不能靠慣例補寫。
4. [tests/test_sanitized_benchmarks.py](https://github.com/CarlLee1983/loop-apidoc/blob/main/tests/test_sanitized_benchmarks.py) 用 sanitized fixture、`write_passing_source_quality`、pytest `tmp_path` 呼叫 `run_assemble_pipeline`。測試檢查 SHA-256、保留行、`core/comparison.json` 的 legacy passed／core accept／zero unverified，以及 `core/relationships.json` 指向 `core/evidence.json` 的 exact fragments。它證明 sanitized fixture 的對照關係，**不等於**完整原始快照的 strict-local 資格。

## 本次可重播觀察與矛盾

- 在 loop-apidoc 工作樹執行 `uv run pytest 'tests/test_sanitized_benchmarks.py::test_sanitized_fixture_proves_fixture_backed_exact_evidence_parity[rsg-game-transfer-wallet]' -q`，結果 `1 passed`。另用相同 fixture 在系統暫存目錄呼叫 `run_assemble_pipeline`，確認它產生 `openapi.yaml`、`integration-contract.json`、`provenance.json`、`validation/report.json`、`core/{comparison,evidence,relationships}.json`；暫存目錄已自動清除。這是**本次新重播產物**，不是 notes 所述歷史 run。`comparison.json` 顯示 legacy `passed`、Core `accept`、33 supported、0 unverified。重播的 OpenAPI ErrorCode enum 有 15 碼，止於 `3018`。
- **必須先解決的內容矛盾：**`notes.md` 稱 1.28.0 的 8-1 節只有 15 碼、`3020` 只在端點個別表；但 committed sanitized 來源第 1371–1397 行的 **8-1 表也列出 `3020`**，即 16 個具體碼。`extraction/inventory.json` 沒有 `3020`，`expected/minimum.json` 仍要求 15。2026-10-05 官方 1.30.0 頁面的 8-1 表也列有 `3020`。因此目前不能寫「8-1 所有錯誤碼均保留」；若主張此處是有意限縮，需先提出與 fixture 一致的範圍依據，或修正擷取及預期契約。
- 預期驗證檔宣告 `REQUIRED_INFO_MISSING.warning: 23`、`SOURCE_UNVERIFIED.warning: 1`、`SOURCE_FACTS_UNSCANNED.warning: 1`，並將缺範例、缺成功 response schema 欄位、舊來源零引用列為可見缺口。這些是 benchmark 對缺資料的**預期處理**；文章若要報實際 warning 數，須引用重播或歷史 run 的 report，而非直接引用預期檔。

## 文章論點與待補證據

- 可用的論點：API 文件產生器應讓「可追來源的欄位」與「供應商沒有提供的欄位」同時可見。此案例有行區間與 digest、`null`／`missing`、產物中的 provenance／error-code map，以及 fixture parity 測試，可串成讀者可重做的檢查步驟。
- 正式文章檔將 `3020` 矛盾列為停止規則，並將 1.28.0 fixture 與目前 1.30.0 官方頁分開。若要聲稱完整原始快照驗收或歷史 PASS 的詳細產物，需取得當次未提交的原始快照與 run 報告；現有 sanitized 測試不能替代。另保存[隔離重播的節錄](../../public/examples/loop-apidoc-rsg-replay.json)，供檢閱 OpenAPI、provenance 與實際報告。
