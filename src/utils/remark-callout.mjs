/** GitHub alert 語法對應的中文標籤；未列出的標記不轉換。 */
const KINDS = new Map([
  ["note", "備註"],
  ["tip", "提示"],
  ["important", "重點"],
  ["warning", "注意"],
  ["caution", "警告"],
]);
const MARKER = /^\[!([A-Za-z]+)\][ \t]*\n?/;

/**
 * 把 `> [!NOTE]` 開頭的引言轉成 aside callout。
 * 走 remark 而不是 MDX 元件，md 與 mdx 才有同一套寫法。
 */
export default function remarkCallout() {
  /** @param {MdastNode} tree */
  return (tree) => {
    transform(tree);
  };
}

/**
 * mdast 節點的 data 型別因節點種類而異，這裡只需要能寫入 hName/hProperties。
 * @typedef {{ type?: string, value?: string, data?: any, children?: MdastNode[] }} MdastNode
 */

/** @param {MdastNode} node */
function transform(node) {
  if (!node || typeof node !== "object" || !Array.isArray(node.children)) {
    return;
  }
  for (const child of node.children) {
    transform(child);
    if (child?.type === "blockquote") toCallout(child);
  }
}

/** @param {MdastNode} blockquote */
function toCallout(blockquote) {
  const paragraph = blockquote.children?.[0];
  if (paragraph?.type !== "paragraph" || !Array.isArray(paragraph.children)) {
    return;
  }
  const lead = paragraph.children?.[0];
  if (lead?.type !== "text" || typeof lead.value !== "string") return;
  const match = MARKER.exec(lead.value);
  if (!match) return;
  const kind = (match[1] ?? "").toLowerCase();
  const label = KINDS.get(kind);
  if (!label) return;

  lead.value = lead.value.slice(match[0].length);
  stripLeadingBreak(paragraph, lead);
  if (isEmptyParagraph(paragraph)) blockquote.children?.shift();

  blockquote.data = {
    hName: "aside",
    hProperties: { className: ["callout", `callout--${kind}`] },
  };
  blockquote.children?.unshift({
    type: "paragraph",
    data: { hProperties: { className: "callout__label" } },
    children: [{ type: "text", value: label }],
  });
}

/**
 * 標記獨立一行時，後面會多一個 break 節點。
 * @param {MdastNode} paragraph
 * @param {MdastNode} lead
 */
function stripLeadingBreak(paragraph, lead) {
  if (lead.value !== "" || !paragraph.children) return;
  paragraph.children.shift();
  if (paragraph.children[0]?.type === "break") paragraph.children.shift();
}

/** @param {MdastNode} paragraph */
function isEmptyParagraph(paragraph) {
  return (paragraph.children ?? []).every(
    (child) => child.type === "text" && !child.value?.trim(),
  );
}
