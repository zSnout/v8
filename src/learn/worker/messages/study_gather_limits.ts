import { isSameDaySync } from "@/learn/db/day"
import { type Id, ID_ZERO } from "@/learn/lib/id"
import { id, int } from "../checks"
import { db } from "../db"

export function study_gather_limits_txless(
  main: Id | null,
  decks: Id[],
  dayStart: number,
) {
  const cfid =
    main == null
      ? ID_ZERO
      : db.val("SELECT cfid FROM decks WHERE id = ?", id, [main])

  const conf = db.checked(
    "SELECT new_per_day, review_per_day FROM confs WHERE id = ?",
    [int, int],
    [cfid],
  ).values[0]!

  const stmt = db.prepare(
    "SELECT custom_revcard_limit, custom_newcard_limit, default_revcard_limit, default_newcard_limit, new_today, revcards_today, revlogs_today, today FROM decks WHERE id = ?",
  )

  let new_today = 0
  let rev_today = 0

  try {
    for (const did of decks) {
      stmt.bind([did])
      const value = stmt.get() as [
        custom_revcard_limit: number | null,
        custom_newcard_limit: number | null,
        default_revcard_limit: number | null,
        default_newcard_limit: number | null,
        new_today: string,
        revcards_today: string,
        revlogs_today: number,
        today: number,
      ]

      const isToday = isSameDaySync(dayStart, Date.now(), value[7])

      const limitRev = (isToday ? value[0] : null) ?? value[2] ?? conf[1]
      const limitNew = (isToday ? value[1] : null) ?? value[3] ?? conf[0]

      if (isToday) {
        new_today += (JSON.parse(value[4]) as number[]).length
        rev_today += (JSON.parse(value[5]) as number[]).length
      }
    }
  } finally {
    stmt.free()
  }
}
