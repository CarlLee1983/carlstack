import assert from "node:assert/strict";
import test from "node:test";
import remarkCallout from "../src/utils/remark-callout.mjs";

interface MdastNode {
  type: string;
  value?: string;
  data?: { hName?: string; hProperties?: Record<string, unknown> };
  children?: MdastNode[];
}

const text = (value: string): MdastNode => ({ type: "text", value });
const paragraph = (...children: MdastNode[]): MdastNode => ({
  type: "paragraph",
  children,
});
const blockquote = (...children: MdastNode[]): MdastNode => ({
  type: "blockquote",
  children,
});
const root = (...children: MdastNode[]): MdastNode => ({
  type: "root",
  children,
});
const run = (tree: MdastNode): MdastNode => {
  remarkCallout()(tree);
  return tree;
};
const first = (tree: MdastNode): MdastNode => {
  const node = tree.children?.[0];
  assert.ok(node);
  return node;
};

test("標記獨立一行時轉成 aside 並補上標籤", () => {
  const tree = run(
    root(
      blockquote(paragraph(text("[!NOTE]"), { type: "break" }, text("內容"))),
    ),
  );
  const callout = first(tree);
  assert.equal(callout.data?.hName, "aside");
  assert.deepEqual(callout.data?.hProperties?.className, [
    "callout",
    "callout--note",
  ]);
  const label = callout.children?.[0];
  assert.equal(label?.data?.hProperties?.className, "callout__label");
  assert.equal(label?.children?.[0]?.value, "備註");
  const body = callout.children?.[1];
  assert.deepEqual(
    body?.children?.map((child) => child.value ?? child.type),
    ["內容"],
  );
});

test("標記獨立一行但沒有 break 節點時，不留下開頭換行", () => {
  const tree = run(root(blockquote(paragraph(text("[!NOTE]\n內容")))));
  assert.equal(first(tree).children?.[1]?.children?.[0]?.value, "內容");
});

test("標記與內容同一行也能辨識", () => {
  const tree = run(root(blockquote(paragraph(text("[!TIP] 先跑一次")))));
  const callout = first(tree);
  assert.deepEqual(callout.data?.hProperties?.className, [
    "callout",
    "callout--tip",
  ]);
  assert.equal(callout.children?.[1]?.children?.[0]?.value, "先跑一次");
});

test("標記大小寫不敏感", () => {
  const tree = run(root(blockquote(paragraph(text("[!warning]")))));
  assert.deepEqual(first(tree).data?.hProperties?.className, [
    "callout",
    "callout--warning",
  ]);
});

test("只有標記沒有內容時不留下空段落", () => {
  const tree = run(root(blockquote(paragraph(text("[!IMPORTANT]")))));
  const callout = first(tree);
  assert.equal(callout.children?.length, 1);
  assert.equal(callout.children?.[0]?.children?.[0]?.value, "重點");
});

test("未知標記與一般引言保持原樣", () => {
  const unknown = run(root(blockquote(paragraph(text("[!FOO] x")))));
  assert.equal(first(unknown).type, "blockquote");
  assert.equal(first(unknown).data, undefined);

  const quote = run(root(blockquote(paragraph(text("一般引言")))));
  assert.equal(first(quote).data, undefined);
  assert.equal(first(quote).children?.[0]?.children?.[0]?.value, "一般引言");
});

test("巢狀在清單裡的 callout 同樣會轉換", () => {
  const tree = run(
    root({
      type: "listItem",
      children: [blockquote(paragraph(text("[!CAUTION]")))],
    }),
  );
  assert.equal(first(tree).children?.[0]?.data?.hName, "aside");
});
