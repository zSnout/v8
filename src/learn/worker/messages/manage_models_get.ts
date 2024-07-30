import { sql } from ".."
import { stmts } from "../stmts"

export function manage_models_get() {
  return sql`SELECT * FROM models;`.getAll().map(stmts.models.interpret)
}
