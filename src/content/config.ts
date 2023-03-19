import { defineCollection, z } from "astro:content"

const blogCollection = defineCollection({
  schema: z.object({
    author: z.string().default("Zachary Sakowitz"),
    category: z.enum(["code", "language", "math", "meta", "saurs"]),
    draft: z.boolean().optional(),
    excerpt: z.string(),
    published: z.date(),
    title: z.string(),
    updated: z.date().optional(),
  }),
})

export const collections = {
  blog: blogCollection,
}
