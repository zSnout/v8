export function Range(props: {
  class?: string
  decimalDigits?: number
  name: string

  min: number
  max: number
  step: number | "any"

  get: () => number
  getLabel?: () => string
  set: (value: number) => void
}) {
  function label() {
    const name = props.name.slice(0, 12)
    let value = props.getLabel?.() ?? props.get().toFixed(props.decimalDigits)
    value = value.slice(0, 4)

    if (value.endsWith(".")) {
      value = value.slice(0, -1)
    }

    return `--label:"${name.padStart(12)}: ${value.padEnd(4)}"`
  }

  return (
    <input
      class={"z-field w-full " + (props.class || "")}
      min={props.min}
      max={props.max}
      step={props.step}
      onInput={(event) => props.set(+event.currentTarget.value)}
      value={props.get()}
      type="range"
      style={label()}
    />
  )
}
