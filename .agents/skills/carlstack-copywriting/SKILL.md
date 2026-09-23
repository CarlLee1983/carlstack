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
   - Ensure diagrams use the decoupled Row Card pattern with ample whitespace (viewBox height >= 540px ~ 600px, main title >= 18px, lead text >= 14px, body text >= 13px);
   - **Ban Quadrant Grid Cramming (嚴禁四象限擁擠硬塞)**: When mapping dual-axis matrices (e.g. Core/Supporting/Generic or Value/Complexity), never force a 2x2 cramped grid. Always deconstruct into **"Top Dimension Banner + Independent Multi-Column Cards (Three/Four-Column Layout) + Bottom Warning/Anti-Pattern Row"**;
   - Ban unstructured raw text dumps; use structured cards or crisp key-value blocks with dedicated allocation/meta boxes to break down parameters and complexity.
7. **Avoid Markdown Tables; Prefer Structured Prose & Cards (全面避免使用 Table)**:
   - Markdown 表格在響應式網頁（特別是窄螢幕手機與行動裝置）極易造成水平捲動、單元格文字過度擠壓或破碎折行，嚴重損害閱讀體驗與視覺節奏。
   - **能用結構化清單、模組卡片或段落呈現時，一律不使用 Table**。
   - 案例庫、場景圖譜、多維度對比、架構權衡與工作流分工，一律採用「**模組小標（h3/h4/h5）搭配粗體鍵值清單（`- **維度**：說明`）**」或主題叢集（Thematic Clusters）。
   - 只有在極少數純數值矩陣或無歧義的短鍵值對照時，才在無其他排版替代時審慎評估；大原則一律維持「非必要不使用 Table」。
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
