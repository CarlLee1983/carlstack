const mermaidFence = /^```mermaid\b/m;

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
