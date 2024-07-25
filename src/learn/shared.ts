import type { Awaitable } from "./el/Layers"
import type * as messages from "./worker/messages"

export type Handler = (this: void, ...data: any) => HandlerReturn

export type HandlerReturn = Awaitable<Cloneable>

export type Handlers = typeof messages

export type WorkerRequest = {
  [K in keyof Handlers]: { zid: number; type: K; data: Parameters<Handlers[K]> }
}[keyof Handlers]

export type WorkerResponse = {
  [K in keyof Handlers]:
    | { zid: number; ok: true; value: Awaited<ReturnType<Handlers[K]>> }
    | { zid: number; ok: false; value: string }
}[keyof Handlers]

export type WorkerNotification =
  | { zid: typeof ZDB_RESOLVE }
  | { zid: typeof ZDB_REJECT; reason: unknown }
  | { zid: typeof ZDB_UNDO_STACK_CHANGED; canUndo: boolean; canRedo: boolean }
  | { zid: typeof ZDB_UNDO_HAPPENED }

/** Indicates the worker is ready. */
export const ZDB_RESOLVE = "zdb:resolve"

/** Indicates the worker failed to start up. */
export const ZDB_REJECT = "zdb:reject"

/** Indicates the undo/redo buttons should be updated. */
export const ZDB_UNDO_STACK_CHANGED = "zdb:undo-stack-changed"

/** Indicates the user interface should be updated. */
export const ZDB_UNDO_HAPPENED = "zdb:undo-happened"

export type Cloneable =
  | Array<Cloneable>
  | ArrayBuffer
  | boolean
  | DataView
  | Date
  | Error
  | Map<Cloneable, Cloneable>
  | number
  | { [x: string]: Cloneable }
  | RegExp
  | Set<Cloneable>
  | string
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | BigUint64Array
  | BigInt64Array
  | Float64Array
  // | AudioData
  | Blob
  // | CropTarget
  | CryptoKey
  | DOMException
  | DOMMatrix
  | DOMMatrixReadOnly
  | DOMQuad
  | DOMRect
  | DOMRectReadOnly
  | File
  | FileList
  | FileSystemDirectoryHandle
  | FileSystemFileHandle
  // | GPUCompilationInfo
  // | GPUCompilationMessage
  | ImageBitmap
  | ImageData
  | RTCCertificate
  | VideoFrame
  | null
  | undefined
  | void

export type Transferable =
  | ArrayBuffer
  | MessagePort
  | ReadableStream
  | WritableStream
  | TransformStream
  // | WebTransportReceiveStream
  // | WebTransportSendStream
  // | AudioData
  | ImageBitmap
  | VideoFrame
  | OffscreenCanvas
  | RTCDataChannel
