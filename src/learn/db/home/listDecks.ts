import { Tree } from "@/components/tree"
import { arrayToRecord, doublyMapRecord } from "@/learn/lib/record"
import { Deck } from "@/learn/lib/types"
import { DB } from ".."
import { bucketOf } from "../bucket"
import { dayStartOffset, startOfDaySync } from "../day"

export type Buckets = [new: number, lrn: number, rev: number]
export type DeckHomeInfo = {
  deck: Deck | undefined
  self: Buckets
  sub: Buckets
}
export type DeckHomeTree = Tree<DeckHomeInfo | undefined, DeckHomeInfo>

export async function listDecks(db: DB, now: number) {
  const tx = db.read(["cards", "decks", "prefs"])
  const dayStart = await dayStartOffset(tx)
  const today = startOfDaySync(dayStart, now)

  const decks = tx.objectStore("decks")
  const deckRecord = arrayToRecord(await decks.getAll())
  const deckByName = doublyMapRecord(
    deckRecord,
    (v) => v.name,
    (v) => v,
  )

  const cards = tx.objectStore("cards")
  const self = new Map<string, Buckets>()

  for (const card of await cards.getAll()) {
    const bucket = bucketOf(today, card, dayStart)
    if (bucket == null) continue

    const deckName = deckRecord[card.did]?.name
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

  const next: Record<string, Deck | undefined> = deckByName
  for (const key of sub.keys()) {
    if (!(key in deckByName)) {
      next[key] = undefined
    }
  }

  delete next[""]

  for (const name in deckByName) {
    const info: DeckHomeInfo = {
      deck: next[name],
      self: self.get(name) || [0, 0, 0],
      sub: sub.get(name) || [0, 0, 0],
    }

    tree.set(
      name.split("::"),
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
