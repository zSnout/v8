import { randomId } from "@/learn/lib/id"
import type { StatCard } from "@/learn/lib/types"
import { db } from "../db"
import { stmts } from "../stmts"

/** Does not create a transaction. */
export function stats_add(title: string, query: string) {
  const stat: StatCard = {
    id: randomId(),
    title,
    query,
    last_edited: Date.now(),
    chart: {
      type: "bar",
      decimalPlaces: 0,
      inlineLabels: false,
      rounded: true,
      space: true,
      labelsEach: 1,
      persistentValues: false,
      showTotal: false,
      stacked: true,
      zeroBaseline: true,
    },
    style: {
      bordered: false,
      height: 1,
      layered: true,
      padded: true,
      roundCard: true,
      width: 1,
    },
  }

  db.run(stmts.stats.insert, stmts.stats.insertArgs(stat))
}
