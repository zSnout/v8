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
import type { Cloneable } from "../message"
import "./lastEditedHooks"
import type { Reason } from "./reason"
import { createUndoable, type UndoFunction } from "./undoHistoryHooks"
import { upgrade, VERSION } from "./upgrade"

/** Like the schema type in idb, but uses `Cloneable` to ensure type safety. */
export interface RequiredSchema {
  [s: string]: {
    key: IDBValidKey
    value: Cloneable
    indexes?: { [s: string]: IDBValidKey }
  }
}

/** The types for the learn database. */
export interface Ty extends RequiredSchema {
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
  return new DB(await openDB(name, VERSION, { upgrade: upgrade(now) }))
}

export class DB {
  private last?: {
    reason: Reason
    undo: UndoFunction
    redo: boolean
  }

  constructor(private db: IDBPDatabase<Ty>) {}

  undo() {
    const { last } = this
    if (!last) return
    const redo = last.undo()
    this.last = {
      reason: last.reason,
      redo: !last.redo,
      undo: async () => (await redo)(),
    }
    return { last, done: redo.then(() => {}) }
  }

  read<Name extends StoreNames<Ty>>(
    storeNames: Name,
    options?: IDBTransactionOptions,
  ): IDBPTransaction<Ty, [Name], "readonly">

  read<Names extends ArrayLike<StoreNames<Ty>>>(
    storeNames: Names,
    options?: IDBTransactionOptions,
  ): IDBPTransaction<Ty, Names, "readonly">

  read<Names extends StoreNames<Ty> | ArrayLike<StoreNames<Ty>>>(
    storeNames: Names,
    options?: IDBTransactionOptions,
  ): any {
    return this.db.transaction(storeNames as any, "readonly", options)
  }

  readwrite<Name extends StoreNames<Ty>>(
    storeNames: Name,
    reason: Reason,
    options?: IDBTransactionOptions,
  ): IDBPTransaction<Ty, [Name], "readwrite">

  readwrite<Names extends ArrayLike<StoreNames<Ty>>>(
    storeNames: Names,
    reason: Reason,
    options?: IDBTransactionOptions,
  ): IDBPTransaction<Ty, Names, "readwrite">

  readwrite(
    storeNames: string | string[],
    reason: Reason,
    options?: IDBTransactionOptions,
  ) {
    const tx = this.db.transaction(storeNames as any, "readwrite", options)
    const undo = createUndoable(tx)
    this.last = {
      reason,
      redo: false,
      undo,
    }
    return tx
  }
}

// a lot of really stupid typescript stuff because typescript sucks

export type TxWithExtends = Omit<
  IDBTransaction,
  "db" | "objectStore" | "objectStoreNames"
>

export interface TxWith<
  T extends StoreNames<Ty>,
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
  ): ObjectStoreWith<Ty, T[], StoreName, Mode>
}

export type ObjectStoreExtends<
  DBTypes extends RequiredSchema | unknown = unknown,
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
  DBTypes extends RequiredSchema | unknown = unknown,
  TxStores extends ArrayLike<StoreNames<DBTypes>> = ArrayLike<
    StoreNames<DBTypes>
  >,
  StoreName extends StoreNames<DBTypes> = StoreNames<DBTypes>,
  Mode extends IDBTransactionMode = "readonly",
> extends ObjectStoreExtends<DBTypes, TxStores, StoreName, Mode> {}
