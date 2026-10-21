import assert from "node:assert/strict";
import test from "node:test";
import { isUnifiedProcessor } from "@astrojs/markdown-remark";
import config from "../astro.config.mjs";

// 用站台 astro.config.mjs 宣告的同一份 processor 設定渲染，避免測試與實際設定分岔。
const siteProcessor = config.markdown?.processor;
assert.ok(siteProcessor && isUnifiedProcessor(siteProcessor));
const renderer = await siteProcessor.createRenderer({});
const render = async (source: string): Promise<string> =>
  (await renderer.render(source)).code;

// 走真正的 @astrojs/mdx 整合：依序呼叫它的 config hook，取出它註冊的 vite
// 外掛，再用該外掛的 transform 編譯 .mdx。這樣 mdx({ gfm }) 、
// extendMarkdownConfig: false 或 mdx({ remarkPlugins }) 之類的覆寫都會被測到。
const compileMdx = async (source: string): Promise<string> => {
  const integration = config.integrations
    ?.flat()
    .find((item) => item && item.name === "@astrojs/mdx");
  assert.ok(integration);
  assert.ok(integration.hooks);
  const srcDir = new URL("../src/", import.meta.url);
  const noop = () => {};
  const logger = { warn: noop, info: noop, error: noop, debug: noop };
  let vitePlugin: any;
  await (integration.hooks["astro:config:setup"] as any)({
    config: { srcDir },
    addRenderer: noop,
    addPageExtension: noop,
    addContentEntryType: noop,
    updateConfig: (update: any) => {
      vitePlugin = update.vite.plugins[0];
    },
  });
  await (integration.hooks["astro:config:done"] as any)({
    config: { markdown: config.markdown, srcDir },
    logger,
  });
  vitePlugin.configResolved({ build: {}, plugins: [] });
  const result = await vitePlugin.transform.handler(source, "/fixture.mdx");
  return result.code;
};
const count = (html: string, pattern: RegExp): number =>
  html.match(pattern)?.length ?? 0;

test("全形句號結尾的粗體後接中文仍成為 strong", async () => {
  const html = await render("前文**單次查詢只需三次 I/O。**後文");
  assert.match(html, /<strong>單次查詢只需三次 I\/O。<\/strong>/);
  assert.ok(!html.includes("**"));
});

test("粗體包住全形括號引號並緊鄰中文時各自獨立", async () => {
  const html = await render("中文**「業務流程」**與**「護城河」**結尾");
  assert.equal(count(html, /<strong>/g), 2);
  assert.match(
    html,
    /<strong>「業務流程」<\/strong>與<strong>「護城河」<\/strong>/,
  );
  assert.ok(!html.includes("**"));
});

test("全形括號結尾的粗體後接中文連接詞不吞掉連接詞", async () => {
  const html = await render("**部分請款（Partial Capture）**或**撤銷授權**");
  assert.equal(count(html, /<strong>/g), 2);
  assert.match(
    html,
    /<strong>部分請款（Partial Capture）<\/strong>或<strong>撤銷授權<\/strong>/,
  );
});

test("單波浪號不是刪除線", async () => {
  const html = await render("3~4 層高，3~4 次 I/O");
  assert.ok(!html.includes("<del>"));
  assert.ok(html.includes("3~4 層高，3~4 次 I/O"));
});

test("雙波浪號仍是刪除線", async () => {
  const html = await render("~~刪除~~");
  assert.match(html, /<del>刪除<\/del>/);
});

test("一般英文粗體照常運作", async () => {
  const html = await render("**bold** text");
  assert.match(html, /<strong>bold<\/strong> text/);
});

test("站台 processor 關閉內建 gfm，改由帶選項的 remarkGfm 負責", () => {
  assert.equal(siteProcessor.options.gfm, false);
});

test("MDX 繼承同一份設定：CJK 粗體成立、單波浪號不是刪除線、雙波浪號仍是", async () => {
  const code = await compileMdx(
    "前文**單次查詢只需三次 I/O。**後文\n\n3~4 層高，3~4 次 I/O\n\n~~刪除~~\n",
  );
  assert.match(code, /"strong"/);
  assert.ok(!code.includes("**"));
  assert.ok(code.includes("3~4 層高，3~4 次 I/O"));
  assert.equal(code.match(/"del"/g)?.length, 1);
});
