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
6. When diagrams or structured data are included, consult `docs/diagram-guide.md` and enforce the **Anti-Patterns & Prose-Diagram Synergy** rules:
   - Ensure diagrams use the decoupled Row Card pattern with ample whitespace (viewBox height >= 500px, text >= 12.5px);
   - Ban messy text bullet dumps right after diagrams; always use neatly structured markdown comparison tables for parameters and complexity.
7. Enforce **Table vs. Structured Prose** layout boundaries:
   - Ban "overstuffed multi-column prose tables": Markdown tables must be kept to 2 to 4 columns maximum, and used strictly for concise parameters, numerical metrics, types, or short comparison attributes.
   - Never cram multiple long narrative sentences (e.g., scenario context, model judgment, downstream action, caveats) across 4+ table columns, which causes unbearable horizontal cramming and wrapping.
   - For multi-dimensional case catalogs, scenario atlases, or system components, use **"High-level 2-3 column index table + Structured Module Cards (h3/h4 with clean Key-Value lists)"** or thematic clusters with ample whitespace to ensure excellent readability across mobile and desktop.
8. When a cover is requested, follow Cover Direction below after the article direction is stable.
9. Run the narrowest relevant repository check after changing files. Follow the publication checklist in `docs/content-guide.md` only when publication is requested.

## Cover Direction

Before generating covers, inspect the nearest published covers and make a compact cover matrix with one row per target: visual metaphor, medium, composition, dominant palette, and lighting or mood.

- Project covers use a Tarot or collectible trading-card visual: an ornate 4:5 card frame and one project-specific archetype or metaphor. Generate this representative card art rather than a generic product illustration; avoid text, logos, and copyrighted characters.
- Keep series cohesion to at most two anchors, such as aspect ratio and one accent color.
- For a series, make neighboring rows differ on at least three matrix columns before generation. For one cover, choose a combination that does not repeat the nearest cover's medium, composition, and palette together.
- Generate one prompt per cover with the `imagegen` skill after the matrix is distinct.
- Review the results together at card size as well as individually. Finish only when the set reads as related subjects rather than one template with swapped symbols.
- Save project covers under `src/assets`, write informative `coverAlt`, and verify dimensions, unintended text or logos, and the consuming frontmatter.

## Completion

Finish when every applicable content-guide rule is satisfied, factual claims are traceable, changed frontmatter validates, and the response reports only checks actually run.
