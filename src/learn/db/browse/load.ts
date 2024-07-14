import { notNull, prayTruthy } from "@/components/pray"
import { compare } from "@/learn/lib/compare"
import { type Id } from "@/learn/lib/id"
import { arrayToRecord } from "@/learn/lib/record"
import {
  AnyCard,
  BrowserColumn,
  Deck,
  Model,
  Note,
  type Prefs,
} from "@/learn/lib/types"
import { timestampDist } from "@/pages/quiz/shared"
import type { DB } from ".."
import { createPrefsStore } from "../prefs/store"

export interface BrowseData {
  cardsArray: AnyCard[]
  cards: Record<Id, AnyCard>
  cardsByNid: Partial<Record<Id, AnyCard[]>>
  notes: Record<Id, Note>
  models: Record<Id, Model>
  decks: Record<Id, Deck>
  prefs: Prefs
}

export async function load(db: DB) {
  const [prefs, setPrefs, ready] = createPrefsStore(db)
  await ready

  const tx = db.read(["cards", "notes", "models", "decks"])

  const [cards, notes, models, decks] = await Promise.all([
    tx.objectStore("cards").getAll(),
    tx.objectStore("notes").getAll(),
    tx.objectStore("models").getAll().then(arrayToRecord),
    tx.objectStore("decks").getAll().then(arrayToRecord),
  ])

  prayTruthy(prefs, "This collection does not have a preferences object.")

  const notesByNid = arrayToRecord(notes)

  const data: BrowseData = {
    cardsArray: cards,
    cards: arrayToRecord(cards),
    cardsByNid: Object.groupBy(cards, (item) => item.nid),
    notes: notesByNid,
    models,
    decks,
    prefs,
  }

  return {
    ...data,
    setPrefs,
    columns: cards.map((card) => {
      const note = notNull(
        notesByNid[card.nid],
        "Card must be associated with a valid note.",
      )
      return { card, note, columns: makeColumns(card, note, data) }
    }),
    noteColumns: notes.map((note) => {
      return {
        card: undefined,
        note,
        columns: makeColumns(undefined, note, data),
      }
    }),
  }
}

export type ColumnValue = string | number | undefined

export type ColumnGetter = (
  card: AnyCard | undefined,
  note: Note,
  data: BrowseData,
) => ColumnValue

function date(ts: number | undefined) {
  if (ts == null) {
    return
  }

  const d = new Date(ts)
  return (
    d.getFullYear().toString().padStart(4, "0") +
    "-" +
    (d.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    d.getDate().toString().padStart(2, "0")
  )
}

const columns: Record<BrowserColumn, ColumnGetter> = {
  "Sort Field"(_, note) {
    return note.sort_field
  },
  Answer(card) {
    if (!card) return
    return "TODO:"
  },
  Card(card, note, { models, cardsByNid }) {
    if (!card) {
      return cardsByNid[note.id]?.length
    }

    const model = models[note.mid]
    if (!model) return
    return Object.keys(model.tmpls).indexOf(card.tid.toString())
  },
  Created(card, note) {
    return date((card ?? note).creation)
  },
  Deck(card, note, data) {
    if (card) {
      return data.decks[card.did]?.name
    } else {
      const decks = data.cardsByNid[note.id]
        ?.map((x) => x.did)
        .filter((x, i, a) => a.indexOf(x) == i)
        .map((x) => data.decks[x]?.name)
        .filter((x) => x != null)

      if (!decks) return

      if (decks.length == 0) {
        return
      } else {
        return decks.sort(compare).join(", ")
      }
    }
  },
  Due(card) {
    return date(card?.due)
  },
  Difficulty(card) {
    return card?.difficulty
  },
  Edited(card, note) {
    return date((card ?? note).last_edited)
  },
  Interval(card) {
    if (card?.last_review == null) {
      return "(new)"
    } else {
      return timestampDist((card.due - card.last_review) / 1000)
    }
  },
  Lapses(card) {
    return card?.lapses
  },
  Model(_, note, { models }) {
    return models[note.mid]?.name
  },
  Question(card) {
    if (!card) return
    return "TODO:"
  },
  Reviews(card) {
    return card?.reps
  },
  Tags(_, note) {
    return note.tags.sort(compare).join(", ")
  },
}

export type ColumnData = Record<BrowserColumn, ColumnValue>

export function makeColumns(
  card: AnyCard | undefined,
  note: Note,
  data: BrowseData,
): ColumnData {
  const output: ColumnData = {} as any
  for (const key of BrowserColumn.options) {
    output[key] = columns[key](card, note, data)
  }
  return output
}
