import type { Id } from "@/learn/lib/id"
import { db } from "../db"
import { stmts } from "../stmts"

/** Does not create a transaction */
export function model_get(mid: Id) {
  return stmts.models.interpret(
    db.single("SELECT * FROM models WHERE id = ?", [mid]).values[0]!,
  )
}