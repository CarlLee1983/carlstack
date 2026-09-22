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

test("為表格單元格注入 data-label 屬性以支援行動端卡片化", () => {
  const textNode = (value: string): HastNode =>
    ({
      type: "text",
      value,
    }) as unknown as HastNode;

  const th1 = element("th", [textNode("指標")]);
  const th2 = element("th", [textNode("說明")]);
  const trHead = element("tr", [th1, th2]);
  const thead = element("thead", [trHead]);

  const td1 = element("td", [textNode("延遲")]);
  const td2 = element("td", [textNode("低於 5ms")]);
  const trBody = element("tr", [td1, td2]);
  const tbody = element("tbody", [trBody]);

  const table = element("table", [thead, tbody]);
  const tree = run(element("root", [table]));

  const wrappedTable = at(tree, 0, 0);
  const bodyRow = at(wrappedTable, 1, 0);
  const cell1 = at(bodyRow, 0);
  const cell2 = at(bodyRow, 1);

  assert.equal(cell1.properties["data-label"], "指標");
  assert.equal(cell2.properties["data-label"], "說明");
});
