import { Tree } from "@/components/tree"
import type { Id } from "@/learn/lib/id"
import { arrayToRecord } from "@/learn/lib/record"
import { DB } from ".."
import { bucketOf } from "../bucket"
import { dayStartOffset, startOfDaySync } from "../day"

export type Buckets = [new: number, lrn: number, rev: number]
export type DeckHomeInfo = {
  deck: {
    collapsed: boolean
    name: string
    id: Id
  }
  self: Buckets
  sub: Buckets
}
export type DeckHomeTree = Tree<DeckHomeInfo | undefined, DeckHomeInfo>

export async function listDecks(db: DB, now: number) {
  const tx = db.read(["cards", "decks", "prefs"])
  const dayStart = await dayStartOffset(tx)
  const today = startOfDaySync(dayStart, now)

  const decks = tx.objectStore("decks")
  const idToName = arrayToRecord(await decks.getAll())

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

  await tx.done
  return { tree, global: sub.get("") ?? [0, 0, 0] }
}
