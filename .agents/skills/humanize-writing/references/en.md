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
- [ ] Facts, numbers, terms, model names untouched
- [ ] Author's hedges, tone, and stance preserved
