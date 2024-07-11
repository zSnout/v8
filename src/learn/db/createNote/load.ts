import { notNull } from "@/components/pray"
import { ID_ZERO } from "@/learn/lib/id"
import { nameToRecord } from "@/learn/lib/record"
import { DB } from ".."

export async function load(db: DB) {
  const tx = db.read(["models", "decks", "prefs"])

  const prefs = notNull(
    await tx.objectStore("prefs").get(ID_ZERO),
    "Collection does not have preferences.",
  )

  const decks = tx.objectStore("decks")
  const models = tx.objectStore("models")

  const [currentDeck, currentModel, allDecks, allModels] = await Promise.all([
    decks.get(prefs.current_deck ?? ID_ZERO),
    models.get(prefs.last_model_used ?? ID_ZERO),
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
    decks: allDecks,
    models: allModels,
    decksByName: nameToRecord(allDecks),
    modelsByName: nameToRecord(allModels),
    prefs,
  }
}
