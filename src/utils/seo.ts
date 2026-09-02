interface SeoInput {
  site: URL;
  path: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  canonicalUrl?: string;
  type?: "website" | "article";
}

export interface SeoMetadata {
  title: string;
  description: string;
  canonical: string;
  image: string;
  imageAlt: string;
  type: "website" | "article";
}

export function buildSeoMetadata(input: SeoInput): SeoMetadata {
  const canonical = input.canonicalUrl ?? new URL(input.path, input.site).href;
  return {
    title: input.title,
    description: input.description,
    canonical,
    image: new URL(input.image ?? "/social-card.png", input.site).href,
    imageAlt: input.imageAlt ?? input.title,
    type: input.type ?? "website",
  };
}
