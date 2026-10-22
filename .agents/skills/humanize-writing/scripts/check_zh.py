#!/usr/bin/env python3
"""掃描繁體中文成稿的機械可判項目。只回報，不改檔。

這是審稿輔助，不是清零閘門：命中只代表「這裡值得看一眼」，是否成立由人逐筆判斷
（例如「評論」「返回」「當前」這類常見詞，語境對了就不用改）。需要看語境的項目
留給 references/zh-tw.md 的自檢清單。規則名稱沿用該檔的章節標題，只有「簡體字」
與「對岸用語」兩個不是章節標題。「閉環」、「不只是…更是」和用語表裡的常見詞
（評論、返回、當前…）也可能命中正當用法，逐筆判斷。
對岸用語不內建詞表，執行時讀 ../references/zh-tw.md 的「台灣用語對照」表，
在表裡加一列就會被抓到。
程式碼區塊、行內程式碼、網址、YAML frontmatter 一律略過；引號內的原話不報破折號與冒號。

也吃 .html／.htm。網頁文案的中文一樣要受檢，但 CSS、JavaScript、標籤屬性、
<pre> 與 <code> 裡的東西不是文案，掃了只會製造滿螢幕的假警報。

退出碼：0 無命中、1 有命中、2 參數或檔案錯誤（含規則檔讀不到）。
"""

from __future__ import annotations

import argparse
from collections import Counter
import re
import sys
from dataclasses import dataclass
from pathlib import Path

# ---------------------------------------------------------------- 規則定義

# 直接命中即違規的詞，規則名稱同 zh-tw.md 的章節標題
BANNED_WORDS = {
    "假洞見標記": (
        "說到底", "關鍵在於", "更微妙的是", "還有一層", "只說對了一半",
        "需要指出的是", "從某種意義上說", "本質上", "更深一層", "說白了", "說穿了",
        "先說結論", "歸根究柢",
    ),
    "轉場與強調贅語": (
        "值得注意的是", "不得不說", "毫無疑問", "顯而易見", "綜上所述", "由此可見",
        "總而言之", "眾所周知", "不言而喻",
    ),
    "空泛收尾": (
        "值得深思", "無限可能", "意義所在", "在這個快速變化的時代",
        "面對日益複雜", "前所未有的", "拭目以待",
    ),
    "挑戰與展望段": (
        "儘管面臨", "挑戰與機遇並存", "展望未來", "未來可期",
    ),
    "聊天殘留": (
        "請告訴我", "好問題", "你說得完全正確", "您說得完全正確", "以下是",
        "截至我的知識", "我的訓練資料", "知識截止", "根據現有資訊",
    ),
    "意義膨脹與尾巴分析": (
        "標誌著", "見證了", "彰顯了", "凸顯了", "體現了", "不可磨滅", "深深植根",
        "最佳證明", "奠定了基礎", "奠定了堅實", "關鍵轉折點",
    ),
    "模糊歸因": (
        "專家認為", "專家指出", "業界普遍認為", "有研究指出", "觀察人士指出",
        "許多開發者表示", "多方人士",
    ),
    "商業與模型黑話": (
        "賦能", "抓手", "閉環", "底層邏輯", "頂層設計", "降本增效", "全鏈路",
        "組合拳", "認知升級", "認知躍遷", "結構性機會", "能力沉澱", "技術底座", "彎道超車",
        "顆粒度對齊",
    ),
    "宣傳腔": (
        "坐落於", "坐落在", "充滿活力的", "令人驚嘆", "令人讚嘆", "必訪", "迷人的",
        "享譽盛名", "文化底蘊", "無縫接軌", "一站式",
    ),
}

# 需要跨字比對的句式
SPAN = r"[^。！？\n]{1,25}"  # 句內 1–25 字
BANNED_PATTERNS = (
    ("二元對比殼", re.compile(rf"不是{SPAN}而是")),
    ("二元對比殼", re.compile(rf"並非{SPAN}而是")),
    ("二元對比殼", re.compile(rf"不在於{SPAN}而在於")),
    ("二元對比殼", re.compile(rf"與其說{SPAN}不如說")),
    ("二元對比殼", re.compile(rf"看似{SPAN}實則")),
    ("二元對比殼", re.compile(rf"表面上?{SPAN}實際上")),
    ("二元對比殼", re.compile(rf"你以為{SPAN}其實")),
    ("二元對比殼", re.compile(r"[^。！？\n]{1,15}不重要，?重要的是")),
    ("二元對比殼", re.compile(r"答案恰恰相反|回頭才發現")),
    # 單純遞進「不只 A，更 B」合法；只報翻案位置的「不只是…更是」與「這不只是」
    ("二元對比殼", re.compile(rf"不[只僅]是{SPAN}更是")),
    ("二元對比殼", re.compile(r"這不[只僅]是")),
    ("聊天殘留", re.compile(r"希望[^。！？\n]{0,8}對[你您]有幫助")),
    ("挑戰與展望段", re.compile(r"儘管[^。！？\n]{0,15}挑戰")),
    ("動詞名詞化", re.compile(r"進行[了過]?[^，。\n]{0,8}的?(優化|提升|改善|調整|升級|重構)")),
    ("動詞名詞化", re.compile(r"實現[了過][^，。\n]{0,10}的(提升|增長|成長|優化|突破)")),
    ("動詞名詞化", re.compile(r"完成[了過]對[^，。\n]{1,12}的")),
    ("動詞名詞化", re.compile(r"具備[^，。\n]{1,12}的能力")),
    ("動詞名詞化", re.compile(r"達成[^，。\n]{1,12}的目標")),
    ("意義膨脹與尾巴分析", re.compile(r"，(反映了|象徵著|展現出)")),
    ("商業與模型黑話", re.compile(r"打開[了過]?[^，。\n]{0,4}想像空間")),
    ("破折號", re.compile(r"[—–‒―─]")),
)

# 簡體字（只收在繁體文本中不可能合法出現的字）
SIMPLIFIED = set(
    "们为这说时会应关门问学实现发对电头长从众层数处备变经过还网线级组织统计"
    "设运营员图书样种类别体点热灵让认识语读写记词讲论试该买卖东车马鸟鱼见贝"
    "页风飞汉阳阴际陆陈队难鸡凤鸣声临举义乐医区华协单厂历厉压厌县参双"
)

# 提示性冒號：只報鋪梗後揭曉的用法。
# 揭曉開頭（§4）：即使冒號前很短也報。
REVEAL_RE = re.compile(
    r"重點只有一個|教訓是|一句話總結|核心是|讓我學到|學到|答案是|結論是"
    r"|教會我[^，。：:\n]{0,10}道理"
    r"|只有一個|(是|呢|在於)\s*$"
)
# 引語：「他說：」「我心想：」引出原話（含內心獨白）
SPEECH_HEAD_RE = re.compile(r"(說|道|想|問|答|寫道|表示|回覆|回答)\s*$")
# 標籤式冒號：行首一個短標籤加冒號是排版（「注意：…」「環境：macOS」）
LABEL_MAX = 10
COLON_OK_AFTER = ("「", "『", '"', "“", "'")
# 條列引言：行尾冒號且下一段是清單項或程式碼
LIST_OR_CODE_RE = re.compile(
    r"^\s*([-*+]\s|\d+[.)、]\s|```|~~~|<pre\b|<code\b|\$ |&gt;)", re.IGNORECASE
)

# 引號內的原話受保護
QUOTE_RE = re.compile(r"「[^」\n]*」|『[^』\n]*』|“[^”\n]*”")

# ---------------------------------------------------------------- 規則檔

TERM_HEADING = "## 台灣用語對照"
PAREN_RE = re.compile(r"[（(][^）)]*[）)]")


def load_mainland_terms(rules: Path) -> dict[str, str]:
    """讀 zh-tw.md 的台灣用語表，回傳 {對岸用語: 台灣用語}。"""
    lines = rules.read_text(encoding="utf-8").splitlines()
    try:
        start = next(i for i, text in enumerate(lines) if text.strip() == TERM_HEADING)
    except StopIteration:
        raise ValueError(f"找不到標題「{TERM_HEADING}」") from None

    terms: dict[str, str] = {}
    in_table = False
    for line in lines[start + 1:]:
        stripped = line.strip()
        if not stripped.startswith("|"):
            if in_table or stripped.startswith("## "):
                break
            continue
        in_table = True
        cells = [c.strip() for c in stripped.strip("|").split("|")]
        if len(cells) < 2:
            continue
        mainland, taiwan = cells[0], cells[1]
        if set(mainland) <= set("-: ") or mainland == "對岸用語":
            continue
        for term in mainland.split("、"):
            term = PAREN_RE.sub("", term).strip()
            if term:
                terms[term] = taiwan
    if not terms:
        raise ValueError(f"「{TERM_HEADING}」底下沒有可解析的表格")
    return terms


# ---------------------------------------------------------------- 前處理

FENCE_RE = re.compile(r"^\s*(```|~~~)")
HTML_BLOCK_RE = re.compile(r"<(style|script|pre|code)\b.*?</\1\s*>", re.IGNORECASE | re.DOTALL)
HTML_TAG_RE = re.compile(r"<[^>]*>")
HTML_ENTITY_RE = re.compile(r"&[a-zA-Z#0-9]{1,8};")
INLINE_CODE_RE = re.compile(r"`[^`\n]*`")
URL_RE = re.compile(r"[a-zA-Z][a-zA-Z0-9+.\-]*://\S+")
TIME_RE = re.compile(r"\d\s*[:：]\s*\d")
FRONTMATTER_KEY_RE = re.compile(r"^[A-Za-z_][\w\- ]*\s*:")


def blank(match: re.Match[str]) -> str:
    """換成等長空白，行號與欄位都不跑掉。"""
    return re.sub(r"[^\n]", " ", match.group(0))


def strip_html(text: str) -> str:
    """留下網頁上真的會被讀到的字，其餘換成空白。"""
    text = HTML_BLOCK_RE.sub(blank, text)
    text = HTML_TAG_RE.sub(blank, text)
    return HTML_ENTITY_RE.sub(blank, text)


def strip_noise(lines: list[str]) -> list[str]:
    """把不該掃的內容換成空白，保留行號對齊。"""
    out: list[str] = []
    in_fence = False
    # 沒有收尾 --- 就不是 frontmatter，否則整份稿子會被吞掉
    in_frontmatter = lines[:1] == ["---"] and "---" in (row.strip() for row in lines[1:])

    for i, line in enumerate(lines):
        if in_frontmatter:
            out.append("")
            if i > 0 and line.strip() == "---":
                in_frontmatter = False
            continue
        if FENCE_RE.match(line):
            in_fence = not in_fence
            out.append("")
            continue
        if in_fence:
            out.append("")
            continue
        clean = INLINE_CODE_RE.sub(lambda m: " " * len(m.group(0)), line)
        clean = URL_RE.sub(lambda m: " " * len(m.group(0)), clean)
        out.append(clean)
    return out


# ---------------------------------------------------------------- 檢查

@dataclass
class Hit:
    line: int
    rule: str
    text: str
    context: str


def excerpt(line: str, start: int, end: int, pad: int = 14) -> str:
    lo = max(0, start - pad)
    hi = min(len(line), end + pad)
    prefix = "…" if lo > 0 else ""
    suffix = "…" if hi < len(line) else ""
    return f"{prefix}{line[lo:hi].strip()}{suffix}"


def unquoted(line: str) -> str:
    """引號內的原話換成等長空白。"""
    return QUOTE_RE.sub(lambda m: " " * len(m.group(0)), line)


def check_colon(lineno: int, line: str, next_line: str) -> list[Hit]:
    hits = []
    if FRONTMATTER_KEY_RE.match(line):
        return hits
    masked = unquoted(line)
    ends_with_colon = line.rstrip().endswith((":", "："))
    for m in re.finditer(r"[:：]", masked):
        idx = m.start()
        if TIME_RE.search(line[max(0, idx - 3): idx + 4]):
            continue
        tail = line[idx + 1:].lstrip()
        if tail.startswith(COLON_OK_AFTER):
            continue
        # 冒號前只看同一句：「時間：14:00 開始灰度。注意：…」的「注意」是第二句的標籤
        head = re.split(r"[。！？；]", masked[:idx])[-1].strip()
        if SPEECH_HEAD_RE.search(head):
            continue
        if ends_with_colon and idx == len(line.rstrip()) - 1 and LIST_OR_CODE_RE.match(next_line):
            continue
        if not REVEAL_RE.search(head):
            # 冒號後接「、」分隔的行內列舉，是條列引言
            if "、" in re.split(r"[。！？\n]", masked[idx + 1:])[0]:
                continue
            # 去掉清單符號、表情符號與粗體記號，「- 🚀 **Speed:**」的標籤是 Speed
            label = re.sub(r"[*_]+", "", re.sub(r"^\W+", "", head))
            if label and len(label) <= LABEL_MAX and not re.search(r"[，、]", label):
                continue
        hits.append(Hit(lineno, "提示性冒號", m.group(0), excerpt(line, idx, idx + 1)))
    return hits


def check_terms(lineno: int, line: str, terms: dict[str, str]) -> list[Hit]:
    """長詞優先；被較長詞蓋住的短詞（大數據 vs 數據）不重報。"""
    hits = []
    taken: list[tuple[int, int]] = []
    for term in sorted(terms, key=len, reverse=True):
        for m in re.finditer(re.escape(term), line):
            if any(lo <= m.start() and m.end() <= hi for lo, hi in taken):
                continue
            taken.append((m.start(), m.end()))
            hits.append(Hit(lineno, "對岸用語", f"{term} → {terms[term]}",
                            excerpt(line, m.start(), m.end())))
            break
    return hits


def check_line(lineno: int, line: str, terms: dict[str, str], next_line: str) -> list[Hit]:
    spans: list[tuple[str, int, int]] = []

    for rule, words in BANNED_WORDS.items():
        for word in words:
            start = line.find(word)
            if start >= 0:
                spans.append((rule, start, start + len(word)))

    for rule, pattern in BANNED_PATTERNS:
        # 破折號不看引號內的原話；其餘句式照原行比對
        target = unquoted(line) if rule == "破折號" else line
        m = pattern.search(target)
        if m:
            spans.append((rule, m.start(), m.end()))

    # 同一規則的命中互相重疊時只留最長的那筆（「儘管面臨」被「儘管面臨諸多挑戰」蓋住）
    spans.sort(key=lambda span: span[1] - span[2])
    kept: list[tuple[str, int, int]] = []
    for rule, start, end in spans:
        if not any(r == rule and start < hi and lo < end for r, lo, hi in kept):
            kept.append((rule, start, end))
    hits = [Hit(lineno, rule, line[start:end], excerpt(line, start, end))
            for rule, start, end in sorted(kept, key=lambda span: span[1])]

    hits.extend(check_terms(lineno, line, terms))

    found = sorted({ch for ch in line if ch in SIMPLIFIED})
    if found:
        hits.append(Hit(lineno, "簡體字", "".join(found), line.strip()[:40]))

    hits.extend(check_colon(lineno, line, next_line))
    return hits


def check(path: Path, terms: dict[str, str]) -> list[Hit]:
    text = path.read_text(encoding="utf-8")
    source = text.splitlines()  # 前瞻用原文：判斷下一段是不是清單或程式碼區塊
    if path.suffix.lower() in (".html", ".htm"):
        text = strip_html(text)
    raw = text.splitlines()
    hits: list[Hit] = []
    cleaned = strip_noise(raw)
    for lineno, line in enumerate(cleaned, start=1):
        if not line.strip():
            continue
        following = next((n for n in source[lineno:] if n.strip()), "")
        hits.extend(check_line(lineno, line, terms, following))
    return sorted(hits, key=lambda h: (h.line, h.rule))


# ---------------------------------------------------------------- CLI

RULES_FILE = Path(__file__).resolve().parent.parent / "references" / "zh-tw.md"


def main() -> int:
    parser = argparse.ArgumentParser(description="檢查繁體中文成稿的機械可判項目（審稿輔助）")
    parser.add_argument("paths", nargs="+", type=Path, help="稿件路徑（.md / .txt / .html）")
    args = parser.parse_args()

    try:
        terms = load_mainland_terms(RULES_FILE)
    except (OSError, ValueError) as e:
        print(f"讀不到規則檔 {RULES_FILE}：{e}", file=sys.stderr)
        return 2

    total = 0
    for path in args.paths:
        if not path.is_file():
            print(f"找不到檔案：{path}", file=sys.stderr)
            return 2
        try:
            hits = check(path, terms)
        except (OSError, UnicodeDecodeError) as e:
            print(f"讀不了 {path}：{e}", file=sys.stderr)
            return 2
        total += len(hits)
        print(f"\n=== {path} ===")
        if not hits:
            print("沒有機械命中。需要語境的項目（結構殼、假具體）還是要人自己看。")
            continue
        for h in hits:
            print(f"  L{h.line:<4} [{h.rule}] {h.text}\n         {h.context}")
        summary = "、".join(f"{k} {v}" for k, v in Counter(h.rule for h in hits).most_common())
        print(f"  ── 共 {len(hits)} 項：{summary}")

    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
