import { getCollection } from "astro:content"
import debugMathToGLSLOpenGraph from "../debug/math-to-glsl/open-graph.png"
import deduplicateTextOpenGraph from "../deduplicate-text/open-graph.jpg"
import fractalExplorerOpenGraph from "../fractal-explorer/open-graph.png"

export type Tag =
  | "art"
  | "blog"
  | "code"
  | "debug"
  | "language"
  | "math"
  | "meta"
  | "stories"
  | "tool"

export type Category = "blog" | "debug"

export interface Page {
  title: string
  href: string
  shortSubtitle: string // 60-65 words
  longSubtitle: string // 100-200 words

  tags: readonly [Tag, ...Tag[]]
  published?: Date
  category?: Category
  categoryHref?: "/blog"

  imageSrc: string
  imageAlt: string
}

export const nonBlogPages: readonly Page[] = [
  {
    title: "Fractal Explorer",
    href: "/fractal-explorer",
    shortSubtitle: "Explore fractals with custom equations and color palettes.",
    longSubtitle:
      "Explore beautiful mathematical fractals by using custom equations, zooming deeply into nested structures, and adjusting many settings to vary the color scheme.",

    tags: ["art", "math"],

    imageAlt: "A multicolored zoom of the Mandelbrot Set.",
    imageSrc: fractalExplorerOpenGraph,
  },

  {
    title: "Deduplicate Text",
    href: "/deduplicate-text",
    shortSubtitle:
      "A tool to remove repeated letters (e.g. Hello world => He wrld).",
    longSubtitle:
      "A tool that removes repeated letters in text. For example, 'Hello world' is converted to 'He wrld.'",

    tags: ["tool"],

    imageAlt:
      "Two rows of text. The first reads 'Deduplicate Text', with arrows pointing the first two Ds, Es, and Ts to each other. The second row reads 'uplica ext,' with the Ds, Es, and Ts in the first row removed.",
    imageSrc: deduplicateTextOpenGraph,
  },

  {
    title: "Debug: Math to GLSL",
    href: "/debug/math-to-glsl",
    shortSubtitle: "A tool which converts math expressions to GLSL.",
    longSubtitle:
      "A tool for debugging the math to GLSL converter used internally by the Fractal Explorer and other pages featuring customizable mathematical content.",

    tags: ["debug", "math"],
    category: "debug",

    imageAlt:
      "A light grey bug icon to the left of text saying 'Debug Page: Math to GLSL.' Yellow and black construction tape surrounds the other elements.",
    imageSrc: debugMathToGLSLOpenGraph,
  },
]

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
      href: "/blog/" + entry.slug,
      shortSubtitle: entry.data.description,
      longSubtitle: entry.data.excerpt,

      tags: [entry.data.category],
      published: entry.data.published,
      category: "blog",
      categoryHref: "/blog",

      imageAlt: entry.data.imageAlt,
      imageSrc: (
        await import(
          `../../assets/blog/${
            entry.id.endsWith(".mdx")
              ? entry.id.slice(0, -4)
              : entry.id.slice(0, -3)
          }.jpg`
        )
      ).default,
    })),
)

export const pages: readonly Page[] = [...blogPages, ...nonBlogPages]
