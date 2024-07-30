import { openDB, type DBSchema, type IDBPDatabase } from "idb"

export const MEDIA_PREFIX = "/learn/media/"

export interface UserMediaTypes extends DBSchema {
  media: {
    key: ArrayBuffer
    value: File
  }
}

export function parseKey(key: string) {
  const numeric = key.slice(0, 16)
  if (!/^[0-9a-fA-F]{16}$/.test(numeric)) {
    return null
  }
  const view = new DataView(new ArrayBuffer(8))
  const value = BigInt("0x" + numeric)
  view.setBigUint64(0, value)
  return view.buffer
}

export function writeKey(key: ArrayBuffer) {
  if (key.byteLength != 8) {
    throw new TypeError("User media keys must be 64 bits long.")
  }
  const array = new DataView(key)
  return array.getBigUint64(0).toString(16).padStart(16, "0")
}

export function createKey() {
  const key = new ArrayBuffer(8)
  crypto.getRandomValues(new Uint32Array(key))
  return key
}

let media: UserMedia | undefined

export class UserMedia {
  static open() {
    return openDB<UserMediaTypes>("learn::media::User 1", 1, {
      upgrade(database) {
        database.createObjectStore("media")
      },
    })
  }

  private ready!: Promise<IDBPDatabase<UserMediaTypes>>
  private db!: IDBPDatabase<UserMediaTypes> | undefined

  constructor() {
    if (media) {
      return media
    } else {
      media = this
    }
    this.ready = UserMedia.open().then((x) => (this.db = x))
  }

  async get(key: ArrayBuffer) {
    const db = this.db ?? (await this.ready)
    return await db.get("media", key)
  }

  async getEach(keys: ArrayBuffer[]) {
    const db = this.db ?? (await this.ready)
    const tx = db.transaction("media")
    const { store } = tx
    const [files] = await Promise.all([
      Promise.all(
        keys.map(async (key) => ({ key, file: await store.get(key) })),
      ),
      tx.done,
    ])
    return files
  }

  async deleteEach(keys: ArrayBuffer[]) {
    const db = this.db ?? (await this.ready)
    const tx = db.transaction("media", "readwrite")
    const store = tx.objectStore("media")
    for (const key of keys) {
      store.delete(key)
    }
    await tx.done
  }

  private async put(key: ArrayBuffer, file: File) {
    const db = this.db ?? (await this.ready)
    await db.put("media", file, key)
    return key
  }

  private async add(key: ArrayBuffer, file: File) {
    const db = this.db ?? (await this.ready)
    await db.add("media", file, key)
    return key
  }

  upload(file: File) {
    const key = createKey()
    return { key, done: this.add(key, file) }
  }

  async response(key: ArrayBuffer) {
    const file = await this.get(key)
    if (file) {
      return new Response(file, {
        status: 200,
        statusText: "OK",
        headers: {
          "Content-Type": file.type,
          "Content-Length": "" + file.size,
        },
      })
    } else {
      return new Response(
        "The given piece of media was not found. Maybe it was deleted?",
        { status: 404, statusText: "Not Found" },
      )
    }
  }

  async keys() {
    const db = this.db ?? (await this.ready)
    return db.getAllKeys("media")
  }
}
