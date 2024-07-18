import { db } from "../db"

export function sqlite_export() {
  return new File(
    [db.export()],
    "zsnout-learn-" + new Date().toISOString() + ".zl.sqlite",
  )
}
