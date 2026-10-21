import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkGfm from "remark-gfm";
import sitemap from "@astrojs/sitemap";
import remarkCallout from "./src/utils/remark-callout.mjs";
import remarkMermaid from "./src/utils/remark-mermaid.mjs";
import rehypeHeadingAnchor from "./src/utils/rehype-heading-anchor.mjs";
import rehypeTableScroll from "./src/utils/rehype-table-scroll.mjs";

const mode =
  process.env.NODE_ENV ??
  (process.argv.includes("dev") ? "development" : "production");
/** @param {string} file */
const readEnv = (file) =>
  existsSync(file) ? parseEnv(readFileSync(file, "utf8")) : {};
const fileEnv = { ...readEnv(".env"), ...readEnv(`.env.${mode}`) };
const site =
  process.env.SITE_URL || fileEnv.SITE_URL || "https://carlstack.example";

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.endsWith("/404/") && !page.endsWith("/search/"),
    }),
  ],
  markdown: {
    processor: unified({
      // unified() 的 gfm 只是布林值、無法傳選項，所以關掉內建的，改在這裡自己掛
      // remarkGfm 並設 singleTilde: false，只有 ~~x~~ 才是刪除線（3~4 保持字面）。
      // MDX 會繼承這份外掛清單與 gfm: false。
      // remarkCjkFriendly 修正 ** 在中日韓標點旁的 flanking 判定。
      gfm: false,
      remarkPlugins: [
        remarkCjkFriendly,
        [remarkGfm, { singleTilde: false }],
        remarkMermaid,
        remarkCallout,
      ],
      // 使用者外掛跑在 Astro 內建的 rehypeHeadingIds 之前，錨點外掛要靠
      // 標題 id，所以在這裡先手動掛一次。
      rehypePlugins: [rehypeTableScroll, rehypeHeadingIds, rehypeHeadingAnchor],
    }),
    shikiConfig: {
      theme: "github-dark-default",
      wrap: true,
    },
  },
});
