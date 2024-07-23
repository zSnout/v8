import { db } from "../db"
import { stmts } from "../stmts"

export function charts_get() {
  const tx = db.read()
  try {
    return db
      .selectArrays("SELECT * FROM charts ORDER BY id")
      .map(stmts.charts.interpret)
  } finally {
    tx.dispose()
  }
}
