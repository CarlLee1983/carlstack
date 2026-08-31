interface SeoInput {
  site: URL;
  path: string;
  title: string;
  description: string;
  image?: string;
  canonicalUrl?: string;
  type?: "website" | "article";
}

export interface SeoMetadata {
  title: string;
  description: string;
  canonical: string;
  image: string;
  type: "website" | "article";
}

export function buildSeoMetadata(input: SeoInput): SeoMetadata {
  const canonical = input.canonicalUrl ?? new URL(input.path, input.site).href;
  return {
    title: input.title,
    description: input.description,
    canonical,
    image: new URL(input.image ?? "/social-card.png", input.site).href,
    type: input.type ?? "website",
  };
}
