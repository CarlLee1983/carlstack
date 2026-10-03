import assert from "node:assert/strict";
import test from "node:test";
import { paginate } from "../src/utils/pagination.ts";
import {
  filterDrafts,
  normalizeTaxonomy,
  sortByUpdatedDate,
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

test("未設定更新時間時依發布日期倒序排列且不修改原陣列", () => {
  const original = [
    entry("2026-01-01"),
    entry("2026-03-01"),
    entry("2026-02-01"),
  ];
  const sorted = sortByUpdatedDate(original);
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

test("舊文更新後排在新發布文章之前，且不修改日期或原陣列", () => {
  const updated = entry("2026-09-01", { updatedDate: new Date("2026-10-04") });
  const published = entry("2026-10-03");
  const original = [published, updated];
  assert.deepEqual(sortByUpdatedDate(original), [updated, published]);
  assert.deepEqual(original, [published, updated]);
  assert.equal(
    updated.data.publishDate.toISOString(),
    "2026-09-01T00:00:00.000Z",
  );
});

test("相同更新時間依發布日倒序，再以 ID 升序固定順序", () => {
  const updatedDate = new Date("2026-10-04");
  const a = { ...entry("2026-09-02", { updatedDate }), id: "a" };
  const b = { ...entry("2026-09-02", { updatedDate }), id: "b" };
  const older = { ...entry("2026-09-01", { updatedDate }), id: "older" };
  assert.deepEqual(sortByUpdatedDate([older, b, a]), [a, b, older]);
  assert.deepEqual(sortByUpdatedDate([a, older, b]), [a, b, older]);
});

test("更新後跨頁前移，草稿不進入正式清單，各頁無重複或遺漏", () => {
  const updated = entry("2026-01-01", { updatedDate: new Date("2026-10-04") });
  const middle = entry("2026-10-03");
  const oldest = entry("2026-09-01");
  const draft = entry("2026-10-05", { draft: true });
  const original = [oldest, draft, middle, updated];
  const sorted = sortByUpdatedDate(filterDrafts(original, false));
  assert.deepEqual(paginate(sorted, 1, 2).items, [updated, middle]);
  assert.deepEqual(paginate(sorted, 2, 2).items, [oldest]);
  assert.deepEqual(original, [oldest, draft, middle, updated]);
});

test("更新時間不改變系列學習順序或未指定篇章的發布先後", () => {
  const first = entry("2026-01-01", {
    seriesOrder: 1,
    updatedDate: new Date("2026-10-04"),
  });
  const second = entry("2026-02-01", { seriesOrder: 2 });
  const unnumberedOld = entry("2026-03-01", {
    updatedDate: new Date("2026-10-05"),
  });
  const unnumberedNew = entry("2026-04-01");
  const original = [second, unnumberedNew, first, unnumberedOld];
  assert.deepEqual(sortSeries(sortByUpdatedDate(original)), [
    first,
    second,
    unnumberedOld,
    unnumberedNew,
  ]);
  assert.deepEqual(original, [second, unnumberedNew, first, unnumberedOld]);
});
