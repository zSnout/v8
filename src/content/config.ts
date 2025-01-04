import { defineCollection, z } from "astro:content"

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
  }),
})

export const collections = { blog, ithkuil }
