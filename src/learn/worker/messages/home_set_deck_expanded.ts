import { Id, randomId } from "@/learn/lib/id"
import { db } from "../db"

export function home_set_deck_expanded(
  idOrName: Id | string,
  expanded: boolean,
) {
  const tx = db.tx()

  try {
    if (typeof idOrName == "number") {
      db.run("UPDATE decks SET collapsed = ? WHERE id = ?", [
        +!expanded,
        idOrName,
      ])
    } else {
      db.run(
        "INSERT INTO decks (id, name, collapsed, is_filtered) VALUES (?, ?, ?, 0) ON CONFLICT(name) DO UPDATE SET is_filtered = excluded.is_filtered",
        [randomId(), idOrName, +!expanded],
      )
    }

    tx.commit()
  } finally {
    tx.dispose()
  }
}
