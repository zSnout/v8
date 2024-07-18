// import "core-js/proposals/explicit-resource-management"

import type { Cloneable } from "@/learn/message"
import initSqlJs from "@jlongster/sql.js"
import wasm from "@jlongster/sql.js/dist/sql-wasm.wasm?url"
import { SQLiteFS } from "absurd-sql"
import IndexedDBBackend from "absurd-sql/dist/indexeddb-backend"
import type { BindParams, Database, SqlValue } from "sql.js"
import type { Handler, ToScript, ToWorker } from "."
import { int, type Check, type CheckResult } from "./checks"
import * as messages from "./messages"
import { latest } from "./version"

import query_schema from "./query/schema.sql?raw"

const data = { initSqlJs, wasm, SQLiteFS, IndexedDBBackend, query_schema }
Object.assign(globalThis, { data })

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

  single(
    sql: string,
    params?: BindParams,
  ): {
    columns: string[]
    values: SqlValue[][]
  } {
    const stmt = this.prepare(sql)
    try {
      stmt.bind(params)
      const columns = stmt.getColumnNames()
      const query: SqlValue[][] = []
      while (stmt.step()) {
        query.push(stmt.get())
      }

      return { columns, values: query satisfies SqlValue[][] as any }
    } finally {
      stmt.free()
    }
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
    // TODO: possibly disable checks in prod

    const data = this.single(sql, params)

    const row = data.values[0]
    if (row) {
      for (let index = 0; index < row.length; index++) {
        if (!checks[index]!(row[index]!)) {
          throw new Error("Query returned the wrong type.")
        }
      }
    }

    return data as any
  }
}

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
  checkVersion(db)
  return db
}

// this function cannot access external `db` since that variable isn't set yet
// this upgrades similarly to indexedDB since indexedDB does upgrades well
// this handles the meta of upgrading, while `upgrade` is the main script
function checkVersion(db: WorkerDB) {
  // no rollback logic since if upgrading fails, nothing good will happen
  db.exec("BEGIN TRANSACTION")
  db.exec(query_schema)
  const current = db.val("SELECT EXISTS(SELECT 1 FROM core WHERE id = 0)", int)
    ? db.val("SELECT version FROM core WHERE id = 0", int)
    : 0
  upgrade(db, current)
  if (current != latest) {
    db.exec("UPDATE core SET version = ? WHERE id = 0", [latest])
  }
  db.exec("COMMIT")
}

// this function cannot access external `db` since that variable isn't set yet
// this handles the main part of upgrading, while `checkVersion` takes the meta
function upgrade(db: WorkerDB, current: number) {
  // if version < 1, we have no data
  if (current < 1) {
    db.exec(
      `INSERT INTO core (id, version) VALUES (0, :version);
INSERT INTO prefs (id) VALUES (0);
INSERT INTO confs (id, name) VALUES (0, 'Default');
INSERT INTO decks (id, name, is_filtered) VALUES (0, 'Default', 0);`,
      { ":version": latest },
    )
  }
}

export class Tx {
  private done = false

  constructor() {
    db.exec("BEGIN TRANSACTION")
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

  dispose() {
    if (!this.done) {
      this.rollback()
    }
  }
}

addEventListener("message", async ({ data }: { data: unknown }) => {
  if (typeof data != "object" || data == null || !("zTag" in data)) {
    return
  }

  if (data["zTag"] === 0) {
    const req = data as unknown as ToWorker
    try {
      const value = await (messages[req.type] as Handler)(...req.data)

      const res: ToScript = {
        zTag: 0,
        id: req.id,
        ok: true,
        value: value satisfies Cloneable as any,
      }

      postMessage(res)
    } catch (err) {
      console.error(err)
      const res: ToScript = {
        zTag: 0,
        id: req.id,
        ok: false,
        value: String(err),
      }
      postMessage(res)
    }
    return
  }
})

// initialize the database and report the main thread on whether that worked
export const db = await init().catch((err) => {
  try {
    postMessage({ "zdb:reject": err })
  } catch {
    postMessage({ "zdb:reject": "Error is unable to be reported." })
  }
  throw err
})

postMessage("zdb:resolve")
