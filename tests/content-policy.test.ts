import assert from "node:assert/strict";
import test from "node:test";
import { changedArticlePolicyViolations } from "../src/utils/content-policy.mjs";

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
