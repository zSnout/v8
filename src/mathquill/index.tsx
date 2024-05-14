import { Fa } from "@/components/Fa"
import { faClock, faMousePointer } from "@fortawesome/free-solid-svg-icons"
import "./mathquill.css"
import { LatexCmds, MQSymbol, mq } from "./mathquill.js"
export type * from "./mathquill"

LatexCmds.time = function () {
  return new MQSymbol(
    "\\operatorname{time}",
    (
      <span class="relative top-[0.0625em] mx-[0.1em] -mt-[0.0625em] inline-flex h-[1.25em] w-[1.25em] items-center justify-center rounded border-2 border-blue-500 bg-blue-50 dark:bg-blue-950 [.mq-selection_&]:bg-blue-500">
        <Fa
          class="relative h-[0.75em] w-[0.75em] fill-blue-500 [.mq-selection_&]:fill-blue-50"
          icon={faClock}
          title="clock"
        />
      </span>
    ),
    "time",
  )
}

LatexCmds.mouse = function () {
  return new MQSymbol(
    "m",
    (
      <span class="relative top-[0.0625em] mx-[0.1em] -mt-[0.0625em] inline-flex h-[1.25em] w-[1.25em] items-center justify-center rounded border-2 border-blue-500 bg-blue-50 dark:bg-blue-950 [.mq-selection_&]:bg-blue-500">
        <Fa
          class="relative left-[0.025em] h-[0.75em] w-[0.75em] fill-blue-500 [.mq-selection_&]:fill-blue-50"
          icon={faMousePointer}
          title="mouse pointer"
        />

        <div class="absolute bottom-0 translate-y-1/2 rounded-[0.25em] border border-blue-500 bg-z-body px-[0.1em] text-[50%]/3">
          m
        </div>
      </span>
    ),
    "mouse",
  )
}

export { mq }
