import type { AnyCard, Review } from "@/learn/lib/types"
import { Rating } from "ts-fsrs"
import { db } from ".."
import { int, text } from "../checks"
import { stmts } from "../stmts"

export function study_save_review(
  card: AnyCard,
  log: Review,
  isNew: boolean,
  timeElapsedMs: number,
) {
  const tx = db.readwrite(`Review card as ${Rating[log.rating]}`)
  tx.meta.currentCard = card.id
  try {
    db.run(
      "UPDATE cards SET due = ?, last_review = ?, reps = ?, state = ?, elapsed_days = ?, scheduled_days = ?, stability = ?, difficulty = ?, lapses = ? WHERE id = ?",
      [
        card.due,
        card.last_review,
        card.reps,
        card.state,
        card.elapsed_days,
        card.scheduled_days,
        card.stability,
        card.difficulty,
        card.lapses,
        card.id,
      ],
    )

    db.run(
      stmts.rev_log.insert,
      stmts.rev_log.insertArgs({ ...log, time: timeElapsedMs }),
    )

    const [new_today, revcards_today, revlogs_today] = db.rowChecked(
      "SELECT new_today, revcards_today, revlogs_today FROM decks WHERE id = ?",
      [text, text, int],
      [card.did],
    )

    const revcardsToday = JSON.parse(revcards_today) as number[]
    if (!revcardsToday.includes(card.id)) {
      revcardsToday.push(card.id)
    }

    if (isNew) {
      const newToday = JSON.parse(new_today) as number[]
      if (!newToday.includes(card.id)) {
        newToday.push(card.id)
      }
      db.run(
        "UPDATE decks SET new_today = ?, revcards_today = ?, revlogs_today = ? WHERE id = ?",
        [
          JSON.stringify(newToday),
          JSON.stringify(revcardsToday),
          revlogs_today + 1,
          card.did,
        ],
      )
    } else {
      db.run(
        "UPDATE decks SET revcards_today = ?, revlogs_today = ? WHERE id = ?",
        [JSON.stringify(revcardsToday), revlogs_today + 1, card.did],
      )
    }
    tx.commit()
  } finally {
    tx.dispose()
  }
}
