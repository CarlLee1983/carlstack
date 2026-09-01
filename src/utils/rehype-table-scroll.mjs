const WRAPPER_CLASS = "table-scroll";

/**
 * 把表格包進可水平捲動的容器，避免寬表在窄視窗撐破版面。
 * role="region" + tabindex 讓鍵盤使用者也能捲動。
 */
export default function rehypeTableScroll() {
  /** @param {HastNode} tree */
  return (tree) => {
    wrapTables(tree);
  };
}

/**
 * @typedef {{ type: string, tagName?: string, properties?: Record<string, unknown>, children?: HastNode[] }} HastNode
 */

/** @param {HastNode} node */
function wrapTables(node) {
  if (!node || typeof node !== "object" || !Array.isArray(node.children)) {
    return;
  }
  node.children = node.children.map((child) => {
    wrapTables(child);
    if (child?.type !== "element" || child.tagName !== "table") return child;
    if (isWrapper(node)) return child;
    return {
      type: "element",
      tagName: "div",
      properties: {
        className: WRAPPER_CLASS,
        role: "region",
        tabIndex: 0,
        "aria-label": "表格，可水平捲動",
      },
      children: [child],
    };
  });
}

/** @param {HastNode} node */
function isWrapper(node) {
  return (
    node.type === "element" && node.properties?.className === WRAPPER_CLASS
  );
}
