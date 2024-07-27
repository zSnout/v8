import type { Id } from "@/learn/lib/id"
import { readwrite, sql } from ".."
import { id, text } from "../checks"

export function deck_rename(currentId: Id | string, name: string) {
  const tx = readwrite(`Rename deck to ${name}`)
  try {
    const main =
      typeof currentId == "number" ? currentId
        /**
         * `.getValueSafe()` is needed since the parent deck may not exist,
         * especially if the parent deck is only virtually created by its
         * subdecks.
         */
      : sql`SELECT id FROM decks WHERE name = ${currentId};`.getValueSafe(id)

    const currentName =
      main == null ?
        // `as` check is safe here since `main` must be set if `currentId` is a
        // number
        (currentId as string)
      : sql`SELECT name FROM decks WHERE id = ${main};`.getValue(text)

    sql`
      UPDATE decks
      SET name = ${name} || substr(
        name,
        ${currentName.toLowerCase().length + 1}
      )
      WHERE
        (
          name >= ${currentName.toLowerCase() + "::"}
          AND name < ${currentName.toLowerCase() + ":;"}
        )
        OR name = ${currentName};
    `.run()

    tx.commit()

    return true
  } catch (err) {
    if (String(err).includes("UNIQUE constraint")) {
      tx.rollback()
      return false
    } else {
      throw err
    }
  } finally {
    tx.dispose()
  }
}
