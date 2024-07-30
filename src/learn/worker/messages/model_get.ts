import type { Id } from "@/learn/lib/id"
import { sql } from ".."
import { stmts } from "../stmts"

/** Does not create a transaction */
export function model_get(mid: Id) {
  return stmts.models.interpret(
    sql`SELECT * FROM models WHERE id = ${mid};`.getRow(),
  )
}
