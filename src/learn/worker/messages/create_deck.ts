import { randomId } from "@/learn/lib/id"
import { db } from "../db"

/** Does not create a transaction. */
export function create_deck(name: string) {
  const tx = db.readwrite(`Create deck ${name}`)
  try {
    db.run(
      "INSERT OR IGNORE INTO decks (id, name, is_filtered) VALUES (?, ?, 0)",
      [randomId(), name],
    )
    tx.commit()
  } finally {
    tx.dispose()
  }
}
