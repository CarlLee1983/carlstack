import { getCollection, type CollectionEntry } from "astro:content";
import {
  filterDrafts,
  getEntrySlug,
  normalizeTaxonomy,
  sortByPublishDate,
  sortSeries,
} from "./content";

export async function getVisiblePosts(): Promise<CollectionEntry<"blog">[]> {
  const entries = await getCollection("blog");
  return sortByPublishDate(filterDrafts(entries, import.meta.env.DEV));
}

export function postHref(post: CollectionEntry<"blog">): string {
  return `/blog/${getEntrySlug(post.id)}/`;
}

export function collectTaxonomy(
  posts: CollectionEntry<"blog">[],
  key: "tags" | "series",
) {
  const map = new Map<
    string,
    { name: string; slug: string; posts: CollectionEntry<"blog">[] }
  >();
  for (const post of posts) {
    const values =
      key === "tags"
        ? post.data.tags
        : post.data.series
          ? [post.data.series]
          : [];
    for (const name of values) {
      const slug = normalizeTaxonomy(name);
      const current = map.get(slug) ?? { name, slug, posts: [] };
      current.posts.push(post);
      map.set(slug, current);
    }
  }
  return [...map.values()].sort((left, right) =>
    left.name.localeCompare(right.name, "zh-Hant"),
  );
}

export function getSeriesPosts(
  posts: CollectionEntry<"blog">[],
  series: string,
) {
  const slug = normalizeTaxonomy(series);
  return sortSeries(
    posts.filter(
      (post) =>
        post.data.series && normalizeTaxonomy(post.data.series) === slug,
    ),
  );
}
