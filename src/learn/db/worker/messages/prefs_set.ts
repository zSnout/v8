import type { Prefs } from "@/learn/lib/types"
import type { Handler } from ".."
import { db } from "../db"
import { stmts } from "../stmts"

export const prefs_set = ((prefs: Prefs) => {
  const tx = db.tx()
  try {
    const stmt = stmts.prefs.prepareUpdate()
    stmt.bind(stmts.prefs.makeArgs(prefs))
    stmt.free()
    tx.commit()
  } finally {
    tx.dispose()
  }
}) satisfies Handler
