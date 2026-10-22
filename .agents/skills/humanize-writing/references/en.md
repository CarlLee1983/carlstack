# English banned patterns

Apply when the body text is predominantly English. Each item says why it's cut, then shows a before/after. Keep the author's own register: casual stays casual.

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
16. Significance inflation and -ing tails
17. Vague attribution
18. Promotional tone
19. Copula avoidance
20. Challenges-and-outlook section
21. Chatbot residue
22. Hedge stacking
23. False ranges
24. Synonym cycling
25. Formatting: bold, inline-header lists, emoji, Title Case

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
- ✅ I wired up three LLM APIs last week. Here's what differed.

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
- ✅ The real win is deployment: one command to ship. The rest is marginal.

## 7. Transition and emphasis filler

"It's worth noting that", "Needless to say", "It goes without saying", "Importantly", "Notably", "Of course". Usually deletable with no loss of meaning.

- ❌ It's worth noting that this design has a hidden cost.
- ✅ This design has a hidden cost: every read adds a round trip.

## 8. Empty conclusions

"In conclusion, this is something worth thinking about." "The possibilities are endless." A conclusion with no conclusion. Give a real judgment or stop at the last fact.

- ❌ Ultimately, choosing the right tool matters, and every team should consider it carefully.
- ✅ We picked B, the one with the lowest migration cost. That's it.

## 9. Slop vocabulary

Words that mark machine prose. Replace with plain equivalents or cut:

- delve → look at / dig into
- tapestry, landscape, realm, ecosystem (as metaphor) → cut
- "a testament to" → see §16 (the tail is cut, not swapped for a synonym)
- "navigate the complexities of" → deal with
- "leverage" → use
- "robust", "seamless", "cutting-edge", "game-changer" → say the specific property instead
- em-dash pile-ups used for drama → split into sentences

## 10. Defensive negation stacking

"This should not be read as…", "This is not a universal fix.", "This is not an exhaustive list." Pre-empting misreadings again and again makes a piece sound like it's on trial. Unlike §1, these negations stand alone, with no "it's Y" half.

Test: does the negation rule out a misreading a reader would **actually** have, or draw an operational red line? Then keep it (e.g. "don't use `--insecure` to force a connection"). If it only repeats the heading or anything said earlier, cut it. Keep each red line once in the body, usually the one the author bolded; the opening statement of the thesis doesn't count as a repeat.

A kept negation may be recast as a positive statement, but keep its original role: if the source states a purpose, write the purpose, and don't extend it into a diagnostic method or inference the source never gave.

- ❌ The cross-platform page went up on Oct 20. This should not be described as a vulnerability first found on Oct 20. (The heading already dates it to Oct 17.)
- ✅ The cross-platform page published on Oct 20 collects each platform's response.

## 11. "This article" disclaimers

"The fields this article suggests are not a completed audit." "This article has not run these in your environment." Talking about your own piece in the third person reads like compliance boilerplate. "This example", "this post", and "this series" count too. If the author writes as "I" elsewhere, switch to first person; if not, drop the subject, or use "here" when the sentence needs one. Don't let the replacement become a new tic: use any one substitute two or three times at most, and drop the subject or rephrase elsewhere. Keep the author's scope limits and hedges.

- ❌ As of this article's check on Oct 21, public sources do not prove abuse; unknown does not mean it never happened.
- ✅ When I checked on Oct 21, there was no public evidence of abuse, which only means none has surfaced yet.
- ❌ Below are two examples from the incident page; this article has not executed them in the reader's environment.
- ✅ Below are two examples from the incident page. I haven't run them in your environment. (Say it the way a person would, but keep the source's scope: "not in the reader's environment" must not become "never run at all".)

## 12. Stock paragraph-closing warnings

Every paragraph ends the same way: state the facts, then append "but you can't just…", "you still need to prove…", or a scope limit like "this only covers…, not…". Once or twice it's emphasis; every paragraph, it's a cadence readers learn to skip. Keep the one or two that change what the reader does; fold the rest into the paragraph or cut them.

- ❌ Updating the dev toolchain doesn't rewrite deployed binaries. … You can't close this on `go version` alone.
- ✅ Updating the dev toolchain doesn't rewrite deployed binaries: rebuild with the patched toolchain, ship it, and get traffic onto the new process.

## 13. Repeated concessive antithesis

"X is possible, but Y remains." "Give it A, hold back B." Each one alone is a real judgment; used in the opening, headings, body, and ending, the shape becomes a slogan. Keep the one that states the thesis; turn the rest into the concrete action. Article subheadings especially should say what the section contains: a slogan-style or signboard-style subheading inside an article gets rewritten to say the content too (❌ Make "done" expensive ✅ Done needs three proofs: PR merged, deploy succeeded, ten clean minutes in monitoring), and "it is the author's voice" is not a reason to keep it. For interface headings see `interface-copy.md`. Likewise, when every heading uses one shape (all questions, all balanced pairs), vary some; a single question heading with real content stays.

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

## 16. Significance inflation and -ing tails

A plain fact gets a trailing clause about what it "represents": "marking a pivotal moment", "underscoring its importance", "reflecting a broader trend", "a testament to", "laying the groundwork for", "leaving an indelible mark". The tail adds no fact. If nobody claimed that significance, delete the tail.

Rewording the same move still counts. "Serves as a testament to our commitment" changed to "shows how seriously we take quality" is the same inflation in a different coat; the layer of meaning behind the fact is still unclaimed, so it goes.

- ❌ The v2 API launched in March, marking a pivotal moment and underscoring the team's commitment to quality.
- ❌ The v2 API launched in March, which shows how seriously we take quality.
- ✅ The v2 API launched in March; v1 endpoints shut down in June.

If someone actually claimed the significance, quote them and name them.

## 17. Vague attribution

"Experts argue", "Industry reports suggest", "Observers note", "Many developers say". These borrow authority without giving a source. Name the source the author gave, or turn the line into the author's own judgment. Never supply a source the author didn't.

- ❌ Experts believe this architecture scales better.
- ✅ Shopify's 2023 engineering post says their modular monolith halved deploy time.
- ✅ I think this architecture scales better, based on our load test. (Only when the source gave that basis.)

## 18. Promotional tone

"Nestled in", "vibrant", "rich heritage", "breathtaking", "must-visit", "renowned", "boasts". Travel-brochure adjectives in non-advertising text. Replace them with checkable facts: where, how big, what it does.

- ❌ Nestled in the heart of Taipei, this vibrant startup boasts breathtaking engineering talent.
- ✅ The startup is in Xinyi, twelve people, building logistics scheduling.

## 19. Copula avoidance

"Serves as", "stands as", "functions as", "features" where "is" or "has" would do. The fancy verb adds no meaning, only a register that reads as machine prose.

- ❌ Redis serves as the caching layer and features three nodes.
- ✅ Redis is the caching layer. It has three nodes.

## 20. Challenges-and-outlook section

"Despite its challenges, X continues to thrive." "Challenges and future outlook." A formula paragraph appended regardless of topic. If the source has real problems, write them as events (when, how bad, what was done) and drop the "despite… continues" frame. This is the section-level cousin of §8 (empty conclusions) and §13 (concessive antithesis); the test is the same: keep what states a fact, cut the frame.

- ❌ Despite facing challenges such as staffing, the team continues to innovate, and the future looks bright.
- ✅ Two people maintain fourteen integrations; the next one is scheduled for Q4.

## 21. Chatbot residue

Conversation scaffolding pasted into the deliverable: "Great question!", "You're absolutely right", "Here is an overview of…", "I hope this helps!", "Let me know if you'd like me to expand on any section", and knowledge-cutoff disclaimers ("As of my last update…", "While specific details are limited…"). Delete them and start at the first fact. Keep the author's own uncertainty if it was theirs.

- ❌ Great question! Here is an overview of the three options. I hope this helps!
- ✅ Option A costs the least to migrate; B has the better tooling.

## 22. Hedge stacking

Several hedges on one claim: "could potentially possibly be argued to have some effect". Cut to one layer, and make that layer carry the strength of the whole original sentence: no stronger (the hedge must not turn into an assertion) and no weaker (a firm "likely" must not become "might"). The author's uncertainty stays; only the repeats go.

- ❌ This could potentially possibly be argued to have some effect on latency.
- ✅ This may affect latency.
- ❌ (source: "I think it probably helps, though I'm not sure") It helps.
- ✅ It probably helps. (One hedge, still unsure; not "It helps" and not "It might help a little".)

This sits under priority 2 of SKILL.md: when in doubt, keep the hedge.

## 23. False ranges

"From the Big Bang to dark matter, from team culture to deploy pipelines." X and Y sit on different scales and only fake breadth. List what is actually covered.

- ❌ The talk ranges from team culture to deploy pipelines to the future of work.
- ✅ The talk covers on-call rotation and how we cut deploys from 40 to 12 minutes.

## 24. Synonym cycling

"The protagonist… the main character… the central figure… the hero" for one referent. Repeat the same noun; readers take a new word as a new thing. Deliberate repetition in narrative passages is governed by `narrative-en.md` and is not affected.

- ❌ The scheduler failed twice. The orchestrator then restarted, and the dispatcher lost its queue.
- ✅ The scheduler failed twice. It restarted and lost its queue. (When all three names are the same component.)

## 25. Formatting: bold, inline-header lists, emoji, Title Case

Applies when prose has been chopped into slide format. Leave real docs (READMEs, specs, parameter lists) as they are.

- Bold sprinkled across a paragraph: at most one, usually none.
- `- **Performance:** Performance was improved by…` (header restated by the body): one plain sentence with the actual number.
- Emoji decorating headings or bullets: remove, unless it is a social post and the author uses them.
- Headings In Title Case: sentence case, unless the source's style guide says otherwise.

- ❌ `- **Speed:** Speed was improved significantly.`
- ✅ Builds now take 40s instead of 90s.

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
- [ ] Concessive antithesis kept only for the thesis; article subheadings state content (slogan subheadings too; interface headings are exempt, see `interface-copy.md`)
- [ ] No three- or four-clause semicolon chains
- [ ] Unverified scope gathered in the opening scope paragraph; paragraphs keep findings and red lines
- [ ] No "marking / underscoring / a testament to" tail on plain facts, reworded or not
- [ ] Every "experts say" has a named source, or became the author's own claim
- [ ] No brochure adjectives (nestled, vibrant, breathtaking) in non-advertising text
- [ ] "is / has" instead of "serves as / stands as / features"
- [ ] No formula challenges-and-outlook paragraph
- [ ] No chatbot residue or knowledge-cutoff disclaimer
- [ ] One hedge, not three, at the original strength
- [ ] No false ranges; one name per referent outside narrative
- [ ] Prose not chopped into bold-header bullets; no emoji or bold confetti; sentence-case headings
- [ ] Facts, numbers, terms, model names untouched
- [ ] Author's hedges, tone, and stance preserved
