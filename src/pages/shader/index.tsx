// TODO: add index.astro

import { IntegratedCodeField } from "@/learn/el/IntegratedField"

interface FieldBase {
  readonly id: string
}

interface FieldSlider extends FieldBase {
  readonly type: "slider"
  readonly min: number
  readonly max: number
  readonly scale: "normal" | "log" | "reciprocal"
  readonly display: "integer" | "decimal" | "percent" | "degrees"
}

interface FieldMath extends FieldBase {
  readonly type: "math"
  readonly label: string
}

interface FieldChoose extends FieldBase {
  readonly type: "choose"
  readonly options: readonly Option[]
}

interface Option {
  readonly label: string
  readonly value: number
}

export function Main() {
  return (
    <div class="grid h-full w-full grid-cols-[24rem,auto]">
      <div class="relative h-full overflow-y-auto border-r border-z pb-4 pt-12">
        <textarea class="z-field min-h-96 w-full resize-y rounded-none border-transparent bg-z-body-selected px-2 py-1 font-mono text-sm shadow-none"></textarea>
      </div>
      <div class="bg-purple-100"></div>
    </div>
  )
}
