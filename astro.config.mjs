import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkMermaid from "./src/utils/remark-mermaid.mjs";

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
    processor: unified({ remarkPlugins: [remarkMermaid] }),
    shikiConfig: {
      theme: "github-dark-default",
      wrap: true,
    },
  },
});
