import { isSameDaySync } from "@/learn/db/day"
import { type Id, ID_ZERO } from "@/learn/lib/id"
import { id, int, qint } from "../checks"
import { db } from "../db"
import { prefs_get } from "./prefs_get"

export function deck_limits_txless(root: Id | null, dayStart: number): Limits {
  const [
    cfid,
    custom_revcard_limit,
    custom_newcard_limit,
    default_revcard_limit,
    default_newcard_limit,
    today,
  ] =
    root == null
      ? [ID_ZERO, null, null, null, null]
      : (db.checked(
          "SELECT cfid, custom_revcard_limit, custom_newcard_limit, default_revcard_limit, default_newcard_limit, today FROM decks WHERE id = ?",
          [id, qint, qint, qint, qint, int],
          [root],
        ).values[0] ?? [ID_ZERO, null, null, null, null])

  const [new_per_day, rev_per_day] = db.checked(
    "SELECT new_per_day, review_per_day FROM confs WHERE id = ?",
    [int, int],
    [cfid],
  ).values[0]!

  const isToday =
    (today != null && isSameDaySync(dayStart, Date.now(), today)) || null

  return {
    new: {
      deckToday: isToday && custom_newcard_limit,
      deckDefault: default_newcard_limit,
      confStandard: new_per_day,
      now:
        (isToday && custom_newcard_limit) ??
        default_newcard_limit ??
        new_per_day,
    },
    rev: {
      deckToday: isToday && custom_revcard_limit,
      deckDefault: default_revcard_limit,
      confStandard: rev_per_day,
      now:
        (isToday && custom_revcard_limit) ??
        default_revcard_limit ??
        rev_per_day,
    },
  }
}

export interface Limit {
  deckToday: number | null
  deckDefault: number | null
  confStandard: number
  now: number
}

export interface Limits {
  new: Limit
  rev: Limit
}

export function deck_limits(main: Id | null): Limits {
  const tx = db.tx()
  try {
    return deck_limits_txless(main, prefs_get().day_start)
  } finally {
    tx.dispose()
  }
}

export interface Limit {
  deckToday: number | null
  deckDefault: number | null
  confStandard: number
  now: number
}

export interface Limits {
  new: Limit
  rev: Limit
}
