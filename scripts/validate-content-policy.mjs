import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  changedArticlePolicyViolations,
  resolvePolicyBase,
} from "../src/utils/content-policy.mjs";

const base = resolvePolicyBase(process.argv.slice(2));

let changedFiles;
try {
  changedFiles = execFileSync(
    "git",
    [
      "diff",
      "--name-only",
      "--diff-filter=AMR",
      base,
      "--",
      "src/content/blog",
    ],
    { encoding: "utf8" },
  )
    .split("\n")
    .filter(Boolean)
    .filter((file) => /\.mdx?$/.test(file));
} catch {
  console.error(`Unable to compare article changes with ${base}.`);
  process.exit(1);
}

const violations = changedFiles.flatMap((file) => {
  const path = resolve(file);
  if (!existsSync(path)) return [];
  return changedArticlePolicyViolations(file, readFileSync(path, "utf8"));
});

if (violations.length > 0) {
  console.error(
    "Content policy failed:\n" +
      violations.map((line) => `- ${line}`).join("\n"),
  );
  process.exit(1);
}

console.log(
  `Content policy passed for ${changedFiles.length} changed article file(s).`,
);
