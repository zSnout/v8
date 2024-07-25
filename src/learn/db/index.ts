import { randomId } from "../lib/id"
import type {
  Handlers,
  WorkerNotification,
  WorkerRequest,
  WorkerResponse,
} from "../shared"
import {
  ZDB_REFRESH_INTERFACES,
  ZDB_REFRESH_UNDOREDO,
  ZDB_REJECT,
  ZDB_RESOLVE,
} from "../shared"
import ActualWorker from "../worker?worker&url"

export class Worker {
  private readonly worker: Omit<globalThis.Worker, "postMessage"> & {
    postMessage(message: WorkerRequest): void
  }
  private readonly handlers = new Map<
    number,
    [(data: any) => void, (reason: any) => void]
  >()
  private target = new EventTarget()
  readonly ready
  private isReady = false

  constructor() {
    this.worker = new globalThis.Worker(ActualWorker, { type: "module" })
    this.ready = new Promise<this>((resolve, reject) => {
      this.worker.addEventListener("message", ({ data }: { data: unknown }) => {
        if (typeof data != "object" || data == null || !("zid" in data)) {
          return
        }

        const res = data as unknown as WorkerResponse | WorkerNotification

        if (res.zid == ZDB_RESOLVE) {
          this.isReady = true
          resolve(this)
          return
        } else if (res.zid == ZDB_REJECT) {
          reject(res.reason)
          return
        } else if (res.zid == ZDB_REFRESH_UNDOREDO) {
          this.target.dispatchEvent(
            new CustomEvent("refresh-undoredo", { detail: res }),
          )
          return
        } else if (res.zid == ZDB_REFRESH_INTERFACES) {
          this.target.dispatchEvent(
            new CustomEvent("refresh-interfaces", { detail: res }),
          )
          return
        }

        const handler = this.handlers.get(res.zid)
        if (!handler) {
          return
        }
        this.handlers.delete(res.zid)

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
  }

  private postNow<K extends keyof Handlers>(
    type: K,
    ...data: Parameters<Handlers[K]>
  ): Promise<ReturnType<Handlers[K]>> {
    return new Promise<ReturnType<Handlers[K]>>((resolve, reject) => {
      const id = randomId()
      const req: WorkerRequest = {
        zid: id,
        type: type as any,
        data: data as any,
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
