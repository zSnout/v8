import { db, sqlite3 } from ".."

export function export_sqlite() {
  return new File(
    [sqlite3.capi.sqlite3_js_db_export(db)],
    "zsnout-learn-" + new Date().toISOString() + ".zl.sqlite",
  )
}
