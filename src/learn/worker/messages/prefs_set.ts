import type { Reason } from "@/learn/db/reason"
import type { Prefs } from "@/learn/lib/types"
import { db } from ".."
import { stmts } from "../stmts"

export function prefs_set(prefs: Prefs, reason: Reason) {
  const tx = db.readwrite(reason)
  try {
    db.run(stmts.prefs.update, stmts.prefs.insertArgs(prefs))
    tx.commit()
  } finally {
    tx.dispose()
  }
}
