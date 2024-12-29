// @ts-check

import { faCheck } from "@fortawesome/free-solid-svg-icons"

/** @import * as md from "mdast" */
/** @typedef {import("unified").Processor<void, md.Root, void, void>} px */
/**
 * @template T
 * @typedef {T extends (
 *     number | string | boolean | bigint | symbol | null | undefined | Function
 *   ) ?
 *     T
 *   : { readonly [K in keyof T]: DeepReadonly<T[K]> }} DeepReadonly
 */

/**
 * @type {(
 *   this: px,
 *   kind: "radio",
 *   source: md.Paragraph,
 *   list: md.List,
 * ) => md.Content}
 */
export function makeQuiz(kind, source, list) {
  const { createLi, h } = els(this)

  if (list.ordered) {
    throw new Error("Radio-style quizzes must be unordered lists.")
  }

  if (list.children.reduce((a, b) => a + +!!b.checked, 0) != 1) {
    throw new Error("Radio-style quizzes must have exactly one correct answer.")
  }

  const name = crypto.randomUUID()

  return h(
    "form",
    "",
    h("div", "last:*:mb-2", source),
    h(
      "div",
      "grid grid-cols-2 gap-2",
      ...list.children.map((x) => createLi(x, name)),
    ),
  )
}

function els(/** @type {px} */ processor) {
  return { createLi, h }

  function fa(icon, className) {
    return {
      /** @type {"html"} */ type: "html",
      value: escape`<svg
  class="${"overflow-visible transition " + className}"
  fill="var(--icon-fill)"
  role="presentation"
  viewBox="${`0 0 ${icon.icon[0]} ${icon.icon[1]}`}"
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="${icon.icon[4]}"></path>
</svg>`,
    }
  }

  function Radio(/** @type {string} */ name) {
    return [
      h("input", { type: "radio", name, class: "sr-only peer" }),
      h(
        "div",
        "size-5 mt-1 border-2 border-slate-200 rounded-full peer-checked:bg-[--z-bg-checkbox-selected] peer-checked:border-0 flex peer-checked:*:block",
        // h("div", "size-2 bg-white rounded-full m-auto"),
        fa(
          faCheck,
          "size-3 m-auto hidden fill-white [stroke-width:30] stroke-white",
        ),
      ),
    ]
  }

  function Checkbox(/** @type {string} */ name) {
    return [
      h("input", { type: "radio", name, class: "sr-only peer" }),
      h(
        "div",
        "size-5 mt-1 border-2 border-slate-200 rounded peer-checked:bg-[--z-bg-checkbox-selected] peer-checked:border-0 flex peer-checked:*:block",
        fa(faCheck, "size-4 m-auto hidden fill-white"),
      ),
    ]
  }

  function createLi(
    /** @type {md.ListItem} */ liRaw,
    /** @type {string} */ name,
  ) {
    const [li, reason] = extractReason(liRaw)

    return h(
      "label",
      "flex border border-2 border-slate-200 dark:border-slate-700 rounded-lg [&:has(>:checked)]:bg-blue-100 dark:[&:has(>:checked)]:bg-blue-900 [&:has(>:checked)]:border-blue-300 dark:[&:has(>:checked)]:border-blue-600 dark:[&:has(>:checked)]:text-blue-200 [&:has(>:checked)]:text-sky-900 pl-2 py-1 pr-3 gap-2 cursor-pointer",
      ...Radio(name),
      // ...Checkbox(name),
      h("div", "text-base/1.5 first:*:mt-0 last:*:mb-0", ...li.children),
      reason && h("div", "quiz-reason hidden", ...reason.children),
    )
  }

  function h(
    tagName,
    className,
    /** @type {(md.Content | null | undefined)[]} */ ...children
  ) {
    const props =
      typeof className == "string" ? { class: className } : className

    return {
      /** @type {"html"} */ type: "html",
      value: `<${tagName}${Object.entries(props).map(
        ([k, v]) => ` ${escapeHTML(k)}="${escapeHTML(v)}"`,
      )}>${children
        .filter((x) => x != null)
        .map((x) =>
          x.type == "html" ?
            x.value
          : processor.stringify(processor.runSync(x)),
        )
        .join("")}</${tagName}>`,
    }
  }
}

/** @returns {[md.ListItem, md.Paragraph?]} */
function extractReason(/** @type {md.ListItem} */ item) {
  let p = item.children.at(-1)
  if (p?.type != "paragraph") {
    return [item]
  }

  const last = p.children.at(-1)
  if (last?.type != "text") {
    return [item]
  }
  if (last.value.at(-1) != "}") {
    return [item]
  }

  const startIndex = p.children.findLastIndex(
    (x) => x.type == "text" && x.value.includes("{"),
  )
  if (startIndex == -1) {
    return [item]
  }

  const start = /** @type {md.Text} */ (p.children[startIndex])
  const charIndex = start.value.lastIndexOf("{")

  const reason = p.children.slice(startIndex, p.children.length - startIndex)
  p = { type: "paragraph", children: p.children.slice(0, startIndex) }
  if (charIndex != 0) {
    const pre = start.value.slice(0, charIndex)
    start.value = start.value.slice(charIndex)
    p.children.push({ type: "text", value: pre })
  }

  // @ts-expect-error we know reason[...] is a Text node, so this is fine
  reason[0] = { type: "text", value: reason[0].value.slice(1) }
  reason[reason.length - 1] = {
    type: "text",
    // @ts-expect-error we know reason[...] is a Text node, so this is fine
    value: reason[reason.length - 1].value.slice(1),
  }

  return [
    {
      type: "listItem",
      checked: item.checked,
      spread: item.spread,
      children: [p, ...item.children.slice(1)],
    },
    { type: "paragraph", children: reason },
  ]
}

function escapeHTML(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("'", "&apos;")
    .replaceAll('"', "&quot;")
}

function escape(/** @type {TemplateStringsArray} */ text, ...interps) {
  return String.raw({ raw: text }, ...interps.map(escapeHTML))
}
