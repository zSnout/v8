import type { Id } from "@/learn/lib/id"
import { int } from "../checks"
import { db } from "../db"

export function manage_models_count(mid: Id) {
  const tx = db.tx()
  try {
    const nids = db.val("SELECT COUNT() FROM notes WHERE mid = ?", int, [mid])

    const cids = db.val(
      "SELECT COUNT() FROM cards WHERE (SELECT mid FROM notes WHERE notes.id = cards.nid) = ?",
      int,
      [mid],
    )

    tx.commit()
    return { nids, cids }
  } finally {
    tx.dispose()
  }
}
