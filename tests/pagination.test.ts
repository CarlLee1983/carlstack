import assert from "node:assert/strict";
import test from "node:test";
import {
  POSTS_PER_PAGE,
  blogPageHref,
  paginate,
} from "../src/utils/pagination.ts";

const items = Array.from({ length: 26 }, (_, index) => index + 1);

test("第一頁不帶頁碼路徑，其餘頁走 /blog/page/N/", () => {
  assert.equal(blogPageHref(1), "/blog/");
  assert.equal(blogPageHref(2), "/blog/page/2/");
  assert.equal(blogPageHref(0), "/blog/");
});

test("依每頁筆數切出對應區段", () => {
  const first = paginate(items, 1, 10);
  assert.deepEqual(first.items, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(first.current, 1);
  assert.equal(first.total, 3);
  assert.equal(first.prevHref, null);
  assert.equal(first.nextHref, "/blog/page/2/");

  const last = paginate(items, 3, 10);
  assert.deepEqual(last.items, [21, 22, 23, 24, 25, 26]);
  assert.equal(last.prevHref, "/blog/page/2/");
  assert.equal(last.nextHref, null);
});

test("中間頁的上一頁回到第一頁的無頁碼路徑", () => {
  const second = paginate(items, 2, 10);
  assert.equal(second.prevHref, "/blog/");
  assert.equal(second.nextHref, "/blog/page/3/");
});

test("頁碼超出範圍時夾在有效區間內", () => {
  assert.equal(paginate(items, 0, 10).current, 1);
  assert.equal(paginate(items, 99, 10).current, 3);
});

test("沒有文章時仍是單一空白頁", () => {
  const empty = paginate([], 1, 10);
  assert.deepEqual(empty.items, []);
  assert.equal(empty.total, 1);
  assert.equal(empty.prevHref, null);
  assert.equal(empty.nextHref, null);
});

test("列出每一頁的頁碼與連結", () => {
  const pages = paginate(items, 2, 10).pages;
  assert.deepEqual(pages, [
    { number: 1, href: "/blog/", current: false },
    { number: 2, href: "/blog/page/2/", current: true },
    { number: 3, href: "/blog/page/3/", current: false },
  ]);
});

test("預設每頁筆數為模組常數", () => {
  assert.equal(paginate(items).items.length, POSTS_PER_PAGE);
});

test("不修改傳入的陣列", () => {
  const original = [...items];
  paginate(items, 2, 10);
  assert.deepEqual(items, original);
});

test("少頁數（<= 7 頁）不產生省略符號", () => {
  const shortItems = Array.from({ length: 50 }, (_, i) => i + 1);
  const result = paginate(shortItems, 3, 10);
  assert.equal(result.total, 5);
  assert.equal(result.elements.length, 5);
  assert.ok(result.elements.every((el) => el.type === "page"));
});

test("多頁數（> 7 頁）在各個位置正確插入省略符號", () => {
  const longItems = Array.from({ length: 150 }, (_, i) => i + 1);
  // 共 15 頁

  // 當前在第 1 頁：[1, 2, 3, '...', 15]
  const p1 = paginate(longItems, 1, 10);
  assert.deepEqual(
    p1.elements.map((el) => (el.type === "page" ? el.number : "...")),
    [1, 2, 3, "...", 15],
  );

  // 當前在第 4 頁（靠近前端）：[1, 2, 3, 4, 5, '...', 15]
  const p4 = paginate(longItems, 4, 10);
  assert.deepEqual(
    p4.elements.map((el) => (el.type === "page" ? el.number : "...")),
    [1, 2, 3, 4, 5, "...", 15],
  );

  // 當前在第 8 頁（中間）：[1, '...', 7, 8, 9, '...', 15]
  const p8 = paginate(longItems, 8, 10);
  assert.deepEqual(
    p8.elements.map((el) => (el.type === "page" ? el.number : "...")),
    [1, "...", 7, 8, 9, "...", 15],
  );

  // 當前在第 12 頁（靠近末端）：[1, '...', 11, 12, 13, 14, 15]
  const p12 = paginate(longItems, 12, 10);
  assert.deepEqual(
    p12.elements.map((el) => (el.type === "page" ? el.number : "...")),
    [1, "...", 11, 12, 13, 14, 15],
  );

  // 當前在第 15 頁（最後一頁）：[1, '...', 13, 14, 15]
  const p15 = paginate(longItems, 15, 10);
  assert.deepEqual(
    p15.elements.map((el) => (el.type === "page" ? el.number : "...")),
    [1, "...", 13, 14, 15],
  );
});
