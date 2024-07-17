import { error } from "@/components/result"
import initSqlJs from "@jlongster/sql.js"
import wasm from "@jlongster/sql.js/dist/sql-wasm.wasm?url"
import { SQLiteFS } from "absurd-sql"
import IndexedDBBackend from "absurd-sql/dist/indexeddb-backend"
import "core-js/proposals/explicit-resource-management"
import type { BindParams, Database, SqlValue } from "sql.js"
import type { MaybePromise } from "valibot"
import type { Cloneable } from "../../message"
import { messages } from "./messages"
import query_schema from "./query/schema.sql?raw"

// message handler should be set up as early as possible
addEventListener("message", async ({ data }: { data: unknown }) => {
  if (typeof data != "object" || data == null || !("zTag" in data)) {
    return
  }

  if (data["zTag"] === 0) {
    const req = data as unknown as ToWorker
    try {
      const value = await (messages[req.type] as any)(...req.data)
      const res: ToScript = { zTag: 0, id: req.id, ok: true, value }
      postMessage(res)
    } catch (value) {
      const res: ToScript = {
        zTag: 0,
        id: req.id,
        ok: false,
        value: error(value).reason,
      }
      postMessage(res)
    }
    return
  }
})

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

  val(sql: string, params?: BindParams): SqlValue {
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

    return row[0]! // might be null
  }

  valn(sql: string, params?: BindParams): number {
    const val = this.val(sql, params)
    if (typeof val != "number") {
      throw new TypeError("Expected a number.")
    }
    return val
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
  throw err
})
postMessage("zdb:resolve")

export type Handler = (
  this: unknown,
  data: Cloneable,
) => MaybePromise<Cloneable>

// typescript stuff
export type BaseHandlers = { [x: string]: Handler }

export type Handlers = typeof messages

export type ToWorker = {
  [K in keyof Handlers]: {
    zTag: 0
    id: number
    type: K
    data: Parameters<Handlers[K]>
  }
}[keyof Handlers]

export type ToScript = {
  [K in keyof Handlers]:
    | { zTag: 0; id: number; ok: true; value: Awaited<ReturnType<Handlers[K]>> }
    | { zTag: 0; id: number; ok: false; value: string }
}[keyof Handlers]
