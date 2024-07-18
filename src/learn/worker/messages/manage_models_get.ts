import { db } from "../db"
import { stmts } from "../stmts"

export function manage_models_get() {
  return db.single("SELECT * FROM models").values.map(stmts.models.interpret)
}
