import { faClone } from "@fortawesome/free-solid-svg-icons"
import { createEffect, createResource } from "solid-js"
import { DB } from "../db"
import { saveManagedModels } from "../db/saveManagedModels"
import { createListEditor } from "../el/EditList"
import { LoadingSmall } from "../el/LoadingSmall"
import { cloneModel } from "../lib/models"
import { Model } from "../lib/types"

// TODO: this ought to do things
export const ManageModels = createListEditor<DB, number, Model[], {}, Model>(
  async (db) => {
    const models = await db.read("models").store.getAll()
    return {
      async: 0,
      item: models,
      async save(models) {
        saveManagedModels(db, models)
      },
      title: "Models",
      subtitle: "managing all",
    }
  },
  ({ item }) => [{}, item] as const,
  ({ items }) => items,
  () => undefined,
  cloneModel,
  {
    add: "Clone",
    addIcon: faClone,
    delete: "Delete",
    rename: "Rename",
    needAtLeastOne: "A collection needs at least one model.",
    newFieldName: "New model name",
    full: true,
    noSort: true,
  },
  (props) => {
    const [data, { mutate }] = createResource(
      () => props.selected.id,
      async (mid) => {
        const tx = props.props.read(["cards", "notes"])
        const notes = tx.objectStore("notes")
        const cards = tx.objectStore("cards")
        const nids = await notes.index("mid").getAllKeys(mid)
        const cids = (
          await Promise.all(
            nids.map((nid) => cards.index("nid").getAllKeys(nid)),
          )
        ).flat()
        return { nids, cids }
      },
    )

    createEffect(() => {
      props.selected.id
      mutate()
    })

    return (
      <div class="grid rounded-lg bg-z-body-selected px-4 py-3">
        <LoadingSmall>
          <div>
            Used in <span>{data()?.nids.length ?? "<unknown>"}</span> note
            {data()?.nids.length == 1 ? "" : "s"}.
          </div>
          <div>
            Used in <span>{data()?.cids.length ?? "<unknown>"}</span> card
            {data()?.cids.length == 1 ? "" : "s"}.
          </div>
        </LoadingSmall>
      </div>
    )
  },
)
