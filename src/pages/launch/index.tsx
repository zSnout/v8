import { clsx } from "@/components/clsx"
import { Fa } from "@/components/Fa"
import { faClock } from "@fortawesome/free-regular-svg-icons"
import {
  faBook,
  faCancel,
  faCheck,
  faGlobe,
  faL,
  faList,
  faM,
  faMailBulk,
  faPlus,
  faRobot,
  faRotate,
  faS,
  faSpinner,
  faT,
  faTerminal,
  faThumbsUp,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { For, Show } from "solid-js"

type Month =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "May"
  | "Jun"
  | "Jul"
  | "Aug"
  | "Sep"
  | "Oct"
  | "Nov"
  | "Dec"

type Season = "Winter" | "Spring" | "Summer" | "Fall" | "Early"

type Time = `${number}` | `${Month} ${number}` | `${Season} ${number}`

interface Project {
  readonly id: number
  readonly description: string
  readonly stats: {
    readonly completion: "In Progress" | "Often Updated" | "Completed"
    readonly functionality: "Partially" | "None" | "Functional"
    readonly publicity:
      | "has website"
      | "source only"
      | "packaged"
      | "lost to history"
    readonly size: "Large" | "Small" | "Midsize" | "Tiny"
    readonly type:
      | "Compilation"
      | "Website"
      | "Application"
      | "Extension"
      | "Library"
      | "Library"
      | "Discord Bot"
      | "API"
  }
  readonly time: Time | `${Time} ~ ${Time}`
  readonly title: string
  readonly tools: {
    readonly client:
      | "html tailwind solid"
      | "html tailwind svelte"
      | "html tailwind vue"
      | "rust"
      | "javascript"
      | "discord"
      | "html css zquery"
      | "typescript"
      | "html css ts"
      | "html css js"
      | "php"
      | "md css js"
      | "python"
      | "html css jquery"
    readonly database:
      | ""
      | "mysql"
      | "prisma mongodb"
      | "on-device sqlite"
      | "mongodb"
    readonly docs:
      | ""
      | "html css zquery"
      | "builtin"
      | "rustdoc"
      | "md"
      | "md jekyll css"
      | "jsdoc"
    readonly email: "" | "nodemailer"
    readonly infra:
      | "php"
      | "vercel astro solid"
      | "source only"
      | "vercel sveltekit"
      | "node vue"
      | "vercel vite solid"
      | "crates.io"
      | "github pages"
      | "chrome web store"
      | "node"
      | "node fastify"
      | "npm"
      | "vercel astro"
      | "browser only"
    readonly offline: "" | "vite-pwa"
    readonly realtime: "" | "socketio" | "discordjs" | "socketio peerjs"
  }
  readonly viewableAt:
    | `https://${string}`
    | "currently nonexistent"
    | "no link found yet"
    | "project data deleted due to poor backups"
}

const data: readonly Project[] = [
  {
    title: "zSnout 8",
    id: 35,
    time: "2023 ~ 24",
    stats: {
      completion: "Often Updated",
      publicity: "has website",
      functionality: "Functional",
      size: "Large",
      type: "Compilation",
    },
    viewableAt: "https://v8.zsnout.com",
    description:
      "Personal project compilation. Contains newer projects like the Ithkuil Script Generator, Fractal Explorer 8, and Vjosali.",
    tools: {
      client: "html tailwind solid",
      docs: "",
      infra: "vercel astro solid",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "kama sona",
    id: 27,
    time: "Jan 2023",
    stats: {
      completion: "In Progress",
      publicity: "has website",
      functionality: "Functional",
      size: "Large",
      type: "Application",
    },
    viewableAt: "https://ks.zsnout.com",
    description:
      "Learning management platform, complete with classes, resources, assignments, a bulletin board, passwordless login, and fingerprint-based login.",
    tools: {
      client: "html tailwind svelte",
      docs: "",
      infra: "vercel sveltekit",
      realtime: "",
      email: "nodemailer",
      database: "prisma mongodb",
      offline: "",
    },
  },
  {
    title: "Ithkuil Script Generator",
    id: 30,
    time: "Summer 2023",
    stats: {
      completion: "Often Updated",
      publicity: "has website",
      functionality: "Functional",
      size: "Large",
      type: "Website",
    },
    viewableAt: "https://v8.zsnout.com/ithkuil/script",
    description:
      "Turns Ithkuil romanizations into their calligraphic or handwritten script forms.",
    tools: {
      client: "html tailwind solid",
      docs: "",
      infra: "vercel astro solid",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Scheduler",
    id: 40,
    time: "Mar 2024",
    stats: {
      completion: "Completed",
      publicity: "has website",
      functionality: "Functional",
      size: "Large",
      type: "Application",
    },
    viewableAt: "https://scheduler.zsnout.com",
    description:
      "Scheduling tool based around the concept of having set blocks of time into which events can be added.",
    tools: {
      client: "html tailwind solid",
      docs: "builtin",
      infra: "vercel astro solid",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "zSnout 7",
    id: 23,
    time: "2022 ~ 23",
    stats: {
      completion: "Completed",
      publicity: "has website",
      functionality: "Functional",
      size: "Large",
      type: "Compilation",
    },
    viewableAt: "https://v7.zsnout.com",
    description:
      "Personal project compilation. First personal site to exclusively use realtime communication between server and client.",
    tools: {
      client: "html tailwind vue",
      docs: "",
      infra: "node vue",
      realtime: "socketio",
      email: "nodemailer",
      database: "prisma mongodb",
      offline: "",
    },
  },
  {
    title: "Vjosali",
    id: 44,
    time: "May 2024",
    stats: {
      completion: "Often Updated",
      publicity: "has website",
      functionality: "Functional",
      size: "Midsize",
      type: "Website",
    },
    viewableAt: "https://v8.zsnout.com/vjosali",
    description:
      "Viossa picture dictionary, incorporating a slide Deck and emojis to better teach the words in it.",
    tools: {
      client: "html tailwind solid",
      docs: "",
      infra: "vercel astro solid",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Fractal Explorer 8",
    id: 36,
    time: "2023 ~ 24",
    stats: {
      completion: "Often Updated",
      publicity: "has website",
      functionality: "Functional",
      size: "Large",
      type: "Website",
    },
    viewableAt: "https://v8.zsnout.com/fractal-explorer",
    description:
      "Fractal explorer with a GLSL renderer. Packed with tons of new features for highly customizable coloring and interactivity options.",
    tools: {
      client: "html tailwind solid",
      docs: "",
      infra: "vercel astro solid",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "zSnout Learn",
    id: 47,
    time: "Jul 2024",
    stats: {
      completion: "In Progress",
      publicity: "has website",
      functionality: "Partially",
      size: "Large",
      type: "Application",
    },
    viewableAt: "https://learn.zsnout.com/",
    description:
      "Space repetition flashcard application for less stressful learning. Clone of Anki built priMarily for the web.",
    tools: {
      client: "html tailwind solid",
      docs: "",
      infra: "vercel vite solid",
      realtime: "",
      email: "",
      database: "on-device sqlite",
      offline: "vite-pwa",
    },
  },
  {
    title: "ithkuil-rs",
    id: 43,
    time: "2024",
    stats: {
      completion: "In Progress",
      publicity: "packaged",
      functionality: "Functional",
      size: "Large",
      type: "Library",
    },
    viewableAt: "https://crates.io/crates/tnil",
    description:
      "Rust library for parsing, generating, scriptifying, and programatically representing Ithkuil text.",
    tools: {
      client: "rust",
      docs: "rustdoc",
      infra: "crates.io",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "zSnout 6",
    id: 19,
    time: "Feb 2022 ~ Aug 23",
    stats: {
      completion: "Completed",
      publicity: "has website",
      functionality: "Functional",
      size: "Large",
      type: "Compilation",
    },
    viewableAt: "https://v6.zsnout.com",
    description:
      "Personal project compilation. First personal site to be statically built, with no backend functionality.",
    tools: {
      client: "html tailwind vue",
      docs: "",
      infra: "github pages",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Custom Docs Fonts",
    id: 41,
    time: "Mar 2024",
    stats: {
      completion: "Completed",
      publicity: "packaged",
      functionality: "Functional",
      size: "Small",
      type: "Extension",
    },
    viewableAt:
      "https://chromewebstore.google.com/detail/sitelen-pona-for-google-w/omjmjnmbcmilkcjadbihddaipogifnbb",
    description:
      "Allows you to use local fonts installed on your computer in Google Docs, Slides, and Sheets. Useful for conlangers.",
    tools: {
      client: "javascript",
      docs: "md",
      infra: "chrome web store",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Umpharesemsa",
    id: 31,
    time: "Aug 2023",
    stats: {
      completion: "Completed",
      publicity: "source only",
      functionality: "Partially",
      size: "Midsize",
      type: "Discord Bot",
    },
    viewableAt: "https://github.com/zsakowitz/umpharesemsa",
    description:
      "Discord bot which contained tools for glossing and unglossing Ithkuil text as well as functionality for searching Ithkuil's lexicon and affixes documents.",
    tools: {
      client: "discord",
      docs: "md",
      infra: "node",
      realtime: "discordjs",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Rust Advanced-Parser",
    id: 34,
    time: "Dec 2023",
    stats: {
      completion: "In Progress",
      publicity: "source only",
      functionality: "Functional",
      size: "Midsize",
      type: "Library",
    },
    viewableAt: "https://github.com/zsakowitz/advanced_parser/tree/main",
    description:
      "Rust text parser based in the macro system, supporting easily writable complex syntaxes.",
    tools: {
      client: "rust",
      docs: "rustdoc",
      infra: "source only",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "zSnout 5",
    id: 13,
    time: "Dec 2021 ~ Mar 22",
    stats: {
      completion: "Completed",
      publicity: "source only",
      functionality: "Functional",
      size: "Midsize",
      type: "Compilation",
    },
    viewableAt: "https://github.com/zsnout/v5.zsnout.com",
    description:
      "Personal project compilation. First personal site to successfully use NodeJS.",
    tools: {
      client: "html css zquery",
      docs: "",
      infra: "node fastify",
      realtime: "socketio peerjs",
      email: "nodemailer",
      database: "mongodb",
      offline: "vite-pwa",
    },
  },
  {
    title: "Fractal Explorer 7",
    id: 24,
    time: "2022 ~ 23",
    stats: {
      completion: "Completed",
      publicity: "has website",
      functionality: "Functional",
      size: "Midsize",
      type: "Website",
    },
    viewableAt: "https://v7.zsnout.com/fractal-explorer",
    description:
      "Fractal explorer with a GLSL renderer. Packed with tons of new features for highly customizable coloring options.",
    tools: {
      client: "html tailwind vue",
      docs: "",
      infra: "node vue",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Willow",
    id: 16,
    time: "2022",
    stats: {
      completion: "In Progress",
      publicity: "packaged",
      functionality: "Functional",
      size: "Midsize",
      type: "Library",
    },
    viewableAt: "https://www.npmjs.com/package/@zsnout/willow",
    description:
      "JavaScript signal-based web framework which compiles natively in TypeScript or Babel. Contrast Genesis.",
    tools: {
      client: "typescript",
      docs: "md",
      infra: "npm",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Simple Slideshows",
    id: 29,
    time: "May 2023",
    stats: {
      completion: "In Progress",
      publicity: "packaged",
      functionality: "Partially",
      size: "Midsize",
      type: "Library",
    },
    viewableAt: "https://github.com/zSnout/simple-slideshows",
    description: "Creates slideshows from Markdown documents.",
    tools: {
      client: "html css ts",
      docs: "md",
      infra: "vercel astro",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "toki pona slides",
    id: 48,
    time: "Aug 2024",
    stats: {
      completion: "In Progress",
      publicity: "has website",
      functionality: "Partially",
      size: "Midsize",
      type: "Website",
    },
    viewableAt: "https://o-li-e-la.vercel.app/",
    description: "A custom slideshow software I use for teaching toki pona.",
    tools: {
      client: "html tailwind solid",
      docs: "",
      infra: "vercel vite solid",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Dashboard",
    id: 9,
    time: "Early 2021",
    stats: {
      completion: "Completed",
      publicity: "packaged",
      functionality: "Partially",
      size: "Large",
      type: "Extension",
    },
    viewableAt:
      "https://chromewebstore.google.com/detail/dashboard/blhlbkgekpgmehmokhmgfppfknildapn",
    description:
      "Replacement for Chrome's new tab page which contains several different modules a user can choose from.",
    tools: {
      client: "html css js",
      docs: "",
      infra: "php",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Storymatic 4",
    id: 17,
    time: "May 2022",
    stats: {
      completion: "Completed",
      publicity: "has website",
      functionality: "Functional",
      size: "Small",
      type: "Website",
    },
    viewableAt: "https://storymatic.zsnout.com/",
    description:
      "Rewrite of CoffeeScript to include modern TypeScript features and highly experimental JavaScript proposals.",
    tools: {
      client: "md css js",
      docs: "md jekyll css",
      infra: "github pages",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Storymatic 3",
    id: 21,
    time: "Feb 2022 ~ Aug 23",
    stats: {
      completion: "Completed",
      publicity: "has website",
      functionality: "Functional",
      size: "Small",
      type: "Website",
    },
    viewableAt: "https://v7.zsnout.com/storymatic/",
    description: "Rewrite of Storymatic 2 with new features.",
    tools: {
      client: "html tailwind vue",
      docs: "",
      infra: "node vue",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Fractal Explorer 6",
    id: 20,
    time: "Feb 2022 ~ Aug 23",
    stats: {
      completion: "Completed",
      publicity: "has website",
      functionality: "Functional",
      size: "Small",
      type: "Website",
    },
    viewableAt: "https://v6.zsnout.com/fractal",
    description:
      "Fractal explorer with a GLSL renderer, rewritten to be compatiable with Vue.",
    tools: {
      client: "html tailwind vue",
      docs: "",
      infra: "github pages",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Fractal Explorer 5 (GLSL)",
    id: 15,
    time: "Dec 2021 ~ Mar 22",
    stats: {
      completion: "Completed",
      publicity: "source only",
      functionality: "Functional",
      size: "Small",
      type: "Website",
    },
    viewableAt: "https://github.com/zsnout/v5.zsnout.com",
    description:
      "Fractal explorer, but the renderer is written in GLSL. Very fast and can navigate through custom fractals in real time.",
    tools: {
      client: "html tailwind vue",
      docs: "",
      infra: "browser only",
      realtime: "",
      email: "",
      database: "",
      offline: "vite-pwa",
    },
  },
  {
    title: "Fractal Explorer 5 (JS)",
    id: 14,
    time: "Dec 2021 ~ Mar 22",
    stats: {
      completion: "Completed",
      publicity: "source only",
      functionality: "Functional",
      size: "Small",
      type: "Website",
    },
    viewableAt: "https://github.com/zsnout/v5.zsnout.com",
    description:
      "Fractal explorer written entirely in JavaScript. Slow, but has high precision.",
    tools: {
      client: "html tailwind vue",
      docs: "",
      infra: "browser only",
      realtime: "",
      email: "",
      database: "",
      offline: "vite-pwa",
    },
  },
  {
    title: "Storymatic 1",
    id: 8,
    time: "Jul 2020",
    stats: {
      completion: "Completed",
      publicity: "has website",
      functionality: "Functional",
      size: "Small",
      type: "Website",
    },
    viewableAt: "https://github.com/zsnout/story.py",
    description:
      "Programming language optimized for text adventures. Interpreter written in Python.",
    tools: {
      client: "python",
      docs: "md jekyll css",
      infra: "github pages",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Sitelen Pona Dictionary",
    id: 25,
    time: "2023",
    stats: {
      completion: "Completed",
      publicity: "has website",
      functionality: "Functional",
      size: "Small",
      type: "Website",
    },
    viewableAt: "https://tokipona.zsnout.com/sitelen-pona",
    description:
      "Dictionary for sitelen pona, a script used to write toki pona. Printing works out-of-the-box and the layout is customizable.",
    tools: {
      client: "html tailwind solid",
      docs: "",
      infra: "vercel sveltekit",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Sitelen Sitelen Dictionary",
    id: 26,
    time: "2023",
    stats: {
      completion: "Completed",
      publicity: "has website",
      functionality: "Functional",
      size: "Small",
      type: "Website",
    },
    viewableAt: "https://tokipona.zsnout.com/sitelen-sitelen",
    description:
      "Dictionary for sitelen sitelen, a script used to write toki pona. Printing works out-of-the-box and the layout is customizable.",
    tools: {
      client: "html tailwind solid",
      docs: "",
      infra: "vercel sveltekit",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Statistics.JS",
    id: 5,
    time: "May 2020",
    stats: {
      completion: "Completed",
      publicity: "source only",
      functionality: "Functional",
      size: "Tiny",
      type: "Library",
    },
    viewableAt: "https://github.com/zsnout/statistics.js",
    description: "Library with common statistical analysis functions.",
    tools: {
      client: "javascript",
      docs: "html css zquery",
      infra: "source only",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Genesis",
    id: 22,
    time: "Winter 2022 ~ 23",
    stats: {
      completion: "In Progress",
      publicity: "source only",
      functionality: "Functional",
      size: "Small",
      type: "Library",
    },
    viewableAt:
      "https://github.com/zsakowitz/rewrites/blob/09382f545b7f32aab8c5c75383b3995277c993d3/genesis/index.ts",
    description:
      "JavaScript signal-based web framework which compiles natively in TypeScript or Babel. Contrast Willow.",
    tools: {
      client: "javascript",
      docs: "jsdoc",
      infra: "source only",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "SyntaxColor",
    id: 6,
    time: "Jun 2020",
    stats: {
      completion: "Completed",
      publicity: "source only",
      functionality: "Functional",
      size: "Small",
      type: "Library",
    },
    viewableAt: "https://github.com/zSnout/SyntaxColor",
    description: "Library for syntax highlighting code in vanilla JavaScript.",
    tools: {
      client: "javascript",
      docs: "md",
      infra: "source only",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Radio",
    id: 7,
    time: "Jul 2020",
    stats: {
      completion: "Completed",
      publicity: "source only",
      functionality: "Functional",
      size: "Small",
      type: "Library",
    },
    viewableAt: "https://github.com/zsnout/radio",
    description:
      "Library for easy real time communication between a client and server.",
    tools: {
      client: "javascript",
      docs: "",
      infra: "php",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Share With Students",
    id: 18,
    time: "Sep 2022",
    stats: {
      completion: "Completed",
      publicity: "packaged",
      functionality: "Functional",
      size: "Tiny",
      type: "Extension",
    },
    viewableAt:
      "https://chromewebstore.google.com/detail/share-with-students/abmjjgbadlhegfblpphhdjcfkmjmhmmi",
    description:
      "Extension which quickly copies a link to your clipboard which, when opened, copies the current Google Doc.",
    tools: {
      client: "javascript",
      docs: "",
      infra: "chrome web store",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "YouTube Downloader",
    id: 28,
    time: "Mar 2023",
    stats: {
      completion: "Completed",
      publicity: "has website",
      functionality: "Functional",
      size: "Small",
      type: "Application",
    },
    viewableAt: "https://yt.zsnout.com/",
    description: "Downloads YouTube videos.",
    tools: {
      client: "html tailwind svelte",
      docs: "",
      infra: "vercel sveltekit",
      realtime: "",
      email: "",
      database: "prisma mongodb",
      offline: "",
    },
  },
  {
    title: "@zsnout/tailwind",
    id: 32,
    time: "Fall 2023",
    stats: {
      completion: "Often Updated",
      publicity: "packaged",
      functionality: "Functional",
      size: "Small",
      type: "Library",
    },
    viewableAt: "https://github.com/zsnout/tailwind",
    description:
      "Collection of Tailwind utilities used across several newer projects.",
    tools: {
      client: "php",
      docs: "md",
      infra: "npm",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Brainfuck Macro Library",
    id: 33,
    time: "Oct 2023",
    stats: {
      completion: "In Progress",
      publicity: "source only",
      functionality: "Functional",
      size: "Midsize",
      type: "Library",
    },
    viewableAt: "https://github.com/zsakowitz/bf2",
    description:
      "Executor and builder of macro-based scripts for the Brainfuck esoteric programming language.",
    tools: {
      client: "rust",
      docs: "rustdoc",
      infra: "source only",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Ticket Viewer",
    id: 42,
    time: "Apr 2024",
    stats: {
      completion: "Completed",
      publicity: "has website",
      functionality: "Functional",
      size: "Large",
      type: "Application",
    },
    viewableAt: "https://ticket.zsnout.com",
    description:
      "Displays YAGPDB.xyz tickets in a more readable manner than their default plaintext counterparts.",
    tools: {
      client: "html tailwind solid",
      docs: "",
      infra: "vercel astro solid",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Storymatic 2",
    id: 10,
    time: "2021",
    stats: {
      completion: "Completed",
      publicity: "has website",
      functionality: "Functional",
      size: "Small",
      type: "Website",
    },
    viewableAt: "https://v7.zsnout.com/storymatic/",
    description: "JavaScript port of Storymatic 1, with a few new features.",
    tools: {
      client: "html css zquery",
      docs: "",
      infra: "node fastify",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Musicnotes",
    id: 4,
    time: "May 2020",
    stats: {
      completion: "Completed",
      publicity: "source only",
      functionality: "Functional",
      size: "Tiny",
      type: "API",
    },
    viewableAt: "https://github.com/zSnout/MusicNotes-API",
    description:
      "Generates chords gives a base note, chord type, and number of notes.",
    tools: {
      client: "php",
      docs: "md",
      infra: "php",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "o soko e nimi ale",
    id: 39,
    time: "Jan 2024",
    stats: {
      completion: "Completed",
      publicity: "packaged",
      functionality: "Functional",
      size: "Tiny",
      type: "Extension",
    },
    viewableAt:
      "https://chromewebstore.google.com/detail/o-soko-e-nimi-ale/aemblemkmmndonmfhahggfnadjabifal",
    description: "Changes all names on Discord to begin with the word 'soko'.",
    tools: {
      client: "javascript",
      docs: "",
      infra: "chrome web store",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "zSnout 3",
    id: 11,
    time: "Fall 2021",
    stats: {
      completion: "Completed",
      publicity: "source only",
      functionality: "Functional",
      size: "Small",
      type: "Compilation",
    },
    viewableAt: "https://github.com/zsnout/v3.zsnout.com",
    description:
      "Personal project compilation. Short-lived. Experimented with Separating client and server.",
    tools: {
      client: "html css zquery",
      docs: "",
      infra: "node fastify",
      realtime: "socketio",
      email: "nodemailer",
      database: "",
      offline: "",
    },
  },
  {
    title: "zSnout 4",
    id: 12,
    time: "Dec 2021",
    stats: {
      completion: "Completed",
      publicity: "source only",
      functionality: "Functional",
      size: "Small",
      type: "Compilation",
    },
    viewableAt: "https://github.com/zsnout/v4.zsnout.com",
    description:
      "Personal project compilation. Short-lived. Experimented with Separating all functionality of site into composable packages.",
    tools: {
      client: "html css zquery",
      docs: "",
      infra: "node fastify",
      realtime: "socketio",
      email: "nodemailer",
      database: "",
      offline: "",
    },
  },
  {
    title: "zSnout 1",
    id: 2,
    time: "2019",
    stats: {
      completion: "Completed",
      publicity: "lost to history",
      functionality: "Functional",
      size: "Large",
      type: "Compilation",
    },
    viewableAt: "project data deleted due to poor backups",
    description:
      "Personal project compilation. Notable subprojects include FastChat.",
    tools: {
      client: "html css jquery",
      docs: "",
      infra: "php",
      realtime: "",
      email: "",
      database: "mysql",
      offline: "",
    },
  },
  {
    title: "zSnout 2",
    id: 3,
    time: "2019",
    stats: {
      completion: "Completed",
      publicity: "lost to history",
      functionality: "Functional",
      size: "Large",
      type: "Compilation",
    },
    viewableAt: "project data deleted due to poor backups",
    description:
      "Personal project compilation. Notable subprojects include FastChat.",
    tools: {
      client: "html css jquery",
      docs: "",
      infra: "php",
      realtime: "",
      email: "",
      database: "mysql",
      offline: "",
    },
  },
  {
    title: "FastChat",
    id: 1,
    time: "2018",
    stats: {
      completion: "Completed",
      publicity: "lost to history",
      functionality: "Functional",
      size: "Small",
      type: "Application",
    },
    viewableAt: "project data deleted due to poor backups",
    description:
      "Website for instant chatting with others. Like Discord, but with only one server and one channel.",
    tools: {
      client: "html css jquery",
      docs: "",
      infra: "php",
      realtime: "",
      email: "",
      database: "mysql",
      offline: "",
    },
  },
  {
    title: "Dalerav",
    id: 45,
    time: "2024",
    stats: {
      completion: "In Progress",
      publicity: "has website",
      functionality: "Partially",
      size: "Large",
      type: "Application",
    },
    viewableAt: "no link found yet",
    description: "Modern learning management platform.",
    tools: {
      client: "html tailwind solid",
      docs: "",
      infra: "vercel astro solid",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
  {
    title: "Type Evaluator",
    id: 46,
    time: "2024",
    stats: {
      completion: "In Progress",
      publicity: "source only",
      functionality: "None",
      size: "Small",
      type: "Library",
    },
    viewableAt: "currently nonexistent",
    description:
      "Receives a list of typed and untyped functions, then infers the types of the untyped functions. Meant as a precursor to the Desmos 2 project, so that functions and graphs can be run using WebGL instead of JavaScript, which would speed up the project considerably.",
    tools: {
      client: "typescript",
      docs: "",
      infra: "source only",
      realtime: "",
      email: "",
      database: "",
      offline: "",
    },
  },
]

function Icon(props: { icon: IconDefinition; class: string; label: string }) {
  return (
    <div class="flex items-center gap-2">
      <Fa
        icon={props.icon}
        class={clsx("size-4", props.class)}
        title={props.label}
      />
    </div>
  )
}

function IconFull(props: {
  icon: IconDefinition
  class: string
  label: string
}) {
  return (
    <div class="mb-auto flex items-center gap-2">
      <Fa icon={props.icon} class={clsx("size-4", props.class)} title={false} />
      {props.label}
    </div>
  )
}

export function Main() {
  return (
    <div class="flex flex-col gap-2">
      <div class="border-b border-z pb-4">
        Each project is listed with its name, a link to a deployment or source
        code, a description, when it was created, and the type of project.
        Additionally, the last three columns use colors and icons to represent
        three aspects of a project.
        <div class="my-3 flex rounded-lg bg-z-body-selected px-3 py-2">
          <div class="flex h-min flex-1 flex-col pl-4">
            <p class="-ml-4">Completion status:</p>
            <IconFull
              class="icon-blue-500"
              icon={faRotate}
              label="Updated often"
            />
            <IconFull class="icon-green-500" icon={faCheck} label="Finished" />
            <IconFull
              class="icon-yellow-500"
              icon={faSpinner}
              label="Incomplete"
            />
          </div>
          <div class="flex h-min flex-1 flex-col pl-4">
            <p class="-ml-4">Size:</p>
            <IconFull class="icon-blue-500" icon={faL} label="Large" />
            <IconFull class="icon-green-500" icon={faM} label="Midsize" />
            <IconFull class="icon-green-500" icon={faS} label="Small" />
            <IconFull class="icon-green-500" icon={faT} label="Tiny" />
          </div>
          <div class="flex h-min flex-1 flex-col pl-4">
            <p class="-ml-4">Functionality:</p>
            <IconFull
              class="icon-green-500"
              icon={faCheck}
              label="Fully functional"
            />
            <IconFull
              class="icon-yellow-500"
              icon={faThumbsUp}
              label="Works enough"
            />
            <IconFull class="icon-red-500" icon={faS} label="Doesn't work" />
          </div>
        </div>
        <p>
          Compilation projects (like this website) may include sub-projects
          which are not complete or functional. The compilation itself is judged
          based on how and whether it adequately displays those sub-projects.
        </p>
      </div>
      <For each={data}>
        {(project) => (
          <div class="grid grid-cols-[3fr,3fr,2fr,1rem,1rem,1rem] grid-rows-[auto,1fr] gap-x-4 border-b border-z pb-2">
            <div class="font-bold text-z-heading">{project.title}</div>
            <div class="row-span-2 text-sm text-z-subtitle">
              {project.description}
            </div>
            <IconFull icon={faClock} class="" label={project.time} />
            <Icon
              icon={
                {
                  "Often Updated": faRotate,
                  Completed: faCheck,
                  "In Progress": faSpinner,
                }[project.stats.completion]
              }
              class={
                {
                  "Often Updated": "icon-blue-500",
                  Completed: "icon-green-500",
                  "In Progress": "icon-yellow-500",
                }[project.stats.completion]
              }
              label={project.stats.completion}
            />
            <Icon
              icon={
                {
                  Large: faL,
                  Midsize: faM,
                  Small: faS,
                  Tiny: faT,
                }[project.stats.size]
              }
              class={
                {
                  Large: "icon-blue-500",
                  Midsize: "icon-green-500",
                  Small: "icon-green-500",
                  Tiny: "icon-yellow-500",
                }[project.stats.size]
              }
              label={project.stats.size}
            />
            <Icon
              icon={
                {
                  Functional: faCheck,
                  None: faCancel,
                  Partially: faThumbsUp,
                }[project.stats.functionality]
              }
              class={
                {
                  Functional: "icon-green-500",
                  None: "icon-red-500",
                  Partially: "icon-yellow-500",
                }[project.stats.functionality]
              }
              label={project.stats.functionality}
            />
            <Show
              when={project.viewableAt.startsWith("https://")}
              fallback={
                <div class="text-sm italic text-z-subtitle">
                  {project.viewableAt}
                </div>
              }
            >
              <a
                class="block w-full max-w-full truncate text-z-link underline decoration-transparent underline-offset-2 transition hover:decoration-current"
                href={project.viewableAt}
              >
                {project.viewableAt}
              </a>
            </Show>
            <IconFull
              icon={
                {
                  Compilation: faList,
                  Website: faGlobe,
                  API: faTerminal,
                  Application: faMailBulk,
                  "Discord Bot": faRobot,
                  Extension: faPlus,
                  Library: faBook,
                }[project.stats.type]
              }
              class={
                {
                  // things accessible by most people
                  Compilation: "icon-teal-500",
                  Website: "icon-blue-500",
                  Application: "icon-green-500",
                  "Discord Bot": "icon-purple-500",
                  Extension: "icon-yellow-500",

                  // things for devs
                  API: "icon-orange-500",
                  Library: "icon-red-500",
                }[project.stats.type]
              }
              label={project.stats.type}
            />
          </div>
        )}
      </For>
    </div>
  )
}
