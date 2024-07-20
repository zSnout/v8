import type { SqlValue } from "@sqlite.org/sqlite-wasm"
import { db } from "../db"

function split(text: string) {
  let current = ""
  let output = []
  let quote: "'" | '"' | "`" | undefined

  const iterator = text[Symbol.iterator]()
  for (const char of iterator) {
    if (char == "'" || char == '"' || char == "`") {
      if (quote == char) {
        quote = undefined
      } else {
        quote = char
      }
    } else if (char == "\\") {
      current += "\\"
      const next = iterator.next()
      if (!next.done) {
        current += next.value
      }
      continue
    } else if (quote == null && char == ";") {
      output.push(current)
      current = ""
      continue
    }

    current += char
  }

  if (current) {
    output.push(current)
  }

  return output.filter((x) => x.trim())
}

export function user_query_unsafe(query: string): {
  columns: string[]
  values: SqlValue[][]
}[] {
  return split(query).map((query) => db.runWithColumns(query))
}
