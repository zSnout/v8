import { notNull } from "@/components/pray"
import { DB } from "."
import { Id, ID_ZERO, randomId } from "../lib/id"
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

  const tx = db.readwrite(
    ["notes", "cards", "graves", "models", "core"],
    reason,
  )
  const notes = tx.objectStore("notes")
  const cards = tx.objectStore("cards")
  const graves = tx.objectStore("graves")
  const models = tx.objectStore("models")
  const core = tx.objectStore("core")
  const notesMid = notes.index("mid")
  const cardsNid = cards.index("nid")

  for (const a of added) {
    models.put(cloneModel(a.id, a.name, a.cloned))
  }

  if (removed.length) {
    core.put(
      {
        ...notNull(
          await core.get(ID_ZERO),
          "This collection does not have a core.",
        ),
        last_edited: Date.now(),
        last_schema_edit: Date.now(),
      },
      ID_ZERO,
    )
  }

  removed.map(async ([mid]) => {
    const nids = await notesMid.getAllKeys(mid)
    nids.map(async (nid) => {
      const cids = await cardsNid.getAllKeys(nid)
      notes.delete(nid)
      graves.add({ id: randomId(), oid: nid, type: 1 })
      for (const cid of cids) {
        cards.delete(cid)
      }
    })
  })

  await tx.done
}

export async function getCounts(db: DB, mid: Id) {
  const tx = db.read(["cards", "notes"])
  const notes = tx.objectStore("notes")
  const cards = tx.objectStore("cards")
  const nids = await notes.index("mid").getAllKeys(mid)
  const cids = (
    await Promise.all(nids.map((nid) => cards.index("nid").getAllKeys(nid)))
  ).flat()
  return { nids, cids }
}

export async function getModels(db: DB) {
  return await db.read("models").store.getAll()
}
