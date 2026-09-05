export interface BlogDataShape {
  publishDate: Date;
  draft: boolean;
  tags: string[];
  series?: string;
  seriesOrder?: number;
}

export interface WithBlogData {
  data: BlogDataShape;
}

export function sortByPublishDate<T extends WithBlogData>(entries: T[]): T[] {
  return [...entries].sort(
    (left, right) =>
      right.data.publishDate.getTime() - left.data.publishDate.getTime(),
  );
}

export function filterDrafts<T extends WithBlogData>(
  entries: T[],
  includeDrafts: boolean,
): T[] {
  return includeDrafts ? entries : entries.filter((entry) => !entry.data.draft);
}

export function normalizeTaxonomy(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("zh-Hant")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function sortSeries<T extends WithBlogData>(entries: T[]): T[] {
  return [...entries].sort((left, right) => {
    const order =
      (left.data.seriesOrder ?? Number.MAX_SAFE_INTEGER) -
      (right.data.seriesOrder ?? Number.MAX_SAFE_INTEGER);
    return (
      order ||
      left.data.publishDate.getTime() - right.data.publishDate.getTime()
    );
  });
}

export function getEntrySlug(id: string): string {
  return id.replace(/\.(md|mdx)$/i, "").replace(/\/index$/i, "");
}

export function estimateReadingMinutes(markdown: string): number {
  const cjkCount = markdown.match(/[\u3400-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
  const latinCount = markdown
    .replace(/[\u3400-\u9fff\uf900-\ufaff]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(cjkCount / 400 + latinCount / 200));
}

export interface WithPosts {
  name: string;
  posts: unknown[];
}

/** 分類依文章數倒序；同數量時依名稱，讓首頁與標籤頁先露出真正的主題。 */
export function sortByPostCount<T extends WithPosts>(groups: T[]): T[] {
  return [...groups].sort(
    (left, right) =>
      right.posts.length - left.posts.length ||
      left.name.localeCompare(right.name, "zh-Hant"),
  );
}
