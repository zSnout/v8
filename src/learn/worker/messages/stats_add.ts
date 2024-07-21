import { idOf } from "@/learn/lib/id"
import type { StatCard } from "@/learn/lib/types"
import { db } from "../db"
import { stmts } from "../stmts"

export function stats_add(title: string, query: string) {
  const tx = db.tx()
  try {
    const max = db.selectValue("SELECT max(id) FROM stats")
    const next = typeof max == "number" ? max + 1 : 0

    const stat: StatCard = {
      id: idOf(next),
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
        titleLocation: "floating",
        titleBorder: "none",
        titleAlign: "center",
      },
    }

    db.run(stmts.stats.insert, stmts.stats.insertArgs(stat))
    tx.commit()
  } finally {
    tx.dispose()
  }
}
