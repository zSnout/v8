import type { StatCard } from "@/learn/lib/types"
import { db } from "../db"
import { stmts } from "../stmts"

export function stats_set(data: StatCard[]) {
  const tx = db.tx()
  try {
    db.exec("DELETE FROM stats")
    const stmt = db.prepare(stmts.stats.insert)
    for (const stat of data) {
      stmt.bind(stmts.stats.insertArgs(stat))
      stmt.stepReset()
    }
    stmt.finalize()
    tx.commit()
  } finally {
    tx.dispose()
  }
}
