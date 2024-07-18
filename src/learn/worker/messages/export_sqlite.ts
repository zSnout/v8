import { db } from "../db"

export function export_sqlite() {
  return new File(
    [db.export()],
    "zsnout-learn-" + new Date().toISOString() + ".zl.sqlite",
  )
}
