import assert from "node:assert/strict";
import test from "node:test";
import {
  changedArticlePolicyViolations,
  resolvePolicyBase,
} from "../src/utils/content-policy.mjs";

test("新或修改文章接受原生 SVG 圖解", () => {
  const source =
    '<svg viewBox="0 0 10 10" role="img"><title>流程</title></svg>';

  assert.deepEqual(
    changedArticlePolicyViolations("src/content/blog/example.mdx", source),
    [],
  );
});

test("新或修改文章拒絕 Mermaid fence", () => {
  const source = "```mermaid\nflowchart LR\n  A --> B\n```";

  assert.deepEqual(
    changedArticlePolicyViolations("src/content/blog/example.md", source),
    [
      "src/content/blog/example.md: use a native SVG or an Astro SVG component instead of a Mermaid fence.",
    ],
  );
});

test("pnpm 轉發的 -- 分隔符不會被當成 diff base", () => {
  assert.equal(resolvePolicyBase(["--", "HEAD"]), "HEAD");
  assert.equal(resolvePolicyBase(["--", "0f1e2d3"]), "0f1e2d3");
});

test("未傳 base 時退回 HEAD", () => {
  assert.equal(resolvePolicyBase([]), "HEAD");
  assert.equal(resolvePolicyBase(["--"]), "HEAD");
});

test("直接傳 base 時照用", () => {
  assert.equal(resolvePolicyBase(["main"]), "main");
});
