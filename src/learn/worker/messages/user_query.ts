import type { BindingSpec, SqlValue } from "@sqlite.org/sqlite-wasm"
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

export function user_query(
  query: string,
  commit: boolean,
  bindings?: BindingSpec,
): {
  columns: string[]
  values: SqlValue[][]
}[] {
  const isUnsafe = /begin|transaction|commit|rollback/i.test(query)

  if (isUnsafe) {
    throw new Error(
      "User queries are automatically run in transactions. For manual control, use SAVEPOINT and RELEASE.",
    )
  }

  const tx = db.readwrite(
    `User query ${query.length > 20 ? query.slice(0, 20) + "..." : query}`,
  )
  try {
    const data = split(query).map((query) => db.runWithColumns(query, bindings))
    if (commit) {
      tx.commit()
    }
    return data
  } finally {
    tx.dispose()
  }
}
