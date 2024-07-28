import { openDB, type DBSchema, type IDBPDatabase } from "idb"

export const MEDIA_PREFIX = "/learn/media/"

export type FolderName = "/" | `/${string}/`

export interface UserMediaTypes extends DBSchema {
  media: {
    key: string
    value: File
  }
}

export class UserMedia {
  static open() {
    return openDB<UserMediaTypes>("learn::media::User 1", 1, {
      upgrade(database) {
        database.createObjectStore("media")
      },
    })
  }

  private ready: Promise<IDBPDatabase<UserMediaTypes>>
  private db: IDBPDatabase<UserMediaTypes> | undefined

  constructor() {
    this.ready = UserMedia.open().then((x) => (this.db = x))
  }

  async get(key: string) {
    const db = this.db ?? (await this.ready)
    return await db.get("media", key)
  }

  private async put(key: string, file: File) {
    const db = this.db ?? (await this.ready)
    await db.put("media", file, key)
    return key
  }

  private async add(key: string, file: File) {
    const db = this.db ?? (await this.ready)
    await db.add("media", file, key)
    return key
  }

  upload(file: File) {
    const key =
      crypto.randomUUID().replaceAll("-", "") +
      (file.name.match(/\..+$/)?.[0] ?? "")
    return { key, done: this.add(key, file) }
  }

  async response(key: string) {
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

  async keysWithin(folder: FolderName) {
    const db = this.db ?? (await this.ready)
    if (folder == "/") {
      return db.getAllKeys("media")
    } else {
      return db.getAllKeys(
        "media",
        IDBKeyRange.bound(folder, folder.slice(0, -1) + "0", true, true),
      )
    }
  }

  async keys(folder: FolderName) {
    const keys = await this.keysWithin(folder)
    return keys.filter((key) => !key.slice(folder.length).includes("/"))
  }
}
