import initSqlJs from "@jlongster/sql.js"
import wasm from "@jlongster/sql.js/dist/sql-wasm.wasm?url"
import { SQLiteFS } from "absurd-sql"
import IndexedDBBackend from "absurd-sql/dist/indexeddb-backend"
import type { BindParams, Database, SqlValue } from "sql.js"
import type { Check, CheckResult } from "./checks"
import query_schema from "./query/schema.sql?raw"

// now that message handler
const SQL = (await initSqlJs({ locateFile: () => wasm })) as {
  Database: new (...args: any) => Database
  FS: any
  register_for_idb: any
}

export class WorkerDB extends SQL.Database {
  tx() {
    return new Tx()
  }

  val<T extends Check>(
    sql: string,
    check: T,
    params?: BindParams,
  ): CheckResult<T>
  val(sql: string, check?: undefined, params?: BindParams): SqlValue
  val(sql: string, check?: Check, params?: BindParams): SqlValue {
    const result = this.exec(sql, params)
    if (result.length != 1) {
      throw new TypeError("Expected a single statement to be run.")
    }

    const query = result[0]!
    if (query.values.length != 1) {
      throw new TypeError("Expected a single row to be returned.")
    }

    const row = query.values[0]!
    if (row.length != 1) {
      throw new TypeError("Expected a single column to be returned.")
    }

    const item = row[0] as SqlValue

    if (check && !check(item)) {
      throw new TypeError("The query returned an invalid type.")
    }

    return item
  }

  /** Runs a query and checks the types of the first row of values. */
  checked<const T extends ((x: SqlValue) => boolean)[]>(
    sql: string,
    checks: T,
    params?: BindParams,
  ): {
    columns: string[]
    values: {
      [K in keyof T]: T[K] extends ((
        x: SqlValue,
      ) => x is infer U extends SqlValue)
        ? U
        : SqlValue
    }[]
  } {
    // TODO: possibly disable in prod

    const result = this.exec(sql, params)
    if (result.length != 1) {
      throw new Error("Expected exactly one statement to be executed.")
    }

    const query = result[0]!
    if (query.columns.length != checks.length) {
      throw new Error("Query returned the wrong number of columns.")
    }

    const row = query.values[0]
    if (row) {
      for (let index = 0; index < row.length; index++) {
        if (!checks[index]!(row[index]!)) {
          throw new Error("Query returned the wrong type.")
        }
      }
    }

    return query as any
  }
}

// messy stuff with lots of unchecked types; don't touch
async function init() {
  const fs = new SQLiteFS(SQL.FS, new IndexedDBBackend())
  SQL.register_for_idb(fs)

  SQL.FS.mkdir("/sql")
  SQL.FS.mount(fs, {}, "/sql")

  const path = "/sql/db.sqlite"
  if (typeof SharedArrayBuffer === "undefined") {
    const stream = SQL.FS.open(path, "a+")
    await stream.node.contents.readIfFallback()
    SQL.FS.close(stream)
  }

  const db = new WorkerDB(path, { filename: true })
  db.exec(query_schema)
  return db
}

export class Tx {
  private done = false

  constructor() {
    db.exec("TRANSACTION")
  }

  commit() {
    if (this.done) {
      throw new Error("Cannot commit a transaction after it is finished.")
    }

    db.exec("COMMIT")
    this.done = true
  }

  rollback() {
    if (this.done) {
      throw new Error("Cannot rollback a transaction after it is finished.")
    }

    db.exec("ROLLBACK")
    this.done = true
  }

  [Symbol.dispose]() {
    if (!this.done) {
      this.rollback()
    }
  }
}

// initialize the database and report the main thread on whether that worked
export const db = await init().catch((err) => {
  postMessage("zdb:reject")
  console.error(err)
  throw err
})
postMessage("zdb:resolve")
