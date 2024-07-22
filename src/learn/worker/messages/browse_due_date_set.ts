import type { Id } from "@/learn/lib/id"
import { db } from "../db"

export function browse_due_date_set(cids: Id[], due: number) {
  const tx = db.tx()
  try {
    const stmt = db.prepare(
      "UPDATE cards SET due = ? WHERE id = ? AND state != 0",
    )
    for (const id of cids) {
      stmt.bind([due, id]).stepReset()
    }
    stmt.finalize()
    tx.commit()
  } finally {
    tx.dispose()
  }
}
