import type { Id } from "@/learn/lib/id"
import { readwrite, sql } from ".."
import { int, text } from "../checks"

export function deck_delete(currentId: Id | undefined, name: string) {
  const tx = readwrite(`Delete deck ${name}`)
  try {
    const cardsBefore = sql`SELECT COUNT() FROM cards;`.getValue(int)

    const currentName =
      typeof currentId == "number" ?
        sql`SELECT name FROM decks WHERE id = ${currentId};`.getValue(text)
      : name

    sql`
      DELETE FROM decks
      WHERE
        (name >= ${currentName + "::"} AND name < ${currentName + ":;"})
        OR name = ${currentName};
    `.run()

    sql`
      DELETE FROM notes
      WHERE (SELECT COUNT() FROM cards WHERE cards.nid = notes.id) = 0;
    `.run()

    const cardsAfter = sql`SELECT COUNT() FROM cards;`.getValue(int)

    if (sql`SELECT COUNT() FROM decks;`.getValue(int) == 0) {
      sql`
        INSERT INTO decks (id, name, is_filtered) VALUES (0, 'Default', 0);
      `.run()
    }

    tx.commit()

    return cardsBefore - cardsAfter
  } finally {
    tx.dispose()
  }
}
