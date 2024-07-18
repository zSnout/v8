import type { Prefs } from "@/learn/lib/types"
import { db } from "../db"
import { stmts } from "../stmts"

export function prefs_set(prefs: Prefs) {
  const tx = db.tx()
  try {
    const stmt = stmts.prefs.prepareUpdate()
    stmt.bind(stmts.prefs.makeArgs(prefs))
    stmt.free()
    tx.commit()
  } finally {
    tx.dispose()
  }
}
