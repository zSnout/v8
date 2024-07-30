import { idOf, type Id } from "@/learn/lib/id"
import { UserMedia } from "@/learn/lib/media"
import type { PackagedDeck } from "@/learn/lib/types"
import type { SqlValue } from "@sqlite.org/sqlite-wasm"
import { readwrite, sql } from ".."
import { int } from "../lib/checks"
import type { Stmt } from "../lib/sql"
import { stmts } from "../lib/stmts"
import { unpackage } from "../lib/unpackage"

const userMedia = new UserMedia()

export async function import_packaged_deck({
  data,
  media,
  meta,
}: PackagedDeck) {
  // 0. User media (if it exists)
  {
    if (meta.media && media) {
      await userMedia.import(meta.media, media)
    }
  }

  const tx = readwrite("Import deck package")
  try {
    function inner<T extends { id: Id; last_edited: number }>(
      items: T[],
      name: string,
      /** Returns the `last_edited` timestamp of an exact match. */
      exact: (item: T) => number | null,
      /** Resolves non-ID-related conflicts on an item. */
      tame: (item: T) => void,
      stmt: {
        insert(): Stmt
        update(): Stmt
        insertArgs(value: T): SqlValue[]
        updateArgs(value: T): SqlValue[]
      },
    ): Record<Id, Id> {
      const map: Record<Id, Id> = Object.create(null)

      const conflict = sql.of(`SELECT 1 FROM ${name} WHERE id = ?;`)
      const insert = stmt.insert()
      const update = stmt.update()

      for (const item of items) {
        const lastEditedOfExactMatch = exact(item)

        if (lastEditedOfExactMatch != null) {
          if (lastEditedOfExactMatch < item.last_edited) {
            update.bindNew(stmt.updateArgs(item)).run()
          }
          map[item.id] = item.id
          continue
        }

        while (conflict.bindNew(item.id).exists()) {
          item.id++
          if (item.id >= Number.MAX_SAFE_INTEGER) {
            item.id = idOf(1)
          }
        }

        tame(item)
        insert.bindNew(stmt.insertArgs(item)).run()
        map[item.id] = item.id
      }

      conflict.dispose()
      insert.dispose()
      update.dispose()

      return map
    }

    // 1. Models
    let modelMap
    {
      const exactMatch = sql`
        SELECT last_edited
        FROM models
        WHERE
          id = ?
          AND fields = ?
          AND templates = ?
          AND css = ?
          AND sort_field = ?;
      ` // name can be different

      const conflict = sql`SELECT 1 FROM models WHERE name = ?;`

      modelMap = inner(
        data.models,
        "models",
        (item) =>
          exactMatch
            .bindNew([
              item.id,
              JSON.stringify(item.fields),
              JSON.stringify(item.tmpls),
              item.css,
              item.sort_field,
            ])
            .getValue(int),
        (item) => {
          while (conflict.bindNew(item.name).exists()) {
            item.name += "+"
          }
        },
        stmts.models,
      )

      exactMatch.dispose()
      conflict.dispose()
    }

    // 2. Deck confs (if they exist)
    let confMap: Record<Id, Id> | null = null
    if (meta.hasConfs && data.confs) {
      const exact = sql`
        SELECT last_edited
        FROM confs
        WHERE id = ? AND name = ?;
      `

      const conflict = sql`SELECT 1 FROM confs WHERE name = ?;`

      confMap = inner(
        data.confs,
        "confs",
        (item) => exact.bindNew([item.id, item.name]).getValue(int),
        (item) => {
          while (conflict.bindNew(item.name).exists()) {
            item.name += "+"
          }
        },
        stmts.confs,
      )

      exact.dispose()
      conflict.dispose()
    }

    // 3. Notes
    // 4. Decks
    // 5. Cards
    // 6. Review log

    tx.commit()
  } finally {
    tx.dispose()
  }
}

export async function import_deck(file: File) {
  const data = await unpackage(file)
  return import_packaged_deck(data)
}
