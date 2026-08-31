/** @param {string} value */
function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export default function remarkMermaid() {
  /** @param {RemarkNode} tree */
  return (tree) => {
    visit(tree);
  };
}

/**
 * @typedef {{ type?: string, lang?: string | null, meta?: string | null, value?: string, children?: RemarkNode[] }} RemarkNode
 */

/** @param {RemarkNode | undefined} node */
function visit(node) {
  if (!node || typeof node !== "object") return;
  if (
    node.type === "code" &&
    node.lang === "mermaid" &&
    typeof node.value === "string"
  ) {
    node.type = "html";
    node.value = `<pre class="mermaid-source" data-pagefind-ignore>${escapeHtml(node.value)}</pre>`;
    delete node.lang;
    delete node.meta;
    return;
  }
  if (Array.isArray(node.children)) node.children.forEach(visit);
}
