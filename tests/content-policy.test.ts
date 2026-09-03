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

test("新或修改文章拒絕無法渲染的 LaTeX", () => {
  const source = "Refresh Token $RT_1$ 換取 $RT_2$。\n複雜度為 $O(\\log N)$。";

  assert.deepEqual(
    changedArticlePolicyViolations("src/content/blog/example.mdx", source),
    [
      "src/content/blog/example.mdx: LaTeX at line 1, 2; the site renders no math, use inline code or Unicode instead.",
    ],
  );
});

test("code fence 與行內程式碼裡的 $ 不算 LaTeX", () => {
  const source = [
    "```bash",
    '$ echo "$PROJECT_ROOT/work"',
    "# 輸出格式: $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>",
    "```",
    "模板字串寫成 `${user_id}` 時不應觸發。",
  ].join("\n");

  assert.deepEqual(
    changedArticlePolicyViolations("src/content/blog/example.mdx", source),
    [],
  );
});

test("表格裡的金額與價位符號不算 LaTeX", () => {
  const source = [
    "| 單位儲存成本 | $$$ (最高) | $$ (中等) | $ (最低) |",
    "誤差小於閥值（如 $0.01 匯率精度）時計入雜項科目。",
  ].join("\n");

  assert.deepEqual(
    changedArticlePolicyViolations("src/content/blog/example.mdx", source),
    [],
  );
});

test("同時違反兩條規則時各報一次", () => {
  const source =
    "```mermaid\nflowchart LR\n  A --> B\n```\n\n複雜度 $O(\\log N)$。";

  assert.deepEqual(
    changedArticlePolicyViolations("src/content/blog/example.mdx", source),
    [
      "src/content/blog/example.mdx: use a native SVG or an Astro SVG component instead of a Mermaid fence.",
      "src/content/blog/example.mdx: LaTeX at line 6; the site renders no math, use inline code or Unicode instead.",
    ],
  );
});
