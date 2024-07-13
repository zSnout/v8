import {
  IDBPDatabase,
  IDBPObjectStore,
  IDBPTransaction,
  openDB,
  StoreNames,
} from "idb"
import {
  createConf,
  createCore,
  createDeck,
  createPrefs,
} from "../lib/defaults"
import { Id, ID_ZERO } from "../lib/id"
import { createBuiltinV3 } from "../lib/models"
import type {
  AnyCard,
  Conf,
  Core,
  Deck,
  Grave,
  Model,
  Note,
  Prefs,
  Review,
} from "../lib/types"
import type { Cloneable } from "../message"
import type { Reason } from "./reason"

export interface DBSchema {
  [s: string]: {
    key: IDBValidKey
    value: Cloneable
    indexes?: { [s: string]: IDBValidKey }
  }
}

export interface DBTypes extends DBSchema {
  cards: { key: Id; value: AnyCard; indexes: { nid: Id; did: Id } }
  graves: { key: number; value: Grave; indexes: {} }
  notes: { key: Id; value: Note; indexes: { mid: Id } }
  rev_log: { key: Id; value: Review; indexes: { cid: Id } }
  core: { key: Id; value: Core; indexes: {} }
  models: { key: Id; value: Model; indexes: {} }
  decks: { key: Id; value: Deck; indexes: { cfid: Id; name: string } }
  confs: { key: Id; value: Conf; indexes: {} }
  prefs: { key: Id; value: Prefs; indexes: {} }
}

export async function open(name: string, now: number): Promise<DB> {
  const db = await openDB<DBTypes>(name, 3, {
    async upgrade(db, oldVersion) {
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
    },
  })

  return Object.assign(db, { read, readwrite })
}

function read(
  this: IDBPDatabase<DBTypes>,
  storeNames: string | string[],
  options?: IDBTransactionOptions,
): any {
  return this.transaction(storeNames as any, "readonly", options)
}

function readwrite(
  this: IDBPDatabase<DBTypes>,
  storeNames: string | string[],
  _reason: Reason,
  options?: IDBTransactionOptions,
): any {
  return this.transaction(storeNames as any, "readwrite", options)
}

export interface DB {
  read<Name extends StoreNames<DBTypes>>(
    storeNames: Name,
    options?: IDBTransactionOptions,
  ): IDBPTransaction<DBTypes, [Name], "readonly">

  read<Names extends ArrayLike<StoreNames<DBTypes>>>(
    storeNames: Names,
    options?: IDBTransactionOptions,
  ): IDBPTransaction<DBTypes, Names, "readonly">

  readwrite<Name extends StoreNames<DBTypes>>(
    storeNames: Name,
    reason: Reason,
    options?: IDBTransactionOptions,
  ): IDBPTransaction<DBTypes, [Name], "readwrite">

  readwrite<Names extends ArrayLike<StoreNames<DBTypes>>>(
    storeNames: Names,
    reason: Reason,
    options?: IDBTransactionOptions,
  ): IDBPTransaction<DBTypes, Names, "readwrite">
}

// a lot of really stupid typescript stuff because typescript sucks

export type TxWithExtends = Omit<
  IDBTransaction,
  "db" | "objectStore" | "objectStoreNames"
>

export interface TxWith<
  T extends StoreNames<DBTypes>,
  Mode extends IDBTransactionMode = "readonly",
> extends TxWithExtends {
  /**
   * The transaction's mode.
   */
  readonly mode: Mode
  /**
   * Promise for the completion of this transaction.
   */
  readonly done: Promise<void>
  /**
   * Returns an IDBObjectStore in the transaction's scope.
   */
  objectStore<StoreName extends T>(
    name: StoreName,
  ): ObjectStoreWith<DBTypes, T[], StoreName, Mode>
}

export type ObjectStoreExtends<
  DBTypes extends DBSchema | unknown = unknown,
  TxStores extends ArrayLike<StoreNames<DBTypes>> = ArrayLike<
    StoreNames<DBTypes>
  >,
  StoreName extends StoreNames<DBTypes> = StoreNames<DBTypes>,
  Mode extends IDBTransactionMode = "readonly",
> = Omit<
  IDBPObjectStore<DBTypes, TxStores, StoreName, Mode>,
  // FIXME: type these properly
  | "transaction"
  | "indexNames"
  | "index"
  | typeof Symbol.asyncIterator
  | "openCursor"
  | "openKeyCursor"
  | "iterate"
>

export interface ObjectStoreWith<
  DBTypes extends DBSchema | unknown = unknown,
  TxStores extends ArrayLike<StoreNames<DBTypes>> = ArrayLike<
    StoreNames<DBTypes>
  >,
  StoreName extends StoreNames<DBTypes> = StoreNames<DBTypes>,
  Mode extends IDBTransactionMode = "readonly",
> extends ObjectStoreExtends<DBTypes, TxStores, StoreName, Mode> {}
