# English narrative rules

Apply to passages that tell what happened: incident stories, debugging journeys, dev logs, personal experience, fiction, dialogue. Use alongside `en.md`; inside narrative passages this file takes precedence over the "delete the shell" and "rebuild" steps in SKILL.md.

## Contents

1. What narrative keeps
2. Named emotions
3. Stock description
4. Epiphany endings
5. Expository dialogue
6. Narrator foreshadowing
7. The ordinary-day opener
8. Uniform rhythm and one-line paragraphs

---

## 1. What narrative keeps

In narrative, substance includes **beats**, concrete images, dialogue, and the narrator's voice — not only facts and judgments. These look like shell but are the story's skeleton. Keep them:

- **Chronology**: tell events in the order they happened. Do not turn a nonfiction story into a list of lessons or flip it into conclusion-first unless the source already does.
- **Scene and sensory detail**: the concrete picture in the source (the 2 a.m. alert, red text in the terminal) is substance. `en.md` §2 and §5 cut grand backdrops unrelated to the topic; a scene opening is not one.
- **Sentence rhythm**: the author's mix of long and short sentences is their voice. Do not chop everything short.
- **Deliberate repetition**: a line that opens and closes a passage, three knocks at a door. `en.md` §6 targets triplets added for cadence, not repetition doing narrative work.
- **Open endings**: stopping on an image or action is a real ending. `en.md` §8's "stop at the last fact" means, in narrative, stop at the last beat — no summary line.
- **Spoken dialogue**: characters may speak in fragments, repeat themselves, get things wrong. Do not polish speech into prose.

When reworking an emotion or description, use only details already in the source, or cut the label. Never invent actions, scenes, or plot.

## 2. Named emotions

"A wave of relief washed over her." "He felt a pang of guilt." "I was overwhelmed with frustration." Naming the emotion hands the reader a label instead of the experience.

- ❌ When the tests finally passed, I felt an indescribable sense of accomplishment.
- ✅ The tests passed. I stared at the screen for ten seconds before remembering to commit. (Only if the source has the staring; otherwise just "The tests passed.")

In nonfiction, a feeling the author states plainly as their own ("honestly, I panicked") is stance — priority 2 — and stays. Cut the stock emotional phrasing, not the admission.

## 3. Stock description

"The air was thick with tension." "A smile tugged at the corner of her lips." "Something flickered in his eyes." "Time seemed to stand still." "She let out a breath she didn't know she was holding." Readers skim these on sight. Dense "a hint of", "a flicker of", "a trace of" is the same problem.

- ❌ The air in the meeting room was thick with tension, and a flicker of unease crossed his face.
- ✅ Nobody in the meeting room spoke. He uncapped his pen and capped it again. (Again, only details from the source; without them, "Nobody spoke." is enough.)

## 4. Epiphany endings

"In that moment, I realized…" "This experience taught me…" "Maybe that's what growing up means." Appending a moral to a finished story says the writer doesn't trust the reader.

- ❌ After the fix, I finally understood that attention to detail is an engineer's most important trait.
- ✅ After the fix, I added a "timezone checked?" box to our PR template.

If the author actually changed what they do, keep that concrete change (as in `en.md` §4). If all that's left is a moral, cut it and let the story end on its last beat.

## 5. Expository dialogue

Characters tell each other what both already know, or narrate their own psychology: "As you know, we've worked together for ten years, and I've always trusted you."

- ❌ "I'm angry because you changed the schema again without telling me."
- ✅ "Schema changed again?" "Yeah." "Who did it?"

Fix only the exposition: delete the "as you know" frame and any clause where speakers explain their own feelings. Keep the remaining words as written, in their original order, with no new rhetoric.

## 6. Narrator foreshadowing

"Little did they know, this was only the beginning." "Fate had other plans." "But things weren't that simple." Announcing the twist in advance kills it.

- ❌ I thought it was a small bug. I was wrong.
- ✅ I thought it was a small bug and estimated half an hour. It took three days.

## 7. The ordinary-day opener

"It was just another ordinary Tuesday afternoon — until…" "Our story begins three years ago." Staging calm so it can be broken is the most common AI opener for tech stories. Start at the first event.

- ❌ It was a quiet Friday evening, and I was about to log off, unaware of the storm brewing.
- ✅ Friday, 7 p.m., about to log off. PagerDuty went off.

## 8. Uniform rhythm and one-line paragraphs

Every paragraph the same length, every paragraph closing on a short punch, or "Everything changed." standing alone again and again. A one-line paragraph lands when it is rare; everywhere, it becomes the only rhythm.

- ❌ I redeployed. (break) Still failing. (break) I started questioning everything.
- ✅ I redeployed and it still failed. By the third failure I was reading the logs line by line.

Keep the rhythm variation the source already has; fix only the cadence the AI imposed.

---

## Audit checklist

After editing narrative passages, scan once more:

- [ ] Events, order, names, and setting unchanged; no new plot or detail added
- [ ] Chronology intact, not converted into a list of lessons
- [ ] Source scenes, images, dialogue, and deliberate repetition still present
- [ ] No stock named emotions (wave of relief, pang of guilt)
- [ ] No stock description (air thick with, flicker of, breath she didn't know)
- [ ] No epiphany or moral appended to the ending
- [ ] Dialogue doesn't explain what both speakers already know
- [ ] No "little did they know / I was wrong" foreshadowing
- [ ] No "just another ordinary day — until" opener
- [ ] Sentence and paragraph lengths vary; one-line paragraphs are rare
