import { unwrapOr } from "@/components/result"
import { Id, ID_ZERO, randomId } from "@/learn/lib/id"
import * as Template from "@/learn/lib/template"
import {
  Model,
  ModelFields,
  ModelTemplates,
  NewCard,
  Note,
  NoteFields,
  TemplateEditStyle,
} from "@/learn/lib/types"
import { createEmptyCard, State } from "ts-fsrs"
import { parse } from "valibot"
import { id, qid, text } from "../checks"
import { db } from ".."
import { stmts } from "../stmts"

function requiresOneWaySync(
  prev: Pick<Model, "sort_field" | "fields">,
  next: Model,
) {
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

function diffTmpls(prev: ModelTemplates, next: ModelTemplates) {
  const p = Object.values(prev)
  const n = Object.values(next)

  return {
    add: n.filter((n) => !p.some((p) => p.id == n.id)), // things in n but not p
    del: p.filter((p) => !n.some((n) => n.id == p.id)), // things in p but not n
  }
}

function mostPopularId(dids: Id[]) {
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

export async function model_set(model: Model, editStyle?: TemplateEditStyle) {
  const tx = db.readwrite(
    `Update ${editStyle ? "templates" : "fields"} for model ${model.name}`,
  )

  try {
    const now = Date.now()

    if (model.name.trim() == "") {
      throw new Error("Model name is empty.")
    }

    if (editStyle) {
      db.run("UPDATE prefs SET template_edit_style = ? WHERE id = 0", [
        JSON.stringify(editStyle),
      ])
    }

    const prevRaw = db.checked(
      "SELECT tmpls, sort_field, fields FROM models WHERE id = ?",
      [text, qid, text],
      [model.id],
    )[0]

    if (!prevRaw) {
      db.run(stmts.models.insert, stmts.models.insertArgs(model))
      tx.commit()
      return
    }

    const prev = {
      tmpls: parse(ModelTemplates, JSON.parse(prevRaw[0])),
      sort_field: prevRaw[1],
      fields: parse(ModelFields, JSON.parse(prevRaw[2])),
    }

    const { add, del } = diffTmpls(prev.tmpls, model.tmpls)

    if (requiresOneWaySync(prev, model)) {
      db.run(
        "UPDATE core SET last_schema_edit = :now, last_edited = :now WHERE id = 0",
        { ":now": Date.now() },
      )
    }

    for (const note of db.run("SELECT * FROM notes WHERE mid = ?", [
      model.id,
    ])) {
      inner(stmts.notes.interpret(note))
    }

    db.run(stmts.models.update, stmts.models.updateArgs(model))
    tx.commit()
    return

    async function inner(note: Note) {
      const sort_field = note.fields[model.sort_field ?? 0] ?? ""
      const fields = Object.create(null) as NoteFields
      for (const key in model.fields) {
        fields[key] = note.fields[key] ?? ""
      }
      const last_edited = now
      // FEAT: checksums
      db.run(
        "UPDATE notes SET sort_field = ?, fields = ?, last_edited = ? WHERE id = ?",
        [sort_field, JSON.stringify(fields), last_edited, note.id],
      )

      if (!add.length && !del.length) {
        return
      }

      const cs = db
        .checked(
          "SELECT tid, odid, did, id FROM cards WHERE nid = ?",
          [id, qid, id, id],
          [note.id],
        )
        .map(([tid, odid, did, id]) => ({ tid, odid, did, id }))

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
            db.run(stmts.cards.insert, stmts.cards.insertArgs(card))
          }
        }
      }

      if (del.length) {
        for (const { id } of del) {
          const cid = cs.find((x) => x.tid == id)?.id
          if (cid != null) {
            db.run("DELETE FROM cards WHERE id = ?", [cid])
          }
        }
      }
    }
  } finally {
    tx.dispose()
  }
}
