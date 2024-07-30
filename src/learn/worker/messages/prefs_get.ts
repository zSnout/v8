import { sql } from ".."
import { stmts } from "../stmts"

/** Does not create a transaction. */
export function prefs_get() {
  return stmts.prefs.interpret(sql`SELECT * FROM prefs WHERE id = 0;`.getRow())
}
