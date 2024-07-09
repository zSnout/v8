import { Tree } from "@/components/tree"
import { Id } from "@/learn/lib/id"
import { Deck } from "@/learn/lib/types"
import { DB } from ".."
import { bucketOf } from "../bucket"
import { dayStartOffset, startOfDaySync } from "../day"

export type BucketCounts = [new: number, lrn: number, rev: number]
export type DeckAndBucket = { deck: Deck; buckets: BucketCounts | undefined }
export type DeckAndBucketTree = Tree<DeckAndBucket | undefined, DeckAndBucket>

export async function listDecks(db: DB, now: number) {
  const tx = db.transaction(["cards", "decks", "prefs"], "readonly")
  const dayStart = await dayStartOffset(tx)
  const today = startOfDaySync(dayStart, now)

  const cards = tx.objectStore("cards")
  const counts = new Map<Id, BucketCounts>()

  for (const card of await cards.getAll()) {
    const bucket = bucketOf(today, card, dayStart)
    if (bucket == null) continue

    let count = counts.get(card.did)
    if (count == null) {
      count = [0, 0, 0]
      counts.set(card.did, count)
    }

    count[bucket]++
  }

  const decks = tx.objectStore("decks")
  const tree: DeckAndBucketTree = new Tree()

  for (const deck of await decks.getAll()) {
    const info = { deck, buckets: counts.get(deck.id) }

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
  return tree
}
