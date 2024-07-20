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
        new_left += stmtNew.get(0) as number
      }

      stmtRev.bind([did])
      if (stmtRev.step()) {
        rev_left += stmtRev.get(0) as number
      }
    }

    return { new_left, rev_left }
  } finally {
    stmtNew.finalize()
  }
}

export function deck_left(decks: Id[]) {
  const tx = db.tx()
  try {
    const value = deck_left_txless(decks)
    tx.commit()
    return value
  } finally {
    tx.dispose()
  }
}
