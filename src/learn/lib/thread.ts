import { Result } from "@/components/result"
import { ToMainMsg } from "../message"
import { Handlers } from "../worker"
import create from "../worker/index?worker"

export class Worker {
  private readonly worker = new create()
  private readonly resolvers = new Map<number, (data: any) => void>()

  constructor() {
    this.worker.addEventListener("message", (event) => {
      const msg = event.data as ToMainMsg
      const resolver = this.resolvers.get(msg.id)
      if (!resolver) {
        return
      }
      this.resolvers.delete(msg.id)
      resolver(msg.data)
    })
  }

  async send<K extends keyof Handlers>(
    type: K,
    ...data: Parameters<Handlers[K]>
  ): Promise<Result<ReturnType<Handlers[K]>>> {
    return new Promise((resolve) => {
      const id = Math.random()
      this.worker.postMessage({ id, type, data })
      this.resolvers.set(id, resolve)
    })
  }
}
