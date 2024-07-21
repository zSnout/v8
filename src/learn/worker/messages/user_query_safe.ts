import type { BindingSpec } from "@sqlite.org/sqlite-wasm"
import { db } from "../db"
import { user_query_unsafe } from "./user_query_unsafe"

export function user_query_safe(query: string, bindings?: BindingSpec) {
  const isUnsafe = /begin|transaction|commit|rollback/i.test(query)

  if (isUnsafe) {
    throw new Error("Safe queries cannot use transactions.")
  }

  const tx = db.tx()
  try {
    return user_query_unsafe(query, bindings)
  } finally {
    tx.rollback()
  }
}
