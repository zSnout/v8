import type { MaybePromise } from "valibot"
import type { Cloneable } from "../../message"
import type * as messages from "./messages"

import "./db"

export type Handler = (this: unknown, data: Cloneable) => HandlerReturn

export type HandlerReturn = MaybePromise<Cloneable>

export type BaseHandlers = { [x: string]: Handler }

export type Handlers = typeof messages

export type ToWorker = {
  [K in keyof Handlers]: {
    zTag: 0
    id: number
    type: K
    data: Parameters<Handlers[K]>
  }
}[keyof Handlers]

export type ToScript = {
  [K in keyof Handlers]:
    | { zTag: 0; id: number; ok: true; value: Awaited<ReturnType<Handlers[K]>> }
    | { zTag: 0; id: number; ok: false; value: string }
}[keyof Handlers]
