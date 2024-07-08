import { ToWorkerMsg, WorkerMessageHandlers } from "../message"

addEventListener("message", async (event) => {
  const msg = event.data as ToWorkerMsg
  const data = await handlers[msg.type](...msg.data)
  postMessage({ id: msg.id, data: data })
})

const handlers = {
  async "list-decks"() {
    return { a: 4 }
  },
} satisfies WorkerMessageHandlers

export type Handlers = typeof handlers
