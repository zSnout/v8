import { db, sqlite3 } from ".."
import { export_name } from "./export_name"

export function export_sqlite() {
  return new File(
    [sqlite3.capi.sqlite3_js_db_export(db)],
    export_name(".col.sqlite"),
  )
}
