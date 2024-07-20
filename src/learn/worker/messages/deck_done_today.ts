import { isSameDaySync } from "@/learn/db/day"
import type { Id } from "@/learn/lib/id"
import { db } from "../db"

export function deck_done_today_txless(decks: Id[], dayStart: number) {
  const stmt = db.prepare(
    "SELECT today, new_today, revcards_today FROM decks WHERE id = ?",
  )

  let new_today = 0
  let rev_today = 0

  try {
    for (const did of decks) {
      stmt.bind([did])
      if (stmt.step()) {
        const value = stmt.get() as [
          today: number,
          new_today: string,
          revcards_today: string,
        ]

        const isToday = isSameDaySync(dayStart, Date.now(), value[0])

        if (isToday) {
          new_today += (JSON.parse(value[1]) as number[]).length
          rev_today += (JSON.parse(value[2]) as number[]).length
        }
      }
    }

    return { new_today, rev_today }
  } finally {
    stmt.finalize()
  }
}

export function deck_done_today(decks: Id[], dayStart: number) {
  const tx = db.tx()
  try {
    const value = deck_done_today_txless(decks, dayStart)
    tx.commit()
    return value
  } finally {
    tx.dispose()
  }
}
