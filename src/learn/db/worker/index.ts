import { error } from "@/components/result"
import { ID_ZERO } from "@/learn/lib/id"
import { serializeSidebar } from "@/learn/lib/sidebar"
import type {
  AnyCard,
  Conf,
  Core,
  Deck,
  Grave,
  Model,
  Note,
  Prefs,
  Review,
} from "@/learn/lib/types"
import initSqlJs from "@jlongster/sql.js"
import wasm from "@jlongster/sql.js/dist/sql-wasm.wasm?url"
import { SQLiteFS } from "absurd-sql"
import IndexedDBBackend from "absurd-sql/dist/indexeddb-backend"
import type { Database, SqlValue, Statement } from "sql.js"
import type { MaybePromise } from "valibot"
import { open } from ".."
import type { Cloneable } from "../../message"
import { exportData } from "../save"
import query_reset from "./query/reset.sql?raw"
import query_schema from "./query/schema.sql?raw"

const VERSION = 8

type INTEGER = number
type BOOLEAN = number
type TEXT = string

const stmts = {
  core: {
    prepareInsert() {
      return db.prepare("INSERT INTO core VALUES (?, ?, ?, ?, ?, ?, ?)")
    },
    makeArgs(core: Core): SqlValue[] {
      return [
        ID_ZERO satisfies INTEGER,
        VERSION satisfies INTEGER,
        core.creation satisfies INTEGER,
        core.last_edited satisfies INTEGER,
        core.last_schema_edit satisfies INTEGER,
        core.last_sync satisfies INTEGER,
        core.tags satisfies TEXT,
      ]
    },
  },
  graves: {
    prepareInsert() {
      return db.prepare("INSERT INTO graves VALUES (?, ?, ?)")
    },
    makeArgs(grave: Grave): SqlValue[] {
      return [
        grave.id satisfies INTEGER,
        grave.oid satisfies INTEGER,
        grave.type satisfies INTEGER,
      ]
    },
  },
  confs: {
    prepareInsert() {
      return db.prepare(
        "INSERT INTO confs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
    },
    makeArgs(conf: Conf): SqlValue[] {
      return [
        conf.id satisfies INTEGER,
        +conf.autoplay_audio satisfies BOOLEAN,
        conf.last_edited satisfies INTEGER,
        conf.name satisfies TEXT,
        +conf.new.bury_related satisfies BOOLEAN,
        +conf.new.pick_at_random satisfies BOOLEAN,
        conf.new.per_day satisfies INTEGER,
        JSON.stringify(conf.new.learning_steps) satisfies TEXT,
        +conf.replay_question_audio satisfies BOOLEAN,
        +conf.review.bury_related satisfies BOOLEAN,
        +conf.review.enable_fuzz satisfies BOOLEAN,
        conf.review.max_review_interval satisfies INTEGER,
        conf.review.per_day ?? (null satisfies INTEGER | null),
        JSON.stringify(conf.review.relearning_steps) satisfies TEXT,
        conf.review.requested_retention satisfies INTEGER,
        (conf.review.w
          ? JSON.stringify(conf.review.w)
          : null) satisfies TEXT | null,
        +conf.show_global_timer satisfies BOOLEAN,
        conf.timer_per_card ?? (null satisfies INTEGER | null),
      ]
    },
  },
  decks: {
    prepareInsert() {
      return db.prepare(
        "INSERT INTO decks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
    },
    makeArgs(deck: Deck): SqlValue[] {
      return [
        deck.id satisfies INTEGER,
        deck.name satisfies TEXT,
        +deck.collapsed satisfies BOOLEAN,
        +deck.is_filtered satisfies BOOLEAN,
        (deck.custom_revcard_limit ?? null) satisfies INTEGER | null,
        (deck.custom_newcard_limit ?? null) satisfies INTEGER | null,
        (deck.default_revcard_limit ?? null) satisfies INTEGER | null,
        (deck.default_newcard_limit ?? null) satisfies INTEGER | null,
        deck.last_edited satisfies INTEGER,
        JSON.stringify(deck.new_today) satisfies TEXT,
        JSON.stringify(deck.revcards_today) satisfies TEXT,
        deck.revlogs_today satisfies INTEGER,
        deck.today satisfies INTEGER,
        deck.desc satisfies TEXT,
        deck.cfid satisfies INTEGER,
      ]
    },
  },
  models: {
    prepareInsert() {
      return db.prepare(
        "INSERT INTO models VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
    },
    makeArgs(model: Model): SqlValue[] {
      return [
        model.id satisfies INTEGER,
        model.css satisfies TEXT,
        JSON.stringify(model.fields) satisfies TEXT,
        (model.latex
          ? JSON.stringify(model.latex)
          : null) satisfies TEXT | null,
        model.name satisfies TEXT,
        (model.sort_field ?? null) satisfies INTEGER | null,
        JSON.stringify(model.tmpls) satisfies TEXT,
        model.tags.join(" ") satisfies TEXT,
        model.type satisfies INTEGER,
        model.creation satisfies INTEGER,
        model.last_edited satisfies INTEGER,
      ]
    },
  },
  notes: {
    prepareInsert() {
      return db.prepare("INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    },
    makeArgs(note: Note): SqlValue[] {
      return [
        note.id satisfies INTEGER,
        note.creation satisfies INTEGER,
        note.mid satisfies INTEGER,
        note.last_edited satisfies INTEGER,
        note.tags.join(" ") satisfies TEXT,
        JSON.stringify(note.fields) satisfies TEXT,
        note.sort_field satisfies TEXT,
        note.csum satisfies INTEGER,
        note.marks satisfies INTEGER,
      ]
    },
  },
  cards: {
    prepareInsert() {
      return db.prepare(
        "INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
    },
    makeArgs(card: AnyCard): SqlValue[] {
      return [
        card.id satisfies INTEGER,
        card.nid satisfies INTEGER,
        card.tid satisfies INTEGER,
        card.did satisfies INTEGER,
        (card.odid ?? null) satisfies INTEGER | null,
        card.creation satisfies INTEGER,
        card.last_edited satisfies INTEGER,
        card.queue satisfies INTEGER,
        card.due satisfies INTEGER,
        (card.last_review ?? null) satisfies INTEGER | null,
        card.stability satisfies INTEGER,
        card.difficulty satisfies INTEGER,
        card.elapsed_days satisfies INTEGER,
        card.scheduled_days satisfies INTEGER,
        card.reps satisfies INTEGER,
        card.lapses satisfies INTEGER,
        card.flags satisfies INTEGER,
        card.state satisfies INTEGER,
      ]
    },
  },
  rev_log: {
    prepareInsert() {
      return db.prepare(
        "INSERT INTO rev_log VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
    },
    makeArgs(review: Review) {
      return [
        review.id satisfies INTEGER,
        review.cid satisfies INTEGER,
        review.time satisfies INTEGER,
        review.type satisfies INTEGER,
        review.rating satisfies INTEGER,
        review.state satisfies INTEGER,
        review.due satisfies INTEGER,
        review.stability satisfies INTEGER,
        review.difficulty satisfies INTEGER,
        review.elapsed_days satisfies INTEGER,
        review.last_elapsed_days satisfies INTEGER,
        review.scheduled_days satisfies INTEGER,
        review.review satisfies INTEGER,
      ]
    },
  },
  prefs: {
    prepareInsert() {
      return db.prepare(
        "INSERT INTO prefs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
    },
    makeArgs(prefs: Prefs) {
      return [
        ID_ZERO satisfies INTEGER,
        prefs.last_edited satisfies INTEGER,
        (prefs.current_deck ?? null) satisfies INTEGER | null,
        (prefs.last_model_used ?? null) satisfies INTEGER | null,
        prefs.new_spread satisfies INTEGER,
        prefs.collapse_time satisfies INTEGER,
        prefs.notify_after_time satisfies INTEGER,
        +prefs.show_review_time_above_buttons satisfies BOOLEAN,
        +prefs.show_remaining_due_counts satisfies BOOLEAN,
        +prefs.show_deck_name satisfies BOOLEAN,
        prefs.next_new_card_position satisfies INTEGER,
        (prefs.last_unburied ?? null) satisfies INTEGER | null,
        prefs.day_start satisfies INTEGER,
        +prefs.debug satisfies BOOLEAN,
        serializeSidebar(prefs.sidebar_state) satisfies INTEGER,
        JSON.stringify(prefs.template_edit_style) satisfies TEXT,
        +prefs.show_flags_in_sidebar satisfies BOOLEAN,
        +prefs.show_marks_in_sidebar satisfies BOOLEAN,
        JSON.stringify(prefs.browser) satisfies TEXT,
      ]
    },
  },
}

const messages = {
  reset(): undefined {
    db.exec(query_reset)
  },
  export(): File {
    return new File(
      [db.export()],
      "zsnout-learn-" + new Date().toISOString() + ".zl.sqlite",
    )
  },

  async idb_import(): Promise<undefined> {
    function inner<T>(
      meta: { prepareInsert(): Statement; makeArgs(item: T): SqlValue[] },
      items: T[],
    ) {
      const stmt = meta.prepareInsert()
      for (const item of items) {
        stmt.run(meta.makeArgs(item))
      }
      stmt.free()
    }

    const data = await exportData(
      await open("learn:Main", Date.now()),
      Date.now(),
    )

    db.exec("BEGIN TRANSACTION")
    db.exec(query_reset)
    db.exec(query_schema)
    console.log(query_schema)
    inner(stmts.core, [data.core])
    inner(stmts.graves, data.graves)
    inner(stmts.confs, data.confs)
    inner(stmts.decks, data.decks)
    inner(stmts.models, data.models)
    inner(stmts.notes, data.notes)
    inner(stmts.cards, data.cards)
    inner(stmts.rev_log, data.rev_log)
    inner(stmts.prefs, [data.prefs])
    db.exec("COMMIT")
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
  db.exec(query_schema)

  return db
}

// initialize the database and report the main thread on whether that worked
const db = await init().catch((err) => {
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

// #endregion
