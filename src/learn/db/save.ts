import { DB } from "."
import { createCore, createPrefs } from "../lib/defaults"
import { ID_ZERO } from "../lib/id"
import { Collection } from "../lib/types"

export async function exportDb(db: DB, now: number) {
  const tx = db.read([
    "cards",
    "graves",
    "notes",
    "rev_log",
    "core",
    "models",
    "decks",
    "confs",
    "prefs",
  ])

  const [cards, graves, notes, rev_log, core, models, decks, confs, prefs] =
    await Promise.all([
      tx.objectStore("cards").getAll(),
      tx.objectStore("graves").getAll(),
      tx.objectStore("notes").getAll(),
      tx.objectStore("rev_log").getAll(),
      tx.objectStore("core").get(ID_ZERO),
      tx.objectStore("models").getAll(),
      tx.objectStore("decks").getAll(),
      tx.objectStore("confs").getAll(),
      tx.objectStore("prefs").get(ID_ZERO),
    ])

  const collection: Collection = {
    version: 3,
    cards,
    graves,
    notes,
    rev_log,
    core: core || createCore(now),
    models,
    decks,
    confs,
    prefs: prefs || createPrefs(now),
  }

  const json = JSON.stringify(collection)

  return new File(
    [json],
    "zsnout-learn-" + new Date(now).toISOString() + ".zl.json",
  )
}

export async function importDb(db: DB, data: Collection) {
  const tx = db.readwrite(
    [
      "cards",
      "graves",
      "notes",
      "rev_log",
      "core",
      "models",
      "decks",
      "confs",
      "prefs",
    ],
    "Import collection",
  )

  const cards = tx.objectStore("cards")
  const graves = tx.objectStore("graves")
  const notes = tx.objectStore("notes")
  const rev_log = tx.objectStore("rev_log")
  const core = tx.objectStore("core")
  const models = tx.objectStore("models")
  const decks = tx.objectStore("decks")
  const confs = tx.objectStore("confs")
  const prefs = tx.objectStore("prefs")

  await Promise.all([
    cards.clear().then(() => {
      for (const item of data.cards) {
        cards.add(item)
      }
    }),

    graves.clear().then(() => {
      for (const item of data.graves) {
        graves.add(item)
      }
    }),

    notes.clear().then(() => {
      for (const item of data.notes) {
        notes.add(item)
      }
    }),

    rev_log.clear().then(() => {
      for (const item of data.rev_log) {
        rev_log.add(item)
      }
    }),

    core.clear().then(() => {
      core.add(data.core, ID_ZERO)
    }),

    models.clear().then(() => {
      for (const item of data.models) {
        models.add(item)
      }
    }),

    decks.clear().then(() => {
      for (const item of data.decks) {
        decks.add(item)
      }
    }),

    confs.clear().then(() => {
      for (const item of data.confs) {
        confs.add(item)
      }
    }),

    prefs.clear().then(() => {
      prefs.add(data.prefs, ID_ZERO)
    }),
  ])
}