import { db } from "../db"
import { stmts } from "../stmts"

/** Does not create a transaction. */
export function charts_get() {
  return db
    .selectArrays("SELECT * FROM charts ORDER BY id")
    .map(stmts.charts.interpret)
}
