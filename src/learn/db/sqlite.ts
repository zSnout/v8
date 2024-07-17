import { initBackend } from "absurd-sql/dist/indexeddb-main-thread"
import { randomId } from "../lib/id"
import type { Handlers, ToScript, ToWorker } from "./worker"
import Worker from "./worker/index?worker"

export class SQL {
  private worker
  private handlers = new Map<
    number,
    [(data: any) => void, (reason: any) => void]
  >()
  private ready
  private isReady = false

  constructor() {
    console.log("creating worker")
    this.worker = new Worker()
    console.log("created worker")
    this.ready = new Promise<void>((resolve, reject) => {
      this.worker.addEventListener("message", ({ data }: { data: unknown }) => {
        if (data == "zdb:resolve") {
          console.info("The worker has started successfully.")
          this.isReady = true
          resolve()
          return
        }

        if (data == "zdb:reject") {
          console.error("The worker has failed successfully.")
          reject("The database failed to start.")
          return
        }

        if (typeof data != "object" || data == null || !("zTag" in data)) {
          return
        }

        const res = data as unknown as ToScript
        const handler = this.handlers.get(res.id)
        if (!handler) {
          return
        }
        this.handlers.delete(res.id)

        if (res.ok) {
          handler[0](res.value)
        } else {
          handler[1](res.value)
        }
      })
    })
    initBackend(this.worker)
  }

  async waitUntilReady() {
    await this.ready
    return this
  }

  private postNow<K extends keyof Handlers>(
    type: K,
    ...data: Parameters<Handlers[K]>
  ): Promise<ReturnType<Handlers[K]>> {
    return new Promise((resolve, reject) => {
      const id = randomId()
      const req: ToWorker = {
        zTag: 0,
        id,
        type,
        data,
      }
      this.handlers.set(id, [resolve, reject])
      this.worker.postMessage(req)
    })
  }

  async post<K extends keyof Handlers>(
    type: K,
    ...data: Parameters<Handlers[K]>
  ): Promise<ReturnType<Handlers[K]>> {
    if (!this.isReady) {
      await this.ready
    }
    return await this.postNow(type, ...data)
  }
}
