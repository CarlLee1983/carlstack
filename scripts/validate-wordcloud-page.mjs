import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

/** @param {string} path */
const readPage = (path) => readFileSync(`dist/${path}/index.html`, "utf8");
const cloudHtml = readPage("explore/wordcloud");
const tagsHtml = readPage("tags");
const homeHtml = readFileSync("dist/index.html", "utf8");

assert.match(tagsHtml, /href="\/explore\/wordcloud\/"/);

const overviewHtml = tagsHtml.match(
  /<ul class="tag-list tags-cloud"[^>]*>(.*?)<\/ul>/,
)?.[1];
const overview = [
  ...(overviewHtml ?? "").matchAll(
    /<a class="tag" data-count="(\d+)" data-tier="[^"]+" href="(\/tags\/[^\"]+\/)"/g,
  ),
].map(([, count, href]) => {
  assert.ok(count && href);
  return { href, value: Number(count) };
});

const listHtml = cloudHtml.match(
  /<ul class="wordcloud-page__list"[^>]*>(.*?)<\/ul>/,
)?.[1];
if (overview.length === 0) {
  assert.ok(!listHtml, "empty word cloud must not render a tag list");
  assert.doesNotMatch(cloudHtml, /data-wordcloud-chart/);
  assert.match(cloudHtml, /尚無已發布文章標籤/);
} else {
  assert.ok(listHtml, "word cloud page must render the full HTML tag list");
  assert.match(
    cloudHtml,
    /data-wordcloud-chart[^>]*\bhidden\b/,
    "chart must stay hidden when JavaScript is unavailable",
  );

  const list = [
    ...listHtml.matchAll(
      /<a href="(\/tags\/[^\"]+\/)"[^>]*>.*?<span class="wordcloud-page__count"[^>]*>(\d+) 篇<\/span><\/a>/g,
    ),
  ].map(([, href, count]) => {
    assert.ok(href && count);
    return { href, value: Number(count) };
  });
  assert.deepEqual(
    list,
    overview,
    "word cloud list must match all taxonomy tags",
  );

  const dataAttribute = cloudHtml.match(
    /data-wordcloud-chart data-items="([^"]+)"/,
  )?.[1];
  assert.ok(dataAttribute, "word cloud page must expose chart data");
  /** @type {{ href: string, value: number }[]} */
  const cloud = JSON.parse(
    dataAttribute.replaceAll("&quot;", '"').replaceAll("&amp;", "&"),
  );
  assert.deepEqual(
    cloud.map(({ href, value }) => ({ href, value })),
    overview.slice(0, 40),
    "cloud must show the top 40 taxonomy tags",
  );

  for (const { href } of list) {
    assert.ok(
      existsSync(`dist${decodeURIComponent(href)}index.html`),
      `${href} must have a built tag page`,
    );
  }

  console.log(
    `Word cloud page passed: ${cloud.length} chart tags, ${list.length} HTML links.`,
  );
}

const script = cloudHtml.match(
  /src="(\/_astro\/index\.astro_astro_type_script_index_0_lang\.[^"]+\.js)"/,
)?.[1];
assert.ok(script, "word cloud page must load its chart script");
assert.ok(!tagsHtml.includes(script) && !homeHtml.includes(script));

if (overview.length === 0) console.log("Word cloud page passed: empty state.");
