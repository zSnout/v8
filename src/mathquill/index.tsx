import "./mathquill.css"
import { LatexCmds, MQSymbol, mq } from "./mathquill.js"
export type * from "./mathquill"

LatexCmds.time = function () {
  return new MQSymbol(
    "\\operatorname{time}",
    (<span class="mq-time">time</span>) as HTMLElement,
    "time",
  )
}

LatexCmds.mouse = function () {
  return new MQSymbol(
    "\\operatorname{mouse}",
    (<span class="mq-mouse">mouse</span>) as HTMLElement,
    "mouse",
  )
}

export { mq }
// const mq = MathQuill.getInterface(3) as V3.API
