import type { Id } from "@/learn/lib/id"
import { db } from ".."

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
      stmtNew.clearBindings().bind([did])
      if (stmtNew.step()) {
        new_left += stmtNew.get(0) as number
      }
      stmtNew.reset()

      stmtRev.clearBindings().bind([did])
      if (stmtRev.step()) {
        rev_left += stmtRev.get(0) as number
      }
      stmtRev.reset()
    }

    return { new_left, rev_left }
  } finally {
    stmtNew.finalize()
    stmtRev.finalize()
  }
}

export function deck_left(decks: Id[]) {
  const tx = db.read()
  try {
    return deck_left_txless(decks)
  } finally {
    tx.dispose()
  }
}
