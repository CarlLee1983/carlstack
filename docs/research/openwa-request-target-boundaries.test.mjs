// Original, offline regression examples. No OpenWA installation or network calls.
import assert from "node:assert/strict";
import test from "node:test";

const origin = "https://api.example.test";
const prefix = "/workspaces/demo/items/";

// Illustrative application contract: generated IDs use this limited alphabet.
// This is not a drop-in validator for OpenWA or for arbitrary external IDs.
/** @param {unknown} id */
function planDelete(id) {
  if (typeof id !== "string" || !/^[a-z0-9_-]{1,64}$/.test(id)) {
    throw new TypeError("invalid application item id");
  }
  const path = prefix + encodeURIComponent(id);
  const url = new URL(path, origin);
  if (
    url.origin !== origin ||
    url.pathname !== path ||
    url.search ||
    url.hash
  ) {
    throw new TypeError("request target changed");
  }
  return Object.freeze({ method: "DELETE", url: url.href, resourceId: id });
}

// URL-shape policy only. It does not resolve DNS, connect, or authorize redirects.
/** @param {string} input */
function permittedMediaShape(input) {
  const url = new URL(input);
  return (
    url.protocol === "https:" &&
    url.hostname === "media.example.test" &&
    url.port === "" &&
    url.username === "" &&
    url.password === ""
  );
}

test("percent-encoding alone leaves an exact dot segment meaningful", () => {
  assert.equal(encodeURIComponent(".."), "..");
  assert.equal(
    new URL(prefix + encodeURIComponent(".."), origin).pathname,
    "/workspaces/demo/",
  );
});

test("an already percent-written id is encoded again and stays a segment", () => {
  assert.equal(
    new URL(prefix + encodeURIComponent("%2E%2E"), origin).pathname,
    prefix + "%252E%252E",
  );
});

test("raw percent-written dots and encoded caller ids are distinct paths", () => {
  assert.equal(
    new URL(prefix + "%2E%2E", origin).pathname,
    "/workspaces/demo/",
  );
});

test("the application refuses invalid ids without calling a recording transport", () => {
  /** @type {ReturnType<typeof planDelete>[]} */
  const calls = [];
  /** @param {unknown} id */
  const removeItem = (id) => calls.push(planDelete(id));
  for (const id of [
    "",
    ".",
    "..",
    "%2E%2E",
    "a/b",
    "a?b",
    "a#b",
    "a\\b",
    "\n..",
    null,
    42,
  ]) {
    assert.throws(() => removeItem(id), TypeError);
  }
  assert.deepEqual(calls, []);
});

test("a valid id preserves the declared origin, method, and exact target", () => {
  assert.deepEqual(planDelete("item_7"), {
    method: "DELETE",
    url: "https://api.example.test/workspaces/demo/items/item_7",
    resourceId: "item_7",
  });
});

test("the checked request plan cannot be retargeted in place", () => {
  const plan = planDelete("item_7");
  assert.equal(Reflect.set(plan, "url", origin), false);
  assert.equal(plan.url, origin + prefix + "item_7");
});

test("the media URL policy reads parsed fields rather than substrings", () => {
  assert.equal(permittedMediaShape("https://media.example.test/file"), true);
  assert.equal(
    permittedMediaShape("https://media.example.test:443/file"),
    true,
  );
  for (const url of [
    "http://media.example.test/file",
    "https://media.example.test:8443/file",
    "https://media.example.test.other.test/file",
    "https://media.example.test@other.test/file",
    "https://user@media.example.test/file",
  ]) {
    assert.equal(permittedMediaShape(url), false, url);
  }
});

test("a new redirect destination needs its own policy decision", () => {
  const initial = "https://media.example.test/file";
  const next = new URL("https://other.test/file", initial).href;
  assert.equal(permittedMediaShape(initial), true);
  assert.equal(permittedMediaShape(next), false);
});
