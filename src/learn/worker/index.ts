// @ts-ignore shut up typescript. this makes vite happy
import sqlite3InitModule from "../../../node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-bundler-friendly.mjs"

import { notNull } from "@/components/pray"
import type { BindingSpec, SqlValue } from "@sqlite.org/sqlite-wasm"
import { startOfDaySync } from "../db/day"
import type { Reason } from "../db/reason"
import { randomId } from "../lib/id"
import {
  ZDB_REJECT,
  type Handler,
  type WorkerNotification,
  type WorkerRequest,
  type WorkerResponse,
} from "../shared"
import { int, type Check, type CheckResult } from "./checks"
import * as messages from "./messages"
import query_init from "./query/init.sql?raw"
import query_schema from "./query/schema.sql?raw"
import { StateManager, type UndoMeta } from "./undo"
import { latest, upgrade } from "./version"

export const sqlite3 = await (
  sqlite3InitModule as typeof import("@sqlite.org/sqlite-wasm").default
)()

if (!("opfs" in sqlite3)) {
  throw new Error("OPFS is not supported on this browser.")
}

export class WorkerDB extends sqlite3.oo1.OpfsDb {
  read() {
    return new TxReadonly()
  }

  readwrite(reason: Reason) {
    return new TxReadwrite(reason)
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

    db.createFunction({
      name: "random_id",
      xFunc() {
        return randomId()
      },
      directOnly: true,
    })

    db.createFunction({
      name: "start_of_day",
      xFunc(_ctxPtr, now, dayStart) {
        if (now == null) return null
        if (typeof now != "number") {
          throw new Error("Expected argument 1 `now` to be a number.")
        }
        if (typeof dayStart != "number") {
          throw new Error("Expected argument 2 `day_start` to be a number.")
        }
        return startOfDaySync(dayStart, now)
      },
    })

    db.createFunction({
      name: "start_of_day",
      xFunc(_ctxPtr, now) {
        if (now == null) return null
        if (typeof now != "number") {
          throw new Error("Expected argument 1 `now` to be a number.")
        }
        return startOfDaySync(
          notNull(
            db.selectValue(
              "SELECT day_start FROM prefs WHERE id = 0",
              undefined,
              1,
            ),
            "The preferences object does not exist.",
          ),
          now,
        )
      },
    })

    db.createFunction({
      name: "start_of_day",
      xFunc(_ctxPtr) {
        return startOfDaySync(
          notNull(
            db.selectValue(
              "SELECT day_start FROM prefs WHERE id = 0",
              undefined,
              1,
            ),
            "The preferences object does not exist.",
          ),
          Date.now(),
        )
      },
    })

    db.exec(query_init)
    checkVersion(db)
    const state = new StateManager(db)

    state.activate([
      "core",
      "graves",
      "confs",
      "decks",
      "models",
      "notes",
      "cards",
      "rev_log",
      "prefs",
      "charts",
    ])

    return [db, state] as const
  } catch (reason) {
    try {
      postMessage({ zid: ZDB_REJECT, reason } satisfies WorkerNotification)
    } catch {
      postMessage({
        zid: ZDB_REJECT,
        reason: "Error is unable to be reported.",
      } satisfies WorkerNotification)
    }
    throw reason
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
      console.warn("Automatically rolling back transaction.")
      this.rollback()
    }
  }
}

class TxReadonly {
  private done = false

  constructor() {
    db.exec("BEGIN TRANSACTION")
    if (import.meta.env.DEV) {
      setTimeout(() => {
        if (!this.done) {
          console.warn("Readonly transaction was never completed.")
        }
      })
    }
  }

  dispose() {
    if (!this.done) {
      this.done = true
      db.exec("ROLLBACK")
    }
  }
}

class TxReadwrite {
  private done = false
  readonly meta: UndoMeta = {}

  constructor(private readonly reason: Reason) {
    db.exec("BEGIN TRANSACTION")
    if (import.meta.env.DEV) {
      setTimeout(() => {
        if (!this.done) {
          console.warn("Readwrite transaction was never completed.")
        }
      })
    }
  }

  commit() {
    if (this.done) {
      throw new Error("Cannot commit a transaction after it is finished.")
    }

    db.exec("COMMIT")
    state.mark(this.reason, this.meta)
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
      console.warn("Rolling back transaction due to failure.")
      this.rollback()
    }
  }
}

declare global {
  var __zdb__handled: Set<number> | undefined
}

// somehow this module code ends up getting run twice, even though the worker is
// only created once. this means requests are duplicated, so we add a simple
// check here to ensure that we don't handle the same request twice
const handled = (globalThis.__zdb__handled ??= new Set<number>())

addEventListener("message", async ({ data }: { data: unknown }) => {
  if (
    typeof data != "object" ||
    data == null ||
    !("zid" in data) ||
    typeof data.zid != "number"
  ) {
    return
  }

  const req = data as unknown as WorkerRequest

  if (handled.has(req.zid)) {
    return
  } else {
    handled.add(req.zid)
  }

  try {
    const value = await (messages[req.type] as Handler)(...req.data)

    const res: WorkerResponse = {
      zid: req.zid,
      ok: true,
      value: value as any,
    }

    postMessage(res)
  } catch (err) {
    console.error(err)
    const res: WorkerResponse = {
      zid: req.zid,
      ok: false,
      value: String(err),
    }

    postMessage(res)
  }
  return
})

/** These are `let` bindings so we can close and reopen them. */
export let [db, state] = await init()

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
  fn: () => Promise<unknown>,
) {
  try {
    db.close()
    state = db = createClosedDatabase(message)
    await fn()
  } finally {
    ;[db, state] = await init()
  }
}

postMessage({ zid: "zdb:resolve" } satisfies WorkerNotification)
