// @ts-check
/// <reference path="./astro.config.env.ts" />

/** @import * as md from "mdast" */
/** @typedef {import("unified").Processor<void, md.Root, void, void>} px */

import mdx from "@astrojs/mdx"
import solidJs from "@astrojs/solid-js"
import tailwind from "@astrojs/tailwind"
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons"
import { defineConfig } from "astro/config"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import nesting from "tailwindcss/nesting"
import glsl from "vite-plugin-glsl"
import tsconfigPaths from "vite-tsconfig-paths"
import { els, makeQuiz } from "./astro.quiz.mjs"
import { STYLES } from "./astro.styles.mjs"

Promise.withResolvers ??= () => {
  let resolve
  let reject
  return {
    promise: new Promise((a, b) => {
      resolve = a
      reject = b
    }),
    /** @type {any} */ resolve,
    /** @type {any} */ reject,
  }
}

function escapeHTML(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("'", "&apos;")
    .replaceAll('"', "&quot;")
}

/** @type {(this: px, node: md.Content) => md.Content} */
function traverse(node) {
  if (
    node.type == "blockquote" &&
    node.children[0]?.type == "paragraph" &&
    node.children[0]?.children[0]?.type == "text" &&
    node.children[0].children[0].value.startsWith("@details ")
  ) {
    node.children[0].children[0].value =
      node.children[0].children[0].value.slice("@details ".length)
    const { h, fa } = els(this)
    return h(
      "details",
      "bg-z-body-selected border border-z rounded-lg [line-height:1.5] *:px-4 last:*:pb-3 *:mt-2 *:mb-0 first:*:mt-0 [&>ol]:pl-[calc(1.625em_+_1rem)] [&>ol>li]:my-1 [&>ol>li:last-child>p:last-child]:mb-2",
      h(
        "summary",
        "flex gap-2 items-center text-sm [[open]>&]:pb-0 py-3 px-4",
        fa(faCaretRight, "size-4 [[open]>*>&]:hidden"),
        fa(faCaretDown, "size-4 hidden [[open]>*>&]:block"),
        h("div", ",", ...node.children[0].children),
      ),
      ...node.children.slice(1),
    )
  } else if (
    node.type == "blockquote" &&
    node.children.every((x) => x.type == "paragraph") &&
    node.children[0]?.children[0]?.type == "text" &&
    node.children[0].children[0].value.startsWith("@") &&
    Object.hasOwn(STYLES, node.children[0].children[0].value.slice(1))
  ) {
    const tag = node.children[0].children[0].value.slice(1)
    const [icon, classes, tagline] = STYLES[tag]
    const { h, fa } = els(this)
    return h(
      "div",
      "border px-4 py-3 rounded-lg my-5 " + classes,
      h(
        "div",
        "mb-2 flex gap-2 items-center text-sm",
        fa(icon, "size-4 fill-current"),
        h("div", "", tagline),
      ),
      ...node.children
        .slice(1)
        .map((text, i) =>
          h("div", "[line-height:1.5]" + (i ? " mt-2" : ""), ...text.children),
        ),
    )
  } else if (node.type == "text" && node.value.startsWith("@cx ")) {
    const { colorize } = els(this)
    return colorize(node.value.slice(4))
  } else if (node.type == "text" && /^@[⁰¹²³⁴⁵⁶]/.test(node.value)) {
    const { colorize } = els(this)
    return colorize(node.value.slice(1))
  } else if (node.type == "image") {
    if (node.title) {
      return {
        type: "html",
        value: `<figure><img alt="${escapeHTML(
          node.alt || "",
        )}" src="${escapeHTML(node.url)}" /><figcaption>${escapeHTML(
          node.title,
        )}</figcaption></figure>`,
        position: node.position,
      }
    } else {
      return node
    }
  } else if (node.type == "code" && node.lang == "sp") {
    return {
      type: "html",
      position: node.position,
      value:
        "<div class='sp-outer'><div class='sp-inner'>" +
        escapeHTML(node.value) +
        "</div></div>",
    }
  } else if (node.type == "code" && node.lang == "cx") {
    const { h, cx, colorize } = els(this)

    if (node.meta == "table") {
      const rows = node.value.split("\n\n\n").flatMap((text, i, a) =>
        text.split("\n\n").map((row, j, b) => {
          const [src, ...dst] = row.split("\n")
          return h(
            "tr",
            i != a.length - 1 && j == b.length - 1 ?
              "border-b-0 *:pb-5"
            : "border-b-0",
            h(
              "td",
              "font-semibold py-0.5 [:first-child>&]:pt-0 [:last-child>&]:pb-0 whitespace-nowrap",
              colorize(src),
            ),
            dst.length ?
              h("td", "py-0.5 [:first-child>&]:pt-0 [:last-child>&]:pb-0", {
                type: "html",
                value: dst.map((x) => colorize(x).value).join("<br>"),
              })
            : null,
          )
        }),
      )

      return h(
        "div",
        TABLE_CLASSES,
        h("table", "text-base", h("tbody", "whitespace-normal", ...rows)),
      )
    }

    const sx = node.value
      .split("\n\n\n")
      .map((section) =>
        h(
          "div",
          "flex flex-wrap bg-z-border *:bg-z-body gap-x-[3px] gap-y-[calc(2rem_+_3px)]",
          ...cx(section, node.meta),
        ),
      )

    return h(
      "div",
      "flex flex-col bg-z-border gap-[calc(2rem_+_3px)] my-5 first:mt-0 last:mb-0" +
        (node.value.split("\n\n").length == 1 ?
          ""
        : " whitespace-normal md:whitespace-nowrap"),
      ...sx,
    )
  } else if ("children" in node && Array.isArray(node.children)) {
    return {
      ...node,
      children: /** @type {any} */ (traverseArray.call(this, node.children)),
    }
  } else {
    return node
  }
}

const TABLE_CLASSES =
  "relative left-[calc(-50vw_+_min(50vw_-_1.5rem,32.5ch))] w-[100vw] overflow-x-auto px-[max(1.5rem,50vw_-_32.5ch)] whitespace-nowrap scrollbar:hidden my-8 *:my-0 [table_&]:contents"

const TABLE_START = `<div class="${escapeHTML(TABLE_CLASSES)}">`
const TABLE_END = "</div>"

/** @type {(this: px, node: md.Table) => md.Content[]} */
function styleTable(node) {
  const wraps = node.children[0].children.map((cell) => {
    const first = cell.children[0]
    if (first?.type == "text") {
      if (first.value.startsWith("@wrap ")) {
        first.value = first.value.slice(6)
        return true
      }
    }
    return false
  })

  const { h } = els(this)

  const WRAP_CLASSES = [
    "[&>table>*>tr>td:nth-child(1)]:min-w-48",
    "[&>table>*>tr>td:nth-child(2)]:min-w-48",
    "[&>table>*>tr>td:nth-child(3)]:min-w-48",
    "[&>table>*>tr>td:nth-child(4)]:min-w-48",
    "[&>table>*>tr>td:nth-child(5)]:min-w-48",
    "[&>table>*>tr>td:nth-child(6)]:min-w-48",
    "[&>table>*>tr>td:nth-child(7)]:min-w-48",
    "[&>table>*>tr>td:nth-child(8)]:min-w-48",
    "[&>table>*>tr>td:nth-child(9)]:min-w-48",
    "[&>table>*>tr>td:nth-child(10)]:min-w-48",
    "[&>table>*>tr>td:nth-child(11)]:min-w-48",
    "[&>table>*>tr>td:nth-child(12)]:min-w-48",
  ]

  return [
    {
      type: "html",
      value: `<div class="${escapeHTML(TABLE_CLASSES)}${wraps.map((x, i) => (x ? " " + WRAP_CLASSES[i] : "")).join("")}">`,
    },
    traverse.call(this, {
      ...node,
      children: node.children.map((row) => ({
        ...row,

        children: row.children.map(
          /** @returns {md.TableCell} */
          (cell, index) =>
            wraps[index] ?
              {
                type: "tableCell",
                children: [h("span", "whitespace-normal", ...cell.children)],
                position: cell.position,
                data: cell.data,
              }
            : cell,
        ),
      })),
    }),
    { type: "html", value: TABLE_END },
  ]
}

/** @type {(this: px, nodes: md.Content[]) => md.Content[]} */
function traverseArray(nodes) {
  /** @type {md.Content[]} */
  const output = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]

    if (node.type == "table") {
      output.push(...styleTable.call(this, node))
      continue
    }

    tags: {
      if (
        !(
          node.type == "paragraph" &&
          node.children.length >= 1 &&
          node.children[0].type == "text" &&
          node.children[0].value[0] == "@"
        )
      )
        break tags

      const [tag] = node.children[0].value.slice(1).split(/\s+/, 1)
      if (!tag) break tags

      /** @type {md.Paragraph} */
      const source = {
        type: "paragraph",
        children: [
          { type: "text", value: node.children[0].value.slice(tag.length + 1) },
          ...node.children.slice(1),
        ],
      }

      if (tag == "debug") {
        output.push(debug(nodes[++i]))
        continue
      }

      if (tag == "scrollable") {
        output.push({ type: "html", value: TABLE_START })
        while (nodes[++i]?.type == "html") {
          output.push(nodes[i])
        }
        output.push({ type: "html", value: TABLE_END })
        i--
        continue
      }

      Object.hasOwn ??= {}.hasOwnProperty.call.bind({}.hasOwnProperty)
      if (Object.hasOwn(STYLES, tag)) {
        const [icon, classes, tagline] = STYLES[tag]

        const { h, fa } = els(this)
        output.push(
          h(
            "div",
            "border px-4 py-3 rounded-lg my-5 " + classes,
            h(
              "div",
              "mb-2 flex gap-2 items-center text-sm",
              fa(icon, "size-4 fill-current"),
              h("div", "", tagline),
            ),
            h("div", "[line-height:1.5]", ...source.children),
          ),
        )
        continue
      }

      if (!tag.startsWith("quiz.")) break tags

      const next = nodes[++i]
      if (next.type != "list") {
        throw new Error("@quiz... tags must be followed by a list.")
      }

      const kind = tag.slice(5)
      if (!(kind == "radio")) break tags

      output.push(makeQuiz.call(this, kind, source, next))

      continue
    }

    const inner = traverse.call(this, node)
    if (Array.isArray(inner)) output.push(...inner)
    else output.push(inner)
  }
  return output
}

/** @type {(this: px, nodes: md.Content[]) => md.Content[]} */
function traverseRoot(nodes) {
  const hr = nodes.findIndex((x) => x.type == "thematicBreak")
  if (hr != -1) {
    nodes = nodes.slice()
    nodes.splice(hr, 0, {
      type: "html",
      value: '<div class="z-thematic-break contents">',
    })
    nodes.splice(nodes.length, 0, {
      type: "html",
      value: "</div>",
    })
  }
  return traverseArray.call(this, nodes)
}

function debug(value) {
  return {
    type: /** @type {const} */ ("code"),
    lang: "json",
    value: JSON.stringify(value ?? null, undefined, 2),
  }
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    solidJs(),
    mdx(),
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
  ],
  markdown: {
    remarkRehype: {
      allowDangerousHtml: true,
    },
    rehypePlugins: [rehypeKatex],
    remarkPlugins: [
      remarkMath,
      function () {
        return (tree, _, next) => {
          return next(undefined, {
            ...tree,
            children: tree.children && traverseRoot.call(this, tree.children),
          })
        }
      },
    ],
    shikiConfig: { wrap: true },
  },
  site: "https://v8.zsnout.com/",
  vite: {
    css: {
      postcss: {
        plugins: [nesting],
      },
    },
    plugins: [/** @type {any} */ (glsl({ compress: true }))],
    optimizeDeps: {
      esbuildOptions: { target: "es2022" },
      exclude: ["@sqlite.org/sqlite-wasm"],
    },
    esbuild: { target: "es2022" },
    build: { target: "es2022" },
    worker: {
      format: "es",
      plugins: [/** @type {any} */ (tsconfigPaths())],
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
})
