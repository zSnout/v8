import { Fa } from "@/components/Fa"
import { faClock, faMousePointer } from "@fortawesome/free-solid-svg-icons"
import "./mathquill.css"
import { LatexCmds, MQSymbol, mq } from "./mathquill.js"
export type * from "./mathquill"

LatexCmds.time = function () {
  return new MQSymbol(
    "\\time",
    (
      <span class="mq-icon">
        <Fa icon={faClock} title="clock" />
      </span>
    ),
    "time",
  )
}

LatexCmds.mouse = function () {
  return new MQSymbol(
    "\\mouse",
    (
      <span class="mq-icon">
        <Fa icon={faMousePointer} title="mouse pointer" />
      </span>
    ),
    "mouse",
  )
}

export { mq }
