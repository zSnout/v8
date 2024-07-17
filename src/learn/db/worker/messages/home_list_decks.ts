import { Tree } from "@/components/tree"
import type { Handler } from ".."
import { bucketOfArray } from "../../bucket"
import { startOfDaySync } from "../../day"
import type { Buckets, DeckHomeInfo, DeckHomeTree } from "../../home/listDecks"
import { bool, id, int, text } from "../checks"
import { db } from "../db"

export const home_list_decks = (() => {
  const tx = db.tx()

  try {
    const dayStart = db.val("SELECT day_start FROM prefs WHERE id = 0", int)
    const today = startOfDaySync(dayStart, Date.now())

    const decks = db.checked("SELECT id, collapsed, name FROM decks", [
      id,
      bool,
      text,
    ])

    const idToName = Object.fromEntries(decks.values.map((x) => [x[0], x]))

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

    for (const card of cards.values) {
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

    for (const deck of Object.values(idToName)) {
      const info: DeckHomeInfo = {
        deck: { id: deck[0], collapsed: !!deck[1], name: deck[2] },
        self: self.get(deck[2]) || [0, 0, 0],
        sub: sub.get(deck[2]) || [0, 0, 0],
      }

      tree.set(
        deck[2].split("::"),
        info,
        (x) => x,
        () => undefined,
        () => info,
        () => info,
      )
    }
    tx.commit()
    return { tree: tree.tree, global: sub.get("") ?? [0, 0, 0] }
  } finally {
    tx.dispose()
  }
}) satisfies Handler
