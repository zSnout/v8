import { notNull } from "@/components/pray"
import type { Id } from "@/learn/lib/id"
import { db } from "../db"
import { stmts } from "../stmts"

/** Does not create a transaction. */
export function conf_get_by_deck(id: Id | null) {
  const data = notNull(
    db.single(
      id == null
        ? "SELECT * FROM confs WHERE id = 0"
        : "SELECT * FROM confs WHERE id = (SELECT cfid FROM decks WHERE id = $deck)",
      { $deck: id },
    ).values[0],
    "That deck does not exist.",
  )

  return stmts.confs.interpret(data)
}
