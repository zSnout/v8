import { notNull } from "@/components/pray"
import { unwrapOr } from "@/components/result"
import { Id, ID_ZERO, randomId } from "@/learn/lib/id"
import * as Template from "@/learn/lib/template"
import {
  Model,
  NewCard,
  Note,
  NoteFields,
  TemplateEditStyle,
} from "@/learn/lib/types"
import { createEmptyCard, State } from "ts-fsrs"
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

export function diffTmpls(prev: Model, next: Model) {
  const p = Object.values(prev.tmpls)
  const n = Object.values(next.tmpls)

  return {
    add: n.filter((n) => !p.some((p) => p.id == n.id)), // things in n but not p
    del: p.filter((p) => !n.some((n) => n.id == p.id)), // things in p but not n
  }
}

export function mostPopularId(dids: Id[]) {
  if (dids.length == 0) {
    return null
  }

  const ids = new Map<Id, number>()

  for (const id of dids) {
    ids.set(id, (ids.get(id) ?? 0) + 1)
  }

  let id = ID_ZERO
  let count = 0

  for (const [k, v] of ids) {
    if (v > count) {
      id = k
      count = v
    }
  }

  return id
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
  const tx = db.readwrite(
    ["models", "notes", "cards", "prefs", "core", "graves"],
    reason,
  )

  if (editStyle) {
    const prefs = tx.objectStore("prefs")
    const pref = notNull(await prefs.get(ID_ZERO), "Preferences should exist.")
    pref.template_edit_style = editStyle
    prefs.put(pref, ID_ZERO)
  }

  const models = tx.objectStore("models")
  const cards = tx.objectStore("cards")
  const graves = tx.objectStore("graves")
  const cardsByNid = cards.index("nid")

  const prev = await models.get(model.id)

  if (!prev) {
    models.add(model)
    await tx.done
    return
  }

  const { add, del } = diffTmpls(prev, model)

  const notes = tx.objectStore("notes")

  if (requiresOneWaySync(prev, model)) {
    const core = tx.objectStore("core")
    const c = notNull(await core.get(ID_ZERO), "Core must exist.")
    core.put(
      { ...c, last_schema_edit: Date.now(), last_edited: Date.now() },
      ID_ZERO,
    )
  }

  for (const note of await notes.getAll()) {
    if (note.mid != model.id) {
      continue
    }

    inner(note)
  }

  models.put(model)
  await tx.done
  return

  async function inner(note: Note) {
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
    notes.put(note)

    if (!add.length && !del.length) {
      return
    }

    const cs = await cardsByNid.getAll(note.id)

    if (add.length) {
      const fields = Template.fieldRecord(model.fields, note.fields)
      const deckId = mostPopularId(cs.map((x) => x.odid ?? x.did))
      if (deckId != null) {
        for (const tmpl of add) {
          const base = createEmptyCard(now)
          const template = unwrapOr(Template.parse(tmpl.qfmt), [])
          const isFilled = Template.isFilled(template, fields, {
            FrontSide: undefined,
          })
          if (!isFilled) {
            continue
          }
          const card: NewCard = {
            ...base,
            creation: now,
            did: deckId,
            nid: note.id,
            tid: tmpl.id,
            id: randomId(),
            due: base.due.getTime(),
            last_edited: now,
            last_review: null,
            queue: 0,
            state: State.New,
            flags: 0,
            odid: null,
          }
          cards.add(card)
        }
      }
    }

    if (del.length) {
      for (const { id } of del) {
        const cid = cs.find((x) => x.nid == id)?.id
        if (cid != null) {
          cards.delete(cid)
          graves.add({ id: randomId(), oid: cid, type: 0 })
        }
      }
    }
  }
}
