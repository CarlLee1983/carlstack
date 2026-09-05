import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../tokens.css", import.meta.url), "utf8");

function luminance(hex: string) {
  assert.match(hex, /^#[\da-f]{6}$/i);
  const channels = hex.match(/[\da-f]{2}/gi)!.map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

test("深淺色與系統深色 fallback 的文字及主色按鈕對比至少 4.5:1", () => {
  const palettes = [...css.matchAll(/\{([^{}]+)\}/g)]
    .map((block) =>
      Object.fromEntries(
        [...block[1]!.matchAll(/--color-([\w-]+):\s*(#[\da-f]{6});/gi)].map(
          ([, name, value]) => [name, value],
        ),
      ),
    )
    .filter((palette) => palette.paper);
  assert.equal(palettes.length, 3);
  for (const palette of palettes) {
    for (const [foreground, background] of [
      ["ink-2", "paper"],
      ["muted", "paper"],
      ["accent", "paper"],
      ["accent-ink", "accent"],
    ] as const) {
      const values = [palette[foreground], palette[background]].map(luminance);
      const ratio = (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
      assert.ok(
        ratio >= 4.5,
        `${foreground}/${background}: ${ratio.toFixed(2)}`,
      );
    }
  }
});
