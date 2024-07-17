import "core-js/proposals/explicit-resource-management"
import type { SqlValue, Statement } from "sql.js"
import { db, type BaseHandlers } from ".."
import { open } from "../.."
import { exportData } from "../../save"
import { stmts } from "../stmts"
import { home_list_decks } from "./home_list_decks"
import query_reset from "./query/reset.sql?raw"
import query_schema from "./query/schema.sql?raw"

export const messages = {
  export(): File {
    return new File(
      [db.export()],
      "zsnout-learn-" + new Date().toISOString() + ".zl.sqlite",
    )
  },

  home_list_decks,

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

    using tx = db.tx()
    db.exec(query_reset)
    db.exec(query_schema)
    inner(stmts.core, [data.core])
    inner(stmts.graves, data.graves)
    inner(stmts.confs, data.confs)
    inner(stmts.decks, data.decks)
    inner(stmts.models, data.models)
    inner(stmts.notes, data.notes)
    inner(stmts.cards, data.cards)
    inner(stmts.rev_log, data.rev_log)
    inner(stmts.prefs, [data.prefs])
    tx.commit()
  },

  danger_reset() {
    using tx = db.tx()
    db.exec(query_reset)
    db.exec(query_schema)
    tx.commit()
  },
} satisfies BaseHandlers
