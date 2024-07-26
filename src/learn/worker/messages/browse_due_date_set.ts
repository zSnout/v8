import type { Id } from "@/learn/lib/id"
import { readwrite } from ".."
import { sql } from "../sql"

export function browse_due_date_set(cids: Id[], due: number) {
  const tx = readwrite("Set card due date")
  try {
    const stmt = sql`UPDATE cards SET due = ? WHERE id = ? AND state != 0`
    for (const id of cids) {
      stmt.bindNew([due, id]).run()
    }
    tx.commit()
  } finally {
    tx.dispose()
  }
}
