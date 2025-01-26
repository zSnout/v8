import { defineCollection, z } from "astro:content"
import { STYLES } from "../../astro.styles.mjs"

const blog = defineCollection({
  type: "content",
  schema: z.object({
    category: z.enum(["code", "language", "math", "meta", "stories"]),
    description: z.string(),
    draft: z.boolean().optional(),
    excerpt: z.string(),
    imageAlt: z.string(),
    published: z.date(),
    title: z.string(),
    updated: z.date().optional(),
  }),
})

const ithkuil = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    open: z.boolean().optional(),
    tag: z.enum(Object.keys(STYLES)).optional(),
  }),
})

export const collections = { blog, ithkuil }
