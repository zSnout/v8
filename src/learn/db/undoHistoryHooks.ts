import { unwrap, type IDBPTransaction } from "idb"
import type { Ty } from "."

const undoMap = new WeakMap<
  IDBTransaction,
  Record<string, Map<IDBValidKey, any>>
>()

export function makeUndoable(tx: IDBPTransaction<Ty, any, "readwrite">) {
  undoMap.set(unwrap(tx), Object.create(null))
}

function set<T extends Record<K, (...args: any[]) => any>, K extends keyof T>(
  obj: T,
  key: K,
  fn: (og: T[K]) => (this: T, ...args: Parameters<T[K]>) => ReturnType<T[K]>,
) {
  ;(obj as any)[key] = fn((obj as any)[key])
}

// set(
//   IDBCursor.prototype,
//   "delete",
//   (fn) =>
//     function () {
//       this.key
//     },
// )

const cursorUpdate = IDBCursor.prototype.update
const objectStoreAdd = IDBObjectStore.prototype.add
const objectStorePut = IDBObjectStore.prototype.put

IDBCursor.prototype.update = function (value: unknown) {
  if (typeof value == "object" && value && "last_edited" in value) {
    value.last_edited = Date.now()
  }

  return cursorUpdate.call(this, value)
}

IDBObjectStore.prototype.add = function (value: unknown, key) {
  if (typeof value == "object" && value && "last_edited" in value) {
    value.last_edited = Date.now()
  }

  return objectStoreAdd.call(this, value, key)
}

IDBObjectStore.prototype.put = function (value: unknown, key) {
  if (typeof value == "object" && value && "last_edited" in value) {
    value.last_edited = Date.now()
  }

  return objectStorePut.call(this, value, key)
}
