import { notNull } from "@/components/pray"
import { startOfDaySync } from "@/learn/db/day"
import type { Id } from "@/learn/lib/id"
import { __unsafeDoNotUseDangerouslySetInnerHtmlYetAnotherMockOfReactRepeatUnfiltered } from "@/learn/lib/repeat"
import { FSRS } from "ts-fsrs"
import { db } from "../db"
import { stmts } from "../stmts"
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

export function study_select_txless(root: Id | null, all: Id[]) {
  const now = Date.now()
  const prefs = prefs_get()
  const limits = deck_limits_txless(root, prefs.day_start)
  const { new_today, rev_today } = deck_done_today_txless(all, prefs.day_start)
  const { new_left, rev_left } = deck_left_txless(all)
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
      ? true
      : null

  const cid =
    // 1. If PREFER_NEW, a new card.
    (PREFER_NEW && pickNew(includeBuried, conf.new.pick_at_random, all)) ??
    // 2. A (re)learning card.
    pickLearningToday(includeBuried, now, all) ??
    // 3. A card that's due today.
    pickReviewToday(includeBuried, todayEnd, all) ??
    // 4. A (re)learning card due soon.
    pickLearningToday(includeBuried, now + prefs.collapse_time * 1000, all) ??
    // 5. A new card
    pickNew(includeBuried, conf.new.pick_at_random, all)

  if (cid == null) {
    return null
  }

  const card = stmts.cards.interpret(
    db.row("SELECT * FROM cards WHERE id = ?", [cid]),
  )

  const note = stmts.notes.interpret(
    db.row("SELECT * FROM notes WHERE id = ?", [card.nid]),
  )

  const model = stmts.models.interpret(
    db.row("SELECT * FROM models WHERE id = ?", [note.mid]),
  )

  const deck = stmts.decks.interpret(
    db.row("SELECT * FROM decks WHERE id = ?", [card.did]),
  )

  const tmpl = notNull(
    model.tmpls[card.tid],
    "One of the cards in your database is not linked to a valid template.",
  )

  return {
    cid,
    prefs,
    limits,
    conf,
    deckInfo: { new_today, rev_today, new_left, rev_left },

    card,
    deck,
    note,
    model,
    tmpl,
    repeat:
      __unsafeDoNotUseDangerouslySetInnerHtmlYetAnotherMockOfReactRepeatUnfiltered(
        card,
        conf,
        prefs.day_start,
        new FSRS({
          enable_fuzz: conf.review.enable_fuzz,
          maximum_interval: conf.review.max_review_interval,
          request_retention: conf.review.requested_retention,
          w: conf.review.w ?? undefined,
        }),
        now,
        0,
      ),
  }
}

export function study_select(root: Id | null, all: Id[]) {
  const tx = db.tx()

  try {
    const value = study_select_txless(root, all)
    tx.commit()
    return value
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
        return stmt.get(0) as Id
      }
      stmt.reset()
    }

    return
  } finally {
    stmt.finalize()
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
          return stmt.get(0) as Id
        }
        stmt.reset()
        return
      })
      .filter((x) => x != null)

    return cids[0]
  } finally {
    stmt.finalize()
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
          return stmt.get(0) as Id
        }
        stmt.reset()
        return
      })
      .filter((x) => x != null)

    return cids[0]
  } finally {
    stmt.finalize()
  }
}