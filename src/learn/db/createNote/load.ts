import { notNull } from "@/components/pray"
import { ID_ZERO, type Id } from "@/learn/lib/id"
import { nameToRecord } from "@/learn/lib/record"
import { DB } from ".."

export async function load(db: DB, _: unknown, state: { did?: Id; mid?: Id }) {
  const tx = db.read(["models", "decks", "prefs"])

  const prefs = notNull(
    await tx.objectStore("prefs").get(ID_ZERO),
    "Collection does not have preferences.",
  )

  const decks = tx.objectStore("decks")
  const models = tx.objectStore("models")

  const [currentDeck, currentModel, allDecks, allModels] = await Promise.all([
    decks.get(state.did ?? prefs.current_deck ?? ID_ZERO),
    models.get(state.mid ?? prefs.last_model_used ?? ID_ZERO),
    decks.getAll(),
    models.getAll(),
  ])

  return {
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
}
