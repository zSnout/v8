// TODO: ban `:` `#` `^` `/` `$` `@` `{` `}` `\s` from field names
// TODO: field replacement
// TODO: {{Tags, Type, Deck, Subdeck, CardFlag, Card, FrontSide}}
// TODO: match hint content, css, and css classes to anki
// TODO: img
// TODO: audio
// TODO: video
// TODO: latex
// TODO: {{type:fieldname}} (these inherit the font of fields)
// TODO: ignore card when front is empty
// TODO: clozes

import { error, ok, Result } from "@/components/result"
import { randomId } from "./id"
import { ModelField } from "./types"

export type Text = { type: "text"; text: string }
export type Field = { type: "field"; field: string }
export type Tag = {
  type: "tag"
  negative: boolean
  name: string
  contents: Template
}
export type Item = Text | Field | Tag
export type Template = Item[]

export function parseTemplate<T extends string>(source: T): Result<Template> {
  const output: Template = []
  const inner: Template[] = []
  let current = output
  let index = 0

  while (index < source.length) {
    const indexOfExpr = source.indexOf("{{", index)

    if (indexOfExpr == -1) {
      current.push({ type: "text", text: source.slice(index) })
      break
    }

    if (indexOfExpr != 0) {
      current.push({ type: "text", text: source.slice(index, indexOfExpr) })
      index = indexOfExpr
    }

    const end = source.indexOf("}}", index)
    if (end == -1) {
      return error("Unmatched opening `{{`.")
    }

    const expr = source.slice(index + 2, end).trim()
    index = end + 2

    if (expr[0] == "#" || expr[0] == "^") {
      const contents: Template = []
      const tag: Tag = {
        type: "tag",
        negative: expr[0] == "^",
        name: expr.slice(1),
        contents,
      }
      current.push(tag)
      inner.push(current)
      current = contents
      continue
    }

    if (expr[0] == "^") {
      const prev = inner.pop()
      if (prev == null) {
        return error("Unmatched closing conditional `{{/name}}`.")
      }

      current = prev
      continue
    }

    current.push({ type: "field", field: expr })
  }

  if (inner.length != 0) {
    return error("Unmatched opening conditional `{{#name}}` or `{{^name}}`.")
  }

  return ok(current)
}

export function htmlToText(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  return doc.documentElement.textContent || ""
}

export type RequiredFieldName =
  | "Tags"
  | "Type"
  | "Deck"
  | "Subdeck"
  | "CardFlag"
  | "Card"
  | "FrontSide"

export interface TemplateMeta {
  readonly tts: string[]
  readonly hints: string[]
}

type Action = (fieldValue: string, meta: TemplateMeta) => string

const actions: Record<string, Action> = {
  tts(value, meta) {
    const id = randomId().toString()
    meta.tts.push(id)
    return `<span id=${id} style=display:contents>${value}</span>`
  },
  text(value) {
    return htmlToText(value)
  },
  hint(value) {
    const id = randomId().toString()
    return `<button id=${id} style=text-decoration:underline>&lt;reveal hint&gt;</button><span style=display:none>${value}</span>`
  },
  furigana(value) {
    const regex = /([^[\]]+)\[([^[\]]+)\]|([^[\]]+)/g
    let output = `<ruby>`
    let match
    while ((match = regex.exec(value))) {
      if (match[3]) {
        output += match[3]
      } else {
        output += `${match[1]}<rp>(</rp><rt>${match[2]}</rt><rp>)</rp>`
      }
    }
    output += `</ruby>`
    return output
  },
  kanji(value) {
    const regex = /([^[\]]+)\[([^[\]]+)\]|([^[\]]+)/g
    let output = ""
    let match
    while ((match = regex.exec(value))) {
      if (match[3]) {
        output += match[3]
      } else {
        output += match[1]
      }
    }
    return output
  },
  kana(value) {
    const regex = /([^[\]]+)\[([^[\]]+)\]|([^[\]]+)/g
    let output = ""
    let match
    while ((match = regex.exec(value))) {
      if (match[2]) {
        output += match[2]
      }
    }
    return output
  },
}

function inner(
  source: Template,
  fields: Record<string, string>,
  meta: TemplateMeta,
): Result<string> {
  let output = ""

  for (const item of source) {
    if (item.type == "tag") {
      const value = fields[item.name]
      if (value == null) {
        throw new Error("Referenced field `" + item.name + "` does not exist.")
      }
      const exists = !!value.trim()
      if (exists != item.negative) {
        const result = inner(item.contents, fields, meta)
        if (!result.ok) {
          return result
        }
        output += result.value
      }
      continue
    }

    if (item.type == "text") {
      output += item.text
      continue
    }

    const { field } = item
    const colon = field.indexOf(":")
    if (colon == -1) {
      const value = fields[field]
      if (value == null) {
        throw new Error("Referenced field does not exist.")
      }
      output += value
      continue
    }

    const actionName = field.slice(0, colon)
    const action = actions[actionName]
    if (action == null) {
      throw new Error(`Action \`{{${actionName}:...}}\` does not exist.`)
    }
    const fieldName = field.slice(colon + 1)
    const fieldValue = fields[fieldName]
    if (fieldValue == null) {
      throw new Error("Referenced field does not exist.")
    }
    output += action(fieldValue, meta)
  }

  return ok(output)
}

/** Checks if at least one field is referenced and is non-empty. */
export function isFilled(
  source: Template,
  fields: Record<string, string>,
): boolean {
  for (const item of source) {
    if (item.type == "tag") {
      const value = fields[item.name]
      if (value == null) {
        throw new Error("Referenced field `" + item.name + "` does not exist.")
      }
      const exists = !!value.trim()
      if (exists != item.negative) {
        if (isFilled(item.contents, fields)) {
          return true
        }
      }
      continue
    }

    if (item.type == "text") {
      continue
    }

    const { field } = item
    const colon = field.indexOf(":")
    if (colon == -1) {
      const value = fields[field]
      if (value == null) {
        throw new Error("Referenced field does not exist.")
      }
      if (value.trim() != "") {
        return true
      }
      continue
    }

    const actionName = field.slice(0, colon)
    const action = actions[actionName]
    if (action == null) {
      throw new Error(`Action \`{{${actionName}:...}}\` does not exist.`)
    }
    const fieldName = field.slice(colon + 1)
    const fieldValue = fields[fieldName]
    if (fieldValue == null) {
      throw new Error("Referenced field does not exist.")
    }
    if (fieldValue.trim() != "") {
      return true
    }
  }

  return false
}

// TODO: force function to accept `RequiredFieldName`s
/** Fills in a compiled template with field values. */
export function generate(source: Template, fields: Record<string, string>) {
  const meta: TemplateMeta = { tts: [], hints: [] }
  const result = inner(source, fields, meta)
  if (!result.ok) {
    return result
  }
  return ok({ html: result.value, meta })
}

/** Creates a record of fields from a model and array of fields. */
export function fieldRecord(model: readonly ModelField[], fields: string[]) {
  if (model.length != fields.length) {
    return error(
      `Model has \`${model.length}\` field${
        model.length == 1 ? "" : "s"
      }, but note provided \`${fields.length}\`.`,
    )
  }

  const record: Record<string, string> = Object.create(null)

  for (let index = 0; index < model.length; index++) {
    const mf = model[index]!
    const field = fields[index]!
    record[mf.name] = field
  }

  return ok(record)
}

export {
  parseTemplate as parse,
  type TemplateMeta as Meta,
  type Template as Type,
}
