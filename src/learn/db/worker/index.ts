import { error } from "@/components/result"
import initSqlJs from "@jlongster/sql.js"
import wasm from "@jlongster/sql.js/dist/sql-wasm.wasm?url"
import { SQLiteFS } from "absurd-sql"
import IndexedDBBackend from "absurd-sql/dist/indexeddb-backend"
import type { Database } from "sql.js"
import type { MaybePromise } from "valibot"
import type { Cloneable } from "../../message"

const messages = {
  test() {
    return { a: 2 }
  },
} satisfies BaseHandlers

// #region IMPLEMENTATION DETAILS

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

// messy stuff with lots of unchecked types; don't touch
async function init() {
  const SQL = await initSqlJs({ locateFile: () => wasm })
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

  const db = new SQL.Database(path, { filename: true }) as Database
  // You might want to try `PRAGMA page_size=8192;` too!
  /**
   * export interface Ty extends RequiredSchema {
  cards: { key: Id; value: AnyCard; indexes: { nid: Id; did: Id } }
  graves: { key: number; value: Grave; indexes: {} }
  notes: { key: Id; value: Note; indexes: { mid: Id } }
  rev_log: { key: Id; value: Review; indexes: { cid: Id } }
  core: { key: Id; value: Core; indexes: {} }
  models: { key: Id; value: Model; indexes: {} }
  decks: { key: Id; value: Deck; indexes: { cfid: Id; name: string } }
  confs: { key: Id; value: Conf; indexes: {} }
  prefs: { key: Id; value: Prefs; indexes: {} }
}
   */
  db.exec(`
    PRAGMA journal_mode=MEMORY;
    
  `)

  return db
}

// initialize the database and report the main thread on whether that worked
const db = await init().catch((err) => {
  postMessage("zdb:reject")
  throw err
})
postMessage("zdb:resolve")

// typescript stuff
export type BaseHandlers = Record<
  string,
  (this: unknown, data: Cloneable) => MaybePromise<Cloneable>
>

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

// #endregion
