import type { Cloneable } from "@/learn/message"
import type { BindingSpec, SqlValue } from "@sqlite.org/sqlite-wasm"
import type { Handler, ToScript, ToWorker } from "."
// @ts-ignore shut up typescript. this makes vite happy
import sqlite3InitModule from "../../../node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-bundler-friendly.mjs"
import { int, type Check, type CheckResult } from "./checks"
import * as messages from "./messages"
import { latest } from "./version"

import query_init from "./query/init.sql?raw"
import query_schema from "./query/schema.sql?raw"

export const sqlite3 = await (
  sqlite3InitModule as typeof import("@sqlite.org/sqlite-wasm").default
)({
  print: console.log,
  printErr: console.error,
  // locateFile: () => wasm
})

if (!("opfs" in sqlite3)) {
  throw new Error("OPFS is not supported on this browser.")
}

export class WorkerDB extends sqlite3.oo1.OpfsDb {
  tx() {
    return new Tx()
  }

  run(sql: string, params?: BindingSpec): SqlValue[][] {
    return this.exec(sql, {
      bind: params,
      returnValue: "resultRows",
    })
  }

  row(sql: string, params?: BindingSpec): SqlValue[] {
    const result = this.run(sql, params)
    const first = result[0]
    if (first == null) {
      throw new Error("Expected exactly one row; got none.")
    }
    if (result.length > 1) {
      throw new Error("Expected exactly one row; got more than one.")
    }
    return first
  }

  rowChecked<const T extends Check[]>(
    sql: string,
    checks: T,
    params?: BindingSpec,
  ): {
    [K in keyof T]: T[K] extends (
      ((x: SqlValue) => x is infer U extends SqlValue)
    ) ?
      U
    : SqlValue
  } {
    const row = this.row(sql, params)
    if (checks.length != row.length) {
      throw new Error(
        `Expected ${checks.length} column${checks.length == 1 ? "" : "s"}; received ${row.length}.`,
      )
    }
    for (let index = 0; index < row.length; index++) {
      if (!checks[index]!(row[index]!)) {
        throw new Error("Query returned the wrong type.")
      }
    }
    return row as any
  }

  runWithColumns(sql: string, params?: BindingSpec) {
    const columns: string[] = []
    return {
      columns,
      values: this.exec(sql, {
        bind: params,
        columnNames: columns,
        returnValue: "resultRows",
      }),
    }
  }

  val<T extends Check>(
    sql: string,
    check: T,
    params?: BindingSpec,
  ): CheckResult<T>
  val(sql: string, check?: undefined, params?: BindingSpec): SqlValue
  val(sql: string, check?: Check, params?: BindingSpec): SqlValue {
    const query = this.run(sql, params)
    if (query.length != 1) {
      throw new TypeError("Expected a single row to be returned.")
    }

    const row = query[0]!
    if (row.length != 1) {
      throw new TypeError("Expected a single column to be returned.")
    }

    const item = row[0] as SqlValue

    if (check && !check(item)) {
      throw new TypeError("The query returned an invalid type.")
    }

    return item
  }

  /** Runs a single query and checks the types of the first row of values. */
  checked<const T extends Check[]>(
    sql: string,
    checks: T,
    params?: BindingSpec,
  ): {
    [K in keyof T]: T[K] extends (
      ((x: SqlValue) => x is infer U extends SqlValue)
    ) ?
      U
    : SqlValue
  }[] {
    // TODO: possibly disable checks in prod

    const data = this.run(sql, params)

    const row = data[0]
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

export const DB_FILENAME = "/learn/User 1.sqlite3"

async function init() {
  try {
    if (!("opfs" in sqlite3)) {
      throw new Error("OPFS is not supported on this browser.")
    }

    const db = new WorkerDB(DB_FILENAME)
    db.exec(query_init)
    checkVersion(db)
    return db
  } catch (err) {
    try {
      postMessage({ "zdb:reject": err })
    } catch {
      postMessage({ "zdb:reject": "Error is unable to be reported." })
    }
    throw err
  }
}

// this function cannot access external `db` since that variable isn't set yet
// this upgrades similarly to indexedDB since indexedDB does upgrades well
// this handles the meta of upgrading, while `upgrade` is the main script
function checkVersion(db: WorkerDB) {
  // no rollback logic since if upgrading fails, nothing good will happen
  db.exec("BEGIN TRANSACTION")
  db.exec(query_schema)
  const current =
    db.val("SELECT EXISTS(SELECT 1 FROM core WHERE id = 0)", int) ?
      db.val("SELECT version FROM core WHERE id = 0", int)
    : 0
  upgrade(db, current)
  if (current != latest) {
    db.run("UPDATE core SET version = ? WHERE id = 0", [latest])
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
      { bind: { ":version": latest } },
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

    console.warn("Rolling back transaction.")

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

/** This is a `let` binding so we can close and reopen it. */
export let db = await init()

function createClosedDatabase(message: string) {
  function dbImporting(): never {
    throw new Error(message)
  }

  return new Proxy<any>(
    {},
    {
      defineProperty: dbImporting,
      deleteProperty: dbImporting,
      get: dbImporting,
      getOwnPropertyDescriptor: dbImporting,
      getPrototypeOf: dbImporting,
      has: dbImporting,
      isExtensible: dbImporting,
      ownKeys: dbImporting,
      preventExtensions: dbImporting,
      set: dbImporting,
      setPrototypeOf: dbImporting,
    },
  )
}

export async function closeDatabaseTemporarily(
  message: string,
  fn: () => Promise<void>,
) {
  try {
    db.close()
    db = createClosedDatabase(message)
    await fn()
  } finally {
    db = await init()
  }
}

postMessage("zdb:resolve")
