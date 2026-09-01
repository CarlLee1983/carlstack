import assert from "node:assert/strict";
import test from "node:test";
import rehypeHeadingAnchor from "../src/utils/rehype-heading-anchor.mjs";

interface HastNode {
  type: string;
  tagName: string;
  properties: Record<string, unknown>;
  children: HastNode[];
}

const heading = (tagName: string, id?: string): HastNode => ({
  type: "element",
  tagName,
  properties: id ? { id } : {},
  children: [{ type: "text", tagName: "", properties: {}, children: [] }],
});
const run = (tree: HastNode): HastNode => {
  rehypeHeadingAnchor()(tree);
  return tree;
};
const root = (children: HastNode[]): HastNode => ({
  type: "root",
  tagName: "root",
  properties: {},
  children,
});

test("h2 到 h4 補上指向自己的錨點連結", () => {
  const tree = run(root([heading("h2", "a"), heading("h4", "d")]));
  for (const node of tree.children) {
    const anchor = node.children.at(-1)!;
    assert.equal(anchor.tagName, "a");
    assert.equal(anchor.properties.href, `#${node.properties.id}`);
    assert.equal(anchor.properties.className, "heading-anchor");
    assert.equal(anchor.properties["aria-hidden"], "true");
    assert.equal(anchor.properties.tabIndex, -1);
  }
});

test("沒有 id 的標題不動", () => {
  const tree = run(root([heading("h2")]));
  assert.equal(tree.children[0]!.children.length, 1);
});

test("h1 與 h5 不加錨點", () => {
  const tree = run(root([heading("h1", "x"), heading("h5", "y")]));
  assert.equal(tree.children[0]!.children.length, 1);
  assert.equal(tree.children[1]!.children.length, 1);
});

test("重複執行不會疊加錨點", () => {
  const tree = run(root([heading("h2", "a")]));
  run(tree);
  assert.equal(tree.children[0]!.children.length, 2);
});
