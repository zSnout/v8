import { createDeck } from "@/learn/lib/defaults"
import { randomId } from "@/learn/lib/id"
import { DB } from ".."

export async function createDeckDB(db: DB, name: string) {
  const tx = db.readwrite("decks", `Create deck ${name}`)
  const decks = tx.objectStore("decks")
  if (await decks.index("name").get(name)) {
    return
  }
  const deck = createDeck(Date.now(), name, randomId())
  decks.add(deck)
  await tx.done
}
