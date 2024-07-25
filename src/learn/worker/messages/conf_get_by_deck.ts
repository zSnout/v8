import type { Id } from "@/learn/lib/id"
import { db } from ".."
import { stmts } from "../stmts"

/** Does not create a transaction. */
export function conf_get_by_deck(id: Id | null) {
  const data = db.row(
    id == null ?
      "SELECT * FROM confs WHERE id = 0"
    : "SELECT * FROM confs WHERE id = (SELECT cfid FROM decks WHERE id = $deck)",
    { $deck: id },
  )

  return stmts.confs.interpret(data)
}
