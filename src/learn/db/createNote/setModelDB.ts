import { notNull } from "@/components/pray"
import { ID_ZERO } from "@/learn/lib/id"
import { Model, NoteFields, TemplateEditStyle } from "@/learn/lib/types"
import { DB } from ".."
import { Reason } from "../reason"

export async function setModelDB(
  db: DB,
  model: Model,
  now: number,
  reason: Reason,
  editStyle?: TemplateEditStyle,
) {
  if (model.name.trim() == "") {
    throw new Error("Model name is empty.")
  }

  const tx = db.readwrite(["models", "notes", "cards", "prefs"], reason)

  if (editStyle) {
    const prefs = tx.objectStore("prefs")
    const pref = notNull(await prefs.get(ID_ZERO), "Preferences should exist.")
    pref.template_edit_style = editStyle
    prefs.put(pref, ID_ZERO)
  }

  const models = tx.objectStore("models")

  const prev = await models.get(model.id)

  if (!prev) {
    models.add(model)
    await tx.done
    return
  }

  const notes = tx.objectStore("notes")

  // TODO: note if model has been drastically altered (do we need a one-way sync)

  for (const note of await notes.getAll()) {
    if (note.mid != model.id) {
      continue
    }

    const sort_field = note.fields[model.sort_field ?? 0] ?? ""
    const fields = Object.create(null) as NoteFields
    for (const key in model.fields) {
      fields[key] = note.fields[key] ?? ""
    }
    const last_edited = now
    // TODO: update csum
    note.sort_field = sort_field
    note.fields = fields
    note.last_edited = last_edited
    // TODO: update which cards exist and their corresponding templates
    notes.put(note)
  }

  models.put(model)
  await tx.done
  return
}
