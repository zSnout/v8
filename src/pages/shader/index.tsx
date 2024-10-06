// TODO: add index.astro

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
      <div class="h-full overflow-y-auto border-r border-z px-3 pb-4 pt-12">
        <div class="bg-red-500">hi</div>
      </div>
      <div class="bg-purple-100"></div>
    </div>
  )
}
