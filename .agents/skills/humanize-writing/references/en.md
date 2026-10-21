# English banned patterns

Apply when the body text is predominantly English. Each item says why it's cut, then shows a before/after. Keep the author's own register — casual stays casual.

## Contents

1. The "not just X, it's Y" shell
2. Hype openers
3. Fake-insight markers
4. Colon-then-vague-lesson
5. Abstract stage-setting
6. Rule-of-three padding
7. Transition and emphasis filler
8. Empty conclusions
9. Slop vocabulary
10. Defensive negation stacking
11. "This article" disclaimers
12. Stock paragraph-closing warnings
13. Repeated concessive antithesis
14. Semicolon chains
15. Verification scope scattered across paragraphs

---

## 1. The "not just X, it's Y" shell

"It's not just a tool, it's a paradigm shift." "This isn't about speed — it's about trust." The contrast usually carries no information; it's rhythm, not content.

- ❌ This isn't just an update — it's a fundamental rethink of how we work.
- ✅ This release cuts batch processing from 3s to 0.4s.

If two real facts hide behind the contrast, keep the facts, drop the frame:

- ❌ The point isn't the feature, it's the philosophy behind it.
- ✅ We only shipped the retry logic this time; the UI is unchanged.

## 2. Hype openers

"Let's dive in." "Buckle up." "In today's fast-paced world." "Let's unpack this." Throat-clearing that delays the first real sentence. Start at the first fact.

- ❌ In today's rapidly evolving AI landscape, developers face unprecedented choices.
- ✅ I wired up three LLM APIs last week — here's what differed.

## 3. Fake-insight markers

"The truth is…", "At its core…", "Fundamentally…", "Here's the thing:", "What most people miss is…". They promise depth and deliver a truism. Delete the marker; if the sentence collapses, it was empty.

- ❌ The truth is, what really matters is the user experience.
- ✅ Removing one checkout step lifted conversion 4%.

## 4. Colon-then-vague-lesson

Using a colon to introduce a universal moral: "This taught me something important: patience matters."

- ❌ That outage taught me a lesson: you can't wait for things to break.
- ✅ After that outage I added p99 latency alerts.

## 5. Abstract stage-setting

"As the world becomes increasingly complex…", "With the rise of AI…". A grand backdrop unrelated to the actual topic. Cut to the concrete.

- ❌ As AI reshapes software, engineers must adapt like never before.
- ✅ I benchmarked our RAG pipeline against a plain keyword search. It lost.

## 6. Rule-of-three padding

"Faster, cleaner, smarter." "It's simple, powerful, and elegant." Real writing rarely lands in tidy triplets. Keep the points that are true; cut the one added for cadence.

- ❌ It makes development simpler, deployment faster, and maintenance easier.
- ✅ The real win is deployment — one command to ship. The rest is marginal.

## 7. Transition and emphasis filler

"It's worth noting that", "Needless to say", "It goes without saying", "Importantly", "Notably", "Of course". Usually deletable with no loss of meaning.

- ❌ It's worth noting that this design has a hidden cost.
- ✅ This design has a hidden cost: every read adds a round trip.

## 8. Empty conclusions

"In conclusion, this is something worth thinking about." "The possibilities are endless." A conclusion with no conclusion. Give a real judgment or stop at the last fact.

- ❌ Ultimately, choosing the right tool matters, and every team should consider it carefully.
- ✅ We picked B — lowest migration cost. That's it.

## 9. Slop vocabulary

Words that mark machine prose. Replace with plain equivalents or cut:

- delve → look at / dig into
- tapestry, landscape, realm, ecosystem (as metaphor) → cut
- "a testament to" → shows / proves
- "navigate the complexities of" → deal with
- "leverage" → use
- "robust", "seamless", "cutting-edge", "game-changer" → say the specific property instead
- em-dash pile-ups used for drama → split into sentences

## 10. Defensive negation stacking

"This should not be read as…", "This is not a universal fix.", "This is not an exhaustive list." Pre-empting misreadings again and again makes a piece sound like it's on trial. Unlike §1, these negations stand alone, with no "it's Y" half.

Test: does the negation rule out a misreading a reader would **actually** have, or draw an operational red line? Then keep it (e.g. "don't use `--insecure` to force a connection"). If it only repeats the heading or anything said earlier, cut it. Keep each red line once in the body, usually the one the author bolded; the opening statement of the thesis doesn't count as a repeat.

A kept negation may be recast as a positive statement, but keep its original role: if the source states a purpose, write the purpose — don't extend it into a diagnostic method or inference the source never gave.

- ❌ The cross-platform page went up on Oct 20. This should not be described as a vulnerability first found on Oct 20. (The heading already dates it to Oct 17.)
- ✅ The cross-platform page published on Oct 20 collects each platform's response.

## 11. "This article" disclaimers

"The fields this article suggests are not a completed audit." "This article has not run these in your environment." Talking about your own piece in the third person reads like compliance boilerplate. "This example", "this post", and "this series" count too. If the author writes as "I" elsewhere, switch to first person; if not, drop the subject, or use "here" when the sentence needs one. Don't let the replacement become a new tic: use any one substitute two or three times at most, and drop the subject or rephrase elsewhere. Keep the author's scope limits and hedges.

- ❌ As of this article's check on Oct 21, public sources do not prove abuse; unknown does not mean it never happened.
- ✅ When I checked on Oct 21, there was no public evidence of abuse — which only means none has surfaced yet.
- ❌ Below are two examples from the incident page; this article has not executed them in the reader's environment.
- ✅ Below are two examples from the incident page. I haven't run them in your environment. (Say it the way a person would, but keep the source's scope: "not in the reader's environment" must not become "never run at all".)

## 12. Stock paragraph-closing warnings

Every paragraph ends the same way: state the facts, then append "but you can't just…", "you still need to prove…", or a scope limit like "this only covers…, not…". Once or twice it's emphasis; every paragraph, it's a cadence readers learn to skip. Keep the one or two that change what the reader does; fold the rest into the paragraph or cut them.

- ❌ Updating the dev toolchain doesn't rewrite deployed binaries. … You can't close this on `go version` alone.
- ✅ Updating the dev toolchain doesn't rewrite deployed binaries: rebuild with the patched toolchain, ship it, and get traffic onto the new process.

## 13. Repeated concessive antithesis

"X is possible, but Y remains." "Give it A, hold back B." Each one alone is a real judgment; used in the opening, headings, body, and ending, the shape becomes a slogan. Keep the one that states the thesis; turn the rest into the concrete action. Headings especially should say what the section contains. Likewise, when every heading uses one shape (all questions, all balanced pairs), vary some; a single question heading with real content stays.

- ❌ (heading) Give it compute, not merge rights
- ✅ (heading) Run it as a shadow job; tsc still gates PRs
- ❌ (ending) If all you can see is speed, it isn't ready to judge CI.
- ✅ (ending) Until every diff is explained, the original TypeScript keeps the CI gate.

## 14. Semicolon chains

Three or four clauses joined by semicolons leave the reader to sort fact from conclusion. Split into one point per sentence. Keep only the relation the source states: if it says two things are related, don't write that one causes the other.

- ❌ If the patch breaks a business endpoint, keep the chain and error evidence first; deleting a widely trusted root may break other valid chains; prefer the vendor's official update, and route any emergency block through change review, limited scope, and a rollback plan.
- ✅ If the patch breaks a business endpoint, keep the chain and error evidence first. Deleting a widely trusted root may break other valid chains. Prefer the vendor's official update. If you must block urgently, go through change review, limit the scope, and prepare a rollback.

## 15. Verification scope scattered across paragraphs

"I didn't rerun this." "I didn't check every repository." "This is the documented rule, not my certification." Scattered at paragraph ends, these are real limits on what the author verified, so priority 2 keeps them, but stating one per paragraph turns into §12's stock closer. Gather them into a scope paragraph near the opening (merge into one if the source has it, add one if not), and leave each paragraph with its findings and technical red lines.

- ❌ (end of paragraph 5) This is still the repository's own retrospective; I didn't recount every rework.
- ❌ (end of paragraph 12) I didn't check the external repository or private settings, so I can't claim the release system has no gate at all.
- ✅ (opening scope paragraph) I didn't run Magpie or rerun its tests, recount every rework, or check the external release repository and private settings. Test results quoted here are the maintainers' own records.
- ✅ (paragraph 12) The main repository's release workflow doesn't check for a green Test run; whether the external release repository does isn't visible.

Keep sentences that are themselves findings in place ("I can confirm the docs require the flag, not that this PR used it"). Keep the source's scope exactly when gathering; don't widen or narrow it.

---

## Audit checklist

After editing, scan once more:

- [ ] No "not just X, it's Y" empty contrast
- [ ] No "let's dive in" / "in today's world" opener
- [ ] No "the truth is / at its core / fundamentally" throat-clearing
- [ ] No colon introducing a generic life lesson
- [ ] Opens on a concrete fact, not a grand backdrop
- [ ] No triplet added purely for rhythm
- [ ] "It's worth noting / needless to say" filler removed
- [ ] Ends on a real judgment or fact, not a platitude
- [ ] Slop words (delve, tapestry, leverage, robust…) gone
- [ ] Standalone negations only where they rule out a real misreading or draw a red line
- [ ] No "this article" self-referential disclaimers
- [ ] Paragraphs don't all close on a "but you can't just…" warning
- [ ] Concessive antithesis kept only for the thesis; headings state content
- [ ] No three- or four-clause semicolon chains
- [ ] Unverified scope gathered in the opening scope paragraph; paragraphs keep findings and red lines
- [ ] Facts, numbers, terms, model names untouched
- [ ] Author's hedges, tone, and stance preserved
