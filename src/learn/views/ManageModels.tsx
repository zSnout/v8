import { faClone } from "@fortawesome/free-solid-svg-icons"
import { DB } from "../db"
import { saveManagedModels } from "../db/saveManagedModels"
import { createListEditor } from "../el/EditList"
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
  },
  (props) => {},
)
