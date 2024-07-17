import { Tree } from "@/components/tree"
import { db } from ".."
import { bucketOf } from "../../bucket"
import { startOfDaySync } from "../../day"
import type { Buckets, DeckHomeInfo, DeckHomeTree } from "../../home/listDecks"

export function home_list_decks() {
  using tx = db.tx()

  const dayStart = db.valn("SELECT day_start FROM prefs WHERE id = 0")
  const today = startOfDaySync(dayStart, Date.now())

  const decks = db.exec("SELECT id, collapsed, name FROM decks")[0]!

  const cards = tx.objectStore("cards")
  const self = new Map<string, Buckets>()

  for (const card of await cards.getAll()) {
    const bucket = bucketOf(today, card, dayStart)
    if (bucket == null) continue

    const deckName = idToName[card.did]?.name
    if (deckName == null) continue // FEAT: throw because deck doesn't exist

    let count = self.get(deckName)
    if (count == null) {
      count = [0, 0, 0]
      self.set(deckName, count)
    }

    count[bucket]++
  }

  const sub = new Map<string, Buckets>()

  for (const [name, buckets] of self) {
    const segments = name.split("::")
    for (let index = 0; index < segments.length; index++) {
      const deckName = segments.slice(0, index).join("::")
      let count = sub.get(deckName)
      if (count == null) {
        count = [0, 0, 0]
        sub.set(deckName, count)
      }
      count[0] += buckets[0]
      count[1] += buckets[1]
      count[2] += buckets[2]
    }
  }

  const tree: DeckHomeTree = new Tree()

  for (const deck of Object.values(idToName)) {
    const info: DeckHomeInfo = {
      deck,
      self: self.get(deck.name) || [0, 0, 0],
      sub: sub.get(deck.name) || [0, 0, 0],
    }

    tree.set(
      deck.name.split("::"),
      info,
      (x) => x,
      () => undefined,
      () => info,
      () => info,
    )
  }

  tx.commit()
  return { tree: tree.tree, global: sub.get("") ?? [0, 0, 0] }
}
