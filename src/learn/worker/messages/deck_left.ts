import { isSameDaySync } from "@/learn/db/day"
import type { Id } from "@/learn/lib/id"
import { db } from "../db"

export function deck_left_txless(decks: Id[], dayStart: number) {
  const stmtNew = db.prepare(
    "SELECT COUNT(),today FROM cards WHERE did = ? AND state = 0",
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
        const [count, today] = stmtNew.get() as [number, number]
        const isToday = isSameDaySync(dayStart, Date.now(), today)

        if (isToday) {
          new_left += count
        }
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

export function deck_left(decks: Id[], dayStart: number) {
  const tx = db.tx()
  try {
    return deck_left_txless(decks, dayStart)
  } finally {
    tx.dispose()
  }
}
