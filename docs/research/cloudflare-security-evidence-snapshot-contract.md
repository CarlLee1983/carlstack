# Cloudflare 證據快照：來源核對與契約測試

- 查核日期：2026-10-08 UTC
- 正式文章：`src/content/blog/cloudflare-security-evidence-snapshot-contract.md`
- 主來源與正規化 URL：https://blog.cloudflare.com/agentic-security-operations/
- 來源日期：2026-10-07
- 作者：Deanna Tran、Javier Castro、Jacob Crisp、Blake Darché
- 研究方式：完整讀取官方架構文章與下列產品文件；執行自訂 Python 合成契約測試。未登入 Managed Defense、未呼叫模型或客戶資料、未部署範例。

## 去重與文章範圍

研究前搜尋 `src/content/blog`、`docs/research`、`docs/article-queue.md` 的完整 URL、穩定 path `agentic-security-operations`、標題關鍵字、四位作者、`Managed Defense`、`evidence snapshot` 與「證據快照」。URL 沒有 query，無追蹤參數需移除；沒有其他穩定內容 ID。未找到同來源文章或 queue 項目。

鄰近文章 `threat-signals-provenance` 聚焦 RSS 情報抽取與來源，`decisions-api-routing-calibration-authorization` 聚焦分類與執行授權。本文新增一次調查的固定輸入、缺口型別、scope 與版本驗收，讀者成果不同；正文加入兩篇站內連結。本次未改舊文章或佇列。

系列：AI Agent 工程化與工作流實戰，依整合分配使用 `seriesOrder: 69`。正式文章 `draft: false`、`featured: false`，帶實際 10 月 8 日含 offset 時間戳。

## 一手來源與使用限制

1. [Cloudflare 架構文章](https://blog.cloudflare.com/agentic-security-operations/)。已讀完整正文，核對作者與日期。來源的事實摘要集中在正式文章開頭，限定 availability、角色權限與架構方向；避免重製原文各節與程式。正文後續契約與測試是獨立工程設計。官方架構聲明未經本次獨立驗證；沒有把 Clef 的開源狀態延伸成整套 harness 開源。
2. [Rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)，頁面更新 2026-09-10。正文只引用重試、冪等與確定步驟名稱；不複製官方程式碼。
3. [Sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)，頁面更新 2026-09-24。正文只引用可設定 retry/backoff/timeout，不依賴預設值，也不聲稱它完成應用層快照管理。
4. [R2 Consistency model](https://developers.cloudflare.com/r2/reference/consistency/)，頁面更新 2026-04-30。正文引用直接讀取的強一致性、同 key 最後完成寫入者勝出、快取路徑的例外。每版唯一 key 與 ready manifest 發布協定是本文建議，未測試 R2 或跨儲存交易。

來源摘要均限制在各頁 200-word 衍生內容預算內；無直接引文、無複製來源程式碼。正文不重述廠商效率宣稱、未引用未公布的評估數字。

## 自訂契約的邊界

- 五種 state 是本文自訂 enum；不冒充 Cloudflare 公開 schema。
- 固定時間窗不代表上游資料不再變動；replay 讀取封存材料，refresh 另建快照。
- 摘要校驗只支持完整性，可信 manifest 與來源認證是前提。
- `source_refs` 只在當前快照中解析；租戶與案件 scope 在可信服務端建立。
- `observed_absence` 需明確 predicate 和可信 adapter 的完整性判定，不能推出所有攻擊不存在。
- `ready_for_review` 只表示機械式檢查通過；不等於語意正確、安全或有處置權限。

## 可重跑的最小測試

將下方 Python code fence 保存為 `evidence_contract_test.py`，以 `python3 evidence_contract_test.py` 執行。只用標準函式庫，沒有網路、檔案修改或外部服務呼叫。所有 fixture 都是虛構。

這是有限的 reference check，不是可直接採用的 production validator。假設上游已完成完整 schema 驗證與認證，manifest/evidence 來自可信封存端；程式只示範 scope、引用集合、摘要、state 與一個有界不存在 predicate 的拒收規則。未涵蓋 schema 全欄位、ACL、簽章、資料保留、事件時間完整性或自然語言語意驗證。

```python
import copy
import hashlib
import json


def digest(value):
    # This serialization is fixed only for these JSON-compatible fixtures.
    data = json.dumps(
        value, sort_keys=True, separators=(",", ":"), ensure_ascii=True
    ).encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def fixture(state="observed", complete=False):
    scope = ["tenant-demo", "case-demo", "snap-demo-001"]
    evidence = {
        "evidence-demo-01": {
            "scope": scope.copy(),
            "state": state,
            "coverage_complete": complete,
            "predicate": "allowed_request_in_fixed_window",
            "payload": {"request_id": "request-demo", "action": "block"},
        }
    }
    manifest = {
        "scope": scope.copy(),
        "digests": {key: digest(value) for key, value in evidence.items()},
    }
    finding = {
        "scope": scope.copy(),
        "claim_kind": "observation",
        "predicate": "allowed_request_in_fixed_window",
        "source_refs": ["evidence-demo-01"],
        "text": "A request was blocked.",
    }
    return manifest, evidence, finding


def validate(manifest, evidence, finding):
    if finding["scope"] != manifest["scope"]:
        return "reject_scope"
    kind = finding["claim_kind"]
    if kind not in {"observation", "lookup_result", "absence"}:
        return "reject_claim_kind"
    refs = finding["source_refs"]
    if not refs or len(refs) != len(set(refs)):
        return "reject_references"
    for ref in refs:
        if ref not in manifest["digests"] or ref not in evidence:
            return "reject_reference"
        item = evidence[ref]
        if item["scope"] != manifest["scope"]:
            return "reject_scope"
        if digest(item) != manifest["digests"][ref]:
            return "reject_integrity"
        state = item["state"]
        if state in {"not_checked", "query_failed"}:
            return "reject_gap_as_evidence"
        if kind == "observation" and state != "observed":
            return "reject_evidence_type"
        if kind == "lookup_result" and state != "no_match":
            return "reject_evidence_type"
        if kind == "absence" and not (
            state == "observed_absence"
            and item["coverage_complete"] is True
            and item["predicate"] == finding["predicate"]
        ):
            return "reject_absence"
    # Text is intentionally not interpreted. This is NOT a truth validator.
    return "ready_for_review"


cases = []


def add(name, sample, expected):
    cases.append((name, copy.deepcopy(sample), expected))


add("valid_observation", fixture(), "ready_for_review")
for index, name in enumerate(["wrong_tenant", "wrong_case", "wrong_snapshot"]):
    sample = fixture()
    sample[2]["scope"][index] = "other"
    add(name, sample, "reject_scope")

sample = fixture()
sample[2]["source_refs"] = ["missing"]
add("unknown_reference", sample, "reject_reference")

for state in ["query_failed", "not_checked"]:
    add(state, fixture(state), "reject_gap_as_evidence")

add("no_match_as_observation", fixture("no_match"), "reject_evidence_type")
sample = fixture("no_match")
sample[2]["claim_kind"] = "lookup_result"
add("valid_no_match", sample, "ready_for_review")

sample = fixture("no_match")
sample[2]["claim_kind"] = "absence"
add("no_match_as_absence", sample, "reject_absence")
sample = fixture("observed_absence", complete=False)
sample[2]["claim_kind"] = "absence"
add("absence_without_coverage", sample, "reject_absence")
sample = fixture("observed_absence", complete=True)
sample[2]["claim_kind"] = "absence"
add("valid_bounded_absence", sample, "ready_for_review")

sample = fixture()
sample[1]["evidence-demo-01"]["payload"]["action"] = "allow"
add("tampered_payload", sample, "reject_integrity")

sample = fixture()
sample[2]["text"] = "All attacks have been completely ruled out."
add("wrong_prose_not_caught", sample, "ready_for_review")

sample = fixture()
sample[2]["claim_kind"] = "verified_safe"
add("unknown_claim_kind", sample, "reject_claim_kind")

for name, sample, expected in cases:
    actual = validate(*sample)
    if actual != expected:
        raise AssertionError(f"{name}: {actual!r} != {expected!r}")
    print(f"PASS {name}: {actual}")
print(f"{len(cases)}/{len(cases)} expectations matched")
```

## 執行與交付狀態

2026-10-08 於本機 Python 3 執行上述原樣程式，exit 0；15/15 expectations matched。十四組檢查預期加上一組刻意暴露語意盲點的案例均符合預期，不能解讀成十五件真實案件判斷正確。

實際輸出：

```text
PASS valid_observation: ready_for_review
PASS wrong_tenant: reject_scope
PASS wrong_case: reject_scope
PASS wrong_snapshot: reject_scope
PASS unknown_reference: reject_reference
PASS query_failed: reject_gap_as_evidence
PASS not_checked: reject_gap_as_evidence
PASS no_match_as_observation: reject_evidence_type
PASS valid_no_match: ready_for_review
PASS no_match_as_absence: reject_absence
PASS absence_without_coverage: reject_absence
PASS valid_bounded_absence: ready_for_review
PASS tampered_payload: reject_integrity
PASS wrong_prose_not_caught: ready_for_review
PASS unknown_claim_kind: reject_claim_kind
15/15 expectations matched
```

定向 local Prettier write/check、站內連結目標與封面檔案存在性檢查已通過；`git diff --check` 無錯誤。未執行全站 gate。

封面已由整合流程完成生成，並檢視全尺寸與 320 px 卡片：靛藍布面四個口袋，三袋分別裝有黃、米白、淺藍材料，以紅線連到中央紅色圓章；右下空袋沒有特殊醒目邊線。coverAlt 已依實圖修正。本篇沒有架構圖或表格。

整站 format/policy/check/test/build、commit/push 和正式部署驗證交由整合流程完成；本檔案作者未操作 git index 或聲稱部署成功。

## 封面整合驗收

內建 imagegen 原創生成，原始 PNG 1536×1024，轉成本地 WebP。已檢視全尺寸及 320×180 卡片裁切，沒有非預期文字、logo 或浮水印。織物拼貼／正面平視／靛藍與米白／柔和漫射光；四個口袋中的右下空袋保留缺口，三條紅線連回圓章。封面四篇採不同媒材、構圖與主色，並與 Oct7 相鄰封面比對；未採用第三方圖片。
