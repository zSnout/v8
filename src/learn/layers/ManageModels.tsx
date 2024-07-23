import { faClone } from "@fortawesome/free-solid-svg-icons"
import { createEffect, createResource } from "solid-js"
import type { Worker } from "../db"
import { createListEditor } from "../el/EditList"
import { LoadingSmall } from "../el/LoadingSmall"
import { Id, randomId } from "../lib/id"
import { BUILTIN_IDS } from "../lib/models"
import type { AddedModel, Model, RemovedModel } from "../lib/types"

export type Item =
  | { type: "keep"; id: Id; name: string; model: Model }
  | { type: "create"; id: Id; name: string; model: Model }

// TODO: this ought to do things
export const ManageModels = createListEditor<Worker, number, Item[], {}, Item>(
  async (worker) => {
    const models = await worker.post("manage_models_get")
    const initial = models.map<RemovedModel>((x) => [x.id, x.name])
    return {
      async: 0,
      item: models.map((x) => ({
        type: "keep",
        id: x.id,
        name: x.name,
        model: x,
      })),
      async save(models) {
        const added: AddedModel[] = []
        const removed: RemovedModel[] = []
        for (const m of models) {
          if (m.type == "create") {
            added.push({ id: m.id, name: m.name, cloned: m.model })
          }
        }
        for (const i of initial) {
          if (!models.some((x) => x.id == i[0])) {
            removed.push(i)
          }
        }
        await worker.post("manage_models_save", added, removed)
      },
      title: "Models",
      subtitle: "managing all",
    }
  },
  ({ item }) => [{}, item] as const,
  ({ items }) => items,
  () => null,
  (name, selected) => ({
    type: "create",
    id: randomId(),
    name,
    model: selected.model,
  }),
  {
    add: "Clone",
    addIcon: faClone,
    delete: "Delete",
    rename: "Rename",
    needAtLeastOne: "A collection needs at least one model.",
    newFieldName: "New model name",
    full: true,
    noSort: "by-name",
    thisActionWillDeleteACard:
      "Deleting this model will delete all its corresponding cards and notes.",
    undeletable(item: Item) {
      return BUILTIN_IDS.includes(item.id)
    },
  },
  (props) => {
    const [data, { mutate }] = createResource(
      () => props.selected.id,
      (mid) => props.props.post("manage_models_count", mid),
    )

    createEffect(() => {
      props.selected.id
      mutate()
    })

    return (
      <div class="grid rounded-lg bg-z-body-selected px-4 py-3">
        <LoadingSmall>
          <div>
            Used in <span>{data()?.nids ?? "<unknown>"}</span> note
            {data()?.nids == 1 ? "" : "s"}.
          </div>
          <div>
            Used in <span>{data()?.cids ?? "<unknown>"}</span> card
            {data()?.cids == 1 ? "" : "s"}.
          </div>
        </LoadingSmall>
      </div>
    )
  },
)
