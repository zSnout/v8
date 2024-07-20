import { For } from "solid-js"
import type { ChartBar } from "../lib/charts"

export function DrawChartBar(props: ChartBar) {
  const color = (index: number) => props.colors[index % props.colors.length]

  // The v-axis is the value-axis, and the l-axis is the label-axis.

  // TODO: these should be affected by baselineZero
  const minV = () => props.data.reduce((a, [, b]) => Math.min(a, ...b), 0)
  const maxV = () => props.data.reduce((a, [, b]) => Math.max(a, ...b), 0)

  const minL = () => -0.5
  const maxL = () => props.data.length - 0.5

  const barWidth = () => 2 / 3

  return (
    <div>
      <svg
        viewBox={`${minL()} ${minV()} ${maxL() - minL()} ${maxV() - minV()}`}
        class="aspect-video -scale-y-100 outline"
        preserveAspectRatio="none"
      >
        <For each={props.data}>
          {([label, values], labelIndex) => (
            <g>
              <For each={values}>
                {(value, valueIndex) => (
                  <rect
                    x={labelIndex() - barWidth() / values.length / 2}
                    y={0}
                    width={barWidth() / values.length}
                    height={value}
                    fill={color(valueIndex())}
                    rx={1 / 2}
                  />
                )}
              </For>
            </g>
          )}
        </For>
      </svg>
    </div>
  )
}
