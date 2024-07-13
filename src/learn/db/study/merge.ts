import { AnyCard, Note } from "@/learn/lib/types"
import { DB } from ".."
import { Reason } from "../reason"

export async function putCard(
  db: DB,
  card: AnyCard,
  reason: Reason,
  now: number,
) {
  const tx = db.readwrite("cards", reason)
  tx.objectStore("cards").put({ ...card, last_edited: now })
  await tx.done
}

export async function putNote(db: DB, note: Note, reason: Reason, now: number) {
  const tx = db.readwrite("notes", reason)
  tx.objectStore("notes").put({ ...note, last_edited: now })
  await tx.done
}
