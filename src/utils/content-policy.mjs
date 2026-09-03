const mermaidFence = /^```mermaid\b/m;

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
 * Policy that applies only to newly added or changed article source files.
 * Existing articles retain their historical rendering until they are updated.
 *
 * @param {string} file
 * @param {string} source
 */
export function changedArticlePolicyViolations(file, source) {
  if (!mermaidFence.test(source)) return [];

  return [
    `${file}: use a native SVG or an Astro SVG component instead of a Mermaid fence.`,
  ];
}
