import zsnoutSevenOpenGraph from "@/assets/zsnout-7.png"
import { getCollection } from "astro:content"
import fakeGradientOpenGraph from "../art/fake-gradient/open-graph.png"
import debugMathToGLSLOpenGraph from "../debug/math-to-glsl/open-graph.png"
import deduplicateTextOpenGraph from "../deduplicate-text/open-graph.jpg"
import fractalExplorerOpenGraph from "../fractal-explorer/open-graph.png"
import fractalGalleryOpenGraph from "../fractal-gallery/open-graph.png"
import ithkuilFontGeneratorOpenGraph from "../ithkuil/font/open-graph.png"
import ithkuilFormativeGeneratorOpenGraph from "../ithkuil/generate/formative/open-graph.png"
import ithkuilUtilityKitOpenGraph from "../ithkuil/kit/open-graph.png"
import ithkuilScriptCheatSheetOpenGraph from "../ithkuil/script/cheat-sheet/open-graph.jpg"
import ithkuilScriptGeneratorOpenGraph from "../ithkuil/script/open-graph.png"
import sitelenPonaTypistOpenGraph from "../toki-pona/typist/open-graph.png"
import tropeHighlighterOpenGraph from "../trope-highlighter/open-graph.png"
import vjosaliOpenGraph from "../vjosali/open-graph.png"

export type Tag =
  | "account"
  | "art"
  | "blog"
  | "code"
  | "collaborative"
  | "debug"
  | "language"
  | "math"
  | "meta"
  | "stories"
  | "tool"

export type Category = "archive" | "blog" | "debug"

export interface Page {
  title: string
  href: `/${string}` | `https://${string}`
  subtitle: string // 100-200 words

  tags: readonly [Tag, ...Tag[]]
  published?: Date
  category?: Category
  categoryHref?: "/blog"

  imageSrc: string
  imageAlt: string
}

export interface PageTextOnly
  extends Omit<Page, "published" | "categoryHref" | "imageSrc" | "imageAlt"> {}

const nonBlogPages: readonly Page[] = [
  {
    title: "Debug: Math to GLSL",
    href: "/debug/math-to-glsl",
    subtitle:
      "A tool for debugging the math to GLSL converter used internally by the Fractal Explorer and other pages featuring customizable mathematical content.",

    tags: ["debug", "math"],
    category: "debug",

    imageAlt:
      "A light grey bug icon to the left of text saying 'Debug Page: Math to GLSL.' Yellow and black construction tape surrounds the other elements.",
    imageSrc: debugMathToGLSLOpenGraph,
  },

  {
    title: "Fake Gradient",
    href: "/art/fake-gradient",
    subtitle:
      "Can enough randomness make a smooth image? Find out by using this tool, which generates a customizable grayscale gradient using randomness.",

    tags: ["art"],

    imageSrc: fakeGradientOpenGraph,
    imageAlt: "A random-looking gradient.",
  },

  {
    title: "Deduplicate Text",
    href: "/deduplicate-text",
    subtitle:
      "A tool that removes repeated letters in text. For example, 'Hello world' is converted to 'He wrld.'",

    tags: ["tool"],

    imageAlt:
      "Two rows of text. The first reads 'Deduplicate Text', with arrows pointing the first two Ds, Es, and Ts to each other. The second row reads 'uplica ext,' with the Ds, Es, and Ts in the first row removed.",
    imageSrc: deduplicateTextOpenGraph,
  },

  {
    title: "Ithkuil Font Generator",
    href: "/ithkuil/font",
    subtitle:
      "Convert written Ithkuil text into a format suitable for use with the IthkuilBasic and IthkuilFlow fonts. Handles formatives, referentials, and adjuncts.",

    tags: ["language", "tool"],

    imageAlt:
      'zSnout\'s Ithkuil font generator, with "Wattunkí ruyün!" as the input.',
    imageSrc: ithkuilFontGeneratorOpenGraph,
  },

  {
    title: "Ithkuil Script Cheat Sheet",
    href: "/ithkuil/script/cheat-sheet",
    subtitle:
      "A single-page cheat sheet containing all the Ithkuil script core shapes and extensions.",

    tags: ["language", "tool"],

    imageAlt:
      "A screenshot of the Ithkuil Script Cheat Sheet showing the extensions and core shapes for the letters C, Č, D2, Ḑ, G2, H, L, Ļ, Ň, and P.",
    imageSrc: ithkuilScriptCheatSheetOpenGraph,
  },

  {
    title: "Ithkuil Formative Generator",
    href: "/ithkuil/generate/formative",
    subtitle:
      "Create words in Ithkuil by selecting grammatical categories from dropdowns and searching through roots and affixes. Comes with a built-in glosser.",

    tags: ["language", "tool"],

    imageAlt:
      "zSnout's Ithkuil formative generator, with 'ersmlakpalla' as the input.",
    imageSrc: ithkuilFormativeGeneratorOpenGraph,
  },

  {
    title: "sitelen pona typist",
    href: "/toki-pona/typist",
    subtitle:
      "Practice typing using the sitelen pona keyboard layout from kreativekorp.com by choosing which keys to practice with and which ones to ignore.",

    tags: ["language", "tool"],

    imageAlt:
      "A section of the sitelen pona typist page, with five keys at the top visible reading 'o pi luka e toki'. The first two keys are highlighted in green, and the keyboard below has the 'luka' key highlighted in blue.",
    imageSrc: sitelenPonaTypistOpenGraph,
  },

  {
    title: "Fractal Explorer",
    href: "/fractal-explorer",
    subtitle:
      "Explore beautiful mathematical fractals by using custom equations, zooming deeply into nested structures, and adjusting many settings to vary the color scheme.",

    tags: ["art", "math"],

    imageAlt: "A multicolored zoom of the Mandelbrot Set.",
    imageSrc: fractalExplorerOpenGraph,
  },

  {
    title: "Ithkuil Script Generator",
    href: "/ithkuil/script",
    subtitle:
      "Quickly write in the block script of the constructed language Ithkuil using our simple online SVG generator. Handles formatives, referentials, and adjuncts.",

    tags: ["language", "tool"],

    imageAlt:
      'zSnout\'s Ithkuil script generator, with "Wattunkí ruyün!" as the input.',
    imageSrc: ithkuilScriptGeneratorOpenGraph,
  },

  {
    title: "Trope Highlighter",
    href: "/trope-highlighter",
    subtitle:
      "A tool which colors Hebrew words based on their tropes. Great for learning Torah passages, as you can learn the sounds of colors rather than trying to find tiny trope markers.",

    tags: ["tool"],

    imageAlt:
      "A paragraph of Hebrew text where each word has a background color depending on its trope.",
    imageSrc: tropeHighlighterOpenGraph,
  },

  {
    title: "Vjosali",
    href: "/vjosali",
    subtitle:
      "Libre afto har kotoba mange au riso au imi au tatoeba, per maxaklar kotobafto na du. Jam riso klarmange au siruting mange. Leratsa os leragen kotoba f'viossa mit librafto, Vjosali!",

    tags: ["language", "tool"],

    imageAlt:
      "kotoli ie na ljeva obs, risoli ie na ljeva unna, kotoba 'al' au tatoeba fsore au lykko fsore au kundrko fsore ie na mygy.",
    imageSrc: vjosaliOpenGraph,
  },

  {
    title: "zSnout 7",
    href: "https://v7dyn.zsnout.com",
    subtitle:
      "See the previous generation of zSnout's site, featuring over 50 pages. Includes puzzles, learning tools, spinning turntables, 4 versions of the Storymatic language, and games to play online with friends.",

    tags: ["meta"],
    category: "archive",

    imageSrc: zsnoutSevenOpenGraph,
    imageAlt: "A grid of 32 of zSnout 7's most important pages.",
  },

  {
    title: "Ithkuil Utility Kit",
    href: "/ithkuil/kit",
    subtitle:
      "Gloss Ithkuil words, construct them from grammatical category lists, search roots and affixes, and write in the calligraphic and handwritten scripts. Handles all word types.",

    tags: ["language", "tool"],

    imageAlt:
      'At the top, the input box with several word glosses and the words malëuţřaitie and šio. Below, the first three words with glosses and handwritten Ithkuil script. To the right, a list of alternatives to S0-čv for the word "tool".',
    imageSrc: ithkuilUtilityKitOpenGraph,
  },

  {
    title: "Fractal Gallery",
    href: "/fractal-gallery",
    subtitle:
      "Explore a gallery of fractal designs created by others, and click any fractal's image to open it in fullscreen, so you can better explore it on your own device.",

    tags: ["art", "math"],

    imageAlt: "Eighteen fractals in a six by three grid.",
    imageSrc: fractalGalleryOpenGraph,
  },
]

const blogPages: readonly Page[] = await Promise.all(
  (await getCollection("blog", (entry) => !entry.data.draft))
    .sort((a, b) =>
      a.data.published < b.data.published ? 1
      : a.data.published > b.data.published ? -1
      : 0,
    )
    .map<Promise<Page>>(async (entry) => ({
      title: entry.data.title,
      href: `/blog/${entry.slug}`,
      subtitle: entry.data.excerpt,

      tags: [entry.data.category],
      published: entry.data.published,
      category: "blog",
      categoryHref: "/blog",

      imageAlt: entry.data.imageAlt,
      imageSrc: (
        await import(
          `../../assets/blog/${
            entry.id.endsWith(".mdx") ?
              entry.id.slice(0, -4)
            : entry.id.slice(0, -3)
          }.jpg`
        )
      ).default,
    })),
)

export const accountEntry: readonly PageTextOnly[] = [
  {
    href: "/log-in/passwordless",
    title: "Log In",
    subtitle:
      "Log in to your zSnout account to unlock access to additional pages, such as the recently updated Stories.",
    tags: ["account"],
  },
  {
    href: "/sign-up",
    title: "Sign Up",
    subtitle:
      "Sign up for a free zSnout account to unlock access to additional pages, such as the recently updated Stories.",
    tags: ["account"],
  },
]

export const accountVerified: readonly PageTextOnly[] = [
  {
    href: "/story",
    title: "Story Groups",
    subtitle:
      "Collaboratively write with friends, but with a twist: you can only see the immediately previous sentence written.",
    tags: ["account", "collaborative"],
  },
  {
    href: "/account",
    title: "My Account",
    subtitle:
      "See details about your account, including your username, email, and verification date. Also includes a button to sign out on this device.",
    tags: ["account"],
  },
]

export const pages: readonly Page[] = [...blogPages, ...nonBlogPages]
