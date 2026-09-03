const mermaidFence = /^```mermaid\b/m;

const codeFence = /^\s*(```|~~~)/;
const inlineCode = /`[^`\n]*`/g;

/**
 * A `$…$` span carrying a LaTeX control sequence (`\log`) or a sub/superscript
 * (`RT_1`). The site loads neither remark-math nor KaTeX, so such a span is
 * rendered verbatim and reaches the reader as broken characters.
 *
 * Deliberately partial: `$O(1)$` and `$N$` are also unrendered LaTeX, but they
 * are indistinguishable from a line quoting two dollar amounts — the storage
 * cost table writes `$$$ (最高) | $$ (中等) | $ (最低)`, and a settlement
 * article writes `$0.01`. Broadening this pattern to catch them flags those as
 * violations, so the gate covers the unambiguous half and the guidance in
 * docs/content-guide.md covers the rest. Do not widen it without a way to tell
 * the two apart.
 */
const latexSpan =
  /\$[^$\n]{0,80}?(?:\\[A-Za-z]+|[_^]\{?[A-Za-z0-9])[^$\n]{0,80}?\$/;

/**
 * Resolve the diff base from a script's CLI arguments.
 *
 * npm and pnpm forward `--` ahead of a script's own arguments, so the
 * documented `pnpm content:policy -- HEAD` arrives as `["--", "HEAD"]`.
 * Treating that separator as the base silently compares nothing and lets
 * every violation through, so it must be dropped before reading the base.
 *
 * @param {string[]} argv arguments after the script path
 */
export function resolvePolicyBase(argv) {
  return argv.find((arg) => arg !== "--") ?? "HEAD";
}

/**
 * Line numbers holding an unrendered LaTeX span, ignoring fenced code blocks
 * and inline code — a `$` inside those is a shell prompt, a template literal,
 * a GraphQL variable or an argon2 hash, never math.
 *
 * @param {string} source
 */
function latexLines(source) {
  /** @type {number[]} */
  const hits = [];
  /** @type {string | null} */
  let fence = null;

  source.split("\n").forEach((line, index) => {
    const marker = codeFence.exec(line);
    if (marker) {
      if (fence === null) fence = marker[1] ?? null;
      else if (line.trim().startsWith(fence)) fence = null;
      return;
    }
    if (fence !== null) return;
    if (latexSpan.test(line.replace(inlineCode, ""))) hits.push(index + 1);
  });

  return hits;
}

/**
 * Policy that applies only to newly added or changed article source files.
 * Existing articles retain their historical rendering until they are updated.
 *
 * @param {string} file
 * @param {string} source
 */
export function changedArticlePolicyViolations(file, source) {
  const violations = [];

  if (mermaidFence.test(source)) {
    violations.push(
      `${file}: use a native SVG or an Astro SVG component instead of a Mermaid fence.`,
    );
  }

  const latex = latexLines(source);
  if (latex.length > 0) {
    violations.push(
      `${file}: LaTeX at line ${latex.join(", ")}; the site renders no math, use inline code or Unicode instead.`,
    );
  }

  return violations;
}
