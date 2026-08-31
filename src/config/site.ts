export const siteConfig = {
  name: "CarlStack",
  subtitle: "李卡爾的系統工程與 AI 工程實戰筆記",
  description:
    "李卡爾記錄系統工程、AI 工程化、API 整合、DDD 與開源專案的繁體中文技術 Blog。",
  author: "李卡爾",
  language: "zh-Hant",
  locale: "zh_TW",
  github: "https://github.com/CarlLee1983",
  githubUser: "CarlLee1983",
  defaultSocialImage: "/social-card.png",
} as const;

export const navigation = [
  { href: "/blog/", label: "文章" },
  { href: "/tags/", label: "標籤" },
  { href: "/series/", label: "系列" },
  { href: "/projects/", label: "專案" },
  { href: "/about/", label: "關於" },
] as const;
