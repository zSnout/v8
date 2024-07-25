import type { Collection } from "@/learn/lib/types"
import type { SqlValue } from "@sqlite.org/sqlite-wasm"
import { db } from ".."
import query_reset from "../query/reset.sql?raw"
import query_schema from "../query/schema.sql?raw"
import { stmts } from "../stmts"

function inner<T>(
  meta: { insert: string; insertArgs(item: T): SqlValue[] },
  items: T[],
) {
  const stmt = db.prepare(meta.insert)
  try {
    for (const item of items) {
      stmt.clearBindings().bind(meta.insertArgs(item)).stepReset()
    }
  } finally {
    stmt.finalize()
  }
}

export function import_json_parsed(data: Collection) {
  const tx = db.readwrite("Import collection JSON")
  try {
    db.exec(query_reset)
    db.exec(query_schema)
    inner(stmts.core, [data.core])
    inner(stmts.graves, data.graves)
    inner(stmts.confs, data.confs)
    inner(stmts.decks, data.decks)
    inner(stmts.models, data.models)
    inner(stmts.notes, data.notes)
    inner(stmts.cards, data.cards)
    inner(stmts.rev_log, data.rev_log)
    inner(stmts.prefs, [data.prefs])
    tx.commit()
  } finally {
    tx.dispose()
  }
}
