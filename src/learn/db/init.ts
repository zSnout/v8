import { StoreNames } from "idb"
import { parse } from "valibot"
import { DB, DBCollection, TxWith } from "."
import data from "../data.json"
import { createConf, createPrefs } from "../lib/defaults"
import { ID_ZERO } from "../lib/id"
import { Collection } from "../lib/types"

async function setTx(
  tx: TxWith<StoreNames<DBCollection>, "readwrite">,
  collection: Collection,
) {
  const cards = tx.objectStore("cards")
  for (const x of Object.values(collection.cards)) {
    cards.put(x, x.id)
  }

  const graves = tx.objectStore("graves")
  for (const x of collection.graves) {
    graves.put(x)
  }

  const notes = tx.objectStore("notes")
  for (const x of Object.values(collection.notes)) {
    notes.put(x, x.id)
  }

  const rev_log = tx.objectStore("rev_log")
  for (const x of Object.values(collection.rev_log).flat()) {
    rev_log.put(x, x.id)
  }

  const core = tx.objectStore("core")
  core.put(collection.core, ID_ZERO)

  const models = tx.objectStore("models")
  for (const x of Object.values(collection.models)) {
    models.put(x, x.id)
  }

  const decks = tx.objectStore("decks")
  for (const x of Object.values(collection.decks)) {
    decks.put(x, x.id)
  }

  const confs = tx.objectStore("confs")
  for (const x of Object.values(collection.confs)) {
    confs.put(x, x.id)
  }

  const prefs = tx.objectStore("prefs")
  prefs.put(collection.prefs, ID_ZERO)

  await tx.done
}

export async function checkValidity(db: DB, now: number) {
  const tx = db.transaction(
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
    "readwrite",
  )

  const [core] = await Promise.all([
    tx.objectStore("core").get(ID_ZERO),
    tx
      .objectStore("prefs")
      .get(ID_ZERO)
      .then(async (x) => {
        if (!x) {
          await tx.objectStore("prefs").put(createPrefs(now), ID_ZERO)
        }
      }),
    tx
      .objectStore("confs")
      .get(ID_ZERO)
      .then(async (x) => {
        if (!x) {
          await tx.objectStore("confs").put(createConf(now), ID_ZERO)
        }
      }),
  ] as const)

  // TODO: don't clear *everything* if core doesn't exist
  if (core) {
    await tx.done
    return
  }

  await setTx(tx, parse(Collection, data))
  await tx.done
}
