import { prayTruthy } from "@/components/pray"
import type { OpenDBCallbacks } from "idb"
import type { Ty } from "."
import {
  createConf,
  createCore,
  createDeck,
  createPrefs,
} from "../lib/defaults"
import { ID_ZERO } from "../lib/id"
import { createBuiltinV3 } from "../lib/models"

export const VERSION = 6

export const upgrade = (now: number) =>
  (async (db, oldVersion, _newVersion, tx) => {
    // deletes version 2 databases
    if (oldVersion == 2) {
      for (const name of Array.from(db.objectStoreNames)) {
        db.deleteObjectStore(name)
      }
    }

    // create object stores, indices, default deck/conf/prefs/core, and models
    if (oldVersion < 3) {
      // SECTION: create object stores
      const cards = db.createObjectStore("cards", { keyPath: "id" })
      cards.createIndex("did", "did")
      cards.createIndex("nid", "nid")

      db.createObjectStore("graves", { autoIncrement: true })

      const notes = db.createObjectStore("notes", { keyPath: "id" })
      notes.createIndex("mid", "mid")

      const rev_log = db.createObjectStore("rev_log", { keyPath: "id" })
      rev_log.createIndex("cid", "cid")

      const core = db.createObjectStore("core")

      const models = db.createObjectStore("models", { keyPath: "id" })

      const decks = db.createObjectStore("decks", { keyPath: "id" })
      decks.createIndex("cfid", "cfid")
      decks.createIndex("name", "name", { unique: true })

      const confs = db.createObjectStore("confs", { keyPath: "id" })

      const prefs = db.createObjectStore("prefs")

      // SECTION: install default items
      decks.put(createDeck(now, "Default", ID_ZERO))
      core.put(createCore(now), ID_ZERO)
      confs.put(createConf(now))
      prefs.put(createPrefs(now), ID_ZERO)
      for (const model of createBuiltinV3(Date.now())) {
        models.add(model)
      }
    }

    // in v4, cards and models got a `creation` property
    if (oldVersion < 4) {
      for await (const card of tx.objectStore("cards").iterate()) {
        if (card.value.creation == null) {
          card.update({ ...card.value, creation: card.value.last_edited })
        }
      }

      for await (const model of tx.objectStore("models").iterate()) {
        if (model.value.creation == null) {
          model.update({ ...model.value, creation: model.value.last_edited })
        }
      }
    }

    // in v5, prefs.last_edit changes to prefs.last_edited
    if (oldVersion < 5) {
      const store = tx.objectStore("prefs")
      const prefs = await store.get(ID_ZERO)
      prayTruthy(prefs, "The database does not have a preferences object.")
      if ("last_edit" in prefs && typeof prefs.last_edit == "number") {
        const { last_edit, ...next } = prefs
        next.last_edited = last_edit
        await store.put(next, ID_ZERO)
      }
    }

    // in v6, Review.type values other than 3 and 4 collapse to 0
    if (oldVersion < 6) {
      for await (const review of tx.objectStore("rev_log").iterate()) {
        if (!(review.value.type == 3 || review.value.type == 4)) {
          review.update({ ...review.value, type: 0 })
        }
      }
    }
  }) satisfies OpenDBCallbacks<Ty>["upgrade"]