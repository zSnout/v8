import { initBackend } from "absurd-sql/dist/indexeddb-main-thread"
import { randomId } from "../lib/id"
import type { Handlers, ToScript, ToWorker } from "./worker"
import Worker from "./worker/index?worker"

export class SQL {
  private readonly worker
  private readonly handlers = new Map<
    number,
    [(data: any) => void, (reason: any) => void]
  >()
  readonly ready
  private isReady = false

  constructor() {
    this.worker = new Worker()
    this.ready = new Promise<this>((resolve, reject) => {
      this.worker.addEventListener("message", ({ data }: { data: unknown }) => {
        if (data == "zdb:resolve") {
          console.info("The worker has started successfully.")
          this.isReady = true
          resolve(this)
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

      this.worker.addEventListener("error", (event) => {
        console.error("The database failed to load.")
        reject(event.error)
      })
    })
    initBackend(this.worker)
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
