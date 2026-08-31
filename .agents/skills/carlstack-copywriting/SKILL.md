---
name: carlstack-copywriting
description: 撰寫或修改 CarlStack 的繁體中文技術文章、專案介紹、標題、SEO 摘要與差異化文章封面；處理 src/content/blog、src/content/projects 或系列封面時使用。
---

# CarlStack Copywriting

## Workflow

1. Read `docs/content-guide.md` from the repository root. Treat it as the authoritative source for content rules.
2. Identify the deliverable as a blog article or project page. Read the target file and the nearest comparable published item in the same collection for voice and structure.
3. Ground every factual claim in user-provided material, repository evidence, or a cited source. Preserve the author's meaning and links when editing existing copy.
4. When creating or changing a content file, consult `src/content.config.ts` for the current frontmatter contract instead of relying on a copied schema.
5. Draft or revise the smallest requested scope. Keep the writing concrete about constraints, choices, verification, and results.
6. When a cover is requested, follow Cover Direction below after the article direction is stable.
7. Run the narrowest relevant repository check after changing files. Follow the publication checklist in `docs/content-guide.md` only when publication is requested.

## Cover Direction

Before generating covers, inspect the nearest published covers and make a compact cover matrix with one row per target: visual metaphor, medium, composition, dominant palette, and lighting or mood.

- Keep series cohesion to at most two anchors, such as aspect ratio and one accent color.
- For a series, make neighboring rows differ on at least three matrix columns before generation. For one cover, choose a combination that does not repeat the nearest cover's medium, composition, and palette together.
- Generate one prompt per cover with the `imagegen` skill after the matrix is distinct.
- Review the results together at card size as well as individually. Finish only when the set reads as related subjects rather than one template with swapped symbols.
- Save project covers under `src/assets`, write informative `coverAlt`, and verify dimensions, unintended text or logos, and the consuming frontmatter.

## Completion

Finish when every applicable content-guide rule is satisfied, factual claims are traceable, changed frontmatter validates, and the response reports only checks actually run.
