import type { Prefs } from "@/learn/lib/types"
import type { Handler } from ".."
import { db } from "../db"
import { stmts } from "../stmts"

export const prefs_set = ((prefs: Prefs) => {
  using tx = db.tx()
  const stmt = stmts.prefs.prepareUpdate()
  stmt.bind(stmts.prefs.makeArgs(prefs))
  tx.commit()
}) satisfies Handler
