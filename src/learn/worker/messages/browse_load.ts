import { notNull } from "@/components/pray"
import { makeColumns, type BrowseData } from "@/learn/db/browse/load"
import { arrayToRecord } from "@/learn/lib/record"
import { db } from "../db"
import { stmts } from "../stmts"
import { prefs_get } from "./prefs_get"

export function browse_load() {
  const tx = db.tx()

  try {
    const decks = db
      .single("SELECT * FROM decks")
      .values.map(stmts.decks.interpret)

    const models = db
      .single("SELECT * FROM models")
      .values.map(stmts.models.interpret)

    const notes = db
      .single("SELECT * FROM notes")
      .values.map(stmts.notes.interpret)

    const cards = db
      .single("SELECT * FROM cards ORDER BY creation")
      .values.map(stmts.cards.interpret)

    const prefs = prefs_get()

    const notesByNid = arrayToRecord(notes)

    const data: BrowseData = {
      cardsArray: cards,
      cardsByCid: arrayToRecord(cards),
      cardsByNid: Object.groupBy(cards, (item) => item.nid),
      notes: notesByNid,
      models: arrayToRecord(models),
      decks: arrayToRecord(decks),
      prefs,
    }

    const result = {
      ...data,
      cards: cards.map((card) => {
        const note = notNull(
          notesByNid[card.nid],
          "Card must be associated with a valid note.",
        )
        return { card, note, columns: makeColumns(card, note, data) }
      }),
      noteColumns: notes.map((note) => {
        return {
          card: undefined,
          note,
          columns: makeColumns(undefined, note, data),
        }
      }),
    }
    tx.commit()
    return result
  } finally {
    tx.dispose()
  }
}
