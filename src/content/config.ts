import { defineCollection, z } from "astro:content"

const blogCollection = defineCollection({
  schema: z.object({
    author: z.string(),
    category: z.enum(["code", "language", "math", "meta", "saurs"]),
    date: z.date(),
    draft: z.boolean().optional(),
    excerpt: z.string().optional(),
    title: z.string(),
    updated: z.date().optional(),
  }),
})

export const collections = {
  blog: blogCollection,
}
