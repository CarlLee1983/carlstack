export const POSTS_PER_PAGE = 10;

export interface PageLink {
  number: number;
  href: string;
  current: boolean;
}

export interface PaginationState<T> {
  items: T[];
  current: number;
  total: number;
  prevHref: string | null;
  nextHref: string | null;
  pages: PageLink[];
}

/** 第一頁維持 /blog/，避免同一份清單有兩個可索引網址。 */
export function blogPageHref(page: number): string {
  return page <= 1 ? "/blog/" : `/blog/page/${page}/`;
}

export function paginate<T>(
  items: readonly T[],
  current = 1,
  pageSize = POSTS_PER_PAGE,
  hrefFor: (page: number) => string = blogPageHref,
): PaginationState<T> {
  const total = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(Math.trunc(current), 1), total);
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    current: page,
    total,
    prevHref: page > 1 ? hrefFor(page - 1) : null,
    nextHref: page < total ? hrefFor(page + 1) : null,
    pages: Array.from({ length: total }, (_, index) => ({
      number: index + 1,
      href: hrefFor(index + 1),
      current: index + 1 === page,
    })),
  };
}
