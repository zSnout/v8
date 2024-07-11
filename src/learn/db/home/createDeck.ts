import { DB } from ".."

export async function createDeck(db: DB, name: string) {
  const tx = db.readwrite("decks", `Create deck ${name}`)
  const decks = tx.objectStore("decks")
  decks.index("name").keyPath
}
