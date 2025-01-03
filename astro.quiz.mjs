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

/** @type {<T>(arr: T[]) => T[]} */
function shuffle(array) {
  let currentIndex = array.length
  let randomIndex

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

/** @returns {[string, string[]]} */
function stretch(/** @type {number} */ items) {
  if (items % 2 == 0) {
    return ["grid grid-cols-1 xs:grid-cols-2", [""]]
  }

  if (items == 1) {
    return ["grid grid-cols-1", [""]]
  }

  return [
    "grid grid-cols-1 xs:grid-cols-2",
    Array.from({ length: items }, (_, i) =>
      i == items - 1 ? "xs:col-span-2" : "",
    ),
  ]
}

/**
 * @type {(
 *   this: px,
 *   kind: "radio",
 *   source: md.Paragraph,
 *   list: md.List,
 * ) => md.Content}
 */
export function makeQuiz(kind, source, list) {
  const { Li, Submit, h } = els(this)

  if (list.children.reduce((a, b) => a + +!!b.checked, 0) != 1) {
    throw new Error("Radio-style quizzes must have exactly one correct answer.")
  }

  const name = crypto.randomUUID()

  const items = list.ordered ? list.children : shuffle(list.children)
  const [grid, clsx] = stretch(items.length)

  return h(
    "form",
    "",
    h("div", "last:*:mb-2", source),
    h("div", grid + " gap-2", ...items.map((x, i) => Li(x, name, clsx[i]))),
    h("div", "flex", Submit()),
  )
}

const COLORS = {
  "⁰": "",
  "¹": "text-sky-600 dark:text-sky-400",
  "²": "text-rose-600 dark:text-rose-400",
  "³": "text-green-600 dark:text-green-400",
  "⁴": "text-violet-600 dark:text-violet-400",
  "⁵": "text-orange-600 dark:text-orange-400",
  "⁶": "text-fuchsia-600 dark:text-fuchsia-400",
}

export function els(/** @type {px} */ processor) {
  return { h, Li, Submit, colorize, cx, fa }

  function fa(
    /** @type {import("@fortawesome/free-solid-svg-icons").IconDefinition} */ icon,
    className = "",
  ) {
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
        "size-5 min-w-5 mt-1 border border-slate-200 rounded-full peer-checked:bg-[--z-bg-checkbox-selected] peer-checked:border-0 flex peer-checked:*:block",
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
        "size-5 min-w-5 mt-1 border border-slate-200 rounded peer-checked:bg-[--z-bg-checkbox-selected] peer-checked:border-0 flex peer-checked:*:block",
        fa(faCheck, "size-4 m-auto hidden fill-white"),
      ),
    ]
  }

  function Li(
    /** @type {md.ListItem} */ liRaw,
    /** @type {string} */ name,
    /** @type {string} */ className,
  ) {
    const [li, reason] = extractReason(liRaw)

    return h(
      "label",
      "flex border border border-slate-200 dark:border-slate-700 rounded-lg [&:has(>:checked)]:bg-blue-100 dark:[&:has(>:checked)]:bg-blue-900 [&:has(>:checked)]:border-blue-300 dark:[&:has(>:checked)]:border-blue-600 dark:[&:has(>:checked)]:text-blue-200 [&:has(>:checked)]:text-sky-900 pl-2 py-1 pr-3 gap-2 cursor-pointer " +
        className,
      ...Radio(name),
      h("div", "text-base/1.5 first:*:mt-0 last:*:mb-0", ...li.children),
      reason && h("div", "quiz-reason hidden", ...reason.children),
    )
  }

  function Submit() {
    return h("input", {
      type: "submit",
      value: "Submit",
      class:
        "rounded-lg border border-slate-200 bg-z-body-selected border-transparent z-field shadow-none py-1 px-2 mt-2 ml-auto w-36",
    })
  }

  function h(
    tagName,
    /** @type {string | Record<string, string>} */ className = "",
    /** @type {(md.Content | string | null | undefined)[]} */ ...children
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
          typeof x == "string" ? escapeHTML(x)
          : x.type == "html" ? x.value
          : processor.stringify(processor.runSync(x)),
        )
        .join("")}</${tagName}>`,
    }
  }

  function colorize(/** @type {string} */ text) {
    return h(
      "span",
      "",
      ...text.split(/(?=[⁰¹²³⁴⁵⁶])/).map((part) => {
        if (part[0] in COLORS) {
          if (COLORS[part[0]] && /[,.:;!?()[\]{}]/.test(part.slice(1))) {
            return h("span", "text-[200px]", "😭")
          }
          return h(
            "span",
            COLORS[part[0]],
            ...part
              .slice(1)
              .split("/")
              .flatMap((x, i) => (i ? ["/", h("wbr", "md:hidden"), x] : [x])),
          )
        } else {
          return h(
            "span",
            "",
            ...part
              .split("/")
              .flatMap((x, i) => (i ? ["/", h("wbr", "md:hidden"), x] : [x])),
          )
        }
      }),
    )
  }

  function cx(
    /** @type {string} */ text,
    /** @type {string | null | undefined} */ meta = "",
  ) {
    return text.split("\n\n").map((row) => {
      const [src, ...dst] = row.split("\n")
      const lg = meta == "sm" ? " text-xl" : " text-3xl"
      const sm = meta == "sm" ? " text-sm" : ""
      return h(
        "div",
        "flex-1 text-center -m-px relative " + (meta == "sm" ? "px-2" : "px-4"),
        h("div", "absolute bottom-full h-4 inset-x-0 bg-z-body"),
        h("div", "absolute top-full h-4 inset-x-0 bg-z-body"),
        h("p", "font-semibold my-0 break-words" + lg, colorize(src)),
        ...dst.map((dst) =>
          h(
            "p",
            "my-0 [line-height:1.5] whitespace-normal md:whitespace-nowrap" +
              sm,
            colorize(dst),
          ),
        ),
      )
    })
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
