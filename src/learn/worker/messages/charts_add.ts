import { idOf } from "@/learn/lib/id"
import type { ChartCard } from "@/learn/lib/types"
import { db } from "../db"
import { stmts } from "../stmts"

export function charts_add(title: string, query: string) {
  const tx = db.tx()
  try {
    const max = db.selectValue("SELECT max(id) FROM charts")
    const next = typeof max == "number" ? max + 1 : 0

    const card: ChartCard = {
      id: idOf(next),
      last_edited: Date.now(),
      title,
      query,
      chart: {
        mainAxis: {
          min: 0,
          max: null,
          groupSize: 1,
          groupSizeIsPercentage: false,
          label: {
            format: "numeric",
            overflow: "ellipsis",
            frequency: {
              by: "all",
              each: 1,
            },
            display: "separate",
          },
        },
        crossAxis: {
          min: 0,
          max: null,
          label: {
            format: "preserve",
            overflow: "ellipsis",
            frequency: {
              by: "all",
              each: 1,
            },
            display: "hidden",
          },
        },
        showTotal: false,
        stacked: true,
        type: "bar",
        space: false,
        rounded: false,
      },
      style: {
        padded: false,
        bordered: false,
        layered: true,
        roundCard: true,
        width: 1,
        height: 1,
        titleLocation: "floating",
        titleBorder: "none",
        titleAlign: "center",
      },
      options: [],
    }

    db.run(stmts.charts.insert, stmts.charts.insertArgs(card))
    tx.commit()
  } finally {
    tx.dispose()
  }
}
