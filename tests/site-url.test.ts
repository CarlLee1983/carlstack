import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import test from "node:test";

const script = resolve("scripts/validate-site-url.mjs");

test("部署拒絕保留的 placeholder SITE_URL", () => {
  const result = spawnSync(process.execPath, [script], {
    env: { ...process.env, SITE_URL: "https://blog.example.com" },
  });
  assert.notEqual(result.status, 0);
});

test("部署接受 production HTTPS SITE_URL", () => {
  const result = spawnSync(process.execPath, [script], {
    env: { ...process.env, SITE_URL: "https://carlstack.gravito.dev" },
  });
  assert.equal(result.status, 0);
});
