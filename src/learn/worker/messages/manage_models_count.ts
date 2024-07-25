import type { Id } from "@/learn/lib/id"
import { int } from "../checks"
import { db } from ".."

export function manage_models_count(mid: Id) {
  const tx = db.read()
  try {
    return {
      nids: db.val("SELECT COUNT() FROM notes WHERE mid = ?", int, [mid]),
      cids: db.val(
        "SELECT COUNT() FROM cards WHERE (SELECT mid FROM notes WHERE notes.id = cards.nid) = ?",
        int,
        [mid],
      ),
    }
  } finally {
    tx.dispose()
  }
}
