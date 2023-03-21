import { getCollection } from "astro:content"

export const allTags = ["art", "blog", "debug", "math", "tool"] as const

export type Tag = (typeof allTags)[number]

export const allCategories = ["blog", "debug"] as const

export type Category = (typeof allCategories)[number]

export interface Page {
  title: string
  shortSubtitle: string // 60-65 words
  longSubtitle: string // 100-200 words

  tags: readonly Tag[]
  category?: Category

  imageSrc: string
  imageAlt: string
}

export const blogPages: readonly Page[] = await Promise.all(
  (
    await getCollection("blog", (entry) => !entry.data.draft)
  )
    .sort((a, b) =>
      a.data.published < b.data.published
        ? 1
        : a.data.published > b.data.published
        ? -1
        : 0,
    )
    .map<Promise<Page>>(async (entry) => ({
      title: entry.data.title,
      shortSubtitle: entry.data.description,
      longSubtitle: entry.data.excerpt,

      tags: ["blog"],
      category: "blog",

      imageAlt: entry.data.imageAlt,
      imageSrc: await import(
        `../assets/blog/${
          entry.id.endsWith(".mdx")
            ? entry.id.slice(0, -4)
            : entry.id.slice(0, -3)
        }.jpg`
      ),
    })),
)

export const pages: readonly Page[] = [
  ...blogPages,

  {
    title: "Fractal Explorer",
    shortSubtitle: "Explore fractals with custom equations and color palettes.",
    longSubtitle:
      "Explore beautiful mathematical fractals by using custom equations, zooming deeply into nested structures, and adjusting many settings to vary the color scheme.",

    tags: ["art", "math"],

    imageAlt: "A combination of thumbnails for various pages on zSnout.",
    imageSrc: (await import("./open-graph.jpg")).default,
  },

  {
    title: "Deduplicate Text",
    shortSubtitle:
      "A tool to remove repeated letters (e.g. Hello world => He wrld).",
    longSubtitle:
      "A tool that removed repeated letters in text. For example, 'Hello world' is converted to 'He wrld.'",

    tags: ["tool"],

    imageAlt:
      "Two rows of text. The first reads 'Deduplicate Text', with arrows pointing the first two Ds, Es, and Ts to each other. The second row reads 'uplica ext,' with the Ds, Es, and Ts in the first row removed.",
    imageSrc: (await import("./deduplicate-text/open-graph.jpg")).default,
  },

  {
    title: "Debug: Math to GLSL",
    shortSubtitle: "A tool to convert math expressions to GLSL.",
    longSubtitle:
      "A tool for debugging to math to GLSL converter used internally by the Fractal Explorer and other pages featuring customizable mathematical content.",

    tags: ["debug", "math"],
    category: "debug",

    imageAlt:
      "A light grey bug icon to the left of text saying 'Debug Page: Math to GLSL.' Yellow and black construction tape surrounds the other elements.",
    imageSrc: (await import("./debug/math-to-glsl/open-graph.png")).default,
  },
]
