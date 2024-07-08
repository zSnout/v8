import { Result } from "@/components/result"
import { MaybePromise } from "valibot"
import type { Handlers } from "./worker"

export type ToWorkerMsg = {
  [K in keyof Handlers]: {
    id: number
    type: K
    data: Parameters<Handlers[K]>
  }
}[keyof Handlers]

export type ToMainMsg = {
  [K in keyof Handlers]: {
    id: number
    data: Result<ReturnType<Handlers[K]>>
  }
}[keyof Handlers]

export type WorkerMessageHandlers = {
  [x: string]: (...data: Sendable[]) => MaybePromise<Sendable>
}

export type Sendable =
  | Array<Sendable>
  | ArrayBuffer
  | boolean
  | DataView
  | Date
  | Error
  | Map<Sendable, Sendable>
  | number
  | { [x: string]: Sendable }
  | RegExp
  | Set<Sendable>
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

export type Transferrable =
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
