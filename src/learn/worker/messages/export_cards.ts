import { writeCsv } from "@/learn/lib/csv"
import type { Id } from "@/learn/lib/id"
import { export_cards_raw } from "./export_cards_raw"
import { export_name } from "./export_name"

export function export_cards(cids: Id[], format: "csv" | "json" | "txt") {
  const data = export_cards_raw(cids)

  if (format == "json") {
    return new File(
      [JSON.stringify(data.map(([q, a]) => ({ q, a })))],
      export_name(".cards.json"),
      { type: "application/json" },
    )
  }

  if (format == "csv") {
    return new File([writeCsv(data)], export_name(".cards.csv"), {
      type: "text/csv",
    })
  }

  if (format == "txt") {
    return new File(
      [data.map((x) => x.join("\t")).join("\n")],
      export_name(".cards.txt"),
      { type: "text/plain" },
    )
  }

  throw new Error("Unsupported export type.")
}
