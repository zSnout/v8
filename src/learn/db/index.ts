import {
  IDBPDatabase,
  IDBPObjectStore,
  IDBPTransaction,
  openDB,
  StoreNames,
} from "idb"
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
import type { Reason } from "./reason"

export interface DBSchema {
  [s: string]: {
    key: IDBValidKey
    value: Sendable
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
  decks: { key: Id; value: Deck; indexes: { cfid: Id } }
  confs: { key: Id; value: Conf; indexes: {} }
  prefs: { key: Id; value: Prefs; indexes: {} }
}

export async function open(name: string): Promise<DB> {
  const db = (await openDB<DBTypes>(name, 2, {
    async upgrade(db, oldVersion) {
      if (oldVersion < 2) {
        const cards = db.createObjectStore("cards")
        cards.createIndex("did", "did")
        cards.createIndex("nid", "nid")
        db.createObjectStore("graves", { autoIncrement: true })
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
  })) satisfies IDBPDatabase<DBTypes> as unknown as DB

  db.read = read
  db.readwrite = readwrite

  return db
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

export interface DB extends Pick<IDBPDatabase<DBTypes>, "get"> {
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
