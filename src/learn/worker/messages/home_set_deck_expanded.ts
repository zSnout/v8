import { createDeck } from "@/learn/lib/defaults"
import { Id, randomId } from "@/learn/lib/id"
import { db } from "../db"

export function setDeckExpanded(idOrName: Id | string, isExpanded: boolean) {
  using tx = db.tx()

  db.exec("COUNT ")

  if (typeof id == "number") {
    const deck = await decks.get(id)
    if (!deck) {
      throw new Error("Cannot collapse a deck which doesn't exist.")
    }
    await decks.put({ ...deck, collapsed: !isExpanded })
  } else {
    const did = randomId()
    const deck = createDeck(now, id, did)
    deck.collapsed = !isExpanded
    await decks.put(deck)
  }

  tx.commit()
}
