import { notNull } from "@/components/pray"
import { DB } from "."
import { ID_ZERO, type Id } from "../lib/id"

export async function getEditModelTemplates(db: DB, mid: Id) {
  const tx = db.read(["models", "prefs"])

  return {
    model: await tx.objectStore("models").get(mid),
    editStyle: notNull(
      await tx.objectStore("prefs").get(ID_ZERO),
      "The collection does not have preferences specified.",
    ).template_edit_style,
  }
}
