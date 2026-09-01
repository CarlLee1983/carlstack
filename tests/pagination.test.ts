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
