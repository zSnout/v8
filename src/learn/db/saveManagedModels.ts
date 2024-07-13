import { DB } from "."
import { Id } from "../lib/id"
import { cloneModel } from "../lib/models"
import { Model } from "../lib/types"
import { Reason } from "./reason"

export type AddedModel = { id: Id; name: string; cloned: Model }
export type RemovedModel = [Id, string]

export async function saveManagedModels(
  db: DB,
  added: AddedModel[],
  removed: RemovedModel[],
) {
  const reason: Reason =
    added.length && removed.length
      ? `Create model(s) ${added
          .map((x) => x.name)
          .join(",")} and delete ${removed.map((x) => x[1]).join(",")}`
      : added.length
      ? `Create model(s) ${added.map((x) => x.name).join(",")}`
      : `Delete model(s) ${removed.map((x) => x[1]).join(",")}`

  const tx = db.readwrite(["notes", "cards", "graves", "models"], reason)
  const notes = tx.objectStore("notes")
  const cards = tx.objectStore("cards")
  const graves = tx.objectStore("graves")
  const models = tx.objectStore("models")
  const notesMid = notes.index("mid")
  const cardsNid = cards.index("nid")

  for (const a of added) {
    models.put(cloneModel(a.id, a.name, a.cloned))
  }

  removed.map(async ([mid]) => {
    const nids = await notesMid.getAllKeys(mid)
    nids.map(async (nid) => {
      const cids = await cardsNid.getAllKeys(nid)
      notes.delete(nid)
      graves.add({ oid: nid, type: 1 })
      for (const cid of cids) {
        cards.delete(cid)
      }
    })
  })

  await tx.done
}
