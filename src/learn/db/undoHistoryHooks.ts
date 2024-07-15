import { unwrap, type IDBPTransaction } from "idb"
import type { Ty } from "."

type PastStateRecord = Record<string, Map<IDBValidKey, any>>

const states = new WeakMap<IDBTransaction, PastStateRecord>()

export type UndoFunction = () => Promise<false | UndoFunction>

export function createUndoable(tx: IDBPTransaction<Ty, any, "readwrite">) {
  const raw = unwrap(tx)
  const data: PastStateRecord = Object.create(null)
  states.set(raw, data)
  return async () => {
    await tx.done
    if (!states.has(raw)) return false
    const next = tx.db.transaction(Object.keys(data) as any[], "readwrite")
    const redo = createUndoable(next)
    for (const key in data) {
      const map = data[key]!
      const store = next.objectStore(key)
      for (const [k, v] of map) {
        if (v === undefined) {
          store.delete(k)
        } else if (store.keyPath) {
          store.put(v)
        } else {
          store.put(v, k as any)
        }
      }
    }
    await next.done
    return redo
  }
}

function set<T extends Record<K, (...args: any[]) => any>, K extends keyof T>(
  obj: T,
  key: K,
  fn: (og: T[K]) => (this: T, ...args: Parameters<T[K]>) => ReturnType<T[K]>,
) {
  ;(obj as any)[key] = fn((obj as any)[key])
}

function past(
  item: IDBCursor | IDBObjectStore | IDBIndex,
): PastStateRecord | undefined {
  if (item instanceof IDBCursor) return past(item.source)
  if (item instanceof IDBIndex) return states.get(item.objectStore.transaction)
  return states.get(item.transaction)
}

set(
  IDBCursor.prototype,
  "delete",
  (fn) =>
    function (this: IDBCursor) {
      let state
      if (
        this.source instanceof IDBIndex ||
        this.source.transaction.mode == "readonly" ||
        !(state = past(this))
      ) {
        return fn.apply(this, arguments as any)
      }

      ;(state[this.source.name] ??= new Map()).set(
        this.primaryKey,
        structuredClone(this.request.result),
      )
      return fn.apply(this, arguments as any)
    },
)

set(
  IDBCursor.prototype,
  "update",
  (fn) =>
    function (this: IDBCursor) {
      let state
      if (
        this.source instanceof IDBIndex ||
        this.source.transaction.mode == "readonly" ||
        !(state = past(this))
      ) {
        return fn.apply(this, arguments as any)
      }

      ;(state[this.source.name] ??= new Map()).set(
        this.primaryKey,
        structuredClone(this.request.result),
      )
      return fn.apply(this, arguments as any)
    },
)

set(
  IDBObjectStore.prototype,
  "add",
  (fn) =>
    function (this: IDBObjectStore) {
      let state
      if (this.transaction.mode == "readonly" || !(state = past(this))) {
        return fn.apply(this, arguments as any)
      }

      const req = fn.apply(this, arguments as any)
      req.addEventListener("success", () => {
        ;(state[this.name] ??= new Map()).set(req.result, undefined)
      })
      return req
    },
)

set(
  IDBObjectStore.prototype,
  "clear",
  (fn) =>
    function (this: IDBObjectStore) {
      if (this.transaction.mode == "readonly" || !past(this)) {
        return fn.apply(this, arguments as any)
      }

      states.delete(this.transaction)
      return fn.apply(this, arguments as any)
    },
)

set(
  IDBObjectStore.prototype,
  "delete",
  (fn) =>
    function (this: IDBObjectStore, key) {
      let state
      if (this.transaction.mode == "readonly" || !(state = past(this))) {
        return fn.apply(this, arguments as any)
      }

      if (key instanceof IDBKeyRange) {
        throw new Error(
          "Cannot delete keys within a range in an undoable transaction.",
        )
      }

      let data: any
      let ok = false
      const getReq = this.get(key)
      getReq.onsuccess = () => {
        data = getReq.result
        if (ok) {
          ;(state[this.name] ??= new Map()).set(key, data)
        } else {
          ok = true
        }
      }

      const req = fn.apply(this, arguments as any)
      req.addEventListener("success", () => {
        if (ok) {
          ;(state[this.name] ??= new Map()).set(key, data)
        }
      })
      return req
    },
)

set(
  IDBObjectStore.prototype,
  "put",
  (fn) =>
    function (this: IDBObjectStore, value, ogKey) {
      let state
      if (this.transaction.mode == "readonly" || !(state = past(this))) {
        return fn.apply(this, arguments as any)
      }

      const key =
        ogKey ??
        (typeof this.keyPath == "string"
          ? value?.[this.keyPath]
          : this.keyPath.map((x) => value?.[x]))

      let data: any
      let ok = false
      const getReq = this.get(key)
      getReq.onsuccess = () => {
        data = getReq.result
        if (ok) {
          ;(state[this.name] ??= new Map()).set(key, data)
        } else {
          ok = true
        }
      }

      const req = fn.apply(this, arguments as any)
      req.addEventListener("success", () => {
        if (ok) {
          ;(state[this.name] ??= new Map()).set(key, data)
        }
      })
      return req
    },
)
