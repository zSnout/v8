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

    const allDecks = db.run("SELECT * FROM decks").map(stmts.decks.interpret)

    const currentDeck = stmts.decks.interpret(
      db.row("SELECT * FROM decks WHERE id = ?", [
        state.did ?? prefs.current_deck ?? ID_ZERO ?? allDecks[0]?.id,
      ]),
    )

    const allModels = db.run("SELECT * FROM models").map(stmts.models.interpret)

    const currentModel = stmts.models.interpret(
      db.row("SELECT * FROM models WHERE id = ?", [
        state.mid ?? prefs.last_model_used ?? ID_ZERO ?? allModels[0]?.id,
      ]),
    )

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
