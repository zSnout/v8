// @ts-check
/// <reference path="./astro.config.env.ts" />

/** @import * as md from "mdast" */
/** @typedef {import("unified").Processor<void, md.Root, void, void>} px */

import mdx from "@astrojs/mdx"
import solidJs from "@astrojs/solid-js"
import tailwind from "@astrojs/tailwind"
import { faCheck, faCircle } from "@fortawesome/free-solid-svg-icons"
import { defineConfig } from "astro/config"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import nesting from "tailwindcss/nesting"
import glsl from "vite-plugin-glsl"
import tsconfigPaths from "vite-tsconfig-paths"
import { makeQuiz } from "./astro.quiz.mjs"

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
  } else if (
    node.type == "code" &&
    node.lang == "md" &&
    node.meta?.startsWith("quiz")
  ) {
    const kind = node.meta == "quiz radio" ? "radio" : "unknown"
    if (kind == "unknown") {
      throw new Error("Unknown quiz type: '" + node.meta + "'.")
    }
    const parsed = /** @type {md.Root} */ (this.runSync(this.parse(node.value)))
    return quiz(this, parsed, kind)
  } else if ("children" in node) {
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

function fa(icon, className) {
  return `<svg
  class="${"overflow-visible transition " + className}"
  fill="var(--icon-fill)"
  role="presentation"
  viewBox="${`0 0 ${icon.icon[0]} ${icon.icon[1]}`}"
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="${icon.icon[4]}"></path>
</svg>`
}

function checkbox(name, circular) {
  const input = `<input class="sr-only" type="${circular ? "radio" : "checkbox"}" name="${name}" />`

  const visuals = `<div
  class="group-checkbox flex h-6 cursor-pointer select-none items-center justify-center disabled:opacity-30"
  role="button"
>
  <div
    class="${"relative flex h-5 w-5 items-center justify-center rounded border border-transparent bg-z-body ring ring-transparent transition-[box-shadow,border-color] [:checked+.group-checkbox_&]:bg-[--z-bg-checkbox-selected] [:focus-visible+*>&]:border-z-focus [:focus-visible+*>&]:ring-z-focus" + (circular ? " rounded-full" : "")}"
  >
    <div
      class="${"absolute -m-px size-[calc(100%_+_2px)] rounded border border-z [:checked+.group-checkbox_&]:hidden [:focus-visible+*>*>&]:border-z-focus" + (circular ? " rounded-full" : "")}"
    ></div>

    ${fa(
      circular ? faCircle : faCheck,
      "hidden icon-[--z-text-checkbox-selected] [:checked+.group-checkbox_&]:block " +
        (circular ? "size-2" : "size-4"),
    )}
  </div>
</div>`

  return [input, visuals]
}

/** @returns {md.Content} */
function quiz(
  /** @type {px} */ processor,
  /** @type {md.Root} */ root,
  /** @type {"radio"} */ kind,
) {
  root.children = root.children.filter(
    (x) => !(x.type == "text" && x.value == "\n"),
  )

  if (root.children.length == 0 || root.children.length > 2) {
    throw new Error("Quizzes must be optional context, then a task list.")
  }

  const p = root.children.length == 2 ? root.children[0] : undefined
  if (p && !(p.type == "element" && p.tagName == "p")) {
    throw new Error("The context for a quiz must be a paragraph.")
  }

  const ul = root.children[root.children.length - 1]
  if (
    !(
      ul.type == "element" &&
      ul.tagName == "ul" &&
      Array.isArray(ul.properties.className) &&
      ul.properties.className.length == 1 &&
      ul.properties.className[0] == "contains-task-list"
    )
  ) {
    throw new Error("The last child of a quiz block must be a task list.")
  }

  const lis = ul.children.flatMap((value) => {
    const x = /** @type {import("./astro.config.env").TaskListChild} */ (value)
    if (x.type == "element") {
      const [input, ...children] = x.children
      if (children[0].type == "text") {
        if (children[0].value.startsWith(" ")) {
          children[0].value = children[0].value.slice(1)
        }
      }

      /** @type {md.PhrasingContent[] | undefined} */
      let reason
      reason: {
        const lastIndex = children.length - 1
        const last = children[lastIndex]
        if (!(last && last.type == "text" && last.value.endsWith("}"))) {
          break reason
        }
        const startIndex = children.findLastIndex(
          (x) => x.type == "text" && x.value.includes("{"),
        )
        if (startIndex == -1) {
          break reason
        }
        const start = /** @type {md.Text} */ (children[startIndex])
        const charIndex = start.value.lastIndexOf("{")
        reason = children.splice(startIndex, children.length - startIndex)
        if (charIndex != 0) {
          const pre = start.value.slice(0, charIndex)
          start.value = start.value.slice(charIndex)
          children.push({ type: "text", value: pre })
        }
        start.value = start.value.slice(1)
        last.value = last.value.slice(0, -1)
      }
      return {
        checked: !!input.properties.checked,
        children,
        reason,
      }
    }
    return []
  })

  if (lis.reduce((a, b) => a + +b.checked, 0) != 1) {
    throw new Error("`quiz radio` types must have a single correct answer.")
  }

  /** @type {import("./astro.config.env").Element} */
  const form = {
    type: "element",
    tagName: "form",
    properties: { className: ["quiz", "quiz-radio"] },
    children: [],
  }

  if (p) {
    form.children.push(h("p", "", ...p.children))
  }

  const name = crypto.randomUUID()
  form.children.push(h("div", "grid grid-cols-2 gap-2", ...lis.map(createLi)))

  return form

  function createLi(/** @type {(typeof lis)[number]} */ li) {
    return h(
      "label",
      "flex border border-2 border-slate-200 dark:border-slate-700 rounded-lg [&:has(>:checked)]:bg-blue-100 dark:[&:has(>:checked)]:bg-blue-900 [&:has(>:checked)]:border-blue-300 dark:[&:has(>:checked)]:border-blue-600 dark:[&:has(>:checked)]:text-blue-200 [&:has(>:checked)]:text-sky-900 pl-2 py-1 pr-3 gap-2",
      h("input", { type: "radio", name, class: "sr-only peer" }),
      h(
        "div",
        "size-5 mt-1 border-2 border-slate-200 rounded peer-checked:bg-[--z-bg-checkbox-selected] peer-checked:border-0 flex peer-checked:*:block",
        { type: "html", value: fa(faCheck, "size-4 m-auto hidden fill-white") },
      ),
      h("div", "text-base/1.5", ...li.children),
      li.reason && h("div", "quiz-reason hidden", ...li.reason),
    )
  }

  function h(tagName, className, ...children) {
    const props =
      typeof className == "object" ? className : { class: className }

    return {
      type: /** @type {const} */ ("element"),
      tagName,
      properties: props,
      children: children.filter((x) => x),
      // value: `<${tagName}${Object.entries(props).map(
      // ([k, v]) => ` ${escapeHTML(k)}="${escapeHTML(v)}"`,
      // )}>${processor.stringify(
      // /** @type {any} */ ({
      // type: "root",
      // children: children.filter((x) => x),
      // }),
      // )}</${tagName}>`,
    }
  }
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
            children: traverseArray.call(this, tree.children),
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
