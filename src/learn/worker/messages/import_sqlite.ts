import { closeDatabaseTemporarily, DB_FILENAME, sqlite3 } from "../db"

export async function import_sqlite(data: Uint8Array | ArrayBuffer) {
  await closeDatabaseTemporarily(
    "Cannot access database during an import.",
    async () => {
      await sqlite3.oo1.OpfsDb.importDb(DB_FILENAME, data)
    },
  )
}