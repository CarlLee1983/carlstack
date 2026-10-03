import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getArticleListDate } from "../src/utils/content.ts";

test("列表文字與 datetime 使用更新時間，跨 UTC 日期以台北日期顯示", () => {
  const data = {
    publishDate: new Date("2026-09-22T10:00:00+08:00"),
    updatedDate: new Date("2026-10-04T05:09:00+08:00"),
  };
  assert.deepEqual(getArticleListDate(data), {
    datetime: "2026-10-03T21:09:00.000Z",
    text: "更新 2026年10月4日",
  });
  assert.equal(data.publishDate.toISOString(), "2026-09-22T02:00:00.000Z");
});

test("無更新時間時列表回退發布時間且不冒稱更新", () => {
  assert.deepEqual(
    getArticleListDate({ publishDate: new Date("2026-10-02T23:30:00Z") }),
    { datetime: "2026-10-02T23:30:00.000Z", text: "發布 2026年10月3日" },
  );
});

test("共用卡片把有效日期同時接到可見文字與 time datetime", () => {
  const card = readFileSync(
    new URL("../src/components/ArticleCard.astro", import.meta.url),
    "utf8",
  );
  assert.match(card, /const listDate = getArticleListDate\(post\.data\)/);
  assert.match(
    card,
    /<time datetime=\{listDate\.datetime\}>\{listDate\.text\}<\/time>/,
  );
  assert.doesNotMatch(card, /post\.data\.publishDate/);
});

test("搜尋列表使用台北日期標籤，SEO 發布時間保留原值", () => {
  const seo = readFileSync(
    new URL("../src/components/Seo.astro", import.meta.url),
    "utf8",
  );
  const search = readFileSync(
    new URL("../src/pages/search/index.astro", import.meta.url),
    "utf8",
  );
  assert.match(
    seo,
    /data-pagefind-meta="date\[content\]" content=\{listDate\.datetime\}/,
  );
  assert.match(
    seo,
    /data-pagefind-meta="dateLabel\[content\]" content=\{listDate\.text\}/,
  );
  assert.match(
    seo,
    /property="article:published_time"\s+content=\{publishDate\.toISOString\(\)\}/,
  );
  assert.match(search, /result\.meta\.dateLabel/);
  assert.doesNotMatch(search, /meta\.date\?\.slice/);
});
