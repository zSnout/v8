import { wrap } from "idb"
import type { MaybePromise } from "valibot"
import type { StoreTy, Ty } from "./db"
import { Id, ID_ZERO, type IdZero } from "./lib/id"

type Primitive = number | string | boolean | null | undefined

export class Tx {
  constructor(private readonly tx: IDBTransaction) {}

  get cards() {
    return new StoreUnkeyed<Ty["cards"]>(this.tx.objectStore("cards"))
  }

  get confs() {
    return new StoreUnkeyed<Ty["confs"]>(this.tx.objectStore("confs"))
  }

  get core() {
    return new StoreKeyed<Ty["core"], IdZero>(
      this.tx.objectStore("core"),
      ID_ZERO,
      ID_ZERO,
    )
  }

  get decks() {
    return new StoreUnkeyed<Ty["decks"]>(this.tx.objectStore("decks"))
  }

  get graves() {
    return new StoreUnkeyed<Ty["graves"]>(this.tx.objectStore("graves"))
  }

  get models() {
    return new StoreUnkeyed<Ty["models"]>(this.tx.objectStore("models"))
  }

  get prefs() {
    return new StoreKeyed<Ty["prefs"], IdZero>(
      this.tx.objectStore("prefs"),
      ID_ZERO,
      ID_ZERO,
    )
  }

  get rev_log() {
    return new StoreUnkeyed<Ty["rev_log"]>(this.tx.objectStore("rev_log"))
  }
}

function setKeyTwice(): never {
  throw new Error("Cannot set key query twice.")
}

export class StoreBase<
  N extends StoreTy,
  Q extends N["key"] | undefined = undefined,
> {
  constructor(
    protected readonly store: IDBObjectStore,
    protected readonly key: Q,
    protected readonly mk: IDBValidKey | undefined,
  ) {}

  add(data: N["value"]) {
    return wrap(this.store.add(data, this.mk))
  }

  put(data: N["value"]) {
    return wrap(this.store.put(data, this.mk))
  }

  async update(
    data: Partial<N["value"]> | ((data: N["value"]) => N["value"]),
    key?: Q extends undefined ? N["key"] : never,
  ) {
    if (this.key != null && key != null) {
      setKeyTwice()
    }

    const k = (this.key ?? key)!

    const value = await wrap(this.store.get(k))
    if (value == null) return

    if (typeof data == "function") {
      await wrap(this.store.put(data(value), k))
    } else {
      await wrap(this.store.put({ ...value, ...data }, k))
    }
  }

  async upsert(
    data: (data: N["value"] | undefined) => N["value"],
    key?: Q extends undefined ? N["key"] : never,
  ) {
    if (this.key != null && key != null) {
      setKeyTwice()
    }

    const k = (this.key ?? key)!

    const value = await wrap(this.store.get(k))
    await wrap(this.store.put(data(value), k))
  }

  count() {
    return wrap(this.store.count(this.key))
  }
}

export class StoreUnkeyed<N extends StoreTy> extends StoreBase<N> {
  constructor(store: IDBObjectStore) {
    super(store, undefined, undefined)
  }

  withKey<Q2 extends N["key"]>(key: Q2) {
    return new StoreKeyed<N, Q2>(this.store, key, this.mk)
  }

  cursor(dir?: IDBCursorDirection) {
    return new Cursor<N["key"], N["key"], N["value"]>(
      this.store,
      dir,
      undefined,
      undefined,
    )
  }

  by<K extends keyof N["indexes"] & string>(name: K) {
    return new Index<N["indexes"][K] & IDBValidKey, Id, N["value"]>(
      this.store.index(name),
      undefined,
    )
  }

  clear() {
    return wrap(this.store.clear())
  }
}

export class StoreKeyed<
  N extends StoreTy,
  Q extends N["key"],
> extends StoreBase<N, Q> {
  cursor(dir?: IDBCursorDirection) {
    return new Cursor<N["key"], N["key"], N["value"], Q>(
      this.store,
      dir,
      this.key,
      undefined,
    )
  }

  delete() {
    return wrap(this.store.delete(this.key))
  }
}

export class Index<
  K extends IDBValidKey,
  PK extends IDBValidKey,
  T,
  Q extends K | IDBKeyRange | undefined = undefined,
> {
  constructor(private readonly index: IDBIndex, private readonly key: Q) {}

  cursor(dir?: IDBCursorDirection) {
    return new Cursor<K, PK, T, Q>(this.index, dir, this.key, undefined)
  }

  withKey<Q2 extends Q extends undefined ? K | IDBKeyRange : never>(key: Q2) {
    if (this.key == null) {
      return new Index<K, PK, T, Q2>(this.index, key)
    } else {
      setKeyTwice()
    }
  }
}

export class Cursor<
  K extends IDBValidKey,
  PK extends IDBValidKey,
  T,
  Q extends K | IDBKeyRange | undefined = undefined,
> {
  constructor(
    private readonly store: IDBObjectStore | IDBIndex,
    private readonly dir: IDBCursorDirection | undefined,
    private readonly key: Q,
    private readonly f:
      | ((value: T, key: K, primary: PK) => MaybePromise<boolean>)
      | undefined,
  ) {}

  run(action: (cursor: IDBCursorWithValue) => MaybePromise<void>) {
    return new Promise<void>((resolve) => {
      const request = this.store.openCursor(this.key, this.dir)

      function run(cursor: IDBCursorWithValue) {
        const k = cursor.primaryKey
        const result = action(cursor)
        if (result instanceof Promise) {
          result.then(() => {
            if (k == cursor.primaryKey) {
              cursor.continue()
            }
          })
        } else if (k == cursor.primaryKey) {
          cursor.continue()
        }
      }

      request.onsuccess = () => {
        const cursor = request.result
        if (!cursor) {
          resolve()
          return
        }
        if (this.f) {
          const v = this.f(
            cursor.value,
            cursor.key as K,
            cursor.primaryKey as PK,
          )
          if (v instanceof Promise) {
            v.then((result) => {
              if (result) {
                run(cursor)
                return
              }
              cursor.continue()
            })
            return
          } else if (v) {
            run(cursor)
            return
          }
        } else {
          run(cursor)
          return
        }
        cursor.continue()
      }
    })
  }

  withKey<Q2 extends Q extends undefined ? K | IDBKeyRange : never>(key: Q2) {
    if (this.key == null) {
      return new Cursor<K, PK, T, Q2>(this.store, this.dir, key, this.f)
    } else {
      setKeyTwice()
    }
  }

  filter(filter: (value: T, key: K, pk: PK) => boolean) {
    const f = this.f
    if (f) {
      return new Cursor<K, PK, T, Q>(
        this.store,
        this.dir,
        this.key,
        (v, k, pk) => {
          const a = f(v, k, pk)
          if (a instanceof Promise) {
            return a.then((x) => x && filter(v, k, pk))
          }
          if (!a) {
            return false
          }

          return filter(v, k, pk)
        },
      )
    } else {
      return new Cursor<K, PK, T, Q>(this.store, this.dir, this.key, f)
    }
  }

  where<V extends keyof T>(
    key: V,
    value: T[V] extends infer U
      ?
          | (U extends IDBValidKey ? IDBKeyRange : never)
          | (U extends Primitive ? U : never)
      : never,
  ) {
    if ((value as any) instanceof IDBKeyRange) {
      return this.filter((x) => (value as IDBKeyRange).includes(x[key]))
    } else {
      return this.filter((x) => x[key] == value)
    }
  }

  each(fn: (value: T, key: K, primaryKey: PK) => void) {
    return this.run((cursor) => {
      fn(cursor.value, cursor.key as K, cursor.primaryKey as PK)
    })
  }

  update(
    data: Partial<Omit<T, "id">> | ((value: T, key: K, primaryKey: PK) => T),
  ) {
    if (typeof data == "function") {
      return this.run((cursor) => {
        cursor.update(
          data(cursor.value, cursor.key as K, cursor.primaryKey as PK),
        )
      })
    } else {
      return this.run((cursor) => {
        cursor.update({ ...cursor.value, ...data })
      })
    }
  }

  delete() {
    return this.run((cursor) => {
      cursor.delete()
    })
  }

  async getAll() {
    const output: T[] = []
    await this.run((cursor) => {
      output.push(cursor.value)
    })
    return output
  }

  async count() {
    let output = 0
    await this.run(() => {
      output++
    })
    return output
  }
}
