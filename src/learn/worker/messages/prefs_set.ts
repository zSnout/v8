import type { Reason } from "@/learn/lib/reason"
import type { Prefs } from "@/learn/lib/types"
import { readwrite } from ".."
import { stmts } from "../stmts"

export function prefs_set(prefs: Prefs, reason: Reason) {
  const tx = readwrite(reason)
  try {
    stmts.prefs.update().bindNew(stmts.prefs.insertArgs(prefs)).run()
    tx.commit()
  } finally {
    tx.dispose()
  }
}
