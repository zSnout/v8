import { AnyCard, Note } from "@/learn/lib/types"
import { DB } from ".."
import { Reason as Reason } from "../reason"

export async function putCard(db: DB, card: AnyCard, reason: Reason) {
  const tx = db.readwrite("cards", reason)
  tx.objectStore("cards").put(card)
  await tx.done
}

export async function putNote(db: DB, note: Note, reason: Reason) {
  const tx = db.readwrite("notes", reason)
  tx.objectStore("notes").put(note)
  await tx.done
}
