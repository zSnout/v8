import { db } from "../db"
import { stmts } from "../stmts"

export function prefs_get() {
  const result = db.exec("SELECT * FROM prefs WHERE id = 0")[0]!
  return stmts.prefs.interpret(result.values[0]!)
}
