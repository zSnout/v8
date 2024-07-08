import sqlite3InitModule, { Sqlite3Static } from "@sqlite.org/sqlite-wasm"

const start = function (sqlite3: Sqlite3Static) {
  console.info("Running SQLite3 version", sqlite3.version.libVersion)
  let db
  if ("opfs" in sqlite3) {
    db = new sqlite3.oo1.OpfsDb("/mydb.sqlite3")
    console.info(
      "OPFS is available, created persisted database at",
      db.filename,
    )
  } else {
    db = new sqlite3.oo1.DB("/mydb.sqlite3", "ct")
    console.info(
      "OPFS is not available, created transient database",
      db.filename,
    )
  }
  try {
    console.info("Creating a table...")
    db.exec("CREATE TABLE IF NOT EXISTS t(a,b)")
    console.info("Insert some data using exec()...")
    for (let i = 20; i <= 25; ++i) {
      db.exec({
        sql: "INSERT INTO t(a,b) VALUES (?,?)",
        bind: [i, i * 2],
      })
    }
    console.info("Query data with exec()...")
    db.exec({
      sql: "SELECT a FROM t ORDER BY a LIMIT 3",
      callback: (row) => {
        console.info(row)
      },
    })
  } finally {
    db.close()
  }
}

console.info("Loading and initializing SQLite3 module...")
sqlite3InitModule({
  print: console.info,
  printErr: error,
}).then((sqlite3) => {
  console.info("Done initializing. Running demo...")
  start(sqlite3)
})
