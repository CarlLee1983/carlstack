import assert from "node:assert/strict";
import test from "node:test";
import {
  selectFeaturedPosts,
  type BlogDataShape,
  type WithBlogData,
} from "../src/utils/content.ts";

const post = (
  id: string,
  publishDate: string,
  overrides: Partial<BlogDataShape> = {},
): WithBlogData & { id: string } => ({
  id,
  data: {
    publishDate: new Date(publishDate),
    draft: false,
    tags: [],
    ...overrides,
  },
});

const now = new Date("2026-10-01T12:00:00Z");
const ids = (entries: { id: string }[]) => entries.map((entry) => entry.id);

test("只取未過期的精選，到期日當天仍有效", () => {
  const posts = [
    post("expired", "2026-09-01", {
      featured: true,
      featuredUntil: new Date("2026-09-30"),
    }),
    post("today", "2026-08-01", {
      featured: true,
      featuredUntil: new Date("2026-10-01"),
    }),
    post("active", "2026-07-01", {
      featured: true,
      featuredUntil: new Date("2026-12-31"),
    }),
    post("plain-a", "2026-06-01"),
  ];
  assert.deepEqual(ids(selectFeaturedPosts(posts, { now, limit: 2 })), [
    "today",
    "active",
  ]);
});

test("精選不足時以最近更新的文章補位，排除指定文章且不重複", () => {
  const posts = [
    post("latest", "2026-09-20"),
    post("active", "2026-09-10", {
      featured: true,
      featuredUntil: new Date("2026-12-31"),
    }),
    post("old-updated", "2025-01-01", { updatedDate: new Date("2026-09-15") }),
    post("mid", "2026-05-01"),
    post("oldest", "2025-06-01"),
  ];
  const selected = selectFeaturedPosts(posts, {
    now,
    limit: 3,
    exclude: [posts[0]!],
  });
  assert.deepEqual(ids(selected), ["active", "old-updated", "mid"]);
});

test("不修改原陣列", () => {
  const posts = [
    post("b", "2026-01-01"),
    post("a", "2026-02-01", { updatedDate: new Date("2026-09-01") }),
  ];
  selectFeaturedPosts(posts, { now, limit: 3 });
  assert.deepEqual(ids(posts), ["b", "a"]);
});
