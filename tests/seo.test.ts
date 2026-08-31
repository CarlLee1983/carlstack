import assert from "node:assert/strict";
import test from "node:test";
import { buildSeoMetadata } from "../src/utils/seo.ts";

test("SEO metadata 由 SITE_URL 產生 canonical 與預設分享圖", () => {
  const metadata = buildSeoMetadata({
    site: new URL("https://carlstack.example"),
    path: "/blog/hello/",
    title: "文章",
    description: "摘要",
  });
  assert.equal(metadata.canonical, "https://carlstack.example/blog/hello/");
  assert.equal(metadata.image, "https://carlstack.example/social-card.png");
  assert.equal(metadata.type, "website");
});

test("文章可覆寫 canonical、分享圖與內容類型", () => {
  const metadata = buildSeoMetadata({
    site: new URL("https://carlstack.example"),
    path: "/ignored/",
    title: "文章",
    description: "摘要",
    canonicalUrl: "https://source.example/post",
    image: "/covers/post.png",
    type: "article",
  });
  assert.equal(metadata.canonical, "https://source.example/post");
  assert.equal(metadata.image, "https://carlstack.example/covers/post.png");
  assert.equal(metadata.type, "article");
});
