import { db } from "../db"
import { stmts } from "../stmts"

export function manage_models_get() {
  return db.run("SELECT * FROM models").map(stmts.models.interpret)
}
