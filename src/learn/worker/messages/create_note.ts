import { unwrapOr } from "@/components/result"
import { randomId } from "@/learn/lib/id"
import * as Template from "@/learn/lib/template"
import {
  ModelFields,
  type Deck,
  type Model,
  type NewCard,
  type Note,
  type NoteFields,
} from "@/learn/lib/types"
import { createEmptyCard, State } from "ts-fsrs"
import { parse } from "valibot"
import { text } from "../checks"
import { db } from ".."
import { stmts } from "../stmts"

export function create_note(
  tags: string[],
  fields: NoteFields,
  model: Pick<Model, "tmpls" | "id" | "fields" | "sort_field">,
  deck: Deck,
) {
  const now = Date.now()
  const sortField = fields[model.sort_field ?? 0] ?? ""
  const nid = randomId()
  const note: Note = {
    creation: now,
    fields: fields,
    mid: model.id,
    csum: 0, // FEAT: checksums
    id: nid,
    last_edited: now,
    sort_field: sortField,
    tags,
    marks: 0,
  }

  const fieldRecord = Template.fieldRecord(model.fields, fields)
  const cards: NewCard[] = []

  for (const tmpl of Object.values(model.tmpls)) {
    const base = createEmptyCard(now)
    const template = unwrapOr(Template.parse(tmpl.qfmt), [])
    const isFilled = Template.isFilled(template, fieldRecord, {
      FrontSide: undefined,
    })
    if (!isFilled) {
      continue
    }
    const card: NewCard = {
      ...base,
      creation: now,
      did: deck.id,
      nid,
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
    cards.push(card)
  }

  if (cards.length == 0) {
    throw new Error("Note generated no cards.")
  }

  const tx = db.readwrite(`Create note in ${deck.name}`)
  try {
    db.run(stmts.notes.insert, stmts.notes.insertArgs(note))

    // insert cards using a prepared statement
    const stmt = db.prepare(stmts.cards.insert)
    try {
      for (const card of cards) {
        stmt.bind(stmts.cards.insertArgs(card)).stepReset()
      }
    } finally {
      stmt.finalize()
    }

    // verify that the fields object we're adding doesn't kill integrity
    const result = db.val("SELECT fields FROM models WHERE id = ?", text, [
      model.id,
    ])
    const prevFields = Object.keys(parse(ModelFields, JSON.parse(result)))
    const nextFields = Object.keys(model.fields)
    if (
      (model.sort_field == null ||
        prevFields.includes("" + model.sort_field)) &&
      prevFields.length == nextFields.length &&
      prevFields.every((x, i) => x == nextFields[i])
    ) {
      db.run("UPDATE models SET sort_field = ?, fields = ? WHERE id = ?", [
        model.sort_field,
        JSON.stringify(model.fields),
        model.id,
      ])
    } else {
      console.warn(
        "The model was not able to be updated.",
        model.sort_field,
        prevFields,
        nextFields,
      )
    }
    tx.commit()
  } finally {
    tx.dispose()
  }
}
