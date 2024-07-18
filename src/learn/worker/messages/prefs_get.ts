import { db } from "../db"
import { stmts } from "../stmts"

/** Does not create a transaction. */
export function prefs_get() {
  const result = db.single("SELECT * FROM prefs WHERE id = 0")
  return stmts.prefs.interpret(result.values[0]!)
}
