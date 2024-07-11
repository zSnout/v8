import { notNull } from "@/components/pray"
import { ID_ZERO } from "@/learn/lib/id"
import { Model, NoteFields, TemplateEditStyle } from "@/learn/lib/types"
import { DB } from ".."
import { Reason } from "../reason"

export function requiresOneWaySync(prev: Model, next: Model) {
  if (prev.sort_field != next.sort_field) {
    return true
  }

  const pf = Object.keys(prev.fields).sort()
  const nf = Object.keys(next.fields).sort()
  if (pf.length != nf.length) {
    return true
  }

  for (let i = 0; i < pf.length; i++) {
    if (pf[i] != nf[i]) {
      return true
    }
  }

  return false
}

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

  // TODO: ensure last_edited is properly updated *everywhere*
  const tx = db.readwrite(["models", "notes", "cards", "prefs", "core"], reason)

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

  if (requiresOneWaySync(prev, model)) {
    const core = tx.objectStore("core")
    const c = notNull(await core.get(ID_ZERO), "Core must exist.")
    core.put({ ...c, last_schema_edit: Date.now(), last_edited: Date.now() })
  }

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
    // FEAT: checksums
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
