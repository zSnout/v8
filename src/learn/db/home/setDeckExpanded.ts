import { createDeck } from "@/learn/lib/defaults"
import { Id, randomId } from "@/learn/lib/id"
import { DB } from ".."

export async function setDeckExpanded(
  db: DB,
  /**
   * If an `Id`, sets the corresponding deck. Else, creates a deck with name
   * `id`.
   */
  id: Id | string,
  isExpanded: boolean,
  now: number,
) {
  const tx = db.transaction("decks", "readwrite")
  const decks = tx.objectStore("decks")

  if (typeof id == "number") {
    const deck = await decks.get(id)
    if (!deck) {
      throw new Error("Cannot collapse a deck which doesn't exist.")
    }
    await decks.put({ ...deck, collapsed: !isExpanded }, deck?.id)
  } else {
    const did = randomId()
    const deck = createDeck(now, id, did)
    deck.collapsed = !isExpanded
    await decks.put(deck, did)
  }

  await tx.done
}
