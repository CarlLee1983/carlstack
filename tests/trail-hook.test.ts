import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const settings = JSON.parse(
  readFileSync(resolve(".claude/settings.json"), "utf8"),
);
const hook = settings.hooks.SessionStart.flatMap(
  (group: { hooks: { type: string; command: string; timeout: number }[] }) =>
    group.hooks,
).find((entry: { command: string }) =>
  entry.command.includes(".trail/hook.cjs"),
);

test("Trail SessionStart timeout is eight seconds, not milliseconds", () => {
  // Claude Code's timeout field is seconds: https://code.claude.com/docs/en/hooks#common-fields
  assert.equal(hook.type, "command");
  assert.equal(hook.timeout, 8);
  assert.equal(
    hook.command,
    'node "${CLAUDE_PROJECT_DIR:-.}/.trail/hook.cjs" session-start',
  );
});

function runHook(source?: string, withLearning = false) {
  const root = mkdtempSync(join(tmpdir(), "carlstack-trail-"));
  try {
    const home = join(root, "home");
    const project = join(root, "project with spaces");
    mkdirSync(home);
    mkdirSync(join(project, ".trail"), { recursive: true });
    copyFileSync(resolve(".trail/hook.cjs"), join(project, ".trail/hook.cjs"));
    // Prevent machine-installed Trail packages or npm discovery from influencing
    // this fixture. Only the temporary remembered install can supply hooks.js.
    const preload = join(root, "isolate.cjs");
    writeFileSync(
      preload,
      `
      const Module = require("node:module");
      const original = Module._resolveFilename;
      Module._resolveFilename = function (name, ...args) {
        if (name.startsWith("@trailhq/") || name.startsWith("@nanonets/")) throw new Error("isolated fixture");
        return original.call(this, name, ...args);
      };
      require("node:child_process").execFileSync = () => { throw new Error("npm unavailable"); };
    `,
    );
    if (source !== undefined) {
      const pkg = join(root, "fixture");
      const dist = join(pkg, "dist", "claude");
      mkdirSync(dist, { recursive: true });
      writeFileSync(
        join(pkg, "package.json"),
        JSON.stringify({ type: "module", version: "1.0.0" }),
      );
      writeFileSync(join(dist, "hooks.js"), source);
      writeFileSync(
        join(home, "install.json"),
        JSON.stringify({ claudeDist: dist }),
      );
    }
    if (withLearning) {
      mkdirSync(join(project, ".trail/learnings"));
      writeFileSync(
        join(project, ".trail/learnings/startup.md"),
        "title: Startup fixture\nauthor: Test\n",
      );
    }
    return spawnSync(
      process.execPath,
      ["--require", preload, join(project, ".trail/hook.cjs"), "session-start"],
      {
        cwd: project,
        env: {
          HOME: home,
          USERPROFILE: home,
          TRAIL_HOME: home,
          CLAUDE_PROJECT_DIR: project,
          PATH: "",
        },
        encoding: "utf8",
        timeout: hook.timeout * 1000,
      },
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("missing Trail and learnings exits quietly", () => {
  const result = runHook();
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});

test("missing Trail emits valid SessionStart learning context", () => {
  const result = runHook(undefined, true);
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout).hookSpecificOutput;
  assert.equal(output.hookEventName, "SessionStart");
  assert.match(output.additionalContext, /Startup fixture/);
  assert.equal(result.stderr, "");
});

test("available Trail receives session-start", () => {
  const result = runHook(
    "export function main(event) { process.stdout.write(event); }",
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "session-start");
  assert.equal(result.stderr, "");
});

for (const [name, source] of [
  ["import failure", 'throw new Error("fixture import failure");'],
  [
    "synchronous failure",
    'export function main() { throw new Error("fixture failure"); }',
  ],
  [
    "asynchronous rejection",
    'export async function main() { throw new Error("fixture rejection"); }',
  ],
]) {
  test(`Trail ${name} exits quietly`, () => {
    const result = runHook(source);
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "");
  });
}
