import { startOfDaySync } from "@/learn/db/day"
import type { Id } from "@/learn/lib/id"
import { id } from "../checks"
import { db } from "../db"
import { conf_get_by_deck } from "./conf_get_by_deck"
import { prefs_get } from "./prefs_get"

export function study_select(root: Id | null, all: Id[]) {
  const tx = db.tx()

  try {
    const prefs = prefs_get()
    const conf = conf_get_by_deck(root)
    const todayStart = startOfDaySync(prefs.day_start, Date.now())
    const todayEnd = todayStart + 1000 * 60 * 60 * 24
    const includeBuried = prefs.last_unburied < todayStart

    const b0: Id[] = []
    const b1: Id[] = []
    const b2: Id[] = []

    for (const did of all) {
      // PERF: statement in a loop
      b0.push(
        ...db
          .checked(
            createStmt(includeBuried, "state = 0 ORDER BY due"),
            [id],
            [did],
          )
          .values.map((x) => x[0]),
      )

      b1.push(
        ...db
          .checked(
            createStmt(includeBuried, "(state = 1 OR state = 3)"),
            [id],
            [did],
          )
          .values.map((x) => x[0]),
      )

      b2.push(
        ...db
          .checked(
            createStmt(includeBuried, "state = 2 AND due < ?"),
            [id],
            [did, todayEnd],
          )
          .values.map((x) => x[0]),
      )
    }
  } finally {
    tx.dispose()
  }
}

function createStmt(includeBuried: boolean, where: string) {
  return `SELECT id FROM cards WHERE did = ? AND (CASE queue WHEN 0 THEN 1 WHEN 1 THEN ${+includeBuried} WHEN 2 THEN 0 END) AND ${where}`
}

function pickNewOrdered(includeBuried: boolean, all: Id[]) {
  const stmt = db.prepare(
    createStmt(includeBuried, "state = 0 ORDER BY due LIMIT 1"),
  )
  for (const did of all) {
    stmt.get([did])
  }
}

function pickNewRandomly(includeBuried: boolean) {
  const stmt = db.prepare(createStmt(includeBuried, "state = 0 ORDER BY due"))
}
