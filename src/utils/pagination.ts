export const POSTS_PER_PAGE = 10;

export interface PageLink {
  number: number;
  href: string;
  current: boolean;
}

export type PaginationElement =
  ({ type: "page" } & PageLink) | { type: "ellipsis"; key: string };

export interface PaginationState<T> {
  items: T[];
  current: number;
  total: number;
  prevHref: string | null;
  nextHref: string | null;
  pages: PageLink[];
  elements: PaginationElement[];
}

/** 第一頁維持 /blog/，避免同一份清單有兩個可索引網址。 */
export function blogPageHref(page: number): string {
  return page <= 1 ? "/blog/" : `/blog/page/${page}/`;
}

function buildPaginationElements(
  total: number,
  current: number,
  hrefFor: (page: number) => string,
): PaginationElement[] {
  const toPageItem = (num: number): PaginationElement => ({
    type: "page",
    number: num,
    href: hrefFor(num),
    current: num === current,
  });

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => toPageItem(i + 1));
  }

  const elements: PaginationElement[] = [];
  const showLeftEllipsis = current > 4;
  const showRightEllipsis = current < total - 3;

  if (!showLeftEllipsis && showRightEllipsis) {
    // 靠近前側：1 2 3 4 5 ... total
    const end = Math.max(current + 1, 3);
    for (let i = 1; i <= Math.min(end, total - 1); i++) {
      elements.push(toPageItem(i));
    }
    elements.push({ type: "ellipsis", key: "right-ellipsis" });
    elements.push(toPageItem(total));
  } else if (showLeftEllipsis && !showRightEllipsis) {
    // 靠近後側：1 ... (total-4) (total-3) (total-2) (total-1) total
    elements.push(toPageItem(1));
    elements.push({ type: "ellipsis", key: "left-ellipsis" });
    const start = Math.min(current - 1, total - 2);
    for (let i = Math.max(start, 2); i <= total; i++) {
      elements.push(toPageItem(i));
    }
  } else {
    // 中間：1 ... (current-1) current (current+1) ... total
    elements.push(toPageItem(1));
    elements.push({ type: "ellipsis", key: "left-ellipsis" });
    for (let i = current - 1; i <= current + 1; i++) {
      elements.push(toPageItem(i));
    }
    elements.push({ type: "ellipsis", key: "right-ellipsis" });
    elements.push(toPageItem(total));
  }

  return elements;
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
  const pages: PageLink[] = Array.from({ length: total }, (_, index) => ({
    number: index + 1,
    href: hrefFor(index + 1),
    current: index + 1 === page,
  }));

  return {
    items: items.slice(start, start + pageSize),
    current: page,
    total,
    prevHref: page > 1 ? hrefFor(page - 1) : null,
    nextHref: page < total ? hrefFor(page + 1) : null,
    pages,
    elements: buildPaginationElements(total, page, hrefFor),
  };
}
