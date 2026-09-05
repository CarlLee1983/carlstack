import assert from "node:assert/strict";
import test from "node:test";
import {
  filterDrafts,
  normalizeTaxonomy,
  sortByPublishDate,
  sortByPostCount,
  sortSeries,
  type BlogDataShape,
  type WithBlogData,
} from "../src/utils/content.ts";

const entry = (
  date: string,
  overrides: Partial<BlogDataShape> = {},
): WithBlogData => ({
  data: {
    publishDate: new Date(date),
    draft: false,
    tags: [],
    ...overrides,
  },
});

test("文章依發布日期倒序排列且不修改原陣列", () => {
  const original = [
    entry("2026-01-01"),
    entry("2026-03-01"),
    entry("2026-02-01"),
  ];
  const sorted = sortByPublishDate(original);
  assert.deepEqual(
    sorted.map((item) => item.data.publishDate.getMonth()),
    [2, 1, 0],
  );
  assert.equal(original[0]?.data.publishDate.getMonth(), 0);
});

test("production 過濾 draft，development 保留", () => {
  const entries = [entry("2026-01-01"), entry("2026-02-01", { draft: true })];
  assert.equal(filterDrafts(entries, false).length, 1);
  assert.equal(filterDrafts(entries, true).length, 2);
});

test("標籤正規化保留中文字並產生穩定 URL", () => {
  assert.equal(
    normalizeTaxonomy("  ＡＩ Agent Workflow  "),
    "ai-agent-workflow",
  );
  assert.equal(
    normalizeTaxonomy("DDD 與 Clean Architecture"),
    "ddd-與-clean-architecture",
  );
  assert.equal(normalizeTaxonomy("ＡＰＩ 整合"), normalizeTaxonomy("API 整合"));
  assert.equal(normalizeTaxonomy("——"), "");
});

test("系列依 seriesOrder 排序，未設定者置後", () => {
  const entries = [
    entry("2026-01-01", { seriesOrder: 2 }),
    entry("2025-01-01"),
    entry("2026-02-01", { seriesOrder: 1 }),
  ];
  assert.deepEqual(
    sortSeries(entries).map((item) => item.data.seriesOrder),
    [1, 2, undefined],
  );
});

test("sortByPostCount 依文章數倒序、同數量依名稱，且不修改原陣列", () => {
  const original = [
    { name: "乙", posts: [entry("2026-01-01")] },
    { name: "甲", posts: [entry("2026-01-01"), entry("2026-01-02")] },
    { name: "丙", posts: [entry("2026-01-01")] },
  ];
  const sorted = sortByPostCount(original);
  assert.deepEqual(
    sorted.map((item) => item.name),
    ["甲", "乙", "丙"],
  );
  assert.equal(original[0]?.name, "乙");
});
