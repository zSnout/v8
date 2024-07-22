import { randomId } from "@/learn/lib/id"
import { db } from "../db"

/** Does not create a transaction. */
export function create_deck(name: string) {
  db.run(
    "INSERT OR IGNORE INTO decks (id, name, is_filtered) VALUES (?, ?, 0)",
    [randomId(), name],
  )
}
