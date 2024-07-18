import type { Prefs } from "@/learn/lib/types"
import { db } from "../db"
import { stmts } from "../stmts"

export function prefs_set(prefs: Prefs) {
  const tx = db.tx()
  try {
    db.exec(stmts.prefs.update, stmts.prefs.insertArgs(prefs))
    tx.commit()
  } finally {
    tx.dispose()
  }
}
