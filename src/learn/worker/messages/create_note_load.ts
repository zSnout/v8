import { notNull } from "@/components/pray"
import { ID_ZERO, type Id } from "@/learn/lib/id"
import { nameToRecord } from "@/learn/lib/record"
import { db } from "../db"
import { stmts } from "../stmts"
import { prefs_get } from "./prefs_get"

export function create_note_load(state: { did?: Id; mid?: Id }) {
  const tx = db.tx()

  try {
    const prefs = prefs_get()

    const allDecks = db
      .single("SELECT * FROM decks")
      .values.map(stmts.decks.interpret)

    const currentDeck = db
      .single("SELECT * FROM decks WHERE id = ?", [
        state.did ?? prefs.current_deck ?? ID_ZERO,
      ])
      .values.map(stmts.decks.interpret)[0]

    const allModels = db
      .single("SELECT * FROM models")
      .values.map(stmts.models.interpret)

    const currentModel = db
      .single("SELECT * FROM models WHERE id = ?", [
        state.mid ?? prefs.last_model_used ?? ID_ZERO,
      ])
      .values.map(stmts.models.interpret)[0]

    const value = {
      deckCurrent: notNull(
        currentDeck ?? allDecks[0],
        "A collection must have at least one deck.",
      ),
      modelCurrent: notNull(
        currentModel ?? allModels[0],
        "A collection must have at least one model.",
      ),
      decksByName: nameToRecord(allDecks),
      modelsByName: nameToRecord(allModels),
    }
    tx.commit()
    return value
  } finally {
    tx.dispose()
  }
}
