import type { Handler } from ".."
import { db } from "../db"

export const export_sqlite = (() => {
  return new File(
    [db.export()],
    "zsnout-learn-" + new Date().toISOString() + ".zl.sqlite",
  )
}) satisfies Handler
