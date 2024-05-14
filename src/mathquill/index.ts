import { isServer } from "solid-js/web"
import type { V3 } from "./mathquill"
import "./mathquill.css"
export type * from "./mathquill"

export const mq = await (async () => {
  if (isServer) {
    return undefined
  } else {
    // @ts-ignore
    await import("@/mathquill/mathquill.min.js")
    // @ts-ignore
    const mq = MathQuill.noConflict()
    return mq.getInterface(3) as V3.API
  }
})()
