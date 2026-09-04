import assert from "node:assert/strict";
import test from "node:test";
import { buildShareUrls, copyShareUrl } from "../src/utils/share.ts";

test("分享連結優先使用 canonical 並正確編碼標題與網址", () => {
  const urls = buildShareUrls({
    title: "本機 AI Agent：邊界",
    pageUrl: "https://carlstack.example/blog/local-agent/",
    canonicalUrl: "https://source.example/posts/agent?lang=zh-TW",
  });

  assert.equal(urls.shareUrl, "https://source.example/posts/agent?lang=zh-TW");
  assert.equal(new URL(urls.x).searchParams.get("text"), "本機 AI Agent：邊界");
  assert.equal(
    new URL(urls.x).searchParams.get("url"),
    "https://source.example/posts/agent?lang=zh-TW",
  );
  assert.equal(new URL(urls.linkedIn).searchParams.get("url"), urls.shareUrl);
  assert.equal(new URL(urls.facebook).searchParams.get("u"), urls.shareUrl);
});

test("沒有 canonical 時分享本站文章網址", () => {
  const urls = buildShareUrls({
    title: "文章",
    pageUrl: "https://carlstack.example/blog/article/",
  });

  assert.equal(urls.shareUrl, "https://carlstack.example/blog/article/");
});

test("複製連結回報成功或失敗", async () => {
  const copied: string[] = [];
  const clipboard = { writeText: async (url: string) => void copied.push(url) };

  assert.equal(
    await copyShareUrl(clipboard, "https://carlstack.example/blog/article/"),
    "文章連結已複製",
  );
  assert.deepEqual(copied, ["https://carlstack.example/blog/article/"]);
  assert.equal(
    await copyShareUrl(
      { writeText: async () => Promise.reject(new Error("denied")) },
      "https://carlstack.example/blog/article/",
    ),
    "無法複製連結，請手動複製網址",
  );
  assert.equal(
    await copyShareUrl(undefined, "https://carlstack.example/blog/article/"),
    "無法複製連結，請手動複製網址",
  );
});
