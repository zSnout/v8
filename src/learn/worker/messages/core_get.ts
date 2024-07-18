import { db } from "../db"
import { stmts } from "../stmts"

/** Does not create a transaction. */
export function core_get() {
  const result = db.single("SELECT * FROM core WHERE id = 0")
  return stmts.core.interpret(result.values[0]!)
}
