import assert from "node:assert/strict";
import test from "node:test";
import rehypeTableScroll from "../src/utils/rehype-table-scroll.mjs";

interface HastNode {
  type: string;
  tagName: string;
  properties: Record<string, unknown>;
  children: HastNode[];
}

const element = (tagName: string, children: HastNode[] = []): HastNode => ({
  type: tagName === "root" ? "root" : "element",
  tagName,
  properties: {},
  children,
});
const run = (tree: HastNode): HastNode => {
  rehypeTableScroll()(tree);
  return tree;
};
const at = (node: HastNode, ...path: number[]): HastNode =>
  path.reduce((current, index) => {
    const next = current.children[index];
    assert.ok(next, `路徑 ${path.join("/")} 不存在`);
    return next;
  }, node);

test("表格被包進可水平捲動的容器", () => {
  const tree = run(element("root", [element("p"), element("table")]));
  const wrapper = at(tree, 1);
  assert.equal(wrapper.tagName, "div");
  assert.equal(wrapper.properties.className, "table-scroll");
  assert.equal(wrapper.properties.tabIndex, 0);
  assert.equal(wrapper.properties.role, "region");
  assert.equal(typeof wrapper.properties["aria-label"], "string");
  assert.equal(at(wrapper, 0).tagName, "table");
});

test("巢狀在其他元素裡的表格同樣被包住", () => {
  const tree = run(
    element("root", [element("blockquote", [element("table")])]),
  );
  assert.equal(at(tree, 0, 0).tagName, "div");
  assert.equal(at(tree, 0, 0, 0).tagName, "table");
});

test("已經包過的表格不會再包一層", () => {
  const tree = run(element("root", [element("table")]));
  run(tree);
  assert.equal(tree.children.length, 1);
  assert.equal(at(tree, 0).tagName, "div");
  assert.equal(at(tree, 0, 0).tagName, "table");
  assert.equal(at(tree, 0, 0).children.length, 0);
});

test("沒有表格時不改動樹狀結構", () => {
  const tree = run(element("root", [element("p")]));
  assert.equal(tree.children.length, 1);
  assert.equal(at(tree, 0).tagName, "p");
});
