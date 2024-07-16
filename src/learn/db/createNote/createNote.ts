import { unwrapOr } from "@/components/result"
import { randomId } from "@/learn/lib/id"
import { mapRecord } from "@/learn/lib/record"
import { Deck, Model, NewCard, Note, NoteFields } from "@/learn/lib/types"
import { createEmptyCard, State } from "ts-fsrs"
import { DB } from ".."
import * as Template from "../../lib/template"

export function nextModel(
  tags: string[],
  fields: NoteFields,
  model: Model,
  sticky: Record<string, boolean>,
): Model {
  return {
    ...model,
    tags,
    fields: mapRecord(model.fields, (field) => ({
      ...field,
      sticky: (sticky[field.id] && fields[field.id]) || "",
    })),
  }
}

async function createNoteDB(
  db: DB,
  tags: string[],
  fields: NoteFields,
  model: Model,
  deck: Deck,
  now: number,
) {
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
      last_review: undefined,
      queue: 0,
      state: State.New,
      flags: 0,
    }
    cards.push(card)
  }

  if (cards.length == 0) {
    throw new Error("Note generated no cards.")
  }

  const tx = db.readwrite(
    ["notes", "cards", "models"],
    `Create note in ${deck.name}`,
  )

  tx.objectStore("notes").add(note)
  for (const card of cards) {
    tx.objectStore("cards").add(card)
  }
  tx.objectStore("models").put(model)

  await tx.done
}

export function createNote(
  db: DB,
  tags: string[],
  fields: NoteFields,
  model: Model,
  deck: Deck,
  now: number,
  sticky: Record<string, boolean>,
) {
  const m2 = nextModel(tags, fields, model, sticky)
  return {
    model: m2,
    done: createNoteDB(db, tags, fields, m2, deck, now),
  }
}
