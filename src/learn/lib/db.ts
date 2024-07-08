export class DBDatabase {
  constructor(readonly db: IDBDatabase) {}

  transaction(
    storeNames: string | readonly string[],
    mode?: IDBTransactionMode,
    options?: IDBTransactionOptions,
  ): DBTransaction {
    return new DBTransaction(this.db.transaction(storeNames, mode, options))
  }

  get name() {
    return this.db.name
  }

  get objectStoreNames() {
    return this.db.objectStoreNames
  }

  get version() {
    return this.db.version
  }

  close() {
    this.db.close()
  }

  createObjectStore(name: string, options?: IDBObjectStoreParameters) {
    return new DBObjectStore(this.db.createObjectStore(name, options))
  }

  deleteObjectStore(name: string) {
    this.db.deleteObjectStore(name)
  }
}

export class DBOpenRequest extends Promise<DBDatabase> {
  constructor(
    name: string,
    version: number,
    handlers?: {
      onupgradeneeded?: (db: DBDatabase, oldVersion: number) => void
      onblocked?: (db: DBDatabase) => void
      onversionchange?: (db: DBDatabase) => void
    },
  ) {
    const req = indexedDB.open(name, version)

    if (handlers?.onupgradeneeded) {
      const h = handlers.onupgradeneeded
      req.onupgradeneeded = ({ oldVersion }) =>
        h(new DBDatabase(req.result), oldVersion)
    }

    if (handlers?.onblocked) {
      const h = handlers.onblocked
      req.onblocked = () => h(new DBDatabase(req.result))
    }

    const vc = handlers?.onversionchange

    super((resolve, reject) => {
      req.onsuccess = () => {
        const db = new DBDatabase(req.result)
        if (vc) {
          db.db.addEventListener("versionchange", () => vc(db))
        }
        resolve(db)
      }
      req.onerror = () => reject(req.error)
    })
  }
}

export class DBTransaction extends Promise<void> {
  constructor(readonly tx: IDBTransaction) {
    super((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  }

  abort() {
    this.tx.abort()
  }

  commit() {
    this.tx.commit()
    this.tx.objectStore
  }

  get db() {
    return this.tx.db
  }

  get durability() {
    return this.tx.durability
  }

  get mode() {
    return this.tx.mode
  }

  objectStore(name: string) {
    return new DBObjectStore(this.tx.objectStore(name))
  }

  get objectStoreNames() {
    return this.tx.objectStoreNames
  }
}

export class DBObjectStore {
  constructor(readonly store: IDBObjectStore) {}

  get keyPath() {
    return this.store.keyPath
  }

  get name() {
    return this.store.name
  }

  set name(name) {
    this.store.name = name
  }

  get autoIncrement() {
    return this.store.autoIncrement
  }

  get indexNames() {
    return this.store.indexNames
  }

  get transaction() {
    return this.store.transaction
  }

  add(value: any, key?: IDBValidKey) {
    return new DBRequest(this.store.add(value, key))
  }

  clear() {
    return new DBRequest(this.store.clear())
  }

  count(query?: IDBValidKey | IDBKeyRange) {
    return new DBRequest(this.store.count(query))
  }

  createIndex(
    name: string,
    keyPath: string | string[],
    options?: IDBIndexParameters,
  ) {
    return new DBIndex(this.store.createIndex(name, keyPath, options))
  }

  delete(query: IDBValidKey | IDBKeyRange) {
    return new DBRequest(this.store.delete(query))
  }

  deleteIndex(name: string) {
    this.store.deleteIndex(name)
  }

  get(query: IDBValidKey | IDBKeyRange) {
    return new DBRequest(this.store.get(query))
  }

  getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number) {
    return new DBRequest(this.store.getAll(query, count))
  }

  getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number) {
    return new DBRequest(this.store.getAllKeys(query, count))
  }

  getKey(query: IDBValidKey | IDBKeyRange) {
    return new DBRequest(this.store.getKey(query))
  }

  index(name: string) {
    return new DBIndex(this.store.index(name))
  }

  openCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
  ) {
    return new DBRequest(this.store.openCursor(query, direction))
  }

  openKeyCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
  ) {
    return new DBRequest(this.store.openKeyCursor(query, direction))
  }

  put(value: any, key?: IDBValidKey) {
    return new DBRequest(this.store.put(value, key))
  }
}

export class DBIndex {
  constructor(readonly index: IDBIndex) {}

  get keyPath(): string | string[] {
    return this.index.keyPath
  }

  get multiEntry(): boolean {
    return this.index.multiEntry
  }

  get name(): string {
    return this.index.name
  }

  set name(name) {
    this.index.name = name
  }

  get objectStore(): IDBObjectStore {
    return this.index.objectStore
  }

  get unique(): boolean {
    return this.index.unique
  }

  count(query?: IDBValidKey | IDBKeyRange) {
    return new DBRequest(this.index.count(query))
  }

  get(query: IDBValidKey | IDBKeyRange) {
    return new DBRequest(this.index.get(query))
  }

  getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number) {
    return new DBRequest(this.index.getAll(query, count))
  }

  getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number) {
    return new DBRequest(this.index.getAllKeys(query, count))
  }

  getKey(query: IDBValidKey | IDBKeyRange) {
    return new DBRequest(this.index.getKey(query))
  }

  async openCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
  ) {
    const request = await new DBRequest(this.index.openCursor(query, direction))
    if (request) {
      return new DBCursorWithValue(request)
    } else {
      return null
    }
  }

  async openKeyCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
  ) {
    const request = await new DBRequest(
      this.index.openKeyCursor(query, direction),
    )
    if (request) {
      return new DBCursor(request)
    } else {
      return null
    }
  }
}

export class DBCursor<T extends IDBCursor> {
  constructor(readonly cursor: T) {}

  get direction() {
    return this.cursor.direction
  }

  get key() {
    return this.cursor.key
  }

  get primaryKey() {
    return this.cursor.primaryKey
  }

  get request() {
    return this.cursor.request
  }

  get source() {
    return this.cursor.source
  }

  advance(count: number) {
    this.cursor.advance(count)
  }

  continue(key?: IDBValidKey) {
    this.cursor.continue(key)
  }

  continuePrimaryKey(key: IDBValidKey, primaryKey: IDBValidKey) {
    this.cursor.continuePrimaryKey(key, primaryKey)
  }

  delete() {
    return new DBRequest(this.cursor.delete())
  }

  update(value: any) {
    return new DBRequest(this.cursor.update(value))
  }
}

export class DBCursorWithValue extends DBCursor<IDBCursorWithValue> {
  constructor(cursor: IDBCursorWithValue) {
    super(cursor)
  }

  get value() {
    return this.cursor.value
  }
}

export class DBRequest<T> extends Promise<T> {
  constructor(readonly req: IDBRequest<T>) {
    super((resolve, reject) => {
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  get source() {
    return this.req.source
  }

  get transaction() {
    return this.req.transaction
  }
}

const db = await new DBOpenRequest("Main:world", 2, {
  onblocked(db) {
    const objectStore = db.createObjectStore("customers", { keyPath: "ssn" })
    objectStore.createIndex("name", "name", { unique: false })
    objectStore.createIndex("email", "email", { unique: true })
  },
})

const tx = db.transaction("customers")
const store = tx.objectStore("customers")
for (const c of [
  { name: "hi", email: "a", ssn: 23 },
  { name: "nope", email: "world", ssn: 4454 },
]) {
  store.add(c)
}
await tx
