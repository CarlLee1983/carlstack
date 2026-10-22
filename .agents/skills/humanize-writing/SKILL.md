---
name: humanize-writing
description: Edit tech articles, X posts, product notes, essays, and narrative (incident stories, personal experience, fiction) to remove AI tone while preserving facts, stance, and voice. Use for humanizing, de-slopping, fixing an over-polished draft, 潤稿, 去AI味, or 改得像本人; detect Traditional Chinese, English, or mixed text and apply the matching language rules.
---

# Humanize Writing (去 AI 味潤稿)

Strip machine-flavored patterns from writing while keeping what the author actually knows, claims, and doubts. The author's judgment is the point, so do not sand it off in the name of "cleaner" prose.

## Operating priorities (both languages)

Apply in order; a lower priority never justifies breaking a higher one.

1. **Preserve facts**: numbers, model names, technical terms, API names, proper nouns, quoted results. Never alter, round, or invent them. In narrative, the events, their order, names, and setting are facts too. Code, URLs, file paths, verbatim quotes, and required disclosures (legal, sponsorship, AI-use notices) are protected segments: keep them byte-for-byte, punctuation and spacing included.
2. **Preserve stance and uncertainty**: if the author hedges ("大概", "I think", "not sure yet"), keep the hedge. Do not upgrade a guess into a confident claim, and keep a reworded hedge at its original strength (尚不是…的指令 does not become 還不能; "may" does not become "will").
3. **Concrete over abstract**: prefer the specific result over the abstract lesson. Cut sentences that could apply to any topic.
4. **Structure before words**: delete empty framing sentences first; only then polish wording. Most AI flavor is structural, not lexical.

## Workflow

1. **Detect language.** Judge by the body text, not stray loanwords.
   - Predominantly Traditional Chinese → read `references/zh-tw.md`.
   - Predominantly English → read `references/en.md`.
   - Mixed → read **both**. A text is mixed only when running prose appears in both languages; English terms inside Chinese sentences (Agent, LLM, token, API, eval, prompt…) do not count.
   - Either way, keep the existing zh/en term mixing. Do not translate terms the author left in English.
   - Editing interface copy (landing pages, product pages, buttons, link text, interface headings, empty states, error messages, or copy embedded in HTML, code strings, or config files, or the user says it is interface copy) → also read `references/interface-copy.md`. It adds to the language files; it does not replace them.
2. **Detect mode, per passage.** _Argument_ states claims, results, and instructions. _Narrative_ tells events in sequence: an incident story, a debugging journey, personal experience, fiction, dialogue. A tech post often mixes both; mark which passages are narrative.
   - Any narrative passage → also read the narrative file for the detected language (`references/narrative-zh-tw.md`, `references/narrative-en.md`; both when mixed). Inside narrative passages its rules take precedence over steps 3 to 5 below.
3. **Extract the substance.** From the source, pull out: facts & numbers, the author's judgment/opinion, first-hand experience, and concrete actions. This is what survives.
4. **Delete the shell.** Remove framing that carries no information. See the banned patterns in the reference file. Finish this structural pass before touching any wording.
5. **Rebuild.** Short, direct sentences. One idea per sentence. Lead with the claim, not the wind-up.
6. **Audit.** Re-scan the rewrite against every checklist you loaded. Remove any pattern that crept back in. Then diff every protected segment against the source and restore any that changed.
7. **Run the checker (Traditional Chinese only).** Save the draft and run `python3 scripts/check_zh.py <path>` (the script path is relative to this skill's directory); it reads `.md`, `.txt`, and `.html`. Run it once and judge each hit: a hit inside a protected segment, a quotation, or an allowed usage stays. It is a review aid, so a clean run proves nothing about structure, and a remaining hit can be correct text.
8. **Deliver.** The rewritten text first. Add a short change list after it only when the edits are non-obvious or the user asked for an audit.

## Rules

- Edit, don't rewrite from scratch. The goal is _this author sounding like themselves_, not a new author.
- Match the source register (casual post stays casual; spec stays precise). Do not formalize a tweet.
- When unsure whether a sentence is substance or shell, ask: _does deleting it lose a fact, a stance, or an action?_ If no, it's shell. In narrative, also ask whether it loses a beat, an image, or the narrator's voice.
- Never add claims the source doesn't make. Humanizing removes; it does not embellish.
- When rewording or moving a scope limit, keep its scope exactly: "not run in the reader's environment" does not become "never run".
- When a heading or sentence carries two halves (a concession and its limit), the edit keeps both halves' information.
- Before changing a heading in a published page, search the site for links to its anchor; update those links in the same change, or keep the heading.
- Metadata such as a title or description, and visible diagram text (SVG `<title>`, `<desc>`, `<text>`), get the same rules as the body, so the page stays consistent (no 異步 in the title with 非同步 in the body). Change only text content, never markup, and keep diagram labels close to their original length.
- Values that act as URLs or keys (tags, slugs, category names) are protected segments too, even when their wording differs from the body; changing them breaks existing links.
- Humanizing makes text more credible. When specific numbers, components, or events are attributed to a named company, person, or source without a citation that supports them, stop and report them for fact-checking before polishing.
- If the source is already clean, say so and make minimal edits rather than manufacturing changes.
- Traditional Chinese uses Taiwan usage and vocabulary (軟體/程式/資料/伺服器, not 軟件/代碼/數據/服務器); see the term table in `references/zh-tw.md`.

## Banned patterns by language and mode

Load the matching files. Each contains the full ban list with before/after examples:

- **Traditional Chinese**: `references/zh-tw.md`; narrative passages add `references/narrative-zh-tw.md`
- **English**: `references/en.md`; narrative passages add `references/narrative-en.md`
- **Interface copy** (either language): add `references/interface-copy.md`
