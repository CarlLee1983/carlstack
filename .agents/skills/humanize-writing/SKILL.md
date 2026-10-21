---
name: humanize-writing
description: Edit tech articles, X posts, product notes, essays, and narrative (incident stories, personal experience, fiction) to remove AI tone while preserving facts, stance, and voice. Use for humanizing, de-slopping, 潤稿, or 去AI味; detect Traditional Chinese, English, or mixed text and apply the matching language rules.
---

# Humanize Writing (去 AI 味潤稿)

Strip machine-flavored patterns from writing while keeping what the author actually knows, claims, and doubts. The author's judgment is the point — do not sand it off in the name of "cleaner" prose.

## Operating priorities (both languages)

Apply in order; a lower priority never justifies breaking a higher one.

1. **Preserve facts** — numbers, model names, technical terms, API names, proper nouns, quoted results. Never alter, round, or invent them. In narrative, the events, their order, names, and setting are facts too.
2. **Preserve stance and uncertainty** — if the author hedges ("大概", "I think", "not sure yet"), keep the hedge. Do not upgrade a guess into a confident claim.
3. **Concrete over abstract** — prefer the specific result over the abstract lesson. Cut sentences that could apply to any topic.
4. **Structure before words** — delete empty framing sentences first; only then polish wording. Most AI flavor is structural, not lexical.

## Workflow

1. **Detect language.** Judge by the body text, not stray loanwords.
   - Predominantly Traditional Chinese → read `references/zh-tw.md`.
   - Predominantly English → read `references/en.md`.
   - Mixed → read **both**. A text is mixed only when running prose appears in both languages; English terms inside Chinese sentences (Agent, LLM, token, API, eval, prompt…) do not count.
   - Either way, keep the existing zh/en term mixing. Do not translate terms the author left in English.
2. **Detect mode, per passage.** *Argument* states claims, results, and instructions. *Narrative* tells events in sequence: an incident story, a debugging journey, personal experience, fiction, dialogue. A tech post often mixes both; mark which passages are narrative.
   - Any narrative passage → also read the narrative file for the detected language (`references/narrative-zh-tw.md`, `references/narrative-en.md`; both when mixed). Inside narrative passages its rules take precedence over steps 3–5 below.
3. **Extract the substance.** From the source, pull out: facts & numbers, the author's judgment/opinion, first-hand experience, and concrete actions. This is what survives.
4. **Delete the shell.** Remove framing that carries no information — see the banned patterns in the reference file.
5. **Rebuild.** Short, direct sentences. One idea per sentence. Lead with the claim, not the wind-up.
6. **Audit.** Re-scan the rewrite against every checklist you loaded. Remove any pattern that crept back in.

## Rules

- Edit, don't rewrite from scratch — the goal is *this author sounding like themselves*, not a new author.
- Match the source register (casual post stays casual; spec stays precise). Do not formalize a tweet.
- When unsure whether a sentence is substance or shell, ask: *does deleting it lose a fact, a stance, or an action?* If no, it's shell. In narrative, also ask whether it loses a beat, an image, or the narrator's voice.
- Never add claims the source doesn't make. Humanizing removes; it does not embellish.
- If the source is already clean, say so and make minimal edits rather than manufacturing changes.
- Traditional Chinese uses Taiwan usage and vocabulary (軟體/程式/資料/伺服器, not 軟件/代碼/數據/服務器).

## Banned patterns by language and mode

Load the matching files — each contains the full ban list with before/after examples:

- **Traditional Chinese**: `references/zh-tw.md`; narrative passages add `references/narrative-zh-tw.md`
- **English**: `references/en.md`; narrative passages add `references/narrative-en.md`
