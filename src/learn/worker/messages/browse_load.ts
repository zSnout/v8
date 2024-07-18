import { db } from "../db"
import { stmts } from "../stmts"

export function browse_load() {
  const tx = db.tx()

  try {
    const decks = db
      .single("SELECT * FROM decks")
      .values.map(stmts.decks.interpret)

    const models = db
      .single("SELECT * FROM models")
      .values.map(stmts.models.interpret)

    const [cards, notes] = await Promise.all([
      tx.objectStore("cards").getAll(),
      tx.objectStore("notes").getAll(),
      tx.objectStore("models").getAll().then(arrayToRecord),
      tx.objectStore("decks").getAll().then(arrayToRecord),
    ])

    prayTruthy(prefs, "This collection does not have a preferences object.")

    const notesByNid = arrayToRecord(notes)

    const data: BrowseData = {
      cardsArray: cards,
      cards: arrayToRecord(cards),
      cardsByNid: Object.groupBy(cards, (item) => item.nid),
      notes: notesByNid,
      models,
      decks,
      prefs,
    }

    return {
      ...data,
      setPrefs,
      columns: cards.map((card) => {
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
  } finally {
    tx.dispose()
  }
}
