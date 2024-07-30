import type { Id } from "@/learn/lib/id"
import { parseKey, UserMedia, writeKey } from "@/learn/lib/media"
import { unique } from "@/learn/lib/unique"
import JSZip from "jszip"
import { State } from "ts-fsrs"
import { readonly, sql } from ".."
import { packageDeck } from "../lib/package"
import { stmts } from "../lib/stmts"

export interface ExportDecksProps {
  includeConfs: boolean
  includeRevLog: boolean
  includeScheduling: boolean
  includeMedia: boolean
}

const userMedia = new UserMedia()

const MEDIA_REGEX = /\/learn\/media\/([0-9a-zA-Z]{16})/g

export async function export_decks_txless(
  dids: Id[],
  props: ExportDecksProps,
): Promise<File> {
  const decks = sql`SELECT * FROM decks WHERE id = ?;`
    .each(dids)
    .getRow()
    .map(stmts.decks.interpret)

  const cards = sql`SELECT * FROM cards WHERE did = ?;`
    .each(dids)
    .getAll()
    .flat()
    .map(stmts.cards.interpret)

  const notes = sql`SELECT * FROM notes WHERE id = ?;`
    .each(cards.map((x) => x.nid).filter(unique))
    .getAll()
    .flat()
    .map(stmts.notes.interpret)

  const models = sql`SELECT * FROM models WHERE id = ?;`
    .each(notes.map((x) => x.mid).filter(unique))
    .getAll()
    .flat()
    .map(stmts.models.interpret)

  const rev_log =
    props.includeRevLog ?
      sql`SELECT * FROM rev_log WHERE cid = ?;`
        .each(cards.map((x) => x.id))
        .getAll()
        .flat()
        .map(stmts.rev_log.interpret)
    : null

  const confs =
    props.includeConfs ?
      sql`SELECT * FROM confs WHERE id = ?;`
        .each(decks.map((x) => x.cfid).filter(unique))
        .getAll()
        .flat()
        .map(stmts.confs.interpret)
    : null

  if (!props.includeScheduling) {
    for (const card of cards) {
      card.difficulty = 0
      card.due = 0
      card.elapsed_days = 0
      card.lapses = 0
      card.last_review = 0
      card.reps = 0
      card.scheduled_days = 0
      card.stability = 0
      card.state = State.New
      card.queue = 0
    }

    for (const deck of decks) {
      deck.collapsed = false
      deck.custom_newcard_limit = null
      deck.custom_revcard_limit = null
      deck.default_newcard_limit = null
      deck.default_revcard_limit = null
      deck.new_today = []
      deck.revcards_today = []
      deck.revlogs_today = 0
      deck.today = 0
    }

    for (const note of notes) {
      note.marks = 0
    }
  }

  let media: JSZip | null = null
  const mediaMap: Record<string, string> = Object.create(null)
  if (props.includeMedia) {
    media = new JSZip()

    const mayHaveMedia = notes
      .flatMap((note) => Object.values(note.fields))
      .concat(
        models.flatMap((model) =>
          [
            model.css,
            Object.values(model.tmpls).map((x) => x.qfmt),
            Object.values(model.tmpls).map((x) => x.afmt),
            Object.values(model.tmpls)
              .map((x) => x.qb)
              .filter((x) => x != null),
            Object.values(model.tmpls)
              .map((x) => x.ab)
              .filter((x) => x != null),
          ].flat(),
        ),
      )

    const keys = new Set<string>()
    let output
    for (const string of mayHaveMedia) {
      while ((output = MEDIA_REGEX.exec(string))) {
        keys.add(output[1]!)
      }
    }
    for (const { key, file } of await userMedia.getEach(
      Array.from(keys)
        .map(parseKey)
        .filter((x) => x != null),
    )) {
      if (file) {
        const str = writeKey(key)
        mediaMap[str] = file.name
        media.file(str, file)
      }
    }
  }

  return packageDeck({
    meta: {
      version: 1,
      media: props.includeMedia ? mediaMap : null,
      hasScheduling: props.includeScheduling,
      hasConfs: props.includeConfs,
      hasRevlog: props.includeRevLog,
    },
    data: {
      cards,
      confs,
      decks,
      models,
      notes,
      rev_log,
    },
    media,
  })
}

export function export_decks(dids: Id[], props: ExportDecksProps) {
  const tx = readonly()
  try {
    return export_decks_txless(dids, props)
  } finally {
    // `tx` is disposed before the promise resolves, but this is okay, since
    // `export_decks_raw_txless` only accesses the database in the initial
    // synchronous tick of its execution
    tx.dispose()
  }
}
