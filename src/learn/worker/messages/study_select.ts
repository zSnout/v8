import { startOfDaySync } from "@/learn/db/day"
import type { Id } from "@/learn/lib/id"
import { db } from "../db"
import { conf_get_by_deck } from "./conf_get_by_deck"
import { deck_done_today_txless } from "./deck_done_today"
import { deck_left_txless } from "./deck_left"
import { deck_limits_txless } from "./deck_limits"
import { prefs_get } from "./prefs_get"

/** Selection algorithm
 *
 * The value `PREFER_NEW` means `newLeft / newTotal >= reviewsLeft / reviewsTotal`
 *
 * Return the first card possible from the list below.
 *
 * 1. If PREFER_NEW, a new card.
 * 2. A (re)learning card that's past due (but not by multiple days).
 * 3. A card that's due today (review, learning, or relearning).
 * 4. A (re)learning card that will be due in `prefs.collapse_time`.
 * 5. A new card.
 */
export function study_select(root: Id | null, all: Id[]): Id | null {
  const tx = db.tx()

  try {
    const now = Date.now()
    const prefs = prefs_get()
    const limits = deck_limits_txless(root, prefs.day_start)
    const { new_today, rev_today } = deck_done_today_txless(
      all,
      prefs.day_start,
    )
    const { new_left, rev_left } = deck_left_txless(all, prefs.day_start)
    const conf = conf_get_by_deck(root)
    const todayStart = startOfDaySync(prefs.day_start, now)
    const todayEnd = todayStart + 1000 * 60 * 60 * 24
    const includeBuried = prefs.last_unburied < todayStart

    const EXPECTED_REVIEWS_LEFT =
      new_left * conf.new.learning_steps.length + rev_left

    // TODO: what happens when .now is zero
    const PREFER_NEW =
      Math.max(0, limits.new.now - new_today) / limits.new.now >=
      Math.max(0, Math.min(limits.rev.now - rev_today, EXPECTED_REVIEWS_LEFT)) /
        limits.rev.now

    // 1. If PREFER_NEW, a new card.
    if (PREFER_NEW) {
      const cid = pickNew(includeBuried, conf.new.pick_at_random, all)
      if (cid != null) {
        return cid
      }
    }

    // 2. A (re)learning card.
    {
      const cid = pickLearningToday(includeBuried, now, all)
      if (cid != null) {
        return cid
      }
    }

    // 3. A card that's due today.
    {
      const cid = pickReviewToday(includeBuried, todayEnd, all)
      if (cid != null) {
        return cid
      }
    }

    // 4. A (re)learning card due soon.
    {
      const cid = pickLearningToday(
        includeBuried,
        now + prefs.collapse_time * 1000,
        all,
      )
      if (cid != null) {
        return cid
      }
    }

    // 5. A new card
    {
      const cid = pickNew(includeBuried, conf.new.pick_at_random, all)
      if (cid != null) {
        return cid
      }
    }

    return null
  } finally {
    tx.dispose()
  }
}

function createStmt(includeBuried: boolean, where: string) {
  return `SELECT id FROM cards WHERE did = ? AND (CASE queue WHEN 0 THEN 1 WHEN 1 THEN ${+includeBuried} WHEN 2 THEN 0 END) AND ${where}`
}

function pickNew(includeBuried: boolean, randomWithinDeck: boolean, all: Id[]) {
  const stmt = db.prepare(
    createStmt(
      includeBuried,
      `state = 0 ORDER BY ${randomWithinDeck ? "RANDOM()" : "due"} LIMIT 1`,
    ),
  )

  try {
    for (const did of all) {
      stmt.bind([did])
      if (stmt.step()) {
        const [cid] = stmt.get() as [Id]
        return cid
      }
      stmt.reset()
    }

    return
  } finally {
    stmt.free()
  }
}

function pickLearningToday(includeBuried: boolean, now: number, all: Id[]) {
  // TODO: this is biased on deck size

  const stmt = db.prepare(
    createStmt(
      includeBuried,
      `(state = 1 OR state = 3) AND due <= ${now} AND scheduled_days = 0 ORDER BY RANDOM() LIMIT 1`,
    ),
  )

  try {
    const cids = all
      .map((did) => {
        stmt.bind([did])
        if (stmt.step()) {
          const [cid] = stmt.get() as [Id]
          return cid
        }
        stmt.reset()
        return
      })
      .filter((x) => x != null)

    return cids[0]
  } finally {
    stmt.free()
  }
}

function pickReviewToday(
  includeBuried: boolean,
  endOfToday: number,
  all: Id[],
) {
  // TODO: this is biased on deck size

  const stmt = db.prepare(
    createStmt(
      includeBuried,
      `(state = 2 OR scheduled_days > 0) AND due <= ${endOfToday} ORDER BY RANDOM() LIMIT 1`,
    ),
  )

  try {
    const cids = all
      .map((did) => {
        stmt.bind([did])
        if (stmt.step()) {
          const [cid] = stmt.get() as [Id]
          return cid
        }
        stmt.reset()
        return
      })
      .filter((x) => x != null)

    return cids[0]
  } finally {
    stmt.free()
  }
}
