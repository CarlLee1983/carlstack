import assert from "node:assert/strict";
import test from "node:test";
import { buildToc, type MarkdownHeading } from "../src/utils/toc.ts";

const h = (depth: number, slug: string): MarkdownHeading => ({
  depth,
  slug,
  text: slug,
});

test("只收 h2 與 h3，h1 與 h4 以下略過", () => {
  const toc = buildToc([h(1, "title"), h(2, "a"), h(4, "deep"), h(2, "b")]);
  assert.deepEqual(
    toc.map((entry) => entry.slug),
    ["a", "b"],
  );
});

test("h3 掛在前一個 h2 底下", () => {
  const toc = buildToc([h(2, "a"), h(3, "a1"), h(3, "a2"), h(2, "b")]);
  assert.equal(toc.length, 2);
  assert.deepEqual(
    toc[0]!.children.map((entry) => entry.slug),
    ["a1", "a2"],
  );
  assert.deepEqual(toc[1]!.children, []);
});

test("開頭就是 h3 時提升為頂層，不會遺失", () => {
  const toc = buildToc([h(3, "orphan"), h(2, "a")]);
  assert.deepEqual(
    toc.map((entry) => entry.slug),
    ["orphan", "a"],
  );
});

test("沒有 slug 的標題略過", () => {
  const toc = buildToc([{ depth: 2, slug: "", text: "無錨點" }, h(2, "a")]);
  assert.deepEqual(
    toc.map((entry) => entry.slug),
    ["a"],
  );
});

test("標題不足時回傳空陣列，讓呼叫端決定不渲染", () => {
  assert.deepEqual(buildToc([]), []);
  assert.deepEqual(buildToc([h(1, "title")]), []);
});

test("不修改傳入的標題陣列", () => {
  const headings = [h(2, "a"), h(3, "a1")];
  const snapshot = structuredClone(headings);
  buildToc(headings);
  assert.deepEqual(headings, snapshot);
});
