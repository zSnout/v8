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
