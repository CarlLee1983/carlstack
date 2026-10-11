# Rollup 間接 await 的 chunk 回歸

- 主来源：https://github.com/rollup/rollup/releases/tag/v4.64.5 ，2026-10-10。
- 穩定 ID：rollup/rollup release v4.64.5、PR 6516；作者 ryanchou1994、lukastaegert。
- 原始與正規化 URL 相同。發布前搜尋 blog、research、queue 的 URL、Rollup、6516、作者；沒有同源或同題文章，只有資料庫降採樣的無關 Rollup 字詞。
- 系列評估：既有系列主要是後端與 AI 架構；本文是建置器回歸實測，保持獨立文章，不硬加不相符系列。

## 一手證據

https://github.com/rollup/rollup/pull/6516 的 metadata 與完整diff已核實。PR 2026-10-10合併，修正間接等待的動態入口分析；hasTopLevelAwait、addAwaitingEntries 與 getAwaitedAlreadyLoadedAtomsByEntry。後者使用聯集追蹤等待中的依賴。PR稱保守追蹤可能增加shared chunk；本文未量測效能。4.64.4的WASM big-endian修正是不同議題，不混寫為本篇根因。

## 隔離重現

2026-10-11，Linux x64，Node24.19.0，npm alias rollup-old@npm:rollup@4.64.4、rollup-new@npm:rollup@4.64.5。使用官方以下目錄的 main.js、loader.js、dynamic.js、constants.js，不改來源：
https://github.com/rollup/rollup/tree/v4.64.5/test/chunking-form/samples/preserve-entry-signatures/false-with-indirect-awaited-dynamic-import

置於獨立目錄，package.json type為module。以下為實際runner（兩版本套件另於隔離目錄安裝，不改本站依賴）：

```js
import { rollup as old } from "rollup-old";
import { rollup as fixed } from "rollup-new";
import { spawnSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
for (const [version, build] of [
  ["4.64.4", old],
  ["4.64.5", fixed],
]) {
  const bundle = await build({
    input: "main.js",
    preserveEntrySignatures: false,
  });
  const { output } = await bundle.write({
    dir: "out-" + version,
    format: "es",
    entryFileNames: "main.mjs",
    chunkFileNames: "[name].mjs",
  });
  await bundle.close();
  await writeFile(
    "out-" + version + "/runner.mjs",
    "await import('./main.mjs'); console.log('INIT_OK');\n",
  );
  const run = spawnSync(process.execPath, ["out-" + version + "/runner.mjs"], {
    encoding: "utf8",
    timeout: 5000,
  });
  console.log({
    version,
    chunks: output.map((c) => ({
      file: c.fileName,
      imports: c.imports,
      dynamicImports: c.dynamicImports,
    })),
    status: run.status,
    stdout: run.stdout,
    stderr: run.stderr,
  });
}
```

4.64.4：main無靜態imports、dynamicImports=['dynamic.mjs']；dynamic imports=['main.mjs']。執行status13，stdout空；stderr為Warning: Detected unsettled top-level await，非逾時。

4.64.5：main與dynamic各自imports=['constants.mjs']；main仍dynamicImports=['dynamic.mjs']，constants無依賴。status0，stdout='INIT_OK\n'，stderr空。

限制：單一官方fixture、ES/Node，未跑瀏覽器、SystemJS、完整upstream suite或效能benchmark。本站檢查與此上游回歸實驗分開報告。

## Cover Direction

已檢視鄰近封面：訂單契約為玻璃/斜角/淺綠金/日光；Deno為油畫/橫向渡船/黃紫/夕光；Prime為織機/俯視平行/米黃藍/均光；SonicWall為陶盤/靜物/紫紅/柔光。

本篇：循環軌道與獨立島嶼／木與紙建築模型／斜俯單環／靛藍珊瑚象牙／戲劇側光。內建正式imagegen生成原創封面，沒有文字或logo，存為本地WebP。與既有封面媒材、構圖、色盤不重覆。

## 視覺驗收

封面1672×941 WebP，全尺寸與卡片中央裁切已看像素。Rollup圖已用SVG靜態渲染檢視桌面/320px、深/淺色四版；文字可讀無重疊。雲端本機Chromium受socket與sandbox掛載限制，未完成整頁互動preview；此限制依本次授權記錄，不宣稱browser驗收通過。
