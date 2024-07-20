import { Tree } from "@/components/tree-structure"
import { bucketOfArray } from "@/learn/db/bucket"
import { startOfDaySync } from "@/learn/db/day"
import type {
  Buckets,
  DeckHomeInfo,
  DeckHomeTree,
} from "@/learn/db/home/listDecks"
import { bool, id, int, text } from "../checks"
import { db } from "../db"

export function home_list_decks() {
  const tx = db.tx()

  try {
    const dayStart = db.val("SELECT day_start FROM prefs WHERE id = 0", int)
    const today = startOfDaySync(dayStart, Date.now())

    const decks = db.checked("SELECT id, collapsed, name FROM decks", [
      id,
      bool,
      text,
    ])

    const idToName = Object.fromEntries(decks.map((x) => [x[0], x]))
    const nameToDeck = Object.fromEntries(decks.map((x) => [x[2], x]))

    const cards = db.checked(
      "SELECT queue, state, last_edited, scheduled_days, due, did FROM cards",
      [
        (x) => x == 0 || x == 1 || x == 2,
        (x) => x == 0 || x == 1 || x == 2 || x == 3,
        int,
        int,
        int,
        id,
      ],
    )

    const self = new Map<string, Buckets>()

    for (const card of cards) {
      const bucket = bucketOfArray(today, card, dayStart)
      if (bucket == null) continue

      const deckName = idToName[card[5]]?.[2]
      if (deckName == null) continue // FIXME: this should never be null

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

    for (const name of Array.from(self.keys())
      .concat(Array.from(sub.keys()))
      .concat(decks.map((x) => x[2]))
      .filter((x, i, a) => a.indexOf(x) == i)) {
      const deck = nameToDeck[name]

      const info: DeckHomeInfo = {
        deck: deck ? { id: deck[0], collapsed: !!deck[1], name } : undefined,
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

    delete tree.tree[""]

    tx.commit()
    return { tree: tree.tree, global: sub.get("") ?? [0, 0, 0] }
  } finally {
    tx.dispose()
  }
}
