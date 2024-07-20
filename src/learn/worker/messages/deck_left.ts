import type { Id } from "@/learn/lib/id"
import { db } from "../db"

export function deck_left_txless(decks: Id[]) {
  const stmtNew = db.prepare(
    "SELECT COUNT() FROM cards WHERE did = ? AND state = 0",
  )

  const stmtRev = db.prepare(
    "SELECT COUNT() FROM cards WHERE did = ? AND state != 0",
  )

  let new_left = 0
  let rev_left = 0

  try {
    for (const did of decks) {
      stmtNew.bind([did])
      if (stmtNew.step()) {
        const [count] = stmtNew.get() as [number]
        new_left += count
      }

      stmtRev.bind([did])
      if (stmtRev.step()) {
        const [count] = stmtRev.get() as [number]
        rev_left += count
      }
    }

    return { new_left, rev_left }
  } finally {
    stmtNew.free()
  }
}

export function deck_left(decks: Id[]) {
  const tx = db.tx()
  try {
    return deck_left_txless(decks)
  } finally {
    tx.dispose()
  }
}
