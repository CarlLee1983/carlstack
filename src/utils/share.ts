interface ShareUrlsInput {
  title: string;
  pageUrl: string;
  canonicalUrl?: string;
}

export function buildShareUrls({
  title,
  pageUrl,
  canonicalUrl,
}: ShareUrlsInput) {
  const shareUrl = canonicalUrl ?? pageUrl;
  const x = new URL("https://x.com/intent/post");
  x.searchParams.set("text", title);
  x.searchParams.set("url", shareUrl);
  const linkedIn = new URL("https://www.linkedin.com/sharing/share-offsite/");
  linkedIn.searchParams.set("url", shareUrl);
  const facebook = new URL("https://www.facebook.com/sharer/sharer.php");
  facebook.searchParams.set("u", shareUrl);

  return {
    shareUrl,
    x: x.href,
    linkedIn: linkedIn.href,
    facebook: facebook.href,
  };
}

export async function copyShareUrl(
  clipboard: Pick<Clipboard, "writeText"> | undefined,
  url: string,
) {
  try {
    if (!clipboard) throw new Error("Clipboard API unavailable");
    await clipboard.writeText(url);
    return "文章連結已複製";
  } catch {
    return "無法複製連結，請手動複製網址";
  }
}
