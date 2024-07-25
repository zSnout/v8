import { db } from ".."
import { stmts } from "../stmts"

/** Does not create a transaction. */
export function core_get() {
  return stmts.core.interpret(db.row("SELECT * FROM core WHERE id = 0"))
}
