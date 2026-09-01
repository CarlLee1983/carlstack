const ANCHOR_CLASS = "heading-anchor";
const HEADINGS = new Set(["h2", "h3", "h4"]);

/**
 * 為已經有 id 的標題補一個指向自己的錨點連結，方便分享段落。
 * aria-hidden + tabIndex -1：純視覺輔助，不進入朗讀與 Tab 序。
 */
export default function rehypeHeadingAnchor() {
  /** @param {HastNode} tree */
  return (tree) => {
    addAnchors(tree);
  };
}

/**
 * @typedef {{ type: string, tagName?: string, value?: string, properties?: Record<string, unknown>, children?: HastNode[] }} HastNode
 */

/** @param {HastNode} node */
function addAnchors(node) {
  if (!node || typeof node !== "object" || !Array.isArray(node.children)) {
    return;
  }
  for (const child of node.children) {
    addAnchors(child);
    if (child?.type !== "element" || !HEADINGS.has(child.tagName ?? "")) {
      continue;
    }
    const id = child.properties?.id;
    if (typeof id !== "string" || !id) continue;
    if (hasAnchor(child)) continue;
    child.children = [
      ...(child.children ?? []),
      {
        type: "element",
        tagName: "a",
        properties: {
          className: ANCHOR_CLASS,
          href: `#${id}`,
          "aria-hidden": "true",
          tabIndex: -1,
        },
        children: [{ type: "text", value: "#" }],
      },
    ];
  }
}

/** @param {HastNode} heading */
function hasAnchor(heading) {
  return (heading.children ?? []).some(
    (child) => child.properties?.className === ANCHOR_CLASS,
  );
}
