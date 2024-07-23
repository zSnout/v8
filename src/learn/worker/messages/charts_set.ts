import type { ChartCard } from "@/learn/lib/types"
import { db } from "../db"
import { stmts } from "../stmts"

export function charts_set(data: ChartCard[]) {
  const tx = db.readwrite("Set charts")
  try {
    db.exec("DELETE FROM charts")
    const stmt = db.prepare(stmts.charts.insert)
    for (const stat of data) {
      stmt.bind(stmts.charts.insertArgs(stat))
      stmt.stepReset()
    }
    stmt.finalize()
    tx.commit()
  } finally {
    tx.dispose()
  }
}
