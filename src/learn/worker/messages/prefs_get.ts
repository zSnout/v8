import { db } from ".."
import { stmts } from "../stmts"

/** Does not create a transaction. */
export function prefs_get() {
  return stmts.prefs.interpret(db.row("SELECT * FROM prefs WHERE id = 0"))
}
