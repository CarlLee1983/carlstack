import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { normalizeTaxonomy } from "./utils/content";

const taxonomyName = z
  .string()
  .trim()
  .min(1)
  .refine((value) => normalizeTaxonomy(value).length > 0, {
    message: "標籤或系列名稱必須包含至少一個字母或數字。",
  });

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        description: z.string().min(1),
        publishDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        draft: z.boolean(),
        featured: z.boolean().default(false),
        tags: z.array(taxonomyName).default([]),
        series: taxonomyName.optional(),
        seriesOrder: z.number().int().positive().optional(),
        cover: image().optional(),
        coverAlt: z.string().trim().min(1).optional(),
        canonicalUrl: z.url().optional(),
        repositoryUrl: z.url().optional(),
      })
      .superRefine((data, context) => {
        if (!data.draft && !data.cover) {
          context.addIssue({
            code: "custom",
            path: ["cover"],
            message: "正式文章必須設定 cover。",
          });
        }
        if (!data.draft && !data.coverAlt) {
          context.addIssue({
            code: "custom",
            path: ["coverAlt"],
            message: "正式文章必須設定 coverAlt。",
          });
        }
        if (data.draft && data.cover && !data.coverAlt) {
          context.addIssue({
            code: "custom",
            path: ["coverAlt"],
            message: "設定 cover 時必須提供 coverAlt。",
          });
        }
        if (data.seriesOrder && !data.series) {
          context.addIssue({
            code: "custom",
            path: ["seriesOrder"],
            message: "設定 seriesOrder 時必須提供 series。",
          });
        }
      }),
});

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z
      .object({
        name: z.string().min(1),
        description: z.string().min(1),
        repositoryUrl: z.url(),
        homepageUrl: z.url().optional(),
        status: z.string().min(1),
        featured: z.boolean().default(false),
        tags: z.array(z.string().min(1)).default([]),
        startedAt: z.coerce.date().optional(),
        cover: image().optional(),
        coverAlt: z.string().trim().min(1).optional(),
      })
      .superRefine((data, context) => {
        if (data.cover && !data.coverAlt) {
          context.addIssue({
            code: "custom",
            path: ["coverAlt"],
            message: "設定專案 cover 時必須提供 coverAlt。",
          });
        }
      }),
});

export const collections = { blog, projects };
