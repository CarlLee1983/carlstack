import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { siteConfig } from "../config/site";
import { getVisiblePosts, postHref } from "../utils/collections";

export const GET: APIRoute = async (context) => {
  const posts = (await getVisiblePosts()).filter((post) => !post.data.draft);
  return rss({
    title: `${siteConfig.name} — ${siteConfig.subtitle}`,
    description: siteConfig.description,
    site: context.site!,
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: postHref(post),
      categories: post.data.tags,
    })),
    customData: `<language>${siteConfig.language}</language>`,
  });
};
