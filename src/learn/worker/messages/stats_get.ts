import { db } from "../db"
import { stmts } from "../stmts"

/** Does not create a transaction. */
export function stats_get() {
  return db.selectArrays("SELECT * FROM stats").map(stmts.stats.interpret)
}
