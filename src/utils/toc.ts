export interface MarkdownHeading {
  depth: number;
  slug: string;
  text: string;
}

export interface TocEntry {
  depth: number;
  slug: string;
  text: string;
  children: TocEntry[];
}

const MIN_DEPTH = 2;
const MAX_DEPTH = 3;

/** 把扁平的標題清單整理成兩層目錄；孤兒 h3 提升為頂層而不是被丟掉。 */
export function buildToc(headings: readonly MarkdownHeading[]): TocEntry[] {
  const roots: TocEntry[] = [];
  let current: TocEntry | undefined;
  for (const heading of headings) {
    if (heading.depth < MIN_DEPTH || heading.depth > MAX_DEPTH) continue;
    if (!heading.slug) continue;
    const entry: TocEntry = {
      depth: heading.depth,
      slug: heading.slug,
      text: heading.text,
      children: [],
    };
    if (heading.depth === MIN_DEPTH || !current) {
      roots.push(entry);
      current = entry;
      continue;
    }
    current.children.push(entry);
  }
  return roots;
}
