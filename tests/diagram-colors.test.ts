import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

// docs/diagram-guide.md：圖解的中性階一律走 --dg-* token，不得寫死、不得帶 hex fallback。
// 這裡列的是圖解曾經寫死的 Tailwind slate 中性階；強調色不受限。
const SLATE_NEUTRALS =
  /#(?:f8fafc|f1f5f9|e2e8f0|cbd5e1|94a3b8|64748b|475569|334155|1e293b|0f172a|0b1120|020617)\b/gi;
const HEX_FALLBACK = /var\(--dg-[\w-]+\s*,\s*#[\da-f]{3,8}\s*\)/gi;

const componentsDir = new URL("../src/components/", import.meta.url);
const diagrams = readdirSync(componentsDir).filter((name) =>
  name.endsWith("Diagram.astro"),
);

test("圖解元件不寫死 slate 中性色", () => {
  const offenders = diagrams.flatMap((name) => {
    const source = readFileSync(new URL(name, componentsDir), "utf8");
    const hits = source.match(SLATE_NEUTRALS) ?? [];
    return hits.length > 0 ? [`${name}: ${hits.length}`] : [];
  });
  assert.deepEqual(offenders, []);
});

// 寫死白底（fill／background）的淺色規則，同一個 selector 必須有深色覆寫，
// 否則深色模式會變成白底配 --dg-ink 的淺字。色塊上的白字（*text／label／title）不算底色。
const WHITE_SURFACE =
  /(?:^|[;\s])(?:fill|background(?:-color)?)\s*:\s*#fff(?:fff)?\b/i;
const DARK_ROOT = ':root[data-theme="dark"]';

test("寫死白底的圖解規則都有深色覆寫", () => {
  const offenders = diagrams.flatMap((name) => {
    const style = readFileSync(new URL(name, componentsDir), "utf8").split(
      "<style",
    )[1];
    if (!style) return [];
    const rules = [...style.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
      ([, selector, body]) => ({ selector: selector!.trim(), body: body! }),
    );
    return rules
      .filter(
        ({ selector, body }) =>
          WHITE_SURFACE.test(body) && !selector.includes("data-theme"),
      )
      .flatMap(({ selector }) =>
        selector.split(",").map((part) => part.trim().split(/\s+/).pop()!),
      )
      .filter((target) => !/(?:text|label|title)$/.test(target))
      .filter(
        (target) =>
          !rules.some(
            ({ selector }) =>
              selector.includes(DARK_ROOT) &&
              selector
                .split(",")
                .some((part) => part.trim().split(/\s+/).pop() === target),
          ),
      )
      .map((target) => `${name}: ${target}`);
  });
  assert.deepEqual(offenders, []);
});

test("圖解元件的 --dg-* 不帶 hex fallback", () => {
  const offenders = diagrams.flatMap((name) => {
    const source = readFileSync(new URL(name, componentsDir), "utf8");
    const hits = source.match(HEX_FALLBACK) ?? [];
    return hits.length > 0 ? [`${name}: ${hits.length}`] : [];
  });
  assert.deepEqual(offenders, []);
});
