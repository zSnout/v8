// @ts-check
/// <reference path="./astro.config.env.ts" />

/** @import * as md from "mdast" */
/** @typedef {import("unified").Processor<void, md.Root, void, void>} px */

import mdx from "@astrojs/mdx"
import solidJs from "@astrojs/solid-js"
import tailwind from "@astrojs/tailwind"
import { defineConfig } from "astro/config"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import nesting from "tailwindcss/nesting"
import glsl from "vite-plugin-glsl"
import tsconfigPaths from "vite-tsconfig-paths"
import { els, makeQuiz } from "./astro.quiz.mjs"

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
  if (node.type == "image") {
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
    const { h, cx } = els(this)
    const sx = node.value
      .split("\n\n\n")
      .map((section) =>
        h(
          "div",
          "flex flex-wrap bg-z-border *:bg-z-body gap-x-[3px] gap-y-[calc(2rem_+_3px)] whitespace-nowrap",
          ...cx(section),
        ),
      )
    return h(
      "div",
      "flex flex-col bg-z-border gap-[calc(2rem_+_3px)] my-5 first:mt-0 last:mb-0",
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

/** @type {(this: px, nodes: md.Content[]) => md.Content[]} */
function traverseArray(nodes) {
  /** @type {md.Content[]} */
  const output = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]

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

    output.push(traverse.call(this, node))
  }
  return output
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
    remarkRehype: { allowDangerousHtml: true },
    rehypePlugins: [rehypeKatex],
    remarkPlugins: [
      remarkMath,
      function () {
        return (tree, _, next) => {
          return next(undefined, {
            ...tree,
            children: tree.children && traverseArray.call(this, tree.children),
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
