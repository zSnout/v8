import { IDBPDatabase, IDBPObjectStore, openDB, StoreNames } from "idb"
import { Id } from "../lib/id"
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
import type { Sendable } from "../message"

export interface DBSchema {
  [s: string]: {
    key: IDBValidKey
    value: Sendable
    indexes?: { [s: string]: IDBValidKey }
  }
}

export interface DBCollection extends DBSchema {
  cards: { key: Id; value: AnyCard; indexes: { nid: Id; did: Id } }
  graves: { key: Id; value: Grave; indexes: {} }
  notes: { key: Id; value: Note; indexes: { mid: Id } }
  rev_log: { key: Id; value: Review; indexes: { cid: Id } }
  core: { key: Id; value: Core; indexes: {} }
  models: { key: Id; value: Model; indexes: {} }
  decks: { key: Id; value: Deck; indexes: { cfid: Id } }
  confs: { key: Id; value: Conf; indexes: {} }
  prefs: { key: Id; value: Prefs; indexes: {} }
}

export type DB = IDBPDatabase<DBCollection>

export async function open(name: string) {
  return await openDB<DBCollection>(name, 2, {
    async upgrade(db, oldVersion) {
      if (oldVersion < 2) {
        const cards = db.createObjectStore("cards")
        cards.createIndex("did", "did")
        cards.createIndex("nid", "nid")
        db.createObjectStore("graves")
        const notes = db.createObjectStore("notes")
        notes.createIndex("mid", "mid")
        const rev_log = db.createObjectStore("rev_log")
        rev_log.createIndex("cid", "cid")
        db.createObjectStore("core")
        db.createObjectStore("models")
        const decks = db.createObjectStore("decks")
        decks.createIndex("cfid", "cfid")
        db.createObjectStore("confs")
        db.createObjectStore("prefs")
      }
    },
  })
}

// a lot of really stupid typescript stuff because typescript sucks

export type TxWithExtends = Omit<
  IDBTransaction,
  "db" | "objectStore" | "objectStoreNames"
>

export interface TxWith<
  T extends StoreNames<DBCollection>,
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
  ): ObjectStoreWith<DBCollection, T[], StoreName, Mode>
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
  // TODO: type these properly
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
