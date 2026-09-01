import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
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
  integrations: [mdx(), sitemap({ filter: (page) => !page.endsWith("/404/") })],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMermaid, remarkCallout],
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
