import { open } from "@/learn/db"
import { exportData } from "@/learn/db/save"
import type { SqlValue } from "sql.js"
import { db } from "../db"
import query_reset from "../query/reset.sql?raw"
import query_schema from "../query/schema.sql?raw"
import { stmts } from "../stmts"

export async function idb_import() {
  function inner<T>(
    meta: { insert: string; insertArgs(item: T): SqlValue[] },
    items: T[],
  ) {
    const stmt = db.prepare(meta.insert)
    for (const item of items) {
      stmt.run(meta.insertArgs(item))
    }
    stmt.free()
  }

  const data = await exportData(
    await open("learn:Main", Date.now()),
    Date.now(),
  )

  const tx = db.tx()
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
